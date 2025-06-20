import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        // Verificar permissão do usuário
        const userResponse = await fetch(`${baseUrl}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userResponse.ok) {
            return NextResponse.json({ error: 'Erro ao verificar permissões' }, { status: 401 });
        }

        const user = await userResponse.json();
        if (!['ADMIN', 'MANAGER', 'SUPPORT'].includes(user.role)) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        const response = await fetch(`${baseUrl}/alerts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar alertas');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar alertas' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        // Verificar permissão do usuário
        const userResponse = await fetch(`${baseUrl}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userResponse.ok) {
            return NextResponse.json({ error: 'Erro ao verificar permissões' }, { status: 401 });
        }

        const user = await userResponse.json();
        if (!['ADMIN', 'MANAGER', 'SUPPORT'].includes(user.role)) {
            return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
        }

        const response = await fetch(`${baseUrl}/alerts/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir alerta');
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao excluir alerta' }, { status: 500 });
    }
} 
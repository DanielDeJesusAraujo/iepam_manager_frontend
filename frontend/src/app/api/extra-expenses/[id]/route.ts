import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][extra-expenses][GET] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        const response = await fetch(`${baseUrl}/extra-expenses/${params.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('[API][extra-expenses][GET] Erro ao buscar gasto extra');
            throw new Error('Erro ao buscar gasto extra');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) { 
        console.error('[API][extra-expenses][GET] Erro:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][extra-expenses][PUT] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        const body = await request.json();

        if (!token) {
            console.warn('[API][extra-expenses][PUT] Token não fornecido');
            return NextResponse.json(
                { message: 'Token não fornecido' },
                { status: 401 }
            );
        }

        const response = await fetch(`${baseUrl}/extra-expenses/${params.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[API][extra-expenses][PUT] Erro ao atualizar gasto extra');
            throw new Error(data.message || 'Erro ao atualizar gasto extra');
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][extra-expenses][PUT] Erro:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar gasto extra' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][extra-expenses][DELETE] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            console.warn('[API][extra-expenses][DELETE] Token não fornecido');
            return NextResponse.json(
                { message: 'Token não fornecido' },
                { status: 401 }
            );
        }

        const response = await fetch(`${baseUrl}/extra-expenses/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[API][extra-expenses][DELETE] Erro ao excluir gasto extra');
            throw new Error(data.message || 'Erro ao excluir gasto extra');
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][extra-expenses][DELETE] Erro:', error);
        return NextResponse.json(
            { error: 'Erro ao excluir gasto extra' },
            { status: 500 }
        );
    }
} 
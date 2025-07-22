import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log('[API][supplies][GET] Iniciando request');
        const token = request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            console.error('[API][supplies][GET] Token não fornecido');
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const response = await fetch(`${baseUrl}/supplies/${params.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error('[API][supplies][GET] Erro ao buscar detalhes do suprimento');
            throw new Error('Erro ao buscar detalhes do suprimento');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][supplies][GET] Erro ao buscar detalhes do suprimento:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar detalhes do suprimento' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log('[API][supplies][PUT] Iniciando request');
        const token = request.headers.get('authorization');
        if (!token) {
            console.error('[API][supplies][PUT] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${baseUrl}/supplies/${params.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[API][supplies][PUT] Erro ao atualizar suprimento');
            throw new Error(errorData.error || 'Erro ao atualizar suprimento');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][supplies][PUT] Erro ao atualizar suprimento:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao atualizar suprimento' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log('[API][supplies][DELETE] Iniciando request');
        const token = request.headers.get('authorization');
        if (!token) {
            console.error('[API][supplies][DELETE] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const response = await fetch(`${baseUrl}/supplies/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('[API][supplies][DELETE] Erro ao excluir suprimento');
            throw new Error('Erro ao excluir suprimento');
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[API][supplies][DELETE] Erro ao excluir suprimento:', error);
        return NextResponse.json(
            { error: 'Erro ao excluir suprimento' },
            { status: 500 }
        );
    }
} 
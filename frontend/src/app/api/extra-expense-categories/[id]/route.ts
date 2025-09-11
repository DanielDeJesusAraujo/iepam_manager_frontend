import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][extra-expense-categories][PUT] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        const body = await request.json();

        if (!token) {
            console.warn('[API][extra-expense-categories][PUT] Token não fornecido');
            return NextResponse.json(
                { message: 'Token não fornecido' },
                { status: 401 }
            );
        }

        const response = await fetch(`${baseUrl}/extra-expense-categories/${params.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][extra-expense-categories][PUT] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error('[API][extra-expense-categories][PUT] Erro ao atualizar categoria de gastos extras');
            throw new Error('Erro ao atualizar categoria de gastos extras');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][extra-expense-categories][PUT] Erro:', error);
        return NextResponse.json(
            { message: 'Erro ao atualizar categoria de gastos extras' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][extra-expense-categories][DELETE] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            console.warn('[API][extra-expense-categories][DELETE] Token não fornecido');
            return NextResponse.json(
                { message: 'Token não fornecido' },
                { status: 401 }
            );
        }

        const response = await fetch(`${baseUrl}/extra-expense-categories/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][extra-expense-categories][DELETE] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error('[API][extra-expense-categories][DELETE] Erro ao excluir categoria de gastos extras');
            throw new Error('Erro ao excluir categoria de gastos extras');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][extra-expense-categories][DELETE] Erro:', error);
        return NextResponse.json(
            { message: 'Erro ao excluir categoria de gastos extras' },
            { status: 500 }
        );
    }
} 
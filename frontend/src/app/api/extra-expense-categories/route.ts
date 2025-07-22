import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: Request) {
    console.log('[API][extra-expense-categories][GET] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        const response = await fetch(`${baseUrl}/extra-expense-categories`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('[API][extra-expense-categories][GET] Erro ao buscar categorias de gastos extras');
            throw new Error('Erro ao buscar categorias de gastos extras');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][extra-expense-categories][GET] Erro:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar categorias de gastos extras' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    console.log('[API][extra-expense-categories][POST] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            console.warn('[API][extra-expense-categories][POST] Token não fornecido');
            return new NextResponse('Não autorizado', { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${baseUrl}/extra-expense-categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[API][extra-expense-categories][POST] Erro ao criar categoria de gastos extras');
            throw new Error(data.message || 'Erro ao criar categoria de gastos extras');
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][extra-expense-categories][POST] Erro:', error);
        return new NextResponse('Erro interno do servidor', { status: 500 });
    }
} 
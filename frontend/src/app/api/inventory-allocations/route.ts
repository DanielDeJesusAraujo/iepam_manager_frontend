import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import baseUrl from '@/utils/enviroments';

export async function GET(request: Request) {
    console.log('[API][inventory-allocations][GET] Iniciando request');
    try {
        const headersList = headers();
        const token = headersList.get('authorization')?.split(' ')[1];

        if (!token) {
            console.warn('[API][inventory-allocations][GET] Token não fornecido');
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const response = await fetch(`${baseUrl}/inventory-allocations`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][inventory-allocations][GET] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error('[API][inventory-allocations][GET] Erro ao buscar alocações');
            throw new Error('Erro ao buscar alocações');
        }

        const data = await response.json();
        console.log('[API][inventory-allocations][GET] Alocações encontradas com sucesso');
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][inventory-allocations][GET] Erro:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    console.log('[API][inventory-allocations][POST] Iniciando request');
    try {
        const headersList = headers();
        const token = headersList.get('authorization')?.split(' ')[1];

        if (!token) {
            console.warn('[API][inventory-allocations][POST] Token não fornecido');
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${baseUrl}/inventory-allocations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][inventory-allocations][POST] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error('[API][inventory-allocations][POST] Erro ao criar alocação');
            throw new Error('Erro ao criar alocação');
        }

        const data = await response.json();
        console.log('[API][inventory-allocations][POST] Alocação criada com sucesso');
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][inventory-allocations][POST] Erro:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 
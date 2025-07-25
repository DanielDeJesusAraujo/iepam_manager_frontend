import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: Request) {
    console.log('[API][categories][GET] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        const response = await fetch(`${baseUrl}/categories`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][categories][GET] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error('[API][categories][GET] Erro ao buscar categorias');
            throw new Error('Erro ao buscar categorias');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][categories][GET] Erro:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar categorias' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    console.log('[API][categories][POST] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            console.warn('[API][categories][POST] Token não fornecido');
            return new NextResponse('Não autorizado', { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${baseUrl}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][categories][POST] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        const data = await response.json();

        if (!response.ok) {
            console.error('[API][categories][POST] Erro ao criar categoria');
            throw new Error(data.message || 'Erro ao criar categoria');
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][categories][POST] Erro:', error);
        return new NextResponse('Erro interno do servidor', { status: 500 });
    }
} 
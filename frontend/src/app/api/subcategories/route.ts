import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: Request) {
    try {
        console.log('[API][subcategories][GET] Iniciando request');
        const token = request.headers.get('authorization')?.split(' ')[1];
        const response = await fetch(`${baseUrl}/subcategories`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][subcategories][GET] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error('[API][subcategories][GET] Erro ao buscar subcategorias');
            throw new Error('Erro ao buscar subcategorias');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][subcategories][GET] Erro ao buscar subcategorias:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar subcategorias' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('[API][subcategories][POST] Iniciando request');
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            console.error('[API][subcategories][POST] Token não fornecido');
            return new NextResponse('Não autorizado', { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${baseUrl}/subcategories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][subcategories][POST] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        const data = await response.json();

        if (!response.ok) {
            console.error('[API][subcategories][POST] Erro ao criar subcategoria');
            throw new Error(data.message || 'Erro ao criar subcategoria');
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][subcategories][POST] Erro ao criar subcategoria:', error);
        return new NextResponse('Erro interno do servidor', { status: 500 });
    }
} 
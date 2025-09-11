import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    console.log('[API][supply-requests][custom][POST] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            console.warn('[API][supply-requests][custom][POST] Token não fornecido');
            return NextResponse.json(
                { message: 'Token não fornecido' },
                { status: 401 }
            );
        }

        const body = await request.json();

        const response = await fetch(`${baseUrl}/custom-supply-requests`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][supply-requests][custom][POST] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        const data = await response.json();

        if (!response.ok) {
            console.error('[API][supply-requests][custom][POST] Erro ao criar requisição customizada');
            return NextResponse.json(
                { message: data.message || 'Erro ao criar requisição customizada' },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('[API][supply-requests][custom][POST] Erro:', error);
        return NextResponse.json(
            { message: 'Erro ao criar requisição customizada' },
            { status: 500 }
        );
    }
} 
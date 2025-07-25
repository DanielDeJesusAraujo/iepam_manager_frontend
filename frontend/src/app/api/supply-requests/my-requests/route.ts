import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    console.log('[API][supply-requests][my-requests][GET] Iniciando request');
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        console.error('[API][supply-requests][my-requests][GET] Token não fornecido');
        return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    try {
        const response = await fetch(`${baseUrl}/supply-requests/my-requests`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][supply-requests][my-requests][GET] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        const data = await response.json();

        if (!response.ok) {
            console.error('[API][supply-requests][my-requests][GET] Erro ao buscar requisições');
            throw new Error(data.message || 'Erro ao buscar requisições');
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API][supply-requests][my-requests][GET] Erro ao buscar requisições:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 
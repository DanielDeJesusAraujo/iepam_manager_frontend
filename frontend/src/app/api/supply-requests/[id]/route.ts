import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][supply-requests][PUT] Iniciando request');
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        console.error('[API][supply-requests][PUT] Token não fornecido');
        return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    try {
        const body = await request.json();

        const response = await fetch(`${baseUrl}/supply-requests/${params.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][supply-requests][PUT] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        const data = await response.json();

        if (!response.ok) {
            console.error('[API][supply-requests][PUT] Erro ao atualizar requisição');
            throw new Error(data.message || 'Erro ao atualizar requisição');
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API][supply-requests][PUT] Erro ao atualizar requisição:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 
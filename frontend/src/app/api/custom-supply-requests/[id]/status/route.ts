import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    console.log('[API][custom-supply-requests][PATCH] Iniciando request');
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        const { status } = await request.json();

        if (!token) {
            console.warn('[API][custom-supply-requests][PATCH] Token não fornecido');
            return NextResponse.json(
                { message: 'Não autorizado' },
                { status: 401 }
            );
        }

        const response = await fetch(`${baseUrl}/custom-supply-requests/${params.id}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][custom-supply-requests][PATCH] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[API][custom-supply-requests][PATCH] Erro ao atualizar status da requisição');
            return NextResponse.json(
                { message: errorData.message || 'Erro ao atualizar status da requisição' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][custom-supply-requests][PATCH] Erro:', error);
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 
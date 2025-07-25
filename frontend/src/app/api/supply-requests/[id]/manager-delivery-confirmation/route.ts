import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][supply-requests][manager-delivery-confirmation][PATCH] Iniciando request');
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        console.error('[API][supply-requests][manager-delivery-confirmation][PATCH] Token não fornecido');
        return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { confirmation } = body;

        if (typeof confirmation !== 'boolean') {
            console.error('[API][supply-requests][manager-delivery-confirmation][PATCH] Confirmação inválida');
            return NextResponse.json(
                { error: 'Confirmação inválida' },
                { status: 400 }
            );
        }

        const response = await fetch(`${baseUrl}/supply-requests/${params.id}/manager-delivery-confirmation`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ confirmation }),
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][supply-requests][manager-delivery-confirmation][PATCH] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        const data = await response.json();

        if (!response.ok) {
            console.error('[API][supply-requests][manager-delivery-confirmation][PATCH] Erro ao atualizar confirmação');
            throw new Error(data.message || 'Erro ao atualizar confirmação');
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API][supply-requests][manager-delivery-confirmation][PATCH] Erro ao atualizar confirmação:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 
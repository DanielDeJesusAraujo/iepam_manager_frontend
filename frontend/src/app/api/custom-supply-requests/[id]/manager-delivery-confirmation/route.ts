import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][custom-supply-requests][PATCH] Iniciando request');
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        console.warn('[API][custom-supply-requests][PATCH] Token não fornecido');
        return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { confirmation } = body;

        if (typeof confirmation !== 'boolean') {
            console.error('[API][custom-supply-requests][PATCH] Confirmação inválida');
            return NextResponse.json(
                { error: 'Confirmação inválida' },
                { status: 400 }
            );
        }

        const response = await fetch(`${baseUrl}/custom-supply-requests/${params.id}/manager-delivery-confirmation`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ confirmation }),
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][custom-supply-requests][PATCH] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        const data = await response.json();

        if (!response.ok) {
            console.error('[API][custom-supply-requests][PATCH] Erro ao atualizar confirmação');
            throw new Error(data.message || 'Erro ao atualizar confirmação');
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API][custom-supply-requests][PATCH] Erro:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 
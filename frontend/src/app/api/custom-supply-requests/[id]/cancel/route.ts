import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][custom-supply-requests][PATCH] Iniciando request para cancelar');
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        console.error('[API][custom-supply-requests][PATCH] Token não fornecido');
        return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    try {
        const response = await fetch(`${baseUrl}/custom-supply-requests/${params.id}/cancel`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
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
            console.error('[API][custom-supply-requests][PATCH] Erro ao cancelar requisição customizada');
            throw new Error(data.message || 'Erro ao cancelar requisição customizada');
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API][custom-supply-requests][PATCH] Erro ao cancelar requisição customizada:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}


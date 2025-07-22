import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import baseUrl from '@/utils/enviroments';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    console.log('[API][inventory-allocations][PATCH] Iniciando request');
    try {
        const headersList = headers();
        const token = headersList.get('authorization')?.split(' ')[1];

        if (!token) {
            console.warn('[API][inventory-allocations][PATCH] Token não fornecido');
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${baseUrl}/inventory-allocations/${params.id}/requester-delivery-confirmation`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[API][inventory-allocations][PATCH] Erro ao confirmar entrega');
            throw new Error(errorData.error || 'Erro ao confirmar entrega');
        }

        console.log('[API][inventory-allocations][PATCH] Entrega confirmada com sucesso');
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][inventory-allocations][PATCH] Erro:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 
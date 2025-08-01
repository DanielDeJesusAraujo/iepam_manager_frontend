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
        const token = headersList.get('authorization');

        if (!token) {
            console.warn('[API][inventory-allocations][PATCH] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        
        const body = await request.json();
        
        const response = await fetch(`${baseUrl}/inventory-allocations/${params.id}/delivery-confirmation`, {
            method: 'PATCH',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][inventory-allocations][PATCH] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }
        
        if (!response.ok) {
            console.error('[API][inventory-allocations][PATCH] Erro ao confirmar entrega');
            throw new Error('Erro ao confirmar entrega');
        }

        console.log('[API][inventory-allocations][PATCH] Entrega confirmada com sucesso');
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][inventory-allocations][PATCH] Erro:', error);
        return NextResponse.json(
            { error: 'Erro ao confirmar entrega' },
            { status: 500 }
        );
    }
} 
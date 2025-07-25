import { NextRequest, NextResponse } from 'next/server';
import baseUrl from '@/utils/enviroments';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    console.log('[API][inventory-allocations][PATCH] Iniciando request');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const body = await request.json();
    const response = await fetch(`${baseUrl}/inventory-allocations/${params.id}/return`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    console.log('[API][inventory-allocations][PATCH] Resposta do backend:', response.status);
    const data = await response.json();
    console.log('[API][inventory-allocations][PATCH] Retorno da requisição:', data);
    return NextResponse.json(data, { status: response.status });
} 
import { NextRequest, NextResponse } from 'next/server';
import baseUrl from '@/utils/enviroments';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    console.log('[API][manager-return-confirmation] PATCH chamado para id:', params.id);
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('[API][manager-return-confirmation] Token recebido:', token ? 'OK' : 'FALTA TOKEN');
    try {
        const response = await fetch(`${baseUrl}/inventory-allocations/${params.id}/manager-return-confirmation`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        console.log('[API][manager-return-confirmation] Status backend:', response.status, 'Data:', data);
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[API][manager-return-confirmation] Erro:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 });
    }
} 
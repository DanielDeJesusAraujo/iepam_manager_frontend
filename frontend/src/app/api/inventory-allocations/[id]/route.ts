import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import baseUrl from '@/utils/enviroments';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    console.log('[API][inventory-allocations][GET] Iniciando request');
    try {
        const headersList = headers();
        const token = headersList.get('authorization');

        if (!token) {
            console.warn('[API][inventory-allocations][GET] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const response = await fetch(`${baseUrl}/inventory-allocations/${params.id}`, {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][inventory-allocations][GET] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error('[API][inventory-allocations][GET] Erro ao buscar alocação');
            throw new Error('Erro ao buscar alocação');
        }

        const data = await response.json();
        console.log('[API][inventory-allocations][GET] Alocação encontrada com sucesso');
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][inventory-allocations][GET] Erro:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar alocação' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    console.log('[API][inventory-allocations][PUT] Iniciando request');
    try {
        const headersList = headers();
        const token = headersList.get('authorization');

        if (!token) {
            console.warn('[API][inventory-allocations][PUT] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${baseUrl}/inventory-allocations/${params.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][inventory-allocations][PUT] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error('[API][inventory-allocations][PUT] Erro ao atualizar alocação');
            throw new Error('Erro ao atualizar alocação');
        }

        const data = await response.json();
        console.log('[API][inventory-allocations][PUT] Alocação atualizada com sucesso');
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][inventory-allocations][PUT] Erro:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar alocação' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    console.log('[API][inventory-allocations][DELETE] Iniciando request');
    try {
        const headersList = headers();
        const token = headersList.get('authorization');

        if (!token) {
            console.warn('[API][inventory-allocations][DELETE] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const response = await fetch(`${baseUrl}/inventory-allocations/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][inventory-allocations][DELETE] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error('[API][inventory-allocations][DELETE] Erro ao excluir alocação');
            throw new Error('Erro ao excluir alocação');
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Erro ao excluir alocação:', error);
        return NextResponse.json(
            { error: 'Erro ao excluir alocação' },
            { status: 500 }
        );
    }
} 
import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][events][GET] Iniciando request');
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            console.warn('[API][events][GET] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const response = await fetch(`${baseUrl}/events/${params.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][events][GET] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error('[API][events][GET] Erro ao buscar evento');
            throw new Error('Erro ao buscar evento');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][events][GET] Erro:', error);
        return NextResponse.json({ error: 'Erro ao buscar evento' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][events][PUT] Iniciando request');
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            console.warn('[API][events][PUT] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${baseUrl}/events/${params.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][events][PUT] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error('[API][events][PUT] Erro ao atualizar evento');
            throw new Error('Erro ao atualizar evento');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][events][PUT] Erro:', error);
        return NextResponse.json({ error: 'Erro ao atualizar evento' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][events][PATCH] Iniciando request');
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            console.warn('[API][events][PATCH] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${baseUrl}/events/${params.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][events][PATCH] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error('[API][events][PATCH] Erro ao atualizar evento');
            throw new Error('Erro ao atualizar evento');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][events][PATCH] Erro:', error);
        return NextResponse.json({ error: 'Erro ao atualizar evento' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][events][DELETE] Iniciando request');
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            console.warn('[API][events][DELETE] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const response = await fetch(`${baseUrl}/events/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][events][DELETE] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error('[API][events][DELETE] Erro ao excluir evento');
            throw new Error('Erro ao excluir evento');
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[API][events][DELETE] Erro:', error);
        return NextResponse.json({ error: 'Erro ao excluir evento' }, { status: 500 });
    }
} 
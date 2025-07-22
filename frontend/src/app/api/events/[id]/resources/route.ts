import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][events][resources][GET] Iniciando request');
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            console.warn('[API][events][resources][GET] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const response = await fetch(`${baseUrl}/events/${params.id}/resources`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error('[API][events][resources][GET] Erro ao buscar recursos');
            throw new Error('Erro ao buscar recursos');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][events][resources][GET] Erro:', error);
        return NextResponse.json({ error: 'Erro ao buscar recursos' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][events][resources][POST] Iniciando request');
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            console.warn('[API][events][resources][POST] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${baseUrl}/events/${params.id}/resources`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.error('[API][events][resources][POST] Erro ao adicionar recurso');
            throw new Error('Erro ao adicionar recurso');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][events][resources][POST] Erro:', error);
        return NextResponse.json({ error: 'Erro ao adicionar recurso' }, { status: 500 });
    }
} 
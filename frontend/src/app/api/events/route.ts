import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    console.log('[API][events][GET] Iniciando request');
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            console.warn('[API][events][GET] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const response = await fetch(`${baseUrl}/events`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[API][events][GET] Erro ao buscar eventos');
            throw new Error('Erro ao buscar eventos');
        }

        return NextResponse.json(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error('[API][events][GET] Erro:', error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    console.log('[API][events][POST] Iniciando request');
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            console.warn('[API][events][POST] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${baseUrl}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.error('[API][events][POST] Erro ao criar evento');
            throw new Error('Erro ao criar evento');
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('[API][events][POST] Erro:', error);
        return NextResponse.json({ error: 'Erro ao criar evento' }, { status: 500 });
    }
} 
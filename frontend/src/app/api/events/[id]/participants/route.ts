import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';



export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][events][participants][GET] Iniciando request');
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            console.warn('[API][events][participants][GET] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const response = await fetch(`${baseUrl}/events/${params.id}/participants`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error('[API][events][participants][GET] Erro ao buscar participantes');
            throw new Error('Erro ao buscar participantes');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][events][participants][GET] Erro:', error);
        return NextResponse.json({ error: 'Erro ao buscar participantes' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][events][participants][POST] Iniciando request');
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            console.warn('[API][events][participants][POST] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${baseUrl}/events/${params.id}/participants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            console.error('[API][events][participants][POST] Erro ao adicionar participante');
            throw new Error('Erro ao adicionar participante');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][events][participants][POST] Erro:', error);
        return NextResponse.json({ error: 'Erro ao adicionar participante' }, { status: 500 });
    }
} 
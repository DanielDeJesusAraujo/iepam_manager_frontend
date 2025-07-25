import baseUrl from '@/utils/enviroments'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    console.log('[API][locales][GET] Iniciando request');
    try {
        const token = request.headers.get('authorization')
        if (!token) {
            console.warn('[API][locales][GET] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
        }

        const response = await fetch(`${baseUrl}/locales`, {
            headers: {
                'Authorization': token
            }
        })

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][locales][GET] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        const data = await response.json()
        console.log('[API][locales][GET] Locais encontrados com sucesso');
        return NextResponse.json(data)
    } catch (error) {
        console.error('[API][locales][GET] Erro:', error)
        return NextResponse.json({ error: 'Erro ao buscar locais' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    console.log('[API][locales][POST] Iniciando request');
    try {
        const token = request.headers.get('authorization')
        if (!token) {
            console.warn('[API][locales][POST] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
        }

        const body = await request.json()

        const response = await fetch(`${baseUrl}/locales`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(body)
        })

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][locales][POST] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        const data = await response.json()
        console.log('[API][locales][POST] Local criado com sucesso');
        return NextResponse.json(data)
    } catch (error) {
        console.error('[API][locales][POST] Erro:', error)
        return NextResponse.json({ error: 'Erro ao criar local' }, { status: 500 })
    }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 
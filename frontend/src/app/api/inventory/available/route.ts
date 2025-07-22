import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import baseUrl from '@/utils/enviroments';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
    console.log('[API][inventory][available][GET] Iniciando request');
    try {
        const headersList = headers();
        const token = headersList.get('authorization');

        if (!token) {
            console.warn('[API][inventory][available][GET] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const response = await fetch(`${baseUrl}/inventory/available`, {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('[API][inventory][available][GET] Erro ao buscar itens do inventário');
            throw new Error('Erro ao buscar itens do inventário');
        }

        const data = await response.json();
        console.log('[API][inventory][available][GET] Sucesso');
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][inventory][available][GET] Erro:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar itens do inventário' },
            { status: 500 }
        );
    }
} 
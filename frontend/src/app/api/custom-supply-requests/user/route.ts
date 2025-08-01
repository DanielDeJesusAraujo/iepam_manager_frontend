import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    console.log('[API][custom-supply-requests][user][GET] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            console.warn('[API][custom-supply-requests][user][GET] Token não fornecido');
            return NextResponse.json(
                { message: 'Token não fornecido' },
                { status: 401 }
            );
        }

        const response = await fetch(`${baseUrl}/custom-supply-requests/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][custom-supply-requests][user][GET] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error('[API][custom-supply-requests][user][GET] Erro ao buscar requisições customizadas do usuário');
            throw new Error('Erro ao buscar requisições customizadas do usuário');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][custom-supply-requests][user][GET] Erro:', error);
        return NextResponse.json(
            { message: 'Erro ao buscar requisições customizadas do usuário' },
            { status: 500 }
        );
    }
} 
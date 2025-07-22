import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    console.log('[API][custom-supply-requests][GET] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            console.warn('[API][custom-supply-requests][GET] Token não fornecido');
            return NextResponse.json(
                { message: 'Token não fornecido' },
                { status: 401 }
            );
        }

        const response = await fetch(`${baseUrl}/custom-supply-requests`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error('[API][custom-supply-requests][GET] Erro ao buscar requisições customizadas');
            throw new Error('Erro ao buscar requisições customizadas');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][custom-supply-requests][GET] Erro:', error);
        return NextResponse.json(
            { message: 'Erro ao buscar requisições customizadas' },
            { status: 500 }
        );
    }
} 
import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: Request) {
    console.log('[API][extra-expenses][GET] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        const url = new URL(request.url);
        const searchParams = url.searchParams;
        
        // Construir query string com filtros
        const queryString = searchParams.toString();
        const apiUrl = queryString ? `${baseUrl}/extra-expenses?${queryString}` : `${baseUrl}/extra-expenses`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('[API][extra-expenses][GET] Erro ao buscar gastos extras');
            throw new Error('Erro ao buscar gastos extras');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][extra-expenses][GET] Erro:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar gastos extras' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    console.log('[API][extra-expenses][POST] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            console.warn('[API][extra-expenses][POST] Token não fornecido');
            return new NextResponse('Não autorizado', { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${baseUrl}/extra-expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[API][extra-expenses][POST] Erro ao criar gasto extra');
            throw new Error(data.message || 'Erro ao criar gasto extra');
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][extra-expenses][POST] Erro:', error);
        return new NextResponse('Erro interno do servidor', { status: 500 });
    }
} 
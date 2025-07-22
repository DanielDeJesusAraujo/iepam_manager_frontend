import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
    console.log('[API][supply-requests][many][POST] Iniciando request');
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        console.error('[API][supply-requests][many][POST] Token não fornecido');
        return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    try {
        const body = await request.json();

        const response = await fetch(`${baseUrl}/supply-requests/many`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[API][supply-requests][many][POST] Erro ao criar solicitações');
            throw new Error(data.message || 'Erro ao criar solicitações');
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API][supply-requests][many][POST] Erro ao criar solicitações:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 
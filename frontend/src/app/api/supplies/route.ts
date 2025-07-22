import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        console.log('[API][supplies][GET] Iniciando request');
        const token = request.headers.get('Authorization')?.split(' ')[1];

        if (!token) {
            console.error('[API][supplies][GET] Token não fornecido');
            return NextResponse.json(
                { message: 'Token não fornecido' },
                { status: 401 }
            );
        }

        const response = await fetch(`${baseUrl}/supplies`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[API][supplies][GET] Erro ao carregar suprimentos');
            throw new Error(errorData.error || 'Erro ao carregar suprimentos');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][supplies][GET] Erro ao carregar suprimentos:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('[API][supplies][POST] Iniciando request');
        const token = request.headers.get('authorization');
        if (!token) {
            console.error('[API][supplies][POST] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${baseUrl}/supplies`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[API][supplies][POST] Erro ao criar suprimento');
            throw new Error(errorData.error || 'Erro ao criar suprimento');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][supplies][POST] Erro ao criar suprimento:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao criar suprimento' },
            { status: 500 }
        );
    }
} 
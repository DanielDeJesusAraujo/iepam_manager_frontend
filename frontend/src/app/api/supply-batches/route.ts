import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        console.log('[API][supply-batches][GET] Iniciando request');
        const token = request.headers.get('authorization');
        if (!token) {
            console.error('[API][supply-batches][GET] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }
        const response = await fetch(`${baseUrl}/supply-batches`, {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
        });
        console.log('[API][supply-batches][GET] Response ok');
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][supply-batches][GET] Erro ao buscar lotes:', error);
        return NextResponse.json({ error: 'Erro ao buscar lotes' }, { status: 500 });
    }
}

// Você pode adicionar POST, PUT, DELETE conforme necessário para proxy completo 
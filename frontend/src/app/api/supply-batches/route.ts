import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization');
        if (!token) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }
        const response = await fetch(`${baseUrl}/supply-batches`, {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar lotes' }, { status: 500 });
    }
}

// Você pode adicionar POST, PUT, DELETE conforme necessário para proxy completo 
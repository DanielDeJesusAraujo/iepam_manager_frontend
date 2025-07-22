import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    console.log('[API][supply-requests][GET] Iniciando request');
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
        console.error('[API][supply-requests][GET] Token não fornecido');
        return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    try {
        const response = await fetch(`${baseUrl}/supply-requests`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[API][supply-requests][GET] Erro ao buscar requisições');
            throw new Error(data.message || 'Erro ao buscar requisições');
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API][supply-requests][GET] Erro ao buscar requisições:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    console.log('[API][supply-requests][POST] Iniciando request');
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      console.error('[API][supply-requests][POST] Token não fornecido');
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

  try {
    const body = await request.json();
      const response = await fetch(`${baseUrl}/supply-requests`, {
        method: 'POST',
        headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

      const data = await response.json();

      if (!response.ok) {
          console.error('[API][supply-requests][POST] Erro ao criar solicitação');
          throw new Error(data.message || 'Erro ao criar solicitação');
        }

      return NextResponse.json(data);
    } catch (error: any) {
      console.error('[API][supply-requests][POST] Erro ao criar solicitação:', error);
      return NextResponse.json(
          { error: error.message || 'Erro interno do servidor' },
          { status: 500 }
        );
    }
} 
import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('[API][quotes][GET] Iniciando request');
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.error('[API][quotes][GET] Token não fornecido');
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${baseUrl}/quotes/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][quotes][GET] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[API][quotes][GET] Erro do backend:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Erro ao buscar cotação' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API][quotes][GET] Erro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar cotação' },
      { status: 500 }
    );
  }
} 
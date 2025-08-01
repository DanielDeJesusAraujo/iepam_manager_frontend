import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import baseUrl from '@/utils/enviroments';

export async function GET(request: Request) {
  try {
    console.log('[API][suppliers][GET] Iniciando request');
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.error('[API][suppliers][GET] Token não fornecido');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const response = await fetch(`${baseUrl}/suppliers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][suppliers][GET] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      console.error('[API][suppliers][GET] Erro ao buscar fornecedores');
      throw new Error('Erro ao buscar fornecedores');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][suppliers][GET] Erro na rota /api/suppliers:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar fornecedores' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('[API][suppliers][POST] Iniciando request');
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.error('[API][suppliers][POST] Token não fornecido');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${baseUrl}/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][suppliers][POST] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[API][suppliers][POST] Erro ao criar fornecedor');
      throw new Error(errorData.message || 'Erro ao criar fornecedor');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API][suppliers][POST] Erro na rota /api/suppliers:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar fornecedor' },
      { status: 500 }
    );
  }
} 
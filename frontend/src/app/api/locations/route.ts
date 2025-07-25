import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('[API][locations][GET] Iniciando request');
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.warn('[API][locations][GET] Token não fornecido');
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const response = await fetch(`${baseUrl}/locations`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][locations][GET] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    const data = await response.json();
    console.log('[API][locations][GET] Localizações encontradas com sucesso');
    if (!response.ok) {
      console.error('[API][locations][GET] Erro ao buscar localizações');
      return NextResponse.json(
        { message: data.message || 'Erro ao buscar localizações' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][locations][GET] Erro:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('[API][locations][POST] Iniciando request');
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.warn('[API][locations][POST] Token não fornecido');
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${baseUrl}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][locations][POST] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const error = await response.json();
      console.error('[API][locations][POST] Erro ao criar localização');
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log('[API][locations][POST] Localização criada com sucesso');
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[API][locations][POST] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao criar localização' },
      { status: 500 }
    );
  }
} 
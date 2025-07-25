import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('[API][users][GET] Iniciando request');
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.error('[API][users][GET] Token não fornecido');
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${baseUrl}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][users][GET] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      console.error('[API][users][GET] Erro ao buscar usuários');
      throw new Error('Erro ao buscar usuários');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][users][GET] Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log('[API][users][POST] Iniciando request');
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.error('[API][users][POST] Token não fornecido');
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Validação dos dados
    if (!body.name || !body.email || !body.password || !body.role) {
      console.error('[API][users][POST] Todos os campos são obrigatórios');
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const response = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][users][POST] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[API][users][POST] Erro ao criar usuário');
      return NextResponse.json(
        { error: errorData.message || 'Erro ao criar usuário' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][users][POST] Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
} 
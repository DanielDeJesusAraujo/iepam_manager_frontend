import { NextResponse } from 'next/server'

import baseUrl from '@/utils/enviroments';

export async function POST(request: Request) {
  console.log('[API][auth][login][POST] Iniciando request');
  try {
    const { email, password } = await request.json()

    if (!baseUrl) {
      console.error('[API][auth][login][POST] Erro de configuração do servidor');
      return NextResponse.json(
        { message: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }

    console.log('[API][auth][login][POST] Buscando URL base');
    const apiUrl = `${baseUrl}/users/sessions`
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][auth][login][POST] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('[API][auth][login][POST] Erro ao fazer login');
      return NextResponse.json(
        { message: data.message || 'Erro ao fazer login' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[API][auth][login][POST] Erro:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
} 
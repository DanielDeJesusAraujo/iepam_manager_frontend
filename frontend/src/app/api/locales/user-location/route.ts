import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('[API][locales][user-location][GET] Iniciando request');
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.warn('[API][locales][user-location][GET] Token não fornecido');
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    // Usar a rota que busca locais da filial do usuário
    const response = await fetch(`${baseUrl}/sectors/user-locales`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][locales][user-location][GET] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      console.error('[API][locales][user-location][GET] Erro ao buscar locais da filial do usuário');
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log('[API][locales][user-location][GET] Locais da filial do usuário encontrados com sucesso');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][locales][user-location][GET] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar locais da filial do usuário' },
      { status: 500 }
    );
  }
} 
import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('[API][quotes][smart][GET] Iniciando request');
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.warn('[API][quotes][smart][GET] Token não fornecido');
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${baseUrl}/quotes/smart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('[API][quotes][smart][GET] Erro ao buscar cotações inteligentes');
      throw new Error('Erro ao buscar cotações inteligentes');
    }

    const data = await response.json();
    console.log('[API][quotes][smart][GET] Cotações inteligentes encontradas com sucesso');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][quotes][smart][GET] Erro ao buscar cotações inteligentes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cotações inteligentes' },
      { status: 500 }
    );
  }
} 
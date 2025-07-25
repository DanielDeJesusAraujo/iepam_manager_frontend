import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  console.log('[API][dashboard][stats][GET] Iniciando request');
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      console.warn('[API][dashboard][stats][GET] Token não encontrado');
      return NextResponse.json(
        { message: 'Token não encontrado' },
        { status: 401 }
      )
    }

    const response = await fetch(`${baseUrl}/dashboard/stats`, {
      headers: {
        Authorization: token
      }
    })

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][dashboard][stats][GET] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('[API][dashboard][stats][GET] Erro ao buscar estatísticas');
      return NextResponse.json(
        { message: data.message || 'Erro ao buscar estatísticas' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[API][dashboard][stats][GET] Erro:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import baseUrl from '@/utils/enviroments';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    console.log('[API][suppliers][search][GET] Iniciando request');
    const headersList = await headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      console.error('[API][suppliers][search][GET] Token não fornecido');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    if (!search) {
      console.error('[API][suppliers][search][GET] CNPJ não fornecido');
      return NextResponse.json({ error: 'CNPJ não fornecido' }, { status: 400 });
    }

    const response = await fetch(`${baseUrl}/suppliers/search?search=${search}`, {
      headers: {
        'Authorization': authorization,
      },
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][suppliers][search][GET] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      console.error('[API][suppliers][search][GET] Erro ao buscar fornecedor');
      return NextResponse.json([], { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API][suppliers][search][GET] Erro na rota /api/suppliers/search:', error);
    return NextResponse.json([], { status: 200 });
  }
} 
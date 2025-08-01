import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API][locations][GET] Iniciando request');
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.warn('[API][locations][GET] Token não fornecido');
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const response = await fetch(`${baseUrl}/locations/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][locations][GET] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const error = await response.json();
      console.error('[API][locations][GET] Erro ao buscar localização');
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log('[API][locations][GET] Localização encontrada com sucesso');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][locations][GET] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar localização' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API][locations][PUT] Iniciando request');
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.warn('[API][locations][PUT] Token não fornecido');
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${baseUrl}/locations/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][locations][PUT] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const error = await response.json();
      console.error('[API][locations][PUT] Erro ao atualizar localização');
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log('[API][locations][PUT] Localização atualizada com sucesso');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][locations][PUT] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar localização' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API][locations][DELETE] Iniciando request');
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.warn('[API][locations][DELETE] Token não fornecido');
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const response = await fetch(`${baseUrl}/locations/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[API][locations][DELETE] Erro ao excluir localização');
      return NextResponse.json(error, { status: response.status });
    }

    console.log('[API][locations][DELETE] Localização excluída com sucesso');
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[API][locations][DELETE] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir localização' },
      { status: 500 }
    );
  }
} 
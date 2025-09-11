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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('[API][quotes][PUT] Iniciando request');
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.error('[API][quotes][PUT] Token não fornecido');
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(`${baseUrl}/quotes/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][quotes][PUT] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API][quotes][PUT] Erro do backend:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Erro ao atualizar cotação' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API][quotes][PUT] Erro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar cotação' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('[API][quotes][DELETE] Iniciando request');
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.error('[API][quotes][DELETE] Token não fornecido');
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${baseUrl}/quotes/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][quotes][DELETE] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API][quotes][DELETE] Erro do backend:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Erro ao excluir cotação' },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('[API][quotes][DELETE] Erro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir cotação' },
      { status: 500 }
    );
  }
}
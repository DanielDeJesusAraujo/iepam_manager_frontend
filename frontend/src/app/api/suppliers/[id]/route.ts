import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[API][suppliers][GET] Iniciando request');
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.error('[API][suppliers][GET] Token não fornecido');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const response = await fetch(`${baseUrl}/suppliers/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('[API][suppliers][GET] Erro ao buscar fornecedor');
      throw new Error('Erro ao buscar fornecedor');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][suppliers][GET] Erro na rota /api/suppliers/[id]:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar fornecedor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[API][suppliers][PUT] Iniciando request');
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.error('[API][suppliers][PUT] Token não fornecido');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${baseUrl}/suppliers/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[API][suppliers][PUT] Erro ao atualizar fornecedor');
      throw new Error(errorData.message || 'Erro ao atualizar fornecedor');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API][suppliers][PUT] Erro na rota /api/suppliers/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar fornecedor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[API][suppliers][DELETE] Iniciando request');
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.error('[API][suppliers][DELETE] Token não fornecido');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const response = await fetch(`${baseUrl}/suppliers/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('[API][suppliers][DELETE] Erro ao excluir fornecedor');
      throw new Error('Erro ao excluir fornecedor');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[API][suppliers][DELETE] Erro na rota /api/suppliers/[id]:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir fornecedor' },
      { status: 500 }
    );
  }
} 
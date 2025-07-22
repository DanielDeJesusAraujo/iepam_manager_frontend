import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[API][users][GET] Iniciando request');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.error('[API][users][GET] Token não fornecido');
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const response = await fetch(`${baseUrl}/users/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('[API][users][GET] Erro ao buscar usuário');
      if (response.status === 404) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }
      throw new Error('Erro ao buscar usuário');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][users][GET] Erro na API de usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[API][users][PUT] Iniciando request');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const body = await request.json();

    if (!token) {
      console.error('[API][users][PUT] Token não fornecido');
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const response = await fetch(`${baseUrl}/users/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('[API][users][PUT] Erro ao atualizar usuário');
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][users][PUT] Erro na API de usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[API][users][DELETE] Iniciando request');
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.error('[API][users][DELETE] Token não fornecido');
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const response = await fetch(`${baseUrl}/users/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('[API][users][DELETE] Erro ao excluir usuário');
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[API][users][DELETE] Erro na API de usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 
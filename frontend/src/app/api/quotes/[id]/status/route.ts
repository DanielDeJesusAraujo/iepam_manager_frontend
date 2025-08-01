import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.warn('[API][quotes][status][PATCH] Token não fornecido');
    console.error('Erro: Token não fornecido');
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    if (!body.status) {
      console.error('Erro: Status não fornecido');
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 }
      );
    }

    // Determina qual endpoint do backend chamar baseado no status
    const endpoint = body.status === 'APPROVED' 
      ? 'approve' 
      : body.status === 'REJECTED' 
        ? 'reject' 
        : null;

    if (!endpoint) {
      console.error('[API][quotes][status][PATCH] Status inválido');
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }
    
    const response = await fetch(`${baseUrl}/quotes/${params.id}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][quotes][status][PATCH] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[API][quotes][status][PATCH] Erro do backend:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Erro ao atualizar status da cotação' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API][quotes][status][PATCH] Erro ao atualizar status da cotação:', error);
    console.error('[API][quotes][status][PATCH] Stack trace:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar status da cotação' },
      { status: 500 }
    );
  }
} 
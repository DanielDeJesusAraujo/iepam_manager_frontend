import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
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
      console.error('Erro: Status inválido');
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro do backend:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Erro ao atualizar status da cotação' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro ao atualizar status da cotação:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar status da cotação' },
      { status: 500 }
    );
  }
} 
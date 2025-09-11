import { NextRequest, NextResponse } from 'next/server';
import baseUrl from '@/utils/enviroments';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[API][tasks][GET] Iniciando request');
    const response = await fetch(`${baseUrl}/tasks/${params.id}`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][tasks][GET] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      console.error('[API][tasks][GET] Erro ao buscar tarefa');
      throw new Error('Failed to fetch task');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][tasks][GET] Error fetching task:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar tarefa' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[API][tasks][PUT] Iniciando request');
    const body = await request.json();
    
    const response = await fetch(`${baseUrl}/tasks/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('[API][tasks][PUT] Erro ao atualizar tarefa');
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][tasks][PUT] Error updating task:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar tarefa' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[API][tasks][DELETE] Iniciando request');
    const response = await fetch(`${baseUrl}/tasks/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      console.error('[API][tasks][DELETE] Erro ao excluir tarefa');
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][tasks][DELETE] Error deleting task:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir tarefa' },
      { status: 500 }
    );
  }
} 
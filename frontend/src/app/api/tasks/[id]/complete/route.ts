import { NextRequest, NextResponse } from 'next/server';
import baseUrl from '@/utils/enviroments';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[API][tasks][complete][PATCH] Iniciando request');
    const response = await fetch(`${baseUrl}/tasks/${params.id}/complete`, {
      method: 'PATCH',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      console.error('[API][tasks][complete][PATCH] Erro ao marcar tarefa como concluída');
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][tasks][complete][PATCH] Error marking task as completed:', error);
    return NextResponse.json(
      { error: 'Erro ao marcar tarefa como concluída' },
      { status: 500 }
    );
  }
} 
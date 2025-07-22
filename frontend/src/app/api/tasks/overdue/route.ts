import { NextRequest, NextResponse } from 'next/server';
import baseUrl from '@/utils/enviroments';

export async function GET(request: NextRequest) {
  try {
    console.log('[API][tasks][overdue][GET] Iniciando request');
    const response = await fetch(`${baseUrl}/tasks/overdue`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      console.error('[API][tasks][overdue][GET] Erro ao buscar tarefas atrasadas');
      throw new Error('Failed to fetch overdue tasks');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][tasks][overdue][GET] Error fetching overdue tasks:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar tarefas atrasadas' },
      { status: 500 }
    );
  }
} 
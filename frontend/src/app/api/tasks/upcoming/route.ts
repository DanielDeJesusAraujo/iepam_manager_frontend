import { NextRequest, NextResponse } from 'next/server';
import baseUrl from '@/utils/enviroments';

export async function GET(request: NextRequest) {
  try {
    console.log('[API][tasks][upcoming][GET] Iniciando request');
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const response = await fetch(`${baseUrl}/tasks/upcoming${queryString ? `?${queryString}` : ''}`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      console.error('[API][tasks][upcoming][GET] Erro ao buscar tarefas próximas');
      throw new Error('Failed to fetch upcoming tasks');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][tasks][upcoming][GET] Error fetching upcoming tasks:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar tarefas próximas' },
      { status: 500 }
    );
  }
} 
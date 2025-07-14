import { NextRequest, NextResponse } from 'next/server';
import baseUrl from '@/utils/enviroments';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${baseUrl}/tasks/overdue`, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch overdue tasks');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar tarefas atrasadas' },
      { status: 500 }
    );
  }
} 
import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${baseUrl}/quotes/smart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar cotações inteligentes');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar cotações inteligentes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cotações inteligentes' },
      { status: 500 }
    );
  }
} 
import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('[API][users][me][GET] Iniciando request');
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.error('[API][users][me][GET] Token não fornecido');
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const response = await fetch(`${baseUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[API][users][me][GET] Erro ao buscar dados do usuário');
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][users][me][GET] Erro ao buscar dados do usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do usuário' },
      { status: 500 }
    );
  }
} 
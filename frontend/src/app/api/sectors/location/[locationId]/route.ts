import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { locationId: string } }
) {
  console.log('[API][sectors][location][GET] Iniciando request');
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.error('[API][sectors][location][GET] Token não fornecido');
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const response = await fetch(`${baseUrl}/sectors/location/${params.locationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][sectors][location][GET] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      console.error('[API][sectors][location][GET] Erro ao buscar setores da localização');
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[API][sectors][location][GET] Erro ao buscar setores da localização:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar setores da localização' },
      { status: 500 }
    );
  }
} 
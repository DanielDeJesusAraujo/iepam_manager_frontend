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
    console.log('[API][sectors][location][GET] Token ok');

    const response = await fetch(`${baseUrl}/sectors/location/${params.locationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('[API][sectors][location][GET] Response ok');

    if (!response.ok) {
      console.error('[API][sectors][location][GET] Erro ao buscar setores da localização');
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log('[API][sectors][location][GET] Setores da localização encontrados com sucesso');
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[API][sectors][location][GET] Erro ao buscar setores da localização:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar setores da localização' },
      { status: 500 }
    );
  }
} 
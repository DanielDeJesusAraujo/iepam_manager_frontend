import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API][orders][close][POST] Iniciando request');
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      console.warn('[API][orders][close][POST] Token não fornecido');
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('[API][orders][close][POST] Body:', body);
    const url = `${baseUrl}/service-orders/${params.id}/close`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })
    console.log(`[API][orders][close][POST] Response ok`);
    const data = await response.json()
    console.log('[API][orders][close][POST] Data ok');
    if (!response.ok) {
      console.error(`[API][orders][close][POST] Erro ao finalizar ordem de serviço: ${data.message}`);
      return NextResponse.json(
        { message: data.message || 'Erro ao finalizar ordem de serviço' },
        { status: response.status }
      )
    }

    console.log('[API][orders][close][POST] Data ok');
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API][orders][close][POST] Erro: ${error}`);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
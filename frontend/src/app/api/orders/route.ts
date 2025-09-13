import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  console.log('[API][orders][GET] Iniciando request');
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      console.warn('[API][orders][GET] Token não fornecido');
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 })
    }

    const backendRes = await fetch(`${baseUrl}/service-orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (backendRes.status === 429) {
      const message = await backendRes.text();
      console.log('[API][orders][GET] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!backendRes.ok) {
      const error = await backendRes.json();
      console.error(`[API][orders][GET] Erro ao buscar ordens de serviço:`, error);
      return NextResponse.json(error, { status: backendRes.status });
    }

    const data = await backendRes.json()

    // Garantir que data é um array
    if (!Array.isArray(data)) {
      console.error('[API][orders][GET] Formato de dados inválido');
      return NextResponse.json(
        { message: 'Formato de dados inválido' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[API][orders][GET] Erro:', error) // Debug log
    return NextResponse.json(
      { message: 'Erro ao buscar ordens de serviço' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  console.log('[API][orders][POST] Iniciando request');
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]
    if (!token) {
      console.warn('[API][orders][POST] Token não fornecido');
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 })
    }

    const body = await req.json()

    const backendRes = await fetch(`${baseUrl}/service-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })

    if (backendRes.status === 429) {
      const message = await backendRes.text();
      console.log('[API][orders][POST] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!backendRes.ok) {
      const error = await backendRes.json();
      console.error('[API][orders][POST] Erro ao criar ordem de serviço:', error);
      return NextResponse.json(error, { status: backendRes.status });
    }

    const data = await backendRes.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('[API][orders][POST] Erro:', error)
    return NextResponse.json(
      { message: error.message || 'Erro ao criar ordem de serviço' },
      { status: 500 }
    )
  }
} 
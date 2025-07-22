import baseUrl from '@/utils/enviroments'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('[API][sectors][GET] Iniciando request');
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      console.error('[API][sectors][GET] Token não fornecido');
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const response = await fetch(`${baseUrl}/sectors`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      console.error('[API][sectors][GET] Erro ao buscar setores');
      throw new Error('Erro ao buscar setores')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API][sectors][GET] Erro na API de setores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('[API][sectors][POST] Iniciando request');
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const body = await request.json()
    
    if (!token) {
      console.error('[API][sectors][POST] Token não fornecido');
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const response = await fetch(`${baseUrl}/sectors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error('[API][sectors][POST] Erro ao criar setor');
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[API][sectors][POST] Erro na API de setores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 
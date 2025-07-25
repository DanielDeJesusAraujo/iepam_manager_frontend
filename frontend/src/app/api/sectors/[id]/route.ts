import baseUrl from '@/utils/enviroments'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API][sectors][GET] Iniciando request');
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }
    console.log('[API][sectors][GET] Token ok');
    const response = await fetch(`${baseUrl}/sectors/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][sectors][GET] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Setor não encontrado' }, { status: 404 })
      }
      throw new Error('Erro ao buscar setor')
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API][sectors][PUT] Iniciando request');
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const body = await request.json()
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }
    
    const response = await fetch(`${baseUrl}/sectors/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][sectors][PUT] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      console.error('[API][sectors][PUT] Erro ao atualizar setor');
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API][sectors][PUT] Erro na API de setores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API][sectors][DELETE] Iniciando request');
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      console.error('[API][sectors][DELETE] Token não fornecido');
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }
    
    const response = await fetch(`${baseUrl}/sectors/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][sectors][DELETE] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      console.error('[API][sectors][DELETE] Erro ao deletar setor');
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[API][sectors][DELETE] Erro na API de setores:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 
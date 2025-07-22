import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server'

// Configurações específicas do Next.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('[API][orders][GET] Iniciando request');
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    console.log('[API][orders][GET] Token:', token);
    if (!token) {
      console.warn('[API][orders][GET] Token não fornecido');
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      )
    }
    console.log('[API][orders][GET] Token ok');
    const url = `${baseUrl}/service-orders/${params.id}`;
    console.log('[API][orders][GET] URL:', url);
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('[API][orders][GET] Response ok');
    const data = await response.json()
    console.log('[API][orders][GET] Data:', data);
    if (!response.ok) {
      console.error(`[API][orders][GET] Erro ao buscar ordem de serviço: ${data.message}`);
      return NextResponse.json(
        { message: data.message || 'Erro ao buscar ordem de serviço' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API][orders][GET] Erro: ${error}`);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API][orders][PATCH] Iniciando request');
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      console.warn('[API][orders][PATCH] Token não fornecido');
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('[API][orders][PATCH] Body:', body);
    const url = `${baseUrl}/service-orders/${params.id}`;
    console.log('[API][orders][PATCH] URL:', url);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })
    console.log('[API][orders][PATCH] Response ok');
    const data = await response.json()
    console.log('[API][orders][PATCH] Data:', data);
    if (!response.ok) {
      console.error(`[API][orders][PATCH] Erro ao atualizar ordem de serviço: ${data.message}`);
      return NextResponse.json(
        { message: data.message || 'Erro ao atualizar ordem de serviço' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API][orders][PATCH] Erro: ${error}`);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API][orders][DELETE] Iniciando request');
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    console.log('[API][orders][DELETE] Token:', token);
    if (!token) {
      console.warn('[API][orders][DELETE] Token não fornecido');
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const url = `${baseUrl}/service-orders/${params.id}`;
    console.log('[API][orders][DELETE] URL:', url);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      const data = await response.json()
      console.error(`[API][orders][DELETE] Erro ao excluir ordem de serviço: ${data.message}`);
      return NextResponse.json(
        { message: data.message || 'Erro ao excluir ordem de serviço' },
        { status: response.status }
      )
    }
    console.log('[API][orders][DELETE] Ordem de serviço excluída com sucesso');
    return NextResponse.json({ message: 'Ordem de serviço excluída com sucesso' })
  } catch (error) {
    console.error(`[API][orders][DELETE] Erro: ${error}`);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API][orders][PUT] Iniciando request');
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    console.log('[API][orders][PUT] Token:', token);
    if (!token) {
      console.warn('[API][orders][PUT] Token não fornecido');
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('[API][orders][PUT] Body:', body);
    const url = `${baseUrl}/service-orders/${params.id}`;
    console.log('[API][orders][PUT] URL:', url);
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })
    console.log('[API][orders][PUT] Response ok');
    const data = await response.json()
    if (!response.ok) {
      console.error(`[API][orders][PUT] Erro ao atualizar ordem de serviço: ${data.message}`);
      return NextResponse.json(
        { message: data.message || 'Erro ao atualizar ordem de serviço' },
        { status: response.status }
      )
    }
    console.log('[API][orders][PUT] Ordem de serviço atualizada com sucesso');
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API][orders][PUT] Erro: ${error}`);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
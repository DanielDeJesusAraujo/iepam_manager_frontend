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

    // Verificar permissão do usuário
    const userResponse = await fetch(`${baseUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      console.error('[API][orders][GET] Erro ao verificar permissões');
      return NextResponse.json({ error: 'Erro ao verificar permissões' }, { status: 401 });
    }

    const user = await userResponse.json();
    if (!['ADMIN', 'MANAGER'].includes(user.role)) {
      console.error('[API][orders][GET] Acesso negado');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const backendRes = await fetch(`${baseUrl}/service-orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('[API][orders][GET] Response ok');
    if (!backendRes.ok) {
      const errorText = await backendRes.text()
      console.error(`[API][orders][GET] Erro ao buscar ordens de serviço: ${errorText}`);
      throw new Error('Erro ao buscar ordens de serviço')
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
    console.log('[API][orders][GET] Ordens de serviço encontradas com sucesso');
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

    // Verificar permissão do usuário
    const userResponse = await fetch(`${baseUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      console.error('[API][orders][POST] Erro ao verificar permissões');
      return NextResponse.json({ error: 'Erro ao verificar permissões' }, { status: 401 });
    }

    const user = await userResponse.json();
    if (!['ADMIN', 'MANAGER'].includes(user.role)) {
      console.error('[API][orders][POST] Acesso negado');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
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
    console.log('[API][orders][POST] Response ok');
    if (!backendRes.ok) {
      console.error('[API][orders][POST] Erro ao criar ordem de serviço');
      const errorData = await backendRes.json()
      throw new Error(errorData.message || 'Erro ao criar ordem de serviço')
    }
    console.log('[API][orders][POST] Ordem de serviço criada com sucesso');
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
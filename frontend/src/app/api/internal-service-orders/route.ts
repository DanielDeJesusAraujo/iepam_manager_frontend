import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log('[API][internal-service-orders][GET] Iniciando request');
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      console.warn('[API][internal-service-orders][GET] Token não fornecido');
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 });
    }
    // Apenas técnicos podem acessar
    const userResponse = await fetch(`${baseUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (userResponse.status === 429) {
      const message = await userResponse.text();
      console.log('[API][internal-service-orders][GET] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!userResponse.ok) {
      console.error('[API][internal-service-orders][GET] Erro ao verificar permissões');
      return NextResponse.json({ error: 'Erro ao verificar permissões' }, { status: 401 });
    }

    const user = await userResponse.json();
    if (user.role !== 'TECHNICIAN') {
      console.error('[API][internal-service-orders][GET] Acesso negado');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    const backendRes = await fetch(`${baseUrl}/internal-service-orders?technician_id=${user.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (backendRes.status === 429) {
      const message = await backendRes.text();
      console.log('[API][internal-service-orders][GET] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!backendRes.ok) {
      console.error('[API][internal-service-orders][GET] Erro ao buscar ordens de serviço internas');
      throw new Error('Erro ao buscar ordens de serviço internas');
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][internal-service-orders][GET] Erro:', error);
    return NextResponse.json({ message: 'Erro ao buscar ordens de serviço internas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log('[API][internal-service-orders][POST] Iniciando request');
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      console.warn('[API][internal-service-orders][POST] Token não fornecido');
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 });
    }
    // Apenas técnicos podem criar
    const userResponse = await fetch(`${baseUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (userResponse.status === 429) {
      const message = await userResponse.text();
      console.log('[API][internal-service-orders][POST] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!userResponse.ok) {
      console.error('[API][internal-service-orders][POST] Erro ao verificar permissões');
      return NextResponse.json({ error: 'Erro ao verificar permissões' }, { status: 401 });
    }

    const user = await userResponse.json();
    if (user.role !== 'TECHNICIAN') {
      console.error('[API][internal-service-orders][POST] Acesso negado');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    
    const body = await req.json();
    body.technician_id = user.id;
    const backendRes = await fetch(`${baseUrl}/internal-service-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    if (!backendRes.ok) {
      const errorData = await backendRes.json();
      console.error('[API][internal-service-orders][POST] Erro ao criar ordem de serviço interna');
      throw new Error(errorData.message || 'Erro ao criar ordem de serviço interna');
    }
    const data = await backendRes.json();
    console.log('[API][internal-service-orders][POST] Ordem de serviço interna criada com sucesso');
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('[API][internal-service-orders][POST] Erro:', error);
    return NextResponse.json({ message: error.message || 'Erro ao criar ordem de serviço interna' }, { status: 500 });
  }
} 
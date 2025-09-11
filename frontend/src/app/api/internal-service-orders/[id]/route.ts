import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('[API][internal-service-orders][GET] Iniciando request');
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
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

    const url = `${baseUrl}/internal-service-orders/${params.id}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][internal-service-orders][GET] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    const data = await response.json();
    if (!response.ok) {
      console.error('[API][internal-service-orders][GET] Erro ao buscar ordem de serviço interna');
      return NextResponse.json({ message: data.message || 'Erro ao buscar ordem de serviço interna' }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][internal-service-orders][GET] Erro:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API][internal-service-orders][PUT] Iniciando request');
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      console.warn('[API][internal-service-orders][PUT] Token não fornecido');
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 });
    }
    // Apenas técnicos podem atualizar
    const userResponse = await fetch(`${baseUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (userResponse.status === 429) {
      const message = await userResponse.text();
      console.log('[API][internal-service-orders][PUT] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!userResponse.ok) {
      console.error('[API][internal-service-orders][PUT] Erro ao verificar permissões');
      return NextResponse.json({ error: 'Erro ao verificar permissões' }, { status: 401 });
    }

    const user = await userResponse.json();
    if (user.role !== 'TECHNICIAN') {
      console.error('[API][internal-service-orders][PUT] Acesso negado');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const url = `${baseUrl}/internal-service-orders/${params.id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][internal-service-orders][PUT] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    const data = await response.json();
    if (!response.ok) {
      console.error('[API][internal-service-orders][PUT] Erro ao atualizar ordem de serviço interna');
      return NextResponse.json({ message: data.message || 'Erro ao atualizar ordem de serviço interna' }, { status: response.status });
    }

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][internal-service-orders][PUT] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][internal-service-orders][PUT] Erro:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API][internal-service-orders][DELETE] Iniciando request');
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      console.warn('[API][internal-service-orders][DELETE] Token não fornecido');
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 });
    }

    // Apenas técnicos podem deletar
    const userResponse = await fetch(`${baseUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (userResponse.status === 429) {
      const message = await userResponse.text();
      console.log('[API][internal-service-orders][DELETE] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!userResponse.ok) {
      console.error('[API][internal-service-orders][DELETE] Erro ao verificar permissões');
      return NextResponse.json({ error: 'Erro ao verificar permissões' }, { status: 401 });
    }

    console.log('[API][internal-service-orders][DELETE] Verificando permissões');
    const user = await userResponse.json();
    if (user.role !== 'TECHNICIAN') {
      console.error('[API][internal-service-orders][DELETE] Acesso negado');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const url = `${baseUrl}/internal-service-orders/${params.id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][internal-service-orders][DELETE] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      console.error('[API][internal-service-orders][DELETE] Erro ao excluir ordem de serviço interna');
      const data = await response.json();
      return NextResponse.json({ message: data.message || 'Erro ao excluir ordem de serviço interna' }, { status: response.status });
    }

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][internal-service-orders][DELETE] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    return NextResponse.json({ message: 'Ordem de serviço interna excluída com sucesso' });
  } catch (error) {
    console.error('[API][internal-service-orders][DELETE] Erro:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
} 
import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API][maintenance-schedules][GET] Iniciando request');
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.warn('[API][maintenance-schedules][GET] Token não fornecido');
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 });
    }
    // Apenas técnicos podem acessar
    const userResponse = await fetch(`${baseUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!userResponse.ok) { 
      console.error('[API][maintenance-schedules][GET] Erro ao verificar permissões');
      return NextResponse.json({ error: 'Erro ao verificar permissões' }, { status: 401 });
    }
    const user = await userResponse.json(); 
    if (user.role !== 'TECHNICIAN') {
      console.error('[API][maintenance-schedules][GET] Acesso negado');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    const response = await fetch(`${baseUrl}/maintenance-schedules/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('[API][maintenance-schedules][GET] Erro ao buscar agendamento de manutenção');
      throw new Error('Failed to fetch maintenance schedule');
    }

    const data = await response.json();
    console.log('[API][maintenance-schedules][GET] Agendamento de manutenção encontrado com sucesso');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][maintenance-schedules][GET] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar agendamento de manutenção' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API][maintenance-schedules][PUT] Iniciando request');
  try {
    const body = await request.json();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.warn('[API][maintenance-schedules][PUT] Token não fornecido');
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 });
    }
    // Apenas técnicos podem acessar
    const userResponse = await fetch(`${baseUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!userResponse.ok) {
      console.error('[API][maintenance-schedules][PUT] Erro ao verificar permissões');
      return NextResponse.json({ error: 'Erro ao verificar permissões' }, { status: 401 });
    }
    const user = await userResponse.json();
    if (user.role !== 'TECHNICIAN') {
      console.error('[API][maintenance-schedules][PUT] Acesso negado');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    const response = await fetch(`${baseUrl}/maintenance-schedules/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[API][maintenance-schedules][PUT] Erro ao atualizar agendamento de manutenção');
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log('[API][maintenance-schedules][PUT] Agendamento de manutenção atualizado com sucesso');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][maintenance-schedules][PUT] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar agendamento de manutenção' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[API][maintenance-schedules][DELETE] Iniciando request');
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.warn('[API][maintenance-schedules][DELETE] Token não fornecido');
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 });
    }
    // Apenas técnicos podem acessar
    const userResponse = await fetch(`${baseUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!userResponse.ok) {
      console.error('[API][maintenance-schedules][DELETE] Erro ao verificar permissões');
      return NextResponse.json({ error: 'Erro ao verificar permissões' }, { status: 401 });
    }
    const user = await userResponse.json();
    if (user.role !== 'TECHNICIAN') {
      console.error('[API][maintenance-schedules][DELETE] Acesso negado');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
    }
    const response = await fetch(`${baseUrl}/maintenance-schedules/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[API][maintenance-schedules][DELETE] Erro ao excluir agendamento de manutenção');
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log('[API][maintenance-schedules][DELETE] Agendamento de manutenção excluído com sucesso');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][maintenance-schedules][DELETE] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir agendamento de manutenção' },
      { status: 500 }
    );
  }
} 
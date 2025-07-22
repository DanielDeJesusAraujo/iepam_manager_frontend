import { NextRequest, NextResponse } from 'next/server';
import baseUrl from '@/utils/enviroments';

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const response = await fetch(`${baseUrl}/maintenance-schedules${queryString ? `?${queryString}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('[API][maintenance-schedules][GET] Erro ao buscar agendamentos de manutenção');
      throw new Error('Failed to fetch maintenance schedules');
    }

    const data = await response.json();
    console.log('[API][maintenance-schedules][GET] Agendamentos de manutenção encontrados com sucesso');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][maintenance-schedules][GET] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar agendamentos de manutenção' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('[API][maintenance-schedules][POST] Iniciando request');
  try {
    const body = await request.json();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.warn('[API][maintenance-schedules][POST] Token não fornecido');
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 });
    }
    // Apenas técnicos podem acessar
    const userResponse = await fetch(`${baseUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!userResponse.ok) {
      console.error('[API][maintenance-schedules][POST] Erro ao verificar permissões');
      return NextResponse.json({ error: 'Erro ao verificar permissões' }, { status: 401 });
    }
    const user = await userResponse.json();
    if (user.role !== 'TECHNICIAN') {
      console.error('[API][maintenance-schedules][POST] Acesso negado');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
    const response = await fetch(`${baseUrl}/maintenance-schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[API][maintenance-schedules][POST] Erro ao criar agendamento de manutenção');
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    console.log('[API][maintenance-schedules][POST] Agendamento de manutenção criado com sucesso');
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[API][maintenance-schedules][POST] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao criar agendamento de manutenção' },
      { status: 500 }
    );
  }
} 
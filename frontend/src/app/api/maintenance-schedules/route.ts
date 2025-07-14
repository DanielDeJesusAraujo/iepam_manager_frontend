import { NextRequest, NextResponse } from 'next/server';
import baseUrl from '@/utils/enviroments';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 });
    }
    // Apenas técnicos podem acessar
    const userResponse = await fetch(`${baseUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Erro ao verificar permissões' }, { status: 401 });
    }
    const user = await userResponse.json();
    if (user.role !== 'TECHNICIAN') {
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
      throw new Error('Failed to fetch maintenance schedules');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching maintenance schedules:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar agendamentos de manutenção' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 });
    }
    // Apenas técnicos podem acessar
    const userResponse = await fetch(`${baseUrl}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Erro ao verificar permissões' }, { status: 401 });
    }
    const user = await userResponse.json();
    if (user.role !== 'TECHNICIAN') {
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
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance schedule:', error);
    return NextResponse.json(
      { error: 'Erro ao criar agendamento de manutenção' },
      { status: 500 }
    );
  }
} 
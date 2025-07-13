import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const response = await fetch(`${baseUrl}/maintenance-schedules/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch maintenance schedule');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching maintenance schedule:', error);
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
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating maintenance schedule:', error);
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
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting maintenance schedule:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir agendamento de manutenção' },
      { status: 500 }
    );
  }
} 
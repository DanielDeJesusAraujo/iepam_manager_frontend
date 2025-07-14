import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
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
    const backendRes = await fetch(`${baseUrl}/internal-service-orders?technician_id=${user.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      throw new Error('Erro ao buscar ordens de serviço internas');
    }
    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar ordens de serviço internas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 });
    }
    // Apenas técnicos podem criar
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
      throw new Error(errorData.message || 'Erro ao criar ordem de serviço interna');
    }
    const data = await backendRes.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Erro ao criar ordem de serviço interna' }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server'
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  console.log('[API][orders][upload][POST] Iniciando request');
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      console.warn('[API][orders][upload][POST] Token não fornecido');
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 })
    }

    // Verificar permissão do usuário
    const userResponse = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': authHeader
      }
    });
 
    if (!userResponse.ok) {
      console.error('[API][orders][upload][POST] Erro ao verificar permissões');
      return NextResponse.json({ error: 'Erro ao verificar permissões' }, { status: 401 });
    }

    const user = await userResponse.json();
    if (!['ADMIN', 'MANAGER'].includes(user.role)) {
      console.error('[API][orders][upload][POST] Acesso negado');
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const formData = await req.formData()
    const files = formData.getAll('files')

    if (!files || files.length === 0) {
      console.error('[API][orders][upload][POST] Nenhum arquivo enviado');
      return NextResponse.json(
        { message: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Criar um novo FormData para enviar ao backend
    const backendFormData = new FormData()
    files.forEach((file) => {
      backendFormData.append('files', file)
    })

    const backendRes = await fetch(`${API_URL}/service-orders/upload`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
      body: backendFormData,
    })

    if (!backendRes.ok) {
      console.error('[API][orders][upload][POST] Erro ao fazer upload dos arquivos');
      throw new Error('Erro ao fazer upload dos arquivos')
    }

    const data = await backendRes.json()
    console.log('[API][orders][upload][POST] Upload realizado com sucesso');
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API][orders][upload][POST] Erro:', error)
    return NextResponse.json(
      { message: 'Erro ao fazer upload dos arquivos' },
      { status: 500 }
    )
  }
} 
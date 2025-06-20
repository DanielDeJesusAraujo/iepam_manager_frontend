import { NextRequest, NextResponse } from 'next/server'
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 })
    }

    // Verificar permissão do usuário
    const userResponse = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': authHeader
      }
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Erro ao verificar permissões' }, { status: 401 });
    }

    const user = await userResponse.json();
    if (!['ADMIN', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const formData = await req.formData()
    const files = formData.getAll('files')

    if (!files || files.length === 0) {
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
      throw new Error('Erro ao fazer upload dos arquivos')
    }

    const data = await backendRes.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    return NextResponse.json(
      { message: 'Erro ao fazer upload dos arquivos' },
      { status: 500 }
    )
  }
} 
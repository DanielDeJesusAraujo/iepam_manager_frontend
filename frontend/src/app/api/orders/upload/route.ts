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

    if (backendRes.status === 429) {
      const message = await backendRes.text();
      console.log('[API][orders][upload][POST] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!backendRes.ok) {
      const error = await backendRes.json();
      console.error('[API][orders][upload][POST] Erro ao fazer upload dos arquivos:', error);
      return NextResponse.json(error, { status: backendRes.status });
    }

    const data = await backendRes.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API][orders][upload][POST] Erro:', error)
    return NextResponse.json(
      { message: 'Erro ao fazer upload dos arquivos' },
      { status: 500 }
    )
  }
} 
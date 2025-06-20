import { NextResponse } from 'next/server'

import baseUrl from '@/utils/enviroments';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!baseUrl) {
      return NextResponse.json(
        { message: 'Erro de configuração do servidor' },
        { status: 500 }
      )
    }
    
    const apiUrl = `${baseUrl}/users/sessions`
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Erro ao fazer login' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
} 
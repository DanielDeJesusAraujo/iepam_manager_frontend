import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logout realizado com sucesso' })
    
    // Limpar o cookie de autenticação
    response.cookies.set('@ti-assistant:token', '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date(0), // Define a data de expiração para o passado
      maxAge: 0, // Define maxAge como 0
    })
    
    return response
  } catch (error) {
    console.error('[API][auth][logout][POST] Erro:', error)
    return NextResponse.json(
      { message: 'Erro ao fazer logout' },
      { status: 500 }
    )
  }
} 
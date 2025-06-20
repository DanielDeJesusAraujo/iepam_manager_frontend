import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1]

        if (!token) {
            return new NextResponse('Não autorizado', { status: 401 })
        }

        const response = await fetch(`${API_URL}/auth/session`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao verificar sessão')
        }

        return NextResponse.json(data)
    } catch (error) {
        return new NextResponse('Erro interno do servidor', { status: 500 })
    }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 
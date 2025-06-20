import baseUrl from '@/utils/enviroments'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')
        if (!token) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
        }

        const response = await fetch(`${baseUrl}/locales`, {
            headers: {
                'Authorization': token
            }
        })

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Erro ao buscar locais:', error)
        return NextResponse.json({ error: 'Erro ao buscar locais' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')
        if (!token) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
        }

        const body = await request.json()

        const response = await fetch(`${baseUrl}/locales`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(body)
        })

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Erro ao criar local:', error)
        return NextResponse.json({ error: 'Erro ao criar local' }, { status: 500 })
    }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 
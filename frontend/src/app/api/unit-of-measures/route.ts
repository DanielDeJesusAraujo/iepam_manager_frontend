import baseUrl from '@/utils/enviroments'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        console.log('[API][unit-of-measures][GET] Iniciando request');
        const token = request.headers.get('authorization')?.split(' ')[1]

        if (!token) {
            console.error('[API][unit-of-measures][GET] Token não fornecido');
            return new NextResponse('Não autorizado', { status: 401 })
        }

        const response = await fetch(`${baseUrl}/unit-of-measures`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('[API][unit-of-measures][GET] Erro ao buscar unidades de medida');
            throw new Error(data.message || 'Erro ao buscar unidades de medida')
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('[API][unit-of-measures][GET] Erro ao buscar unidades de medida:', error)
        return new NextResponse('Erro interno do servidor', { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('[API][unit-of-measures][POST] Iniciando request');
        const token = request.headers.get('authorization')?.split(' ')[1]

        if (!token) {
            console.error('[API][unit-of-measures][POST] Token não fornecido');
            return new NextResponse('Não autorizado', { status: 401 })
        }

        const body = await request.json()

        const response = await fetch(`${baseUrl}/unit-of-measures`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('[API][unit-of-measures][POST] Erro ao criar unidade de medida');
            throw new Error(data.message || 'Erro ao criar unidade de medida')
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('[API][unit-of-measures][POST] Erro ao criar unidade de medida:', error)
        return new NextResponse('Erro interno do servidor', { status: 500 })
    }
} 
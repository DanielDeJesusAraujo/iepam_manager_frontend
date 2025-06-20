import baseUrl from '@/utils/enviroments'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.headers.get('authorization')
        if (!token) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
        }

        const response = await fetch(`${baseUrl}/locales/${params.id}`, {
            headers: {
                'Authorization': token
            }
        })

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Erro ao buscar local:', error)
        return NextResponse.json({ error: 'Erro ao buscar local' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.headers.get('authorization')
        if (!token) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
        }

        const body = await request.json()

        const response = await fetch(`${baseUrl}/locales/${params.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(body)
        })

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Erro ao atualizar local:', error)
        return NextResponse.json({ error: 'Erro ao atualizar local' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.headers.get('authorization')
        if (!token) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
        }

        const response = await fetch(`${baseUrl}/locales/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token
            }
        })

        if (!response.ok) {
            throw new Error('Erro ao excluir local')
        }

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Erro ao excluir local:', error)
        return NextResponse.json({ error: 'Erro ao excluir local' }, { status: 500 })
    }
} 
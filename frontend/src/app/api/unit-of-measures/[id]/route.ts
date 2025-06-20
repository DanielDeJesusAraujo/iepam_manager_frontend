import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1]

        if (!token) {
            return new NextResponse('Não autorizado', { status: 401 })
        }

        const body = await request.json()

        const response = await fetch(`${API_URL}/unit-of-measures/${params.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao atualizar unidade de medida')
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Erro ao atualizar unidade de medida:', error)
        return new NextResponse('Erro interno do servidor', { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1]

        if (!token) {
            return new NextResponse('Não autorizado', { status: 401 })
        }

        const response = await fetch(`${API_URL}/unit-of-measures/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || 'Erro ao excluir unidade de medida')
        }

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Erro ao excluir unidade de medida:', error)
        return new NextResponse('Erro interno do servidor', { status: 500 })
    }
} 
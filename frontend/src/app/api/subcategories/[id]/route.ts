import baseUrl from '@/utils/enviroments'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

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

        const response = await fetch(`${baseUrl}/subcategories/${params.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao atualizar subcategoria')
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Erro ao atualizar subcategoria:', error)
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

        const response = await fetch(`${baseUrl}/subcategories/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || 'Erro ao excluir subcategoria')
        }

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Erro ao excluir subcategoria:', error)
        return new NextResponse('Erro interno do servidor', { status: 500 })
    }
} 
import baseUrl from '@/utils/enviroments'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log('[API][unit-of-measures][PUT] Iniciando request');
        const token = request.headers.get('authorization')?.split(' ')[1]

        if (!token) {
            console.error('[API][unit-of-measures][PUT] Token não fornecido');
            return new NextResponse('Não autorizado', { status: 401 })
        }

        const body = await request.json()

        const response = await fetch(`${baseUrl}/unit-of-measures/${params.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('[API][unit-of-measures][PUT] Erro ao atualizar unidade de medida');
            throw new Error(data.message || 'Erro ao atualizar unidade de medida')
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('[API][unit-of-measures][PUT] Erro ao atualizar unidade de medida:', error)
        return new NextResponse('Erro interno do servidor', { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log('[API][unit-of-measures][DELETE] Iniciando request');
        const token = request.headers.get('authorization')?.split(' ')[1]

        if (!token) {
            console.error('[API][unit-of-measures][DELETE] Token não fornecido');
            return new NextResponse('Não autorizado', { status: 401 })
        }

        const response = await fetch(`${baseUrl}/unit-of-measures/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!response.ok) {
            const data = await response.json()
            console.error('[API][unit-of-measures][DELETE] Erro ao excluir unidade de medida');
            throw new Error(data.message || 'Erro ao excluir unidade de medida')
        }

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('[API][unit-of-measures][DELETE] Erro ao excluir unidade de medida:', error)
        return new NextResponse('Erro interno do servidor', { status: 500 })
    }
} 
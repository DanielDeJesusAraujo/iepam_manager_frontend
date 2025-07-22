import baseUrl from '@/utils/enviroments'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][locales][GET] Iniciando request');
    try {
        const token = request.headers.get('authorization')
        if (!token) {
            console.warn('[API][locales][GET] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
        }

        const response = await fetch(`${baseUrl}/locales/${params.id}`, {
            headers: {
                'Authorization': token
            }
        })

        const data = await response.json()
        console.log('[API][locales][GET] Local encontrado com sucesso');
        return NextResponse.json(data)
    } catch (error) {
        console.error('[API][locales][GET] Erro:', error)
        return NextResponse.json({ error: 'Erro ao buscar local' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][locales][PUT] Iniciando request');
    try {
        const token = request.headers.get('authorization')
        if (!token) {
            console.warn('[API][locales][PUT] Token não fornecido');
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
        console.log('[API][locales][PUT] Local atualizado com sucesso');
        return NextResponse.json(data)
    } catch (error) {
        console.error('[API][locales][PUT] Erro:', error)
        return NextResponse.json({ error: 'Erro ao atualizar local' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][locales][DELETE] Iniciando request');
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
            console.error('[API][locales][DELETE] Erro ao excluir local');
            throw new Error('Erro ao excluir local')
        }

        console.log('[API][locales][DELETE] Local excluído com sucesso');
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('[API][locales][DELETE] Erro:', error)
        return NextResponse.json({ error: 'Erro ao excluir local' }, { status: 500 })
    }
} 
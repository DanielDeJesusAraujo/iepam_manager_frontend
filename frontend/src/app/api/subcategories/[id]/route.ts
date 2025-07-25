import baseUrl from '@/utils/enviroments'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][subcategories][PUT] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1]

        if (!token) {
            console.error('[API][subcategories][PUT] Token não fornecido');
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

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][subcategories][PUT] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        const data = await response.json()

        if (!response.ok) {
            console.error('[API][subcategories][PUT] Erro ao atualizar subcategoria');
            throw new Error(data.message || 'Erro ao atualizar subcategoria')
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('[API][subcategories][PUT] Erro ao atualizar subcategoria:', error)
        return new NextResponse('Erro interno do servidor', { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][subcategories][DELETE] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1]

        if (!token) {
            console.error('[API][subcategories][DELETE] Token não fornecido');
            return new NextResponse('Não autorizado', { status: 401 })
        }

        const response = await fetch(`${baseUrl}/subcategories/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][subcategories][DELETE] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            const data = await response.json()
            console.error('[API][subcategories][DELETE] Erro ao excluir subcategoria');
            throw new Error(data.message || 'Erro ao excluir subcategoria')
        }

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('[API][subcategories][DELETE] Erro ao excluir subcategoria:', error)
        return new NextResponse('Erro interno do servidor', { status: 500 })
    }
} 
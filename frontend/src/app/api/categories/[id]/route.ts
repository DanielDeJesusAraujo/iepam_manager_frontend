import baseUrl from '@/utils/enviroments'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][categories][PUT] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1]

        if (!token) {
            console.warn('[API][categories][PUT] Token não fornecido');
            return new NextResponse('Não autorizado', { status: 401 })
        }

        const body = await request.json()

        const response = await fetch(`${baseUrl}/categories/${params.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][categories][PUT] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error('[API][categories][PUT] Erro ao atualizar categoria');
            throw new Error(data.message || 'Erro ao atualizar categoria')
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('[API][categories][PUT] Erro:', error);
        return new NextResponse('Erro interno do servidor', { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][categories][DELETE] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1]

        if (!token) {
            console.warn('[API][categories][DELETE] Token não fornecido');
            return new NextResponse('Não autorizado', { status: 401 })
        }

        const response = await fetch(`${baseUrl}/categories/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][categories][DELETE] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            const data = await response.json()
            console.error('[API][categories][DELETE] Erro ao excluir categoria');
            throw new Error(data.message || 'Erro ao excluir categoria')
        }

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('[API][categories][DELETE] Erro:', error);
        return new NextResponse('Erro interno do servidor', { status: 500 })
    }
} 
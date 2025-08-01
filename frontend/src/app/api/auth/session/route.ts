import baseUrl from '@/utils/enviroments'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1]

        if (!token) {
            return new NextResponse('Não autorizado', { status: 401 })
        }

        const response = await fetch(`${baseUrl}/auth/session`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][auth][session][GET] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

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
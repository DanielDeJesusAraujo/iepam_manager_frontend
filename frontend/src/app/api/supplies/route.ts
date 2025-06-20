import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: Request) {
    try {
        console.log('[[[[[[[[[[[[[[[[[[[[[[[[[[[teste]]]]]]]]]]]]]]]]]]]]]]]]]]]')
        const token = request.headers.get('Authorization')?.split(' ')[1];
        console.log(token)

        if (!token) {
            return NextResponse.json(
                { message: 'Token não fornecido' },
                { status: 401 }
            );
        }

        const response = await fetch(`${API_URL}/supplies`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao carregar suprimentos');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro ao carregar suprimentos:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('authorization');
        if (!token) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${API_URL}/supplies`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar suprimento');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro ao criar suprimento:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao criar suprimento' },
            { status: 500 }
        );
    }
} 
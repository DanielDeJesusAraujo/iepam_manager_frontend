import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subcategories`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar subcategorias');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro ao buscar subcategorias:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar subcategorias' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            return new NextResponse('Não autorizado', { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subcategories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao criar subcategoria');
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro ao criar subcategoria:', error);
        return new NextResponse('Erro interno do servidor', { status: 500 });
    }
} 
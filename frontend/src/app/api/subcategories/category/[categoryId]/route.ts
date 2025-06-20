import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { categoryId: string } }
) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subcategories/category/${params.categoryId}`, {
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
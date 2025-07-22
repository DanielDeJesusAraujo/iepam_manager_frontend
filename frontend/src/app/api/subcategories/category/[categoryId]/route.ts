import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { categoryId: string } }
) {
    try {
        console.log('[API][subcategories][category][GET] Iniciando request');
        const token = request.headers.get('authorization')?.split(' ')[1];
        const response = await fetch(`${baseUrl}/subcategories/category/${params.categoryId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('[API][subcategories][category][GET] Erro ao buscar subcategorias');
            throw new Error('Erro ao buscar subcategorias');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][subcategories][category][GET] Erro ao buscar subcategorias:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar subcategorias' },
            { status: 500 }
        );
    }
} 
import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { message: 'Token não fornecido' },
                { status: 401 }
            );
        }

        // Busca localizações
        const locationsResponse = await fetch(`${baseUrl}/locations`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!locationsResponse.ok) {
            throw new Error('Erro ao buscar localizações');
        }

        const locations = await locationsResponse.json();

        // Busca fornecedores
        const suppliersResponse = await fetch(`${baseUrl}/suppliers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!suppliersResponse.ok) {
            throw new Error('Erro ao buscar fornecedores');
        }

        const suppliers = await suppliersResponse.json();

        // Busca categorias
        const categoriesResponse = await fetch(`${baseUrl}/categories`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!categoriesResponse.ok) {
            throw new Error('Erro ao buscar categorias');
        }

        const categories = await categoriesResponse.json();

        // Busca subcategorias
        const subcategoriesResponse = await fetch(`${baseUrl}/subcategories`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!subcategoriesResponse.ok) {
            throw new Error('Erro ao buscar subcategorias');
        }

        const subcategories = await subcategoriesResponse.json();

        return NextResponse.json({
            locations,
            suppliers,
            categories,
            subcategories,
        });
    } catch (error) {
        console.error('Erro ao buscar dados do formulário:', error);
        return NextResponse.json(
            { message: 'Erro ao buscar dados do formulário' },
            { status: 500 }
        );
    }
} 
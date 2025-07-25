import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
    console.log('[API][inventory][form-data][GET] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            console.warn('[API][inventory][form-data][GET] Token não fornecido');
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
        
        if (locationsResponse.status === 429) {
            const message = await locationsResponse.text();
            console.log('[API][inventory][form-data][GET] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!locationsResponse.ok) {
            console.error('[API][inventory][form-data][GET] Erro ao buscar localizações');
            throw new Error('Erro ao buscar localizações');
        }

        const locations = await locationsResponse.json();

        // Busca fornecedores
        const suppliersResponse = await fetch(`${baseUrl}/suppliers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (suppliersResponse.status === 429) {
            const message = await suppliersResponse.text();
            console.log('[API][inventory][form-data][GET] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!suppliersResponse.ok) {
            console.error('[API][inventory][form-data][GET] Erro ao buscar fornecedores');
            throw new Error('Erro ao buscar fornecedores');
        }

        const suppliers = await suppliersResponse.json();

        // Busca categorias
        const categoriesResponse = await fetch(`${baseUrl}/categories`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (categoriesResponse.status === 429) {
            const message = await categoriesResponse.text();
            console.log('[API][inventory][form-data][GET] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!categoriesResponse.ok) {
            console.error('[API][inventory][form-data][GET] Erro ao buscar categorias');
            throw new Error('Erro ao buscar categorias');
        }

        const categories = await categoriesResponse.json();

        // Busca subcategorias
        const subcategoriesResponse = await fetch(`${baseUrl}/subcategories`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (subcategoriesResponse.status === 429) {
            const message = await subcategoriesResponse.text();
            console.log('[API][inventory][form-data][GET] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!subcategoriesResponse.ok) {
            console.error('[API][inventory][form-data][GET] Erro ao buscar subcategorias');
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
        console.error('[API][inventory][form-data][GET] Erro:', error);
        return NextResponse.json(
            { message: 'Erro ao buscar dados do formulário' },
            { status: 500 }
        );
    }
} 
import { NextRequest, NextResponse } from 'next/server';
import baseUrl from '@/utils/enviroments';

export async function GET(request: NextRequest) {
    console.log('[API][inventory-transactions][GET] Iniciando request');
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.warn('[API][inventory-transactions][GET] Token não fornecido');
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const response = await fetch(`${baseUrl}/inventory-transactions`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('[API][inventory-transactions][GET] Erro ao buscar transações de inventário');
            throw new Error('Erro ao buscar transações de inventário');
        }

        const data = await response.json();
        console.log('[API][inventory-transactions][GET] Transações de inventário encontradas com sucesso');
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API][inventory-transactions][GET] Erro:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 
import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { message: 'Token não fornecido' },
                { status: 401 }
            );
        }

        const response = await fetch(`${baseUrl}/inventory`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('next: Erro ao buscar itens do inventário');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { message: 'next: Erro ao buscar itens do inventário' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        const body = await request.json();

        const response = await fetch(`${baseUrl}/inventory`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'next: Erro ao criar item do inventário');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || 'next: Erro ao criar item do inventário' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        const response = await fetch(`${baseUrl}/inventory/depreciate-all`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('next: Erro ao atualizar depreciação dos itens');
        }
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { message: 'next: Erro ao atualizar depreciação dos itens' },
            { status: 500 }
        );
    }
} 
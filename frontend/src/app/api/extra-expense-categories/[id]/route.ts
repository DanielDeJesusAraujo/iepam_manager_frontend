import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        const body = await request.json();

        if (!token) {
            return NextResponse.json(
                { message: 'Token não fornecido' },
                { status: 401 }
            );
        }

        const response = await fetch(`${baseUrl}/extra-expense-categories/${params.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar categoria de gastos extras');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao atualizar categoria de gastos extras' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { message: 'Token não fornecido' },
                { status: 401 }
            );
        }

        const response = await fetch(`${baseUrl}/extra-expense-categories/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir categoria de gastos extras');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao excluir categoria de gastos extras' },
            { status: 500 }
        );
    }
} 
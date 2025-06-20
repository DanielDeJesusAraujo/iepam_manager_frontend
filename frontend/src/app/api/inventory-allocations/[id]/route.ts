import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const headersList = headers();
        const token = headersList.get('authorization');

        if (!token) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory-allocations/${params.id}`, {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar alocação');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro ao buscar alocação:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar alocação' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const headersList = headers();
        const token = headersList.get('authorization');

        if (!token) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory-allocations/${params.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar alocação');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro ao atualizar alocação:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar alocação' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const headersList = headers();
        const token = headersList.get('authorization');

        if (!token) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory-allocations/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir alocação');
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Erro ao excluir alocação:', error);
        return NextResponse.json(
            { error: 'Erro ao excluir alocação' },
            { status: 500 }
        );
    }
} 
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function PATCH(
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory-allocations/${params.id}/delivery-confirmation`, {
            method: 'PATCH',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error('Erro ao confirmar entrega');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro ao confirmar entrega:', error);
        return NextResponse.json(
            { error: 'Erro ao confirmar entrega' },
            { status: 500 }
        );
    }
} 
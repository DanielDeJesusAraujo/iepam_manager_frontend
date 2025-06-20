import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];
        const { status } = await request.json();

        if (!token) {
            return NextResponse.json(
                { message: 'Não autorizado' },
                { status: 401 }
            );
        }

        const response = await fetch(`${baseUrl}/custom-supply-requests/${params.id}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { message: errorData.message || 'Erro ao atualizar status da requisição' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro ao atualizar status da requisição:', error);
        return NextResponse.json(
            { message: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 
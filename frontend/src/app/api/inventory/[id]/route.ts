import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
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
  
      const response = await fetch(`${baseUrl}/inventory/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Erro ao buscar detalhes do item do inventário');
      }
  
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json(
        { message: 'Erro ao buscar detalhes do item do inventário' },
        { status: 500 }
      );
    }
  }

export async function PUT(
    request: Request,
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

        const response = await fetch(`${baseUrl}/inventory/${params.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar item do inventário');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao atualizar item do inventário' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
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

        const response = await fetch(`${baseUrl}/inventory/${params.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir item do inventário');
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao excluir item do inventário' },
            { status: 500 }
        );
    }
} 
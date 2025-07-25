import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    console.log(`[API][inventory/${params.id}][GET] Iniciando request`);
    try {
      const token = request.headers.get('authorization')?.split(' ')[1];
  
      if (!token) {
        console.warn(`[API][inventory/${params.id}][GET] Token não fornecido`);
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
  
      if (response.status === 429) {
        const message = await response.text();
        console.log('[API][inventory][GET] Rate limit exceeded', message);
        return NextResponse.json(
          { error: 'Rate limit exceeded', details: message },
          { status: 429 }
        );
      }

      if (!response.ok) {
        console.error(`[API][inventory/${params.id}][GET] Erro ao buscar detalhes do item`);
        throw new Error('Erro ao buscar detalhes do item do inventário');
      }
  
      const data = await response.json();
      console.log(`[API][inventory/${params.id}][GET] Sucesso`);
      return NextResponse.json(data);
    } catch (error) {
      console.error(`[API][inventory/${params.id}][GET] Erro:`, error);
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
    console.log(`[API][inventory/${params.id}][PUT] Iniciando request`);
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        const body = await request.json();

        if (!token) {
            console.warn(`[API][inventory/${params.id}][PUT] Token não fornecido`);
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

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][inventory][PUT] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error(`[API][inventory/${params.id}][PUT] Erro ao atualizar item`);
            throw new Error('Erro ao atualizar item do inventário');
        }

        const data = await response.json();
        console.log(`[API][inventory/${params.id}][PUT] Sucesso`);
        return NextResponse.json(data);
    } catch (error) {
        console.error(`[API][inventory/${params.id}][PUT] Erro:`, error);
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
    console.log(`[API][inventory/${params.id}][DELETE] Iniciando request`);
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];

        if (!token) {
            console.warn(`[API][inventory/${params.id}][DELETE] Token não fornecido`);
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

        if (response.status === 429) {
            const message = await response.text();
            console.log('[API][inventory][DELETE] Rate limit exceeded', message);
            return NextResponse.json(
                { error: 'Rate limit exceeded', details: message },
                { status: 429 }
            );
        }

        if (!response.ok) {
            console.error(`[API][inventory/${params.id}][DELETE] Erro ao excluir item`);
            throw new Error('Erro ao excluir item do inventário');
        }

        console.log(`[API][inventory/${params.id}][DELETE] Sucesso`);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`[API][inventory/${params.id}][DELETE] Erro:`, error);
        return NextResponse.json(
            { message: 'Erro ao excluir item do inventário' },
            { status: 500 }
        );
    }
} 
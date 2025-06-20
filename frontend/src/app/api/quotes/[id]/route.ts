import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.error('Erro: Token não fornecido');
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotes/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });


    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro do backend:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Erro ao buscar cotação' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar cotação' },
      { status: 500 }
    );
  }
} 
import baseUrl from '@/utils/enviroments';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('[API][quotes][GET] Iniciando request');
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const created_by = searchParams.get('created_by');

  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.warn('[API][quotes][GET] Token não fornecido');
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (created_by) params.append('created_by', created_by);

    const response = await fetch(`${baseUrl}/quotes?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][quotes][GET] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      console.error('[API][quotes][GET] Erro ao buscar cotações');
      throw new Error('Erro ao buscar cotações');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API][quotes][GET] Erro ao buscar cotações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cotações' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log('[API][quotes][POST] Iniciando request');
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.warn('[API][quotes][POST] Token não fornecido');
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    // Validação dos dados
    if (!body.supplier_id) {
      console.error('[API][quotes][POST] ID do fornecedor é obrigatório');
      return NextResponse.json(
        { error: 'ID do fornecedor é obrigatório' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      console.error('[API][quotes][POST] A cotação deve ter pelo menos um item');
      return NextResponse.json(
        { error: 'A cotação deve ter pelo menos um item' },
        { status: 400 }
      );
    }

    // Validação dos itens
    for (const item of body.items) {
      if (!item.product_name) {
        console.error('[API][quotes][POST] Nome do produto é obrigatório');
        return NextResponse.json(
          { error: 'Nome do produto é obrigatório' },
          { status: 400 }
        );
      }
      if (!item.quantity || item.quantity <= 0) {
        console.error('[API][quotes][POST] Quantidade deve ser maior que zero');
        return NextResponse.json(
          { error: 'Quantidade deve ser maior que zero' },
          { status: 400 }
        );
      }
      if (!item.unit_price || item.unit_price < 0) {
        console.error('[API][quotes][POST] Preço unitário deve ser maior ou igual a zero');
        return NextResponse.json(
          { error: 'Preço unitário deve ser maior ou igual a zero' },
          { status: 400 }
        );
      }
      if (item.link && !isValidUrl(item.link)) {
        console.error('[API][quotes][POST] Link do produto inválido');
        return NextResponse.json(
          { error: 'Link do produto inválido' },
          { status: 400 }
        );
      }
    }

    const payload = {
      supplier: body.supplier_id,
      items: body.items.map((item: any) => ({
        product_name: item.product_name,
        manufacturer: item.manufacturer || 'Não especificado',
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total_price: Number(item.quantity) * Number(item.unit_price),
        final_price: Number(item.quantity) * Number(item.unit_price),
        link: item.link || null,
        notes: item.notes || null
      })),
      notes: body.notes || null,
      total_value: Number(body.total_value)
    };
    console.log('[API][quotes][POST] Payload ok');
    // Busca o nome do fornecedor
    const supplierResponse = await fetch(`${baseUrl}/suppliers/${body.supplier_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (supplierResponse.status === 429) {
      const message = await supplierResponse.text();
      console.log('[API][quotes][POST] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!supplierResponse.ok) {
      console.error('[API][quotes][POST] Erro ao buscar dados do fornecedor');
      throw new Error('Erro ao buscar dados do fornecedor');
    }

    const supplierData = await supplierResponse.json();
    payload.supplier = supplierData.name;
    console.log('[API][quotes][POST] Fornecedor encontrado com sucesso');
    const response = await fetch(`${baseUrl}/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 429) {
      const message = await response.text();
      console.log('[API][quotes][POST] Rate limit exceeded', message);
      return NextResponse.json(
        { error: 'Rate limit exceeded', details: message },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[API][quotes][POST] Erro do backend:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Erro ao criar cotação' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API][quotes][POST] Erro ao criar cotação:', error);
    console.error('[API][quotes][POST] Stack trace:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar cotação' },
      { status: 500 }
    );
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
} 
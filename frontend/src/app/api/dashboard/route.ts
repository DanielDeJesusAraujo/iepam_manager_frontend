import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1]

        if (!token) {
            return NextResponse.json(
                { message: 'Token não fornecido' },
                { status: 401 }
            )
        }

        // Busca dados de inventário
        const inventoryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const inventory = await inventoryResponse.json()

        // Busca dados de ordens de serviço
        const serviceOrdersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/service-orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const serviceOrders = await serviceOrdersResponse.json()

        // Busca dados de alertas
        const alertsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const alertsData = await alertsResponse.json()

        // Busca dados de fornecedores
        const suppliersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const suppliers = await suppliersResponse.json()

        // Busca dados de cotações
        const quotesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quotes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const quotes = await quotesResponse.json()

        // Busca dados de requisições de suprimentos
        const supplyRequestsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/supply-requests`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const supplyRequests = await supplyRequestsResponse.json()

        // Garante que alerts é um array
        const alerts = Array.isArray(alertsData) ? alertsData : []

        // Processa os dados de tendência de consumo
        const consumptionTrends = processConsumptionTrends(supplyRequests)

        // Calcula estatísticas
        const stats = {
            totalInventory: Array.isArray(inventory) ? inventory.length : 0,
            totalInventoryValue: Array.isArray(inventory) ? inventory.reduce((total: number, item: any) => total + (item.acquisition_price || 0), 0) : 0,
            totalServiceOrders: Array.isArray(serviceOrders) ? serviceOrders.length : 0,
            totalServiceOrdersValue: Array.isArray(serviceOrders) ? serviceOrders.reduce((total: number, order: any) => total + (order.total_price || 0), 0) : 0,
            openServiceOrders: Array.isArray(serviceOrders) ? serviceOrders.filter((so: any) => !so.exit_date).length : 0,
            criticalAlerts: alerts.filter((a: any) => a.danger_level === 'ALTO').length,
            consumptionTrends,
            totalSuppliers: Array.isArray(suppliers) ? suppliers.length : 0,
            totalQuotes: Array.isArray(quotes) ? quotes.length : 0,
            pendingQuotes: Array.isArray(quotes) ? quotes.filter((q: any) => q.status === 'PENDENTE').length : 0,
            totalSupplyRequests: Array.isArray(supplyRequests) ? supplyRequests.length : 0,
            pendingSupplyRequests: Array.isArray(supplyRequests) ? supplyRequests.filter((sr: any) => sr.status === 'PENDENTE').length : 0,
        }

        return NextResponse.json({
            stats,
            recentAlerts: alerts.slice(0, 5), // 5 alertas mais recentes
            recentServiceOrders: Array.isArray(serviceOrders) ? serviceOrders.slice(0, 5) : [], // 5 OS mais recentes
        })
    } catch (error) {
        return NextResponse.json(
            { message: 'Erro ao buscar dados da dashboard' },
            { status: 500 }
        )
    }
}

function processConsumptionTrends(supplyRequests: any[]) {
    if (!Array.isArray(supplyRequests)) return [];

    // Agrupa as requisições por mês
    const monthlyConsumption = supplyRequests.reduce((acc: { [key: string]: number }, request: any) => {
        if (request.status === 'APPROVED') {
            const date = new Date(request.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            acc[monthKey] = (acc[monthKey] || 0) + request.quantity;
        }
        return acc;
    }, {});

    // Converte para o formato esperado pelo gráfico
    return Object.entries(monthlyConsumption)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, quantity]) => ({
            date,
            quantity,
        }));
} 
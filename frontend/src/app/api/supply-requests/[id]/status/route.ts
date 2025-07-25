import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import baseUrl from '@/utils/enviroments';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('[API][supply-requests][status][PATCH] Iniciando request');
    const session = await getServerSession(authOptions);

    if (!session) {
        console.error('[API][supply-requests][status][PATCH] Token não fornecido');
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = session.user as any;
    if (!['ADMIN', 'MANAGER', 'ORGANIZER'].includes(user.role)) {
        console.error('[API][supply-requests][status][PATCH] Acesso negado');
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { status } = body;

        if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
            console.error('[API][supply-requests][status][PATCH] Status inválido');
            return NextResponse.json(
                { error: 'Status inválido' },
                { status: 400 }
            );
        }

        const response = await fetch(`${baseUrl}/supply-requests/${params.id}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${session.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[API][supply-requests][status][PATCH] Erro ao atualizar status');
            throw new Error(data.message || 'Erro ao atualizar status');
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API][supply-requests][status][PATCH] Erro ao atualizar status:', error);
        return NextResponse.json(
            { error: error.message || 'Erro interno do servidor' },
            { status: 500 }
        );
    }
} 
import baseUrl from '@/utils/enviroments';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Senha atual e nova senha são obrigatórias' }, { status: 400 });
        }

        const response = await fetch(`${baseUrl}/users/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (!response.ok) {
            const data = await response.json();
            return NextResponse.json({ error: data.message || 'Erro ao alterar senha' }, { status: response.status });
        }

        return NextResponse.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao alterar senha' }, { status: 500 });
    }
} 
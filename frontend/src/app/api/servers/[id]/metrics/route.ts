import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { message: 'Token não fornecido' },
        { status: 401 }
      )
    }

    // Simulando dados de métricas (em um sistema real, isso viria do backend)
    const metrics = {
      cpu: [
        { time: '00:00', value: 45 },
        { time: '01:00', value: 50 },
        { time: '02:00', value: 55 },
        { time: '03:00', value: 60 },
        { time: '04:00', value: 65 },
        { time: '05:00', value: 70 },
        { time: '06:00', value: 75 },
        { time: '07:00', value: 80 },
        { time: '08:00', value: 85 },
        { time: '09:00', value: 90 },
        { time: '10:00', value: 85 },
        { time: '11:00', value: 80 },
      ],
      memory: [
        { time: '00:00', value: 30 },
        { time: '01:00', value: 35 },
        { time: '02:00', value: 40 },
        { time: '03:00', value: 45 },
        { time: '04:00', value: 50 },
        { time: '05:00', value: 55 },
        { time: '06:00', value: 60 },
        { time: '07:00', value: 65 },
        { time: '08:00', value: 70 },
        { time: '09:00', value: 75 },
        { time: '10:00', value: 70 },
        { time: '11:00', value: 65 },
      ],
      disk: [
        { time: '00:00', value: 40 },
        { time: '01:00', value: 45 },
        { time: '02:00', value: 50 },
        { time: '03:00', value: 55 },
        { time: '04:00', value: 60 },
        { time: '05:00', value: 65 },
        { time: '06:00', value: 70 },
        { time: '07:00', value: 75 },
        { time: '08:00', value: 80 },
        { time: '09:00', value: 85 },
        { time: '10:00', value: 80 },
        { time: '11:00', value: 75 },
      ],
      network: [
        { time: '00:00', value: 20 },
        { time: '01:00', value: 25 },
        { time: '02:00', value: 30 },
        { time: '03:00', value: 35 },
        { time: '04:00', value: 40 },
        { time: '05:00', value: 45 },
        { time: '06:00', value: 50 },
        { time: '07:00', value: 55 },
        { time: '08:00', value: 60 },
        { time: '09:00', value: 65 },
        { time: '10:00', value: 60 },
        { time: '11:00', value: 55 },
      ]
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
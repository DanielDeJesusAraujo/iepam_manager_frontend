"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Flex,
  VStack,
  HStack,
  Badge,
  Button,
} from '@chakra-ui/react';

interface InternalServiceOrder {
  id: string;
  title: string;
  description?: string;
  technician_id: string;
  inventory_id?: string;
  location_id?: string;
  sector_id?: string;
  start_date: string;
  end_date?: string;
  time_spent_hours: number;
  type: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  technician?: { name: string };
  inventory?: { name: string };
  location?: { name: string };
  sector?: { name: string };
}

export default function InternalServiceOrderDetailsPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<InternalServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setError(null);
        setLoading(true);
        const token = localStorage.getItem('@ti-assistant:token');
        if (!token) {
          router.push('/login');
          return;
        }
        const res = await fetch(`/api/internal-service-orders/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Erro ao buscar ordem de serviço interna');
        }
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar ordem de serviço interna');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.id, router]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  if (!order) {
    return <Text>Ordem de serviço interna não encontrada.</Text>;
  }

  return (
    <Box p={8}>
      <Button mb={4} onClick={() => router.back()} colorScheme="gray">Voltar</Button>
      <Heading size="lg" mb={4}>{order.title}</Heading>
      <VStack align="start" spacing={3}>
        <HStack><Text fontWeight="bold">Técnico:</Text><Text>{order.technician?.name || '-'}</Text></HStack>
        <HStack><Text fontWeight="bold">Início:</Text><Text>{order.start_date ? new Date(order.start_date).toLocaleString('pt-BR') : '-'}</Text></HStack>
        <HStack><Text fontWeight="bold">Fim:</Text><Text>{order.end_date ? new Date(order.end_date).toLocaleString('pt-BR') : '-'}</Text></HStack>
        <HStack><Text fontWeight="bold">Tipo:</Text><Text>{order.type}</Text></HStack>
        <HStack><Text fontWeight="bold">Setor:</Text><Text>{order.sector?.name || '-'}</Text></HStack>
        <HStack><Text fontWeight="bold">Local:</Text><Text>{order.location?.name || '-'}</Text></HStack>
        <HStack><Text fontWeight="bold">Tempo gasto (h):</Text><Text>{order.time_spent_hours}</Text></HStack>
        <HStack><Text fontWeight="bold">Equipamento:</Text><Text>{order.inventory?.name || '-'}</Text></HStack>
        <HStack><Text fontWeight="bold">Descrição:</Text><Text>{order.description || '-'}</Text></HStack>
        <HStack><Text fontWeight="bold">Observações:</Text><Text>{order.notes || '-'}</Text></HStack>
        <HStack><Text fontWeight="bold">Criado em:</Text><Text>{new Date(order.created_at).toLocaleString('pt-BR')}</Text></HStack>
        <HStack><Text fontWeight="bold">Atualizado em:</Text><Text>{new Date(order.updated_at).toLocaleString('pt-BR')}</Text></HStack>
      </VStack>
    </Box>
  );
} 
"use client"

import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Flex,
  Text,
  Badge,
  useToast,
  Button,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

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

export default function InternalServiceOrdersPage() {
  const [orders, setOrders] = useState<InternalServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError(null);
        setLoading(true);
        const token = localStorage.getItem('@ti-assistant:token');
        if (!token) {
          router.push('/');
          return;
        }
        const res = await fetch('/api/internal-service-orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.status === 429) {
          router.push('/rate-limit')
          return
        }

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Erro ao buscar ordens de serviço internas');
        }
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar ordens de serviço internas');
        toast({
          title: 'Erro',
          description: err.message || 'Erro ao buscar ordens de serviço internas',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [toast, router]);

  return (
    <Box p={8}>
      <Heading size="lg" mb={6}>Ordens de Serviço Internas (Técnicos)</Heading>
      <Button
        leftIcon={<Plus size={18} />}
        colorScheme="blue"
        mb={4}
        onClick={() => router.push('/internal-service-orders/new')}
      >
        Nova OS Interna
      </Button>
      {loading ? (
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" />
        </Flex>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Título</Th>
              <Th>Técnico</Th>
              <Th>Início</Th>
              <Th>Fim</Th>
              <Th>Tipo</Th>
              <Th>Setor</Th>
              <Th>Local</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map(order => (
              <Tr key={order.id}>
                <Td>{order.title}</Td>
                <Td>{order.technician?.name || '-'}</Td>
                <Td>{order.start_date ? new Date(order.start_date).toLocaleString('pt-BR') : '-'}</Td>
                <Td>{order.end_date ? new Date(order.end_date).toLocaleString('pt-BR') : '-'}</Td>
                <Td>{order.type}</Td>
                <Td>{order.sector?.name || '-'}</Td>
                <Td>{order.location?.name || '-'}</Td>
                <Td>
                  <Button size="sm" colorScheme="blue" onClick={() => router.push(`/internal-service-orders/${order.id}`)}>
                    Detalhes
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
} 
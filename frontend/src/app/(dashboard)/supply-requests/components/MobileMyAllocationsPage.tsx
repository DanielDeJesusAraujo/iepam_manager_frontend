import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Spinner,
  useToast,
  Image,
  Flex,
} from '@chakra-ui/react';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AllocationRequest {
  id: string;
  inventory: {
    id: string;
    name: string;
    model: string;
    serial_number: string;
  };
  destination: string;
  notes: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED' | 'RETURNED';
  created_at: string;
  return_date: string;
  requester_delivery_confirmation: boolean;
  manager_delivery_confirmation: boolean;
}

export function MobileMyAllocationsPage() {
  const [allocations, setAllocations] = useState<AllocationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchAllocations();
  }, []);

  const fetchAllocations = async () => {
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) {
        router.push('/login');
        return;
      }
      const response = await fetch('/api/inventory-allocations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao carregar alocações');
      const data = await response.json();
      setAllocations(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao carregar alocações',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async (allocationId: string) => {
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) {
        router.push('/login');
        return;
      }
      const response = await fetch(`/api/inventory-allocations/${allocationId}/delivery-confirmation`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirmation: true })
      });
      if (!response.ok) throw new Error('Erro ao confirmar entrega');
      toast({
        title: 'Sucesso',
        description: 'Entrega confirmada com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchAllocations();
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao confirmar entrega',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (allocations.length === 0) {
    return (
      <VStack spacing={4} py={8} align="center">
        <Image src="/Task-complete.svg" alt="Nenhuma alocação encontrada" maxW="200px" mb={2} />
        <Text color="gray.500" fontSize="lg">Nenhuma alocação encontrada</Text>
      </VStack>
    );
  }

  // Ordenar: pendentes de confirmação do requerente primeiro
  const sortedAllocations = [...allocations].sort((a, b) => {
    const aPending = a.status === 'APPROVED' && !a.requester_delivery_confirmation;
    const bPending = b.status === 'APPROVED' && !b.requester_delivery_confirmation;
    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;
    return 0;
  });

  return (
    <VStack spacing={4} align="stretch">
      {sortedAllocations.map((allocation) => (
        <Card key={allocation.id} variant="outline">
          <CardBody>
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <Text fontWeight="bold">{allocation.inventory.name}</Text>
                <Badge colorScheme={
                  allocation.status === 'APPROVED' ? 'green'
                  : allocation.status === 'REJECTED' ? 'red'
                  : allocation.status === 'DELIVERED' ? 'purple'
                  : allocation.status === 'RETURNED' ? 'blue'
                  : 'yellow'
                }>
                  {allocation.status === 'PENDING' ? 'Pendente'
                    : allocation.status === 'APPROVED' ? 'Aprovado'
                    : allocation.status === 'REJECTED' ? 'Rejeitado'
                    : allocation.status === 'DELIVERED' ? 'Entregue'
                    : 'Devolvido'}
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.500">Modelo: {allocation.inventory.model}</Text>
              <Text fontSize="sm" color="gray.500">Nº Série: {allocation.inventory.serial_number}</Text>
              <Text fontSize="sm" color="gray.500">Destino: {allocation.destination}</Text>
              <Text fontSize="sm" color="gray.500">Retorno: {new Date(allocation.return_date).toLocaleDateString('pt-BR')}</Text>
              <HStack>
                <Badge colorScheme={allocation.requester_delivery_confirmation ? 'green' : 'gray'}>
                  Requerente: {allocation.requester_delivery_confirmation ? 'Confirmado' : 'Pendente'}
                </Badge>
                <Badge colorScheme={allocation.manager_delivery_confirmation ? 'green' : 'gray'}>
                  Gerente: {allocation.manager_delivery_confirmation ? 'Confirmado' : 'Pendente'}
                </Badge>
              </HStack>
              {allocation.status === 'APPROVED' && !allocation.requester_delivery_confirmation && (
                <Button
                  leftIcon={<CheckCircle />}
                  colorScheme="blue"
                  size="sm"
                  onClick={() => handleConfirmDelivery(allocation.id)}
                >
                  Confirmar Recebimento
                </Button>
              )}
            </VStack>
          </CardBody>
        </Card>
      ))}
    </VStack>
  );
} 
import { useEffect, useState } from 'react';
import {
  VStack,
  Spinner,
  useToast,
  Image,
  Flex,
  Text
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { ReturnItemModal } from '@/app/(dashboard)/supply-requests/components/ReturnItemModal';
import { AllocationCard } from '@/app/(dashboard)/supply-requests/components/AllocationCard';

interface AllocationRequest {
  id: string;
  inventory: {
    id: string;
    name: string;
    model: string;
    serial_number: string;
  };
  destination: string;
  destination_name?: string;
  destination_id?: string;
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
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returningAllocation, setReturningAllocation] = useState<AllocationRequest | null>(null);

  useEffect(() => {
    fetchAllocations();
  }, []);

  const fetchAllocations = async () => {
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) {
        router.push('/');
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

  const handleReturnItem = async (notes: string) => {
    if (!returningAllocation) return;
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) throw new Error('Token não encontrado');
      const response = await fetch(`/api/inventory-allocations/${returningAllocation.id}/return`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ return_notes: notes })
      });
      if (!response.ok) throw new Error('Erro ao devolver item');
      toast({ title: 'Sucesso', description: 'Item devolvido com sucesso', status: 'success', duration: 3000, isClosable: true });
      fetchAllocations();
    } catch (error) {
      throw error;
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
        <AllocationCard
          key={allocation.id}
          allocation={allocation}
          onConfirmDelivery={handleConfirmDelivery}
          onReturnItem={(allocation) => {
            setReturningAllocation(allocation);
            setReturnModalOpen(true);
          }}
        />
      ))}
      <ReturnItemModal
        isOpen={returnModalOpen}
        onClose={() => {
          setReturnModalOpen(false);
          setReturningAllocation(null);
        }}
        onConfirm={handleReturnItem}
        title="Devolver Item"
        itemName={returningAllocation ? `${returningAllocation.inventory.name} - ${returningAllocation.inventory.model}` : undefined}
      />
    </VStack>
  );
} 
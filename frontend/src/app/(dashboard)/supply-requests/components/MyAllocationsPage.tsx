'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  Image,
  useColorModeValue,
  Button,
  useToast,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  useDisclosure,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AllocationRequest {
  id: string;
  inventory: {
    id: string;
    name: string;
    description: string;
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

export function MyAllocationsPage() {
  const [allocations, setAllocations] = useState<AllocationRequest[]>([]);
  const [filteredAllocations, setFilteredAllocations] = useState<AllocationRequest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnNotes, setReturnNotes] = useState('');
  const [returningId, setReturningId] = useState<string | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    fetchAllocations();
  }, []);

  useEffect(() => {
    if (search || statusFilter) {
      const filtered = allocations.filter(allocation => {
        const matchesSearch =
          allocation.inventory.name.toLowerCase().includes(search.toLowerCase()) ||
          allocation.inventory.model.toLowerCase().includes(search.toLowerCase()) ||
          allocation.inventory.serial_number.toLowerCase().includes(search.toLowerCase()) ||
          allocation.destination.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || allocation.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
      setFilteredAllocations(filtered);
    } else {
      setFilteredAllocations(allocations);
    }
  }, [search, statusFilter, allocations]);

  const fetchAllocations = async () => {
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/inventory-allocations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar alocações');
      }

      const data = await response.json();
      setAllocations(data);
      setFilteredAllocations(data);
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
        router.push('/');
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

      if (!response.ok) {
        throw new Error('Erro ao confirmar entrega');
      }

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

  const handleReturnItem = async () => {
    if (!returningId) return;
    setIsReturning(true);
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) throw new Error('Token não encontrado');
      const response = await fetch(`/api/inventory-allocations/${returningId}/return`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ return_notes: returnNotes })
      });
      if (!response.ok) throw new Error('Erro ao devolver item');
      toast({ title: 'Sucesso', description: 'Item devolvido com sucesso', status: 'success', duration: 3000, isClosable: true });
      setReturnModalOpen(false);
      setReturnNotes('');
      setReturningId(null);
      fetchAllocations();
    } catch (error) {
      toast({ title: 'Erro', description: error instanceof Error ? error.message : 'Erro ao devolver item', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsReturning(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Card bg={bgColor} borderColor={borderColor}>
      <CardBody>
        <Flex gap={4} mb={6} justify="space-between">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar por item ou destino..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <Select
            placeholder="Filtrar por status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            maxW="200px"
          >
            <option value="">Todos</option>
            <option value="PENDING">Pendente</option>
            <option value="APPROVED">Aprovado</option>
            <option value="REJECTED">Rejeitado</option>
            <option value="DELIVERED">Entregue</option>
            <option value="RETURNED">Devolvido</option>
          </Select>
        </Flex>

        {filteredAllocations.length === 0 ? (
          <Flex direction="column" align="center" justify="center" py={8}>
            <Image
              src="/Task-complete.svg"
              alt="Nenhuma alocação encontrada"
              maxW="300px"
              mb={4}
            />
            <Text color="gray.500" fontSize="lg">
              Nenhuma alocação encontrada
            </Text>
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Item</Th>
                  <Th>Modelo</Th>
                  <Th>Número de Série</Th>
                  <Th>Destino</Th>
                  <Th>Status</Th>
                  <Th>Data de Retorno</Th>
                  <Th>Confirmações</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAllocations.map((allocation) => (
                  <Tr key={allocation.id}>
                    <Td>{allocation.inventory.name}</Td>
                    <Td>{allocation.inventory.model}</Td>
                    <Td>{allocation.inventory.serial_number}</Td>
                    <Td>
                      <Text fontSize="sm" color="gray.500">
                        Destino: {allocation.destination_name || allocation.destination}
                      </Text>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          allocation.status === 'APPROVED'
                            ? 'green'
                            : allocation.status === 'REJECTED'
                              ? 'red'
                              : allocation.status === 'DELIVERED'
                                ? 'purple'
                                : allocation.status === 'RETURNED'
                                  ? 'blue'
                                  : 'yellow'
                        }
                      >
                        {allocation.status === 'PENDING'
                          ? 'Pendente'
                          : allocation.status === 'APPROVED'
                            ? 'Aprovado'
                            : allocation.status === 'REJECTED'
                              ? 'Rejeitado'
                              : allocation.status === 'DELIVERED'
                                ? 'Entregue'
                                : 'Devolvido'}
                      </Badge>
                    </Td>
                    <Td>{allocation.return_date ? new Date(allocation.return_date).toLocaleDateString('pt-BR') : 'Não definida'}</Td>
                    <Td>
                      <Flex direction="column" gap={2}>
                        <Badge colorScheme={allocation.requester_delivery_confirmation ? 'green' : 'gray'}>
                          Requerente: {allocation.requester_delivery_confirmation ? 'Confirmado' : 'Pendente'}
                        </Badge>
                        <Badge colorScheme={allocation.manager_delivery_confirmation ? 'green' : 'gray'}>
                          Gerente: {allocation.manager_delivery_confirmation ? 'Confirmado' : 'Pendente'}
                        </Badge>
                      </Flex>
                    </Td>
                    <Td>
                      {allocation.status === 'APPROVED' && !allocation.requester_delivery_confirmation && (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          leftIcon={<CheckCircle />}
                          onClick={() => handleConfirmDelivery(allocation.id)}
                        >
                          Confirmar Recebimento
                        </Button>
                      )}
                      {allocation.status === 'DELIVERED' && (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => { setReturningId(allocation.id); setReturnModalOpen(true); }}
                          isDisabled={allocation.status !== 'DELIVERED'}
                          hidden={allocation.status !== 'DELIVERED'}
                        >
                          Devolver Item
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </CardBody>
      <Modal isOpen={returnModalOpen} onClose={() => setReturnModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Devolver Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Observações (opcional)</FormLabel>
              <Textarea value={returnNotes} onChange={e => setReturnNotes(e.target.value)} placeholder="Descreva o motivo ou detalhes da devolução..." />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleReturnItem} isLoading={isReturning}>Confirmar Devolução</Button>
            <Button variant="ghost" onClick={() => setReturnModalOpen(false)}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
} 
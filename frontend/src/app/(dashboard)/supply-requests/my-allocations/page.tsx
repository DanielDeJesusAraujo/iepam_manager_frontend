"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Spinner,
  VStack,
  Text,
  Badge,
  HStack,
  useToast,
  IconButton,
  Button,
  Card,
  CardBody,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

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
  notes: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED' | 'RETURNED';
  created_at: string;
  return_date: string;
  requester_delivery_confirmation: boolean;
  manager_delivery_confirmation: boolean;
}

export default function MyAllocationsPage() {
  const [allocations, setAllocations] = useState<AllocationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const router = useRouter();
  const colorMode = useColorModeValue('light', 'dark');

  const loadAllocations = async () => {
    try {
      const token = localStorage.getItem("@ti-assistant:token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch('/api/inventory-allocations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar alocações');
      }

      const data = await response.json();
      setAllocations(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao buscar alocações",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllocations();
  }, [router, toast]);

  const handleConfirmDelivery = async (allocationId: string) => {
    try {
      const token = localStorage.getItem("@ti-assistant:token");
      if (!token) {
        router.push("/login");
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
        title: "Sucesso",
        description: "Entrega confirmada com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      loadAllocations();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao confirmar entrega",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4} maxW="md" mx="auto">
      <HStack mb={4}>
        <IconButton
          aria-label="Voltar"
          icon={<ArrowLeft />}
          variant="ghost"
          onClick={() => router.back()}
        />
        <Heading size="md">Minhas Alocações</Heading>
      </HStack>
      {loading ? (
        <Spinner size="lg" />
      ) : allocations.length === 0 ? (
        <Text>Nenhuma alocação encontrada.</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {allocations.map((allocation) => (
            <Card
              key={allocation.id}
              variant="outline"
              _hover={{
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold">{allocation.inventory.name}</Text>
                    <Badge colorScheme={
                      allocation.status === "DELIVERED"
                        ? "green"
                        : allocation.status === "APPROVED"
                          ? "blue"
                          : allocation.status === "REJECTED"
                            ? "red"
                            : allocation.status === "RETURNED"
                              ? "purple"
                              : "yellow"
                    }>
                      {allocation.status === "PENDING"
                        ? "Pendente"
                        : allocation.status === "APPROVED"
                          ? "Aprovado"
                          : allocation.status === "REJECTED"
                            ? "Rejeitado"
                            : allocation.status === "DELIVERED"
                              ? "Entregue"
                              : "Devolvido"}
                    </Badge>
                  </HStack>

                  <Text fontSize="sm" color="gray.500">
                    {allocation.inventory.description}
                  </Text>

                  <HStack justify="space-between">
                    <Text fontSize="sm">
                      Modelo: {allocation.inventory.model}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Série: {allocation.inventory.serial_number}
                    </Text>
                  </HStack>

                  <Text fontSize="sm" color="gray.500">
                    Destino: {allocation.destination}
                  </Text>

                  <Text fontSize="sm" color="gray.500">
                    Data de Retorno: {new Date(allocation.return_date).toLocaleDateString('pt-BR')}
                  </Text>

                  <Divider />

                  <VStack spacing={2} align="start">
                    <HStack>
                      <Text fontSize="sm">Requerente:</Text>
                      <Badge colorScheme={allocation.requester_delivery_confirmation ? 'green' : 'gray'}>
                        {allocation.requester_delivery_confirmation ? 'Confirmado' : 'Pendente'}
                      </Badge>
                    </HStack>
                    <HStack>
                      <Text fontSize="sm">Gerente:</Text>
                      <Badge colorScheme={allocation.manager_delivery_confirmation ? 'green' : 'gray'}>
                        {allocation.manager_delivery_confirmation ? 'Confirmado' : 'Pendente'}
                      </Badge>
                    </HStack>
                  </VStack>

                  {allocation.status === "APPROVED" && !allocation.requester_delivery_confirmation && (
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
      )}
    </Box>
  );
} 
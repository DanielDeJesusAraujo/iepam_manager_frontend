'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  useToast,
  Icon,
} from '@chakra-ui/react';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  address: string;
  branch: string;
}

export default function LocationsPage() {
  const router = useRouter();
  const toast = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch('/api/locations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar localizações');
      }

      const data = await response.json();
      setLocations(data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar localizações',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta localização?')) return;

    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`/api/locations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir localização');
      }

      toast({
        title: 'Localização excluída com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchLocations();
    } catch (error) {
      toast({
        title: 'Erro ao excluir localização',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100vh">
        <Heading>Carregando...</Heading>
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Polos</Heading>
        <Button
          leftIcon={<Icon as={Plus} />}
          onClick={() => router.push('/locations/add')}
        >
          Adicionar Polo
        </Button>
      </HStack>

      <Box bg="white" rounded="lg" shadow="sm">
        <Table>
          <Thead>
            <Tr>
              <Th>Nome</Th>
              <Th>Endereço</Th>
              <Th>Polo</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {locations.map((location) => (
              <Tr key={location.id}>
                <Td>{location.name}</Td>
                <Td>{location.address}</Td>
                <Td>{location.branch}</Td>
                <Td>
                  <HStack spacing={2}>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Icon as={Pencil} />}
                      onClick={() => router.push(`/locations/${location.id}`)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      colorScheme="red"
                      leftIcon={<Icon as={Trash2} />}
                      onClick={() => handleDelete(location.id)}
                    >
                      Excluir
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Container>
  );
} 
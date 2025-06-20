'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useToast,
  Box,
  Text,
  HStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Spinner,
  Center,
  VStack,
  Button,
} from '@chakra-ui/react';
import { SearchIcon, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Quote {
  id: string;
  supplier: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  total_value: number;
  created_at: string;
  created_by: string;
  user: {
    id: string;
    name: string;
  };
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

interface QuoteListProps {
  quotes: Quote[];
  onStatusChange: (quoteId: string, status: 'APPROVED' | 'REJECTED' | 'CANCELLED') => Promise<void>;
}

export function QuoteList({ quotes, onStatusChange }: QuoteListProps) {
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    const userData = localStorage.getItem('@ti-assistant:user');
    if (userData) {
      const { role } = JSON.parse(userData);
      setUserRole(role);
    }
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'yellow',
      APPROVED: 'green',
      REJECTED: 'red',
      CANCELLED: 'gray',
    };
    return colors[status as keyof typeof colors] || 'gray';
  };

  const getStatusText = (status: string) => {
    const texts = {
      PENDING: 'Pendente',
      APPROVED: 'Aprovada',
      REJECTED: 'Rejeitada',
      CANCELLED: 'Cancelada',
    };
    return texts[status as keyof typeof texts] || status;
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesStatus = !statusFilter || quote.status === statusFilter;
    const matchesCreator = !creatorFilter || quote.user.id === creatorFilter;
    const matchesSearch = !searchTerm || 
      quote.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.items.some(item => 
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesStatus && matchesCreator && matchesSearch;
  });

  if (loading) {
    return (
      <Center py={8}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box>
      <VStack spacing={4} mb={6}>
        <HStack spacing={4} width="100%">
          <Select
            placeholder="Filtrar por status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            maxW="200px"
            size="sm"
          >
            <option value="">Todos</option>
            <option value="PENDING">Pendentes</option>
            <option value="APPROVED">Aprovadas</option>
            <option value="REJECTED">Rejeitadas</option>
            <option value="CANCELLED">Canceladas</option>
          </Select>

          <Select
            placeholder="Filtrar por criador"
            value={creatorFilter}
            onChange={(e) => setCreatorFilter(e.target.value)}
            maxW="200px"
            size="sm"
          >
            <option value="">Todos</option>
            {quotes
              .filter((quote, index, self) => 
                index === self.findIndex(q => q.user.id === quote.user.id)
              )
              .map(quote => (
                <option key={quote.user.id} value={quote.user.id}>
                  {quote.user.name}
                </option>
              ))
            }
          </Select>

          <InputGroup maxW="300px" size="sm">
            <InputLeftElement pointerEvents="none">
              <SearchIcon size={16} />
            </InputLeftElement>
            <Input
              placeholder="Buscar por fornecedor ou produto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </HStack>
      </VStack>

      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Fornecedor</Th>
              <Th>Solicitante</Th>
              <Th>Status</Th>
              <Th isNumeric>Valor Total</Th>
              <Th>Data</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredQuotes.map((quote) => (
              <Tr key={quote.id}>
                <Td>{quote.supplier}</Td>
                <Td>{quote.user.name}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(quote.status)}>
                    {getStatusText(quote.status)}
                  </Badge>
                </Td>
                <Td isNumeric>R$ {quote.total_value.toFixed(2)}</Td>
                <Td>{new Date(quote.created_at).toLocaleDateString()}</Td>
                <Td>
                  <HStack spacing={2}>
                    <Button
                      as={Link}
                      href={`/quotes/${quote.id}`}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Detalhes
                    </Button>
                    {userRole === 'MANAGER' && quote.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(quote.id, 'APPROVED');
                          }}
                        >
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(quote.id, 'REJECTED');
                          }}
                        >
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="gray"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(quote.id, 'CANCELLED');
                          }}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
} 
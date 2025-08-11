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
  useColorMode,
  useColorModeValue,
  Spinner,
  Center,
  VStack,
  Button,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  FormControl,
  FormLabel,
  useMediaQuery,
} from '@chakra-ui/react';
import { SearchIcon, Eye, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Quote {
  id: string;
  supplier: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
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
  onStatusChange: (quoteId: string, status: 'APPROVED' | 'REJECTED') => Promise<void>;
}

export function QuoteList({ quotes, onStatusChange }: QuoteListProps) {
  const { colorMode } = useColorMode();
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const drawerBg = useColorModeValue('white', 'gray.800');
  const drawerHeaderColor = useColorModeValue('gray.800', 'white');
  const formLabelColor = useColorModeValue('gray.800', 'white');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();

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
    };
    return colors[status as keyof typeof colors] || 'gray';
  };

  const getStatusText = (status: string) => {
    const texts = {
      PENDING: 'Pendente',
      APPROVED: 'Aprovada',
      REJECTED: 'Rejeitada',
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
      {!isMobile ? (
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
      ) : (
        <VStack spacing={3} mb={6}>
          <InputGroup size="md">
            <InputLeftElement pointerEvents="none">
              <SearchIcon size={16} />
            </InputLeftElement>
            <Input
              placeholder="Buscar por fornecedor ou produto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Button
            leftIcon={<Filter size={16} />}
            onClick={onFilterOpen}
            variant="outline"
            size="sm"
            w="full"
          >
            Filtros
          </Button>
        </VStack>
      )}

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

                      </>
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Drawer de Filtros para Mobile */}
      <Drawer isOpen={isFilterOpen} placement="right" onClose={onFilterClose} size="full">
        <DrawerOverlay />
        <DrawerContent bg={drawerBg} backdropFilter="blur(12px)">
          <DrawerHeader borderBottomWidth="1px" color={drawerHeaderColor}>
            <HStack justify="space-between" align="center">
              <Text>Filtros Avançados</Text>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={onFilterClose}
              >
                Filtrar
              </Button>
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel color={formLabelColor}>Status</FormLabel>
                <Select
                  placeholder="Filtrar por status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="sm"
                >
                  <option value="">Todos</option>
                  <option value="PENDING">Pendentes</option>
                  <option value="APPROVED">Aprovadas</option>
                  <option value="REJECTED">Rejeitadas</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={formLabelColor}>Criador</FormLabel>
                <Select
                  placeholder="Filtrar por criador"
                  value={creatorFilter}
                  onChange={(e) => setCreatorFilter(e.target.value)}
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
              </FormControl>
            </VStack>
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={() => {
              setStatusFilter('');
              setCreatorFilter('');
              onFilterClose();
            }}>
              Limpar Filtros
            </Button>
            <Button onClick={onFilterClose}>
              Aplicar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
} 
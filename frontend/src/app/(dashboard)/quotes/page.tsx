'use client';

import { 
  Box, 
  VStack, 
  useColorModeValue, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel, 
  useToast,
  useBreakpointValue,
  useColorMode,
  Flex,
  HStack,
  Button,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  Text,
  Badge,
  Card,
  CardBody,
  Image,
  Divider,
  Select,
} from '@chakra-ui/react';
import { QuoteList } from './components/QuoteList';
import { CreateQuoteButton } from './components/CreateQuoteButton';
import { SmartQuotesTable } from './components/SmartQuotesTable';
import { PageHeader } from '@/components/PageHeader';
import { useState, useEffect } from 'react';
import { FiPlus, FiFilter, FiSearch, FiChevronRight } from 'react-icons/fi';
import { MobileQuotes } from './components/MobileQuotes';

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

export default function QuotesPage() {
  const { colorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useToast();
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('@ti-assistant:token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar cotações');
      }

      const data = await response.json();
      setQuotes(data);
    } catch (error) {
      console.error('Erro ao buscar cotações:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao buscar cotações',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleStatusChange = async (quoteId: string, status: 'APPROVED' | 'REJECTED' | 'CANCELLED') => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('@ti-assistant:token')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Erro ao alterar status da cotação');
      }

      await fetchQuotes();

      toast({
        title: 'Sucesso',
        description: 'Status da cotação alterado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status da cotação',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'CANCELLED':
        return 'gray';
      default:
        return 'yellow';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Aprovada';
      case 'REJECTED':
        return 'Rejeitada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return 'Pendente';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isMobile) {
    return <MobileQuotes quotes={quotes} onStatusChange={handleStatusChange} />;
  }

  return (
    <Box w="full" h="full">
      <VStack
        spacing={4}
        align="stretch"
        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
        backdropFilter="blur(12px)"
        p={6}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        h="full"
      >
        <PageHeader
          title="Cotações"
          description="Gerencie as cotações de produtos e serviços"
        />

        <Box
          bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
          backdropFilter="blur(12px)"
          borderRadius="lg"
          borderWidth="1px"
          borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        >
          <Tabs 
            variant="enclosed"
            colorScheme={colorMode === 'dark' ? 'blue' : 'blue'}
          >
            <TabList 
              borderBottom="1px solid"
              borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
            >
              <Tab 
                _selected={{ 
                  color: colorMode === 'dark' ? 'white' : 'blue.500',
                  bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.2)' : 'blue.50',
                  borderColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderBottomColor: colorMode === 'dark' ? 'blue.400' : 'blue.500',
                }}
                _hover={{
                  bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.1)' : 'blue.50',
                }}
              >
                Todas as Cotações
              </Tab>
              <Tab 
                _selected={{ 
                  color: colorMode === 'dark' ? 'white' : 'blue.500',
                  bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.2)' : 'blue.50',
                  borderColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderBottomColor: colorMode === 'dark' ? 'blue.400' : 'blue.500',
                }}
                _hover={{
                  bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.1)' : 'blue.50',
                }}
              >
                Cotações Inteligentes
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Box display="flex" justifyContent="flex-end">
                    <CreateQuoteButton />
                  </Box>
                  <QuoteList quotes={quotes} onStatusChange={handleStatusChange} />
                </VStack>
              </TabPanel>
              <TabPanel>
                <SmartQuotesTable />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    </Box>
  );
} 
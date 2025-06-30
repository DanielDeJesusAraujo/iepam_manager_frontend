'use client';
import React from 'react';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  useToast,
  Card,
  CardBody,
  Image,
  Badge,
  Flex,
  Spinner,
  useColorMode,
  VStack,
  HStack,
  useBreakpointValue,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useMediaQuery,
} from '@chakra-ui/react';
import { SearchIcon, ShoppingCart, TimerIcon, CheckCircle, Trash2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MobileSupplyRequests } from './components/MobileSupplyRequests';
import { CustomSupplyRequestModal, CustomSupplyRequestData } from './components/CustomSupplyRequestModal';
import { Supply, SupplyRequest } from './types';
import {
  fetchSupplies,
  fetchRequests,
  handleRequesterConfirmation,
  submitRequest,
  filterSupplies,
  filterRequests,
  allocateInventoryItem,
} from './utils/requestUtils';
import { fetchAvailableInventory, fetchAllocations } from '@/utils/apiUtils';
import { MyAllocationsPage } from '@/app/(dashboard)/supply-requests/components/MyAllocationsPage';
import { InventoryAllocationModal } from '@/components/InventoryAllocationModal';
import { DeliveryDetailsModal } from './components/DeliveryDetailsModal';

interface AllocationRequest {
  id: string;
  inventory: {
    id: string;
    name: string;
    description: string;
    model: string;
    serial_number: string;
  };
  requester: {
    id: string;
    name: string;
    email: string;
  };
  destination: string;
  notes: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
  created_at: string;
  return_date: string;
}

interface CartItem {
    id: string;
    quantity: number;
    supply: Supply;
}

interface MobileSupplyRequestsProps {
  supplies: Supply[];
  categories: { id: string; label: string; }[];
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onAddToCart: (supply: Supply) => void;
  onRemoveFromCart: (supplyId: string) => void;
  onUpdateQuantity: (supplyId: string, quantity: number) => void;
  onSubmitRequest: () => void;
  onCustomRequest: (data: CustomSupplyRequestData) => void;
  onAllocateItem: (item: any) => void;
  onAllocationSubmit: (data: { return_date: string; destination: string; notes: string }) => void;
  cart: { supply: Supply; quantity: number }[];
  setCart: (cart: { id: string; quantity: number; supply: Supply }[]) => void;
  loading: boolean;
  allocationRequests: any[];
  filteredAllocationRequests: any[];
}

export default function SupplyRequestsPage() {
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string; }[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredSupplies, setFilteredSupplies] = useState<Supply[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SupplyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryDeadline, setDeliveryDeadline] = useState('');
  const [destination, setDestination] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const isMobileValue = useBreakpointValue({ base: true, md: false });
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.600');
  const [isCustomRequestModalOpen, setIsCustomRequestModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [filteredInventoryItems, setFilteredInventoryItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [allocationDeadline, setAllocationDeadline] = useState('');
  const [allocationDestination, setAllocationDestination] = useState('');
  const [allocationNotes, setAllocationNotes] = useState('');
  const [allocationRequests, setAllocationRequests] = useState<AllocationRequest[]>([]);
  const [filteredAllocationRequests, setFilteredAllocationRequests] = useState<AllocationRequest[]>([]);
  const [allocationStatusFilter, setAllocationStatusFilter] = useState('');
  const [isAllocating, setIsAllocating] = useState(false);
  const [userLocales, setUserLocales] = useState<any[]>([]);
  const [localeId, setLocaleId] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('@ti-assistant:user') || '{}');
    if (!user || !['EMPLOYEE', 'ORGANIZER'].includes(user.role)) {
      router.push('/unauthorized');
      return;
    }

    loadInitialData();
    const savedCart = JSON.parse(localStorage.getItem('@ti-assistant:cart') || '[]');
    console.log('cart itens', savedCart)
    if (savedCart.length > 0) setCart(savedCart);

    // Transformar categorias em objetos
    const uniqueCategories = Array.from(new Set(supplies.map(s => s.category.label)));
    setCategories(uniqueCategories.map((label, index) => ({ id: String(index), label })));

    // Buscar locais da filial do usuário
    const fetchUserLocales = async () => {
      try {
        const token = localStorage.getItem('@ti-assistant:token');
        if (!token) return;
        const response = await fetch('/api/locales/user-location', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUserLocales(data);
        }
      } catch (e) {
        // Silenciar erro
      }
    };
    fetchUserLocales();
  }, []);

  const loadInitialData = async () => {
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const [suppliesData, requestsData, inventoryData, allocationsData] = await Promise.all([
        fetchSupplies(token),
        fetchRequests(token),
        fetchAvailableInventory(token),
        fetchAllocations(token)
      ]);

      setSupplies(suppliesData);
      setFilteredSupplies(suppliesData);
      setRequests(requestsData);
      setFilteredRequests(requestsData);
      setInventoryItems(inventoryData);
      setFilteredInventoryItems(inventoryData);
      setAllocationRequests(allocationsData);
      setFilteredAllocationRequests(allocationsData);
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao carregar dados',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilteredSupplies(filterSupplies(supplies, searchQuery));
  }, [searchQuery, supplies]);

  useEffect(() => {
    setFilteredRequests(filterRequests(requests, searchQuery, statusFilter));
  }, [searchQuery, statusFilter, requests]);

  useEffect(() => {
    setLoading(true);
    Promise.resolve(loadInitialData()).finally(() => setLoading(false));
  }, [activeTab]);

  useEffect(() => {
    setFilteredInventoryItems(
      inventoryItems.filter(item =>
        item.status === 'STANDBY' &&
        (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.serial_number.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
  }, [searchQuery, inventoryItems]);

  useEffect(() => {
    setFilteredAllocationRequests(
      allocationRequests.filter(request =>
        (request.inventory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.destination.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (allocationStatusFilter ? request.status === allocationStatusFilter : true)
      )
    );
  }, [searchQuery, allocationStatusFilter, allocationRequests]);

  useEffect(() => {
    localStorage.setItem('@ti-assistant:cart', JSON.stringify(cart));
  }, [cart]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implementar lógica de busca
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // TODO: Implementar filtro por categoria
  };

  const handleAddToCart = (supply: Supply) => {
    const existingItem = cart.find((item) => item.id === supply.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === supply.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { id: supply.id, quantity: 1, supply }]);
    }
  };

  const handleRemoveFromCart = (supplyId: string) => {
    setCart(cart.filter((item) => item.id !== supplyId));
  };

  const handleUpdateQuantity = (supplyId: string, quantity: number) => {
    setCart(
      cart.map((item) =>
        item.id === supplyId ? { ...item, quantity } : item
      )
    );
  };

  const handleSubmitRequest = async () => {
    try {
      // Para mobile: buscar do localStorage se vier do modal mobile
      let deadline = deliveryDeadline;
      let dest = destination;
      if (typeof window !== 'undefined') {
        const storedDeadline = localStorage.getItem('@ti-assistant:deliveryDeadline');
        const storedDestination = localStorage.getItem('@ti-assistant:destination');
        if (storedDeadline) deadline = storedDeadline;
        if (storedDestination) dest = storedDestination;
      }
      // Validação da data
      if (!deadline || isNaN(new Date(deadline).getTime())) {
        toast({
          title: 'Data de entrega inválida',
          description: 'Por favor, preencha uma data de entrega válida.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      if (!dest) {
        toast({
          title: 'Destino obrigatório',
          description: 'Por favor, preencha o campo de destino.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      await submitRequest(cart, deadline, dest, token, localeId);

      toast({
        title: 'Sucesso',
        description: 'Pedido enviado com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      localStorage.removeItem('@ti-assistant:cart');
      localStorage.removeItem('@ti-assistant:deliveryDeadline');
      localStorage.removeItem('@ti-assistant:destination');
      setCart([]);
      onClose();
      router.push('/supply-requests');
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao enviar pedido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCustomRequest = async (data: CustomSupplyRequestData) => {
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch('/api/supply-requests/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar requisição customizada');
      }

      toast({
        title: 'Sucesso',
        description: 'Requisição customizada criada com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setIsCustomRequestModalOpen(false);
      setLocaleId('');
      loadInitialData();
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar requisição customizada',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAllocateItem = (item: any) => {
    setSelectedItem(item);
    setIsAllocationModalOpen(true);
  };

  const handleAllocationSubmit = async (data: { return_date: string; destination: string; notes: string }) => {
    setIsAllocating(true);
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) throw new Error('Token não encontrado');
      await allocateInventoryItem(
        selectedItem.id,
        data.return_date,
        data.destination,
        data.notes,
        token
      );
      setIsAllocationModalOpen(false);
      setSelectedItem(null);
      loadInitialData();
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao criar alocação',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsAllocating(false);
    }
  };

  if (isMobile) {
    return (
      <MobileSupplyRequests
        supplies={supplies}
        categories={categories}
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onSubmitRequest={handleSubmitRequest}
        onCustomRequest={handleCustomRequest}
        onAllocateItem={handleAllocateItem}
        onAllocationSubmit={handleAllocationSubmit}
        cart={cart.map(item => ({
          supply: supplies.find(s => s.id === item.id)!,
          quantity: item.quantity
        }))}
        setCart={(newCart) => setCart(newCart.map(item => ({
          id: item.supply.id,
          quantity: item.quantity,
          supply: item.supply
        })))}
        loading={loading}
        allocationRequests={allocationRequests}
        filteredAllocationRequests={filteredAllocationRequests}
      />
    );
  }

  if (loading) {
    return (
      <Box p={1}>
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" />
        </Flex>
      </Box>
    );
  }

  return (
    <Box w="full" h="full">
      <VStack
        spacing={4}
        align="stretch"
        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'}
        backdropFilter="blur(12px)"
        p={isMobile ? 0 : 6}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        h="full"
      >
        <Flex 
          direction={isMobile ? "column" : "row"} 
          justify="space-between" 
          align={isMobile ? "stretch" : "center"}
          gap={3}
        >
          {!isMobile && (
          <Heading size="lg" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
            Requisições de Suprimentos
          </Heading>
          )}
          <HStack 
            spacing={2} 
            w="100%" 
            justify={isMobile ? "space-between" : "flex-end"}
            wrap="wrap"
          >
            <Button
              leftIcon={<Plus />}
              colorScheme="blue"
              onClick={() => setIsCustomRequestModalOpen(true)}
              size={isMobile ? "sm" : "md"}
              flex={isMobile ? 1 : undefined}
              bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
              _hover={{
                bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                transform: 'translateY(-1px)',
              }}
              transition="all 0.3s ease"
            >
              Pedido Customizado
            </Button>
          </HStack>
        </Flex>

        <Box
          bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'}
          backdropFilter="blur(12px)"
          borderRadius="lg"
          borderWidth="1px"
          borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        >
          <Tabs 
            variant="enclosed"
            index={activeTab}
            onChange={(index) => setActiveTab(index)}
            colorScheme={colorMode === 'dark' ? 'blue' : 'blue'}
          >
            <TabList 
              borderBottom="1px solid"
              borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
              overflowX={isMobile ? "auto" : "visible"}
              css={{
                '&::-webkit-scrollbar': {
                  height: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '4px',
                },
              }}
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
                minW={isMobile ? "120px" : undefined}
              >
                Catálogo
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
                minW={isMobile ? "120px" : undefined}
              >
                Inventário
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
                minW={isMobile ? "120px" : undefined}
              >
                Meus Pedidos
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
                minW={isMobile ? "120px" : undefined}
              >
                Minhas Alocações
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
                minW={isMobile ? "120px" : undefined}
              >
                Carrinho
              </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Flex justify="space-between" align="center" mb={6}>
                  <Heading size="lg" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Catálogo de Suprimentos</Heading>
              </Flex>

              <InputGroup mb={6}>
                <InputLeftElement pointerEvents="none">
                    <SearchIcon color={colorMode === 'dark' ? 'gray.400' : 'gray.300'} />
                </InputLeftElement>
                <Input
                  placeholder="Buscar suprimentos..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'}
                    backdropFilter="blur(12px)"
                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                    _hover={{
                      borderColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                    }}
                    _focus={{
                      borderColor: colorMode === 'dark' ? 'blue.400' : 'blue.500',
                      boxShadow: 'none',
                    }}
                />
              </InputGroup>

                <Grid 
                  templateColumns={{ 
                    base: '1fr', 
                    md: 'repeat(2, 1fr)', 
                    lg: 'repeat(3, 1fr)' 
                  }} 
                  gap={6}
                >
                {filteredSupplies.map((supply) => (
                  <Card
                    key={supply.id}
                      bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'}
                      backdropFilter="blur(12px)"
                    borderWidth="1px"
                      borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                    cursor="pointer"
                    onClick={() => router.push(`/supply-requests/${supply.id}`)}
                    _hover={{
                        bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        <Image
                          src="/placeholder.png"
                          alt={supply.name}
                          borderRadius="md"
                          height="200px"
                          objectFit="cover"
                        />
                          <Heading size="md" color={colorMode === 'dark' ? 'white' : 'gray.800'}>{supply.name}</Heading>
                          <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.500'} noOfLines={2}>
                          {supply.description}
                        </Text>
                        <HStack justify="space-between" hidden={true}>
                          <Badge colorScheme="blue">{supply.category.label}</Badge>
                        </HStack>
                          <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                          Quantidade disponível: {supply.quantity}
                        </Text>
                        <Button
                          colorScheme="blue"
                          leftIcon={<ShoppingCart size={20} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(supply);
                          }}
                          isDisabled={supply.quantity <= 0}
                            bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
                            _hover={{
                              bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                              transform: 'translateY(-1px)',
                            }}
                            transition="all 0.3s ease"
                        >
                          Adicionar ao Carrinho
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel>
              <Flex justify="space-between" align="center" mb={6}>
                  <Heading size="lg" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Itens do Inventário</Heading>
              </Flex>

              <InputGroup mb={6}>
                <InputLeftElement pointerEvents="none">
                    <SearchIcon color={colorMode === 'dark' ? 'gray.400' : 'gray.300'} />
                </InputLeftElement>
                <Input
                  placeholder="Buscar itens do inventário..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'}
                    backdropFilter="blur(12px)"
                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                    _hover={{
                      borderColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                    }}
                    _focus={{
                      borderColor: colorMode === 'dark' ? 'blue.400' : 'blue.500',
                      boxShadow: 'none',
                    }}
                />
              </InputGroup>

              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
                {filteredInventoryItems.map((item) => (
                  <Card
                    key={item.id}
                      bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'}
                      backdropFilter="blur(12px)"
                    borderWidth="1px"
                      borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                    cursor="pointer"
                    onClick={() => router.push(`/supply-requests/inventory/${item.id}`)}
                    _hover={{
                        bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <CardBody>
                      <VStack align="stretch" spacing={4}>
                        <Image
                          src={item.image_url || "/placeholder.png"}
                          alt={item.name}
                          borderRadius="md"
                          height="200px"
                          width="100%"
                          objectFit="cover"
                        />
                          <Heading size="md" color={colorMode === 'dark' ? 'white' : 'gray.800'}>{item.name}</Heading>
                          <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.500'} noOfLines={2}>
                          {item.description}
                        </Text>
                        <HStack justify="space-between">
                          <Badge colorScheme="blue">{item.category.label}</Badge>
                        </HStack>
                          <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                          Status: {item.status === 'STANDBY' ? 'Disponível' : 'Em Uso'}
                        </Text>
                        <Button
                          colorScheme="purple"
                          leftIcon={<TimerIcon size={20} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAllocateItem(item);
                          }}
                          isDisabled={item.status !== 'STANDBY'}
                            bg={colorMode === 'dark' ? 'rgba(159, 122, 234, 0.8)' : undefined}
                            _hover={{
                              bg: colorMode === 'dark' ? 'rgba(159, 122, 234, 0.9)' : undefined,
                              transform: 'translateY(-1px)',
                            }}
                            transition="all 0.3s ease"
                        >
                          Alocar Item
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel>
                <Card 
                  bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'}
                  backdropFilter="blur(12px)"
                  borderWidth="1px"
                  borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                >
                <CardBody>
                  <Flex gap={4} mb={6} justify={isMobile ? 'center' : 'space-between'}>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                          <SearchIcon color={colorMode === 'dark' ? 'gray.400' : 'gray.300'} />
                      </InputLeftElement>
                      <Input
                        placeholder="Buscar por suprimento..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                          bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'}
                          backdropFilter="blur(12px)"
                          borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                          _hover={{
                            borderColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                          }}
                          _focus={{
                            borderColor: colorMode === 'dark' ? 'blue.400' : 'blue.500',
                            boxShadow: 'none',
                          }}
                      />
                    </InputGroup>
                    <Select
                      placeholder="Filtrar por status"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      maxW="200px"
                        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'}
                        backdropFilter="blur(12px)"
                        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                        _hover={{
                          borderColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                        }}
                        _focus={{
                          borderColor: colorMode === 'dark' ? 'blue.400' : 'blue.500',
                          boxShadow: 'none',
                        }}
                    >
                      <option value="">Todos</option>
                      <option value="PENDING">Pendente</option>
                      <option value="APPROVED">Aprovado</option>
                      <option value="REJECTED">Rejeitado</option>
                      <option value="DELIVERED">Entregue</option>
                    </Select>
                  </Flex>

                  {filteredRequests.length === 0 ? (
                    <Flex direction="column" align="center" justify="center">
                      <Image
                        src="/Task-complete.svg"
                        alt="Nenhuma requisição encontrada"
                        maxW="300px"
                        mb={4}
                      />
                        <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.500'} fontSize="lg">
                        Nenhuma requisição encontrada
                      </Text>
                    </Flex>
                  ) : (
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                              <Th color={colorMode === 'dark' ? 'white' : 'gray.800'}>Suprimento</Th>
                              <Th color={colorMode === 'dark' ? 'white' : 'gray.800'}>Quantidade</Th>
                              <Th color={colorMode === 'dark' ? 'white' : 'gray.800'}>Status</Th>
                              <Th color={colorMode === 'dark' ? 'white' : 'gray.800'}>Data</Th>
                              <Th color={colorMode === 'dark' ? 'white' : 'gray.800'}>Confirmações</Th>
                              <Th color={colorMode === 'dark' ? 'white' : 'gray.800'}>Ações</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredRequests.map((request) => (
                            <Tr key={request.id}>
                                <Td color={colorMode === 'dark' ? 'white' : 'gray.800'}>{request.is_custom ? request.item_name : request.supply?.name}</Td>
                                <Td color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                                {request.quantity} {request.is_custom ? request.unit?.symbol || request.unit?.name : request.supply?.unit?.symbol || request.supply?.unit?.name}
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    request.status === 'APPROVED'
                                      ? 'green'
                                      : request.status === 'REJECTED'
                                        ? 'red'
                                        : request.status === 'DELIVERED'
                                          ? 'purple'
                                          : 'yellow'
                                  }
                                >
                                  {request.status === 'PENDING'
                                    ? 'Pendente'
                                    : request.status === 'APPROVED'
                                      ? 'Aprovado'
                                      : request.status === 'REJECTED'
                                        ? 'Rejeitado'
                                        : 'Entregue'}
                                </Badge>
                              </Td>
                                <Td color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                                {new Date(request.created_at).toLocaleDateString('pt-BR')}
                              </Td>
                              <Td>
                                <VStack spacing={2} align="start">
                                  <HStack>
                                      <Text fontSize="sm" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Requerente:</Text>
                                    <Badge colorScheme={request.requester_confirmation ? 'green' : 'gray'}>
                                      {request.requester_confirmation ? 'Confirmado' : 'Pendente'}
                                    </Badge>
                                  </HStack>
                                  <HStack>
                                      <Text fontSize="sm" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Gerente:</Text>
                                    <Badge colorScheme={request.manager_delivery_confirmation ? 'green' : 'gray'}>
                                      {request.manager_delivery_confirmation ? 'Confirmado' : 'Pendente'}
                                    </Badge>
                                  </HStack>
                                </VStack>
                              </Td>
                              <Td>
                                {request.status === 'APPROVED' && (
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    leftIcon={<CheckCircle size={16} />}
                                    onClick={() => handleRequesterConfirmation(request.id, true, localStorage.getItem('@ti-assistant:token') || '', request.is_custom || false)}
                                    isDisabled={request.requester_confirmation}
                                      bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
                                      _hover={{
                                        bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                                        transform: 'translateY(-1px)',
                                      }}
                                      transition="all 0.3s ease"
                                  >
                                    Confirmar Recebimento
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
              </Card>
            </TabPanel>

            <TabPanel>
              <MyAllocationsPage />
            </TabPanel>

            <TabPanel>
                <Card 
                  bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'}
                  backdropFilter="blur(12px)"
                  borderWidth="1px"
                  borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                >
                <CardBody>
                  <VStack spacing={4}>
                      <Heading size="lg" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Carrinho de Pedidos</Heading>
                    {cart.length === 0 ? (
                      <VStack spacing={4}>
                        <ShoppingCart size={48} />
                          <Text fontSize="lg" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>Seu carrinho está vazio</Text>
                        <Button
                          colorScheme="blue"
                          onClick={() => router.push('/supply-requests')}
                            bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
                            _hover={{
                              bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                              transform: 'translateY(-1px)',
                            }}
                            transition="all 0.3s ease"
                        >
                          Continuar Comprando
                        </Button>
                      </VStack>
                    ) : (
                      <>
                        {cart.map((item) => (
                          item.supply ? (
                            <Card 
                              key={item.id} 
                              bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'}
                              backdropFilter="blur(12px)"
                              borderWidth="1px"
                              borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                            >
                            <CardBody>
                              <VStack align="stretch" spacing={4}>
                                <HStack justify="space-between">
                                  <VStack align="start" spacing={1}>
                                      <Heading size="md" color={colorMode === 'dark' ? 'white' : 'gray.800'}>{item.supply.name}</Heading>
                                      <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.500'} noOfLines={2}>
                                      {item.supply.description}
                                    </Text>
                                  </VStack>
                                  <IconButton
                                    aria-label="Remover item"
                                    icon={<Trash2 size={20} />}
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => handleRemoveFromCart(item.id)}
                                  />
                                </HStack>

                                <HStack justify="space-between">
                                    <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                                    Quantidade disponível: {item.quantity}
                                  </Text>
                                  <NumberInput
                                    value={item.quantity}
                                    min={1}
                                    max={item.supply.quantity}
                                    onChange={(_, value) => handleUpdateQuantity(item.id, value)}
                                    size="sm"
                                    maxW="120px"
                                  >
                                      <NumberInputField 
                                        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'}
                                        backdropFilter="blur(12px)"
                                        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                        _hover={{
                                          borderColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                                        }}
                                        _focus={{
                                          borderColor: colorMode === 'dark' ? 'blue.400' : 'blue.500',
                                          boxShadow: 'none',
                                        }}
                                      />
                                    <NumberInputStepper>
                                      <NumberIncrementStepper />
                                      <NumberDecrementStepper />
                                    </NumberInputStepper>
                                  </NumberInput>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                          ) : null
                        ))}

                        <Button
                          colorScheme="green"
                          size="lg"
                          onClick={onOpen}
                          leftIcon={<ShoppingCart size={24} />}
                            bg={colorMode === 'dark' ? 'rgba(72, 187, 120, 0.8)' : undefined}
                            _hover={{
                              bg: colorMode === 'dark' ? 'rgba(72, 187, 120, 0.9)' : undefined,
                              transform: 'translateY(-1px)',
                            }}
                            transition="all 0.3s ease"
                        >
                          Enviar Pedido
                        </Button>
                      </>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
        </Box>
      </VStack>

        <DeliveryDetailsModal
          isOpen={isOpen}
          onClose={onClose}
          deliveryDeadline={deliveryDeadline}
          setDeliveryDeadline={setDeliveryDeadline}
          destination={destination}
          setDestination={setDestination}
          userLocales={userLocales}
          onSubmit={handleSubmitRequest}
          localeId={localeId}
          setLocaleId={setLocaleId}
        />

        <CustomSupplyRequestModal
          isOpen={isCustomRequestModalOpen}
          onClose={() => {
            setIsCustomRequestModalOpen(false);
            setLocaleId('');
          }}
          onSubmit={handleCustomRequest}
          userLocales={userLocales}
          localeId={localeId}
          setLocaleId={setLocaleId}
        />

        <InventoryAllocationModal
          isOpen={isAllocationModalOpen}
          onClose={() => setIsAllocationModalOpen(false)}
          item={selectedItem}
          onSubmit={handleAllocationSubmit}
          isLoading={isAllocating}
        />
    </Box>
  );
} 
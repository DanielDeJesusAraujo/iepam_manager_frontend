'use client';
import React from 'react';

import { useState, useEffect, useRef } from 'react';
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
  Skeleton,
  SkeletonText,
  Divider,
} from '@chakra-ui/react';
import { SearchIcon, ShoppingCart, TimerIcon, CheckCircle, Trash2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
import { CatalogTab } from './components/Tabs/CatalogTab';
import { InventoryTab } from './components/Tabs/InventoryTab';
import { MyRequestsTab } from './components/Tabs/MyRequestsTab';
import { CartTab } from './components/Tabs/CartTab';
import { useGlobal, useCart, useFilters, useTabs } from '@/contexts/GlobalContext';

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

// Layout reutilizável para abas persistentes (copiado/adaptado do admin)
function PersistentTabsLayout({ tabLabels, children, onTabChange, storageKey = 'persistentTabIndexColab' }: { tabLabels: string[], children: React.ReactNode[], onTabChange?: (() => void)[], storageKey?: string }) {
  const { activeTab, setActiveTab } = useTabs();
  const prevTab = useRef(0);
  const [hasFetched, setHasFetched] = useState(() => tabLabels.map(() => false));
  const [isMobile] = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setActiveTab(Number(saved));
  }, [storageKey, setActiveTab]);

  useEffect(() => {
    // Ao trocar de aba, resetar o status da aba anterior
    setHasFetched(arr => arr.map((v, i) => i === prevTab.current ? false : v));
    prevTab.current = activeTab;
    // eslint-disable-next-line
  }, [activeTab]);

  useEffect(() => {
    if (!hasFetched[activeTab] && onTabChange && onTabChange[activeTab]) {
      onTabChange[activeTab]();
      setHasFetched(arr => arr.map((v, i) => i === activeTab ? true : v));
    }
    // eslint-disable-next-line
  }, [activeTab, onTabChange, hasFetched]);

  return (
    <Box w="full" h="full">
      <VStack
        spacing={4}
        align="stretch"
        bg={useColorModeValue('white', 'gray.700')}
        backdropFilter="blur(12px)"
        p={{ base: 2, md: 6 }}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={useColorModeValue('gray.200', 'gray.600')}
        h="full"
        w="full"
      >
        {!isMobile && (
          <>
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={3}>
              <Heading size={{ base: 'md', md: 'lg' }} color={useColorModeValue('gray.800', 'white')}>Requisições de Suprimentos</Heading>
        </Flex>
        <Divider />
          </>
        )}
        <Box marginBottom="20px" position="sticky" top="7vh" zIndex={21} bg={useColorModeValue('white', 'gray.700')} borderRadius="lg">
          <Tabs variant="enclosed" index={activeTab} onChange={setActiveTab} size={{ base: 'sm', md: 'md' }}>
            <TabList 
              overflowX="auto" 
              css={{
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              bg={useColorModeValue('gray.50', 'gray.600')}
              borderRadius="lg"
              p={1}
              gap={1}
            >
              {tabLabels.map(label => (
                <Tab 
                  key={label} 
                  whiteSpace="nowrap"
                  fontSize={{ base: 'xs', md: 'sm' }}
                  fontWeight="medium"
                  minH={{ base: '8', md: '10' }}
                  px={{ base: 2, md: 4 }}
                  py={{ base: 2, md: 3 }}
                  borderRadius="md"
                  _selected={{
                    bg: useColorModeValue('white', 'gray.700'),
                    color: useColorModeValue('blue.600', 'blue.200'),
                    boxShadow: 'sm',
                    borderColor: useColorModeValue('blue.200', 'blue.600')
                  }}
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.500')
                  }}
                >
                  {label}
                </Tab>
              ))}
          </TabList>
        </Tabs>
        </Box>
        <Box mt={4} flex="1" overflowY="auto">
          {children.map((child, idx) => (
            <Box key={idx} display={activeTab === idx ? 'block' : 'none'} w="full">
              {child}
            </Box>
          ))}
        </Box>
      </VStack>
    </Box>
  );
}

export default function SupplyRequestsPage() {
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string; }[]>([]);
  const { cart, addToCart, removeFromCart, updateCartItem, clearCart } = useCart();
  const { searchQuery, statusFilter, setSearchQuery, setStatusFilter } = useFilters();
  const [filteredSupplies, setFilteredSupplies] = useState<Supply[]>([]);
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
  const [loadingTabs, setLoadingTabs] = useState([true, true, true, true, true]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('@ti-assistant:user') || '{}');
    if (!user || !['EMPLOYEE', 'ORGANIZER'].includes(user.role)) {
      router.push('/unauthorized');
      return;
    }

    loadInitialData();

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
  }, []);

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

  const handleAddToCart = (supply: Supply) => {
    addToCart({ id: supply.id, quantity: 1, supply });
  };

  const handleRemoveFromCart = (supplyId: string) => {
    removeFromCart(supplyId);
  };

  const handleUpdateQuantity = (supplyId: string, quantity: number) => {
    updateCartItem(supplyId, quantity);
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

      localStorage.removeItem('@ti-assistant:deliveryDeadline');
      localStorage.removeItem('@ti-assistant:destination');
      clearCart();
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

  // Função genérica para buscar dados de cada aba
  const fetchTabData = async (tabIndex: number) => {
    setLoadingTabs(tabs => tabs.map((v, i) => i === tabIndex ? true : v));
    await loadInitialData();
    setLoadingTabs(tabs => tabs.map((v, i) => i === tabIndex ? false : v));
  };

  // Funções específicas usando a função genérica
  const fetchTabCatalog = () => fetchTabData(0);
  const fetchTabInventory = () => fetchTabData(1);
  const fetchTabMyRequests = () => fetchTabData(2);
  const fetchTabMyAllocations = () => fetchTabData(3);
  const fetchTabCart = () => fetchTabData(4);

    return (
    <PersistentTabsLayout
      tabLabels={["Catálogo", "Inventário", "Meus Pedidos", "Minhas Alocações", "Carrinho"]}
      onTabChange={[fetchTabCatalog, fetchTabInventory, fetchTabMyRequests, fetchTabMyAllocations, fetchTabCart]}
    >
      {[
        loadingTabs[0] ? (
          <Skeleton
            key="skeleton-catalog"
            height="400px"
            width="100%"
          >
            <SkeletonText mt="4" noOfLines={8} spacing="4" />
          </Skeleton>
        ) : (
          <CatalogTab
            supplies={filteredSupplies}
            onAddToCart={handleAddToCart}
          />
        ),
        loadingTabs[1] ? (
          <Skeleton
            key="skeleton-inventory"
            height="400px"
            width="100%"
          >
            <SkeletonText mt="4" noOfLines={8} spacing="4" />
          </Skeleton>
        ) : (
          <InventoryTab
            inventoryItems={filteredInventoryItems}
            onAllocateItem={handleAllocateItem}
          />
        ),
        loadingTabs[2] ? (
          <Skeleton
            key="skeleton-reqs"
            height="400px"
            width="100%"
          >
            <SkeletonText mt="4" noOfLines={8} spacing="4" />
          </Skeleton>
        ) : (
          <MyRequestsTab
            requests={filteredRequests}
            onRequesterConfirmation={handleRequesterConfirmation}
          />
        ),
        loadingTabs[3] ? (
          <Skeleton
            key="skeleton-allocs"
            height="400px"
            width="100%"
          >
            <SkeletonText mt="4" noOfLines={8} spacing="4" />
          </Skeleton>
        ) : (
              <MyAllocationsPage />
        ),
        loadingTabs[4] ? (
          <Skeleton
            key="skeleton-cart"
            height="400px"
            width="100%"
          >
            <SkeletonText mt="4" noOfLines={8} spacing="4" />
          </Skeleton>
        ) : (
          <CartTab
            cart={cart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateQuantity={handleUpdateQuantity}
            onOpenModal={onOpen}
            onContinueShopping={() => router.push('/supply-requests')}
          />
        )
      ]}
    </PersistentTabsLayout>
  );
} 
'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Button,
    useToast,
    Spinner,
    Flex,
    useColorModeValue,
    Card,
    CardBody,
    InputGroup,
    InputLeftElement,
    Input,
    Select,
    Text,
    VStack,
    useBreakpointValue,
    useDisclosure,
    Image,
    HStack,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useMediaQuery,
} from '@chakra-ui/react';
import { SearchIcon, TimeIcon } from '@chakra-ui/icons';
import { CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MobileAdminSupplyRequests } from './components/MobileAdminSupplyRequests';

interface SupplyRequest {
    id: string;
    supply?: {
        id: string;
        name: string;
        description: string;
        quantity: number;
        unit: {
            id: string;
            name: string;
            symbol: string;
        };
    };
    item_name?: string;
    description?: string;
    unit?: {
        id: string;
        name: string;
        symbol: string;
    };
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    quantity: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED';
    notes: string;
    created_at: string;
    requester_confirmation: boolean;
    manager_delivery_confirmation: boolean;
    is_custom?: boolean;
}

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
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED' | 'RETURNED';
    created_at: string;
    return_date: string;
    requester_delivery_confirmation: boolean;
    manager_delivery_confirmation: boolean;
}

export interface InventoryItem {
    id: string;
    item: string;
    name: string;
    model: string;
    serial_number: string;
    finality: string;
    acquisition_price: number;
    acquisition_date: string;
    status: 'STANDBY' | 'IN_USE' | 'MAINTENANCE' | 'DISCARDED';
    location_id: string;
    locale_id?: string;
    category_id: string;
    subcategory_id: string;
    supplier_id?: string;
    description?: string;
    image_url?: string;
    location: {
        id: string;
        name: string;
        // outros campos...
    };
    locale?: {
        id: string;
        name: string;
        // outros campos...
    };
    supplier?: {
        id: string;
        name: string;
        // outros campos...
    };
    category: {
        id: string;
        label: string;
        // outros campos...
    };
    subcategory: {
        id: string;
        label: string;
        // outros campos...
    };
}

export default function AdminSupplyRequestsPage() {
    const [requests, setRequests] = useState<SupplyRequest[]>([]);
    const [allocationRequests, setAllocationRequests] = useState<AllocationRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<SupplyRequest[]>([]);
    const [filteredAllocationRequests, setFilteredAllocationRequests] = useState<AllocationRequest[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const router = useRouter();
    const toast = useToast();
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const colorMode = useColorModeValue('light', 'dark');
    const [isMobile] = useMediaQuery('(max-width: 768px)');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('@ti-assistant:user') || '{}');
        if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
            router.push('/unauthorized');
            return;
        }

        fetchRequests();
        fetchAllocationRequests();
    }, [router]);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchRequests(), fetchAllocationRequests()]).finally(() => setLoading(false));
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 0) {
            fetchRequests();
        } else {
            fetchAllocationRequests();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 0) {
            if (search || statusFilter) {
                const filtered = requests.filter(request => {
                    const matchesSearch =
                        (request.is_custom
                            ? request.item_name?.toLowerCase().includes(search.toLowerCase())
                            : request.supply?.name.toLowerCase().includes(search.toLowerCase())) ||
                        request.user.name.toLowerCase().includes(search.toLowerCase()) ||
                        request.user.email.toLowerCase().includes(search.toLowerCase());
                    const matchesStatus = !statusFilter || request.status === statusFilter;
                    return matchesSearch && matchesStatus;
                });
                setFilteredRequests(filtered);
            } else {
                setFilteredRequests(requests);
            }
        } else {
            if (search || statusFilter) {
                const filtered = allocationRequests.filter(request => {
                    const matchesSearch =
                        request.inventory.name.toLowerCase().includes(search.toLowerCase()) ||
                        request.inventory.model.toLowerCase().includes(search.toLowerCase()) ||
                        request.inventory.serial_number.toLowerCase().includes(search.toLowerCase()) ||
                        request.requester.name.toLowerCase().includes(search.toLowerCase()) ||
                        request.requester.email.toLowerCase().includes(search.toLowerCase());
                    const matchesStatus = !statusFilter || request.status === statusFilter;
                    return matchesSearch && matchesStatus;
                });
                setFilteredAllocationRequests(filtered);
            } else {
                setFilteredAllocationRequests(allocationRequests);
            }
        }
    }, [search, statusFilter, requests, allocationRequests, activeTab]);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            // Buscar requisições regulares
            const regularResponse = await fetch('/api/supply-requests', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!regularResponse.ok) {
                throw new Error('Erro ao carregar requisições regulares');
            }

            const regularData = await regularResponse.json();

            // Buscar requisições customizadas
            const customResponse = await fetch('/api/custom-supply-requests', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!customResponse.ok) {
                throw new Error('Erro ao carregar requisições customizadas');
            }

            const customData = await customResponse.json();

            // Combinar e marcar as requisições customizadas
            const allRequests = [
                ...regularData,
                ...customData.map((request: any) => ({
                    ...request,
                    is_custom: true
                }))
            ];

            setRequests(allRequests);
            setFilteredRequests(allRequests);
        } catch (error) {
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao carregar requisições',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const fetchAllocationRequests = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            if (!token) {
                throw new Error('Token não encontrado');
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
            setAllocationRequests(data);
            setFilteredAllocationRequests(data);
        } catch (error) {
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao carregar alocações',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleStatusUpdate = async (requestId: string, newStatus: 'APPROVED' | 'REJECTED') => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const request = requests.find(r => r.id === requestId);
            if (!request) {
                throw new Error('Requisição não encontrada');
            }

            const endpoint = request.is_custom
                ? `/api/custom-supply-requests/${requestId}/status`
                : `/api/supply-requests/${requestId}`;

            const response = await fetch(endpoint, {
                method: request.is_custom ? 'PATCH' : 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar requisição');
            }

            toast({
                title: 'Sucesso',
                description: `Requisição ${newStatus === 'APPROVED' ? 'aprovada' : 'rejeitada'} com sucesso`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            fetchRequests();
        } catch (error) {
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao atualizar requisição',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleRequesterConfirmation = async (requestId: string, confirmation: boolean) => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const request = requests.find(r => r.id === requestId);
            if (!request) {
                throw new Error('Requisição não encontrada');
            }

            const endpoint = request.is_custom
                ? `/api/custom-supply-requests/${requestId}/requester-confirmation`
                : `/api/supply-requests/${requestId}/requester-confirmation`;

            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ confirmation })
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar confirmação');
            }

            toast({
                title: 'Sucesso',
                description: 'Confirmação atualizada com sucesso',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            fetchRequests();
        } catch (error) {
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao atualizar confirmação',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleManagerDeliveryConfirmation = async (allocationId: string, confirmation: boolean) => {
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
                body: JSON.stringify({ confirmation })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao confirmar entrega');
            }

            toast({
                title: 'Sucesso',
                description: 'Confirmação de entrega atualizada com sucesso',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            fetchAllocationRequests();
        } catch (error) {
            console.error('Erro ao confirmar entrega:', error);
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao confirmar entrega',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleAllocationStatusUpdate = async (allocationId: string, newStatus: 'APPROVED' | 'REJECTED') => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`/api/inventory-allocations/${allocationId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar status da alocação');
            }

            toast({
                title: 'Sucesso',
                description: 'Status da alocação atualizado com sucesso',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            fetchAllocationRequests();
        } catch (error) {
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao atualizar status da alocação',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    if (loading) {
        return (
            <Box p={8}>
                <Flex justify="center" align="center" minH="200px">
                    <Spinner size="xl" />
                </Flex>
            </Box>
        );
    }

    if (isMobile) {
        return (
            <MobileAdminSupplyRequests
                requests={requests}
                filteredRequests={filteredRequests}
                allocationRequests={allocationRequests}
                filteredAllocationRequests={filteredAllocationRequests}
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onApprove={handleStatusUpdate}
                onReject={handleStatusUpdate}
                onConfirmDelivery={handleManagerDeliveryConfirmation}
                onAllocationApprove={handleAllocationStatusUpdate}
                onAllocationReject={handleAllocationStatusUpdate}
                onAllocationConfirmDelivery={handleManagerDeliveryConfirmation}
                loading={loading}
            />
        );
    }

    return (
        <Box w="full" h="full" p={0}>
            <VStack
                spacing={4}
                align="stretch"
                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                backdropFilter="blur(12px)"
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                h="full"
            >
                <Flex justify="space-between" align="center">
                    {!isMobile && (
                        <Heading size="lg" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Requisições</Heading>
                    )}
                    <Flex
                        flex={1}
                        justify={isMobile ? 'center' : 'flex-end'}
                        marginTop={isMobile ? '15px' : '0px'}
                    >
                        <Button
                            leftIcon={<TimeIcon />}
                            colorScheme="blue"
                            onClick={() => router.push('/supply-requests/history')}
                            bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
                            _hover={{
                                bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                                transform: 'translateY(-1px)',
                            }}
                            transition="all 0.3s ease"
                        >
                            Histórico
                        </Button>
                    </Flex>
                </Flex>

                <Tabs variant="enclosed" onChange={(index) => setActiveTab(index)} index={activeTab}>
                    <TabList>
                        <Tab>Suprimentos</Tab>
                        <Tab>Alocações</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <Box
                                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                p={6}
                                borderRadius="lg"
                                boxShadow="sm"
                                borderWidth="1px"
                                borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                backdropFilter="blur(12px)"
                            >
                                <Flex gap={4} mb={4} justify={isMobile ? 'center' : 'space-between'}>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <SearchIcon color={colorMode === 'dark' ? 'gray.400' : 'gray.300'} />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Buscar por suprimento ou usuário..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
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
                                        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
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
                                    <Flex direction="column" align="center" justify="center" py={8}>
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
                                                    <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Suprimento</Th>
                                                    <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Usuário</Th>
                                                    <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Quantidade</Th>
                                                    <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Status</Th>
                                                    <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Data</Th>
                                                    <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Ações</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {filteredRequests.map((request) => (
                                                    <Tr
                                                        key={request.id}
                                                        transition="all 0.3s ease"
                                                        _hover={{
                                                            bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                                                            transform: 'translateY(-1px)',
                                                        }}
                                                    >
                                                        <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                                            {request.is_custom ? request.item_name : request.supply?.name}
                                                        </Td>
                                                        <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                                            <Text color={colorMode === 'dark' ? 'white' : 'gray.800'}>{request.user.name}</Text>
                                                            <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                                                                {request.user.email}
                                                            </Text>
                                                        </Td>
                                                        <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                                            {request.quantity} {request.supply?.unit?.symbol || request.supply?.unit?.name}
                                                        </Td>
                                                        <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
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
                                                        <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                                            {new Date(request.created_at).toLocaleDateString('pt-BR')}
                                                        </Td>
                                                        <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                                            <VStack spacing={2} align="start">
                                                                {request.status === 'PENDING' && (
                                                                    <Flex gap={2}>
                                                                        <Button
                                                                            size="sm"
                                                                            colorScheme="green"
                                                                            onClick={() => handleStatusUpdate(request.id, 'APPROVED')}
                                                                            bg={colorMode === 'dark' ? 'rgba(72, 187, 120, 0.8)' : undefined}
                                                                            _hover={{
                                                                                bg: colorMode === 'dark' ? 'rgba(72, 187, 120, 0.9)' : undefined,
                                                                                transform: 'translateY(-1px)',
                                                                            }}
                                                                            transition="all 0.3s ease"
                                                                        >
                                                                            Aprovar
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            colorScheme="red"
                                                                            onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                                                                            bg={colorMode === 'dark' ? 'rgba(245, 101, 101, 0.8)' : undefined}
                                                                            _hover={{
                                                                                bg: colorMode === 'dark' ? 'rgba(245, 101, 101, 0.9)' : undefined,
                                                                                transform: 'translateY(-1px)',
                                                                            }}
                                                                            transition="all 0.3s ease"
                                                                        >
                                                                            Rejeitar
                                                                        </Button>
                                                                    </Flex>
                                                                )}
                                                                {request.status === 'APPROVED' && (
                                                                    <Flex gap={2}>
                                                                        <Button
                                                                            size="sm"
                                                                            colorScheme="blue"
                                                                            leftIcon={<CheckCircle size={16} />}
                                                                            onClick={() => handleManagerDeliveryConfirmation(request.id, true)}
                                                                            isDisabled={request.manager_delivery_confirmation}
                                                                            bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
                                                                            _hover={{
                                                                                bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                                                                                transform: 'translateY(-1px)',
                                                                            }}
                                                                            transition="all 0.3s ease"
                                                                        >
                                                                            Confirmar Entrega
                                                                        </Button>
                                                                    </Flex>
                                                                )}
                                                            </VStack>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </Box>
                                )}
                            </Box>
                        </TabPanel>

                        <TabPanel>
                            <Box
                                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                p={6}
                                borderRadius="lg"
                                boxShadow="sm"
                                borderWidth="1px"
                                borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                backdropFilter="blur(12px)"
                            >
                                <Flex gap={4} mb={4} justify={isMobile ? 'center' : 'space-between'}>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none">
                                            <SearchIcon color={colorMode === 'dark' ? 'gray.400' : 'gray.300'} />
                                        </InputLeftElement>
                                        <Input
                                            placeholder="Buscar por item ou usuário..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
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
                                        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
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
                                        <option value="RETURNED">Devolvido</option>
                                    </Select>
                                </Flex>

                                {filteredAllocationRequests.length === 0 ? (
                                    <Flex direction="column" align="center" justify="center" py={8}>
                                        <Image
                                            src="/Task-complete.svg"
                                            alt="Nenhuma alocação encontrada"
                                            maxW="300px"
                                            mb={4}
                                        />
                                        <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.500'} fontSize="lg">
                                            Nenhuma alocação encontrada
                                        </Text>
                                    </Flex>
                                ) : (
                                    <Box overflowX="auto">
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Item</Th>
                                                    <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Requerente</Th>
                                                    <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Destino</Th>
                                                    <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Status</Th>
                                                    <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Data de Retorno</Th>
                                                    <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Confirmações</Th>
                                                    <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Ações</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {filteredAllocationRequests.map((request) => (
                                                    <Tr
                                                        key={request.id}
                                                        transition="all 0.3s ease"
                                                        _hover={{
                                                            bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                                                            transform: 'translateY(-1px)',
                                                        }}
                                                    >
                                                        <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                                            <VStack align="start" spacing={1}>
                                                                <Text fontWeight="bold">{request.inventory.name}</Text>
                                                                <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                                                                    {request.inventory.model} - {request.inventory.serial_number}
                                                                </Text>
                                                            </VStack>
                                                        </Td>
                                                        <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                                            <Text color={colorMode === 'dark' ? 'white' : 'gray.800'}>{request.requester.name}</Text>
                                                            <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                                                                {request.requester.email}
                                                            </Text>
                                                        </Td>
                                                        <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                                            {request.destination}
                                                        </Td>
                                                        <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                                            <Badge
                                                                colorScheme={
                                                                    request.status === 'APPROVED'
                                                                        ? 'green'
                                                                        : request.status === 'REJECTED'
                                                                            ? 'red'
                                                                            : request.status === 'DELIVERED'
                                                                                ? 'purple'
                                                                                : request.status === 'RETURNED'
                                                                                    ? 'blue'
                                                                                    : 'yellow'
                                                                }
                                                            >
                                                                {request.status === 'PENDING'
                                                                    ? 'Pendente'
                                                                    : request.status === 'APPROVED'
                                                                        ? 'Aprovado'
                                                                        : request.status === 'REJECTED'
                                                                            ? 'Rejeitado'
                                                                            : request.status === 'DELIVERED'
                                                                                ? 'Entregue'
                                                                                : 'Devolvido'}
                                                            </Badge>
                                                        </Td>
                                                        <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                                            {new Date(request.return_date).toLocaleDateString('pt-BR')}
                                                        </Td>
                                                        <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                                            <VStack spacing={2} align="start">
                                                                <HStack>
                                                                    <Text fontSize="sm">Requerente:</Text>
                                                                    <Badge colorScheme={request.requester_delivery_confirmation ? 'green' : 'gray'}>
                                                                        {request.requester_delivery_confirmation ? 'Confirmado' : 'Pendente'}
                                                                    </Badge>
                                                                </HStack>
                                                                <HStack>
                                                                    <Text fontSize="sm">Gerente:</Text>
                                                                    <Badge colorScheme={request.manager_delivery_confirmation ? 'green' : 'gray'}>
                                                                        {request.manager_delivery_confirmation ? 'Confirmado' : 'Pendente'}
                                                                    </Badge>
                                                                </HStack>
                                                            </VStack>
                                                        </Td>
                                                        <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                                            <HStack spacing={2}>
                                                                {request.status === 'PENDING' && (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            colorScheme="green"
                                                                            onClick={() => handleAllocationStatusUpdate(request.id, 'APPROVED')}
                                                                        >
                                                                            Aprovar
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            colorScheme="red"
                                                                            onClick={() => handleAllocationStatusUpdate(request.id, 'REJECTED')}
                                                                        >
                                                                            Rejeitar
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {request.status === 'APPROVED' && !request.manager_delivery_confirmation && (
                                                                    <Button
                                                                        size="sm"
                                                                        colorScheme="blue"
                                                                        onClick={() => handleManagerDeliveryConfirmation(request.id, true)}
                                                                    >
                                                                        Confirmar Entrega
                                                                    </Button>
                                                                )}
                                                            </HStack>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </Box>
                                )}
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Box>
    );
} 
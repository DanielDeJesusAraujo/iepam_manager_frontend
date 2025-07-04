import {
    Box,
    Container,
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
    IconButton,
    useColorModeValue,
    SimpleGrid,
    Wrap,
    WrapItem,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
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
    useDisclosure,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerCloseButton,
} from '@chakra-ui/react';
import { SearchIcon, ShoppingCart, TimerIcon, Plus, CheckCircle, Trash2, Package, ClipboardList, Box as BoxIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CustomSupplyRequestModal } from './CustomSupplyRequestModal';
import { MyAllocationsPage } from './MyAllocationsPage';
import { Supply, SupplyRequest } from '../types';
import {
    fetchSupplies,
    fetchRequests,
    handleRequesterConfirmation,
    filterRequests,
} from '../utils/requestUtils';
import { fetchAvailableInventory, fetchAllocations, fetchInventoryItemById } from '@/utils/apiUtils';
import { createAllocation } from '@/utils/apiUtils';
import { MobileMyAllocationsPage } from './MobileMyAllocationsPage';

interface MobileSupplyRequestsProps {
    supplies: Supply[];
    categories: { id: string; label: string }[];
    onSearch: (query: string) => void;
    onCategoryChange: (category: string) => void;
    onAddToCart: (supply: Supply) => void;
    onRemoveFromCart: (supplyId: string) => void;
    onUpdateQuantity: (supplyId: string, quantity: number) => void;
    onSubmitRequest: () => void;
    onCustomRequest: (data: any) => void;
    onAllocateItem: (item: any) => void;
    onAllocationSubmit: (data: any) => void;
    cart: { supply: Supply; quantity: number }[];
    setCart: (cart: { supply: Supply; quantity: number }[]) => void;
    loading?: boolean;
    allocationRequests: any[];
    filteredAllocationRequests: any[];
    userLocales: { id: string; name: string }[];
}

export function MobileSupplyRequests({
    supplies,
    categories,
    onSearch,
    onCategoryChange,
    onAddToCart,
    onRemoveFromCart,
    onUpdateQuantity,
    onSubmitRequest,
    onCustomRequest,
    onAllocateItem,
    onAllocationSubmit,
    cart,
    setCart,
    loading = false,
    allocationRequests,
    filteredAllocationRequests,
    userLocales,
}: MobileSupplyRequestsProps) {
    const router = useRouter();
    const toast = useToast();
    const { colorMode } = useColorMode();
    const bgColor = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBgColor = useColorModeValue('gray.50', 'gray.600');
    const [isCustomRequestModalOpen, setIsCustomRequestModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [requests, setRequests] = useState<SupplyRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<SupplyRequest[]>([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [filteredInventoryItems, setFilteredInventoryItems] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
    const [allocationDeadline, setAllocationDeadline] = useState('');
    const [allocationDestination, setAllocationDestination] = useState('');
    const [allocationNotes, setAllocationNotes] = useState('');
    const [allocationStatusFilter, setAllocationStatusFilter] = useState('');
    const { isOpen: isCustomRequestOpen, onOpen: onCustomRequestOpen, onClose: onCustomRequestClose } = useDisclosure();
    const { isOpen: isAllocationOpen, onOpen: onAllocationOpen, onClose: onAllocationClose } = useDisclosure();
    const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [filteredSupplies, setFilteredSupplies] = useState<Supply[]>([]);
    const [isLoading, setIsLoading] = useState(loading);
    const { isOpen: isDeliveryModalOpen, onOpen: onDeliveryModalOpen, onClose: onDeliveryModalClose } = useDisclosure();
    const [deliveryDeadline, setDeliveryDeadline] = useState('');
    const [destination, setDestination] = useState('');
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
        if (savedCart > 0) setCart(savedCart);
    }, [router]);

    useEffect(() => {
        setIsLoading(true);
        Promise.resolve(loadInitialData()).finally(() => setIsLoading(false));
    }, [activeTab]);

    useEffect(() => {
        localStorage.setItem('@ti-assistant:cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        const filtered = supplies.filter(supply => {
            const matchesSearch = supply.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                supply.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || supply.category.id === selectedCategory;
            return matchesSearch && matchesCategory;
        });
        setFilteredSupplies(filtered);
    }, [supplies, searchQuery, selectedCategory]);

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

            setRequests(requestsData);
            setFilteredRequests(requestsData);
            setInventoryItems(inventoryData);
            setFilteredInventoryItems(inventoryData);
        } catch (error) {
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao carregar dados',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        setFilteredRequests(filterRequests(requests, searchQuery, statusFilter));
    }, [searchQuery, statusFilter, requests]);

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
        setIsLoading(loading);
    }, [loading]);

    const handleCardClick = async (itemId: string) => {
        if (activeTab === 1) {
            try {
                const token = localStorage.getItem('@ti-assistant:token');
                if (!token) throw new Error('Token não encontrado');
                const item = await fetchInventoryItemById(itemId, token);
                router.push(`/supply-requests/inventory/${itemId}`);
            } catch (error) {
                toast({
                    title: 'Erro',
                    description: error instanceof Error ? error.message : 'Erro ao buscar detalhes do inventário',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } else {
            router.push(`/supply-requests/${itemId}`);
        }
    };

    const handleRequesterConfirmationClick = async (requestId: string, confirmation: boolean) => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const request = requests.find(r => r.id === requestId);
            if (!request) {
                throw new Error('Requisição não encontrada');
            }

            await handleRequesterConfirmation(requestId, confirmation, token, request.is_custom || false);

            toast({
                title: 'Sucesso',
                description: 'Confirmação atualizada com sucesso',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            loadInitialData();
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

    const handleAllocateItem = (item: any) => {
        setSelectedItem(item);
        setIsAllocationModalOpen(true);
    };

    const handleAllocationSubmit = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            if (!token) {
                router.push('/login');
                return;
            }

            if (!selectedItem) {
                throw new Error('Item não selecionado');
            }

            await createAllocation({
                inventory_id: selectedItem.id,
                destination: allocationDestination,
                return_date: allocationDeadline,
                notes: allocationNotes
            }, token);

            toast({
                title: 'Sucesso',
                description: 'Item alocado com sucesso',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            setIsAllocationModalOpen(false);
            setSelectedItem(null);
            setAllocationDestination('');
            setAllocationNotes('');

            const updatedItems = await fetchAvailableInventory(token);
            setInventoryItems(updatedItems);
            setFilteredInventoryItems(updatedItems);
        } catch (error) {
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao alocar item',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleCustomRequestSubmit = async (data: any) => {
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
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Erro ao criar requisição customizada');
            }

            toast({
                title: 'Sucesso',
                description: 'Requisição customizada criada com sucesso',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            setIsCustomRequestModalOpen(false);
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

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        onSearch(query);
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        onCategoryChange(category);
    };

    const handleConfirmDeliveryDetails = () => {
        if (!deliveryDeadline || isNaN(new Date(deliveryDeadline).getTime())) {
            toast({
                title: 'Data de entrega inválida',
                description: 'Por favor, preencha uma data de entrega válida.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        if (!destination) {
            toast({
                title: 'Destino obrigatório',
                description: 'Por favor, preencha o campo de destino.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        localStorage.setItem('@ti-assistant:deliveryDeadline', deliveryDeadline);
        localStorage.setItem('@ti-assistant:destination', destination);
        onDeliveryModalClose();
        onSubmitRequest();
    };

    const renderContent = () => {
        switch (activeTab) {
            case 0: // Catálogo
                return (
                    <VStack spacing={4}>
                        <InputGroup size="md">
                            <InputLeftElement pointerEvents="none">
                                <SearchIcon color="gray.400" size={18} />
                            </InputLeftElement>
                            <Input
                                placeholder="Buscar suprimentos..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                size="md"
                            />
                        </InputGroup>

                        <SimpleGrid columns={2} spacing={2}>
                            {filteredSupplies.map((supply) => (
                                <Card
                                    key={supply.id}
                                    bg={bgColor}
                                    borderColor={borderColor}
                                    borderWidth="1px"
                                    cursor="pointer"
                                    onClick={() => handleCardClick(supply.id)}
                                    _hover={{
                                        bg: hoverBgColor,
                                        transform: 'translateY(-2px)',
                                        transition: 'all 0.2s ease-in-out',
                                    }}
                                >
                                    <CardBody p={2}>
                                        <VStack align="stretch" spacing={2}>
                                            <Image
                                                src={supply.image_url || '/placeholder.png'}
                                                alt={supply.name}
                                                borderRadius="md"
                                                height="120px"
                                                objectFit="cover"
                                            />
                                            <Heading size="xs" noOfLines={1}>{supply.name}</Heading>
                                            <Text color="gray.500" fontSize="xs" noOfLines={2}>
                                                {supply.description}
                                            </Text>
                                            <Wrap spacing={1}>
                                                <WrapItem>
                                                    <Badge colorScheme="blue" fontSize="2xs" maxW="100%" noOfLines={1}>
                                                        {supply.category.label}
                                                    </Badge>
                                                </WrapItem>
                                                {supply.subcategory && (
                                                    <WrapItem>
                                                        <Badge colorScheme="green" fontSize="2xs" maxW="100%" noOfLines={1}>
                                                            {supply.subcategory.label}
                                                        </Badge>
                                                    </WrapItem>
                                                )}
                                            </Wrap>
                                            <Text fontSize="2xs" color="gray.500">
                                                Qtd: {supply.quantity}
                                            </Text>
                                            <Button
                                                colorScheme="blue"
                                                padding="5px 0 5px"
                                                leftIcon={<ShoppingCart size={14} />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddToCart(supply);
                                                }}
                                                isDisabled={supply.quantity <= 0}
                                            >
                                                Adicionar
                                            </Button>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </SimpleGrid>
                    </VStack>
                );
            case 1: // Inventário
                return (
                    <VStack spacing={4}>
                        <InputGroup size="md">
                            <InputLeftElement pointerEvents="none">
                                <SearchIcon color="gray.400" size={18} />
                            </InputLeftElement>
                            <Input
                                placeholder="Buscar itens do inventário..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                size="md"
                            />
                        </InputGroup>

                        <SimpleGrid columns={2} spacing={3}>
                            {filteredInventoryItems.map((item) => (
                                <Card
                                    key={item.id}
                                    bg={bgColor}
                                    borderColor={borderColor}
                                    borderWidth="1px"
                                    cursor="pointer"
                                    onClick={() => handleCardClick(item.id)}
                                    _hover={{
                                        bg: hoverBgColor,
                                        transform: 'translateY(-2px)',
                                        transition: 'all 0.2s ease-in-out',
                                    }}
                                >
                                    <CardBody p={3}>
                                        <VStack align="stretch" spacing={2}>
                                            <Image
                                                src={item.image_url || '/placeholder.png'}
                                                alt={item.name}
                                                borderRadius="md"
                                                height="120px"
                                                objectFit="cover"
                                            />
                                            <Heading size="xs" noOfLines={1}>{item.name}</Heading>
                                            <Text color="gray.500" fontSize="xs" noOfLines={2}>
                                                {item.description}
                                            </Text>
                                            <Wrap spacing={1}>
                                                <WrapItem>
                                                    <Badge colorScheme="blue" fontSize="2xs" maxW="100%" noOfLines={1}>
                                                        {item.category.label}
                                                    </Badge>
                                                </WrapItem>
                                                {item.subcategory && (
                                                    <WrapItem>
                                                        <Badge colorScheme="green" fontSize="2xs" maxW="100%" noOfLines={1}>
                                                            {item.subcategory.label}
                                                        </Badge>
                                                    </WrapItem>
                                                )}
                                            </Wrap>
                                            <Text fontSize="2xs" color="gray.500">
                                                Status: {item.status === 'STANDBY' ? 'Disponível' : 'Em Uso'}
                                            </Text>
                                            <Button
                                                colorScheme="purple"
                                                size="xs"
                                                leftIcon={<TimerIcon size={14} />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAllocateItem(item);
                                                }}
                                                isDisabled={item.status !== 'STANDBY'}
                                            >
                                                Alocar
                                            </Button>
                                        </VStack>
                                    </CardBody>
                                </Card>
                            ))}
                        </SimpleGrid>
                    </VStack>
                );
            case 2: // Meus Pedidos
                return (
                    <VStack spacing={4}>
                        <InputGroup>
                            <InputLeftElement pointerEvents="none">
                                <SearchIcon color="gray.400" />
                            </InputLeftElement>
                            <Input
                                placeholder="Buscar por suprimento..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </InputGroup>
                        <Select
                            placeholder="Filtrar por status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="PENDING">Pendente</option>
                            <option value="APPROVED">Aprovado</option>
                            <option value="REJECTED">Rejeitado</option>
                            <option value="DELIVERED">Entregue</option>
                        </Select>

                        {filteredRequests.length === 0 ? (
                            <Flex direction="column" align="center" justify="center">
                                <Image
                                    src="/Task-complete.svg"
                                    alt="Nenhuma requisição encontrada"
                                    maxW="200px"
                                    mb={4}
                                />
                                <Text color="gray.500" fontSize="md">
                                    Nenhuma requisição encontrada
                                </Text>
                            </Flex>
                        ) : (
                            <VStack spacing={4} align="stretch">
                                {filteredRequests.map((request) => (
                                    <Card key={request.id} bg={bgColor} borderColor={borderColor}>
                                        <CardBody>
                                            <VStack align="stretch" spacing={3}>
                                                <HStack justify="space-between">
                                                    <Text fontWeight="bold">
                                                        {request.is_custom ? request.item_name : request.supply?.name}
                                                    </Text>
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
                                                </HStack>

                                                <Text fontSize="sm" color="gray.500">
                                                    {request.supply?.description || request.description}
                                                </Text>

                                                <HStack justify="space-between">
                                                    <Text fontSize="sm">
                                                        Quantidade: {request.quantity} {request.is_custom ? request.unit?.symbol || request.unit?.name : request.supply?.unit?.symbol || request.supply?.unit?.name}
                                                    </Text>
                                                    <Text fontSize="sm" color="gray.500">
                                                        {new Date(request.created_at).toLocaleDateString('pt-BR')}
                                                    </Text>
                                                </HStack>

                                                <VStack spacing={2} align="start">
                                                    <HStack>
                                                        <Text fontSize="sm">Requerente:</Text>
                                                        <Badge colorScheme={request.requester_confirmation ? 'green' : 'gray'}>
                                                            {request.requester_confirmation ? 'Confirmado' : 'Pendente'}
                                                        </Badge>
                                                    </HStack>
                                                    <HStack>
                                                        <Text fontSize="sm">Gerente:</Text>
                                                        <Badge colorScheme={request.manager_delivery_confirmation ? 'green' : 'gray'}>
                                                            {request.manager_delivery_confirmation ? 'Confirmado' : 'Pendente'}
                                                        </Badge>
                                                    </HStack>
                                                </VStack>

                                                {request.status === 'APPROVED' && !request.requester_confirmation && (
                                                    <Button
                                                        size="sm"
                                                        colorScheme="blue"
                                                        leftIcon={<CheckCircle size={16} />}
                                                        onClick={() => handleRequesterConfirmationClick(request.id, true)}
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
                    </VStack>
                );
            case 3: // Minhas Alocações
                return <MobileMyAllocationsPage />;
            case 4: // Carrinho
                return (
                    <VStack spacing={4}>
                        {cart.length === 0 ? (
                            <VStack spacing={4}>
                                <ShoppingCart size={48} />
                                <Text fontSize="lg" color="gray.500">Seu carrinho está vazio</Text>
                                <Button
                                    colorScheme="blue"
                                    onClick={() => setActiveTab(0)}
                                >
                                    Continuar Comprando
                                </Button>
                            </VStack>
                        ) : (
                            <VStack spacing={4}>
                                {cart.map((item) => (
                                    <Card key={item.supply.id} bg={bgColor} borderColor={borderColor}>
                                        <CardBody>
                                            <VStack align="stretch" spacing={3}>
                                                <HStack justify="space-between">
                                                    <VStack align="start" spacing={1}>
                                                        <Heading size="sm">{item.supply.name}</Heading>
                                                        <Text color="gray.500" fontSize="xs" noOfLines={2}>
                                                            {item.supply.description}
                                                        </Text>
                                                    </VStack>
                                                    <IconButton
                                                        aria-label="Remover item"
                                                        icon={<Trash2 size={16} />}
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newCart = cart.filter(cartItem => cartItem.supply.id !== item.supply.id);
                                                            setCart(newCart);
                                                            localStorage.setItem('@ti-assistant:cart', JSON.stringify(newCart));
                                                        }}
                                                    />
                                                </HStack>

                                                <HStack justify="space-between">
                                                    <Text fontSize="xs" color="gray.500">
                                                        Quantidade disponível: {item.supply.quantity}
                                                    </Text>
                                                    <NumberInput
                                                        value={item.quantity}
                                                        min={1}
                                                        max={item.supply.quantity}
                                                        onChange={(_, value) => {
                                                            const newCart = cart.map(cartItem =>
                                                                cartItem.supply.id === item.supply.id
                                                                    ? { ...cartItem, quantity: value }
                                                                    : cartItem
                                                            );
                                                            setCart(newCart);
                                                            localStorage.setItem('@ti-assistant:cart', JSON.stringify(newCart));
                                                        }}
                                                        size="xs"
                                                        maxW="100px"
                                                    >
                                                        <NumberInputField />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                </HStack>
                                            </VStack>
                                        </CardBody>
                                    </Card>
                                ))}

                                <Button
                                    colorScheme="green"
                                    size="lg"
                                    leftIcon={<ShoppingCart size={20} />}
                                    onClick={onDeliveryModalOpen}
                                >
                                    Finalizar Pedido
                                </Button>
                            </VStack>
                        )}
                    </VStack>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <Box p={4}>
                <Flex justify="center" align="center" minH="200px">
                    <Spinner size="xl" />
                </Flex>
            </Box>
        );
    }

    return (
        <Container maxW="max" px={0} py="3vh">
            <VStack spacing={4} align="stretch" h="100vh">
                <Flex justify="space-between" align="center" mt={18} marginTop='4vh' px={0}>
                    <Heading size="md">
                        {activeTab === 0 && "Catálogo"}
                        {activeTab === 1 && "Inventário"}
                        {activeTab === 2 && "Meus Pedidos"}
                        {activeTab === 3 && "Minhas Alocações"}
                        {activeTab === 4 && "Carrinho"}
                    </Heading>
                    {activeTab === 0 && (
                        <Button
                            leftIcon={<Plus size={20} />}
                            colorScheme="blue"
                            maxW="50%"
                            onClick={onCustomRequestOpen}
                            size="sm"
                            w="full"
                            bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
                            _hover={{
                                bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                                transform: 'translateY(-1px)',
                            }}
                            transition="all 0.3s ease"
                        >
                            Novo Pedido
                        </Button>
                    )}
                </Flex>

                <Box flex="1" overflowY="auto" pb="60px" px={2}>
                    {renderContent()}
                </Box>

                <HStack
                    position="fixed"
                    bottom={0}
                    left={0}
                    right={0}
                    bg={bgColor}
                    borderTop="1px"
                    borderColor={borderColor}
                    p={2}
                    spacing={0}
                    justify="space-around"
                    zIndex={10}
                >
                    <IconButton
                        aria-label="Catálogo"
                        icon={<Package size={20} />}
                        variant={activeTab === 0 ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 0 ? 'blue' : 'gray'}
                        onClick={() => setActiveTab(0)}
                    />
                    <IconButton
                        aria-label="Inventário"
                        icon={<BoxIcon size={20} />}
                        variant={activeTab === 1 ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 1 ? 'blue' : 'gray'}
                        onClick={() => setActiveTab(1)}
                    />
                    <IconButton
                        aria-label="Meus Pedidos"
                        icon={<ClipboardList size={20} />}
                        variant={activeTab === 2 ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 2 ? 'blue' : 'gray'}
                        onClick={() => setActiveTab(2)}
                    />
                    <IconButton
                        aria-label="Minhas Alocações"
                        icon={<TimerIcon size={20} />}
                        variant={activeTab === 3 ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 3 ? 'blue' : 'gray'}
                        onClick={() => setActiveTab(3)}
                    />
                    <IconButton
                        aria-label="Carrinho"
                        icon={<ShoppingCart size={20} />}
                        variant={activeTab === 4 ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 4 ? 'blue' : 'gray'}
                        onClick={() => setActiveTab(4)}
                    />
                </HStack>
            </VStack>

            <CustomSupplyRequestModal
                isOpen={isCustomRequestOpen}
                onClose={onCustomRequestClose}
                onSubmit={handleCustomRequestSubmit}
                userLocales={userLocales}
                localeId={localeId}
                setLocaleId={setLocaleId}
            />

            <Modal isOpen={isAllocationModalOpen} onClose={() => setIsAllocationModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Alocar Item</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Data de Devolução</FormLabel>
                                <Input
                                    type="date"
                                    value={allocationDeadline}
                                    onChange={(e) => setAllocationDeadline(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Local de Uso</FormLabel>
                                <Select
                                    placeholder="Selecione o local de destino"
                                    value={allocationDestination}
                                    onChange={(e) => setAllocationDestination(e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {userLocales.length > 0 && userLocales.map((locale) => (
                                        <option key={locale.id} value={locale.id}>{locale.name}</option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Observações</FormLabel>
                                <Textarea
                                    placeholder="Adicione observações relevantes..."
                                    value={allocationNotes}
                                    onChange={(e) => setAllocationNotes(e.target.value)}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={() => setIsAllocationModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            colorScheme="purple"
                            onClick={handleAllocationSubmit}
                            isDisabled={!allocationDeadline || !allocationDestination}
                        >
                            Confirmar Alocação
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Drawer isOpen={isFilterOpen} placement="bottom" onClose={onFilterClose}>
                <DrawerOverlay />
                <DrawerContent borderTopRadius="xl">
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth="1px">Filtros</DrawerHeader>
                    <DrawerBody py={4}>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>Categoria</FormLabel>
                                <Select
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    size="sm"
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    backdropFilter="blur(12px)"
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                >
                                    <option value="">Todas as categorias</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.label}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            <Modal isOpen={isDeliveryModalOpen} onClose={onDeliveryModalClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Detalhes da Entrega</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Data Limite para Entrega</FormLabel>
                                <Input
                                    type="date"
                                    value={deliveryDeadline}
                                    onChange={(e) => setDeliveryDeadline(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Destino</FormLabel>
                                <Input
                                    placeholder="Ex: Departamento de TI - Sala 101"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onDeliveryModalClose}>
                            Cancelar
                        </Button>
                        <Button colorScheme="green" onClick={handleConfirmDeliveryDetails}>
                            Confirmar Pedido
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
} 
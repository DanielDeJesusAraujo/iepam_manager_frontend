import {
    Box,
    Button,
    VStack,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerCloseButton,
    useDisclosure,
    Text,
    Badge,
    IconButton,
    useColorMode,
    Select,
    Card,
    CardBody,
    CardFooter,
    Divider,
    useToast,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Image,
    Flex,
    Heading,
    FormControl,
    FormLabel,
    DrawerFooter,
} from '@chakra-ui/react';
import { Search, Filter, CheckCircle, XCircle, ShoppingCart, TimerIcon } from 'lucide-react';
import { useState } from 'react';

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

interface MobileAdminSupplyRequestsProps {
    requests: SupplyRequest[];
    filteredRequests: SupplyRequest[];
    search: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    onApprove: (id: string, status: 'APPROVED' | 'REJECTED') => void;
    onReject: (id: string, status: 'APPROVED' | 'REJECTED') => void;
    onConfirmDelivery: (id: string, confirmation: boolean) => void;
    loading: boolean;
    allocationRequests: AllocationRequest[];
    filteredAllocationRequests: AllocationRequest[];
    onAllocationApprove?: (id: string, status: 'APPROVED' | 'REJECTED') => void;
    onAllocationReject?: (id: string, status: 'APPROVED' | 'REJECTED') => void;
    onAllocationConfirmDelivery?: (id: string, confirmation: boolean) => void;
}

export function MobileAdminSupplyRequests({
    requests,
    filteredRequests,
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    onApprove,
    onReject,
    onConfirmDelivery,
    loading,
    allocationRequests,
    filteredAllocationRequests,
    onAllocationApprove,
    onAllocationReject,
    onAllocationConfirmDelivery,
}: MobileAdminSupplyRequestsProps) {
    const { colorMode } = useColorMode();
    const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
    const [activeTab, setActiveTab] = useState(0);
    const toast = useToast();

    const renderContent = () => {
        switch (activeTab) {
            case 0: // Suprimentos
                return (
                    <VStack spacing={4} py="0">
                        <InputGroup size="md">
                            <InputLeftElement pointerEvents="none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </InputLeftElement>
                            <Input
                                placeholder="Buscar requisições..."
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
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

                        <Button
                            leftIcon={<Filter className="h-5 w-5" />}
                            onClick={onFilterOpen}
                            size="sm"
                            w="full"
                            bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.8)' : undefined}
                            _hover={{
                                bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.9)' : undefined,
                                transform: 'translateY(-1px)',
                            }}
                            transition="all 0.3s ease"
                        >
                            Filtros
                        </Button>

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
                            <VStack spacing={4} w="full">
                                {filteredRequests.map((request) => (
                                    <Card
                                        key={request.id}
                                        w="full"
                                        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                        backdropFilter="blur(12px)"
                                        borderWidth="1px"
                                        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                    >
                                        <CardBody>
                                            <VStack align="stretch" spacing={3}>
                                                <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                                                    {request.is_custom ? request.item_name : request.supply?.name}
                                                </Text>
                                                <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                                                    {request.user.name} - {request.user.email}
                                                </Text>
                                                <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                                                    Quantidade: {request.quantity} {request.supply?.unit?.symbol || request.unit?.symbol}
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
                                                    alignSelf="start"
                                                >
                                                    {request.status === 'PENDING'
                                                        ? 'Pendente'
                                                        : request.status === 'APPROVED'
                                                            ? 'Aprovado'
                                                            : request.status === 'REJECTED'
                                                                ? 'Rejeitado'
                                                                : 'Entregue'}
                                                </Badge>
                                                <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                                                    Data: {new Date(request.created_at).toLocaleDateString('pt-BR')}
                                                </Text>
                                            </VStack>
                                        </CardBody>
                                        <Divider />
                                        <CardFooter>
                                            {request.status === 'PENDING' && (
                                                <HStack spacing={2} w="full">
                                                    <Button
                                                        size="sm"
                                                        colorScheme="green"
                                                        onClick={() => onApprove(request.id, 'APPROVED')}
                                                        flex={1}
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
                                                        onClick={() => onReject(request.id, 'REJECTED')}
                                                        flex={1}
                                                        bg={colorMode === 'dark' ? 'rgba(245, 101, 101, 0.8)' : undefined}
                                                        _hover={{
                                                            bg: colorMode === 'dark' ? 'rgba(245, 101, 101, 0.9)' : undefined,
                                                            transform: 'translateY(-1px)',
                                                        }}
                                                        transition="all 0.3s ease"
                                                    >
                                                        Rejeitar
                                                    </Button>
                                                </HStack>
                                            )}
                                            {request.status === 'APPROVED' && !request.manager_delivery_confirmation && (
                                                <Button
                                                    size="sm"
                                                    colorScheme="blue"
                                                    onClick={() => onConfirmDelivery(request.id, true)}
                                                    w="full"
                                                    bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
                                                    _hover={{
                                                        bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                                                        transform: 'translateY(-1px)',
                                                    }}
                                                    transition="all 0.3s ease"
                                                >
                                                    Confirmar Entrega
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                ))}
                            </VStack>
                        )}
                    </VStack>
                );
            case 1: // Alocações
                return (
                    <VStack spacing={4} py="0">
                        <InputGroup size="md">
                            <InputLeftElement pointerEvents="none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </InputLeftElement>
                            <Input
                                placeholder="Buscar alocações..."
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
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

                        <Button
                            leftIcon={<Filter className="h-5 w-5" />}
                            onClick={onFilterOpen}
                            size="sm"
                            w="full"
                            bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.8)' : undefined}
                            _hover={{
                                bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.9)' : undefined,
                                transform: 'translateY(-1px)',
                            }}
                            transition="all 0.3s ease"
                        >
                            Filtros
                        </Button>

                        {filteredAllocationRequests.length === 0 ? (
                            <Flex direction="column" align="center" justify="center">
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
                            <VStack spacing={4} w="full">
                                {filteredAllocationRequests.map((request) => (
                                    <Card
                                        key={request.id}
                                        w="full"
                                        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                        backdropFilter="blur(12px)"
                                        borderWidth="1px"
                                        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                    >
                                        <CardBody>
                                            <VStack align="stretch" spacing={3}>
                                                <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                                                    {request.inventory.name}
                                                </Text>
                                                <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                                                    {request.requester.name} - {request.requester.email}
                                                </Text>
                                                <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                                                    Modelo: {request.inventory.model}
                                                </Text>
                                                <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                                                    Série: {request.inventory.serial_number}
                                                </Text>
                                                <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                                                    Destino: {request.destination}
                                                </Text>
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
                                                    alignSelf="start"
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
                                                <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                                                    Retorno: {new Date(request.return_date).toLocaleDateString('pt-BR')}
                                                </Text>
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
                                            </VStack>
                                        </CardBody>
                                        <Divider />
                                        <CardFooter>
                                            {request.status === 'PENDING' && (
                                                <HStack spacing={2} w="full">
                                                    <Button
                                                        size="sm"
                                                        colorScheme="green"
                                                        onClick={() => onAllocationApprove?.(request.id, 'APPROVED')}
                                                        flex={1}
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
                                                        onClick={() => onAllocationReject?.(request.id, 'REJECTED')}
                                                        flex={1}
                                                        bg={colorMode === 'dark' ? 'rgba(245, 101, 101, 0.8)' : undefined}
                                                        _hover={{
                                                            bg: colorMode === 'dark' ? 'rgba(245, 101, 101, 0.9)' : undefined,
                                                            transform: 'translateY(-1px)',
                                                        }}
                                                        transition="all 0.3s ease"
                                                    >
                                                        Rejeitar
                                                    </Button>
                                                </HStack>
                                            )}
                                            {request.status === 'APPROVED' && !request.manager_delivery_confirmation && (
                                                <Button
                                                    size="sm"
                                                    colorScheme="blue"
                                                    onClick={() => onAllocationConfirmDelivery?.(request.id, true)}
                                                    w="full"
                                                    bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
                                                    _hover={{
                                                        bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                                                        transform: 'translateY(-1px)',
                                                    }}
                                                    transition="all 0.3s ease"
                                                >
                                                    Confirmar Entrega
                                                </Button>
                                            )}
                                        </CardFooter>
                                    </Card>
                                ))}
                            </VStack>
                        )}
                    </VStack>
                );
            default:
                return null;
        }
    };

    const handleStatusFilterChange = (status: string) => {
        onStatusFilterChange(status);
        onFilterClose();
    };

    return (
        <Box position="relative" h="100vh" overflow="hidden" py="0">
            <Box
                position="fixed"
                top={0}
                left={0}
                right={0}
                zIndex={1}
                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)'}
                backdropFilter="blur(12px)"
                borderBottom="1px solid"
                borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
            >
                <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="lg" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                        Requisições
                    </Heading>
                    <Button
                        leftIcon={<Filter />}
                        onClick={onFilterOpen}
                        size="sm"
                        variant="ghost"
                        colorScheme={colorMode === 'dark' ? 'blue' : 'gray'}
                    >
                        Filtros
                    </Button>
                </Flex>
            </Box>

            <Box
                position="fixed"
                bottom={0}
                left={0}
                right={0}
                zIndex={1}
                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)'}
                backdropFilter="blur(12px)"
                borderTop="1px solid"
                borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                p={2}
            >
                <HStack spacing={2} justify="space-around">
                    <Button
                        flex={1}
                        variant={activeTab === 0 ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 0 ? 'blue' : 'gray'}
                        onClick={() => setActiveTab(0)}
                        leftIcon={<ShoppingCart size={20} />}
                        size="sm"
                    >
                        Suprimentos
                    </Button>
                    <Button
                        flex={1}
                        variant={activeTab === 1 ? 'solid' : 'ghost'}
                        colorScheme={activeTab === 1 ? 'blue' : 'gray'}
                        onClick={() => setActiveTab(1)}
                        leftIcon={<TimerIcon size={20} />}
                        size="sm"
                    >
                        Alocações
                    </Button>
                </HStack>
            </Box>

            <Box
                pt="120px"
                pb="80px"
                h="100vh"
                overflowY="auto"
                px={4}
            >
                {renderContent()}
            </Box>

            <Drawer
                isOpen={isFilterOpen}
                placement="right"
                onClose={onFilterClose}
                size="full"
            >
                <DrawerOverlay />
                <DrawerContent
                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)'}
                    backdropFilter="blur(12px)"
                >
                    <DrawerHeader borderBottomWidth="1px" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                        Filtros
                    </DrawerHeader>
                    <DrawerBody>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Status</FormLabel>
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                                    size="sm"
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                >
                                    <option value="">Todos</option>
                                    <option value="PENDING">Pendente</option>
                                    <option value="APPROVED">Aprovado</option>
                                    <option value="REJECTED">Rejeitado</option>
                                    <option value="DELIVERED">Entregue</option>
                                    {activeTab === 1 && <option value="RETURNED">Devolvido</option>}
                                </Select>
                            </FormControl>
                        </VStack>
                    </DrawerBody>
                    <DrawerFooter borderTopWidth="1px">
                        <Button variant="outline" mr={3} onClick={onFilterClose}>
                            Fechar
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </Box>
    );
} 
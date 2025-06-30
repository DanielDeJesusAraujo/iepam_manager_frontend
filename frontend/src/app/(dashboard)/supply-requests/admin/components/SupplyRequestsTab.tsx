'use client';

import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Button,
    InputGroup,
    InputLeftElement,
    Input,
    Select,
    Text,
    Flex,
    VStack,
    HStack,
    useColorModeValue,
    Image,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { CheckCircle, XCircle } from 'lucide-react';

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
    requester_delivery_confirmation: boolean;
    manager_delivery_confirmation: boolean;
    is_custom?: boolean;
}

interface SupplyRequestsTabProps {
    requests: SupplyRequest[];
    filteredRequests: SupplyRequest[];
    search: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    onApprove: (id: string, status: 'APPROVED' | 'REJECTED') => void;
    onReject: (id: string, status: 'APPROVED' | 'REJECTED') => void;
    onConfirmDelivery: (request: any, confirmation: boolean) => void;
}

export function SupplyRequestsTab({
    requests,
    filteredRequests,
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    onApprove,
    onReject,
    onConfirmDelivery,
}: SupplyRequestsTabProps) {
    const colorMode = useColorModeValue('light', 'dark');

    return (
        <Box
            bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
            p={6}
            borderRadius="lg"
            boxShadow="sm"
            borderWidth="1px"
            borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
            backdropFilter="blur(12px)"
        >
            <Flex gap={4} mb={4} justify="space-between">
                <InputGroup>
                    <InputLeftElement pointerEvents="none">
                        <SearchIcon color={colorMode === 'dark' ? 'gray.400' : 'gray.300'} />
                    </InputLeftElement>
                    <Input
                        placeholder="Buscar por suprimento ou usuário..."
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
                <Select
                    placeholder="Filtrar por status"
                    value={statusFilter}
                    onChange={(e) => onStatusFilterChange(e.target.value)}
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
                                            {request.status === 'PENDING' && (
                                                <HStack spacing={2} mt={2}>
                                                    <Button
                                                        size="sm"
                                                        colorScheme="green"
                                                        leftIcon={<CheckCircle size={14} />}
                                                        onClick={() => onApprove(request.id, 'APPROVED')}
                                                        minW="100px"
                                                        h="32px"
                                                        fontSize="xs"
                                                        fontWeight="medium"
                                                        _hover={{
                                                            transform: 'translateY(-1px)',
                                                            boxShadow: 'md',
                                                        }}
                                                        transition="all 0.2s ease"
                                                    >
                                                        Aprovar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        colorScheme="red"
                                                        leftIcon={<XCircle size={14} />}
                                                        onClick={() => onReject(request.id, 'REJECTED')}
                                                        minW="100px"
                                                        h="32px"
                                                        fontSize="xs"
                                                        fontWeight="medium"
                                                        _hover={{
                                                            transform: 'translateY(-1px)',
                                                            boxShadow: 'md',
                                                        }}
                                                        transition="all 0.2s ease"
                                                    >
                                                        Rejeitar
                                                    </Button>
                                                </HStack>
                                            )}
                                            {request.status === 'APPROVED' && !request.manager_delivery_confirmation && (
                                                <Button
                                                    size="sm"
                                                    colorScheme="blue"
                                                    leftIcon={<CheckCircle size={14} />}
                                                    onClick={() => onConfirmDelivery(request, true)}
                                                    minW="140px"
                                                    h="32px"
                                                    fontSize="xs"
                                                    fontWeight="medium"
                                                    mt={2}
                                                    _hover={{
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: 'md',
                                                    }}
                                                    transition="all 0.2s ease"
                                                >
                                                    Confirmar Entrega
                                                </Button>
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
    );
} 
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
    InputGroup,
    InputLeftElement,
    Input,
    Select,
    Text,
    Flex,
    VStack,
    useColorModeValue,
    Image,
    Button,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FileText, RotateCcw } from 'lucide-react';

interface SupplyTransaction {
    id: string;
    supply: {
        id: string;
        name: string;
        description?: string;
        quantity: number;
        unit: {
            id: string;
            name: string;
            symbol: string;
        };
    };
    from_user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    to_user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    quantity: number;
    transaction_type: string;
    movement_type: 'IN' | 'OUT';
    notes?: string;
    sector?: {
        id: string;
        name: string;
        location: {
            id: string;
            name: string;
        };
    };
    created_at: string;
}

interface SupplyTransactionsTabProps {
    supplyTransactions: SupplyTransaction[];
    filteredSupplyTransactions: SupplyTransaction[];
    search: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    onExportPDF: () => void;
    onClearFilters: () => void;
}

export function SupplyTransactionsTab({
    supplyTransactions,
    filteredSupplyTransactions,
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    onExportPDF,
    onClearFilters,
}: SupplyTransactionsTabProps) {
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
                        placeholder="Buscar por item ou usuário..."
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
                    <option value="DELIVERY">Entrega</option>
                    <option value="RETURN">Devolução</option>
                    <option value="PURCHASE">Compra</option>
                    <option value="ADJUSTMENT">Ajuste</option>
                </Select>

                <Button
                    size="sm"
                    onClick={onExportPDF}
                    colorScheme="blue"
                    leftIcon={<FileText size={16} />}
                    isDisabled={filteredSupplyTransactions.length === 0}
                    minW="140px"
                    h="36px"
                    fontSize="sm"
                    fontWeight="medium"
                    _hover={{
                        transform: 'translateY(-1px)',
                        boxShadow: 'lg',
                    }}
                    transition="all 0.2s ease"
                >
                    Exportar PDF
                </Button>

                <Button
                    size="sm"
                    onClick={onClearFilters}
                    colorScheme="gray"
                    variant="outline"
                    leftIcon={<RotateCcw size={16} />}
                    minW="140px"
                    h="36px"
                    fontSize="sm"
                    fontWeight="medium"
                    _hover={{
                        transform: 'translateY(-1px)',
                        boxShadow: 'lg',
                    }}
                    transition="all 0.2s ease"
                >
                    Limpar Filtros
                </Button>
            </Flex>

            {filteredSupplyTransactions.length === 0 ? (
                <Flex direction="column" align="center" justify="center" py={8}>
                    <Image
                        src="/Task-complete.svg"
                        alt="Nenhuma transação encontrada"
                        maxW="300px"
                        mb={4}
                    />
                    <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.500'} fontSize="lg">
                        Nenhuma transação encontrada
                    </Text>
                </Flex>
            ) : (
                <Box overflowX="auto">
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Suprimento</Th>
                                <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Tipo</Th>
                                <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Movimento</Th>
                                <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>De</Th>
                                <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Para</Th>
                                <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Quantidade</Th>
                                <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Setor</Th>
                                <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Data</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredSupplyTransactions.map((transaction) => (
                                <Tr
                                    key={transaction.id}
                                    transition="all 0.3s ease"
                                    _hover={{
                                        bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                                        transform: 'translateY(-1px)',
                                    }}
                                >
                                    <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                        <VStack align="start" spacing={1}>
                                            <Text fontWeight="bold">{transaction.supply.name}</Text>
                                            <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                                                {transaction.supply.description}
                                            </Text>
                                        </VStack>
                                    </Td>
                                    <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                        <Badge
                                            colorScheme={
                                                transaction.transaction_type === 'DELIVERY'
                                                    ? 'blue'
                                                    : transaction.transaction_type === 'RETURN'
                                                        ? 'green'
                                                        : transaction.transaction_type === 'PURCHASE'
                                                            ? 'orange'
                                                            : transaction.transaction_type === 'ADJUSTMENT'
                                                                ? 'purple'
                                                                : 'gray'
                                             }
                                        >
                                            {transaction.transaction_type === 'DELIVERY'
                                                ? 'Entrega'
                                                : transaction.transaction_type === 'RETURN'
                                                    ? 'Devolução'
                                                    : transaction.transaction_type === 'PURCHASE'
                                                        ? 'Compra'
                                                        : transaction.transaction_type === 'ADJUSTMENT'
                                                            ? 'Ajuste'
                                                            : transaction.transaction_type}
                                        </Badge>
                                    </Td>
                                    <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                        <Badge
                                            colorScheme={transaction.movement_type === 'IN' ? 'green' : 'red'}
                                        >
                                            {transaction.movement_type === 'IN' ? 'Entrada' : 'Saída'}
                                        </Badge>
                                    </Td>
                                    <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                        <Text color={colorMode === 'dark' ? 'white' : 'gray.800'}>{transaction.from_user.name}</Text>
                                        <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                                            {transaction.from_user.email}
                                        </Text>
                                    </Td>
                                    <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                        <Text color={colorMode === 'dark' ? 'white' : 'gray.800'}>{transaction.to_user.name}</Text>
                                        <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                                            {transaction.to_user.email}
                                        </Text>
                                    </Td>
                                    <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                        {transaction.quantity} {transaction.supply.unit.symbol}
                                    </Td>
                                    <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                        {transaction.sector ? (
                                            <VStack align="start" spacing={1}>
                                                <Text fontWeight="bold">{transaction.sector.name}</Text>
                                                <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                                                    {transaction.sector.location.name}
                                                </Text>
                                            </VStack>
                                        ) : (
                                            <Text color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} fontSize="sm">
                                                N/A
                                            </Text>
                                        )}
                                    </Td>
                                    <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                        {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
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
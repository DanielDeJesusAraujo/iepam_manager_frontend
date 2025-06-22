import {
    Box,
    VStack,
    HStack,
    Text,
    Badge,
    IconButton,
    Tooltip,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useColorMode,
    Flex,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { InventoryItem } from '../types';
import { getStatusColor, getStatusLabel } from '../utils/statusUtils';
import formatCurrency from '../utils/formatCurrency';

interface ItemViewsProps {
    items: InventoryItem[];
    onDelete: (id: string) => void;
    onEdit: (item: InventoryItem) => void;
}

export const MobileView = ({ items, onDelete, onEdit }: ItemViewsProps) => {
    const { colorMode } = useColorMode();

    return (
        <VStack spacing={3} align="stretch" marginTop="4vh">
            {items.map(item => (
                <Box
                    key={item.id}
                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                    backdropFilter="blur(12px)"
                    border="1px solid"
                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                    borderRadius="lg"
                    p={3}
                    position="relative"
                    transition="all 0.3s ease"
                    _hover={{
                        bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                        transform: 'translateY(-2px)',
                        shadow: 'lg'
                    }}
                >
                    <Flex justify="space-between" align="center" mb={2}>
                        <HStack spacing={2}>
                            <HStack spacing={2} flexWrap="wrap" gap={1}>
                                <Badge colorScheme="blue" fontSize="xs">{item.item}</Badge>
                                <Badge colorScheme="purple" fontSize="xs">{item.category.label}</Badge>
                                <Badge colorScheme={getStatusColor(item.status)} fontSize="xs">
                                    {getStatusLabel(item.status)}
                                </Badge>
                            </HStack>
                        </HStack>
                        <HStack spacing={1}>
                            <Tooltip label="Editar">
                                <IconButton
                                    aria-label="Editar item"
                                    icon={<FiEdit2 size="14px" />}
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => onEdit(item)}
                                    _hover={{
                                        bg: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                        transform: 'translateY(-1px)'
                                    }}
                                    transition="all 0.2s ease"
                                />
                            </Tooltip>
                            <Tooltip label="Excluir">
                                <IconButton
                                    aria-label="Excluir item"
                                    icon={<FiTrash2 size="14px" />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => onDelete(item.id)}
                                    _hover={{
                                        bg: colorMode === 'dark' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                                        transform: 'translateY(-1px)'
                                    }}
                                    transition="all 0.2s ease"
                                />
                            </Tooltip>
                        </HStack>
                    </Flex>

                    <VStack align="stretch" spacing={2}>
                        <Box>
                            <Text fontWeight="bold" fontSize="sm" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Nome</Text>
                            <Text fontSize="md" noOfLines={1} color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{item.name}</Text>
                        </Box>

                        <HStack spacing={4}>
                            <Box flex={1}>
                                <Text fontWeight="bold" fontSize="xs" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Modelo</Text>
                                <Text fontSize="sm" noOfLines={1} color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{item.model}</Text>
                            </Box>
                            <Box flex={1}>
                                <Text fontWeight="bold" fontSize="xs" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Nº Série</Text>
                                <Text fontSize="sm" fontFamily="mono" noOfLines={1} color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{item.serial_number}</Text>
                            </Box>
                        </HStack>

                        <HStack spacing={4}>
                            <Box flex={1}>
                                <Text fontWeight="bold" fontSize="xs" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Localização</Text>
                                <Text fontSize="sm" noOfLines={1} color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{item.location.name}</Text>
                            </Box>
                            <Box flex={1}>
                                <Text fontWeight="bold" fontSize="xs" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Ambiente</Text>
                                <Text fontSize="sm" noOfLines={1} color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{item.locale?.name || '-'}</Text>
                            </Box>
                        </HStack>

                        <Box>
                            <Text fontWeight="bold" fontSize="xs" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Preço de Aquisição</Text>
                            <Text fontSize="sm" noOfLines={1} color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{formatCurrency(item.acquisition_price)}</Text>
                        </Box>

                        <Box>
                            <Text fontWeight="bold" fontSize="xs" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Subcategoria</Text>
                            <Text fontSize="sm" noOfLines={1} color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{item.subcategory.label}</Text>
                        </Box>
                    </VStack>
                </Box>
            ))}
        </VStack>
    );
};

export const DesktopView = ({ items, onDelete, onEdit }: ItemViewsProps) => {
    const { colorMode } = useColorMode();

    return (
        <Box
            bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
            p={6}
            borderRadius="lg"
            boxShadow="sm"
            borderWidth="1px"
            borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
            backdropFilter="blur(12px)"
            overflowX="auto"
        >
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Item</Th>
                        <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Fabricante</Th>
                        <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Modelo</Th>
                        <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Número de Série</Th>
                        <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Status</Th>
                        <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Localização</Th>
                        <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Ambiente</Th>
                        <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Preço de Aquisição</Th>
                        <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Categoria</Th>
                        <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Subcategoria</Th>
                        <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Ações</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {items.map((item) => (
                        <Tr
                            key={item.id}
                            transition="all 0.3s ease"
                            _hover={{
                                bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                                transform: 'translateY(-1px)',
                            }}
                        >
                            <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                <Badge colorScheme="blue">{item.item}</Badge>
                            </Td>
                            <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>{item.name}</Td>
                            <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>{item.model}</Td>
                            <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                <Text fontFamily="mono" color={colorMode === 'dark' ? 'white' : 'gray.800'}>{item.serial_number}</Text>
                            </Td>
                            <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                <Badge colorScheme={getStatusColor(item.status)}>
                                    {getStatusLabel(item.status)}
                                </Badge>
                            </Td>
                            <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>{item.location.name}</Td>
                            <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>{item.locale?.name || '-'}</Td>
                            <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>{formatCurrency(item.acquisition_price)}</Td>
                            <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>{item.category.label}</Td>
                            <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>{item.subcategory.label}</Td>
                            <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                <HStack spacing={2}>
                                    <Tooltip label="Editar">
                                        <IconButton
                                            aria-label="Editar item"
                                            icon={<FiEdit2 />}
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onEdit(item)}
                                            _hover={{
                                                bg: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                                transform: 'translateY(-1px)'
                                            }}
                                            transition="all 0.2s ease"
                                        />
                                    </Tooltip>
                                    <Tooltip label="Excluir">
                                        <IconButton
                                            aria-label="Excluir item"
                                            icon={<FiTrash2 />}
                                            size="sm"
                                            variant="ghost"
                                            colorScheme="red"
                                            onClick={() => onDelete(item.id)}
                                            _hover={{
                                                bg: colorMode === 'dark' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                                                transform: 'translateY(-1px)'
                                            }}
                                            transition="all 0.2s ease"
                                        />
                                    </Tooltip>
                                </HStack>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
}; 
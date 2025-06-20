'use client';

import { useEffect, useState, useRef } from 'react';
import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useDisclosure,
    useToast,
    Text,
    Badge,
    IconButton,
    Tooltip,
    useColorModeValue,
    HStack,
    VStack,
    Divider,
    useBreakpointValue,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerCloseButton,
    FormControl,
    FormLabel,
    Stack,
    StackDivider,
    useColorMode,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
} from '@chakra-ui/react';
import { FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiBarChart2 } from 'react-icons/fi';
import { InventoryModal } from './components/InventoryModal';
import { exportInventoryPDF } from './utils/exportInventoryPDF';
import { Chart, registerables } from 'chart.js';
import Link from 'next/link';
import { PieChart } from './components/PieChart';
import { filterItems } from './utils/filterUtils';
import { MobileView, DesktopView } from './components/ItemViews';
import { InventoryItem, GroupByOption } from './types';
import { groupItems } from './utils/groupUtils';

export default function InventoryPage() {
    const [groupBy, setGroupBy] = useState<GroupByOption>('none');
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
    const [subcategories, setSubcategories] = useState<{ id: string; label: string }[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const { colorMode } = useColorMode();
    Chart.register(...registerables);

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    const isMobile = useBreakpointValue({ base: true, md: false });
    const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();

    useEffect(() => {
        fetchItems();
        fetchCategories();
    }, []);

    const fetchItems = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token')
            const response = await fetch('/api/inventory', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            toast({
                title: 'Erro ao carregar inventário',
                description: 'Não foi possível carregar os itens do inventário.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setItems([]);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token')
            const response = await fetch('/api/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            setCategories([]);
        }
    };

    const handleCategoryChange = async (categoryId: string) => {
        setSelectedCategory(categoryId);
        setSelectedSubcategory('');

        if (categoryId) {
            try {
                const token = localStorage.getItem('@ti-assistant:token')
                const response = await fetch(`/api/subcategories/category/${categoryId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                setSubcategories(Array.isArray(data) ? data : []);
            } catch (error) {
                setSubcategories([]);
            }
        } else {
            setSubcategories([]);
        }
    };

    const handleCreate = async (data: any) => {
        try {
            const token = localStorage.getItem('@ti-assistant:token')
            const response = await fetch('/api/inventory', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Erro ao criar item');
            }

            toast({
                title: 'Item criado',
                description: 'O item foi adicionado ao inventário com sucesso.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            fetchItems();
            onClose();
        } catch (error: any) {
            toast({
                title: 'Erro ao criar item',
                description: error.message || 'Não foi possível criar o item.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este item?')) {
            try {
                const token = localStorage.getItem('@ti-assistant:token')
                const response = await fetch(`/api/inventory/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Erro ao excluir item');
                }

                toast({
                    title: 'Item excluído',
                    description: 'O item foi removido do inventário com sucesso.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                fetchItems();
            } catch (error) {
                toast({
                    title: 'Erro ao excluir item',
                    description: 'Não foi possível excluir o item.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };

    const handleExportPDF = async () => {
        try {
            await exportInventoryPDF(filteredItems, groupBy);
        } catch (error) {
            toast({
                title: 'Erro ao exportar PDF',
                description: 'Não foi possível gerar o relatório em PDF.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const filteredItems = filterItems(items, searchTerm, selectedCategory, selectedSubcategory);
    const groupedItems = groupItems(filteredItems, groupBy);

    return (
        <Box w="full" h="full" py={isMobile ? "6vh" : undefined}> 
            <VStack
                spacing={4}
                align="stretch"
                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                backdropFilter="blur(12px)"
                p={isMobile ? 3 : 6}
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
                    {!isMobile && <Heading size="lg" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Inventário</Heading>}
                    <HStack 
                        spacing={2} 
                        w="100%" 
                        justify={isMobile ? "space-between" : "flex-end"}
                        wrap="wrap"
                    >
                        {isMobile ? (
                            <>
                                <VStack spacing={2} w="100%">
                                    <Button
                                        leftIcon={<FiPlus />}
                                        colorScheme="blue"
                                        onClick={onOpen}
                                        size="sm"
                                        w="100%"
                                        bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
                                        _hover={{
                                            bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                                            transform: 'translateY(-1px)',
                                        }}
                                        transition="all 0.3s ease"
                                    >
                                        Novo Item
                                    </Button>
                                    <Button
                                        leftIcon={<FiBarChart2 />}
                                        colorScheme="purple"
                                        as={Link}
                                        href="/inventory/statistics"
                                        size="sm"
                                        w="100%"
                                        bg={colorMode === 'dark' ? 'rgba(159, 122, 234, 0.8)' : undefined}
                                        _hover={{
                                            bg: colorMode === 'dark' ? 'rgba(159, 122, 234, 0.9)' : undefined,
                                            transform: 'translateY(-1px)',
                                        }}
                                        transition="all 0.3s ease"
                                    >
                                        Estatísticas
                                    </Button>
                                    <Button
                                        colorScheme="green"
                                        onClick={handleExportPDF}
                                        size="sm"
                                        w="100%"
                                        bg={colorMode === 'dark' ? 'rgba(72, 187, 120, 0.8)' : undefined}
                                        _hover={{
                                            bg: colorMode === 'dark' ? 'rgba(72, 187, 120, 0.9)' : undefined,
                                            transform: 'translateY(-1px)',
                                        }}
                                        transition="all 0.3s ease"
                                    >
                                        Exportar PDF
                                    </Button>
                                </VStack>
                            </>
                        ) : (
                            <>
                                <Menu>
                                    <MenuButton
                                        as={Button}
                                        leftIcon={<FiFilter />}
                                        size="md"
                                        bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
                                        _hover={{
                                            bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                                            transform: 'translateY(-1px)',
                                        }}
                                        transition="all 0.3s ease"
                                    >
                                        Agrupar por
                                    </MenuButton>
                                    <MenuList>
                                        <MenuItem
                                            onClick={() => setGroupBy('none')}
                                            bg={groupBy === 'none' ? 'blue.50' : undefined}
                                        >
                                            Sem agrupamento
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => setGroupBy('location')}
                                            bg={groupBy === 'location' ? 'blue.50' : undefined}
                                        >
                                            Localização
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => setGroupBy('category')}
                                            bg={groupBy === 'category' ? 'blue.50' : undefined}
                                        >
                                            Categoria
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => setGroupBy('status')}
                                            bg={groupBy === 'status' ? 'blue.50' : undefined}
                                        >
                                            Status
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => setGroupBy('subcategory')}
                                            bg={groupBy === 'subcategory' ? 'blue.50' : undefined}
                                        >
                                            Subcategoria
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                                <Button
                                    leftIcon={<FiBarChart2 />}
                                    colorScheme="purple"
                                    as={Link}
                                    href="/inventory/statistics"
                                    size="md"
                                    bg={colorMode === 'dark' ? 'rgba(159, 122, 234, 0.8)' : undefined}
                                    _hover={{
                                        bg: colorMode === 'dark' ? 'rgba(159, 122, 234, 0.9)' : undefined,
                                        transform: 'translateY(-1px)',
                                    }}
                                    transition="all 0.3s ease"
                                >
                                    Estatísticas
                                </Button>
                                <Button
                                    leftIcon={<FiPlus />}
                                    colorScheme="blue"
                                    onClick={onOpen}
                                    size="md"
                                    bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
                                    _hover={{
                                        bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                                        transform: 'translateY(-1px)',
                                    }}
                                    transition="all 0.3s ease"
                                >
                                    Novo Item
                                </Button>
                                <Button
                                    colorScheme="green"
                                    onClick={handleExportPDF}
                                    size="md"
                                    bg={colorMode === 'dark' ? 'rgba(72, 187, 120, 0.8)' : undefined}
                                    _hover={{
                                        bg: colorMode === 'dark' ? 'rgba(72, 187, 120, 0.9)' : undefined,
                                        transform: 'translateY(-1px)',
                                    }}
                                    transition="all 0.3s ease"
                                >
                                    Exportar PDF
                                </Button>
                            </>
                        )}
                    </HStack>
                </Flex>

                {isMobile ? (
                    <>
                        <VStack spacing={3} align="stretch">
                            <InputGroup size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <FiSearch color={colorMode === 'dark' ? 'gray.400' : 'gray.300'} />
                                </InputLeftElement>
                                <Input
                                    placeholder="Buscar item..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
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
                                leftIcon={<FiFilter />}
                                size="sm"
                                variant="outline"
                                onClick={onFilterOpen}
                                w="100%"
                                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                backdropFilter="blur(12px)"
                                borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                _hover={{
                                    bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                                    transform: 'translateY(-1px)',
                                }}
                                transition="all 0.3s ease"
                            >
                                Filtros
                            </Button>
                        </VStack>

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
                                                value={selectedCategory}
                                                onChange={(e) => handleCategoryChange(e.target.value)}
                                                size="sm"
                                            >
                                                <option value="">Todas</option>
                                                {Array.isArray(categories) && categories.map(category => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.label}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Subcategoria</FormLabel>
                                            <Select
                                                value={selectedSubcategory}
                                                onChange={(e) => setSelectedSubcategory(e.target.value)}
                                                isDisabled={!selectedCategory}
                                                size="sm"
                                            >
                                                <option value="">Todas</option>
                                                {Array.isArray(subcategories) && subcategories.map(subcategory => (
                                                    <option key={subcategory.id} value={subcategory.id}>
                                                        {subcategory.label}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </VStack>
                                </DrawerBody>
                            </DrawerContent>
                        </Drawer>
                    </>
                ) : (
                    <HStack spacing={4} wrap="wrap">
                        <InputGroup maxW="400px">
                            <InputLeftElement pointerEvents="none">
                                <FiSearch color="gray.300" />
                            </InputLeftElement>
                            <Input
                                placeholder="Buscar por nome, modelo ou número de série..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                            placeholder="Categoria"
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
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
                            {Array.isArray(categories) && categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.label}
                                </option>
                            ))}
                        </Select>

                        <Select
                            placeholder="Subcategoria"
                            value={selectedSubcategory}
                            onChange={(e) => setSelectedSubcategory(e.target.value)}
                            maxW="200px"
                            isDisabled={!selectedCategory}
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
                            {Array.isArray(subcategories) && subcategories.map(subcategory => (
                                <option key={subcategory.id} value={subcategory.id}>
                                    {subcategory.label}
                                </option>
                            ))}
                        </Select>
                    </HStack>
                )}

                <Divider />

                <Box flex="1" overflowY="auto">
                    {Object.entries(groupedItems).map(([groupName, groupItems]) => (
                        <Box key={groupName} mb={6}>
                            <Heading size="md" mb={4} color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                                {groupName} ({groupItems.length})
                            </Heading>
                            {isMobile ? (
                                <MobileView items={groupItems} onDelete={handleDelete} />
                            ) : (
                                <DesktopView items={groupItems} onDelete={handleDelete} />
                            )}
                        </Box>
                    ))}
                </Box>
            </VStack>

            <InventoryModal
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={handleCreate}
            />
        </Box>
    );
} 
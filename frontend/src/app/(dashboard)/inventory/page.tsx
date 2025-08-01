'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { InventoryHeader } from './components/InventoryHeader';
import { InventoryFilters } from './components/InventoryFilters';
import {
  fetchItems,
  fetchCategories,
  fetchSubcategories,
  createItem,
  updateItem,
  deleteItem,
  depreciateAll
} from './utils/inventoryApi';

export default function InventoryPage() {
    const router = useRouter();
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
    const isMobile = useBreakpointValue({ base: true, md: false });
    const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
    const [editItem, setEditItem] = useState<InventoryItem | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        console.log('[Inventory] useEffect: carregando itens e categorias');
        loadItems();
        loadCategories();
    }, []);

    const loadItems = async () => {
        try {
            console.log('[Inventory] Buscando itens do inventário...');
            const data = await fetchItems();
            if (!Array.isArray(data) && data.status === 429) {
                router.push('/rate-limit');
                return;
            }
            setItems(Array.isArray(data) ? data : []);
            console.log('[Inventory] Itens carregados:', data);
        } catch (error) {
            console.error('[Inventory] Erro ao carregar inventário:', error);
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

    const loadCategories = async () => {
        try {
            console.log('[Inventory] Buscando categorias...');
            const data = await fetchCategories();
            setCategories(Array.isArray(data) ? data : []);
            console.log('[Inventory] Categorias carregadas:', data);
        } catch (error) {
            console.error('[Inventory] Erro ao carregar categorias:', error);
            setCategories([]);
        }
    };

    const handleCategoryChange = async (categoryId: string) => {
        setSelectedCategory(categoryId);
        setSelectedSubcategory('');
        console.log('[Inventory] Categoria selecionada:', categoryId);
        if (categoryId) {
            try {
                console.log('[Inventory] Buscando subcategorias para categoria:', categoryId);
                const data = await fetchSubcategories(categoryId);
                setSubcategories(Array.isArray(data) ? data : []);
                console.log('[Inventory] Subcategorias carregadas:', data);
            } catch (error) {
                console.error('[Inventory] Erro ao carregar subcategorias:', error);
                setSubcategories([]);
            }
        } else {
            setSubcategories([]);
        }
    };

    const handleCreate = async (data: any) => {
        try {
            console.log('[Inventory] Criando item:', data);
            const response = await createItem(data);
            if (!response.ok) throw new Error('Erro ao criar item');
            toast({
                title: 'Item criado',
                description: 'O item foi adicionado ao inventário com sucesso.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            loadItems();
            onClose();
        } catch (error: any) {
            console.error('[Inventory] Erro ao criar item:', error);
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
                console.log('[Inventory] Excluindo item:', id);
                const response = await deleteItem(id);
                if (!response.ok) throw new Error('Erro ao excluir item');
                toast({
                    title: 'Item excluído',
                    description: 'O item foi removido do inventário com sucesso.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                loadItems();
            } catch (error) {
                console.error('[Inventory] Erro ao excluir item:', error);
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
            console.log('[Inventory] Exportando PDF dos itens filtrados:', filteredItems, 'Agrupamento:', groupBy);
            await exportInventoryPDF(filteredItems, groupBy);
        } catch (error) {
            console.error('[Inventory] Erro ao exportar PDF:', error);
            toast({
                title: 'Erro ao exportar PDF',
                description: 'Não foi possível gerar o relatório em PDF.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleEdit = (item: InventoryItem) => {
        console.log('[Inventory] Editando item:', item);
        setEditItem(item);
        setIsEditMode(true);
        onOpen();
    };

    const handleUpdate = async (data: any) => {
        try {
            if (!editItem) return;
            console.log('[Inventory] Atualizando item:', editItem.id, data);
            const response = await updateItem(editItem.id, data);
            if (!response.ok) throw new Error('Erro ao atualizar item');
            toast({
                title: 'Item atualizado',
                description: 'O item foi atualizado com sucesso.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            loadItems();
            handleCloseModal();
        } catch (error: any) {
            console.error('[Inventory] Erro ao atualizar item:', error);
            toast({
                title: 'Erro ao atualizar item',
                description: error.message || 'Não foi possível atualizar o item.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleCloseModal = () => {
        setEditItem(null);
        setIsEditMode(false);
        onClose();
    };

    const handleDepreciateAll = async () => {
        try {
            console.log('[Inventory] Atualizando depreciação de todos os itens...');
            const data = await depreciateAll();
            toast({
                title: 'Depreciação atualizada',
                description: `${data.updated} itens atualizados com sucesso!`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            loadItems();
        } catch (error: any) {
            console.error('[Inventory] Erro ao atualizar depreciação:', error);
            toast({
                title: 'Erro ao atualizar depreciação',
                description: error.message || 'Não foi possível atualizar a depreciação dos itens.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Observabilidade para filtros e agrupamento
    useEffect(() => {
        console.log('[Inventory] Filtro de busca:', searchTerm);
    }, [searchTerm]);
    useEffect(() => {
        console.log('[Inventory] Categoria selecionada:', selectedCategory);
    }, [selectedCategory]);
    useEffect(() => {
        console.log('[Inventory] Subcategoria selecionada:', selectedSubcategory);
    }, [selectedSubcategory]);
    useEffect(() => {
        console.log('[Inventory] Agrupamento selecionado:', groupBy);
    }, [groupBy]);

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
                    <InventoryHeader
                        onOpen={onOpen}
                        onExportPDF={handleExportPDF}
                        onDepreciateAll={handleDepreciateAll}
                        groupBy={groupBy}
                        setGroupBy={setGroupBy}
                    />
                </Flex>
                <InventoryFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedSubcategory={selectedSubcategory}
                    setSelectedSubcategory={setSelectedSubcategory}
                    categories={categories}
                    subcategories={subcategories}
                    isFilterOpen={isFilterOpen}
                    onFilterOpen={onFilterOpen}
                    onFilterClose={onFilterClose}
                    handleCategoryChange={handleCategoryChange}
                />
                <Divider />
                <Box flex="1" overflowY="auto">
                    {Object.entries(groupedItems).map(([groupName, groupItems]) => (
                        <Box key={groupName} mb={6}>
                            <Heading size="md" mb={4} color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                                {groupName} ({groupItems.length})
                            </Heading>
                            {isMobile ? (
                                <MobileView items={groupItems} onDelete={handleDelete} onEdit={handleEdit} />
                            ) : (
                                <DesktopView items={groupItems} onDelete={handleDelete} onEdit={handleEdit} />
                            )}
                        </Box>
                    ))}
                </Box>
            </VStack>
            <InventoryModal
                isOpen={isOpen}
                onClose={handleCloseModal}
                onSubmit={isEditMode ? handleUpdate : handleCreate}
                initialData={editItem || undefined}
                isEdit={isEditMode}
            />
        </Box>
    );
} 
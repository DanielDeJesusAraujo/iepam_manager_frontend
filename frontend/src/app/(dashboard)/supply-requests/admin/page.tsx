'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    Heading,
    useToast,
    Spinner,
    Flex,
    useColorModeValue,
    VStack,
    useMediaQuery,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { 
    MobileAdminSupplyRequests,
    SupplyRequestsTab,
    AllocationsTab,
    InventoryTransactionsTab,
    SupplyTransactionsTab
} from './components';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { exportToPDF as exportToPDFUtil } from '@/utils/exportToPDF';

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
    delivery_deadline?: string;
    updated_at?: string;
    location?: { name: string };
    sector?: { name: string };
    locale?: { name: string };
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
    destination_name?: string;
    destination_id?: string;
    locale_name?: string;
    location_name?: string;
    requester_sector?: string;
    notes: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED' | 'RETURNED';
    created_at: string;
    return_date: string;
    requester_delivery_confirmation: boolean;
    manager_delivery_confirmation: boolean;
}

interface InventoryTransaction {
    id: string;
    inventory: {
        id: string;
        name: string;
        model: string;
        serial_number: string;
        status: string;
    };
    from_user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    to_user?: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    transaction_type: 'ALLOCATION' | 'RETURN' | 'MAINTENANCE' | 'DISCARD' | 'TRANSFER';
    movement_type: 'IN' | 'OUT';
    quantity: number;
    supply?: {
        unit?: {
            symbol?: string;
        };
    };
    notes?: string;
    sector?: {
        id: string;
        name: string;
        location: {
            id: string;
            name: string;
        };
    };
    destination: string;
    destination_locale?: {
        id: string;
        name: string;
        location: {
            id: string;
            name: string;
        };
    };
    expected_return_date?: string;
    actual_return_date?: string;
    status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
    created_at: string;
}

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

export default function AdminSupplyRequestsPage() {
    const [requests, setRequests] = useState<SupplyRequest[]>([]);
    const [allocationRequests, setAllocationRequests] = useState<AllocationRequest[]>([]);
    const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
    const [supplyTransactions, setSupplyTransactions] = useState<SupplyTransaction[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<SupplyRequest[]>([]);
    const [filteredAllocationRequests, setFilteredAllocationRequests] = useState<AllocationRequest[]>([]);
    const [filteredInventoryTransactions, setFilteredInventoryTransactions] = useState<InventoryTransaction[]>([]);
    const [filteredSupplyTransactions, setFilteredSupplyTransactions] = useState<SupplyTransaction[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [returnDateFilter, setReturnDateFilter] = useState('');
    const [sectorFilter, setSectorFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [localeFilter, setLocaleFilter] = useState('');
    const [requesterFilter, setRequesterFilter] = useState('');
    const [transactionLocationFilter, setTransactionLocationFilter] = useState('');
    const [transactionLocaleFilter, setTransactionLocaleFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const router = useRouter();
    const toast = useToast();
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
        fetchInventoryTransactions();
        fetchSupplyTransactions();
    }, [router]);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchRequests(), fetchAllocationRequests(), fetchInventoryTransactions(), fetchSupplyTransactions()]).finally(() => setLoading(false));
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 0) {
            fetchRequests();
        } else if (activeTab === 1) {
            fetchAllocationRequests();
        } else if (activeTab === 2) {
            fetchInventoryTransactions();
        } else if (activeTab === 3) {
            fetchSupplyTransactions();
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
        } else if (activeTab === 1) {
            if (search || statusFilter || returnDateFilter || sectorFilter || locationFilter || localeFilter || requesterFilter) {
                const filtered = allocationRequests.filter(request => {
                    const matchesSearch =
                        request.inventory.name.toLowerCase().includes(search.toLowerCase()) ||
                        request.inventory.model.toLowerCase().includes(search.toLowerCase()) ||
                        request.inventory.serial_number.toLowerCase().includes(search.toLowerCase()) ||
                        request.requester.name.toLowerCase().includes(search.toLowerCase()) ||
                        request.requester.email.toLowerCase().includes(search.toLowerCase()) ||
                        (request.locale_name && request.locale_name.toLowerCase().includes(search.toLowerCase())) ||
                        (request.location_name && request.location_name.toLowerCase().includes(search.toLowerCase())) ||
                        (request.requester_sector && request.requester_sector.toLowerCase().includes(search.toLowerCase()));
                    
                    const matchesStatus = !statusFilter || request.status === statusFilter;
                    const matchesReturnDate = !returnDateFilter || (request.return_date && new Date(request.return_date).toLocaleDateString('pt-BR') === returnDateFilter);
                    const matchesSector = !sectorFilter || (request.requester_sector && request.requester_sector === sectorFilter);
                    const matchesLocation = !locationFilter || (request.location_name && request.location_name === locationFilter);
                    const matchesLocale = !localeFilter || (request.locale_name && request.locale_name === localeFilter);
                    const matchesRequester = !requesterFilter || (request.requester.name && request.requester.name === requesterFilter);
                    
                    return matchesSearch && matchesStatus && matchesReturnDate && matchesSector && matchesLocation && matchesLocale && matchesRequester;
                });
                setFilteredAllocationRequests(filtered);
            } else {
                setFilteredAllocationRequests(allocationRequests);
            }
        } else if (activeTab === 2) {
            let filtered = inventoryTransactions;

            if (search) {
                filtered = filtered.filter(transaction =>
                    transaction.inventory.name.toLowerCase().includes(search.toLowerCase()) ||
                    transaction.inventory.model.toLowerCase().includes(search.toLowerCase()) ||
                    transaction.inventory.serial_number.toLowerCase().includes(search.toLowerCase()) ||
                    transaction.from_user.name.toLowerCase().includes(search.toLowerCase()) ||
                    transaction.from_user.email.toLowerCase().includes(search.toLowerCase()) ||
                    (transaction.to_user && transaction.to_user.name.toLowerCase().includes(search.toLowerCase())) ||
                    (transaction.to_user && transaction.to_user.email.toLowerCase().includes(search.toLowerCase()))
                );
            }

            if (statusFilter) {
                filtered = filtered.filter(transaction => transaction.transaction_type === statusFilter);
            }

            if (transactionLocationFilter) {
                filtered = filtered.filter(transaction => 
                    transaction.destination_locale?.location.name === transactionLocationFilter
                );
            }

            if (transactionLocaleFilter) {
                filtered = filtered.filter(transaction => 
                    transaction.destination_locale?.name === transactionLocaleFilter
                );
            }

            setFilteredInventoryTransactions(filtered);
        } else if (activeTab === 3) {
            let filtered = supplyTransactions;

            if (search) {
                filtered = filtered.filter(transaction =>
                    transaction.supply.name.toLowerCase().includes(search.toLowerCase()) ||
                    transaction.supply.description?.toLowerCase().includes(search.toLowerCase()) ||
                    transaction.from_user.name.toLowerCase().includes(search.toLowerCase()) ||
                    transaction.from_user.email.toLowerCase().includes(search.toLowerCase()) ||
                    transaction.to_user.name.toLowerCase().includes(search.toLowerCase()) ||
                    transaction.to_user.email.toLowerCase().includes(search.toLowerCase())
                );
            }

            if (statusFilter) {
                filtered = filtered.filter(transaction => transaction.transaction_type === statusFilter);
            }

            setFilteredSupplyTransactions(filtered);
        }
    }, [inventoryTransactions, search, statusFilter, returnDateFilter, sectorFilter, locationFilter, localeFilter, requesterFilter, activeTab, requests, allocationRequests, transactionLocationFilter, transactionLocaleFilter, supplyTransactions]);

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
            const response = await fetch('/api/inventory-allocations', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('@ti-assistant:token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAllocationRequests(data);
                setFilteredAllocationRequests(data);
            } else {
                console.error('Erro ao buscar alocações:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao buscar alocações:', error);
        }
    };

    const fetchInventoryTransactions = async () => {
        try {
            const response = await fetch('/api/inventory-transactions', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('@ti-assistant:token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setInventoryTransactions(data);
                setFilteredInventoryTransactions(data);
            } else {
                console.error('Erro ao buscar transações de inventário:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao buscar transações de inventário:', error);
        }
    };

    const fetchSupplyTransactions = async () => {
        try {
            const response = await fetch('/api/supply-transactions', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('@ti-assistant:token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSupplyTransactions(data);
                setFilteredSupplyTransactions(data);
            } else {
                console.error('Erro ao buscar transações de suprimento:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao buscar transações de suprimento:', error);
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

    const handleManagerDeliveryConfirmation = async (requestOrAllocation: any, confirmation: boolean) => {
        console.log('handleManagerDeliveryConfirmation', requestOrAllocation, confirmation);
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            if (!token) {
                router.push('/login');
                return;
            }

            let endpoint = '';
            if (requestOrAllocation.inventory) {
                // Alocação de inventário
                endpoint = `/api/inventory-allocations/${requestOrAllocation.id}/delivery-confirmation`;
            } else if (requestOrAllocation.is_custom) {
                // Requisição customizada de suprimento
                endpoint = `/api/custom-supply-requests/${requestOrAllocation.id}/manager-delivery-confirmation`;
            } else {
                // Requisição regular de suprimento
                endpoint = `/api/supply-requests/${requestOrAllocation.id}/manager-delivery-confirmation`;
            }

            const response = await fetch(endpoint, {
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

    const exportToPDF = () => {
        if (activeTab === 0 && filteredRequests.length === 0) {
            toast({
                title: 'Aviso',
                description: 'Não há dados para exportar',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (activeTab === 1 && filteredAllocationRequests.length === 0) {
            toast({
                title: 'Aviso',
                description: 'Não há dados para exportar',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (activeTab === 2 && filteredInventoryTransactions.length === 0) {
            toast({
                title: 'Aviso',
                description: 'Não há dados para exportar',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (activeTab === 3 && filteredSupplyTransactions.length === 0) {
            toast({
                title: 'Aviso',
                description: 'Não há dados para exportar',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (activeTab === 0) {
            const now = new Date();
            const head = [
                'Suprimento',
                'Usuário',
                'Quantidade',
                'Status',
                'Data da Solicitação',
                'Data Limite de Entrega',
                'Data de Entrega',
                'Filial',
                'Setor',
                'Local',
            ];
            const body = filteredRequests.map(request => [
                request.is_custom ? request.item_name : request.supply?.name,
                request.user.name,
                `${request.quantity} ${request.supply?.unit?.symbol || request.unit?.symbol || ''}`,
                request.status === 'PENDING' ? 'Pendente' : request.status === 'APPROVED' ? 'Aprovado' : request.status === 'REJECTED' ? 'Rejeitado' : 'Entregue',
                request.created_at ? new Date(request.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
                request.delivery_deadline ? new Date(request.delivery_deadline).toLocaleDateString('pt-BR') : '-',
                request.status === 'DELIVERED' && request.updated_at ? new Date(request.updated_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
                request.location?.name || '-',
                request.sector?.name || '-',
                request.locale?.name || '-',
            ]);
            exportToPDFUtil({
                title: 'Relatório de Requisições de Suprimentos',
                head,
                body,
                fileName: `requisicoes_suprimentos_${now.toISOString().split('T')[0]}.pdf`,
            });
            toast({
                title: 'Sucesso',
                description: 'PDF exportado com sucesso!',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const doc = new jsPDF();
        
        // Título do documento baseado na aba
        let title = '';
        if (activeTab === 1) {
            title = 'Relatório de Alocações de Inventário';
        } else if (activeTab === 2) {
            title = 'Relatório de Transações de Inventário';
        } else if (activeTab === 3) {
            title = 'Relatório de Transações de Suprimentos';
        }
        doc.setFontSize(18);
        doc.text(title, 14, 22);
        
        // Informações dos filtros aplicados
        doc.setFontSize(10);
        let yPosition = 35;
        
        const filters = [];
        if (search) filters.push(`Busca: ${search}`);
        if (statusFilter) filters.push(`Status: ${statusFilter}`);
        if (returnDateFilter) filters.push(`Data de Retorno: ${returnDateFilter}`);
        if (sectorFilter) filters.push(`Setor: ${sectorFilter}`);
        if (locationFilter) filters.push(`Filial: ${locationFilter}`);
        if (localeFilter) filters.push(`Local: ${localeFilter}`);
        if (requesterFilter) filters.push(`Requerente: ${requesterFilter}`);
        if (transactionLocationFilter) filters.push(`Filial: ${transactionLocationFilter}`);
        if (transactionLocaleFilter) filters.push(`Local: ${transactionLocaleFilter}`);
        
        if (filters.length > 0) {
            doc.text('Filtros Aplicados:', 14, yPosition);
            yPosition += 5;
            filters.forEach(filter => {
                doc.text(`• ${filter}`, 20, yPosition);
                yPosition += 4;
            });
            yPosition += 5;
        }
        
        // Data e hora da exportação
        const now = new Date();
        doc.text(`Exportado em: ${now.toLocaleString('pt-BR')}`, 14, yPosition);
        yPosition += 10;
        
        if (activeTab === 1) {
            // Dados da tabela de alocações
            const tableData = filteredAllocationRequests.map(request => [
                request.inventory.name,
                request.requester.name,
                request.locale_name || 'N/A',
                request.location_name || 'N/A',
                request.requester_sector || 'N/A',
                request.status,
                request.return_date ? new Date(request.return_date).toLocaleDateString('pt-BR') : 'Não definida'
            ]);
            
            autoTable(doc, {
                head: [['Item', 'Requerente', 'Local', 'Filial', 'Setor', 'Status', 'Data Retorno']],
                body: tableData,
                startY: yPosition,
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                },
                headStyles: {
                    fillColor: [66, 139, 202],
                    textColor: 255,
                    fontStyle: 'bold',
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245],
                },
                margin: { top: 10 },
            });
        } else if (activeTab === 2) {
            // Dados da tabela de transações de inventário
            const tableData = filteredInventoryTransactions.map(transaction => [
                transaction.inventory.name,
                transaction.transaction_type === 'ALLOCATION' ? 'Alocação' :
                transaction.transaction_type === 'RETURN' ? 'Devolução' :
                transaction.transaction_type === 'MAINTENANCE' ? 'Manutenção' :
                transaction.transaction_type === 'DISCARD' ? 'Descarte' : 'Transferência',
                transaction.from_user.name,
                transaction.to_user ? transaction.to_user.name : 'N/A',
                transaction.destination_locale ? 
                    `${transaction.destination_locale.name} - ${transaction.destination_locale.location.name}` : 
                    transaction.destination,
                transaction.status === 'ACTIVE' ? 'Ativa' :
                transaction.status === 'RETURNED' ? 'Devolvida' : 'Vencida',
                new Date(transaction.created_at).toLocaleDateString('pt-BR')
            ]);
            
            autoTable(doc, {
                head: [['Item', 'Tipo', 'De', 'Para', 'Destino', 'Status', 'Data']],
                body: tableData,
                startY: yPosition,
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                },
                headStyles: {
                    fillColor: [66, 139, 202],
                    textColor: 255,
                    fontStyle: 'bold',
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245],
                },
                margin: { top: 10 },
            });
        } else if (activeTab === 3) {
            // Dados da tabela de transações de suprimentos
            const tableData = filteredSupplyTransactions.map(transaction => [
                transaction.supply.name,
                transaction.transaction_type === 'DELIVERY' ? 'Entrega' :
                transaction.transaction_type === 'RETURN' ? 'Devolução' :
                transaction.transaction_type === 'PURCHASE' ? 'Compra' :
                transaction.transaction_type === 'ADJUSTMENT' ? 'Ajuste' : transaction.transaction_type,
                transaction.movement_type === 'IN' ? 'Entrada' : 'Saída',
                transaction.from_user.name,
                transaction.to_user.name,
                `${transaction.quantity} ${transaction.supply.unit?.symbol || 'un'}`,
                transaction.sector ? `${transaction.sector.name} - ${transaction.sector.location.name}` : 'N/A',
                new Date(transaction.created_at).toLocaleDateString('pt-BR')
            ]);
            
            autoTable(doc, {
                head: [['Suprimento', 'Tipo', 'Movimento', 'De', 'Para', 'Quantidade', 'Setor', 'Data']],
                body: tableData,
                startY: yPosition,
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                },
                headStyles: {
                    fillColor: [66, 139, 202],
                    textColor: 255,
                    fontStyle: 'bold',
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245],
                },
                margin: { top: 10 },
            });
        }
        
        // Salvar o PDF
        let fileName = '';
        if (activeTab === 1) {
            fileName = `alocacoes_inventario_${now.toISOString().split('T')[0]}.pdf`;
        } else if (activeTab === 2) {
            fileName = `transacoes_inventario_${now.toISOString().split('T')[0]}.pdf`;
        } else if (activeTab === 3) {
            fileName = `transacoes_suprimentos_${now.toISOString().split('T')[0]}.pdf`;
        }
        doc.save(fileName);
        
        toast({
            title: 'Sucesso',
            description: `PDF exportado com sucesso: ${fileName}`,
            status: 'success',
            duration: 3000,
            isClosable: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setReturnDateFilter('');
        setSectorFilter('');
        setLocationFilter('');
        setLocaleFilter('');
        setRequesterFilter('');
        setTransactionLocationFilter('');
        setTransactionLocaleFilter('');
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
                inventoryTransactions={inventoryTransactions}
                filteredInventoryTransactions={filteredInventoryTransactions}
                supplyTransactions={supplyTransactions}
                filteredSupplyTransactions={filteredSupplyTransactions}
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
                    <Heading size="lg" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Requisições</Heading>
                </Flex>

                <Tabs variant="enclosed" onChange={(index) => setActiveTab(index)} index={activeTab}>
                    <TabList>
                        <Tab>Suprimentos</Tab>
                        <Tab>Alocações</Tab>
                        <Tab>Transações de Inventário</Tab>
                        <Tab>Transações de Suprimento</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <SupplyRequestsTab
                                requests={requests}
                                filteredRequests={filteredRequests}
                                search={search}
                                onSearchChange={setSearch}
                                statusFilter={statusFilter}
                                onStatusFilterChange={setStatusFilter}
                                onApprove={handleStatusUpdate}
                                onReject={handleStatusUpdate}
                                onConfirmDelivery={handleManagerDeliveryConfirmation}
                                onExportPDF={exportToPDF}
                                onClearFilters={clearFilters}
                            />
                        </TabPanel>

                        <TabPanel>
                            <AllocationsTab
                                allocationRequests={allocationRequests}
                                filteredAllocationRequests={filteredAllocationRequests}
                                search={search}
                                onSearchChange={setSearch}
                                statusFilter={statusFilter}
                                onStatusFilterChange={setStatusFilter}
                                returnDateFilter={returnDateFilter}
                                onReturnDateFilterChange={setReturnDateFilter}
                                sectorFilter={sectorFilter}
                                onSectorFilterChange={setSectorFilter}
                                locationFilter={locationFilter}
                                onLocationFilterChange={setLocationFilter}
                                localeFilter={localeFilter}
                                onLocaleFilterChange={setLocaleFilter}
                                requesterFilter={requesterFilter}
                                onRequesterFilterChange={setRequesterFilter}
                                onAllocationApprove={handleAllocationStatusUpdate}
                                onAllocationReject={handleAllocationStatusUpdate}
                                onAllocationConfirmDelivery={handleManagerDeliveryConfirmation}
                                onExportPDF={exportToPDF}
                                onClearFilters={clearFilters}
                            />
                        </TabPanel>

                        <TabPanel>
                            <InventoryTransactionsTab
                                inventoryTransactions={inventoryTransactions}
                                filteredInventoryTransactions={filteredInventoryTransactions}
                                search={search}
                                onSearchChange={setSearch}
                                statusFilter={statusFilter}
                                onStatusFilterChange={setStatusFilter}
                                transactionLocationFilter={transactionLocationFilter}
                                onTransactionLocationFilterChange={setTransactionLocationFilter}
                                transactionLocaleFilter={transactionLocaleFilter}
                                onTransactionLocaleFilterChange={setTransactionLocaleFilter}
                                onExportPDF={exportToPDF}
                                onClearFilters={clearFilters}
                            />
                        </TabPanel>

                        <TabPanel>
                            <SupplyTransactionsTab
                                supplyTransactions={supplyTransactions}
                                filteredSupplyTransactions={filteredSupplyTransactions}
                                search={search}
                                onSearchChange={setSearch}
                                statusFilter={statusFilter}
                                onStatusFilterChange={setStatusFilter}
                                onExportPDF={exportToPDF}
                                onClearFilters={clearFilters}
                            />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Box>
    );
} 
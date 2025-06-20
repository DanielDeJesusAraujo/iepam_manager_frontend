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
    HStack,
    Button,
} from '@chakra-ui/react';
import { SearchIcon, DownloadIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SupplyRequest {
    id: string;
    supply: {
        id: string;
        name: string;
        description: string;
        quantity: number;
        unit: string;
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
    updated_at: string;
    requester_confirmation: boolean;
    manager_delivery_confirmation: boolean;
    delivery_deadline: string;
    destination: string;
}

export default function SupplyRequestHistoryPage() {
    const [requests, setRequests] = useState<SupplyRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<SupplyRequest[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const toast = useToast();
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('@ti-assistant:user') || '{}');
        if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
            router.push('/unauthorized');
            return;
        }

        fetchRequests();
    }, [router]);

    useEffect(() => {
        if (search || statusFilter || dateFilter) {
            const filtered = requests.filter(request => {
                const matchesSearch =
                    request.supply.name.toLowerCase().includes(search.toLowerCase()) ||
                    request.user.name.toLowerCase().includes(search.toLowerCase()) ||
                    request.user.email.toLowerCase().includes(search.toLowerCase());
                
                const matchesStatus = !statusFilter || request.status === statusFilter;
                
                const requestDate = new Date(request.created_at);
                const matchesDate = !dateFilter || 
                    format(requestDate, 'yyyy-MM-dd') === dateFilter;

                return matchesSearch && matchesStatus && matchesDate;
            });
            setFilteredRequests(filtered);
        } else {
            setFilteredRequests(requests);
        }
    }, [search, statusFilter, dateFilter, requests]);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const response = await fetch('/api/supply-requests', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar requisições');
            }

            const data = await response.json();
            setRequests(data);
            setFilteredRequests(data);
        } catch (error) {
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao carregar requisições',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'green';
            case 'REJECTED':
                return 'red';
            case 'DELIVERED':
                return 'purple';
            default:
                return 'yellow';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'Aprovado';
            case 'REJECTED':
                return 'Rejeitado';
            case 'DELIVERED':
                return 'Entregue';
            default:
                return 'Pendente';
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(16);
        doc.text('Histórico de Requisições', 14, 15);
        
        // Data de geração
        doc.setFontSize(10);
        doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 14, 22);

        // Configuração da tabela
        autoTable(doc, {
            startY: 30,
            head: [['Suprimento', 'Quantidade', 'Solicitante', 'Status', 'Data de Criação', 'Última Atualização', 'Observações']],
            body: filteredRequests.map(request => [
                request.supply.name,
                `${request.quantity} ${request.supply.unit}`,
                `${request.user.name}\n${request.user.email}`,
                getStatusText(request.status),
                format(new Date(request.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
                format(new Date(request.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
                request.notes || '-'
            ]),
            styles: {
                fontSize: 8,
                cellPadding: 2,
            },
            headStyles: {
                fillColor: [66, 139, 202],
                textColor: 255,
                fontSize: 9,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 20 },
                2: { cellWidth: 40 },
                3: { cellWidth: 20 },
                4: { cellWidth: 25 },
                5: { cellWidth: 25 },
                6: { cellWidth: 30 },
            },
            margin: { top: 30 },
        });

        // Salvar o PDF
        doc.save(`historico_requisicoes_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
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

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center">
                    <HStack spacing={4}>
                        {/* botão laranja */}
                        <Button
                            variant="solid"
                            colorScheme="orange"
                            onClick={() => router.push('/supply-requests/admin')}
                        >
                            Voltar
                        </Button>
                        <Heading size="lg">Histórico de Requisições</Heading>
                    </HStack>
                    <Button
                        leftIcon={<DownloadIcon />}
                        colorScheme="blue"
                        onClick={exportToPDF}
                    >
                        Exportar PDF
                    </Button>
                </Flex>

                <Card bg={bgColor} borderColor={borderColor}>
                    <CardBody>
                        <HStack spacing={4} mb={4}>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <SearchIcon color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Buscar por suprimento ou usuário..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </InputGroup>
                            <Select
                                placeholder="Filtrar por status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                maxW="200px"
                            >
                                <option value="">Todos</option>
                                <option value="PENDING">Pendente</option>
                                <option value="APPROVED">Aprovado</option>
                                <option value="REJECTED">Rejeitado</option>
                                <option value="DELIVERED">Entregue</option>
                            </Select>
                            <Input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                maxW="200px"
                            />
                        </HStack>

                        <Box overflowX="auto">
                            <Table variant="simple">
                                <Thead>
                                    <Tr>
                                        <Th>Suprimento</Th>
                                        <Th>Quantidade</Th>
                                        <Th>Solicitante</Th>
                                        <Th>Status</Th>
                                        <Th>Data de Criação</Th>
                                        <Th>Última Atualização</Th>
                                        <Th>Observações</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredRequests.map((request) => (
                                        <Tr key={request.id}>
                                            <Td>{request.supply.name}</Td>
                                            <Td>{`${request.quantity} ${request.supply.unit}`}</Td>
                                            <Td>
                                                <VStack align="start" spacing={0}>
                                                    <Text>{request.user.name}</Text>
                                                    <Text fontSize="sm" color="gray.500">
                                                        {request.user.email}
                                                    </Text>
                                                </VStack>
                                            </Td>
                                            <Td>
                                                <Badge colorScheme={getStatusColor(request.status)}>
                                                    {getStatusText(request.status)}
                                                </Badge>
                                            </Td>
                                            <Td>
                                                {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                            </Td>
                                            <Td>
                                                {format(new Date(request.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                            </Td>
                                            <Td>{request.notes || '-'}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </Box>
                    </CardBody>
                </Card>
            </VStack>
        </Container>
    );
} 
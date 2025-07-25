'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    useToast,
    HStack,
    Text,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Icon,
    useBreakpointValue,
    Container,
    VStack,
    Flex,
    Heading,
    useColorMode,
} from '@chakra-ui/react';
import { MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Alert {
    id: string;
    about: string;
    danger_level: string;
    description: string;
    created_at: string;
    server?: {
        id: string;
        IP: string;
    };
    printer?: {
        id: string;
        name: string;
    };
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const isMobile = useBreakpointValue({ base: true, md: false });
    const { colorMode } = useColorMode();
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('@ti-assistant:token');
        const user = JSON.parse(localStorage.getItem('@ti-assistant:user') || '{}');

        if (!token) {
            router.push('/');
            return;
        }

        if (!['ADMIN', 'MANAGER', 'SUPPORT'].includes(user.role)) {
            toast({
                title: 'Acesso Negado',
                description: 'Você não tem permissão para acessar esta página',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            router.push('/dashboard');
            return;
        }

        fetchAlerts();
    }, [router, toast]);

    const fetchAlerts = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            const response = await fetch('/api/alerts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }) ;

            if (response.status === 429) {
                router.push('/rate-limit')
                return
            }

            if (!response.ok) {
                throw new Error('Erro ao buscar alertas');
            }

            const data = await response.json();
            setAlerts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao buscar alertas:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar os alertas',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setAlerts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este alerta?')) return;

        try {
            const token = localStorage.getItem('@ti-assistant:token');
            const response = await fetch(`/api/alerts?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir alerta');
            }

            toast({
                title: 'Sucesso',
                description: 'Alerta excluído com sucesso',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            fetchAlerts();
        } catch (error) {
            console.error('Erro ao excluir alerta:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível excluir o alerta',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const getDangerLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'baixo':
                return 'green';
            case 'médio':
                return 'yellow';
            case 'alto':
                return 'orange';
            case 'crítico':
                return 'red';
            default:
                return 'gray';
        }
    };

    if (loading) {
        return <Box p={8}>Carregando...</Box>;
    }

    return (
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
        >
            <Flex justify="space-between" align="center" mb={6}>
                <Heading size="lg" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                    Alertas
                </Heading>
            </Flex>

            {/* Tabela para desktop, cards para mobile */}
            {isMobile ? (
                <VStack spacing={4} align="stretch">
                    {alerts.length === 0 ? (
                        <Box textAlign="center" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                            Nenhum alerta encontrado
                        </Box>
                    ) : (
                        alerts.map((alert) => (
                            <Box
                                key={alert.id}
                                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255,255,255,0.9)'}
                                borderRadius="md"
                                boxShadow="sm"
                                borderWidth="1px"
                                borderColor={colorMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                                p={4}
                            >
                                <HStack justify="space-between" mb={2}>
                                    <Badge colorScheme={getDangerLevelColor(alert.danger_level)} variant="subtle" px={2} py={1} rounded="md">
                                        {alert.danger_level}
                                    </Badge>
                                    <Menu>
                                        <MenuButton
                                            as={IconButton}
                                            aria-label="Mais opções"
                                            icon={<Icon as={MoreVertical} sx={{ '& svg': { stroke: 'currentColor' } }} />}
                                            variant="ghost"
                                            size="sm"
                                        />
                                        <MenuList bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.9)' : 'rgba(255,255,255,0.9)'}>
                                            <MenuItem
                                                onClick={() => handleDelete(alert.id)}
                                                color="red.500"
                                            >
                                                Excluir
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                </HStack>
                                <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>{alert.about}</Text>
                                <Text color={colorMode === 'dark' ? 'gray.200' : 'gray.700'} fontSize="sm">{alert.description}</Text>
                                <Text color={colorMode === 'dark' ? 'gray.400' : 'gray.600'} fontSize="sm" mt={2}>
                                    {alert.server ? `Servidor: ${alert.server.IP}` : alert.printer ? `Impressora: ${alert.printer.name}` : 'N/A'}
                                </Text>
                                <Text color={colorMode === 'dark' ? 'gray.400' : 'gray.600'} fontSize="xs">
                                    {new Date(alert.created_at).toLocaleString()}
                                </Text>
                            </Box>
                        ))
                    )}
                </VStack>
            ) : (
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
                                <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Nível</Th>
                                <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Sobre</Th>
                                <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Descrição</Th>
                                <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Dispositivo</Th>
                                <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Data</Th>
                                <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Ações</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {alerts.length === 0 ? (
                                <Tr>
                                    <Td colSpan={6} textAlign="center" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                                        Nenhum alerta encontrado
                                    </Td>
                                </Tr>
                            ) : (
                                alerts.map((alert) => (
                                    <Tr
                                        key={alert.id}
                                        transition="all 0.3s ease"
                                        _hover={{
                                            bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                                            transform: 'translateY(-1px)',
                                        }}
                                    >
                                        <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                            <Badge
                                                colorScheme={getDangerLevelColor(alert.danger_level)}
                                                variant="subtle"
                                                px={2}
                                                py={1}
                                                rounded="md"
                                            >
                                                {alert.danger_level}
                                            </Badge>
                                        </Td>
                                        <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>{alert.about}</Td>
                                        <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>{alert.description}</Td>
                                        <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                            {alert.server ? `Servidor: ${alert.server.IP}` :
                                                alert.printer ? `Impressora: ${alert.printer.name}` :
                                                    'N/A'}
                                        </Td>
                                        <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                            {new Date(alert.created_at).toLocaleString()}
                                        </Td>
                                        <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
                                            <Menu>
                                                <MenuButton
                                                    as={IconButton}
                                                    aria-label="Mais opções"
                                                    icon={<Icon as={MoreVertical} sx={{ '& svg': { stroke: 'currentColor' } }} />}
                                                    variant="ghost"
                                                    size="sm"
                                                    _hover={{
                                                        bg: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                                        transform: 'translateY(-1px)'
                                                    }}
                                                    transition="all 0.2s ease"
                                                />
                                                <MenuList
                                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.9)' : 'rgba(255, 255, 255, 0.9)'}
                                                    backdropFilter="blur(12px)"
                                                    border="1px solid"
                                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                                >
                                                    <MenuItem
                                                        onClick={() => handleDelete(alert.id)}
                                                        _hover={{
                                                            bg: colorMode === 'dark' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                                                            transform: 'translateX(2px)'
                                                        }}
                                                        transition="all 0.2s ease"
                                                        color="red.500"
                                                    >
                                                        Excluir
                                                    </MenuItem>
                                                </MenuList>
                                            </Menu>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </Tbody>
                    </Table>
                </Box>
            )}
        </VStack>
    );
} 
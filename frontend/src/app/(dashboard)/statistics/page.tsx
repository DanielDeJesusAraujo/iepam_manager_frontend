'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    SimpleGrid,
    Heading,
    VStack,
    useToast,
    Text,
    Select,
    HStack,
    useBreakpointValue,
    useColorMode,
} from '@chakra-ui/react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts';
import { useRouter } from 'next/navigation';
import { MobileStatistics } from './components/MobileStatistics';

interface StatisticsData {
    serversByStatus: { status: string; count: number }[];
    serviceOrdersByMonth: { month: string; count: number }[];
    inventoryByType: { type: string; count: number }[];
    alertsByLevel: { level: string; count: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function StatisticsPage() {
    const [data, setData] = useState<StatisticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30');
    const router = useRouter();
    const toast = useToast();
    const isMobile = useBreakpointValue({ base: true, md: false });
    const { colorMode } = useColorMode();

    useEffect(() => {
        const token = localStorage.getItem('@ti-assistant:token');
        const user = JSON.parse(localStorage.getItem('@ti-assistant:user') || '{}');

        if (!token) {
            router.push('/login');
            return;
        }

        if (!['ADMIN', 'MANAGER'].includes(user.role)) {
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

        fetchStatistics();
    }, [router, toast, timeRange]);

    const fetchStatistics = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');

            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`/api/statistics?timeRange=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar estatísticas');
            }

            const statisticsData = await response.json();
            // Ordenar os dados para melhor visualização
            statisticsData.serversByStatus = [...statisticsData.serversByStatus].sort((a, b) => b.count - a.count);
            statisticsData.inventoryByType = [...statisticsData.inventoryByType].sort((a, b) => b.count - a.count);
            statisticsData.alertsByLevel = [...statisticsData.alertsByLevel].sort((a, b) => b.count - a.count);
            // Ordenar meses cronologicamente (assumindo meses abreviados em pt-BR)
            const monthOrder = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
            statisticsData.serviceOrdersByMonth = [...statisticsData.serviceOrdersByMonth].sort((a, b) => {
                return monthOrder.indexOf(a.month.toLowerCase()) - monthOrder.indexOf(b.month.toLowerCase());
            });
            setData(statisticsData);
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar as estatísticas',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Box p={8}>Carregando...</Box>;
    }

    if (!data) {
        return <Box p={8}>Erro ao carregar dados</Box>;
    }

    if (isMobile) {
        return (
            <MobileStatistics
                data={data}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
            />
        );
    }

    return (
        <Box p={isMobile ? 4 : 8}>
            <VStack spacing={isMobile ? 4 : 8} align="stretch">
                <HStack justify="space-between">
                    <Heading size={isMobile ? "md" : "lg"} color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                        Estatísticas
                    </Heading>
                    <Select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        width="200px"
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
                        <option value="7">Últimos 7 dias</option>
                        <option value="30">Últimos 30 dias</option>
                        <option value="90">Últimos 90 dias</option>
                        <option value="365">Último ano</option>
                    </Select>
                </HStack>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                    {/* Gráfico de Ordens de Serviço por Mês */}
                    <Box
                        shadow="base"
                        rounded="lg"
                        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                        backdropFilter="blur(12px)"
                        border="1px solid"
                        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                        p={isMobile ? 4 : 6}
                        transition="all 0.3s ease"
                        _hover={{
                            bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                            transform: 'translateY(-2px)',
                            shadow: 'lg',
                            cursor: 'pointer'
                        }}
                    >
                        <Heading size={isMobile ? "sm" : "md"} mb={4} color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                            Ordens de Serviço por Mês
                        </Heading>
                        <Box height="300px">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.serviceOrdersByMonth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={colorMode === 'dark' ? 'gray.600' : 'gray.200'} />
                                    <XAxis
                                        dataKey="month"
                                        stroke={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
                                    />
                                    <YAxis
                                        stroke={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
                                        label={{
                                            value: 'Quantidade',
                                            angle: -90,
                                            position: 'insideLeft',
                                            style: { textAnchor: 'middle' }
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: colorMode === 'dark' ? 'gray.800' : 'white',
                                            border: `1px solid ${colorMode === 'dark' ? 'gray.700' : 'gray.200'}`,
                                            color: colorMode === 'dark' ? 'white' : 'gray.800'
                                        }}
                                        labelFormatter={(value) => value}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#8884d8"
                                        name="Quantidade"
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Box>

                    {/* Gráfico de Itens do Inventário por Tipo */}
                    <Box
                        p={isMobile ? 4 : 6}
                        shadow="base"
                        rounded="lg"
                        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                        backdropFilter="blur(12px)"
                        border="1px solid"
                        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                        transition="all 0.3s ease"
                        _hover={{
                            bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                            transform: 'translateY(-2px)',
                            shadow: 'lg'
                        }}
                    >
                        <Text fontSize={isMobile ? "sm" : "md"} fontWeight="bold" mb={4} color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                            Itens do Inventário por Tipo
                        </Text>
                        <Box height="300px">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.inventoryByType}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={colorMode === 'dark' ? 'gray.600' : 'gray.200'} />
                                    <XAxis
                                        dataKey="type"
                                        stroke={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
                                    />
                                    <YAxis
                                        stroke={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: colorMode === 'dark' ? 'gray.800' : 'white',
                                            border: `1px solid ${colorMode === 'dark' ? 'gray.700' : 'gray.200'}`,
                                            color: colorMode === 'dark' ? 'white' : 'gray.800'
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#8884d8" name="Quantidade" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Box>

                    {/* Gráfico de Alertas por Nível */}
                    <Box
                        p={isMobile ? 4 : 6}
                        shadow="base"
                        rounded="lg"
                        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                        backdropFilter="blur(12px)"
                        border="1px solid"
                        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                        transition="all 0.3s ease"
                        _hover={{
                            bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                            transform: 'translateY(-2px)',
                            shadow: 'lg'
                        }}
                    >
                        <Text fontSize={isMobile ? "sm" : "md"} fontWeight="bold" mb={4} color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                            Alertas por Nível
                        </Text>
                        <Box height="300px">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.alertsByLevel}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={colorMode === 'dark' ? 'gray.600' : 'gray.200'} />
                                    <XAxis
                                        dataKey="level"
                                        stroke={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
                                    />
                                    <YAxis
                                        stroke={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: colorMode === 'dark' ? 'gray.800' : 'white',
                                            border: `1px solid ${colorMode === 'dark' ? 'gray.700' : 'gray.200'}`,
                                            color: colorMode === 'dark' ? 'white' : 'gray.800'
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#ff4444" name="Quantidade" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Box>
                </SimpleGrid>
            </VStack>
        </Box>
    );
} 
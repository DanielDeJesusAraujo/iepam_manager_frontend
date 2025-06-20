import {
    Box,
    Container,
    Flex,
    Heading,
    Text,
    Select,
    VStack,
    useColorModeValue,
    Card,
    CardBody,
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

interface StatisticsData {
    serversByStatus: { status: string; count: number }[];
    serviceOrdersByMonth: { month: string; count: number }[];
    inventoryByType: { type: string; count: number }[];
    alertsByLevel: { level: string; count: number }[];
}

interface MobileStatisticsProps {
    data: StatisticsData;
    timeRange: string;
    onTimeRangeChange: (value: string) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function MobileStatistics({ data, timeRange, onTimeRangeChange }: MobileStatisticsProps) {
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Container maxW="container.xl" py={4}>
            <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center" mt={4} marginTop='4vh'>
                    <Heading size="md">Estatísticas</Heading>
                    <Select
                        value={timeRange}
                        onChange={(e) => onTimeRangeChange(e.target.value)}
                        width="150px"
                        size="sm"
                    >
                        <option value="7">7 dias</option>
                        <option value="30">30 dias</option>
                        <option value="90">90 dias</option>
                        <option value="365">1 ano</option>
                    </Select>
                </Flex>

                {/* Gráfico de Status dos Servidores */}
                <Card variant="outline">
                    <CardBody>
                        <Text fontSize="md" fontWeight="bold" mb={4}>
                            Status dos Servidores
                        </Text>
                        <Box height="250px">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.serversByStatus}
                                        dataKey="count"
                                        nameKey="status"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={70}
                                        label
                                    >
                                        {data.serversByStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardBody>
                </Card>

                {/* Gráfico de Ordens de Serviço por Mês */}
                <Card variant="outline">
                    <CardBody>
                        <Text fontSize="md" fontWeight="bold" mb={4}>
                            Ordens de Serviço por Mês
                        </Text>
                        <Box height="250px">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.serviceOrdersByMonth}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#8884d8"
                                        name="Quantidade"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardBody>
                </Card>

                {/* Gráfico de Itens do Inventário por Tipo */}
                <Card variant="outline">
                    <CardBody>
                        <Text fontSize="md" fontWeight="bold" mb={4}>
                            Itens do Inventário por Tipo
                        </Text>
                        <Box height="250px">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.inventoryByType}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="type" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#8884d8" name="Quantidade" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardBody>
                </Card>

                {/* Gráfico de Alertas por Nível */}
                <Card variant="outline">
                    <CardBody>
                        <Text fontSize="md" fontWeight="bold" mb={4}>
                            Alertas por Nível
                        </Text>
                        <Box height="250px">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.alertsByLevel}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="level" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#ff4444" name="Quantidade" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardBody>
                </Card>
            </VStack>
        </Container>
    );
} 
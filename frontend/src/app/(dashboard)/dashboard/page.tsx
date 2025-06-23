'use client';

import { useEffect, useState } from 'react'
import { Box, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, useToast, Heading, VStack, HStack, Text, Badge, useBreakpointValue, Icon, Flex, useColorMode, Spinner } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { Server, Wrench, Box as BoxIcon } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface DashboardStats {
  totalInventory: number
  totalInventoryValue: number
  totalServiceOrders: number
  totalServiceOrdersValue: number
  openServiceOrders: number
  criticalAlerts: number
  consumptionTrends: { date: string; quantity: number }[]
  totalSuppliers: number
  totalQuotes: number
  pendingQuotes: number
  totalSupplyRequests: number
  pendingSupplyRequests: number
}

interface Alert {
  id: string
  title: string
  description: string
  danger_level: string
  created_at: string
}

interface ServiceOrder {
  id: string
  order_number: string
  client_name: string
  equipment_description: string
  problem_reported: string
  status: string
  created_at: string
}

interface ChartData {
  name: string
  value: number
}

interface LineChartData {
  date: string
  orders: number
  alerts: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([])
  const [recentServiceOrders, setRecentServiceOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const toast = useToast()
  const { colorMode } = useColorMode()

  const isMobile = useBreakpointValue({ base: true, md: false })

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  useEffect(() => {
        const token = localStorage.getItem('@ti-assistant:token')
        if (!token) {
          router.push('/login')
          return
    }

    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('@ti-assistant:token')
      if (!token) {
        throw new Error('Token não encontrado')
        }

        const response = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Erro ao carregar dados do dashboard')
        }

        const data = await response.json()
        setStats(data.stats)
        setRecentAlerts(data.recentAlerts)
        setRecentServiceOrders(data.recentServiceOrders)
      } catch (error) {
        toast({
          title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao carregar dados do dashboard',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100vh">
        <Spinner size="xl" />
      </Box>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <Box p={isMobile ? 4 : 8}>
      <VStack spacing={isMobile ? 4 : 8} align="stretch">
        <Heading size={isMobile ? "md" : "lg"}>Dashboard</Heading>

        {/* Grupo 1: Operações */}
        <Box>
          <Heading size="sm" mb={4} color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>Operações</Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 2 }} spacing={4}>
            <Stat
              px={4}
              py={5}
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
                shadow: 'lg',
                cursor: 'pointer'
              }}
              onClick={() => router.push('/orders')}
            >
              <HStack spacing={2} mb={2}>
                <Icon as={Wrench} boxSize={5} color="orange.500" sx={{ '& svg': { stroke: 'currentColor' } }} />
                <StatLabel fontSize={isMobile ? "sm" : "md"}>Ordens de Serviço</StatLabel>
              </HStack>
              <StatNumber fontSize={isMobile ? "xl" : "2xl"}>{stats.totalServiceOrders}</StatNumber>
              <StatHelpText fontSize={isMobile ? "xs" : "sm"}>
                <StatArrow type={stats.openServiceOrders > 0 ? 'increase' : 'decrease'} />
                {stats.openServiceOrders} em aberto
              </StatHelpText>
              <StatHelpText fontSize={isMobile ? "xs" : "sm"} mt={1}>
                Valor Total: R$ {stats.totalServiceOrdersValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </StatHelpText>
            </Stat>

            <Stat
              px={4}
              py={5}
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
                shadow: 'lg',
                cursor: 'pointer'
              }}
              onClick={() => router.push('/inventory')}
            >
              <HStack spacing={2} mb={2}>
                <Icon as={BoxIcon} boxSize={5} color="purple.500" sx={{ '& svg': { stroke: 'currentColor' } }} />
                <StatLabel fontSize={isMobile ? "sm" : "md"}>Inventário</StatLabel>
              </HStack>
              <StatNumber fontSize={isMobile ? "xl" : "2xl"}>{stats.totalInventory}</StatNumber>
              <StatHelpText fontSize={isMobile ? "xs" : "sm"}>
                <StatArrow type="increase" />
                Itens cadastrados
              </StatHelpText>
              <StatHelpText fontSize={isMobile ? "xs" : "sm"} mt={1}>
                Valor Total: R$ {stats.totalInventoryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>

        {/* Grupo 2: Suprimentos */}
        <Box>
          <Heading size="sm" mb={4} color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>Suprimentos</Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 3 }} spacing={4}>
            <Stat
              px={4}
              py={5}
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
                shadow: 'lg',
                cursor: 'pointer'
              }}
              onClick={() => router.push('/suppliers')}
            >
              <HStack spacing={2} mb={2}>
                <Icon as={BoxIcon} boxSize={5} color="blue.500" sx={{ '& svg': { stroke: 'currentColor' } }} />
                <StatLabel fontSize={isMobile ? "sm" : "md"}>Fornecedores</StatLabel>
              </HStack>
              <StatNumber fontSize={isMobile ? "xl" : "2xl"}>{stats.totalSuppliers}</StatNumber>
              <StatHelpText fontSize={isMobile ? "xs" : "sm"}>
                <StatArrow type="increase" />
                Total de fornecedores
              </StatHelpText>
            </Stat>

            <Stat
              px={4}
              py={5}
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
                shadow: 'lg',
                cursor: 'pointer'
              }}
              onClick={() => router.push('/quotes')}
            >
              <HStack spacing={2} mb={2}>
                <Icon as={BoxIcon} boxSize={5} color="purple.500" sx={{ '& svg': { stroke: 'currentColor' } }} />
                <StatLabel fontSize={isMobile ? "sm" : "md"}>Cotações</StatLabel>
              </HStack>
              <StatNumber fontSize={isMobile ? "xl" : "2xl"}>{stats.totalQuotes}</StatNumber>
              <StatHelpText fontSize={isMobile ? "xs" : "sm"}>
                <StatArrow type={stats.pendingQuotes > 0 ? 'increase' : 'decrease'} />
                {stats.pendingQuotes} pendentes
              </StatHelpText>
            </Stat>

            <Stat
              px={4}
              py={5}
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
                shadow: 'lg',
                cursor: 'pointer'
              }}
              onClick={() => router.push('/supply-requests/admin')}
            >
              <HStack spacing={2} mb={2}>
                <Icon as={BoxIcon} boxSize={5} color="teal.500" sx={{ '& svg': { stroke: 'currentColor' } }} />
                <StatLabel fontSize={isMobile ? "sm" : "md"}>Requisições</StatLabel>
              </HStack>
              <StatNumber fontSize={isMobile ? "xl" : "2xl"}>{stats.totalSupplyRequests}</StatNumber>
              <StatHelpText fontSize={isMobile ? "xs" : "sm"}>
                <StatArrow type={stats.pendingSupplyRequests > 0 ? 'increase' : 'decrease'} />
                {stats.pendingSupplyRequests} pendentes
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>

        {/* Grupo 3: Monitoramento */}
        <Box>
          <Heading size="sm" mb={4} color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>Monitoramento</Heading>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
            {/* Gráfico de Linha - Tendências de Consumo */}
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
              onClick={() => router.push('/statistics')}
            >
              <Heading size={isMobile ? "sm" : "md"} mb={4}>Tendências de Consumo</Heading>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stats.consumptionTrends}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colorMode === 'dark' ? 'gray.600' : 'gray.200'} />
                    <XAxis
                      dataKey="date"
                      stroke={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
                      tickFormatter={(value) => {
                        const [year, month] = value.split('-');
                        return `${month}/${year}`;
                      }}
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
                      labelFormatter={(value) => {
                        const [year, month] = value.split('-');
                        return `${month}/${year}`;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="quantity"
                      name="Consumo"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>

            {/* Alertas Recentes */}
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
              onClick={() => router.push('/alerts')}
            >
              <Heading size={isMobile ? "sm" : "md"} mb={4}>Alertas Recentes</Heading>
              <VStack align="stretch" spacing={3}>
                {recentAlerts.map((alert) => (
                  <Box
                    key={alert.id}
                    p={3}
                    borderWidth={1}
                    rounded="md"
                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.3)'}
                    backdropFilter="blur(8px)"
                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                    transition="all 0.3s ease"
                    _hover={{
                      bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.4)' : 'rgba(255, 255, 255, 0.4)',
                      transform: 'translateY(-1px)',
                      shadow: 'md'
                    }}
                  >
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"}>{alert.title}</Text>
                      <Badge
                        colorScheme={
                          alert.danger_level === 'ALTO' ? 'red' :
                            alert.danger_level === 'MEDIO' ? 'orange' : 'green'
                        }
                        fontSize={isMobile ? "xs" : "sm"}
                      >
                        {alert.danger_level}
                      </Badge>
                    </HStack>
                    <Text mt={2} fontSize={isMobile ? "xs" : "sm"}>{alert.description}</Text>
                    <Text fontSize={isMobile ? "xs" : "sm"} color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} mt={2}>
                      {new Date(alert.created_at).toLocaleDateString()}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Grupo 4: Atividades Recentes */}
        <Box>
          <Heading size="sm" mb={4} color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>Atividades Recentes</Heading>
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
            onClick={() => router.push('/orders')}
          >
            <Heading size={isMobile ? "sm" : "md"} mb={4}>Ordens de Serviço Recentes</Heading>
            <VStack align="stretch" spacing={3}>
              {recentServiceOrders.map((order) => (
                <Box
                  key={order.id}
                  p={3}
                  borderWidth={1}
                  rounded="md"
                  bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.3)'}
                  backdropFilter="blur(8px)"
                  borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                  transition="all 0.3s ease"
                  _hover={{
                    bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.4)' : 'rgba(255, 255, 255, 0.4)',
                    transform: 'translateY(-1px)',
                    shadow: 'md'
                  }}
                >
                  <HStack justify="space-between">
                    <Text fontWeight="bold" fontSize={isMobile ? "sm" : "md"}>{order.order_number}</Text>
                    <Badge
                      colorScheme={
                        order.status === 'ABERTO' ? 'red' :
                          order.status === 'EM_ANDAMENTO' ? 'orange' : 'green'
                      }
                      fontSize={isMobile ? "xs" : "sm"}
                    >
                      {order.status}
                    </Badge>
                  </HStack>
                  <Text mt={2} fontSize={isMobile ? "xs" : "sm"}>{order.equipment_description}</Text>
                  <Text fontSize={isMobile ? "xs" : "sm"} color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} mt={1}>
                    Cliente: {order.client_name}
                  </Text>
                  <Text fontSize={isMobile ? "xs" : "sm"} color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} mt={1}>
                    Problema: {order.problem_reported}
                  </Text>
                  <Text fontSize={isMobile ? "xs" : "sm"} color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} mt={2}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>
        </Box>
      </VStack>
    </Box>
  )
} 
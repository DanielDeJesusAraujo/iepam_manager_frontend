"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Flex,
  Text,
  Badge,
  useToast,
  Input,
  Select,
  HStack,
  InputGroup,
  InputLeftElement,
  VStack,
  useBreakpointValue,
  Card,
  CardBody,
  Stack,
  StackDivider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  FormControl,
  FormLabel,
  Container,
  Divider,
  useColorMode,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { SearchIcon } from '@chakra-ui/icons'
import { Filter } from 'lucide-react'
import { Order, Filters } from './types'
import { filterOrders, generateOrdersPDF } from './utils/ordersUtils'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    equipment: '',
    status: '',
    date: '',
    serialNumber: ''
  })
  const router = useRouter()
  const toast = useToast()
  const tableRef = useRef<HTMLTableElement>(null)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { colorMode } = useColorMode()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('@ti-assistant:user') || '{}');
    const token = localStorage.getItem('@ti-assistant:token');

    if (!token) {
      router.push('/login');
      return;
    }

    if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
      router.push('/unauthorized');
      return;
    }

    const fetchOrders = async () => {
      try {
        setError(null)
        const res = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.message || 'Erro ao buscar ordens de serviço')
        }

        const data = await res.json()
        if (!Array.isArray(data)) {
          throw new Error('Dados recebidos não são um array')
        }

        setOrders(data)
        setFilteredOrders(data)
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar ordens de serviço')
        toast({
          title: 'Erro',
          description: err.message || 'Erro ao buscar ordens de serviço',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        setOrders([])
        setFilteredOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [toast, router])

  useEffect(() => {
    const result = filterOrders(orders, filters)
    setFilteredOrders(result)
  }, [filters, orders])

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleGeneratePDF = () => {
    generateOrdersPDF(filteredOrders, filters, toast)
  }

  const renderMobileView = () => (
    <VStack spacing={4} align="stretch">
      {filteredOrders.map(order => (
        <Card
          key={order.id}
          onClick={() => router.push(`/orders/${order.id}`)}
          cursor="pointer"
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
          <CardBody>
            <Stack divider={<StackDivider borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} />} spacing={4}>
              <Box>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>OS #{order.order_number}</Text>
                  <Badge colorScheme={order.exit_date ? 'green' : 'yellow'}>
                    {order.exit_date ? 'Concluída' : 'Em andamento'}
                  </Badge>
                </Flex>
              </Box>
              <Box>
                <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Cliente</Text>
                <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{order.client_name}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Equipamento</Text>
                <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{order.model}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Data de Entrada</Text>
                <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{new Date(order.entry_date).toLocaleDateString()}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Valor Total</Text>
                <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>R$ {order.total_price.toFixed(2)}</Text>
              </Box>
            </Stack>
          </CardBody>
        </Card>
      ))}
    </VStack>
  )

  const renderDesktopView = () => (
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
      <Table variant="simple" ref={tableRef}>
        <Thead>
          <Tr>
            <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Nº OS</Th>
            <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Cliente</Th>
            <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Equipamento</Th>
            <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Nº Série</Th>
            <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Status</Th>
            <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Data de Entrada</Th>
            <Th color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}>Valor Total</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredOrders.map(order => (
            <Tr
              key={order.id}
              cursor="pointer"
              onClick={() => router.push(`/orders/${order.id}`)}
              transition="all 0.3s ease"
              _hover={{
                bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                transform: 'translateY(-1px)',
              }}
            >
              <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>{order.order_number}</Td>
              <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>{order.client_name}</Td>
              <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>{order.model}</Td>
              <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>{order.serial_number}</Td>
              <Td bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>
              <Badge colorScheme={order.exit_date ? 'green' : 'yellow'}>
                {order.exit_date ? 'Concluída' : 'Em andamento'}
              </Badge>
            </Td>
              <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>{new Date(order.entry_date).toLocaleDateString()}</Td>
              <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}>R$ {order.total_price.toFixed(2)}</Td>
          </Tr>
        ))}
        </Tbody>
      </Table>
    </Box>
  )

  if (error) {
    return (
      <Box
        w="full"
        h="full"
        py={4}
        px={isMobile ? 2 : 8}
      >
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
            justify={isMobile ? "center" : "space-between"}
            align="center"
            mb={6}
            mt={isMobile ? 12 : 0}
          >
            {!isMobile && (
              <Heading size="lg" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Ordens de Serviço</Heading>
            )}
            <Button as={NextLink} href="/orders/new" colorScheme="blue">
              Nova OS
            </Button>
          </Flex>
          <Text color="red.500">{error}</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box
      w="full"
      h="full"
      py={4}
      px={isMobile ? 2 : 8}
    >
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
          justify={isMobile ? "center" : "space-between"}
          align="center"
          mb={6}
          mt={isMobile ? 12 : 0}
        >
          {!isMobile && (
            <Heading size="lg" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Ordens de Serviço</Heading>
          )}
          <HStack
            spacing={4}
            w={isMobile ? "full" : "auto"}
            maxW={isMobile ? "400px" : "none"}
            justify={isMobile ? "center" : "flex-end"}
          >
            <Button
              onClick={handleGeneratePDF}
              colorScheme="green"
              flex={isMobile ? "1" : "none"}
              maxW={isMobile ? "200px" : "none"}
              bg={colorMode === 'dark' ? 'rgba(72, 187, 120, 0.8)' : undefined}
              _hover={{
                bg: colorMode === 'dark' ? 'rgba(72, 187, 120, 0.9)' : undefined,
                transform: 'translateY(-1px)',
              }}
              transition="all 0.3s ease"
            >
              Exportar PDF
            </Button>
            <Button
              as={NextLink}
              href="/orders/new"
              colorScheme="blue"
              flex={isMobile ? "1" : "none"}
              maxW={isMobile ? "200px" : "none"}
              bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
              _hover={{
                bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                transform: 'translateY(-1px)',
              }}
              transition="all 0.3s ease"
            >
              Nova OS
            </Button>
          </HStack>
        </Flex>

        {isMobile ? (
          <>
            <HStack mb={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color={colorMode === 'dark' ? 'gray.400' : 'gray.300'} />
                </InputLeftElement>
                <Input
                  name="equipment"
                  placeholder="Buscar equipamento"
                  value={filters.equipment}
                  onChange={handleFilterChange}
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
              <IconButton
                aria-label="Filtros"
                icon={<Filter size={20} />}
                onClick={onOpen}
                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                backdropFilter="blur(12px)"
                borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                _hover={{
                  bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  transform: 'translateY(-1px)',
                }}
                transition="all 0.3s ease"
              />
            </HStack>

            <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
              <DrawerOverlay />
              <DrawerContent
                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)'}
                backdropFilter="blur(12px)"
              >
                <DrawerCloseButton />
                <DrawerHeader color={colorMode === 'dark' ? 'white' : 'gray.800'}>Filtros</DrawerHeader>
                <DrawerBody>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Status</FormLabel>
                      <Select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                        backdropFilter="blur(12px)"
                        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                      >
                        <option value="">Todos</option>
                        <option value="completed">Concluídas</option>
                        <option value="in_progress">Em andamento</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Data</FormLabel>
                      <Input
                        name="date"
                        type="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                        backdropFilter="blur(12px)"
                        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Número de Série</FormLabel>
                      <Input
                        name="serialNumber"
                        value={filters.serialNumber}
                        onChange={handleFilterChange}
                        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                        backdropFilter="blur(12px)"
                        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                      />
                    </FormControl>
                  </VStack>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </>
        ) : (
          <HStack spacing={4} mb={6}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                  <SearchIcon color={colorMode === 'dark' ? 'gray.400' : 'gray.300'} />
              </InputLeftElement>
              <Input
                name="equipment"
                placeholder="Filtrar por equipamento"
                value={filters.equipment}
                onChange={handleFilterChange}
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

              <Input
                name="serialNumber"
                placeholder="Filtrar por número de série"
                value={filters.serialNumber}
                onChange={handleFilterChange}
                w="200px"
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

            <Select
              name="status"
              placeholder="Status"
              value={filters.status}
              onChange={handleFilterChange}
              w="200px"
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
              <option value="completed">Concluídas</option>
              <option value="in_progress">Em andamento</option>
            </Select>

            <Input
              name="date"
              type="date"
              value={filters.date}
              onChange={handleFilterChange}
              w="200px"
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
          </HStack>
        )}

        <Divider />

        {loading ? (
          <Flex justify="center" align="center" h="200px">
            <Spinner size="xl" />
          </Flex>
        ) : filteredOrders.length === 0 ? (
          <Text color={colorMode === 'dark' ? 'white' : 'gray.800'}>Nenhuma OS encontrada.</Text>
          ) : (
          <Box flex="1" overflowY="auto">
            {isMobile ? renderMobileView() : renderDesktopView()}
          </Box>
        )}
      </VStack>
    </Box>
  )
} 
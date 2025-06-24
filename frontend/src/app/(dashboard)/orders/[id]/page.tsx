"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
  useToast,
  Grid,
  GridItem,
  Divider,
  Flex,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  ModalFooter,
  useColorMode,
  useBreakpointValue
} from '@chakra-ui/react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { ArrowLeft } from 'lucide-react'
import jsPDF from 'jspdf'

interface Order {
  id: string
  order_number: string
  client_name: string
  equipment_description: string
  model: string
  serial_number: string
  problem_reported: string
  entry_date: string
  exit_date: string | null
  service_type: string
  accessories: string | null
  notes: string | null
  total_price: number
  supplier_id: string | null
  supplier?: {
    name: string
    phone: string
    email: string
  }
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [exitDate, setExitDate] = useState('')
  const { colorMode } = useColorMode()
  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setError(null)
        const token = localStorage.getItem('@ti-assistant:token')
        if (!token) {
          throw new Error('Token não encontrado')
        }

        console.log('Fazendo requisição para:', `/api/orders/${params.id}`); // Debug log
        const response = await axios.get(`/api/orders/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        console.log('Resposta recebida:', response.data); // Debug log

        if (response.status !== 200) {
          const errorData = response.data
          throw new Error(errorData.message || 'Erro ao buscar ordem de serviço')
        }

        const data = response.data
        setOrder(data)
      } catch (err: any) {
        console.error('Erro completo:', err); // Debug log
        setError(err.message || 'Erro ao buscar ordem de serviço')
        toast({
          title: 'Erro',
          description: err.message || 'Erro ao buscar ordem de serviço',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [params.id, toast])

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta ordem de serviço?')) {
      return
    }

    try {
      const token = localStorage.getItem('@ti-assistant:token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Erro ao excluir ordem de serviço')
      }

      toast({
        title: 'Sucesso',
        description: 'Ordem de serviço excluída com sucesso',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      router.push('/orders')
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao excluir ordem de serviço',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleCompleteOrder = async () => {
    if (!exitDate) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma data de saída',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    try {
      const token = localStorage.getItem('@ti-assistant:token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const res = await fetch(`/api/orders/${params.id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          exit_date: exitDate
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Erro ao finalizar ordem de serviço')
      }

      toast({
        title: 'Sucesso',
        description: 'Ordem de serviço finalizada com sucesso',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      onClose()
      // Recarrega a página para mostrar os dados atualizados
      window.location.reload()
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao finalizar ordem de serviço',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const generatePDF = () => {
    if (!order) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20

    // Add title
    doc.setFontSize(20)
    doc.text('Ordem de Serviço', pageWidth / 2, 20, { align: 'center' })
    doc.setFontSize(12)

    // Add order details
    let y = 40
    const lineHeight = 10

    const details = [
      ['Número da OS:', order.order_number],
      ['Cliente:', order.client_name],
      ['Equipamento:', order.equipment_description],
      ['Modelo:', order.model],
      ['Número de Série:', order.serial_number],
      ['Problema Reportado:', order.problem_reported],
      ['Tipo de Serviço:', order.service_type],
      ['Data de Entrada:', new Date(order.entry_date).toLocaleDateString()],
      ['Data de Saída:', order.exit_date ? new Date(order.exit_date).toLocaleDateString() : 'Em andamento'],
      ['Valor Total:', `R$ ${order.total_price.toFixed(2)}`]
    ]

    details.forEach(([label, value]) => {
      doc.text(`${label} ${value}`, margin, y)
      y += lineHeight
    })

    if (order.accessories) {
      y += lineHeight
      doc.text(`Acessórios: ${order.accessories}`, margin, y)
    }

    if (order.notes) {
      y += lineHeight
      doc.text(`Observações: ${order.notes}`, margin, y)
    }

    if (order.supplier) {
      y += lineHeight * 2
      doc.text('Dados do Fornecedor:', margin, y)
      y += lineHeight
      doc.text(`Nome: ${order.supplier.name}`, margin, y)
      y += lineHeight
      doc.text(`Telefone: ${order.supplier.phone}`, margin, y)
      y += lineHeight
      doc.text(`Email: ${order.supplier.email}`, margin, y)
    }

    doc.save(`os-${order.order_number}.pdf`)
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    )
  }

  if (error || !order) {
    return (
      <Box p={8}>
        <Text color="red.500">{error || 'Ordem de serviço não encontrada'}</Text>
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
        <Flex justify="space-between" align="center" mb={6}>
          <HStack>
            <Button
              leftIcon={<ArrowLeft />}
              variant="ghost"
              onClick={() => router.back()}
              bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
              _hover={{
                bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                transform: 'translateY(-1px)',
              }}
              transition="all 0.3s ease"
            >
              Voltar
            </Button>
            <Heading size="lg" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Detalhes da Ordem de Serviço</Heading>
          </HStack>
          <HStack spacing={4}>
            <Button
              onClick={generatePDF}
              colorScheme="blue"
              bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
              _hover={{
                bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                transform: 'translateY(-1px)',
              }}
              transition="all 0.3s ease"
            >
              Exportar PDF
            </Button>
            {!order.exit_date && (
              <Button
                onClick={onOpen}
                colorScheme="green"
                bg={colorMode === 'dark' ? 'rgba(72, 187, 120, 0.8)' : undefined}
                _hover={{
                  bg: colorMode === 'dark' ? 'rgba(72, 187, 120, 0.9)' : undefined,
                  transform: 'translateY(-1px)',
                }}
                transition="all 0.3s ease"
              >
                Finalizar OS
              </Button>
            )}
            <IconButton
              aria-label="Editar OS"
              icon={<EditIcon />}
              onClick={() => router.push(`/orders/${order.id}/edit`)}
              bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
              _hover={{
                bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                transform: 'translateY(-1px)',
              }}
              transition="all 0.3s ease"
            />
            <IconButton
              aria-label="Excluir OS"
              icon={<DeleteIcon />}
              colorScheme="red"
              bg={colorMode === 'dark' ? 'rgba(245, 101, 101, 0.8)' : undefined}
              _hover={{
                bg: colorMode === 'dark' ? 'rgba(245, 101, 101, 0.9)' : undefined,
                transform: 'translateY(-1px)',
              }}
              transition="all 0.3s ease"
            />
          </HStack>
        </Flex>

        <Grid templateColumns={isMobile ? "1fr" : "repeat(2, 1fr)"} gap={6}>
          <GridItem>
            <VStack
              align="stretch"
              spacing={4}
              bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.3)'}
              p={4}
              borderRadius="lg"
            >
              <Box>
                <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Número da OS</Text>
                <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{order.order_number}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Cliente</Text>
                <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{order.client_name}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Equipamento</Text>
                <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{order.equipment_description}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Modelo</Text>
                <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{order.model}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Número de Série</Text>
                <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{order.serial_number}</Text>
              </Box>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack
              align="stretch"
              spacing={4}
              bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.3)'}
              p={4}
              borderRadius="lg"
            >
              <Box>
                <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Status</Text>
                <Badge colorScheme={order.exit_date ? 'green' : 'yellow'}>
                  {order.exit_date ? 'Concluída' : 'Em andamento'}
                </Badge>
              </Box>
              <Box>
                <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Tipo de Serviço</Text>
                <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{order.service_type}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Data de Entrada</Text>
                <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{new Date(order.entry_date).toLocaleDateString()}</Text>
              </Box>
              {order.exit_date && (
                <Box>
                  <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Data de Saída</Text>
                  <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{new Date(order.exit_date).toLocaleDateString()}</Text>
                </Box>
              )}
              <Box>
                <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Valor Total</Text>
                <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>R$ {order.total_price.toFixed(2)}</Text>
              </Box>
            </VStack>
          </GridItem>
        </Grid>

        <Divider my={6} />

        <VStack
          align="stretch"
          spacing={4}
          bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.3)' : 'rgba(255, 255, 255, 0.3)'}
          p={4}
          borderRadius="lg"
        >
          <Box>
            <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Problema Reportado</Text>
            <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{order.problem_reported}</Text>
          </Box>
          {order.accessories && (
            <Box>
              <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Acessórios</Text>
              <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{order.accessories}</Text>
            </Box>
          )}
          {order.notes && (
            <Box>
              <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Observações</Text>
              <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{order.notes}</Text>
            </Box>
          )}
          {order.supplier && (
            <Box>
              <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Fornecedor</Text>
              <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{order.supplier.name}</Text>
              <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{order.supplier.phone}</Text>
              <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>{order.supplier.email}</Text>
            </Box>
          )}
        </VStack>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent
            bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)'}
            backdropFilter="blur(12px)"
          >
            <ModalHeader color={colorMode === 'dark' ? 'white' : 'gray.800'}>Finalizar Ordem de Serviço</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Data de Saída</FormLabel>
                <Input
                  type="date"
                  value={exitDate}
                  onChange={(e) => setExitDate(e.target.value)}
                  bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                  borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={onClose}
                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                _hover={{
                  bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                }}
              >
                Cancelar
              </Button>
              <Button
                colorScheme="green"
                onClick={handleCompleteOrder}
                bg={colorMode === 'dark' ? 'rgba(72, 187, 120, 0.8)' : undefined}
                _hover={{
                  bg: colorMode === 'dark' ? 'rgba(72, 187, 120, 0.9)' : undefined,
                }}
              >
                Finalizar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  )
} 
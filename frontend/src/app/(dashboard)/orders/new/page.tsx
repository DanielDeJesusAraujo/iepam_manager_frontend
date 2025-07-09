"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  useToast,
  VStack,
  Text,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Flex,
  HStack,
  Divider,
  Alert,
  AlertIcon,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react'
import { ArrowLeft } from 'lucide-react'

interface FormData {
  order_number: string
  client_name: string
  equipment_description: string
  model: string
  serial_number: string
  problem_reported: string
  service_type: string
  accessories: string
  notes: string
  total_price: number
}

export default function NewOrderPage() {
  const [formData, setFormData] = useState<FormData>({
    order_number: '',
    client_name: '',
    equipment_description: '',
    model: '',
    serial_number: '',
    problem_reported: '',
    service_type: '',
    accessories: '',
    notes: '',
    total_price: 0
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePriceChange = (value: string) => {
    setFormData(prev => ({ ...prev, total_price: parseFloat(value) || 0 }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setLoading(true)
    try {
      const token = localStorage.getItem('@ti-assistant:token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      // Prepara os dados para envio, incluindo apenas campos preenchidos
      const dataToSend: any = {
        serial_number: formData.serial_number,
        problem_reported: formData.problem_reported,
        service_type: formData.service_type,
        total_price: formData.total_price,
        entry_date: new Date().toISOString(),
      };
      if (formData.order_number.trim()) dataToSend.order_number = formData.order_number;
      if (formData.client_name.trim()) dataToSend.client_name = formData.client_name;
      if (formData.equipment_description.trim()) dataToSend.equipment_description = formData.equipment_description;
      if (formData.model.trim()) dataToSend.model = formData.model;
      if (formData.accessories.trim()) dataToSend.accessories = formData.accessories;
      if (formData.notes.trim()) dataToSend.notes = formData.notes;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Erro ao criar ordem de serviço')
      }

      toast({
        title: 'Sucesso',
        description: 'Ordem de serviço criada com sucesso',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      router.push('/orders')
    } catch (err: any) {
      setFormError(err.message || 'Erro ao criar ordem de serviço')
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao criar ordem de serviço',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bgGradient="linear(to-br, gray.50, gray.100)">
      <Box maxW="3xl" w="full" mx="auto" my={10} p={[4, 8]} borderWidth={1} borderRadius="2xl" boxShadow="2xl" bg="white">
        <HStack mb={6} spacing={4} align="center">
          <Button
            leftIcon={<ArrowLeft size={18} />}
            variant="ghost"
            onClick={() => router.back()}
            aria-label="Voltar"
          >
            Voltar
          </Button>
          <Heading size="lg" color="blue.700">Nova Ordem de Serviço</Heading>
        </HStack>
        {formError && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            {formError}
          </Alert>
        )}
        <form onSubmit={handleSubmit} autoComplete="off">
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="sm" color="gray.600" mb={2}>Dados do Cliente</Heading>
              <Divider mb={4} />
              <FormControl>
                <FormLabel>Número da OS (opcional)</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="gray.400" children="#" />
                  <Input
                    name="order_number"
                    value={formData.order_number}
                    onChange={handleChange}
                    placeholder="Deixe em branco para gerar automaticamente"
                    autoFocus
                  />
                </InputGroup>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Se não preenchido, será gerado automaticamente no formato OS20241201123456
                </Text>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Nome do Cliente</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="gray.400" children={<span>👤</span>} />
                  <Input
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleChange}
                    placeholder="Digite o nome do cliente"
                  />
                </InputGroup>
              </FormControl>
            </Box>
            <Box>
              <Heading size="sm" color="gray.600" mb={2}>Equipamento</Heading>
              <Divider mb={4} />
              <FormControl>
                <FormLabel>Descrição do Equipamento</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="gray.400" children={<span>💻</span>} />
                  <Input
                    name="equipment_description"
                    value={formData.equipment_description}
                    onChange={handleChange}
                    placeholder="Digite a descrição do equipamento"
                  />
                </InputGroup>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Modelo do Equipamento</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="gray.400" children={<span>🏷️</span>} />
                  <Input
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="Digite o modelo do equipamento"
                  />
                </InputGroup>
              </FormControl>
              <FormControl mt={4} isRequired>
                <FormLabel>Número de Série</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="gray.400" children={<span>🔢</span>} />
                  <Input
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleChange}
                    placeholder="Digite o número de série"
                  />
                </InputGroup>
              </FormControl>
            </Box>
            <Box>
              <Heading size="sm" color="gray.600" mb={2}>Serviço</Heading>
              <Divider mb={4} />
              <FormControl isRequired>
                <FormLabel>Problema Reportado</FormLabel>
                <Textarea
                  name="problem_reported"
                  value={formData.problem_reported}
                  onChange={handleChange}
                  placeholder="Descreva o problema reportado"
                />
              </FormControl>
              <FormControl mt={4} isRequired>
                <FormLabel>Tipo de Serviço</FormLabel>
                <Select
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  placeholder="Selecione o tipo de serviço"
                >
                  <option value="manutencao">Manutenção</option>
                  <option value="reparo">Reparo</option>
                  <option value="instalacao">Instalação</option>
                  <option value="configuracao">Configuração</option>
                </Select>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Acessórios</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="gray.400" children={<span>🧰</span>} />
                  <Input
                    name="accessories"
                    value={formData.accessories}
                    onChange={handleChange}
                    placeholder="Digite os acessórios"
                  />
                </InputGroup>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Observações</FormLabel>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Digite as observações"
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Valor Total</FormLabel>
                <NumberInput
                  value={formData.total_price}
                  onChange={handlePriceChange}
                  min={0}
                  precision={2}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </Box>
            <Divider />
            <Flex justify="flex-end" gap={4}>
              <Button variant="ghost" onClick={() => router.back()} aria-label="Cancelar">
                Cancelar
              </Button>
              <Button type="submit" colorScheme="blue" isLoading={loading} aria-label="Criar OS">
                Criar Ordem de Serviço
              </Button>
            </Flex>
          </VStack>
        </form>
      </Box>
    </Flex>
  )
} 
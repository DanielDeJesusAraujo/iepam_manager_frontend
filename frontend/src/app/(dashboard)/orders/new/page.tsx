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
  Textarea
} from '@chakra-ui/react'

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePriceChange = (value: string) => {
    setFormData(prev => ({ ...prev, total_price: parseFloat(value) || 0 }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('@ti-assistant:token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      // Prepara os dados para envio, removendo campos vazios opcionais
      const dataToSend = {
        ...formData,
        entry_date: new Date().toISOString()
      }
      
      // Remove campos vazios opcionais para que o backend use valores padrão
      if (!dataToSend.order_number?.trim()) {
        delete dataToSend.order_number
      }
      if (!dataToSend.client_name?.trim()) {
        delete dataToSend.client_name
      }
      if (!dataToSend.equipment_description?.trim()) {
        delete dataToSend.equipment_description
      }
      if (!dataToSend.model?.trim()) {
        delete dataToSend.model
      }
      if (!dataToSend.accessories?.trim()) {
        delete dataToSend.accessories
      }
      if (!dataToSend.notes?.trim()) {
        delete dataToSend.notes
      }

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
    <Box maxW="2xl" mx="auto" mt={10} p={8} borderWidth={1} borderRadius="lg" boxShadow="md">
      <Heading size="lg" mb={6}>Nova Ordem de Serviço</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Número da OS (opcional)</FormLabel>
            <Input
              name="order_number"
              value={formData.order_number}
              onChange={handleChange}
              placeholder="Deixe em branco para gerar automaticamente"
            />
            <Text fontSize="sm" color="gray.500" mt={1}>
              Se não preenchido, será gerado automaticamente no formato OS20241201123456
            </Text>
          </FormControl>

          <FormControl>
            <FormLabel>Nome do Cliente</FormLabel>
            <Input
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              placeholder="Digite o nome do cliente"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Descrição do Equipamento</FormLabel>
            <Input
              name="equipment_description"
              value={formData.equipment_description}
              onChange={handleChange}
              placeholder="Digite a descrição do equipamento"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Modelo do Equipamento</FormLabel>
            <Input
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Digite o modelo do equipamento"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Número de Série</FormLabel>
            <Input
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              placeholder="Digite o número de série"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Problema Reportado</FormLabel>
            <Textarea
              name="problem_reported"
              value={formData.problem_reported}
              onChange={handleChange}
              placeholder="Descreva o problema reportado"
            />
          </FormControl>

          <FormControl isRequired>
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

          <FormControl>
            <FormLabel>Acessórios</FormLabel>
            <Input
              name="accessories"
              value={formData.accessories}
              onChange={handleChange}
              placeholder="Digite os acessórios"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Observações</FormLabel>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Digite as observações"
            />
          </FormControl>

          <FormControl>
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

          <Button type="submit" colorScheme="blue" isLoading={loading} w="full">
            Criar Ordem de Serviço
          </Button>
        </VStack>
      </form>
    </Box>
  )
} 
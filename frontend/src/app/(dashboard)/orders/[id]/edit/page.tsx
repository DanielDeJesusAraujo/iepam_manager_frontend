"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    useToast,
    Spinner,
    Text,
    HStack,
    Textarea,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Select,
    Flex,
    Alert,
    AlertIcon,
} from '@chakra-ui/react'
import { ArrowLeft } from 'lucide-react'

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
}

export default function EditOrderPage({ params }: { params: { id: string } }) {
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const toast = useToast()

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setError(null)
                const token = localStorage.getItem('@ti-assistant:token')
                if (!token) {
                    throw new Error('Token não encontrado')
                }

                const response = await fetch(`/api/orders/${params.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.message || 'Erro ao buscar ordem de serviço')
                }

                const data = await response.json()
                setOrder(data)
            } catch (err: any) {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!order) return

        try {
            setSaving(true)
            const token = localStorage.getItem('@ti-assistant:token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            // Verifica se a OS já estava concluída antes da edição
            const originalOrder = await fetch(`/api/orders/${params.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(res => res.json())

            if (originalOrder.exit_date && !order.exit_date) {
                toast({
                    title: 'Erro',
                    description: 'Não é possível reabrir uma ordem de serviço concluída',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                })
                return
            }

            const response = await fetch(`/api/orders/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(order)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erro ao atualizar ordem de serviço')
            }

            toast({
                title: 'Sucesso',
                description: 'Ordem de serviço atualizada com sucesso',
                status: 'success',
                duration: 5000,
                isClosable: true,
            })

            router.push(`/orders/${params.id}`)
        } catch (err: any) {
            toast({
                title: 'Erro',
                description: err.message || 'Erro ao atualizar ordem de serviço',
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setOrder(prev => prev ? { ...prev, [name]: value } : null)
    }

    const handleNumberChange = (value: string, name: string) => {
        setOrder(prev => prev ? { ...prev, [name]: parseFloat(value) } : null)
    }

    if (loading) {
        return (
            <Box p={8}>
                <Flex justify="center" align="center" h="200px">
                    <Spinner size="xl" />
                </Flex>
            </Box>
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
        <Box p={8}>
            <HStack mb={6}>
                <Button
                    leftIcon={<ArrowLeft />}
                    variant="ghost"
                    onClick={() => router.back()}
                >
                    Voltar
                </Button>
                <Heading size="lg">Editar Ordem de Serviço</Heading>
            </HStack>

            <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                        <FormLabel>Número da OS</FormLabel>
                        <Input
                            name="order_number"
                            value={order.order_number}
                            onChange={handleChange}
                            isReadOnly
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Cliente</FormLabel>
                        <Input
                            name="client_name"
                            value={order.client_name}
                            onChange={handleChange}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Equipamento</FormLabel>
                        <Input
                            name="equipment_description"
                            value={order.equipment_description}
                            onChange={handleChange}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Modelo</FormLabel>
                        <Input
                            name="model"
                            value={order.model}
                            onChange={handleChange}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Número de Série</FormLabel>
                        <Input
                            name="serial_number"
                            value={order.serial_number}
                            onChange={handleChange}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Problema Reportado</FormLabel>
                        <Textarea
                            name="problem_reported"
                            value={order.problem_reported}
                            onChange={handleChange}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Data de Entrada</FormLabel>
                        <Input
                            name="entry_date"
                            type="date"
                            value={new Date(order.entry_date).toISOString().split('T')[0]}
                            onChange={handleChange}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Status</FormLabel>
                        <Select
                            name="status"
                            value={order.exit_date ? 'completed' : 'in_progress'}
                            onChange={(e) => {
                                const value = e.target.value;
                                setOrder(prev => prev ? {
                                    ...prev,
                                    exit_date: value === 'completed' ? new Date().toISOString() : null
                                } : null);
                            }}
                        >
                            <option value="in_progress">Em andamento</option>
                            <option value="completed">Concluída</option>
                        </Select>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Data de Saída</FormLabel>
                        <Input
                            name="exit_date"
                            type="date"
                            value={order.exit_date ? new Date(order.exit_date).toISOString().split('T')[0] : ''}
                            onChange={handleChange}
                            isDisabled={!order.exit_date}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Tipo de Serviço</FormLabel>
                        <Select
                            name="service_type"
                            value={order.service_type}
                            onChange={handleChange}
                        >
                            <option value="Manutenção">Manutenção</option>
                            <option value="Instalação">Instalação</option>
                            <option value="Configuração">Configuração</option>
                            <option value="Suporte">Suporte</option>
                        </Select>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Acessórios</FormLabel>
                        <Textarea
                            name="accessories"
                            value={order.accessories || ''}
                            onChange={handleChange}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Observações</FormLabel>
                        <Textarea
                            name="notes"
                            value={order.notes || ''}
                            onChange={handleChange}
                        />
                    </FormControl>

                    <FormControl isRequired>
                        <FormLabel>Valor Total</FormLabel>
                        <NumberInput
                            value={order.total_price}
                            onChange={(value) => handleNumberChange(value, 'total_price')}
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

                    <HStack spacing={4} justify="flex-end">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            colorScheme="blue"
                            isLoading={saving}
                        >
                            Salvar
                        </Button>
                    </HStack>
                </VStack>
            </form>
        </Box>
    )
} 
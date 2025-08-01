'use client'

import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    Button,
    useToast,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    HStack,
    Text,
    Heading,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { useRouter } from 'next/navigation';

interface UnitOfMeasure {
    id: string
    name: string
    symbol: string
    description?: string
}

export default function UnitOfMeasureSettings() {
    const [units, setUnits] = useState<UnitOfMeasure[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [editingUnit, setEditingUnit] = useState<UnitOfMeasure | null>(null)
    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        description: ''
    })

    useEffect(() => {
        fetchUnits()
    }, [])

    const fetchUnits = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            const response = await fetch('/api/unit-of-measures', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.status === 429) {
                router.push('/rate-limit');
                return;
            }

            const data = await response.json()
            setUnits(data)
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar as unidades de medida.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = localStorage.getItem('@ti-assistant:token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            const url = editingUnit
                ? `/api/unit-of-measures/${editingUnit.id}`
                : '/api/unit-of-measures'

            const method = editingUnit ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error('Erro ao salvar unidade de medida')
            }

            toast({
                title: 'Sucesso',
                description: `Unidade de medida ${editingUnit ? 'atualizada' : 'criada'} com sucesso.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            })

            fetchUnits()
            handleClose()
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar a unidade de medida.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta unidade de medida?')) {
            return
        }

        try {
            const token = localStorage.getItem('@ti-assistant:token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            const response = await fetch(`/api/unit-of-measures/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error('Erro ao excluir unidade de medida')
            }

            toast({
                title: 'Sucesso',
                description: 'Unidade de medida excluída com sucesso.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            })

            fetchUnits()
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível excluir a unidade de medida.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
    }

    const handleEdit = (unit: UnitOfMeasure) => {
        setEditingUnit(unit)
        setFormData({
            name: unit.name,
            symbol: unit.symbol,
            description: unit.description || ''
        })
        onOpen()
    }

    const handleClose = () => {
        setEditingUnit(null)
        setFormData({
            name: '',
            symbol: '',
            description: ''
        })
        onClose()
    }

    return (
        <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
                <Heading size="sm">Unidades de Medida</Heading>
                <Button colorScheme="blue" onClick={onOpen}>
                    Nova Unidade
                </Button>
            </HStack>

            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Nome</Th>
                        <Th>Símbolo</Th>
                        <Th>Descrição</Th>
                        <Th width="100px">Ações</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {units.map((unit) => (
                        <Tr key={unit.id}>
                            <Td>{unit.name}</Td>
                            <Td>{unit.symbol}</Td>
                            <Td>{unit.description}</Td>
                            <Td>
                                <HStack spacing={2}>
                                    <IconButton
                                        aria-label="Editar"
                                        icon={<EditIcon />}
                                        size="sm"
                                        onClick={() => handleEdit(unit)}
                                    />
                                    <IconButton
                                        aria-label="Excluir"
                                        icon={<DeleteIcon />}
                                        size="sm"
                                        colorScheme="red"
                                        onClick={() => handleDelete(unit.id)}
                                    />
                                </HStack>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <Modal isOpen={isOpen} onClose={handleClose}>
                <ModalOverlay />
                <ModalContent>
                    <form onSubmit={handleSubmit}>
                        <ModalHeader>
                            {editingUnit ? 'Editar' : 'Nova'} Unidade de Medida
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Nome</FormLabel>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Metro"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Símbolo</FormLabel>
                                    <Input
                                        value={formData.symbol}
                                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                                        placeholder="Ex: m"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Descrição</FormLabel>
                                    <Input
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Descrição opcional"
                                    />
                                </FormControl>
                            </VStack>
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={handleClose}>
                                Cancelar
                            </Button>
                            <Button
                                colorScheme="blue"
                                type="submit"
                                isLoading={isLoading}
                            >
                                {editingUnit ? 'Atualizar' : 'Criar'}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </VStack>
    )
} 
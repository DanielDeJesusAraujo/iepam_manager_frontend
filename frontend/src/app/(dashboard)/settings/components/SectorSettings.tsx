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
    Heading,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    Select,
    Text,
    Badge,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'

interface Location {
    id: string
    name: string
    address: string
    branch: string
    user_id: string
    created_at: string
    updated_at: string
}

interface Sector {
    id: string
    name: string
    description: string | null
    location_id: string
    location: Location
    inventory: any[]
    _count?: {
        inventory: number
    }
    created_at: string
    updated_at: string
}

export default function SectorSettings() {
    const [sectors, setSectors] = useState<Sector[]>([])
    const [locations, setLocations] = useState<Location[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [editingSector, setEditingSector] = useState<Sector | null>(null)
    const toast = useToast()
    const { isOpen: isSectorModalOpen, onOpen: onSectorModalOpen, onClose: onSectorModalClose } = useDisclosure()

    const [sectorFormData, setSectorFormData] = useState({
        name: '',
        description: '',
        location_id: ''
    })

    useEffect(() => {
        fetchSectors()
        fetchLocations()
    }, [])

    const fetchSectors = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            const response = await fetch('/api/sectors', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
            const data = await response.json()
            setSectors(data)
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar os setores.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
    }

    const fetchLocations = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            const response = await fetch('/api/locations', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`)
            }
            
            const data = await response.json()
            console.log('Locations data:', data) // Debug log
            setLocations(data)
        } catch (error) {
            console.error('Erro ao carregar localizações:', error) // Debug log
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar as localizações.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
    }

    const handleSectorSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = localStorage.getItem('@ti-assistant:token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            if (editingSector) {
                // Atualizar setor existente
                const response = await fetch(`/api/sectors/${editingSector.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(sectorFormData),
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Erro ao atualizar setor')
                }

                toast({
                    title: 'Sucesso',
                    description: 'Setor atualizado com sucesso.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                })
            } else {
                // Criar novo setor
                const response = await fetch('/api/sectors', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(sectorFormData),
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Erro ao criar setor')
                }

                toast({
                    title: 'Sucesso',
                    description: 'Setor criado com sucesso.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                })
            }

            fetchSectors()
            handleSectorClose()
        } catch (error) {
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Não foi possível salvar o setor.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSectorDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este setor?')) {
            return
        }

        try {
            const token = localStorage.getItem('@ti-assistant:token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            const response = await fetch(`/api/sectors/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Erro ao excluir setor')
            }

            toast({
                title: 'Sucesso',
                description: 'Setor excluído com sucesso.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            })

            fetchSectors()
        } catch (error) {
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Não foi possível excluir o setor.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
    }

    const handleSectorEdit = (sector: Sector) => {
        setEditingSector(sector)
        setSectorFormData({
            name: sector.name,
            description: sector.description || '',
            location_id: sector.location_id
        })
        onSectorModalOpen()
    }

    const handleSectorClose = () => {
        setEditingSector(null)
        setSectorFormData({
            name: '',
            description: '',
            location_id: ''
        })
        onSectorModalClose()
    }

    return (
        <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
                <Heading size="sm">Setores</Heading>
                <Button colorScheme="blue" onClick={onSectorModalOpen}>
                    Novo Setor
                </Button>
            </HStack>

            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Nome</Th>
                        <Th>Descrição</Th>
                        <Th>Localização</Th>
                        <Th>Itens de Inventário</Th>
                        <Th width="100px">Ações</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {sectors.length > 0 && sectors.map((sector) => (
                        <Tr key={sector.id}>
                            <Td>{sector.name}</Td>
                            <Td>{sector.description || '-'}</Td>
                            <Td>{sector.location?.name || '-'}</Td>
                            <Td>
                                <Badge colorScheme={sector._count?.inventory > 0 ? 'green' : 'gray'}>
                                    {sector._count?.inventory || 0} itens
                                </Badge>
                            </Td>
                            <Td>
                                <HStack spacing={2}>
                                    <IconButton
                                        aria-label="Editar setor"
                                        icon={<EditIcon />}
                                        size="sm"
                                        onClick={() => handleSectorEdit(sector)}
                                    />
                                    <IconButton
                                        aria-label="Excluir setor"
                                        icon={<DeleteIcon />}
                                        size="sm"
                                        colorScheme="red"
                                        onClick={() => handleSectorDelete(sector.id)}
                                        isDisabled={sector._count?.inventory > 0}
                                    />
                                </HStack>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <Modal isOpen={isSectorModalOpen} onClose={handleSectorClose}>
                <ModalOverlay />
                <ModalContent>
                    <form onSubmit={handleSectorSubmit}>
                        <ModalHeader>
                            {editingSector ? 'Editar' : 'Novo'} Setor
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Nome do Setor</FormLabel>
                                    <Input
                                        value={sectorFormData.name}
                                        onChange={(e) => setSectorFormData({ ...sectorFormData, name: e.target.value })}
                                        placeholder="Nome do setor"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Descrição</FormLabel>
                                    <Input
                                        value={sectorFormData.description}
                                        onChange={(e) => setSectorFormData({ ...sectorFormData, description: e.target.value })}
                                        placeholder="Descrição do setor"
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Localização</FormLabel>
                                    <Select
                                        value={sectorFormData.location_id}
                                        onChange={(e) => setSectorFormData({ ...sectorFormData, location_id: e.target.value })}
                                        placeholder="Selecione uma localização"
                                    >
                                        {locations.map((location) => (
                                            <option key={location.id} value={location.id}>
                                                {location.name}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={handleSectorClose}>
                                Cancelar
                            </Button>
                            <Button
                                colorScheme="blue"
                                type="submit"
                                isLoading={isLoading}
                            >
                                {editingSector ? 'Atualizar' : 'Criar'}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </VStack>
    )
} 
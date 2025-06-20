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
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'

interface Location {
    id: string
    name: string
    description: string
}

export default function LocationSettings() {
    const [locations, setLocations] = useState<Location[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [editingLocation, setEditingLocation] = useState<Location | null>(null)
    const toast = useToast()
    const { isOpen: isLocationModalOpen, onOpen: onLocationModalOpen, onClose: onLocationModalClose } = useDisclosure()

    const [locationFormData, setLocationFormData] = useState({
        name: '',
        description: ''
    })

    useEffect(() => {
        fetchLocations()
    }, [])

    const fetchLocations = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            const response = await fetch('/api/locales', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
            const data = await response.json()
            setLocations(data)
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar os locais.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
    }

    const handleLocationSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = localStorage.getItem('@ti-assistant:token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            if (editingLocation) {
                // Atualizar local existente
                const response = await fetch(`/api/locales/${editingLocation.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(locationFormData),
                })

                if (!response.ok) {
                    throw new Error('Erro ao atualizar local')
                }

                toast({
                    title: 'Sucesso',
                    description: 'Local atualizado com sucesso.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                })
            } else {
                // Criar novo local
                const response = await fetch('/api/locales', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(locationFormData),
                })

                if (!response.ok) {
                    throw new Error('Erro ao criar local')
                }

                toast({
                    title: 'Sucesso',
                    description: 'Local criado com sucesso.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                })
            }

            fetchLocations()
            handleLocationClose()
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar o local.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleLocationDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este local?')) {
            return
        }

        try {
            const token = localStorage.getItem('@ti-assistant:token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            const response = await fetch(`/api/locales/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error('Erro ao excluir local')
            }

            toast({
                title: 'Sucesso',
                description: 'Local excluído com sucesso.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            })

            fetchLocations()
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível excluir o local.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
    }

    const handleLocationEdit = (location: Location) => {
        setEditingLocation(location)
        setLocationFormData({
            name: location.name,
            description: location.description
        })
        onLocationModalOpen()
    }

    const handleLocationClose = () => {
        setEditingLocation(null)
        setLocationFormData({
            name: '',
            description: ''
        })
        onLocationModalClose()
    }

    return (
        <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
                <Heading size="sm">Locais</Heading>
                <Button colorScheme="blue" onClick={onLocationModalOpen}>
                    Novo Local
                </Button>
            </HStack>

            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Nome</Th>
                        <Th>Descrição</Th>
                        <Th width="100px">Ações</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {locations.map((location) => (
                        <Tr key={location.id}>
                            <Td>{location.name}</Td>
                            <Td>{location.description}</Td>
                            <Td>
                                <HStack spacing={2}>
                                    <IconButton
                                        aria-label="Editar local"
                                        icon={<EditIcon />}
                                        size="sm"
                                        onClick={() => handleLocationEdit(location)}
                                    />
                                    <IconButton
                                        aria-label="Excluir local"
                                        icon={<DeleteIcon />}
                                        size="sm"
                                        colorScheme="red"
                                        onClick={() => handleLocationDelete(location.id)}
                                    />
                                </HStack>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <Modal isOpen={isLocationModalOpen} onClose={handleLocationClose}>
                <ModalOverlay />
                <ModalContent>
                    <form onSubmit={handleLocationSubmit}>
                        <ModalHeader>
                            {editingLocation ? 'Editar' : 'Novo'} Local
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Nome do Local</FormLabel>
                                    <Input
                                        value={locationFormData.name}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, name: e.target.value })}
                                        placeholder="Nome do local"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Descrição</FormLabel>
                                    <Input
                                        value={locationFormData.description}
                                        onChange={(e) => setLocationFormData({ ...locationFormData, description: e.target.value })}
                                        placeholder="Descrição do local"
                                    />
                                </FormControl>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={handleLocationClose}>
                                Cancelar
                            </Button>
                            <Button
                                colorScheme="blue"
                                type="submit"
                                isLoading={isLoading}
                            >
                                {editingLocation ? 'Atualizar' : 'Criar'}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </VStack>
    )
} 
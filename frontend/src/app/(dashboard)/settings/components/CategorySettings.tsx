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
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { Category } from '../interfaces/ICategory'
import { Subcategory } from '../interfaces/ISubtategory'
import { useRouter } from 'next/navigation'

export default function CategorySettings() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
    const toast = useToast()
    const { isOpen: isCategoryModalOpen, onOpen: onCategoryModalOpen, onClose: onCategoryModalClose } = useDisclosure()
    const { isOpen: isSubcategoryModalOpen, onOpen: onSubcategoryModalOpen, onClose: onSubcategoryModalClose } = useDisclosure()

    const [categoryFormData, setCategoryFormData] = useState({
        value: '',
        subcategoryValue: ''
    })

    const [subcategoryFormData, setSubcategoryFormData] = useState({
        value: '',
        categoryId: ''
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            const response = await fetch('/api/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.status === 429) {
                router.push('/rate-limit');
                return;
            }

            const data = await response.json()
            setCategories(data)
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar as categorias.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
    }

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = localStorage.getItem('@ti-assistant:token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            if (editingCategory) {
                // Atualizar categoria existente
                const response = await fetch(`/api/categories/${editingCategory.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        value: categoryFormData.value,
                        label: categoryFormData.value
                    }),
                })

                if (response.status === 429) {
                    router.push('/rate-limit');
                    return;
                }

                if (!response.ok) {
                    throw new Error('Erro ao atualizar categoria')
                }

                toast({
                    title: 'Sucesso',
                    description: 'Categoria atualizada com sucesso.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                })
            } else {
                // Criar nova categoria
                const categoryResponse = await fetch('/api/categories', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        value: categoryFormData.value,
                        label: categoryFormData.value
                    }),
                })

                if (categoryResponse.status === 429) {
                    router.push('/rate-limit');
                    return;
                }

                if (!categoryResponse.ok) {
                    throw new Error('Erro ao criar categoria')
                }

                const category = await categoryResponse.json()

                // Criar subcategoria apenas se houver um valor
                if (categoryFormData.subcategoryValue) {
                    const subcategoryResponse = await fetch('/api/subcategories', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            value: categoryFormData.subcategoryValue,
                            label: categoryFormData.subcategoryValue,
                            category_id: category.id
                        }),
                    })

                    if (subcategoryResponse.status === 429) {
                        router.push('/rate-limit');
                        return;
                    }

                    if (!subcategoryResponse.ok) {
                        throw new Error('Erro ao criar subcategoria')
                    }
                }

                toast({
                    title: 'Sucesso',
                    description: 'Categoria e subcategoria criadas com sucesso.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                })
            }

            fetchCategories()
            handleCategoryClose()
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar a categoria.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubcategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = localStorage.getItem('@ti-assistant:token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            const url = editingSubcategory
                ? `/api/subcategories/${editingSubcategory.id}`
                : '/api/subcategories'

            const method = editingSubcategory ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    value: subcategoryFormData.value,
                    label: subcategoryFormData.value,
                    category_id: subcategoryFormData.categoryId
                }),
            })

            if (!response.ok) {
                throw new Error('Erro ao salvar subcategoria')
            }

            toast({
                title: 'Sucesso',
                description: `Subcategoria ${editingSubcategory ? 'atualizada' : 'criada'} com sucesso.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            })

            fetchCategories()
            handleSubcategoryClose()
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar a subcategoria.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCategoryDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
            return
        }

        try {
            const token = localStorage.getItem('@ti-assistant:token')
            if (!token) {
                throw new Error('Token não encontrado')
            }

            const response = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.status === 429) {
                router.push('/rate-limit');
                return;
            }

            if (!response.ok) {
                throw new Error('Erro ao excluir categoria')
            }

            toast({
                title: 'Sucesso',
                description: 'Categoria excluída com sucesso.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            })

            fetchCategories()
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível excluir a categoria.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
    }

    const handleSubcategoryDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta subcategoria?')) {
            return
        }

        try {
            const token = localStorage.getItem('@ti-assistant:token')
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const response = await fetch(`/api/subcategories/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.status === 429) {
                router.push('/rate-limit');
                return;
            }

            if (!response.ok) {
                throw new Error('Erro ao excluir subcategoria');
            }

            toast({
                title: 'Sucesso',
                description: 'Subcategoria excluída com sucesso.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            })

            fetchCategories()
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível excluir a subcategoria.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
    }

    const handleCategoryEdit = (category: Category) => {
        setEditingCategory(category)
        setCategoryFormData({
            value: category.value,
            subcategoryValue: category.subcategories?.length ? category.subcategories[0].value : ''
        })
        onCategoryModalOpen()
    }

    const handleEditSubcategory = (subcategory: Subcategory) => {
        setEditingSubcategory(subcategory)
        setSubcategoryFormData({
            value: subcategory.label,
            categoryId: subcategory.categoryId
        })
        onSubcategoryModalOpen()
    }

    const handleCategoryClose = () => {
        setEditingCategory(null)
        setCategoryFormData({
            value: '',
            subcategoryValue: ''
        })
        onCategoryModalClose()
    }

    const handleSubcategoryClose = () => {
        setEditingSubcategory(null)
        setSubcategoryFormData({
            value: '',
            categoryId: ''
        })
        onSubcategoryModalClose()
    }

    return (
        <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
                <Heading size="sm">Categorias e Subcategorias</Heading>
                <HStack>
                    <Button colorScheme="blue" onClick={onCategoryModalOpen}>
                        Nova Categoria
                    </Button>
                    <Button colorScheme="green" onClick={onSubcategoryModalOpen}>
                        Nova Subcategoria
                    </Button>
                </HStack>
            </HStack>

            {categories.map((category) => (
                <VStack key={category.id} align="stretch" spacing={4} p={4} borderWidth={1} borderRadius="md">
                    <HStack justify="space-between">
                        <Heading size="sm">{category.value}</Heading>
                        <HStack>
                            <IconButton
                                aria-label="Editar categoria"
                                icon={<EditIcon />}
                                size="sm"
                                onClick={() => handleCategoryEdit(category)}
                            />
                            <IconButton
                                aria-label="Excluir categoria"
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleCategoryDelete(category.id)}
                            />
                        </HStack>
                    </HStack>

                    {category.subcategories && category.subcategories.length > 0 && (
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Nome</Th>
                                    <Th>Descrição</Th>
                                    <Th width="100px">Ações</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {category.subcategories.map((subcategory) => (
                                    <Tr key={subcategory.id}>
                                        <Td>{subcategory.label}</Td>
                                        <Td>{subcategory.description}</Td>
                                        <Td>
                                            <HStack spacing={2}>
                                                <IconButton
                                                    aria-label="Editar subcategoria"
                                                    icon={<EditIcon />}
                                                    size="sm"
                                                    onClick={() => handleEditSubcategory(subcategory)}
                                                />
                                                <IconButton
                                                    aria-label="Excluir subcategoria"
                                                    icon={<DeleteIcon />}
                                                    size="sm"
                                                    colorScheme="red"
                                                    onClick={() => handleSubcategoryDelete(subcategory.id)}
                                                />
                                            </HStack>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </VStack>
            ))}

            <Modal isOpen={isCategoryModalOpen} onClose={handleCategoryClose}>
                <ModalOverlay />
                <ModalContent>
                    <form onSubmit={handleCategorySubmit}>
                        <ModalHeader>
                            {editingCategory ? 'Editar' : 'Nova'} Categoria
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Nome da Categoria</FormLabel>
                                    <Input
                                        value={categoryFormData.value}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, value: e.target.value })}
                                        placeholder="Nome da categoria"
                                    />
                                </FormControl>
                                {!editingCategory && (
                                    <FormControl isRequired>
                                        <FormLabel>Nome da Subcategoria</FormLabel>
                                        <Input
                                            value={categoryFormData.subcategoryValue}
                                            onChange={(e) => setCategoryFormData({ ...categoryFormData, subcategoryValue: e.target.value })}
                                            placeholder="Nome da primeira subcategoria"
                                        />
                                    </FormControl>
                                )}
                            </VStack>
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={handleCategoryClose}>
                                Cancelar
                            </Button>
                            <Button
                                colorScheme="blue"
                                type="submit"
                                isLoading={isLoading}
                            >
                                {editingCategory ? 'Atualizar' : 'Criar'}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>

            <Modal isOpen={isSubcategoryModalOpen} onClose={handleSubcategoryClose}>
                <ModalOverlay />
                <ModalContent>
                    <form onSubmit={handleSubcategorySubmit}>
                        <ModalHeader>
                            {editingSubcategory ? 'Editar' : 'Nova'} Subcategoria
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Categoria</FormLabel>
                                    <Select
                                        value={subcategoryFormData.categoryId}
                                        onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, categoryId: e.target.value })}
                                        placeholder="Selecione uma categoria"
                                    >
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.value}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Nome</FormLabel>
                                    <Input
                                        value={subcategoryFormData.value}
                                        onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, value: e.target.value })}
                                        placeholder="Nome da subcategoria"
                                    />
                                </FormControl>
                            </VStack>
                        </ModalBody>

                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={handleSubcategoryClose}>
                                Cancelar
                            </Button>
                            <Button
                                colorScheme="blue"
                                type="submit"
                                isLoading={isLoading}
                            >
                                {editingSubcategory ? 'Atualizar' : 'Criar'}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </VStack>
    )
} 
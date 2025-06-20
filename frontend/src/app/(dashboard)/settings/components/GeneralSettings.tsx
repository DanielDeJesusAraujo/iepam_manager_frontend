'use client'

import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useToast,
    useColorModeValue,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

export default function GeneralSettings() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        company_name: '',
        company_address: '',
        company_phone: '',
        company_email: '',
    })
    const toast = useToast()
    const bgColor = useColorModeValue('white', 'gray.700')
    const borderColor = useColorModeValue('gray.200', 'gray.600')

    useEffect(() => {
        fetchGeneralSettings()
    }, [])

    const fetchGeneralSettings = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/general-settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setFormData(data)
            }
        } catch (error) {
            console.error('Erro ao buscar configurações gerais:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const token = localStorage.getItem('@ti-assistant:token')
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/general-settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                toast({
                    title: 'Configurações atualizadas',
                    description: 'As configurações gerais foram atualizadas com sucesso.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                })
            } else {
                throw new Error('Erro ao atualizar configurações')
            }
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Ocorreu um erro ao atualizar as configurações.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box
            as="form"
            onSubmit={handleSubmit}
            bg={bgColor}
            p={6}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
        >
            <VStack spacing={4} align="stretch">
                <FormControl>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <Input
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder="Digite o nome da empresa"
                    />
                </FormControl>

                <FormControl>
                    <FormLabel>Endereço</FormLabel>
                    <Input
                        value={formData.company_address}
                        onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                        placeholder="Digite o endereço da empresa"
                    />
                </FormControl>

                <FormControl>
                    <FormLabel>Telefone</FormLabel>
                    <Input
                        value={formData.company_phone}
                        onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                        placeholder="Digite o telefone da empresa"
                    />
                </FormControl>

                <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                        type="email"
                        value={formData.company_email}
                        onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                        placeholder="Digite o email da empresa"
                    />
                </FormControl>

                <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={loading}
                    loadingText="Salvando..."
                >
                    Salvar Alterações
                </Button>
            </VStack>
        </Box>
    )
} 
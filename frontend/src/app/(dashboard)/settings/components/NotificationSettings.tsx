'use client'

import {
    VStack,
    FormControl,
    FormLabel,
    Switch,
    Button,
    useToast,
    FormHelperText,
    Divider,
    Heading,
    Text,
} from '@chakra-ui/react'
import { useState } from 'react'

export default function NotificationSettings() {
    const [isLoading, setIsLoading] = useState(false)
    const toast = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Implementar lógica de salvamento aqui
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulação de API

            toast({
                title: 'Configurações salvas',
                description: 'Suas configurações de notificações foram atualizadas.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            })
        } catch (error) {
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar as configurações.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
                <Heading size="sm">Notificações por Email</Heading>
                <Text fontSize="sm" color="gray.600">
                    Configure quais notificações você deseja receber por email
                </Text>

                <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Alertas de Sistema</FormLabel>
                    <Switch defaultChecked />
                    <FormHelperText ml={2}>
                        Receber alertas sobre problemas no sistema
                    </FormHelperText>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Atualizações de Status</FormLabel>
                    <Switch defaultChecked />
                    <FormHelperText ml={2}>
                        Receber atualizações sobre mudanças de status
                    </FormHelperText>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Relatórios Semanais</FormLabel>
                    <Switch />
                    <FormHelperText ml={2}>
                        Receber relatórios semanais de atividades
                    </FormHelperText>
                </FormControl>

                <Divider my={4} />

                <Heading size="sm">Notificações no Sistema</Heading>
                <Text fontSize="sm" color="gray.600">
                    Configure quais notificações você deseja ver no sistema
                </Text>

                <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Notificações de Impressora</FormLabel>
                    <Switch defaultChecked />
                    <FormHelperText ml={2}>
                        Receber alertas sobre problemas com impressoras
                    </FormHelperText>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Notificações de Estoque</FormLabel>
                    <Switch defaultChecked />
                    <FormHelperText ml={2}>
                        Receber alertas sobre estoque baixo
                    </FormHelperText>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Notificações de Manutenção</FormLabel>
                    <Switch defaultChecked />
                    <FormHelperText ml={2}>
                        Receber lembretes de manutenção
                    </FormHelperText>
                </FormControl>

                <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isLoading}
                    loadingText="Salvando..."
                    mt={4}
                >
                    Salvar Configurações
                </Button>
            </VStack>
        </form>
    )
} 
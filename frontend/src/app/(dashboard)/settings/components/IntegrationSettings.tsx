'use client'

import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    Button,
    useToast,
    Switch,
    FormHelperText,
    Divider,
    Heading,
    Text,
    Card,
    CardBody,
    HStack,
    Badge,
    Icon,
} from '@chakra-ui/react'
import { useState } from 'react'
import { FaGithub, FaSlack, FaMicrosoft, FaGoogle } from 'react-icons/fa'

interface Integration {
    id: string
    name: string
    description: string
    icon: any
    isConnected: boolean
    apiKey?: string
}

const integrations: Integration[] = [
    {
        id: 'github',
        name: 'GitHub',
        description: 'Integre com repositórios do GitHub para gerenciar issues e pull requests',
        icon: FaGithub,
        isConnected: false,
    },
    {
        id: 'slack',
        name: 'Slack',
        description: 'Receba notificações no Slack sobre atualizações do sistema',
        icon: FaSlack,
        isConnected: true,
    },
    {
        id: 'microsoft',
        name: 'Microsoft 365',
        description: 'Sincronize com o Microsoft 365 para gerenciar usuários e licenças',
        icon: FaMicrosoft,
        isConnected: false,
    },
    {
        id: 'google',
        name: 'Google Workspace',
        description: 'Integre com o Google Workspace para gerenciar usuários e serviços',
        icon: FaGoogle,
        isConnected: false,
    },
]

export default function IntegrationSettings() {
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
                description: 'Suas configurações de integração foram atualizadas.',
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
                <Heading size="sm">Integrações Disponíveis</Heading>
                <Text fontSize="sm" color="gray.600">
                    Conecte seu sistema com outras ferramentas e serviços
                </Text>

                {integrations.map((integration) => (
                    <Card key={integration.id} variant="outline">
                        <CardBody>
                            <VStack align="stretch" spacing={4}>
                                <HStack justify="space-between">
                                    <HStack>
                                        <Icon as={integration.icon} boxSize={6} />
                                        <VStack align="start" spacing={0}>
                                            <Heading size="sm">{integration.name}</Heading>
                                            <Text fontSize="sm" color="gray.600">
                                                {integration.description}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                    <Badge
                                        colorScheme={integration.isConnected ? 'green' : 'gray'}
                                    >
                                        {integration.isConnected ? 'Conectado' : 'Não Conectado'}
                                    </Badge>
                                </HStack>

                                {integration.isConnected ? (
                                    <Button
                                        variant="outline"
                                        colorScheme="red"
                                        size="sm"
                                        onClick={() => {
                                            // Implementar lógica de desconexão
                                            toast({
                                                title: 'Desconectado',
                                                description: `Integração com ${integration.name} foi desconectada.`,
                                                status: 'success',
                                                duration: 3000,
                                                isClosable: true,
                                            })
                                        }}
                                    >
                                        Desconectar
                                    </Button>
                                ) : (
                                    <Button
                                        colorScheme="blue"
                                        size="sm"
                                        onClick={() => {
                                            // Implementar lógica de conexão
                                            toast({
                                                title: 'Conectado',
                                                description: `Integração com ${integration.name} foi estabelecida.`,
                                                status: 'success',
                                                duration: 3000,
                                                isClosable: true,
                                            })
                                        }}
                                    >
                                        Conectar
                                    </Button>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>
                ))}

                <Divider my={4} />

                <Heading size="sm">API Keys</Heading>
                <Text fontSize="sm" color="gray.600">
                    Gerencie suas chaves de API para integrações personalizadas
                </Text>

                <FormControl>
                    <FormLabel>Chave de API</FormLabel>
                    <Input placeholder="Digite sua chave de API" />
                    <FormHelperText>
                        Use esta chave para integrações personalizadas via API
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
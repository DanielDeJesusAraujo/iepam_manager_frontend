'use client';

import {
    Box,
    Container,
    Heading,
    Text,
    Image,
    Badge,
    Flex,
    Spinner,
    VStack,
    HStack,
    Button,
    useColorModeValue,
    Divider,
    IconButton,
    useBreakpointValue,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    useDisclosure,
} from '@chakra-ui/react';
import { ArrowLeft, ShoppingCart, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { MobileSupplyDetails } from './components/MobileSupplyDetails';
import { DeliveryDetailsModal } from '../components/DeliveryDetailsModal';

interface Supply {
    id: string;
    name: string;
    description: string;
    category: {
        id: string;
        value: string;
        label: string;
    };
    subcategory?: {
        id: string;
        value: string;
        label: string;
    };
    minimum_quantity: number;
    current_quantity: number;
    quantity: number;
    image_url?: string;
}

interface SupplyRequest {
    id: string;
    supply: {
        id: string;
        name: string;
        description: string;
        quantity: number;
        unit: string;
    };
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    quantity: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED';
    notes: string;
    created_at: string;
    requester_confirmation: boolean;
    manager_delivery_confirmation: boolean;
    delivery_deadline: string;
    destination: string;
    is_custom: boolean;
}

export default function SupplyDetails({ params }: { params: { id: string } }) {
    const router = useRouter();
    const toast = useToast();
    const [supply, setSupply] = useState<Supply | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [deliveryDeadline, setDeliveryDeadline] = useState('');
    const [destination, setDestination] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const isMobile = useBreakpointValue({ base: true, md: false });
    const bgColor = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const [request, setRequest] = useState<SupplyRequest | null>(null);
    const [user, setUser] = useState({ role: '' });
    const [userLocales, setUserLocales] = useState<any[]>([]);
    const [localeId, setLocaleId] = useState('');

    const fetchSupply = useCallback(async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`/api/supplies/${params.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao carregar detalhes do suprimento');
            }
            const data = await response.json();
            setSupply(data);
        } catch (error) {
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Não foi possível carregar os detalhes do suprimento',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            router.push('/supply-requests');
        } finally {
            setLoading(false);
        }
    }, [params.id, router, toast]);

    useEffect(() => {
        fetchSupply();
        // Buscar locais da filial do usuário
        const fetchUserLocales = async () => {
            try {
                const token = localStorage.getItem('@ti-assistant:token');
                if (!token) return;
                const response = await fetch('/api/locales/user-location', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserLocales(data);
                }
            } catch (e) {
                // Silenciar erro
            }
        };
        fetchUserLocales();
    }, [fetchSupply]);

    const handleQuantityChange = (value: string) => {
        if (!supply) return;
        const numValue = parseInt(value);
        if (numValue > supply.quantity) {
            setQuantity(supply.quantity);
        } else if (numValue < 1) {
            setQuantity(1);
        } else {
            setQuantity(numValue);
        }
    };

    const addToCart = (supply: Supply, quantity: number) => {
        const cart = JSON.parse(localStorage.getItem('@ti-assistant:cart') || '[]');
        const existingItem = cart.find((item: any) => item.supply.id === supply.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ supply, quantity });
        }

        localStorage.setItem('@ti-assistant:cart', JSON.stringify(cart));

        toast({
            title: 'Item adicionado',
            description: `${supply.name} foi adicionado ao carrinho`,
            status: 'success',
            duration: 2000,
            isClosable: true,
        });
    };

    const handleOrderSubmit = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const requestBody = {
                supply_id: supply?.id,
                quantity,
                delivery_deadline: deliveryDeadline,
                destination,
                locale_id: localeId,
                notes: `Pedido direto de ${supply?.name}`
            };

            console.log('Enviando requisição de pedido:', {
                url: '/api/supply-requests',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: requestBody
            });

            const response = await fetch('/api/supply-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro na requisição:', errorData);
                throw new Error(errorData.message || 'Erro ao realizar pedido');
            }

            toast({
                title: 'Sucesso',
                description: 'Pedido realizado com sucesso!',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            onClose();
            router.push('/supply-requests');
        } catch (error) {
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao realizar pedido',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleRequesterConfirmation = async (confirmation: boolean) => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const response = await fetch(`/api/supply-requests/${params.id}/requester-confirmation`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ confirmation })
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar confirmação');
            }

            toast({
                title: 'Sucesso',
                description: 'Confirmação atualizada com sucesso',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            const updatedResponse = await fetch(`/api/supply-requests/${params.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await updatedResponse.json();
            setRequest(data);
            setUser(data.user);
        } catch (error) {
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao atualizar confirmação',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleManagerDeliveryConfirmation = async (confirmation: boolean) => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            if (request?.requester_confirmation && confirmation) {
                setRequest(prev => prev ? {
                    ...prev,
                    manager_delivery_confirmation: true
                } : null);

                toast({
                    title: 'Sucesso',
                    description: 'Confirmação atualizada com sucesso',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            const endpoint = request?.is_custom
                ? `/api/custom-supply-requests/${params.id}/manager-delivery-confirmation`
                : `/api/supply-requests/${params.id}/manager-delivery-confirmation`;

            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ confirmation })
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar confirmação');
            }

            toast({
                title: 'Sucesso',
                description: 'Confirmação atualizada com sucesso',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            fetchSupply();
        } catch (error) {
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao atualizar confirmação',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    if (isMobile) {
        return (
            <MobileSupplyDetails
                supply={supply}
                loading={loading}
                onAddToCart={addToCart}
            />
        );
    }

    if (loading) {
        return (
            <Box p={4}>
                <Flex justify="center" align="center" minH="200px">
                    <Spinner size="xl" />
                </Flex>
            </Box>
        );
    }

    if (!supply) {
        return null;
    }

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                <HStack>
                    <IconButton
                        aria-label="Voltar"
                        icon={<ArrowLeft />}
                        variant="ghost"
                        onClick={() => router.back()}
                    />
                    <Heading size="xl">Detalhes do Suprimento</Heading>
                </HStack>

                <Flex gap={8}>
                    <Box flex="1">
                        <Image
                            src={supply.image_url || '/placeholder.png'}
                            alt={supply.name}
                            borderRadius="xl"
                            height="500px"
                            objectFit="cover"
                            width="100%"
                        />
                    </Box>

                    <VStack flex="1" align="stretch" spacing={8}>
                        <Box>
                            <Heading size="2xl" mb={4}>{supply.name}</Heading>
                            <Text color="gray.500" fontSize="xl">{supply.description}</Text>
                        </Box>

                        <HStack spacing={3}>
                            <Badge colorScheme="blue" fontSize="lg" px={4} py={2}>
                                {supply.category.label}
                            </Badge>
                            {supply.subcategory && (
                                <Badge colorScheme="green" fontSize="lg" px={4} py={2}>
                                    {supply.subcategory.label}
                                </Badge>
                            )}
                        </HStack>

                        <Divider />

                        <VStack align="stretch" spacing={6}>
                            <HStack justify="space-between" align="center">
                                <Text fontSize="xl" fontWeight="medium">Quantidade Disponível:</Text>
                                <Text fontSize="xl">{supply.quantity}</Text>
                            </HStack>

                            <Box>
                                <Text fontSize="xl" fontWeight="medium" mb={3}>Quantidade Desejada:</Text>
                                <NumberInput
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    min={1}
                                    max={supply.quantity}
                                    size="lg"
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </Box>
                        </VStack>

                        <HStack spacing={4}>
                            <Button
                                colorScheme="blue"
                                leftIcon={<ShoppingCart size={24} />}
                                onClick={() => addToCart(supply, quantity)}
                                isDisabled={supply.quantity <= 0}
                                size="lg"
                                height="70px"
                                fontSize="xl"
                                flex="1"
                            >
                                Adicionar ao Carrinho
                            </Button>
                            <Button
                                colorScheme="green"
                                onClick={onOpen}
                                isDisabled={supply.quantity <= 0}
                                size="lg"
                                height="70px"
                                fontSize="xl"
                                flex="1"
                            >
                                Realizar Pedido
                            </Button>
                        </HStack>
                    </VStack>
                </Flex>

                <DeliveryDetailsModal
                    isOpen={isOpen}
                    onClose={onClose}
                    deliveryDeadline={deliveryDeadline}
                    setDeliveryDeadline={setDeliveryDeadline}
                    destination={destination}
                    setDestination={setDestination}
                    userLocales={userLocales}
                    onSubmit={handleOrderSubmit}
                    localeId={localeId}
                    setLocaleId={setLocaleId}
                />
            </VStack>
        </Container>
    );
} 
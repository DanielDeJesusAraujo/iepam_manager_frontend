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
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@chakra-ui/react';
import { useState } from 'react';

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

interface MobileSupplyDetailsProps {
    supply: Supply | null;
    loading: boolean;
    onAddToCart: (supply: Supply, quantity: number) => void;
}

export function MobileSupplyDetails({ supply, loading, onAddToCart }: MobileSupplyDetailsProps) {
    const router = useRouter();
    const toast = useToast();
    const [quantity, setQuantity] = useState(1);
    const [deliveryDeadline, setDeliveryDeadline] = useState('');
    const [destination, setDestination] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const bgColor = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');

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

    const handleQuantityChange = (value: string) => {
        const numValue = parseInt(value);
        if (numValue > supply.quantity) {
            setQuantity(supply.quantity);
        } else if (numValue < 1) {
            setQuantity(1);
        } else {
            setQuantity(numValue);
        }
    };

    const handleOrderSubmit = async () => {
        try {
            if (!supply) {
                throw new Error('Suprimento não encontrado');
            }

            const token = localStorage.getItem('@ti-assistant:token');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            const requestBody = {
                supply_id: supply.id,
                quantity,
                delivery_deadline: new Date(deliveryDeadline).toISOString(),
                destination,
                notes: `Pedido direto de ${supply.name}`
            };

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
                throw new Error(errorData.error || 'Erro ao realizar pedido');
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

    const handleCloseModal = () => {
        onClose();
    };

    return (
        <Container maxW="container.sm" py={4} px={4}>
            <VStack spacing={6} align="stretch" marginTop="4vh">
                <HStack>
                    <IconButton
                        aria-label="Voltar"
                        icon={<ArrowLeft />}
                        variant="solid"
                        onClick={() => router.back()}
                    />
                </HStack>

                <VStack spacing={6} align="stretch">
                    <Box>
                        <Image
                            src={supply.image_url || '/placeholder.png'}
                            alt={supply.name}
                            borderRadius="lg"
                            height="250px"
                            objectFit="cover"
                            width="100%"
                        />
                    </Box>

                    <VStack align="stretch" spacing={4}>
                        <Box>
                            <Heading size="lg" mb={2}>{supply.name}</Heading>
                            <Text color="gray.500" fontSize="md">{supply.description}</Text>
                        </Box>

                        <HStack spacing={2}>
                            <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>
                                {supply.category.label}
                            </Badge>
                            {supply.subcategory && (
                                <Badge colorScheme="green" fontSize="sm" px={2} py={1}>
                                    {supply.subcategory.label}
                                </Badge>
                            )}
                        </HStack>

                        <Divider />

                        <VStack align="stretch" spacing={4}>
                            <HStack justify="space-between" align="center">
                                <Text fontSize="md" fontWeight="medium">Quantidade Disponível:</Text>
                                <Text fontSize="md">{supply.quantity}</Text>
                            </HStack>

                            <Box>
                                <Text fontSize="md" fontWeight="medium" mb={2}>Quantidade Desejada:</Text>
                                <NumberInput
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    min={1}
                                    max={supply.quantity}
                                    size="md"
                                >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                </NumberInput>
                            </Box>
                        </VStack>

                        <HStack spacing={3}>
                            <Button
                                colorScheme="blue"
                                leftIcon={<ShoppingCart size={18} />}
                                onClick={() => onAddToCart(supply, quantity)}
                                isDisabled={supply.quantity <= 0}
                                size="xs"
                                height="50px"
                                fontSize="xs"
                                flex="1"
                                p={1}
                            >
                                Adicionar ao Carrinho
                            </Button>
                            <Button
                                colorScheme="green"
                                onClick={onOpen}
                                isDisabled={supply.quantity <= 0}
                                size="xs"
                                height="50px"
                                fontSize="xs"
                                flex="1"
                                p={1}
                            >
                                Realizar Pedido
                            </Button>
                        </HStack>
                    </VStack>
                </VStack>

                <Modal isOpen={isOpen} onClose={handleCloseModal}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Detalhes da Entrega</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Data Limite para Entrega</FormLabel>
                                    <Input
                                        type="date"
                                        value={deliveryDeadline}
                                        onChange={(e) => setDeliveryDeadline(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Destino</FormLabel>
                                    <Input
                                        placeholder="Ex: Departamento de TI - Sala 101"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                    />
                                </FormControl>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="ghost" mr={3} onClick={handleCloseModal}>
                                Cancelar
                            </Button>
                            <Button
                                colorScheme="green"
                                onClick={handleOrderSubmit}
                                isDisabled={!deliveryDeadline || !destination}
                            >
                                Confirmar Pedido
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </VStack>
        </Container>
    );
} 
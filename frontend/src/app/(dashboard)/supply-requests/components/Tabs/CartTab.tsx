import React from 'react';
import {
  Card,
  CardBody,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorMode,
  useMediaQuery,
} from '@chakra-ui/react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Supply } from '../../types';

interface CartItem {
  id: string;
  quantity: number;
  supply: Supply;
}

interface CartTabProps {
  cart: CartItem[];
  onRemoveFromCart: (supplyId: string) => void;
  onUpdateQuantity: (supplyId: string, quantity: number) => void;
  onOpenModal: () => void;
  onContinueShopping: () => void;
}

export function CartTab({ cart, onRemoveFromCart, onUpdateQuantity, onOpenModal, onContinueShopping }: CartTabProps) {
  const { colorMode } = useColorMode();
  const [isMobile] = useMediaQuery('(max-width: 768px)');

  return (
    <Card bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'} backdropFilter="blur(12px)" borderWidth="1px" borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}>
      <CardBody>
        <VStack spacing={4}>
          {cart.length === 0 ? (
            <VStack spacing={4}>
              <ShoppingCart size={48} />
              <Text fontSize="lg" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>Seu carrinho está vazio</Text>
              <Button 
                colorScheme="blue" 
                onClick={onContinueShopping} 
                bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined} 
                _hover={{ bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined, transform: 'translateY(-1px)' }} 
                transition="all 0.3s ease"
              >
                Continuar Comprando
              </Button>
            </VStack>
          ) : (
            <>
              {cart.map((item) => (
                item.supply ? (
                  <Card key={item.id} bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'} backdropFilter="blur(12px)" borderWidth="1px" borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} borderRadius={{ base: 0, md: 'md' }}>
                    <CardBody p={{ base: 3, md: 4 }}>
                      <VStack align="stretch" spacing={{ base: 3, md: 4 }}>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Heading size={{ base: 'sm', md: 'md' }} color={colorMode === 'dark' ? 'white' : 'gray.800'} noOfLines={1}>{item.supply.name}</Heading>
                            <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.500'} noOfLines={2} fontSize={{ base: 'xs', md: 'sm' }}>{item.supply.description}</Text>
                          </VStack>
                          <IconButton 
                            aria-label="Remover item" 
                            icon={<Trash2 size={isMobile ? 16 : 20} />} 
                            colorScheme="red" 
                            variant="ghost" 
                            size={{ base: 'sm', md: 'md' }} 
                            onClick={() => onRemoveFromCart(item.id)} 
                          />
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize={{ base: 'xs', md: 'sm' }} color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>Qtd: {item.quantity}</Text>
                          <NumberInput 
                            value={item.quantity} 
                            min={1} 
                            max={item.supply.quantity} 
                            onChange={(_, value) => onUpdateQuantity(item.id, value)} 
                            size={{ base: 'xs', md: 'sm' }} 
                            maxW={{ base: '80px', md: '120px' }}
                          >
                            <NumberInputField 
                              bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'} 
                              backdropFilter="blur(12px)" 
                              borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} 
                              _hover={{ borderColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }} 
                              _focus={{ borderColor: colorMode === 'dark' ? 'blue.400' : 'blue.500', boxShadow: 'none' }} 
                            />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ) : null
              ))}
              <Button 
                colorScheme="green" 
                size={{ base: 'md', md: 'lg' }} 
                onClick={onOpenModal} 
                leftIcon={<ShoppingCart size={isMobile ? 20 : 24} />} 
                bg={colorMode === 'dark' ? 'rgba(72, 187, 120, 0.8)' : undefined} 
                _hover={{ bg: colorMode === 'dark' ? 'rgba(72, 187, 120, 0.9)' : undefined, transform: 'translateY(-1px)' }} 
                transition="all 0.3s ease"
              >
                {isMobile ? 'Finalizar' : 'Enviar Pedido'}
              </Button>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
} 
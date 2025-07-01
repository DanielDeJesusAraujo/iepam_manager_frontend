import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useColorMode,
} from '@chakra-ui/react';

interface DeliveryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryDeadline: string;
  setDeliveryDeadline: (value: string) => void;
  destination: string;
  setDestination: (value: string) => void;
  userLocales: { id: string; name: string }[];
  onSubmit: () => void;
  isSubmitting?: boolean;
  localeId: string;
  setLocaleId: (value: string) => void;
}

export const DeliveryDetailsModal: React.FC<DeliveryDetailsModalProps> = ({
  isOpen,
  onClose,
  deliveryDeadline,
  setDeliveryDeadline,
  destination,
  setDestination,
  userLocales,
  onSubmit,
  isSubmitting = false,
  localeId,
  setLocaleId,
}) => {
  const { colorMode } = useColorMode();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.95)' : 'gray.50'}
        backdropFilter="blur(12px)"
        borderWidth="1px"
        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
      >
        <ModalHeader color={colorMode === 'dark' ? 'white' : 'gray.800'}>Detalhes da Entrega</ModalHeader>
        <ModalCloseButton color={colorMode === 'dark' ? 'white' : 'gray.800'} />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Data Limite para Entrega</FormLabel>
              <Input
                type="date"
                value={deliveryDeadline}
                onChange={(e) => setDeliveryDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'}
                backdropFilter="blur(12px)"
                borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                _hover={{
                  borderColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                }}
                _focus={{
                  borderColor: colorMode === 'dark' ? 'blue.400' : 'blue.500',
                  boxShadow: 'none',
                }}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Destino</FormLabel>
              <Select
                placeholder="Selecione o local de destino"
                value={localeId}
                onChange={(e) => {
                  setLocaleId(e.target.value);
                  const selected = userLocales.find(l => l.id === e.target.value);
                  setDestination(selected ? selected.name : '');
                }}
                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'}
                backdropFilter="blur(12px)"
                borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                _hover={{
                  borderColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                }}
                _focus={{
                  borderColor: colorMode === 'dark' ? 'blue.400' : 'blue.500',
                  boxShadow: 'none',
                }}
              >
                <option value="">Selecione</option>
                {userLocales.map((locale) => (
                  <option key={locale.id} value={locale.id}>{locale.name}</option>
                ))}
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="ghost" 
            mr={3} 
            onClick={onClose}
            color={colorMode === 'dark' ? 'white' : 'gray.800'}
          >
            Cancelar
          </Button>
          <Button
            colorScheme="green"
            onClick={onSubmit}
            isDisabled={!deliveryDeadline || !localeId || isSubmitting}
            isLoading={isSubmitting}
            bg={colorMode === 'dark' ? 'rgba(72, 187, 120, 0.8)' : undefined}
            _hover={{
              bg: colorMode === 'dark' ? 'rgba(72, 187, 120, 0.9)' : undefined,
              transform: 'translateY(-1px)',
            }}
            transition="all 0.3s ease"
          >
            Confirmar Pedido
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 
import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useColorMode,
} from '@chakra-ui/react';

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  // Adicione outros campos necessários
}

interface InventoryAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSubmit: (data: { return_date: string; destination: string; notes: string }) => void;
  isLoading?: boolean;
}

export const InventoryAllocationModal: React.FC<InventoryAllocationModalProps> = ({
  isOpen,
  onClose,
  item,
  onSubmit,
  isLoading = false,
}) => {
  const [returnDate, setReturnDate] = useState('');
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');
  const { colorMode } = useColorMode();

  const handleSubmit = () => {
    onSubmit({
      return_date: returnDate,
      destination,
      notes,
    });
  };

  React.useEffect(() => {
    if (isOpen) {
      setReturnDate('');
      setDestination('');
      setNotes('');
    }
  }, [isOpen, item]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.95)' : 'gray.50'}
        backdropFilter="blur(12px)"
        borderWidth="1px"
        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
      >
        <ModalHeader color={colorMode === 'dark' ? 'white' : 'gray.800'}>
          Alocar Item{item ? `: ${item.name}` : ''}
        </ModalHeader>
        <ModalCloseButton color={colorMode === 'dark' ? 'white' : 'gray.800'} />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Data de Devolução</FormLabel>
              <Input
                type="date"
                value={returnDate}
                onChange={e => setReturnDate(e.target.value)}
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
              <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Local de Uso</FormLabel>
              <Input
                placeholder="Ex: Departamento de TI - Sala 101"
                value={destination}
                onChange={e => setDestination(e.target.value)}
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
            <FormControl>
              <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Observações</FormLabel>
              <Textarea
                placeholder="Adicione observações relevantes..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
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
            colorScheme="purple"
            onClick={handleSubmit}
            isDisabled={!returnDate || !destination}
            isLoading={isLoading}
            bg={colorMode === 'dark' ? 'rgba(159, 122, 234, 0.8)' : undefined}
            _hover={{
              bg: colorMode === 'dark' ? 'rgba(159, 122, 234, 0.9)' : undefined,
              transform: 'translateY(-1px)',
            }}
            transition="all 0.3s ease"
          >
            Confirmar Alocação
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 
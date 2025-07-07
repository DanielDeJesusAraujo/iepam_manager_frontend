import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  useToast
} from '@chakra-ui/react';
import { useState } from 'react';

interface ReturnItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => Promise<void>;
  title?: string;
  itemName?: string;
  isLoading?: boolean;
}

export function ReturnItemModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Devolver Item",
  itemName,
  isLoading = false
}: ReturnItemModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(notes);
      setNotes('');
      onClose();
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao processar devolução',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {itemName && (
            <FormControl mb={4}>
              <FormLabel>Item</FormLabel>
              <Textarea value={itemName} isReadOnly variant="filled" />
            </FormControl>
          )}
          <FormControl>
            <FormLabel>Observações (opcional)</FormLabel>
            <Textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Descreva o motivo ou detalhes da devolução..." 
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button 
            colorScheme="blue" 
            mr={3} 
            onClick={handleConfirm} 
            isLoading={isSubmitting || isLoading}
          >
            Confirmar Devolução
          </Button>
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 
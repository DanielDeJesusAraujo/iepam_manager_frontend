import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    VStack,
    useColorMode,
} from '@chakra-ui/react';

interface AllocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    item: any;
}

export function AllocationModal({ isOpen, onClose, onSubmit, item }: AllocationModalProps) {
    const { colorMode } = useColorMode();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            destination: formData.get('destination'),
            notes: formData.get('notes'),
            return_date: formData.get('return_date'),
        };
        onSubmit(data);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay />
            <ModalContent
                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)'}
                backdropFilter="blur(12px)"
                borderWidth="1px"
                borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
            >
                <form onSubmit={handleSubmit}>
                    <ModalHeader color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                        Alocar Item
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Destino</FormLabel>
                                <Input
                                    name="destination"
                                    placeholder="Digite o destino do item"
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Data de Retorno</FormLabel>
                                <Input
                                    name="return_date"
                                    type="date"
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Observações</FormLabel>
                                <Textarea
                                    name="notes"
                                    placeholder="Adicione observações sobre a alocação"
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="ghost"
                            mr={3}
                            onClick={onClose}
                            bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                            _hover={{
                                bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            colorScheme="green"
                            bg={colorMode === 'dark' ? 'rgba(72, 187, 120, 0.8)' : undefined}
                            _hover={{
                                bg: colorMode === 'dark' ? 'rgba(72, 187, 120, 0.9)' : undefined,
                            }}
                        >
                            Confirmar Alocação
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
} 
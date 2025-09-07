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
    useToast,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Select,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

interface CustomSupplyRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CustomSupplyRequestData) => Promise<void>;
    userLocales: { id: string; name: string }[];
    localeId: string;
    setLocaleId: (value: string) => void;
}

export interface CustomSupplyRequestData {
    item_name: string;
    description?: string;
    quantity: number;
    unit_id: string;
    delivery_deadline: string;
    destination: string;
    locale_id?: string;
    notes?: string;
}

interface Unit {
    id: string;
    name: string;
}

export function CustomSupplyRequestModal({ isOpen, onClose, onSubmit, userLocales, localeId, setLocaleId }: CustomSupplyRequestModalProps) {
    const [itemName, setItemName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [unitId, setUnitId] = useState('');
    const [deliveryDeadline, setDeliveryDeadline] = useState('');
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            const response = await fetch('/api/unit-of-measures', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUnits(data);
            }
        } catch (error) {
            console.error('Erro ao buscar unidades:', error);
        }
    };

    const handleSubmit = async () => {
        if (!itemName || !quantity || !unitId || !deliveryDeadline || !localeId) {
            toast({
                title: 'Erro',
                description: 'Por favor, preencha todos os campos obrigatórios',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        const selectedLocale = userLocales.find(l => l.id === localeId);
        setLoading(true);
        try {
            // Preparar os dados para envio
            const requestData = {
                item_name: itemName,
                description,
                quantity,
                unit_id: unitId,
                delivery_deadline: deliveryDeadline,
                destination: selectedLocale ? selectedLocale.name : '',
                locale_id: localeId,
                notes
            };

            // Passar os dados para a função onSubmit (que fará a requisição)
            await onSubmit(requestData);

            // Limpar o formulário
            setItemName('');
            setDescription('');
            setQuantity(1);
            setUnitId('');
            setDeliveryDeadline('');
            setLocaleId('');
            onClose();
        } catch (error) {
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Erro ao criar requisição customizada',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Requisição Customizada</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Nome do Item</FormLabel>
                            <Input
                                placeholder="Ex: Monitor LED 24 polegadas"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Descrição</FormLabel>
                            <Textarea
                                placeholder="Descreva o item em detalhes..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Quantidade</FormLabel>
                            <NumberInput
                                value={quantity}
                                onChange={(_, value) => setQuantity(value)}
                                min={1}
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Unidade de Medida</FormLabel>
                            <Select
                                placeholder="Selecione uma unidade"
                                value={unitId}
                                onChange={(e) => setUnitId(e.target.value)}
                            >
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

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
                            <Select
                                placeholder="Selecione o local de destino"
                                value={localeId}
                                onChange={(e) => setLocaleId(e.target.value)}
                            >
                                <option value="">Selecione</option>
                                {userLocales.map((locale) => (
                                    <option key={locale.id} value={locale.id}>{locale.name}</option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Observações</FormLabel>
                            <Textarea
                                placeholder="Adicione observações relevantes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleSubmit}
                        isLoading={loading}
                    >
                        Enviar Requisição
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
} 
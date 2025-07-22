'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    useToast,
    HStack,
    Text,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Select,
    useBreakpointValue,
    Container,
    VStack,
    Flex,
    Heading,
    Badge,
    useColorMode,
    SimpleGrid,
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Divider,
} from '@chakra-ui/react';
import { Plus, MoreVertical, Calendar } from 'lucide-react';
import { MobileEvents } from './components/MobileEvents';
import { useRouter } from 'next/navigation';

interface Event {
    id: string;
    title: string;
    description: string;
    type: EventType;
    start_date: Date;
    start_time: string;
    end_date: Date;
    location: string;
    room?: string;
    capacity?: number;
    is_public?: boolean;
    max_participants?: number;
    budget?: number;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
    setup_requirements?: string;
    notes?: string;
    status: EventStatus;
    current_participants: number;
    user: {
        id: string;
        name: string;
    };
    participants: {
        id: string;
        user: {
            id: string;
            name: string;
        };
        role: string;
        status: string;
    }[];
    resources: {
        id: string;
        name: string;
        quantity: number;
        description?: string;
    }[];
}

type EventType = 'FESTA' | 'AULA' | 'FORMATURA' | 'REUNIAO' | 'FEIRA_TECNOLOGICA' | 'ALUGUEL_SALA' | 'OUTRO';
type EventStatus = 'AGENDADO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';

interface Printer {
    id: string;
    name: string;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const isMobile = useBreakpointValue({ base: true, md: false });
    const { colorMode } = useColorMode();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'OUTRO' as EventType,
        start_date: '',
        start_time: '00:00',
        end_date: '',
        location: '',
        room: '',
        capacity: 0,
        is_public: false,
        max_participants: 0,
        budget: 0,
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        setup_requirements: '',
        notes: '',
        status: 'AGENDADO' as EventStatus,
    });

    useEffect(() => {
        fetchEvents();
        fetchFormData();
    }, []);

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            const response = await fetch('/api/events', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar eventos');
            }

            const data = await response.json();
            setEvents(data || []);
        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar os eventos',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchFormData = async () => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar dados do formulário:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar os dados do formulário',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleSubmit = async (data: any) => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            const url = selectedEvent
                ? `/api/events/${selectedEvent.id}`
                : '/api/events';

            const response = await fetch(url, {
                method: selectedEvent ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar evento');
            }

            toast({
                title: 'Sucesso',
                description: `Evento ${selectedEvent ? 'atualizado' : 'adicionado'} com sucesso`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            onClose();
            fetchEvents();
        } catch (error) {
            console.error('Erro ao salvar evento:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar o evento',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este evento?')) return;
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            const response = await fetch(`/api/events/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Erro ao excluir evento');
            }

            toast({
                title: 'Sucesso',
                description: 'Evento excluído com sucesso',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            fetchEvents();
        } catch (error) {
            console.error('Erro ao excluir evento:', error);
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Não foi possível excluir o evento',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleStatusChange = async (eventId: string, newStatus: EventStatus) => {
        try {
            const token = localStorage.getItem('@ti-assistant:token');
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Erro ao atualizar status do evento');
            }

            toast({
                title: 'Sucesso',
                description: 'Status do evento atualizado com sucesso',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            fetchEvents();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Não foi possível atualizar o status do evento',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    if (loading) {
        return <Box p={8}>Carregando...</Box>;
    }

    if (isMobile) {
        return (
            <MobileEvents
                events={events}
                onDelete={handleDelete}
                onSubmit={handleSubmit}
            />
        );
    }

    const handleNewEvent = () => {
        setSelectedEvent(null);
        setFormData({
            title: '',
            description: '',
            type: 'OUTRO' as EventType,
            start_date: '',
            start_time: '00:00',
            end_date: '',
            location: '',
            room: '',
            capacity: 0,
            is_public: false,
            max_participants: 0,
            budget: 0,
            contact_name: '',
            contact_phone: '',
            contact_email: '',
            setup_requirements: '',
            notes: '',
            status: 'AGENDADO' as EventStatus,
        });
        onOpen();
    };

    const getStatusColor = (status: EventStatus) => {
        switch (status) {
            case 'AGENDADO':
                return 'yellow';
            case 'EM_ANDAMENTO':
                return 'blue';
            case 'CONCLUIDO':
                return 'green';
            case 'CANCELADO':
                return 'red';
            default:
                return 'gray';
        }
    };

    const getStatusLabel = (status: EventStatus) => {
        switch (status) {
            case 'AGENDADO':
                return 'Agendado';
            case 'EM_ANDAMENTO':
                return 'Em Andamento';
            case 'CONCLUIDO':
                return 'Concluído';
            case 'CANCELADO':
                return 'Cancelado';
            default:
                return status;
        }
    };

    const columns = [
        { id: 'AGENDADO', title: 'Agendado' },
        { id: 'EM_ANDAMENTO', title: 'Em Andamento' },
        { id: 'CONCLUIDO', title: 'Concluído' },
        { id: 'CANCELADO', title: 'Cancelado' },
    ];

    return (
        <Box
            w="full"
            h="full"
            py={isMobile ? 0 : 4}
            px={isMobile ? 0 : 8}
            marginTop={isMobile ? '4vh' : 0}
        >
            <VStack
                spacing={4}
                align="stretch"
                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                backdropFilter="blur(12px)"
                p={isMobile ? 3 : 6}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                h="full"
            >
                <Flex justify="space-between" align="center" mb={6}>
                    <Heading size="lg" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                        Eventos
                    </Heading>
                    <Button
                        leftIcon={<Plus />}
                        colorScheme="blue"
                        onClick={handleNewEvent}
                        bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
                        _hover={{
                            bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                            transform: 'translateY(-1px)',
                        }}
                        transition="all 0.3s ease"
                    >
                        Novo Evento
                    </Button>
                </Flex>

                <SimpleGrid columns={3} spacing={6} flex="1" overflowY="auto">
                    {columns.map((column) => (
                        <Box
                            key={column.id}
                            bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                            p={4}
                            borderRadius="lg"
                            boxShadow="sm"
                            borderWidth="1px"
                            borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                            h="full"
                            overflowY="auto"
                        >
                            <Heading size="md" mb={4} color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                                {column.title}
                            </Heading>
                            <VStack spacing={4} align="stretch">
                                {events
                                    .filter((event) => event.status === column.id)
                                    .map((event) => (
                                        <Card
                                            key={event.id}
                                            bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.7)' : 'rgba(255, 255, 255, 0.7)'}
                                            borderWidth="1px"
                                            borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                            _hover={{
                                                transform: 'translateY(-2px)',
                                                transition: 'all 0.2s ease-in-out',
                                                cursor: isMobile ? 'pointer' : 'default',
                                            }}
                                            onClick={() => isMobile && router.push(`/events/${event.id}`)}
                                        >
                                            <CardHeader>
                                                <Flex justify="space-between" align="center">
                                                    <Heading size="sm">{event.title}</Heading>
                                                    <Menu>
                                                        <MenuButton
                                                            as={IconButton}
                                                            icon={<MoreVertical />}
                                                            variant="ghost"
                                                            size="sm"
                                                        />
                                                        <MenuList>
                                                            <MenuItem
                                                                onClick={() => {
                                                                    router.push(`/events/${event.id}`);
                                                                }}
                                                            >
                                                                Detalhes
                                                            </MenuItem>
                                                            <MenuItem
                                                                onClick={() => {
                                                                    setSelectedEvent(event);
                                                                    setFormData({
                                                                        title: event.title,
                                                                        description: event.description,
                                                                        type: event.type,
                                                                        start_date: new Date(event.start_date).toISOString().split('T')[0],
                                                                        start_time: new Date(event.start_date).toISOString().split('T')[1],
                                                                        end_date: new Date(event.end_date).toISOString().split('T')[0],
                                                                        location: event.location,
                                                                        room: event.room || '',
                                                                        capacity: event.capacity || 0,
                                                                        is_public: event.is_public || false,
                                                                        max_participants: event.max_participants || 0,
                                                                        budget: event.budget || 0,
                                                                        contact_name: event.contact_name || '',
                                                                        contact_phone: event.contact_phone || '',
                                                                        contact_email: event.contact_email || '',
                                                                        setup_requirements: event.setup_requirements || '',
                                                                        notes: event.notes || '',
                                                                        status: event.status,
                                                                    });
                                                                    onOpen();
                                                                }}
                                                            >
                                                                Editar
                                                            </MenuItem>
                                                            <MenuItem
                                                                onClick={() => handleDelete(event.id)}
                                                                color="red.500"
                                                            >
                                                                Excluir
                                                            </MenuItem>
                                                        </MenuList>
                                                    </Menu>
                                                </Flex>
                                            </CardHeader>
                                            <CardBody>
                                                <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                                                    {event.description}
                                                </Text>
                                                <VStack align="start" spacing={2} mt={4}>
                                                    <HStack>
                                                        <Calendar size={16} />
                                                        <Text fontSize="sm">
                                                            {new Date(event.start_date).toLocaleDateString()} às {event.start_time} - {new Date(event.end_date).toLocaleDateString()}
                                                        </Text>
                                                    </HStack>
                                                    <HStack>
                                                        <Text fontSize="sm" fontWeight="bold">Local:</Text>
                                                        <Text fontSize="sm">{event.location}</Text>
                                                        {event.room && (
                                                            <>
                                                                <Text fontSize="sm" fontWeight="bold">Sala:</Text>
                                                                <Text fontSize="sm">{event.room}</Text>
                                                            </>
                                                        )}
                                                    </HStack>
                                                    <HStack>
                                                        <Text fontSize="sm" fontWeight="bold">Participantes:</Text>
                                                        <Text fontSize="sm">{event.current_participants}/{event.max_participants || '∞'}</Text>
                                                    </HStack>
                                                    {event.contact_name && (
                                                        <HStack>
                                                            <Text fontSize="sm" fontWeight="bold">Contato:</Text>
                                                            <Text fontSize="sm">{event.contact_name}</Text>
                                                            {event.contact_phone && (
                                                                <Text fontSize="sm">({event.contact_phone})</Text>
                                                            )}
                                                        </HStack>
                                                    )}
                                                    {event.resources && event.resources.length > 0 && (
                                                        <Box>
                                                            <Text fontSize="sm" fontWeight="bold">Recursos:</Text>
                                                            <VStack align="start" spacing={1}>
                                                                {event.resources.map((resource) => (
                                                                    <Text key={resource.id} fontSize="sm">
                                                                        • {resource.name} ({resource.quantity})
                                                                    </Text>
                                                                ))}
                                                            </VStack>
                                                        </Box>
                                                    )}
                                                </VStack>
                                            </CardBody>
                                            <Divider />
                                            <CardFooter>
                                                <Select
                                                    value={event.status}
                                                    onChange={(e) => handleStatusChange(event.id, e.target.value as EventStatus)}
                                                    size="sm"
                                                    variant="filled"
                                                >
                                                    <option value="AGENDADO">Agendado</option>
                                                    <option value="EM_ANDAMENTO">Em Andamento</option>
                                                    <option value="CONCLUIDO">Concluído</option>
                                                    <option value="CANCELADO">Cancelado</option>
                                                </Select>
                                            </CardFooter>
                                        </Card>
                                    ))}
                            </VStack>
                        </Box>
                    ))}
                </SimpleGrid>
            </VStack>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay backdropFilter="blur(10px)" />
                <ModalContent
                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)'}
                    backdropFilter="blur(12px)"
                    border="1px solid"
                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                >
                    <ModalHeader color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                        {selectedEvent ? 'Editar Evento' : 'Novo Evento'}
                    </ModalHeader>
                    <ModalCloseButton color={colorMode === 'dark' ? 'white' : 'gray.800'} />
                    <ModalBody pb={6}>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit(formData);
                        }}>
                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Título</FormLabel>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Descrição</FormLabel>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Data de Início</FormLabel>
                                <Input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    required
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Hora de Início</FormLabel>
                                <Input
                                    type="time"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    required
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Data de Término</FormLabel>
                                <Input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    required
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Local</FormLabel>
                                <Input
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Sala</FormLabel>
                                <Input
                                    value={formData.room}
                                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Capacidade</FormLabel>
                                <Input
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Evento Público</FormLabel>
                                <Select
                                    value={formData.is_public ? 'true' : 'false'}
                                    onChange={(e) => setFormData({ ...formData, is_public: e.target.value === 'true' })}
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                >
                                    <option value="true">Sim</option>
                                    <option value="false">Não</option>
                                </Select>
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Máximo de Participantes</FormLabel>
                                <Input
                                    type="number"
                                    value={formData.max_participants}
                                    onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Orçamento</FormLabel>
                                <Input
                                    type="number"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Nome do Contato</FormLabel>
                                <Input
                                    value={formData.contact_name}
                                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Telefone do Contato</FormLabel>
                                <Input
                                    value={formData.contact_phone}
                                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Email do Contato</FormLabel>
                                <Input
                                    type="email"
                                    value={formData.contact_email}
                                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Requisitos de Configuração</FormLabel>
                                <Textarea
                                    value={formData.setup_requirements}
                                    onChange={(e) => setFormData({ ...formData, setup_requirements: e.target.value })}
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Observações</FormLabel>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                />
                            </FormControl>

                            <FormControl mb={4}>
                                <FormLabel color={colorMode === 'dark' ? 'white' : 'gray.800'}>Tipo</FormLabel>
                                <Select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                                    required
                                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                                >
                                    <option value="FESTA">Festa</option>
                                    <option value="AULA">Aula</option>
                                    <option value="FORMATURA">Formatura</option>
                                    <option value="REUNIAO">Reunião</option>
                                    <option value="FEIRA_TECNOLOGICA">Feira Tecnológica</option>
                                    <option value="ALUGUEL_SALA">Aluguel de Sala</option>
                                    <option value="OUTRO">Outro</option>
                                </Select>
                            </FormControl>

                            <Button
                                type="submit"
                                colorScheme="blue"
                                mr={3}
                                bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
                                _hover={{
                                    bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                                    transform: 'translateY(-1px)',
                                }}
                                transition="all 0.3s ease"
                            >
                                Salvar
                            </Button>
                            <Button
                                onClick={onClose}
                                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.8)' : undefined}
                                _hover={{
                                    bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.9)' : undefined,
                                    transform: 'translateY(-1px)',
                                }}
                                transition="all 0.3s ease"
                            >
                                Cancelar
                            </Button>
                        </form>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
} 
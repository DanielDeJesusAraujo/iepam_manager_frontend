'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Button,
  Badge,
  Input,
  Select,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  useColorModeValue,
  Spinner,
  Center,
  Flex,
  IconButton,
  useBreakpointValue,
  Stack,
} from '@chakra-ui/react';
import { Calendar, Clock, Settings, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface MaintenanceSchedule {
  id: string;
  inventory: {
    id: string;
    name: string;
    serial_number: string;
  };
  technician: {
    id: string;
    name: string;
  };
  type: string;
  interval_days: number;
  notes?: string;
  active: boolean;
  created_at: string;
  tasks: Array<{
    id: string;
    status: string;
    due_date: string;
  }>;
  nextMaintenanceDate: string;
  nextPendingTask?: {
    id: string;
    status: string;
    due_date: string;
  };
}

export default function MaintenanceSchedulesPage() {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const isMobile = useBreakpointValue({ base: true, md: false });

  const router = useRouter();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) {
        router.push('/');
        return;
      }
      const response = await fetch('/api/maintenance-schedules', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.inventory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.inventory.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.technician.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !typeFilter || schedule.type === typeFilter;
    const matchesStatus = !statusFilter ||
      (statusFilter === 'active' && schedule.active) ||
      (statusFilter === 'inactive' && !schedule.active);

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      MAINTENANCE: 'Manutenção',
      INSTALLATION: 'Instalação',
      CALIBRATION: 'Calibração',
      CLEANING: 'Limpeza',
      CONFIGURATION: 'Configuração',
      INSPECTION: 'Vistoria',
      OTHER: 'Outro'
    };
    return types[type] || type;
  };

  const getNextTaskDate = (schedule: MaintenanceSchedule) => {
    // Se há uma tarefa pendente, usar ela
    if (schedule.nextPendingTask) {
      return schedule.nextPendingTask.due_date;
    }

    // Caso contrário, usar a data calculada pelo backend
    return schedule.nextMaintenanceDate;
  };

  const getNextMaintenanceStatus = (schedule: MaintenanceSchedule) => {
    const nextDate = getNextTaskDate(schedule);
    if (!nextDate) return { status: 'no-date', color: 'gray' };

    const today = new Date();
    const nextMaintenance = new Date(nextDate);
    const daysUntilNext = Math.ceil((nextMaintenance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilNext < 0) {
      return { status: 'overdue', color: 'red', days: Math.abs(daysUntilNext) };
    } else if (daysUntilNext <= 7) {
      return { status: 'urgent', color: 'orange', days: daysUntilNext };
    } else if (daysUntilNext <= 30) {
      return { status: 'soon', color: 'yellow', days: daysUntilNext };
    } else {
      return { status: 'normal', color: 'green', days: daysUntilNext };
    }
  };

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <Box p={{ base: 4, md: 6 }} maxW="container.xl" mx="auto">
      {/* Header */}
      <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} spacing={4}>
        <Box>
          <Heading size={{ base: 'md', md: 'lg' }} color="gray.900">Agendamentos de Manutenção</Heading>
          <Text color="gray.600" mt={2} fontSize={{ base: 'sm', md: 'md' }}>
            Gerencie os agendamentos de manutenção preventiva dos equipamentos
          </Text>
        </Box>
        <Link href="/maintenance-schedules/new">
          <Button
            leftIcon={<Plus size={16} />}
            colorScheme="blue"
            size={{ base: 'sm', md: 'md' }}
            w={{ base: 'full', md: 'auto' }}
          >
            Novo Agendamento
          </Button>
        </Link>
      </Stack>

      {/* Filtros */}
      <Card>
        <CardBody p={{ base: 4, md: 6 }}>
          <Stack spacing={4}>
            {/* Busca */}
            <Box position="relative">
              <Input
                placeholder="Buscar por equipamento, técnico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                pl={10}
                size={{ base: 'sm', md: 'md' }}
              />
              <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400">
                <Search size={16} />
              </Box>
            </Box>

            {/* Filtros em linha no desktop, coluna no mobile */}
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                size={{ base: 'sm', md: 'md' }}
              >
                <option value="">Todos os tipos</option>
                <option value="MAINTENANCE">Manutenção</option>
                <option value="CALIBRATION">Calibração</option>
                <option value="CLEANING">Limpeza</option>
                <option value="INSPECTION">Vistoria</option>
                <option value="CONFIGURATION">Configuração</option>
                <option value="INSTALLATION">Instalação</option>
                <option value="OTHER">Outro</option>
              </Select>

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size={{ base: 'sm', md: 'md' }}
              >
                <option value="">Todos os status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </Select>

              <Button
                colorScheme="blue"
                size={{ base: 'sm', md: 'md' }}
                variant="outline"
                leftIcon={<Filter size={22} />}
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('');
                  setStatusFilter('');
                }}
                w={{ base: 'full', md: 'auto' }}
                mt={{ base: 2, md: 0 }}
                _hover={{ bg: 'blue.50' }}
                _active={{ bg: 'blue.100' }}
                _focus={{ boxShadow: 'none' }}
                transition="all 0.2s"
                borderColor="blue.500"
                borderWidth={1}
                borderRadius="md"
                boxShadow="sm"
              >
                Limpar Filtros
              </Button>
            </Stack>
          </Stack>
        </CardBody>
      </Card>

      {/* Lista de Agendamentos */}
      <VStack spacing={4} align="stretch">
        {filteredSchedules.length === 0 ? (
          <Card>
            <CardBody p={{ base: 6, md: 8 }} textAlign="center">
              <VStack spacing={4}>
                <Settings color="gray.400" />
                <Heading size={{ base: 'sm', md: 'md' }} color="gray.900">
                  Nenhum agendamento encontrado
                </Heading>
                <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
                  {schedules.length === 0
                    ? 'Ainda não há agendamentos de manutenção cadastrados.'
                    : 'Nenhum agendamento corresponde aos filtros aplicados.'
                  }
                </Text>
                {schedules.length === 0 && (
                  <Link href="/maintenance-schedules/new">
                    <Button colorScheme="blue" size={{ base: 'sm', md: 'md' }}>Criar Primeiro Agendamento</Button>
                  </Link>
                )}
              </VStack>
            </CardBody>
          </Card>
        ) : (
          filteredSchedules.map((schedule) => {
            const nextTaskDate = getNextTaskDate(schedule);
            const pendingTasksCount = schedule.tasks.filter(task => task.status === 'PENDING').length;
            const { status, color, days } = getNextMaintenanceStatus(schedule);

            return (
              <Card key={schedule.id} _hover={{ shadow: 'md' }} transition="all 0.2s">
                <CardBody p={{ base: 4, md: 6 }}>
                  <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align="start" spacing={4}>
                    <Box flex={1}>
                      {/* Header do card */}
                      <Stack direction={{ base: 'column', sm: 'row' }} spacing={3} mb={3} align={{ base: 'start', sm: 'center' }}>
                        <Heading size={{ base: 'sm', md: 'md' }} color="gray.900" noOfLines={1}>
                          {schedule.inventory.name}
                        </Heading>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme={schedule.active ? "green" : "gray"} size={{ base: 'sm', md: 'md' }}>
                            {schedule.active ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Badge variant="outline" size={{ base: 'sm', md: 'md' }}>
                            {getTypeLabel(schedule.type)}
                          </Badge>
                        </HStack>
                      </Stack>

                      {/* Informações principais */}
                      <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 2, md: 4 }} fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" mb={3}>
                        <HStack>
                          <Text fontWeight="medium">Equipamento:</Text>
                          <Text noOfLines={1}>{schedule.inventory.serial_number}</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="medium">Técnico:</Text>
                          <Text noOfLines={1}>{schedule.technician.name}</Text>
                        </HStack>
                        <HStack>
                          <Text fontWeight="medium">Intervalo:</Text>
                          <Text>{schedule.interval_days} dias</Text>
                        </HStack>
                      </Stack>

                      {/* Próxima manutenção */}
                      {nextTaskDate && (
                        <HStack spacing={2} mt={3} fontSize={{ base: 'xs', md: 'sm' }} flexWrap="wrap">
                          <Calendar size={isMobile ? 14 : 16} color={color === 'red' ? 'red.600' : color === 'orange' ? 'orange.600' : color === 'yellow' ? 'yellow.600' : 'blue.600'} />
                          <Text color={color === 'red' ? 'red.600' : color === 'orange' ? 'orange.600' : color === 'yellow' ? 'yellow.600' : 'blue.600'} fontWeight="medium" noOfLines={1}>
                            Próxima: {format(new Date(nextTaskDate), 'dd/MM/yyyy', { locale: ptBR })}
                          </Text>
                          {status !== 'no-date' && (
                            <Badge
                              colorScheme={color}
                              variant={status === 'overdue' ? 'solid' : 'subtle'}
                              fontSize="xs"
                              size="sm"
                            >
                              {status === 'overdue' && `${days}d atrasado`}
                              {status === 'urgent' && `${days}d`}
                              {status === 'soon' && `${days}d`}
                              {status === 'normal' && `${days}d`}
                            </Badge>
                          )}
                        </HStack>
                      )}

                      {/* Informações sobre tarefas */}
                      <HStack spacing={4} mt={2} fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" flexWrap="wrap">
                        <HStack>
                          <Clock size={isMobile ? 12 : 14} />
                          <Text>Pendentes: {pendingTasksCount}</Text>
                        </HStack>
                        {schedule.tasks.length > 0 && (
                          <HStack>
                            <Text>Total: {schedule.tasks.length}</Text>
                          </HStack>
                        )}
                      </HStack>

                      {/* Observações */}
                      {schedule.notes && (
                        <Text color="gray.600" mt={3} fontSize={{ base: 'xs', md: 'sm' }} noOfLines={2}>
                          <Text as="span" fontWeight="medium">Observações:</Text> {schedule.notes}
                        </Text>
                      )}
                    </Box>

                    {/* Botões de ação */}
                    <Stack direction={{ base: 'row', md: 'column' }} spacing={2} w={{ base: 'full', md: 'auto' }}>
                      <Link href={`/maintenance-schedules/${schedule.id}`}>
                        <Button variant="outline" size={{ base: 'sm', md: 'md' }} w={{ base: 'full', md: 'auto' }}>
                          Ver Detalhes
                        </Button>
                      </Link>
                      <Link href={`/maintenance-schedules/${schedule.id}/edit`}>
                        <Button variant="outline" size={{ base: 'sm', md: 'md' }} w={{ base: 'full', md: 'auto' }}>
                          Editar
                        </Button>
                      </Link>
                    </Stack>
                  </Stack>
                </CardBody>
              </Card>
            );
          })
        )}
      </VStack>
    </Box>
  );
} 
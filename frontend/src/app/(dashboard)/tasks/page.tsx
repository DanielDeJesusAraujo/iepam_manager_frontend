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
  useColorModeValue,
  Spinner,
  Center,
  Flex,
  useToast,
  Container,
  Icon,
} from '@chakra-ui/react';
import { Calendar, Clock, CheckCircle, AlertTriangle, Search, Filter, ListTodo, Settings, Plus, TrendingUp, AlertCircle, CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  status: string;
  completed_at?: string;
  created_at: string;
  schedule: {
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
  };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewFilter, setViewFilter] = useState('all');
  const toast = useToast();
  const router = useRouter();

  // Cores responsivas
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const textSecondary = useColorModeValue('gray.600', 'gray.300');
  const iconColor = useColorModeValue('blue.500', 'blue.300');
  const successColor = useColorModeValue('green.500', 'green.300');
  const warningColor = useColorModeValue('yellow.500', 'yellow.300');
  const dangerColor = useColorModeValue('red.500', 'red.300');
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputBorder = useColorModeValue('gray.300', 'gray.600');

  useEffect(() => {
    fetchTasks();
  }, [viewFilter]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) {
        router.push('/');
        return;
      }

      let endpoint = '/api/tasks';
      if (viewFilter === 'upcoming') {
        endpoint = '/api/tasks/upcoming?days=30';
      } else if (viewFilter === 'overdue') {
        endpoint = '/api/tasks/overdue';
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 429) {
        router.push('/rate-limit');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCompleted = async (taskId: string) => {
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Sucesso!',
          description: 'Tarefa marcada como concluída!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchTasks(); // Recarregar a lista
      } else {
        const error = await response.json();
        toast({
          title: 'Erro!',
          description: error.error || 'Erro ao marcar tarefa como concluída',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Erro ao marcar tarefa como concluída:', error);
      toast({
        title: 'Erro!',
        description: 'Erro ao marcar tarefa como concluída',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.schedule.inventory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.schedule.inventory.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.schedule.technician.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || task.status === statusFilter;

    return matchesSearch && matchesStatus;
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

  const getStatusBadge = (task: Task) => {
    const dueDate = new Date(task.due_date);
    const today = new Date();
    const isOverdue = isBefore(dueDate, today) && task.status === 'PENDING';
    const isDueSoon = isAfter(dueDate, today) && isBefore(dueDate, addDays(today, 7)) && task.status === 'PENDING';

    if (task.status === 'COMPLETED') {
      return <Badge colorScheme="green" variant="solid">Concluída</Badge>;
    } else if (isOverdue) {
      return <Badge colorScheme="red" variant="solid">Atrasada</Badge>;
    } else if (isDueSoon) {
      return <Badge colorScheme="yellow" variant="solid">Próxima</Badge>;
    } else {
      return <Badge variant="outline" colorScheme="blue">Pendente</Badge>;
    }
  };

  const getPriorityIcon = (task: Task) => {
    const dueDate = new Date(task.due_date);
    const today = new Date();
    const isOverdue = isBefore(dueDate, today) && task.status === 'PENDING';
    const isDueSoon = isAfter(dueDate, today) && isBefore(dueDate, addDays(today, 3)) && task.status === 'PENDING';

    if (isOverdue) {
      return <AlertTriangle size={20} color={dangerColor} />;
    } else if (isDueSoon) {
      return <Clock size={20} color={warningColor} />;
    } else {
      return <Calendar size={20} color={iconColor} />;
    }
  };

  if (loading) {
    return (
      <Center minH="100vh" bgGradient={bgGradient}>
        <VStack spacing={4}>
          <Spinner size="xl" color={iconColor} thickness="4px" />
          <Text color={textSecondary} fontSize="lg">Carregando tarefas...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient} py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Card bg={cardBg} border="1px solid" borderColor={cardBorder} shadow="xl">
            <CardBody p={8}>
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                <Box>
                  <HStack spacing={3} mb={2}>
                    <Box p={3} borderRadius="full" bgGradient="linear(to-r, blue.500, purple.500)" color="white">
                      <ListTodo size={24} />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Heading size="lg" color={textColor} fontWeight="bold">
                        Tarefas de Manutenção
                      </Heading>
                      <Text color={textSecondary} fontSize="md">
                        Gerencie as tarefas de manutenção preventiva
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
                <HStack spacing={3}>
                  <Link href="/maintenance-schedules">
                    <Button 
                      variant="outline" 
                      leftIcon={<Settings size={18} />}
                      colorScheme="blue"
                      _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                      transition="all 0.3s"
                    >
                      Agendamentos
                    </Button>
                  </Link>
                  <Link href="/maintenance-schedules/new">
                    <Button 
                      colorScheme="blue" 
                      leftIcon={<Plus size={18} />}
                      bgGradient="linear(to-r, blue.500, purple.500)"
                      _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                      transition="all 0.3s"
                    >
                      Novo Agendamento
                    </Button>
                  </Link>
                </HStack>
              </Flex>
            </CardBody>
          </Card>

          {/* Filtros */}
          <Card bg={cardBg} border="1px solid" borderColor={cardBorder} shadow="lg">
            <CardBody p={6}>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
                <Box position="relative">
                  <Input
                    placeholder="Buscar por tarefa, equipamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    pl={12}
                    bg={inputBg}
                    borderColor={inputBorder}
                    _focus={{ borderColor: iconColor, boxShadow: `0 0 0 1px ${iconColor}` }}
                    _hover={{ borderColor: iconColor }}
                    transition="all 0.2s"
                  />
                  <Box position="absolute" left={4} top={3} color={textSecondary}>
                    <Search size={18} />
                  </Box>
                </Box>
                
                <Select 
                  value={viewFilter} 
                  onChange={(e) => setViewFilter(e.target.value)}
                  bg={inputBg}
                  borderColor={inputBorder}
                  _focus={{ borderColor: iconColor, boxShadow: `0 0 0 1px ${iconColor}` }}
                >
                  <option value="all">Todas as tarefas</option>
                  <option value="upcoming">Próximas (30 dias)</option>
                  <option value="overdue">Atrasadas</option>
                </Select>

                <Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  bg={inputBg}
                  borderColor={inputBorder}
                  _focus={{ borderColor: iconColor, boxShadow: `0 0 0 1px ${iconColor}` }}
                >
                  <option value="">Todos os status</option>
                  <option value="PENDING">Pendente</option>
                  <option value="COMPLETED">Concluída</option>
                </Select>

                <Button
                  variant="outline"
                  leftIcon={<Filter size={18} />}
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                  }}
                  colorScheme="blue"
                  _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                  transition="all 0.2s"
                >
                  Limpar Filtros
                </Button>
              </Grid>
            </CardBody>
          </Card>

          {/* Estatísticas */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6}>
            <Card bg={cardBg} border="1px solid" borderColor={cardBorder} shadow="lg" _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }} transition="all 0.3s">
              <CardBody p={6}>
                <Flex align="center" justify="space-between">
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color={textSecondary} mb={1}>Total</Text>
                    <Text fontSize="3xl" fontWeight="bold" color={textColor}>{tasks.length}</Text>
                  </Box>
                  <Box p={3} borderRadius="full" bgGradient="linear(to-r, blue.500, purple.500)" color="white">
                    <ListTodo size={28} />
                  </Box>
                </Flex>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} border="1px solid" borderColor={cardBorder} shadow="lg" _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }} transition="all 0.3s">
              <CardBody p={6}>
                <Flex align="center" justify="space-between">
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color={textSecondary} mb={1}>Pendentes</Text>
                    <Text fontSize="3xl" fontWeight="bold" color={warningColor}>
                      {tasks.filter(t => t.status === 'PENDING').length}
                    </Text>
                  </Box>
                  <Box p={3} borderRadius="full" bgGradient="linear(to-r, yellow.500, orange.500)" color="white">
                    <Clock size={28} />
                  </Box>
                </Flex>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} border="1px solid" borderColor={cardBorder} shadow="lg" _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }} transition="all 0.3s">
              <CardBody p={6}>
                <Flex align="center" justify="space-between">
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color={textSecondary} mb={1}>Atrasadas</Text>
                    <Text fontSize="3xl" fontWeight="bold" color={dangerColor}>
                      {tasks.filter(t => isBefore(new Date(t.due_date), new Date()) && t.status === 'PENDING').length}
                    </Text>
                  </Box>
                  <Box p={3} borderRadius="full" bgGradient="linear(to-r, red.500, pink.500)" color="white">
                    <AlertTriangle size={28} />
                  </Box>
                </Flex>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} border="1px solid" borderColor={cardBorder} shadow="lg" _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }} transition="all 0.3s">
              <CardBody p={6}>
                <Flex align="center" justify="space-between">
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color={textSecondary} mb={1}>Concluídas</Text>
                    <Text fontSize="3xl" fontWeight="bold" color={successColor}>
                      {tasks.filter(t => t.status === 'COMPLETED').length}
                    </Text>
                  </Box>
                  <Box p={3} borderRadius="full" bgGradient="linear(to-r, green.500, teal.500)" color="white">
                    <CheckCircle size={28} />
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          </Grid>

          {/* Lista de Tarefas */}
          <VStack spacing={4} align="stretch">
            {filteredTasks.length === 0 ? (
              <Card bg={cardBg} border="1px solid" borderColor={cardBorder} shadow="lg">
                <CardBody p={12} textAlign="center">
                  <VStack spacing={6}>
                    <Box p={6} borderRadius="full" bgGradient="linear(to-r, gray.400, gray.500)" color="white">
                      <ListTodo size={48} />
                    </Box>
                    <VStack spacing={2}>
                      <Heading size="lg" color={textColor} fontWeight="bold">
                        Nenhuma tarefa encontrada
                      </Heading>
                      <Text color={textSecondary} fontSize="md">
                        {tasks.length === 0 
                          ? 'Ainda não há tarefas de manutenção agendadas.'
                          : 'Nenhuma tarefa corresponde aos filtros aplicados.'
                        }
                      </Text>
                    </VStack>
                    {tasks.length === 0 && (
                      <Link href="/maintenance-schedules/new">
                        <Button 
                          colorScheme="blue" 
                          size="lg"
                          leftIcon={<Plus size={20} />}
                          bgGradient="linear(to-r, blue.500, purple.500)"
                          _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                          transition="all 0.3s"
                        >
                          Criar Primeiro Agendamento
                        </Button>
                      </Link>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ) : (
              filteredTasks.map((task) => {
                const dueDate = new Date(task.due_date);
                const isOverdue = isBefore(dueDate, new Date()) && task.status === 'PENDING';
                
                return (
                  <Card 
                    key={task.id} 
                    bg={cardBg}
                    border="1px solid" 
                    borderColor={isOverdue ? "red.300" : cardBorder}
                    shadow="lg"
                    _hover={{ 
                      transform: 'translateY(-2px)', 
                      shadow: 'xl',
                      borderColor: isOverdue ? "red.400" : iconColor
                    }} 
                    transition="all 0.3s"
                  >
                    <CardBody p={8}>
                      <Flex justify="space-between" align="start" flexWrap="wrap" gap={4}>
                        <Box flex={1}>
                          <HStack spacing={4} mb={4} flexWrap="wrap">
                            {getPriorityIcon(task)}
                            <VStack align="start" spacing={1}>
                              <Heading size="md" color={textColor} fontWeight="bold">
                                {task.title}
                              </Heading>
                              <HStack spacing={2}>
                                {getStatusBadge(task)}
                                <Badge 
                                  variant="outline" 
                                  colorScheme="purple"
                                  fontSize="xs"
                                  px={2}
                                  py={1}
                                >
                                  {getTypeLabel(task.schedule.type)}
                                </Badge>
                              </HStack>
                            </VStack>
                          </HStack>
                          
                          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4} mb={4}>
                            <HStack spacing={2}>
                              <Text fontWeight="semibold" color={textColor} fontSize="sm">Equipamento:</Text>
                              <Text color={textSecondary} fontSize="sm">{task.schedule.inventory.name}</Text>
                            </HStack>
                            <HStack spacing={2}>
                              <Text fontWeight="semibold" color={textColor} fontSize="sm">Nº Série:</Text>
                              <Text color={textSecondary} fontSize="sm">{task.schedule.inventory.serial_number}</Text>
                            </HStack>
                            <HStack spacing={2}>
                              <Text fontWeight="semibold" color={textColor} fontSize="sm">Técnico:</Text>
                              <Text color={textSecondary} fontSize="sm">{task.schedule.technician.name}</Text>
                            </HStack>
                            <HStack spacing={2}>
                              <Text fontWeight="semibold" color={textColor} fontSize="sm">Vencimento:</Text>
                              <Text 
                                color={isOverdue ? dangerColor : textSecondary} 
                                fontWeight={isOverdue ? "bold" : "normal"}
                                fontSize="sm"
                              >
                                {format(dueDate, 'dd/MM/yyyy', { locale: ptBR })}
                              </Text>
                            </HStack>
                          </Grid>

                          {task.description && (
                            <Text color={textSecondary} fontSize="sm" mb={4} lineHeight="1.6">
                              {task.description}
                            </Text>
                          )}

                          {task.status === 'COMPLETED' && task.completed_at && (
                            <HStack spacing={2} fontSize="sm" color={successColor} bg="green.50" p={3} borderRadius="md">
                              <CheckCircle size={16} />
                              <Text fontWeight="medium">
                                Concluída em {format(new Date(task.completed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </Text>
                            </HStack>
                          )}
                        </Box>

                        <HStack spacing={3} ml={4}>
                          {task.status === 'PENDING' && (
                            <Button 
                              onClick={() => handleMarkAsCompleted(task.id)}
                              size="md"
                              colorScheme="green"
                              leftIcon={<CheckCircle size={18} />}
                              bgGradient="linear(to-r, green.500, teal.500)"
                              _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                              transition="all 0.2s"
                            >
                              Concluir
                            </Button>
                          )}
                          <Link href={`/maintenance-schedules/${task.schedule.id}`}>
                            <Button 
                              variant="outline" 
                              size="md"
                              colorScheme="blue"
                              _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                              transition="all 0.2s"
                            >
                              Ver Agendamento
                            </Button>
                          </Link>
                        </HStack>
                      </Flex>
                    </CardBody>
                  </Card>
                );
              })
            )}
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
} 
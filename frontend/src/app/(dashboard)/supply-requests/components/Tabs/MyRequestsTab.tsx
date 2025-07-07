import React from 'react';
import {
  Card,
  CardBody,
  Flex,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Badge,
  Button,
  Text,
  Image,
  useColorMode,
  useMediaQuery,
  Grid,
  Divider,
} from '@chakra-ui/react';
import { SearchIcon, CheckCircle } from 'lucide-react';
import { SupplyRequest } from '../../types';
import { useFilters } from '@/contexts/GlobalContext';

interface MyRequestsTabProps {
  requests: SupplyRequest[];
  onRequesterConfirmation: (requestId: string, confirmation: boolean, token: string, isCustom: boolean) => void;
}

export function MyRequestsTab({ 
  requests, 
  onRequesterConfirmation 
}: MyRequestsTabProps) {
  const { colorMode } = useColorMode();
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const { searchQuery, setSearchQuery, statusFilter, setStatusFilter } = useFilters();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'green';
      case 'REJECTED': return 'red';
      case 'DELIVERED': return 'purple';
      default: return 'yellow';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente';
      case 'APPROVED': return 'Aprovado';
      case 'REJECTED': return 'Rejeitado';
      case 'DELIVERED': return 'Entregue';
      default: return status;
    }
  };

  return (
    <Card bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'} backdropFilter="blur(12px)" borderWidth="1px" borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}>
      <CardBody>
        {!isMobile && (
        <Flex gap={4} mb={6} direction={{ base: 'column', md: 'row' }} justify={{ base: 'center', md: 'space-between' }}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color={colorMode === 'dark' ? 'gray.400' : 'gray.300'} />
            </InputLeftElement>
            <Input
              placeholder="Buscar por suprimento..."
              value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'}
              backdropFilter="blur(12px)"
              borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
              _hover={{ borderColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }}
              _focus={{ borderColor: colorMode === 'dark' ? 'blue.400' : 'blue.500', boxShadow: 'none' }}
            />
          </InputGroup>
          <Select
            placeholder="Filtrar por status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            maxW="200px"
            bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'}
            backdropFilter="blur(12px)"
            borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
            _hover={{ borderColor: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }}
            _focus={{ borderColor: colorMode === 'dark' ? 'blue.400' : 'blue.500', boxShadow: 'none' }}
          >
            <option value="">Todos</option>
            <option value="PENDING">Pendente</option>
            <option value="APPROVED">Aprovado</option>
            <option value="REJECTED">Rejeitado</option>
            <option value="DELIVERED">Entregue</option>
          </Select>
        </Flex>
        )}
        {requests.length === 0 ? (
          <Flex direction="column" align="center" justify="center">
            <Image src="/Task-complete.svg" alt="Nenhuma requisição encontrada" maxW="300px" mb={4} />
            <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.500'} fontSize="lg">Nenhuma requisição encontrada</Text>
          </Flex>
        ) : isMobile ? (
          // Layout Mobile com Cards
          <VStack spacing={4} align="stretch">
            {requests.map((request) => (
              <Card 
                key={request.id} 
                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'gray.50'} 
                backdropFilter="blur(12px)" 
                borderWidth="1px" 
                borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                borderRadius={0}
              >
                <CardBody p={4}>
                  <VStack align="stretch" spacing={3}>
                    {/* Header com nome e status */}
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={1} flex="1">
                        <Text fontWeight="bold" fontSize="md" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                          {request.is_custom ? request.item_name : request.supply?.name}
                        </Text>
                        <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                          {request.quantity} {request.is_custom ? request.unit?.symbol || request.unit?.name : request.supply?.unit?.symbol || request.supply?.unit?.name}
                        </Text>
                      </VStack>
                      <Badge colorScheme={getStatusColor(request.status)} size="sm">
                        {getStatusText(request.status)}
                      </Badge>
                    </HStack>

                    <Divider />

                    {/* Informações adicionais */}
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>Data:</Text>
                        <Text fontSize="sm" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                          {new Date(request.created_at).toLocaleDateString('pt-BR')}
                        </Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>Requerente:</Text>
                        <Badge colorScheme={request.requester_confirmation ? 'green' : 'gray'} size="xs">
                          {request.requester_confirmation ? 'Confirmado' : 'Pendente'}
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>Gerente:</Text>
                        <Badge colorScheme={request.manager_delivery_confirmation ? 'green' : 'gray'} size="xs">
                          {request.manager_delivery_confirmation ? 'Confirmado' : 'Pendente'}
                        </Badge>
                      </HStack>
                    </VStack>

                    {/* Botão de ação */}
                    {request.status === 'APPROVED' && (
                      <Button 
                        size="sm" 
                        colorScheme="blue" 
                        leftIcon={<CheckCircle size={16} />} 
                        onClick={() => onRequesterConfirmation(request.id, true, localStorage.getItem('@ti-assistant:token') || '', request.is_custom || false)} 
                        isDisabled={request.requester_confirmation} 
                        bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined} 
                        _hover={{ bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined, transform: 'translateY(-1px)' }} 
                        transition="all 0.3s ease"
                        w="full"
                      >
                        Confirmar Recebimento
                      </Button>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        ) : (
          // Layout Desktop com Tabela
          <Box overflowX="auto">
            <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
              <Thead>
                <Tr>
                  <Th color={colorMode === 'dark' ? 'white' : 'gray.800'}>Suprimento</Th>
                  <Th color={colorMode === 'dark' ? 'white' : 'gray.800'} display={{ base: 'none', md: 'table-cell' }}>Quantidade</Th>
                  <Th color={colorMode === 'dark' ? 'white' : 'gray.800'}>Status</Th>
                  <Th color={colorMode === 'dark' ? 'white' : 'gray.800'} display={{ base: 'none', md: 'table-cell' }}>Data</Th>
                  <Th color={colorMode === 'dark' ? 'white' : 'gray.800'} display={{ base: 'none', lg: 'table-cell' }}>Confirmações</Th>
                  <Th color={colorMode === 'dark' ? 'white' : 'gray.800'}>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {requests.map((request) => (
                  <Tr key={request.id}>
                    <Td color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{request.is_custom ? request.item_name : request.supply?.name}</Text>
                        {isMobile && (
                          <Text fontSize="xs" color="gray.500">
                            {request.quantity} {request.is_custom ? request.unit?.symbol || request.unit?.name : request.supply?.unit?.symbol || request.supply?.unit?.name}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} display={{ base: 'none', md: 'table-cell' }}>
                      {request.quantity} {request.is_custom ? request.unit?.symbol || request.unit?.name : request.supply?.unit?.symbol || request.supply?.unit?.name}
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(request.status)} size={{ base: 'sm', md: 'md' }}>
                        {getStatusText(request.status)}
                      </Badge>
                    </Td>
                    <Td color={colorMode === 'dark' ? 'white' : 'gray.800'} display={{ base: 'none', md: 'table-cell' }}>
                      {new Date(request.created_at).toLocaleDateString('pt-BR')}
                    </Td>
                    <Td display={{ base: 'none', lg: 'table-cell' }}>
                      <VStack spacing={2} align="start">
                        <HStack>
                          <Text fontSize="sm" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Requerente:</Text>
                          <Badge colorScheme={request.requester_confirmation ? 'green' : 'gray'}>
                            {request.requester_confirmation ? 'Confirmado' : 'Pendente'}
                          </Badge>
                        </HStack>
                        <HStack>
                          <Text fontSize="sm" color={colorMode === 'dark' ? 'white' : 'gray.800'}>Gerente:</Text>
                          <Badge colorScheme={request.manager_delivery_confirmation ? 'green' : 'gray'}>
                            {request.manager_delivery_confirmation ? 'Confirmado' : 'Pendente'}
                          </Badge>
                        </HStack>
                      </VStack>
                    </Td>
                    <Td>
                      {request.status === 'APPROVED' && (
                        <Button 
                          size={{ base: 'xs', md: 'sm' }} 
                          colorScheme="blue" 
                          leftIcon={<CheckCircle size={isMobile ? 14 : 16} />} 
                          onClick={() => onRequesterConfirmation(request.id, true, localStorage.getItem('@ti-assistant:token') || '', request.is_custom || false)} 
                          isDisabled={request.requester_confirmation} 
                          bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined} 
                          _hover={{ bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined, transform: 'translateY(-1px)' }} 
                          transition="all 0.3s ease"
                        >
                          {isMobile ? 'Confirmar' : 'Confirmar Recebimento'}
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </CardBody>
    </Card>
  );
} 
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  CardBody,
  Divider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Select,
  useColorMode,
  Flex,
} from '@chakra-ui/react';
import { FiFilter, FiPlus } from 'react-icons/fi';
import { useState } from 'react';
import { CreateQuoteButton } from './CreateQuoteButton';
import { SmartQuotesTable } from './SmartQuotesTable';

interface Quote {
  id: string;
  supplier: string;
  status: string;
  total_value: number;
  created_at: string;
  user: {
    name: string;
  };
  items: {
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

interface MobileQuotesProps {
  quotes: Quote[];
  onStatusChange: (id: string, status: 'APPROVED' | 'REJECTED' | 'CANCELLED') => void;
}

export function MobileQuotes({ quotes, onStatusChange }: MobileQuotesProps) {
  const { colorMode } = useColorMode();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const onFilterOpen = () => setIsFilterOpen(true);
  const onFilterClose = () => setIsFilterOpen(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'yellow';
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'CANCELLED':
        return 'gray';
      default:
        return 'blue';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'APPROVED':
        return 'Aprovada';
      case 'REJECTED':
        return 'Rejeitada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredQuotes = quotes.filter((quote) => {
    if (!statusFilter) return true;
    return quote.status === statusFilter;
  });

  return (
    <Box w="full" h="full" py="6vh">
      <VStack
        spacing={4}
        align="stretch"
        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
        backdropFilter="blur(12px)"
        p={3}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        h="full"
      >
        <Flex 
          direction="column" 
          gap={3}
        >
          <HStack 
            spacing={2} 
            w="100%" 
            justify="space-between"
            wrap="wrap"
          >
            <CreateQuoteButton />
            <Button
              leftIcon={<FiFilter />}
              size="sm"
              onClick={onFilterOpen}
              bg={colorMode === 'dark' ? 'rgba(66, 153, 225, 0.8)' : undefined}
              _hover={{
                bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.9)' : undefined,
                transform: 'translateY(-1px)',
              }}
              transition="all 0.3s ease"
            >
              Filtros
            </Button>
          </HStack>

          <Box
            bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
            backdropFilter="blur(12px)"
            borderRadius="lg"
            borderWidth="1px"
            borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
          >
            <HStack spacing={0} borderBottomWidth="1px" borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}>
              <Button
                flex={1}
                variant="ghost"
                borderRadius={0}
                borderBottomWidth="2px"
                borderBottomColor={activeTab === 0 ? (colorMode === 'dark' ? 'blue.400' : 'blue.500') : 'transparent'}
                color={activeTab === 0 ? (colorMode === 'dark' ? 'white' : 'blue.500') : undefined}
                onClick={() => setActiveTab(0)}
                _hover={{
                  bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.1)' : 'blue.50',
                }}
              >
                Todas
              </Button>
              <Button
                flex={1}
                variant="ghost"
                borderRadius={0}
                borderBottomWidth="2px"
                borderBottomColor={activeTab === 1 ? (colorMode === 'dark' ? 'blue.400' : 'blue.500') : 'transparent'}
                color={activeTab === 1 ? (colorMode === 'dark' ? 'white' : 'blue.500') : undefined}
                onClick={() => setActiveTab(1)}
                _hover={{
                  bg: colorMode === 'dark' ? 'rgba(66, 153, 225, 0.1)' : 'blue.50',
                }}
              >
                Inteligentes
              </Button>
            </HStack>

            {activeTab === 0 ? (
              <VStack spacing={4} align="stretch" p={4}>
                {filteredQuotes.map((quote) => (
                  <Card
                    key={quote.id}
                    bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                    backdropFilter="blur(12px)"
                    borderWidth="1px"
                    borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
                    _hover={{
                      bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <Flex justify="space-between" align="center">
                          <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                            {quote.supplier}
                          </Text>
                          <Badge colorScheme={getStatusColor(quote.status)}>
                            {getStatusText(quote.status)}
                          </Badge>
                        </Flex>

                        <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                          Solicitante: {quote.user.name}
                        </Text>

                        <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                          Valor Total: {formatCurrency(quote.total_value)}
                        </Text>

                        <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                          Data: {new Date(quote.created_at).toLocaleDateString('pt-BR')}
                        </Text>

                        <Divider />

                        <Text fontWeight="bold" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
                          Itens:
                        </Text>

                        {quote.items.map((item, index) => (
                          <Box key={index}>
                            <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                              {item.product_name} - {item.quantity}x {formatCurrency(item.unit_price)}
                            </Text>
                          </Box>
                        ))}

                        {quote.status === 'PENDING' && (
                          <HStack spacing={2} mt={2}>
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() => onStatusChange(quote.id, 'APPROVED')}
                              flex={1}
                              bg={colorMode === 'dark' ? 'rgba(72, 187, 120, 0.8)' : undefined}
                              _hover={{
                                bg: colorMode === 'dark' ? 'rgba(72, 187, 120, 0.9)' : undefined,
                                transform: 'translateY(-1px)',
                              }}
                              transition="all 0.3s ease"
                            >
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => onStatusChange(quote.id, 'REJECTED')}
                              flex={1}
                              bg={colorMode === 'dark' ? 'rgba(245, 101, 101, 0.8)' : undefined}
                              _hover={{
                                bg: colorMode === 'dark' ? 'rgba(245, 101, 101, 0.9)' : undefined,
                                transform: 'translateY(-1px)',
                              }}
                              transition="all 0.3s ease"
                            >
                              Rejeitar
                            </Button>
                          </HStack>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            ) : (
              <Box p={4}>
                <SmartQuotesTable />
              </Box>
            )}
          </Box>
        </Flex>
      </VStack>

      <Drawer isOpen={isFilterOpen} placement="bottom" onClose={onFilterClose}>
        <DrawerOverlay />
        <DrawerContent borderTopRadius="xl">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Filtros</DrawerHeader>
          <DrawerBody py={4}>
            <VStack spacing={4}>
              <Box w="100%">
                <Text mb={2} color={colorMode === 'dark' ? 'white' : 'gray.800'}>Status</Text>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    onFilterClose();
                  }}
                  bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
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
                  <option value="">Todos</option>
                  <option value="PENDING">Pendente</option>
                  <option value="APPROVED">Aprovada</option>
                  <option value="REJECTED">Rejeitada</option>
                  <option value="CANCELLED">Cancelada</option>
                </Select>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
} 
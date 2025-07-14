import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Image,
  Button,
  Spinner,
  useToast,
  useColorModeValue,
  Divider,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FiArrowLeft, FiFileText, FiCalendar, FiPackage, FiDollarSign, FiUser, FiTruck } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface SupplyBatchDetailsProps {
  batchId: string;
  onBack: () => void;
}

interface SupplyBatch {
  id: string;
  supply_id: string;
  supplier_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  purchased_at: string;
  expires_at?: string;
  notes?: string;
  invoice_url?: string;
  created_at: string;
  updated_at: string;
  supply: {
    id: string;
    name: string;
    description?: string;
    unit: {
      symbol: string;
      name: string;
    };
    category: {
      label: string;
    };
  };
  supplier: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

export function SupplyBatchDetails({ batchId, onBack }: SupplyBatchDetailsProps) {
  const [batch, setBatch] = useState<SupplyBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOpen: isInvoiceOpen, onOpen: onInvoiceOpen, onClose: onInvoiceClose } = useDisclosure();
  const toast = useToast();
  const router = useRouter();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    fetchBatchDetails();
  }, [batchId]);

  const fetchBatchDetails = async () => {
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      const response = await fetch(`/api/supply-batches/${batchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar detalhes do lote');
      }

      const data = await response.json();
      setBatch(data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar detalhes',
        description: 'Não foi possível carregar os detalhes do lote.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = () => {
    if (!batch?.expires_at) return <Badge colorScheme="blue">Sem Validade</Badge>;
    
    const today = new Date();
    const expiryDate = new Date(batch.expires_at);
    
    if (expiryDate < today) {
      return <Badge colorScheme="red">Vencido</Badge>;
    } else if (expiryDate.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000) {
      return <Badge colorScheme="orange">Vencendo</Badge>;
    } else {
      return <Badge colorScheme="green">Válido</Badge>;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!batch) {
    return (
      <Box textAlign="center" py={10}>
        <Text fontSize="lg" color={textColor}>Lote não encontrado</Text>
        <Button mt={4} onClick={onBack} leftIcon={<FiArrowLeft />}>
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack spacing={4}>
            <IconButton
              aria-label="Voltar"
              icon={<FiArrowLeft />}
              onClick={onBack}
              variant="ghost"
            />
            <Box>
              <Heading size="lg" color={textColor}>Detalhes do Lote</Heading>
              <Text color="gray.500" fontSize="sm">
                ID: {batch.id}
              </Text>
            </Box>
          </HStack>
          {getStatusBadge()}
        </HStack>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* Informações Principais */}
          <GridItem>
            <VStack spacing={4} align="stretch">
              {/* Informações do Produto */}
              <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                <CardHeader>
                  <HStack>
                    <FiPackage />
                    <Heading size="md">Informações do Produto</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Nome</Text>
                      <Text>{batch.supply.name}</Text>
                    </Box>
                    {batch.supply.description && (
                      <Box>
                        <Text fontWeight="bold" color={textColor}>Descrição</Text>
                        <Text>{batch.supply.description}</Text>
                      </Box>
                    )}
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Categoria</Text>
                      <Text>{batch.supply.category.label}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Unidade</Text>
                      <Text>{batch.supply.unit.name} ({batch.supply.unit.symbol})</Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Informações do Fornecedor */}
              <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                <CardHeader>
                  <HStack>
                    <FiTruck />
                    <Heading size="md">Informações do Fornecedor</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Nome</Text>
                      <Text>{batch.supplier.name}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Email</Text>
                      <Text>{batch.supplier.email}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Telefone</Text>
                      <Text>{batch.supplier.phone}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Endereço</Text>
                      <Text>{batch.supplier.address}</Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Observações */}
              {batch.notes && (
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardHeader>
                    <Heading size="md">Observações</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text>{batch.notes}</Text>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </GridItem>

          {/* Sidebar com Estatísticas e Ações */}
          <GridItem>
            <VStack spacing={4} align="stretch">
              {/* Estatísticas */}
              <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                <CardHeader>
                  <Heading size="md">Estatísticas</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <Stat>
                      <StatLabel>Quantidade</StatLabel>
                      <StatNumber>{batch.quantity}</StatNumber>
                      <StatHelpText>{batch.supply.unit.symbol}</StatHelpText>
                    </Stat>
                    <Divider />
                    <Stat>
                      <StatLabel>Preço Unitário</StatLabel>
                      <StatNumber>{formatCurrency(batch.unit_price)}</StatNumber>
                    </Stat>
                    <Divider />
                    <Stat>
                      <StatLabel>Valor Total</StatLabel>
                      <StatNumber>{formatCurrency(batch.total_price)}</StatNumber>
                    </Stat>
                  </VStack>
                </CardBody>
              </Card>

              {/* Datas */}
              <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                <CardHeader>
                  <HStack>
                    <FiCalendar />
                    <Heading size="md">Datas</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Data de Compra</Text>
                      <Text>{formatDate(batch.purchased_at)}</Text>
                    </Box>
                    {batch.expires_at && (
                      <Box>
                        <Text fontWeight="bold" color={textColor}>Data de Validade</Text>
                        <Text>{formatDate(batch.expires_at)}</Text>
                      </Box>
                    )}
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Criado em</Text>
                      <Text>{formatDate(batch.created_at)}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color={textColor}>Atualizado em</Text>
                      <Text>{formatDate(batch.updated_at)}</Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Nota Fiscal */}
              {batch.invoice_url && (
                <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
                  <CardHeader>
                    <HStack>
                      <FiFileText />
                      <Heading size="md">Nota Fiscal</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3}>
                      <Image
                        src={batch.invoice_url}
                        alt="Preview da Nota Fiscal"
                        maxH="200px"
                        objectFit="contain"
                        borderRadius="md"
                        cursor="pointer"
                        onClick={onInvoiceOpen}
                        _hover={{ opacity: 0.8 }}
                        transition="opacity 0.2s"
                      />
                      <Button
                        leftIcon={<FiFileText />}
                        colorScheme="blue"
                        onClick={onInvoiceOpen}
                        size="sm"
                        w="full"
                      >
                        Visualizar Nota Fiscal
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </GridItem>
        </Grid>
      </VStack>

      {/* Modal para visualizar Nota Fiscal */}
      <Modal isOpen={isInvoiceOpen} onClose={onInvoiceClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nota Fiscal</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {batch.invoice_url && (
              <Image
                src={batch.invoice_url}
                alt="Nota Fiscal"
                maxH="70vh"
                objectFit="contain"
                mx="auto"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
} 
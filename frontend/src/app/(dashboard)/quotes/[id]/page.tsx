'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  useToast,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { PageHeader } from '@/components/PageHeader';
import { generateQuotePDF } from '../components/QuotePDF';

interface QuoteItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  link?: string;
  manufacturer: string;
  total_price: number;
  final_price: number;
}

interface Quote {
  id: string;
  supplier: string;
  supplier_contact: string | null;
  status: string;
  notes: string | null;
  total_value: number;
  created_at: string;
  items: QuoteItem[];
}

export default function QuoteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchQuote();
  }, [params.id]);

  const fetchQuote = async () => {
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`/api/quotes/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar cotação');
      const data = await response.json();
      setQuote(data);
    } catch (error) {
      setError('Não foi possível carregar os detalhes da cotação');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes da cotação',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!quote) return;

    const doc = generateQuotePDF({ quote });
    doc.save(`cotacao-${quote.id}.pdf`);
  };

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
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="xl" />
        </Box>
      </Container>
    );
  }

  if (error || !quote) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error || 'Cotação não encontrada'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <PageHeader
          title={`Cotação #${quote.id}`}
          description="Detalhes da cotação de suprimentos"
          rightElement={
            <HStack spacing={4}>
              <Button
                colorScheme="blue"
                onClick={handleExportPDF}
                leftIcon={<span>📄</span>}
              >
                Exportar PDF
              </Button>
              <Button
                colorScheme="gray"
                onClick={() => router.push('/quotes')}
              >
                Voltar
              </Button>
            </HStack>
          }
        />

        <Box
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          p={6}
          shadow="sm"
        >
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={4}>Informações Gerais</Heading>
              <VStack align="stretch" spacing={2}>
                <Text><strong>Fornecedor:</strong> {quote.supplier}</Text>
                {quote.supplier_contact && (
                  <Text><strong>Contato:</strong> {quote.supplier_contact}</Text>
                )}
                <Text>
                  <strong>Status:</strong>{' '}
                  <Badge colorScheme={getStatusColor(quote.status)}>
                    {getStatusText(quote.status)}
                  </Badge>
                </Text>
                <Text><strong>Data de Criação:</strong> {new Date(quote.created_at).toLocaleDateString()}</Text>
                {quote.notes && (
                  <Text><strong>Observações:</strong> {quote.notes}</Text>
                )}
              </VStack>
            </Box>

            <Box>
              <Heading size="md" mb={4}>Itens da Cotação</Heading>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Produto</Th>
                      <Th>Fabricante</Th>
                      <Th isNumeric>Quantidade</Th>
                      <Th isNumeric>Preço Unitário</Th>
                      <Th isNumeric>Total</Th>
                      <Th>Link</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {quote.items.map((item, index) => (
                      <Tr key={index}>
                        <Td>{item.product_name}</Td>
                        <Td>{item.manufacturer}</Td>
                        <Td isNumeric>{item.quantity}</Td>
                        <Td isNumeric>R$ {item.unit_price.toFixed(2)}</Td>
                        <Td isNumeric>R$ {item.total_price.toFixed(2)}</Td>
                        <Td>
                          {item.link ? (
                            <Button
                              as="a"
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="sm"
                              colorScheme="blue"
                              variant="link"
                            >
                              Ver Produto
                            </Button>
                          ) : (
                            <Text color="gray.500">-</Text>
                          )}
                        </Td>
                      </Tr>
                    ))}
                    <Tr>
                      <Td colSpan={5} textAlign="right"><strong>Total:</strong></Td>
                      <Td isNumeric><strong>R$ {quote.total_value.toFixed(2)}</strong></Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
} 
import { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Spinner,
  useToast,
  HStack,
  Card,
  CardBody,
  Container,
  Heading,
  VStack,
  useColorModeValue,
  Select,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function SupplyBatchList() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState('');
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    async function fetchBatches() {
      setLoading(true);
      try {
        const token = localStorage.getItem('@ti-assistant:token');
        const res = await fetch('/api/supply-batches', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setBatches(data);
      } catch (e) {
        setBatches([]);
        toast({ title: 'Erro ao carregar lotes', status: 'error' });
      } finally {
        setLoading(false);
      }
    }
    fetchBatches();
  }, [toast]);

  // Produtos únicos para o filtro
  const uniqueItems = Array.from(new Set(batches.map(b => b.supply?.name || 'Desconhecido')));

  // Filtrar lotes pelo item selecionado
  const filteredBatches = selectedItem
    ? batches.filter(b => (b.supply?.name || 'Desconhecido') === selectedItem)
    : batches;

  // Calcular preço médio do item filtrado
  const avgPrice = filteredBatches.length > 0
    ? (filteredBatches.reduce((acc, b) => acc + b.unit_price, 0) / filteredBatches.length).toFixed(2)
    : null;

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Lotes de Suprimentos', 14, 16);
    const tableData = filteredBatches.map((b) => [
      b.supply?.name || '-',
      b.supplier?.name || '-',
      b.quantity,
      `R$ ${b.unit_price.toFixed(2)}`,
      b.purchased_at?.slice(0, 10),
      b.expires_at ? b.expires_at.slice(0, 10) : '-',
      b.notes || '-',
    ]);
    autoTable(doc, {
      head: [['Produto', 'Fornecedor', 'Quantidade', 'Preço Unit.', 'Data Entrada', 'Validade', 'Observações']],
      body: tableData,
      startY: 24,
    });
    doc.save('lotes_suprimentos.pdf');
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Lotes de Suprimentos</Heading>
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <HStack justify="space-between" mb={4} flexWrap="wrap">
              <Box fontWeight="bold" fontSize="md">Lista de Lotes</Box>
              <HStack spacing={4}>
                <Select
                  placeholder="Filtrar por produto"
                  value={selectedItem}
                  onChange={e => setSelectedItem(e.target.value)}
                  maxW="250px"
                >
                  {uniqueItems.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </Select>
                <Button colorScheme="blue" onClick={exportPDF}>Exportar PDF</Button>
              </HStack>
            </HStack>
            {selectedItem && (
              <Stat bg={bgColor} p={2} borderRadius="md" boxShadow="sm" mb={4} maxW="300px">
                <StatLabel>Preço Médio do Item</StatLabel>
                <StatNumber>R$ {avgPrice ?? '-'}</StatNumber>
              </Stat>
            )}
            <Box overflowX="auto">
              <Table size="sm" variant="striped">
                <Thead>
                  <Tr>
                    <Th>Produto</Th>
                    <Th>Fornecedor</Th>
                    <Th>Quantidade</Th>
                    <Th>Preço Unit.</Th>
                    <Th>Data Entrada</Th>
                    <Th>Validade</Th>
                    <Th>Observações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredBatches.length > 0 && filteredBatches.map((b) => (
                    <Tr key={b.id}>
                      <Td>{b.supply?.name || '-'}</Td>
                      <Td>{b.supplier?.name || '-'}</Td>
                      <Td>{b.quantity}</Td>
                      <Td>R$ {b.unit_price.toFixed(2)}</Td>
                      <Td>{b.purchased_at?.slice(0, 10)}</Td>
                      <Td>{b.expires_at ? b.expires_at.slice(0, 10) : '-'}</Td>
                      <Td>{b.notes || '-'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
} 
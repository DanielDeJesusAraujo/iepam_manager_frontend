import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  IconButton,
  useColorModeValue,
  VStack,
  HStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { Building2, Mail, Phone, MapPin, User, Trash2, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  cnpj: string;
  contact_person: string;
}

const formatCNPJ = (value: string) => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a formatação do CNPJ
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 5) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  } else if (numbers.length <= 12) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  } else {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  }
};

const formatPhone = (value: string) => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a formatação do telefone
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
};

export default function SupplierSettings() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch('/api/suppliers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 429) {
        router.push('/rate-limit');
        return;
      }

      if (!response.ok) throw new Error('Erro ao carregar fornecedores');
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os fornecedores',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) throw new Error('Token não encontrado');

      const url = editingSupplier 
        ? `/api/suppliers/${editingSupplier.id}`
        : '/api/suppliers';

      const response = await fetch(url, {
        method: editingSupplier ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name, 
          email, 
          phone, 
          address, 
          cnpj, 
          contact_person: contactPerson 
        })
      });

      if (response.status === 429) {
        router.push('/rate-limit');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar fornecedor');
      }

      toast({
        title: 'Sucesso',
        description: `Fornecedor ${editingSupplier ? 'atualizado' : 'criado'} com sucesso`,
        status: 'success',
        duration: 3000,
      });

      resetForm();
      onClose();
      fetchSuppliers();
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar fornecedor',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setName(supplier.name);
    setEmail(supplier.email);
    setPhone(supplier.phone);
    setAddress(supplier.address);
    setCnpj(supplier.cnpj);
    setContactPerson(supplier.contact_person);
    onOpen();
  };

  const handleDelete = async (supplierId: string) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;

    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch(`/api/suppliers/${supplierId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erro ao excluir fornecedor');

      toast({
        title: 'Sucesso',
        description: 'Fornecedor excluído com sucesso',
        status: 'success',
        duration: 3000,
      });

      fetchSuppliers();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o fornecedor',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const resetForm = () => {
    setEditingSupplier(null);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCnpj('');
    setContactPerson('');
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCNPJ(e.target.value);
    setCnpj(formattedValue);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhone(e.target.value);
    setPhone(formattedValue);
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box
        p={6}
        borderWidth="1px"
        borderRadius="lg"
        borderColor={borderColor}
        bg={bgColor}
      >
        <HStack justify="space-between" mb={4}>
          <Text fontSize="lg" fontWeight="medium">Fornecedores</Text>
          <Button
            colorScheme="blue"
            onClick={() => {
              resetForm();
              onOpen();
            }}
          >
            Adicionar Fornecedor
          </Button>
        </HStack>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>CNPJ</Th>
                <Th>Contato</Th>
                <Th>Email</Th>
                <Th width="100px">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {suppliers.map((supplier) => (
                <Tr key={supplier.id}>
                  <Td>{supplier.name}</Td>
                  <Td>{supplier.cnpj}</Td>
                  <Td>{supplier.contact_person}</Td>
                  <Td>{supplier.email}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Editar fornecedor"
                        icon={<Edit2 size={16} />}
                        colorScheme="blue"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(supplier)}
                      />
                      <IconButton
                        aria-label="Excluir fornecedor"
                        icon={<Trash2 size={16} />}
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(supplier.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nome</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Building2 size={16} />
                    </InputLeftElement>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome da empresa"
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>CNPJ</FormLabel>
                  <Input
                    value={cnpj}
                    onChange={handleCnpjChange}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Mail size={16} />
                    </InputLeftElement>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@empresa.com"
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Telefone</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Phone size={16} />
                    </InputLeftElement>
                    <Input
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Endereço</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <MapPin size={16} />
                    </InputLeftElement>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Endereço completo"
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Pessoa de Contato</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <User size={16} />
                    </InputLeftElement>
                    <Input
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Nome do contato"
                    />
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  isLoading={loading}
                >
                  {editingSupplier ? 'Atualizar' : 'Adicionar'} Fornecedor
                </Button>
              </VStack>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
} 
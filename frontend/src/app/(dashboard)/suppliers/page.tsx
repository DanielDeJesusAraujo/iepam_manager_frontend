'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { SearchIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Supplier } from '@/types/supplier';

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
}

export default function SuppliersPage() {
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleEdit = (supplier: Supplier) => {
    router.push(`/suppliers/edit/${supplier.id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        const token = localStorage.getItem('@ti-assistant:token');
        const response = await fetch(`/api/suppliers/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 429) {
          router.push('/rate-limit');
          return;
        }

        if (response.ok) {
          fetchSuppliers();
        }
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
  };

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Telefone',
    },
    {
      accessorKey: 'address',
      header: 'Endereço',
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <HStack spacing={2}>
          <IconButton
            aria-label="Editar fornecedor"
            icon={<EditIcon />}
            size="sm"
            onClick={() => handleEdit(row.original)}
          />
          <IconButton
            aria-label="Excluir fornecedor"
            icon={<DeleteIcon />}
            size="sm"
            colorScheme="red"
            onClick={() => handleDelete(row.original.id)}
          />
        </HStack>
      ),
    },
  ];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = allSuppliers.filter(supplier =>
        supplier.cnpj.toLowerCase().includes(search.toLowerCase()) ||
        supplier.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers(allSuppliers);
    }
  }, [search, allSuppliers]);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch('/api/suppliers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 429) {
        router.push('/rate-limit');
        return;
      }

      if (!response.ok) throw new Error('Erro ao carregar fornecedores');
      const data = await response.json();
      setAllSuppliers(data);
      setFilteredSuppliers(data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="lg">Fornecedores</Heading>
          <Button colorScheme="blue" onClick={() => router.push('/suppliers/add')}>
            Adicionar Fornecedor
          </Button>
        </Box>

        <Card>
          <CardHeader>
            <Heading size="md">Buscar Fornecedor</Heading>
          </CardHeader>
          <CardBody>
            <InputGroup>
              <Input
                placeholder="Buscar por CNPJ ou nome..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              />
              <InputRightElement>
                <Button
                  colorScheme="blue"
                  size="sm"
                  leftIcon={<SearchIcon />}
                >
                  Buscar
                </Button>
              </InputRightElement>
            </InputGroup>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Lista de Fornecedores</Heading>
          </CardHeader>
          <CardBody>
            <DataTable columns={columns} data={filteredSuppliers} />
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
} 
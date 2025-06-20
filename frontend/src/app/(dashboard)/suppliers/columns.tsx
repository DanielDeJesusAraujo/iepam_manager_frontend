'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Supplier } from '@/types/supplier';
import { useRouter } from 'next/navigation';
import { Edit2 } from 'lucide-react';

const ActionCell = ({ row }: { row: { original: Supplier } }) => {
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => router.push(`/suppliers/${row.original.id}`)}
      >
        <Edit2 size={16} />
      </Button>
      <Button
        variant="destructive"
        onClick={async () => {
          if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
            try {
              const response = await fetch(`/api/suppliers/${row.original.id}`, {
                method: 'DELETE',
              });
              if (!response.ok) throw new Error('Erro ao excluir fornecedor');
              window.location.reload();
            } catch (error) {
              console.error('Erro:', error);
            }
          }
        }}
      >
        Excluir
      </Button>
    </div>
  );
};

export const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'cnpj',
    header: 'CNPJ',
  },
  {
    accessorKey: 'contact_person',
    header: 'Contato',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell row={row} />,
  },
]; 
'use client';

import { Button } from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreateQuoteButton() {
  const router = useRouter();

  return (
    <Button
      leftIcon={<Plus size={16} />}
      colorScheme="blue"
      size="sm"
      onClick={() => router.push('/quotes/new')}
    >
      Nova Cotação
    </Button>
  );
} 
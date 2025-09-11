'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Box, useColorMode } from '@chakra-ui/react';
import { SupplyBatchDetails } from '../../components/SupplyBatchDetails';

export default function SupplyBatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { colorMode } = useColorMode();
  
  const batchId = params.id as string;

  const handleBack = () => {
    router.push('/supplies');
  };

  return (
    <Container maxW="container.xl" py={6}>
      <Box
        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
        backdropFilter="blur(12px)"
        p={6}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        minH="calc(100vh - 200px)"
      >
        <SupplyBatchDetails batchId={batchId} onBack={handleBack} />
      </Box>
    </Container>
  );
} 
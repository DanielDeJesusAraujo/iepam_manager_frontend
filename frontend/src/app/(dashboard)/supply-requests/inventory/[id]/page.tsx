'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Text,
  Spinner,
  VStack,
  Badge,
  Button,
  Flex,
  Image,
  useMediaQuery,
  Container,
  HStack,
  IconButton,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import { fetchInventoryItemById } from '@/utils/apiUtils';
import { InventoryAllocationModal } from '@/components/InventoryAllocationModal';
import { allocateInventoryItem } from '../../utils/requestUtils';

export default function InventoryDetailPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isAllocating, setIsAllocating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('@ti-assistant:token');
        if (!token) throw new Error('Token não encontrado');
        const data = await fetchInventoryItemById(params.id, token);
        setItem(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar item do inventário');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleAllocationSubmit = async (data: { return_date: string; destination: string; notes: string }) => {
    setIsAllocating(true);
    try {
      const token = localStorage.getItem('@ti-assistant:token');
      if (!token) throw new Error('Token não encontrado');
      await allocateInventoryItem(
        item.id,
        data.return_date,
        data.destination,
        data.notes,
        token
      );
      onClose();
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar alocação');
    } finally {
      setIsAllocating(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Container maxW="container.sm" py={8}>
        <Text color="red.500">{error}</Text>
        <Button mt={4} onClick={() => router.back()}>Voltar</Button>
      </Container>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <Container maxW={isMobile ? '100vw' : 'container.md'} py={isMobile ? 9 : 8} px={isMobile ? 0 : 6}>
      <VStack spacing={isMobile ? 4 : 8} align="stretch">
        <HStack spacing={isMobile ? 2 : 4} align="center">
          <IconButton
            aria-label="Voltar"
            icon={<ArrowLeft size={isMobile ? 20 : 22} />}
            variant="ghost"
            onClick={() => router.back()}
            size={isMobile ? 'md' : 'md'}
          />
          <Heading size={isMobile ? 'md' : 'lg'}>Detalhes</Heading>
        </HStack>
        <Flex
          direction={isMobile ? 'column' : 'row'}
          gap={isMobile ? 4 : 8}
          align="flex-start"
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          p={isMobile ? 3 : 8}
          boxShadow="sm"
        >
          <Image
            src={item.image_url || '/placeholder.png'}
            alt={item.name}
            borderRadius="md"
            height={isMobile ? '80%' : '260px'}
            width={isMobile ? '100%' : '260px'}
            maxW={isMobile ? '100%' : '260px'}
            objectFit="cover"
            mb={isMobile ? 3 : 0}
            alignSelf={isMobile ? 'center' : 'flex-start'}
          />
          <VStack spacing={isMobile ? 2 : 4} align="stretch" flex={1} maxW={isMobile ? '100%' : 'none'}>
            <Heading size={isMobile ? 'sm' : 'md'} noOfLines={2} wordBreak="break-word">{item.name}</Heading>
            <Text color="gray.500" fontSize={isMobile ? 'sm' : 'md'} noOfLines={3} wordBreak="break-word">{item.description}</Text>
            <Flex gap={2} align="center" flexWrap="wrap">
              <Badge colorScheme="blue" fontSize={isMobile ? 'xs' : 'md'} hidden={isMobile}>{item.category?.label}</Badge>
              {item.subcategory && <Badge colorScheme="green" fontSize={isMobile ? 'xs' : 'md'} hidden={isMobile}>{item.subcategory.label}</Badge>}
            </Flex>
            <Badge colorScheme={item.status === 'STANDBY' ? 'purple' : 'orange'} fontSize={isMobile ? 'xs' : 'md'}>
              {item.status === 'STANDBY' ? 'Disponível' : 'Em Uso'}
            </Badge>
            <Text fontSize={isMobile ? 'xs' : 'md'}><b>Modelo:</b> {item.model}</Text>
            <Text fontSize={isMobile ? 'xs' : 'md'}><b>Nº Série:</b> {item.serial_number}</Text>
            <Text fontSize={isMobile ? 'xs' : 'md'}><b>Localização:</b> {item.location?.label || '-'}</Text>
            {item.status === 'STANDBY' && (
              <Button colorScheme="purple" mt={isMobile ? 2 : 4} size={isMobile ? 'md' : 'lg'} onClick={onOpen}>
                Alocar Item
              </Button>
            )}
          </VStack>
        </Flex>
        <InventoryAllocationModal
          isOpen={isOpen}
          onClose={onClose}
          item={item}
          onSubmit={handleAllocationSubmit}
          isLoading={isAllocating}
        />
      </VStack>
    </Container>
  );
} 
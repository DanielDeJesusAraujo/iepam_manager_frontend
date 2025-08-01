'use client';

import { Box, Heading, Text, Button, VStack, useColorMode } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

export default function RateLimitPage() {
    const router = useRouter();
    const { colorMode } = useColorMode();

    return (
        <Box
            minH="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
        >
            <VStack spacing={6} p={8} textAlign="center">
                <AlertTriangle size={64} color={colorMode === 'dark' ? '#fff' : '#000'} />
                <Heading size="lg">Muitas requisições</Heading>
                <Text>
                    Você fez muitas requisições em um curto período de tempo.<br />
                    Por favor, aguarde alguns instantes antes de tentar novamente.
                </Text>
                <Button
                    colorScheme="blue"
                    onClick={() => router.push('/')}
                >
                    Voltar para a página inicial
                </Button>
            </VStack>
        </Box>
    );
} 
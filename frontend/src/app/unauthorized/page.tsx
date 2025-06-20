'use client';

import { Box, Heading, Text, Button, VStack, useColorMode } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

export default function UnauthorizedPage() {
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
                <Heading size="lg">Acesso Negado</Heading>
                <Text>
                    Você não tem permissão para acessar esta página. Apenas administradores e gerentes podem acessar o dashboard.
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
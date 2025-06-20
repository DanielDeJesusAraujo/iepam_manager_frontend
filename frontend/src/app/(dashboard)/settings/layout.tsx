'use client'

import { Box, Container, Heading, VStack, useColorModeValue, useColorMode } from '@chakra-ui/react'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { colorMode } = useColorMode()

  return (
    <Box w="full" h="full">
      <VStack
        spacing={4}
        align="stretch"
        bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
        backdropFilter="blur(12px)"
        p={6}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
        h="full"
      >
        {children}
      </VStack>
    </Box>
  )
} 
'use client'

import { Box, Heading } from '@chakra-ui/react'
import ThemeSettings from '../components/ThemeSettings'

export default function ThemePage() {
  return (
    <Box>
      <Heading size="lg" mb={6}>Configurações de Tema</Heading>
      <ThemeSettings />
    </Box>
  )
} 
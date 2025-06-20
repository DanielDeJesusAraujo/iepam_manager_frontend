'use client'

import { Box, Heading } from '@chakra-ui/react'
import SecuritySettings from '../components/SecuritySettings'

export default function SecurityPage() {
  return (
    <Box>
      <Heading size="lg" mb={6}>Configurações de Segurança</Heading>
      <SecuritySettings />
    </Box>
  )
} 
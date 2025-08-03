'use client'

import { Box, Heading } from '@chakra-ui/react'
import EnviromentSettings from '../components/EnviromentSettings'

export default function LocationsPage() {
  return (
    <Box>
      <Heading size="lg" mb={6}>Configurações de Ambientes</Heading>
      <EnviromentSettings />
    </Box>
  )
} 
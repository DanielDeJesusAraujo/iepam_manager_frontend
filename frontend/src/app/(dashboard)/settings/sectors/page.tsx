'use client'

import { Box, Heading } from '@chakra-ui/react'
import SectorSettings from '../components/SectorSettings'

export default function SectorsPage() {
  return (
    <Box>
      <Heading size="lg" mb={6}>Configurações de Setores</Heading>
      <SectorSettings />
    </Box>
  )
} 
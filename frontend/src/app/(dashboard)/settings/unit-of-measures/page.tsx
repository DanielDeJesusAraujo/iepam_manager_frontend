'use client'

import { Box, Heading } from '@chakra-ui/react'
import UnitOfMeasureSettings from '../components/UnitOfMeasureSettings'

export default function UnitOfMeasuresPage() {
  return (
    <Box>
      <Heading size="lg" mb={6}>Configurações de Unidades de Medida</Heading>
      <UnitOfMeasureSettings />
    </Box>
  )
} 
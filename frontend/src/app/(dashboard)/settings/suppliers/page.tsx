'use client'

import { Box, Heading } from '@chakra-ui/react'
import SupplierSettings from '../components/SupplierSettings'

export default function SuppliersPage() {
  return (
    <Box>
      <Heading size="lg" mb={6}>Configurações de Fornecedores</Heading>
      <SupplierSettings />
    </Box>
  )
} 
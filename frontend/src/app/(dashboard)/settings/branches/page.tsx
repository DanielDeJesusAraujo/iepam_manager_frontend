'use client'

import { Box, Heading } from '@chakra-ui/react'
import BranchSettings from '../components/BranchSettings'

export default function BranchesPage() {
  return (
    <Box>
      <Heading size="lg" mb={6}>Configurações de Localizações</Heading>
      <BranchSettings />
    </Box>
  )
} 
'use client'

import { Box, Heading } from '@chakra-ui/react'
import CategorySettings from '../components/CategorySettings'

export default function CategoriesPage() {
  return (
    <Box>
      <Heading size="lg" mb={6}>Configurações de Categorias</Heading>
      <CategorySettings />
    </Box>
  )
} 
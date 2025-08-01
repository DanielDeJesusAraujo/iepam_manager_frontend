'use client'

import { Box, Heading } from '@chakra-ui/react'
import LocationSettings from '../components/LocationSettings'

export default function LocationsPage() {
  return (
    <Box>
      <Heading size="lg" mb={6}>Configurações de Ambientes</Heading>
      <LocationSettings />
    </Box>
  )
} 
'use client'

import { Box, Heading } from '@chakra-ui/react'
import UserManagement from '../components/UserManagement'

export default function UsersPage() {
  return (
    <Box>
      <Heading size="lg" mb={6}>Configurações de Usuários</Heading>
      <UserManagement />
    </Box>
  )
} 
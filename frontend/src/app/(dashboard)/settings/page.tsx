'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useColorMode } from '@chakra-ui/react'

export default function SettingsPage() {
  const router = useRouter()
    const { colorMode } = useColorMode()

    useEffect(() => {
    // Redireciona para a página de tema, que é acessível a todos os usuários
    router.push('/settings/theme')
  }, [router])

  return null
} 
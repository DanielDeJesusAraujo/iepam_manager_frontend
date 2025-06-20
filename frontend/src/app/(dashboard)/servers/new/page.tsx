'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useToast,
  Select,
  useBreakpointValue,
  Icon,
  IconButton,
  HStack,
} from '@chakra-ui/react'
import { ArrowLeft } from 'lucide-react'

interface Location {
  id: string
  name: string
  branch: string
}

interface ServerFormData {
  IP: string
  branch: string
  usuarios: string
  status: string
  location_id: string
}

export default function NewServerPage() {
  const [formData, setFormData] = useState<ServerFormData>({
    IP: '',
    branch: '',
    usuarios: '',
    status: 'Ativo',
    location_id: ''
  })
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem('@ti-assistant:token')
        if (!token) {
          throw new Error('Token não encontrado')
        }

        const response = await fetch('/api/locations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.message || 'Erro ao carregar localizações')
        }

        const data = await response.json()
        setLocations(data)
      } catch (error) {
        console.error('Erro ao carregar localizações:', error)
        toast({
          title: 'Erro',
          description: error instanceof Error ? error.message : 'Erro ao carregar localizações',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }

    fetchLocations()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('@ti-assistant:token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      if (!formData.location_id) {
        throw new Error('Selecione uma localização')
      }

      const response = await fetch('/api/servers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar servidor')
      }

      toast({
        title: 'Sucesso',
        description: 'Servidor criado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      router.push('/servers')
    } catch (error) {
      console.error('Erro ao criar servidor:', error)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar servidor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="container.xl" py={4} mt={[16, 0]}>
      <Box position="relative" mb={6}>
        {isMobile && (
          <IconButton
            aria-label="Voltar"
            icon={<Icon as={ArrowLeft} />}
            variant="ghost"
            position="absolute"
            left={0}
            top={0}
            onClick={() => router.back()}
            zIndex={1}
          />
        )}
        <Heading
          size="lg"
          textAlign={isMobile ? "center" : "left"}
          pl={isMobile ? 10 : 0}
        >
          Adicionar Servidor
        </Heading>
      </Box>

      <Box bg="white" p={6} rounded="lg" shadow="sm">
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Endereço IP</FormLabel>
              <Input
                name="IP"
                value={formData.IP}
                onChange={handleChange}
                placeholder="Ex: 192.168.1.100"
                size={isMobile ? "sm" : "md"}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Filial</FormLabel>
              <Input
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="Ex: Matriz"
                size={isMobile ? "sm" : "md"}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Número de Usuários</FormLabel>
              <Input
                name="usuarios"
                value={formData.usuarios}
                onChange={handleChange}
                placeholder="Ex: 50"
                size={isMobile ? "sm" : "md"}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Localização</FormLabel>
              <Select
                name="location_id"
                value={formData.location_id}
                onChange={handleChange}
                placeholder="Selecione uma localização"
                size={isMobile ? "sm" : "md"}
              >
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {location.branch}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Status</FormLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                size={isMobile ? "sm" : "md"}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Manutenção">Manutenção</option>
              </Select>
            </FormControl>

            <HStack spacing={4} w="full" justify={isMobile ? "space-between" : "flex-end"}>
              {!isMobile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                colorScheme="blue"
                width={isMobile ? "full" : "auto"}
                isLoading={loading}
                loadingText="Criando..."
              >
                Criar Servidor
              </Button>
            </HStack>
          </VStack>
        </form>
      </Box>
    </Container>
  )
} 
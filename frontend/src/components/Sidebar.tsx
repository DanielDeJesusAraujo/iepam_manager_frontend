'use client';

import {
  Box,
  Drawer,
  DrawerContent,
  useDisclosure,
  VStack,
  IconButton,
  HStack,
  Text,
  useBreakpointValue,
  Button,
  Link,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Collapse,
  useColorMode,
} from '@chakra-ui/react'
import { Menu as MenuIcon, X, Home, Printer, Server, Wrench, Box as BoxIcon, Settings, LogOut, Bell, Calendar, BarChart, Package, ShoppingCart, ArrowLeft, Timer, FileText, ChevronDown, ChevronRight } from 'lucide-react'
import NextLink from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FiHome, FiMessageSquare, FiFileText, FiShoppingCart, FiPackage, FiUsers } from 'react-icons/fi'

interface SidebarProps {
  onClose: () => void
  isOpen: boolean
}

const SidebarContent = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter()
  const pathname = usePathname() || ''
  const isMobile = useBreakpointValue({ base: true, md: false })
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const activeBgColor = useColorModeValue('blue.50', 'blue.900')
  const activeColor = useColorModeValue('blue.600', 'blue.200')
  const [user, setUser] = useState<any>({})
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { colorMode } = useColorMode()

  useEffect(() => {
    const storedUser = localStorage.getItem('@ti-assistant:user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setUserRole(JSON.parse(storedUser).role)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('@ti-assistant:token')
    localStorage.removeItem('@ti-assistant:user')
    router.push('/login')
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    if (isMobile) {
      onClose()
    }
  }

  const isEmployee = user && user.role === 'EMPLOYEE'
  const isAdmin = user && user.role === 'ADMIN'

  const menuItems = [
    ...(user && ['ADMIN', 'MANAGER'].includes(user.role) ? [{ icon: Home, label: 'Dashboard', href: '/dashboard' }] : []),
    ...(user && ['ADMIN', 'MANAGER'].includes(user.role) ? [{ icon: Wrench, label: 'OS Externas', href: '/orders' }] : []),
    ...(user && user.role === 'MANAGER' ? [{ icon: Package, label: 'Inventário', href: '/inventory' }] : []),
    ...(user && ['ADMIN', 'MANAGER'].includes(user.role) ? [{ icon: Package, label: 'Suprimentos', href: '/supplies' }] : []),
    ...(user && ['ADMIN', 'MANAGER'].includes(user.role) ? [{ icon: Package, label: 'Requisições', href: '/supply-requests/admin' }] : []),
    ...(user && ['EMPLOYEE', 'ORGANIZER'].includes(user.role) ? [{ icon: ShoppingCart, label: 'Requisições', href: '/supply-requests' }] : []),
    { icon: FileText, label: 'Cotações', href: '/quotes' },
    ...(user && ['ADMIN', 'MANAGER', 'SUPPORT'].includes(user.role) ? [{ icon: Bell, label: 'Alertas', href: '/alerts' }] : []),
    { icon: Calendar, label: 'Eventos', href: '/events' },
    ...(user && ['ADMIN', 'MANAGER'].includes(user.role) ? [{ icon: BarChart, label: 'Estatísticas', href: '/statistics' }] : []),
  ]

  const settingsItems = [
    { label: 'Tema', href: '/settings/theme' },
    { label: 'Segurança', href: '/settings/security' },
    ...(!isEmployee ? [{ label: 'Unidades de Medida', href: '/settings/unit-of-measures' }] : []),
    ...(!isEmployee ? [{ label: 'Categorias', href: '/settings/categories' }] : []),
    ...(!isEmployee ? [{ label: 'Localizações', href: '/settings/branches' }] : []),
    ...(!isEmployee ? [{ label: 'Locais', href: '/settings/locations' }] : []),
    ...(!isEmployee ? [{ label: 'Fornecedores', href: '/settings/suppliers' }] : []),
    ...(isAdmin ? [{ label: 'Usuários', href: '/settings/users' }] : []),
  ]

  return (
    <VStack
      h="full"
      w="full"
      spacing={4}
      align="stretch"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      p={4}
    >
      <HStack justify="space-between" mb={4}>
        <Text fontSize="xl" fontWeight="bold">TI Assistant</Text>
        {isMobile && (
          <IconButton
            aria-label="Fechar menu"
            icon={<X />}
            variant="ghost"
            onClick={onClose}
          />
        )}
      </HStack>

      <VStack spacing={2} align="stretch" flex={1} overflow="hidden">
        {menuItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            w="full"
            justifyContent="flex-start"
            leftIcon={<item.icon size={20} />}
            size={isMobile ? "sm" : "md"}
            bg={pathname === item.href ? activeBgColor : 'transparent'}
            color={pathname === item.href ? activeColor : 'inherit'}
            _hover={{
              bg: pathname === item.href ? activeBgColor : 'gray.100',
            }}
            onClick={() => handleNavigation(item.href)}
          >
            {item.label}
          </Button>
        ))}

        <Button
          variant="ghost"
          w="full"
          justifyContent="flex-start"
          leftIcon={<Settings size={20} />}
          rightIcon={isSettingsOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          size={isMobile ? "sm" : "md"}
          bg={pathname.startsWith('/settings') ? activeBgColor : 'transparent'}
          color={pathname.startsWith('/settings') ? activeColor : 'inherit'}
          _hover={{
            bg: pathname.startsWith('/settings') ? activeBgColor : 'gray.100',
          }}
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        >
          Configurações
        </Button>

        <Collapse in={isSettingsOpen} style={{ width: '100%' }}>
          <Box
            maxH="200px"
            overflowY="auto"
            css={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                width: '6px',
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                borderRadius: '24px',
              },
            }}
          >
            <VStack spacing={1} align="stretch" pl={4}>
              {settingsItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  w="full"
                  justifyContent="flex-start"
                  size={isMobile ? "sm" : "md"}
                  bg={pathname === item.href ? activeBgColor : 'transparent'}
                  color={pathname === item.href ? activeColor : 'inherit'}
                  _hover={{
                    bg: pathname === item.href ? activeBgColor : 'gray.100',
                  }}
                  onClick={() => handleNavigation(item.href)}
                >
                  {item.label}
                </Button>
              ))}
            </VStack>
          </Box>
        </Collapse>
      </VStack>

      <Box mt="auto">
        <Button
          variant="ghost"
          w="full"
          justifyContent="flex-start"
          leftIcon={<LogOut size={20} />}
          colorScheme="red"
          onClick={handleLogout}
          size={isMobile ? "sm" : "md"}
        >
          Sair
        </Button>
      </Box>
    </VStack>
  )
}

const MobileNav = ({ onOpen }: { onOpen: () => void }) => {
  const router = useRouter()
  const pathname = usePathname() || ''
  const [user, setUser] = useState<any>({})

  useEffect(() => {
    const storedUser = localStorage.getItem('@ti-assistant:user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleHistoryClick = () => {
    if (['ADMIN', 'MANAGER', 'ORGANIZER'].includes(user.role)) {
      router.push('/supply-requests/history')
    } else {
      router.push('/supply-requests/my-requests')
    }
  }

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={20}
      bg={useColorModeValue('white', 'gray.800')}
      borderBottom="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      p={2}
    >
      <HStack justify="space-between">
        <HStack spacing={2}>
          <IconButton
            aria-label="Abrir menu"
            icon={<MenuIcon size={20} />}
            variant="ghost"
            onClick={onOpen}
            sx={{
              '& svg': {
                stroke: 'currentColor',
              }
            }}
          />
        </HStack>
      </HStack>
    </Box>
  )
}

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, md: false })

  return (
    <Box minH="100vh">
      {isMobile && <MobileNav onOpen={onOpen} />}

      {isMobile ? (
        <Drawer
          autoFocus={false}
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          returnFocusOnClose={false}
          onOverlayClick={onClose}
          size="full"
        >
          <DrawerContent>
            <SidebarContent onClose={onClose} />
          </DrawerContent>
        </Drawer>
      ) : (
        <Box
          position="fixed"
          left={0}
          top={0}
          h="100vh"
          w="250px"
        >
          <SidebarContent onClose={onClose} />
        </Box>
      )}

      <Box
        ml={isMobile ? 0 : 250}
        pt={isMobile ? 12 : 0}
        p={4}
      >
        {children}
      </Box>
    </Box>
  )
} 
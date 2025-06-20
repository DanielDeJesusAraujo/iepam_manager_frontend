'use client'

import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/contexts/AuthContext'

const theme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
        backgroundImage: props.colorMode === 'dark'
          ? 'url("/gb_ilustration/coolbackgrounds-fractalize-spectrum_dark.png")'
          : 'url("/gb_ilustration/coolbackgrounds-topography-hyphy_ligth.svg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
      },
    }),
  },
  components: {
    Spinner: {
      baseStyle: {
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: 'full',
        borderColor: 'transparent',
        borderTopColor: 'blue.500',
        animation: 'spin 0.45s linear infinite',
      },
    },
    Box: {
      baseStyle: (props: any) => ({
        bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
      }),
    },
    Text: {
      baseStyle: (props: any) => ({
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      }),
    },
    Heading: {
      baseStyle: (props: any) => ({
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      }),
    },
    Badge: {
      baseStyle: (props: any) => ({
        bg: props.colorMode === 'dark' ? 'gray.600' : 'gray.100',
      }),
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <CacheProvider>
          <ChakraProvider theme={theme}>
            {children}
          </ChakraProvider>
        </CacheProvider>
      </AuthProvider>
    </SessionProvider>
  )
} 
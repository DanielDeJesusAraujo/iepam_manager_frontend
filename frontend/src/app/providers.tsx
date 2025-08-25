'use client'

import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { GlobalProvider } from '@/contexts/GlobalContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Avoid double patching during React strict mode or re-mounts
    if ((window as any).__fetchPatched) return
    (window as any).__fetchPatched = true

    const originalFetch = window.fetch.bind(window)
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const response = await originalFetch(input, init)
        if (response.status === 401) {
          try {
            // Best-effort server-side logout to clear cookies
            originalFetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
          } catch {}

          // Clear client-side session
          try {
            const keys = Object.keys(localStorage)
            for (const key of keys) {
              if (key.startsWith('@ti-assistant:')) localStorage.removeItem(key)
            }
          } catch {}

          // Expire non-HttpOnly app cookies in the browser
          try {
            const parts = document.cookie.split(';')
            for (const part of parts) {
              const name = part.split('=')[0]?.trim()
              if (!name) continue
              if (name.startsWith('@ti-assistant:')) {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
              }
            }
          } catch {}

          // Redirect to login
          router.replace('/')
        }
        return response
      } catch (err) {
        throw err
      }
    }
  }, [router])

  return (
    <SessionProvider>
      <AuthProvider>
        <GlobalProvider>
          <ChakraProvider theme={theme}>
            {children}
          </ChakraProvider>
        </GlobalProvider>
      </AuthProvider>
    </SessionProvider>
  )
} 
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { performLogout } from '@/utils/logout'

/**
 * Hook personalizado para logout
 * Fornece uma função de logout que pode ser usada em componentes
 */
export function useLogout() {
  const router = useRouter()

  const logout = useCallback(async () => {
    console.log('[useLogout] Iniciando logout manual')
    
    try {
      // Chamar API para limpar cookies HTTP-only
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
    
    // Limpar localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('@ti-assistant:')) {
        localStorage.removeItem(key)
      }
    })
    
    // Limpar outros itens específicos
    localStorage.removeItem('filters')
    localStorage.removeItem('searchQuery')
    localStorage.removeItem('selectedUnit')
    localStorage.removeItem('selectedSector')
    localStorage.removeItem('selectedEnvironment')
    localStorage.removeItem('selectedBranch')
    localStorage.removeItem('selectedCategory')
    
    // Expirar cookies não-HttpOnly
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
    
    // Redirecionar para login
    router.push('/')
  }, [router])

  return { logout }
}

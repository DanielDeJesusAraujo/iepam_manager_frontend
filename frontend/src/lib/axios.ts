import baseUrl from '@/utils/enviroments'
import axios from 'axios'

export const api = axios.create({
    baseURL: baseUrl,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('@ti-assistant:token')
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            try {
                // Limpar cookies HTTP-only
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            } catch (logoutError) {
                console.error('Erro ao limpar cookies no logout:', logoutError)
            }
            
            localStorage.removeItem('@ti-assistant:token')
            localStorage.removeItem('@ti-assistant:user')
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
) 
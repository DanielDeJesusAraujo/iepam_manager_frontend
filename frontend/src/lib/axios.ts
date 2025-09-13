import baseUrl from '@/utils/enviroments'
import axios from 'axios'
import { performLogout } from '@/utils/logout'

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
            // Não fazer logout automático se estamos na página de login ou fazendo requisição de sessão
            const isLoginPage = window.location.pathname === '/'
            const isSessionRequest = error.config?.url?.includes('/api/auth/session')
            
            if (isLoginPage || isSessionRequest) {
                console.log('[Axios Interceptor] 401 na página de login ou requisição de sessão, ignorando logout automático');
                return Promise.reject(error)
            }
            
            console.log('[Axios Interceptor] 401 detectado, fazendo logout automático');
            await performLogout()
        }
        return Promise.reject(error)
    }
) 
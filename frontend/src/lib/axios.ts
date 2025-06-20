import axios from 'axios'

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
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
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('@ti-assistant:token')
            localStorage.removeItem('@ti-assistant:user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
) 
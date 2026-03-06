import axios from 'axios'
import { useAuthStore } from '@stores/auth'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb)
}

const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const originalRequest = error.config

    if (!error.response) {
      return Promise.reject(new Error('网络连接失败，请检查网络设置'))
    }

    const { status, data } = error.response

    if (status === 401) {
      if (!originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(request(originalRequest))
            })
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshToken = localStorage.getItem('refreshToken')
          if (!refreshToken) {
            throw new Error('没有刷新令牌')
          }

          const response = await axios.post('/api/auth/refresh', {
            refreshToken,
          })

          const { token, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('token', token)
          localStorage.setItem('refreshToken', newRefreshToken)

          onTokenRefreshed(token)
          originalRequest.headers.Authorization = `Bearer ${token}`

          return request(originalRequest)
        } catch (refreshError) {
          const authStore = useAuthStore()
          authStore.handleLogout()
          window.location.href = '/login'
          return Promise.reject(new Error('登录已过期，请重新登录'))
        } finally {
          isRefreshing = false
        }
      }
    }

    if (status === 403) {
      return Promise.reject(new Error('没有权限执行此操作'))
    }

    if (status === 404) {
      return Promise.reject(new Error('请求的资源不存在'))
    }

    if (status >= 500) {
      return Promise.reject(new Error('服务器内部错误，请稍后重试'))
    }

    const errorMessage = data?.error || data?.message || `请求失败 (${status})`
    return Promise.reject(new Error(errorMessage))
  }
)

export default request

import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const refreshToken = useAuthStore.getState().refreshToken
        if (refreshToken) {
          const response = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          )

          const { accessToken, refreshToken: newRefreshToken } = response.data.data

          // Update tokens in store
          useAuthStore.getState().refreshAccessToken()

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout()
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Utility functions for common API calls
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),

  logout: () =>
    api.post('/auth/logout'),

  getProfile: () =>
    api.get('/auth/me'),

  updateProfile: (data: any) =>
    api.put('/auth/profile', data),

  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),

  requestPasswordReset: (email: string) =>
    api.post('/auth/request-password-reset', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
}

export const applicationApi = {
  getApplications: (page = 1, limit = 10) =>
    api.get('/applications', { params: { page, limit } }),

  getApplication: (id: string) =>
    api.get(`/applications/${id}`),

  createApplication: (data: any) =>
    api.post('/applications', data),

  updateApplication: (id: string, data: any) =>
    api.put(`/applications/${id}`, data),

  deleteApplication: (id: string) =>
    api.delete(`/applications/${id}`),

  cloneApplication: (id: string, newName: string) =>
    api.post(`/applications/${id}/clone`, { newName }),

  getApplicationStats: () =>
    api.get('/applications/stats'),

  getDeployments: (applicationId: string) =>
    api.get(`/applications/${applicationId}/deployments`),

  deployApplication: (applicationId: string, environment: string, config?: any) =>
    api.post(`/applications/${applicationId}/deploy`, { environment, config }),
}

export const schemaApi = {
  getSchemas: (applicationId: string) =>
    api.get(`/schemas/application/${applicationId}`),

  getLatestSchema: (applicationId: string) =>
    api.get(`/schemas/application/${applicationId}/latest`),

  createSchema: (data: any) =>
    api.post('/schemas', data),

  updateSchemaMigrationStatus: (id: string, status: string) =>
    api.patch(`/schemas/${id}/migration-status`, { migrationStatus: status }),

  deleteSchema: (id: string) =>
    api.delete(`/schemas/${id}`),
}

export const apiEndpointApi = {
  getEndpoints: (applicationId: string) =>
    api.get(`/api/endpoints/application/${applicationId}`),

  getEndpoint: (id: string) =>
    api.get(`/api/endpoints/${id}`),

  createEndpoint: (data: any) =>
    api.post('/api/endpoints', data),

  updateEndpoint: (id: string, data: any) =>
    api.put(`/api/endpoints/${id}`, data),

  deleteEndpoint: (id: string) =>
    api.delete(`/api/endpoints/${id}`),

  getApiDocs: (applicationId: string) =>
    api.get(`/api/docs/application/${applicationId}`),
}

export const deploymentApi = {
  getDeployments: (page = 1, limit = 10, environment?: string) =>
    api.get('/deployments', { params: { page, limit, environment } }),

  getApplicationDeployments: (applicationId: string) =>
    api.get(`/deployments/application/${applicationId}`),

  getDeployment: (id: string) =>
    api.get(`/deployments/${id}`),

  createDeployment: (data: any) =>
    api.post('/deployments', data),

  stopDeployment: (id: string) =>
    api.post(`/deployments/${id}/stop`),

  getDeploymentLogs: (id: string) =>
    api.get(`/deployments/${id}/logs`),
}

export default api
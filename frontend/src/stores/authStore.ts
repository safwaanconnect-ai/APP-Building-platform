import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/utils/api'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  name: string
  subscriptionTier: 'free' | 'pro' | 'enterprise'
  emailVerified: boolean
  lastLogin?: string
  createdAt: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  initializeAuth: () => void
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshAccessToken: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: true,
      isAuthenticated: false,

      // Actions
      initializeAuth: async () => {
        const { accessToken, refreshToken } = get()

        if (!accessToken || !refreshToken) {
          set({ isLoading: false })
          return
        }

        try {
          // Set the access token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

          // Verify the token is still valid by fetching user info
          const response = await api.get('/auth/me')

          set({
            user: response.data.data,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          // Token is invalid, try to refresh
          try {
            await get().refreshAccessToken()
          } catch (refreshError) {
            // Refresh failed, clear auth state
            get().logout()
          }
        }
      },

      login: async (email: string, password: string) => {
        try {
          const response = await api.post('/auth/login', { email, password })
          const { user, accessToken, refreshToken } = response.data.data

          // Set the access token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false
          })

          toast.success('Login successful!')
        } catch (error: any) {
          const message = error.response?.data?.error || 'Login failed'
          toast.error(message)
          throw new Error(message)
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          const response = await api.post('/auth/register', { name, email, password })
          const { user, accessToken, refreshToken } = response.data.data

          // Set the access token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false
          })

          toast.success('Registration successful! Please check your email for verification.')
        } catch (error: any) {
          const message = error.response?.data?.error || 'Registration failed'
          toast.error(message)
          throw new Error(message)
        }
      },

      logout: () => {
        // Clear the access token from API headers
        delete api.defaults.headers.common['Authorization']

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false
        })

        toast.success('Logged out successfully')
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        try {
          const response = await api.post('/auth/refresh', { refreshToken })
          const { user, accessToken, refreshToken: newRefreshToken } = response.data.data

          // Set the new access token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

          set({
            user,
            accessToken,
            refreshToken: newRefreshToken || refreshToken
          })
        } catch (error) {
          throw new Error('Token refresh failed')
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const response = await api.put('/auth/profile', data)
          const updatedUser = response.data.data

          set(state => ({
            user: { ...state.user!, ...updatedUser }
          }))

          toast.success('Profile updated successfully!')
        } catch (error: any) {
          const message = error.response?.data?.error || 'Profile update failed'
          toast.error(message)
          throw new Error(message)
        }
      },

      verifyEmail: async (token: string) => {
        try {
          await api.post('/auth/verify-email', { token })
          toast.success('Email verified successfully!')
        } catch (error: any) {
          const message = error.response?.data?.error || 'Email verification failed'
          toast.error(message)
          throw new Error(message)
        }
      },

      requestPasswordReset: async (email: string) => {
        try {
          await api.post('/auth/request-password-reset', { email })
          toast.success('If an account with this email exists, a password reset link has been sent')
        } catch (error: any) {
          const message = error.response?.data?.error || 'Password reset request failed'
          toast.error(message)
          throw new Error(message)
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        try {
          await api.post('/auth/reset-password', { token, newPassword })
          toast.success('Password reset successfully!')
        } catch (error: any) {
          const message = error.response?.data?.error || 'Password reset failed'
          toast.error(message)
          throw new Error(message)
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
)
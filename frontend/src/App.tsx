import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

// Layout Components
import Layout from '@/components/Layout'
import AuthLayout from '@/components/AuthLayout'

// Page Components
import Dashboard from '@/pages/Dashboard'
import Applications from '@/pages/Applications'
import ApplicationDetail from '@/pages/ApplicationDetail'
import SchemaDesigner from '@/pages/SchemaDesigner'
import ApiBuilder from '@/pages/ApiBuilder'
import PageBuilder from '@/pages/PageBuilder'
import Deployments from '@/pages/Deployments'
import Analytics from '@/pages/Analytics'
import Settings from '@/pages/Settings'

// Auth Pages
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import VerifyEmail from '@/pages/auth/VerifyEmail'

// Landing Page
import Landing from '@/pages/Landing'

function App() {
  const { initializeAuth, user, isLoading } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="verify-email" element={<VerifyEmail />} />
        </Route>

        {/* Protected Routes */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="applications" element={<Applications />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
          <Route path="applications/:id/schema" element={<SchemaDesigner />} />
          <Route path="applications/:id/api" element={<ApiBuilder />} />
          <Route path="applications/:id/pages" element={<PageBuilder />} />
          <Route path="applications/:id/deploy" element={<Deployments />} />
          <Route path="applications/:id/analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-8">Page not found</p>
              <a href="/" className="btn-primary">
                Go home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </div>
  )
}

export default App
import { ReactNode } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  CubeIcon,
  ServerIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PlusCircleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/stores/authStore'
import { cn, formatDateRelative } from '@/utils/helpers'

interface LayoutProps {
  children?: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/app', icon: HomeIcon },
  { name: 'Applications', href: '/app/applications', icon: CubeIcon },
  { name: 'Deployments', href: '/app/deployments', icon: ServerIcon },
  { name: 'Analytics', href: '/app/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/app/settings', icon: Cog6ToothIcon },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:block lg:static lg:inset-0">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <Link to="/app" className="text-xl font-bold text-gray-900">
              SaaS Builder
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <UserCircleIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              {location.pathname === '/app/applications' && (
                <Link
                  to="/app/applications/new"
                  className="btn-primary btn-sm flex items-center space-x-2"
                >
                  <PlusCircleIcon className="h-4 w-4" />
                  <span>New App</span>
                </Link>
              )}

              {/* User Info */}
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {user?.subscriptionTier}
                </span>
                {user?.lastLogin && (
                  <span className="text-xs text-gray-500">
                    Last seen {formatDateRelative(user.lastLogin)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          {children || <Outlet />}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-40 flex">
          <div className="relative flex w-full max-w-xs flex-col bg-white">
            {/* Mobile menu content would go here */}
          </div>
        </div>
      </div>
    </div>
  )
}
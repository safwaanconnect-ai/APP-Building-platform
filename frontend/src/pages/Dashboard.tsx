import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import {
  CubeIcon,
  ServerIcon,
  ChartBarIcon,
  PlusCircleIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { applicationApi } from '@/utils/api'
import { formatDateRelative, getSubscriptionColor } from '@/utils/helpers'
import { useAuthStore } from '@/stores/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()

  const { data: stats, isLoading: statsLoading } = useQuery(
    'application-stats',
    applicationApi.getApplicationStats
  )

  const { data: applicationsData, isLoading: appsLoading } = useQuery(
    ['applications', 1, 5], // page 1, limit 5
    () => applicationApi.getApplications(1, 5)
  )

  const statsData = stats?.data || { total: 0, byStatus: {} }
  const applications = applicationsData?.data.applications || []

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here's what's happening with your applications today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CubeIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Applications
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? '...' : statsData.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ServerIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Deployed Apps
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? '...' : statsData.byStatus.production || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    In Development
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? '...' : statsData.byStatus.development || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Subscription
                  </dt>
                  <dd>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionColor(user?.subscriptionTier || 'free')}`}>
                      {user?.subscriptionTier || 'Free'}
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
          <Link
            to="/app/applications"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all
          </Link>
        </div>

        {appsLoading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="card-content">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : applications.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((app: any) => (
              <div key={app.id} className="card hover:shadow-md transition-shadow">
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {app.name}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {app.description || 'No description provided'}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{app._count?.databaseSchemas || 0} tables</span>
                      <span>{app._count?.apiEndpoints || 0} APIs</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDateRelative(app.updatedAt)}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/app/applications/${app.id}`}
                      className="btn-outline btn-sm w-full"
                    >
                      Open Application
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <div className="text-center py-12">
              <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first application.
              </p>
              <div className="mt-6">
                <Link
                  to="/app/applications/new"
                  className="btn-primary"
                >
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  New Application
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {statsData.total === 0 && (
        <div className="mt-8">
          <div className="card bg-primary-50 border-primary-200">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <SparklesIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 flex-1">
                  <h3 className="text-lg font-medium text-primary-900">
                    Ready to build your first application?
                  </h3>
                  <p className="mt-1 text-sm text-primary-700">
                    Start building your SaaS application with our visual tools.
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/app/applications/new"
                      className="btn-primary bg-primary-600 hover:bg-primary-700"
                    >
                      Create Your First App
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getStatusColor(status: string) {
  const colors = {
    development: 'bg-blue-100 text-blue-800',
    staging: 'bg-yellow-100 text-yellow-800',
    production: 'bg-green-100 text-green-800',
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

function SparklesIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  )
}
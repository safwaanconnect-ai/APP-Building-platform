import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { applicationApi } from '@/utils/api'
import { formatDateRelative, getStatusColor } from '@/utils/helpers'

export default function Applications() {
  const { data: applicationsData, isLoading } = useQuery(
    'applications',
    () => applicationApi.getApplications()
  )

  const applications = applicationsData?.data.applications || []

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card">
                <div className="card-content">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your applications and their configurations.
          </p>
        </div>
        <Link
          to="/app/applications/new"
          className="btn-primary flex items-center space-x-2"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>New Application</span>
        </Link>
      </div>

      {/* Applications Grid */}
      {applications.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((app: any) => (
            <div key={app.id} className="card hover:shadow-md transition-shadow">
              <div className="card-content">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {app.name}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {app.description || 'No description provided'}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span>{app._count?.databaseSchemas || 0} tables</span>
                    <span>{app._count?.apiEndpoints || 0} APIs</span>
                  </div>
                  <span>{formatDateRelative(app.updatedAt)}</span>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/app/applications/${app.id}`}
                    className="btn-outline btn-sm flex-1 flex items-center justify-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Open
                  </Link>
                  <button className="btn-outline btn-sm p-2">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="btn-outline btn-sm p-2 text-red-600 border-red-300 hover:bg-red-50">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
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
      )}
    </div>
  )
}
import { useParams, Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          to="/app/applications"
          className="btn-outline btn-sm inline-flex items-center"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Applications
        </Link>
      </div>

      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Application Details
        </h1>
        <p className="text-gray-600">
          Application ID: {id}
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Link to={`/app/applications/${id}/schema`} className="card p-6 hover:shadow-md">
            <h3 className="text-lg font-medium mb-2">Database Schema</h3>
            <p className="text-gray-600">Design your database schema</p>
          </Link>
          <Link to={`/app/applications/${id}/api`} className="card p-6 hover:shadow-md">
            <h3 className="text-lg font-medium mb-2">API Builder</h3>
            <p className="text-gray-600">Create RESTful endpoints</p>
          </Link>
          <Link to={`/app/applications/${id}/pages`} className="card p-6 hover:shadow-md">
            <h3 className="text-lg font-medium mb-2">Page Builder</h3>
            <p className="text-gray-600">Build user interfaces</p>
          </Link>
          <Link to={`/app/applications/${id}/deploy`} className="card p-6 hover:shadow-md">
            <h3 className="text-lg font-medium mb-2">Deployments</h3>
            <p className="text-gray-600">Manage deployments</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
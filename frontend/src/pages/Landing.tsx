import { Link } from 'react-router-dom'
import {
  SparklesIcon,
  CubeIcon,
  ServerIcon,
  LockClosedIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="text-2xl font-bold text-gray-900">SaaS Builder</span>
            </Link>
          </div>
          <div className="flex lg:flex-1 lg:justify-end">
            <Link to="/auth/login" className="btn-outline">
              Sign in
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative isolate pt-14">
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Build Applications
                <span className="text-primary-600"> Without Code</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Design databases, create APIs, build interfaces, and deploy to production.
                Transform your ideas into fully functional SaaS applications in minutes, not months.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link to="/auth/register" className="btn-primary btn-lg">
                  Get started
                  <ArrowRightIcon className="ml-2 h-5 w-5" aria-hidden="true" />
                </Link>
                <Link to="/auth/login" className="btn-outline btn-lg">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to build SaaS applications
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <CubeIcon className="h-10 w-10 text-primary-600" />
                  Visual Database Designer
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Design complex database schemas with our intuitive drag-and-drop interface.
                    Create tables, define relationships, and manage migrations with ease.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <ServerIcon className="h-10 w-10 text-primary-600" />
                  API Builder
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Generate RESTful APIs automatically from your database schema.
                    Add custom business logic, authentication, and rate limiting.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <SparklesIcon className="h-10 w-10 text-primary-600" />
                  Page Builder
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Build responsive web interfaces with our visual page builder.
                    Drag and drop components, customize styling, and bind data seamlessly.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <LockClosedIcon className="h-10 w-10 text-primary-600" />
                  Authentication & Security
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Built-in user authentication, role-based access control, and security features.
                    Protect your applications with enterprise-grade security.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <ChartBarIcon className="h-10 w-10 text-primary-600" />
                  Analytics & Monitoring
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Monitor application performance, track user analytics, and gain insights.
                    Built-in analytics and error tracking for your applications.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Cog6ToothIcon className="h-10 w-10 text-primary-600" />
                  One-Click Deployment
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Deploy your applications to production with a single click.
                    Automatic SSL, custom domains, and scalable infrastructure.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Choose the right plan for you
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10">
              <div>
                <h3 className="text-lg font-semibold leading-8 text-gray-900">Free</h3>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  Perfect for trying out the platform
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">$0</span>
                  <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  <li className="flex gap-x-3">
                    <span>1 application</span>
                  </li>
                  <li className="flex gap-x-3">
                    <span>3 database tables</span>
                  </li>
                  <li className="flex gap-x-3">
                    <span>500 API calls/day</span>
                  </li>
                  <li className="flex gap-x-3">
                    <span>Community support</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-2 ring-primary-600 xl:p-10">
              <div>
                <h3 className="text-lg font-semibold leading-8 text-primary-600">Pro</h3>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  For professional developers
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">$49</span>
                  <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  <li className="flex gap-x-3">
                    <span>5 applications</span>
                  </li>
                  <li className="flex gap-x-3">
                    <span>20 database tables</span>
                  </li>
                  <li className="flex gap-x-3">
                    <span>10,000 API calls/day</span>
                  </li>
                  <li className="flex gap-x-3">
                    <span>Custom domains</span>
                  </li>
                  <li className="flex gap-x-3">
                    <span>Email support</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10">
              <div>
                <h3 className="text-lg font-semibold leading-8 text-gray-900">Enterprise</h3>
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  For large teams and organizations
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">$199</span>
                  <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  <li className="flex gap-x-3">
                    <span>Unlimited applications</span>
                  </li>
                  <li className="flex gap-x-3">
                    <span>Unlimited database tables</span>
                  </li>
                  <li className="flex gap-x-3">
                    <span>100,000 API calls/day</span>
                  </li>
                  <li className="flex gap-x-3">
                    <span>Priority support</span>
                  </li>
                  <li className="flex gap-x-3">
                    <span>Advanced analytics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to start building?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              Join thousands of developers building amazing applications with our platform.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/auth/register" className="btn bg-white text-primary-600 hover:bg-gray-50">
                Get started today
              </Link>
              <Link to="/auth/login" className="btn-outline text-white border-white hover:bg-white hover:text-primary-600">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
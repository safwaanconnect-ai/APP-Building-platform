// User Types
export interface User {
  id: string
  email: string
  name: string
  subscriptionTier: 'free' | 'pro' | 'enterprise'
  stripeCustomerId?: string
  emailVerified: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

// Application Types
export interface Application {
  id: string
  userId: string
  name: string
  slug: string
  description?: string
  status: 'development' | 'staging' | 'production'
  domain?: string
  databaseUrl?: string
  deploymentConfig?: Record<string, any>
  createdAt: string
  updatedAt: string
  _count?: {
    databaseSchemas: number
    apiEndpoints: number
  }
}

export interface ApplicationStats {
  total: number
  byStatus: Record<string, number>
}

// Database Schema Types
export interface DatabaseSchema {
  id: string
  applicationId: string
  schemaDefinition: Record<string, any>
  version: number
  migrationStatus: 'pending' | 'in_progress' | 'completed' | 'failed'
  createdAt: string
  updatedAt: string
}

export interface TableField {
  name: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'text'
  required: boolean
  unique: boolean
  defaultValue?: any
  description?: string
}

export interface TableDefinition {
  name: string
  fields: TableField[]
  relationships: Relationship[]
  indexes?: Index[]
}

export interface Relationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  sourceTable: string
  sourceField: string
  targetTable: string
  targetField: string
}

export interface Index {
  fields: string[]
  unique: boolean
  name?: string
}

// API Endpoint Types
export interface ApiEndpoint {
  id: string
  applicationId: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  schema: {
    request?: Record<string, any>
    response?: Record<string, any>
    parameters?: Record<string, any>
  }
  authenticationRequired: boolean
  rateLimit?: number
  createdAt: string
  updatedAt: string
}

// Deployment Types
export interface Deployment {
  id: string
  applicationId: string
  environment: 'development' | 'staging' | 'production'
  status: 'pending' | 'running' | 'failed' | 'stopped'
  url?: string
  logs?: string
  createdAt: string
  updatedAt: string
  application?: {
    id: string
    name: string
    slug: string
  }
}

// UI Component Types
export interface UIComponent {
  id: string
  type: string
  name: string
  category: string
  icon: string
  defaultProps: Record<string, any>
  configSchema?: Record<string, any>
  canHaveChildren: boolean
  children?: UIComponent[]
}

export interface PageComponent {
  id: string
  type: string
  props: Record<string, any>
  children: PageComponent[]
  style?: Record<string, any>
  position?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface PageDefinition {
  id: string
  name: string
  path: string
  components: PageComponent[]
  style?: Record<string, any>
  metadata?: Record<string, any>
}

// Analytics Types
export interface UsageMetrics {
  id: string
  applicationId: string
  metricType: 'api_calls' | 'storage' | 'bandwidth' | 'users'
  value: number
  timestamp: string
}

export interface AnalyticsData {
  apiCalls: number[]
  storage: number
  bandwidth: number
  activeUsers: number
  dateRange: {
    start: string
    end: string
  }
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: Array<{ label: string; value: any }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Template Types
export interface ApplicationTemplate {
  id: string
  name: string
  description: string
  category: string
  thumbnail?: string
  schemas: DatabaseSchema[]
  endpoints: ApiEndpoint[]
  pages: PageDefinition[]
  config: Record<string, any>
}

// Environment Variables
export interface EnvironmentConfig {
  development: Record<string, string>
  staging: Record<string, string>
  production: Record<string, string>
}
// Application Configuration Types
export interface TableDefinition {
  name: string
  fields: TableField[]
  relationships: Relationship[]
  indexes?: Index[]
}

export interface TableField {
  name: string
  type: 'string' | 'text' | 'number' | 'boolean' | 'date' | 'json' | 'email' | 'url'
  required: boolean
  unique: boolean
  defaultValue?: any
  description?: string
  validation?: ValidationRule[]
}

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'email' | 'url'
  value?: string | number
  message?: string
}

export interface Relationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  sourceTable: string
  sourceField: string
  targetTable: string
  targetField: string
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT'
}

export interface Index {
  fields: string[]
  unique: boolean
  name?: string
}

// API Endpoint Configuration
export interface ApiEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  description?: string
  table?: string
  operation?: 'create' | 'read' | 'update' | 'delete' | 'list' | 'custom'
  customLogic?: string
  authentication: boolean
  authorization?: AuthorizationRule[]
  rateLimit?: number
  validation?: ValidationSchema
}

export interface AuthorizationRule {
  role?: string
  permission?: string
  fieldLevel?: string
}

export interface ValidationSchema {
  request?: Record<string, any>
  response?: Record<string, any>
}

// Page and UI Configuration
export interface PageDefinition {
  name: string
  path: string
  title: string
  description?: string
  components: UIComponent[]
  layout?: LayoutConfig
  styling?: StyleConfig
  dataBinding?: DataBinding[]
}

export interface UIComponent {
  id: string
  type: string
  props: Record<string, any>
  children?: UIComponent[]
  style?: Record<string, any>
  dataBinding?: DataBinding
  position?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface LayoutConfig {
  type: 'fixed' | 'responsive' | 'fluid'
  breakpoints?: Record<string, number>
  grid?: {
    columns: number
    gap: number
  }
}

export interface StyleConfig {
  theme?: string
  colors?: Record<string, string>
  fonts?: Record<string, string>
  spacing?: Record<string, string>
  customCSS?: string
}

export interface DataBinding {
  componentId: string
  property: string
  source: 'api' | 'state' | 'url' | 'localStorage'
  endpoint?: string
  transform?: string
  defaultValue?: any
}

// Main Application Configuration
export interface ApplicationConfig {
  name: string
  description?: string
  version: string
  author: string
  database: {
    tables: TableDefinition[]
  }
  api: {
    endpoints: ApiEndpoint[]
    baseUrl?: string
    version?: string
  }
  frontend: {
    pages: PageDefinition[]
    routing?: RoutingConfig
    authentication?: AuthConfig
    styling?: StyleConfig
  }
  deployment?: DeploymentConfig
}

export interface RoutingConfig {
  type: 'browser' | 'hash'
  basepath?: string
  guards?: RouteGuard[]
}

export interface RouteGuard {
  path: string
  authenticationRequired: boolean
  roles?: string[]
}

export interface AuthConfig {
  type: 'jwt' | 'session'
  providers?: ('email' | 'google' | 'github')[]
  sessionTimeout?: number
}

export interface DeploymentConfig {
  type: 'docker' | 'static' | 'serverless'
  environment: 'development' | 'staging' | 'production'
  database: {
    type: string
    connection: Record<string, any>
  }
  services: {
    api: ServiceConfig
    frontend: ServiceConfig
  }
}

export interface ServiceConfig {
  port?: number
  host?: string
  ssl?: boolean
  customConfig?: Record<string, any>
}

// Code Generation Options
export interface GenerationOptions {
  outputPath?: string
  templatePath?: string
  includeTests?: boolean
  includeDocs?: boolean
  minifyCode?: boolean
  customTemplates?: Record<string, string>
  environment?: 'development' | 'production'
}

// Generated File Structure
export interface GeneratedFile {
  path: string
  content: string
  type: 'config' | 'code' | 'template' | 'documentation'
}

// Validation Result
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Template Types
export interface Template {
  name: string
  path: string
  content: string
  helpers?: Record<string, Function>
  partials?: Record<string, string>
}

export interface TemplateContext {
  config: ApplicationConfig
  options: GenerationOptions
  utils: Record<string, Function>
  timestamp: Date
}
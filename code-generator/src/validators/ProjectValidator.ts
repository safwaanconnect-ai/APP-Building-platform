import { ApplicationConfig, ValidationResult } from '../types'

export class ProjectValidator {
  async validate(config: ApplicationConfig): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Basic structure validation
    this.validateBasicStructure(config, errors)

    // Database validation
    this.validateDatabase(config, errors, warnings)

    // API validation
    this.validateAPI(config, errors, warnings)

    // Frontend validation
    this.validateFrontend(config, errors, warnings)

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  private validateBasicStructure(config: ApplicationConfig, errors: string[]): void {
    if (!config.name || config.name.trim().length === 0) {
      errors.push('Application name is required')
    }

    if (!config.version || !this.isValidVersion(config.version)) {
      errors.push('Valid version is required (e.g., 1.0.0)')
    }

    if (!config.author || config.author.trim().length === 0) {
      errors.push('Author is required')
    }

    if (!config.database || !config.database.tables) {
      errors.push('Database configuration with tables is required')
    }

    if (!config.api || !config.api.endpoints) {
      errors.push('API configuration with endpoints is required')
    }

    if (!config.frontend || !config.frontend.pages) {
      errors.push('Frontend configuration with pages is required')
    }
  }

  private validateDatabase(config: ApplicationConfig, errors: string[], warnings: string[]): void {
    const tables = config.database.tables

    if (tables.length === 0) {
      errors.push('At least one database table is required')
      return
    }

    for (const table of tables) {
      if (!table.name || table.name.trim().length === 0) {
        errors.push(`Table name is required`)
        continue
      }

      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table.name)) {
        errors.push(`Table name "${table.name}" is invalid. Must start with letter or underscore and contain only letters, numbers, and underscores`)
      }

      if (!table.fields || table.fields.length === 0) {
        errors.push(`Table "${table.name}" must have at least one field`)
        continue
      }

      // Validate fields
      const fieldNames = new Set<string>()
      for (const field of table.fields) {
        if (!field.name || field.name.trim().length === 0) {
          errors.push(`Field name is required in table "${table.name}"`)
          continue
        }

        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field.name)) {
          errors.push(`Field name "${field.name}" in table "${table.name}" is invalid`)
        }

        if (fieldNames.has(field.name)) {
          errors.push(`Duplicate field name "${field.name}" in table "${table.name}"`)
        }
        fieldNames.add(field.name)

        if (!field.type) {
          errors.push(`Field type is required for "${field.name}" in table "${table.name}"`)
        }

        if (!this.isValidFieldType(field.type)) {
          errors.push(`Invalid field type "${field.type}" for "${field.name}" in table "${table.name}"`)
        }
      }

      // Validate relationships
      if (table.relationships) {
        for (const rel of table.relationships) {
          if (!rel.type || !['one-to-one', 'one-to-many', 'many-to-many'].includes(rel.type)) {
            errors.push(`Invalid relationship type in table "${table.name}"`)
          }

          if (!rel.sourceTable || !rel.sourceField || !rel.targetTable || !rel.targetField) {
            errors.push(`Relationship fields are required in table "${table.name}"`)
          }
        }
      }
    }
  }

  private validateAPI(config: ApplicationConfig, errors: string[], warnings: string[]): void {
    const endpoints = config.api.endpoints

    if (endpoints.length === 0) {
      warnings.push('No API endpoints defined. Consider adding some endpoints for your application')
      return
    }

    const paths = new Set<string>()
    for (const endpoint of endpoints) {
      if (!endpoint.path || endpoint.path.trim().length === 0) {
        errors.push('API endpoint path is required')
        continue
      }

      const pathMethod = `${endpoint.method?.toUpperCase()} ${endpoint.path}`
      if (paths.has(pathMethod)) {
        errors.push(`Duplicate API endpoint: ${pathMethod}`)
      }
      paths.add(pathMethod)

      if (!endpoint.method || !['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(endpoint.method)) {
        errors.push(`Invalid HTTP method for endpoint: ${endpoint.path}`)
      }

      if (endpoint.table) {
        // Check if referenced table exists
        const tableExists = config.database.tables.some(table => table.name === endpoint.table)
        if (!tableExists) {
          errors.push(`API endpoint "${endpoint.path}" references non-existent table "${endpoint.table}"`)
        }
      }
    }
  }

  private validateFrontend(config: ApplicationConfig, errors: string[], warnings: string[]): void {
    const pages = config.frontend.pages

    if (pages.length === 0) {
      warnings.push('No frontend pages defined. Consider adding at least a home page')
      return
    }

    const paths = new Set<string>()
    for (const page of pages) {
      if (!page.name || page.name.trim().length === 0) {
        errors.push('Page name is required')
        continue
      }

      if (!page.path || page.path.trim().length === 0) {
        errors.push(`Page path is required for "${page.name}"`)
        continue
      }

      if (paths.has(page.path)) {
        errors.push(`Duplicate page path: ${page.path}`)
      }
      paths.add(page.path)

      // Validate components
      if (page.components) {
        this.validateComponents(page.components, page.name, errors)
      }

      // Validate data bindings
      if (page.dataBinding) {
        this.validateDataBindings(page.dataBinding, page.name, config.api.endpoints, errors)
      }
    }
  }

  private validateComponents(components: any[], pageName: string, errors: string[]): void {
    const componentIds = new Set<string>()

    for (const component of components) {
      if (!component.id) {
        errors.push(`Component ID is required in page "${pageName}"`)
        continue
      }

      if (componentIds.has(component.id)) {
        errors.push(`Duplicate component ID "${component.id}" in page "${pageName}"`)
      }
      componentIds.add(component.id)

      if (!component.type) {
        errors.push(`Component type is required for component "${component.id}" in page "${pageName}"`)
      }

      // Recursively validate children
      if (component.children && Array.isArray(component.children)) {
        this.validateComponents(component.children, pageName, errors)
      }
    }
  }

  private validateDataBindings(dataBindings: any[], pageName: string, endpoints: any[], errors: string[]): void {
    const endpointPaths = new Set(endpoints.map(ep => ep.path))

    for (const binding of dataBindings) {
      if (!binding.componentId) {
        errors.push(`Data binding component ID is required in page "${pageName}"`)
      }

      if (!binding.property) {
        errors.push(`Data binding property is required in page "${pageName}"`)
      }

      if (binding.source === 'api' && binding.endpoint && !endpointPaths.has(binding.endpoint)) {
        errors.push(`Data binding references non-existent API endpoint "${binding.endpoint}" in page "${pageName}"`)
      }
    }
  }

  private isValidVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+(-[a-zA-Z0-9\-\.]+)?$/.test(version)
  }

  private isValidFieldType(type: string): boolean {
    const validTypes = ['string', 'text', 'number', 'boolean', 'date', 'json', 'email', 'url']
    return validTypes.includes(type)
  }
}
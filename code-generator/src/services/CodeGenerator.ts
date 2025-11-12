import Handlebars from 'handlebars'
import * as fs from 'fs-extra'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { ApplicationConfig, GenerationOptions, GeneratedFile, TemplateContext } from '../types'
import { TemplateLoader } from './TemplateLoader'

export class CodeGenerator {
  private templateLoader: TemplateLoader
  private helpers: Record<string, Function>

  constructor(templateLoader: TemplateLoader) {
    this.templateLoader = templateLoader
    this.helpers = this.registerHelpers()
  }

  async generate(config: ApplicationConfig, options: GenerationOptions = {}): Promise<string> {
    const outputPath = options.outputPath || `./generated/${this.slugify(config.name)}`
    const context: TemplateContext = {
      config,
      options: {
        ...options,
        environment: options.environment || 'development'
      },
      utils: this.getTemplateUtils(),
      timestamp: new Date()
    }

    // Ensure output directory exists
    await fs.ensureDir(outputPath)

    // Generate project structure
    const generatedFiles = await this.generateAllFiles(context)

    // Write files to disk
    for (const file of generatedFiles) {
      const filePath = path.join(outputPath, file.path)
      await fs.ensureDir(path.dirname(filePath))
      await fs.writeFile(filePath, file.content, 'utf8')
    }

    // Generate additional files based on options
    if (options.includeTests) {
      await this.generateTests(config, outputPath)
    }

    if (options.includeDocs) {
      await this.generateDocumentation(config, outputPath)
    }

    return outputPath
  }

  async preview(config: ApplicationConfig): Promise<Array<{ path: string; preview: string }>> {
    const context: TemplateContext = {
      config,
      options: { environment: 'development' },
      utils: this.getTemplateUtils(),
      timestamp: new Date()
    }

    const generatedFiles = await this.generateAllFiles(context)

    return generatedFiles.map(file => ({
      path: file.path,
      preview: this.getPreview(file.content)
    }))
  }

  private async generateAllFiles(context: TemplateContext): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = []

    // Backend files
    files.push(...await this.generateBackendFiles(context))

    // Frontend files
    files.push(...await this.generateFrontendFiles(context))

    // Database files
    files.push(...await this.generateDatabaseFiles(context))

    // Configuration files
    files.push(...await this.generateConfigFiles(context))

    return files
  }

  private async generateBackendFiles(context: TemplateContext): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = []
    const { config } = context

    // Package.json
    const packageTemplate = await this.templateLoader.loadTemplate('backend/package.json.hbs')
    files.push({
      path: 'backend/package.json',
      content: packageTemplate(context),
      type: 'config'
    })

    // Server entry point
    const serverTemplate = await this.templateLoader.loadTemplate('backend/server.js.hbs')
    files.push({
      path: 'backend/src/server.js',
      content: serverTemplate(context),
      type: 'code'
    })

    // Database models
    const modelTemplate = await this.templateLoader.loadTemplate('backend/models.hbs')
    files.push({
      path: 'backend/src/models/index.js',
      content: modelTemplate(context),
      type: 'code'
    })

    // API routes
    for (const endpoint of config.api.endpoints) {
      const routeTemplate = await this.templateLoader.loadTemplate('backend/route.hbs')
      files.push({
        path: `backend/src/routes/${this.slugify(endpoint.path)}.js`,
        content: routeTemplate({ ...context, endpoint }),
        type: 'code'
      })
    }

    // Authentication middleware
    if (config.frontend.authentication) {
      const authTemplate = await this.templateLoader.loadTemplate('backend/auth.hbs')
      files.push({
        path: 'backend/src/middleware/auth.js',
        content: authTemplate(context),
        type: 'code'
      })
    }

    return files
  }

  private async generateFrontendFiles(context: TemplateContext): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = []
    const { config } = context

    // Package.json
    const packageTemplate = await this.templateLoader.loadTemplate('frontend/package.json.hbs')
    files.push({
      path: 'frontend/package.json',
      content: packageTemplate(context),
      type: 'config'
    })

    // Main App component
    const appTemplate = await this.templateLoader.loadTemplate('frontend/App.js.hbs')
    files.push({
      path: 'frontend/src/App.js',
      content: appTemplate(context),
      type: 'code'
    })

    // Pages
    for (const page of config.frontend.pages) {
      const pageTemplate = await this.templateLoader.loadTemplate('frontend/page.hbs')
      files.push({
        path: `frontend/src/pages/${this.slugify(page.name)}.js`,
        content: pageTemplate({ ...context, page }),
        type: 'code'
      })
    }

    // Components
    const componentTemplate = await this.templateLoader.loadTemplate('frontend/components.hbs')
    files.push({
      path: 'frontend/src/components/index.js',
      content: componentTemplate(context),
      type: 'code'
    })

    // Styles
    const styleTemplate = await this.templateLoader.loadTemplate('frontend/styles.hbs')
    files.push({
      path: 'frontend/src/styles/index.css',
      content: styleTemplate(context),
      type: 'code'
    })

    return files
  }

  private async generateDatabaseFiles(context: TemplateContext): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = []
    const { config } = context

    // Prisma schema
    const prismaTemplate = await this.templateLoader.loadTemplate('database/schema.prisma.hbs')
    files.push({
      path: 'database/schema.prisma',
      content: prismaTemplate(context),
      type: 'config'
    })

    // Migration files
    const migrationTemplate = await this.templateLoader.loadTemplate('database/migration.sql.hbs')
    const migrationName = `${Date.now()}_init`
    files.push({
      path: `database/migrations/${migrationName}.sql`,
      content: migrationTemplate(context),
      type: 'code'
    })

    return files
  }

  private async generateConfigFiles(context: TemplateContext): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = []

    // Docker compose
    const dockerComposeTemplate = await this.templateLoader.loadTemplate('docker-compose.yml.hbs')
    files.push({
      path: 'docker-compose.yml',
      content: dockerComposeTemplate(context),
      type: 'config'
    })

    // Dockerfile for backend
    const dockerBackendTemplate = await this.templateLoader.loadTemplate('Dockerfile.backend.hbs')
    files.push({
      path: 'backend/Dockerfile',
      content: dockerBackendTemplate(context),
      type: 'config'
    })

    // Dockerfile for frontend
    const dockerFrontendTemplate = await this.templateLoader.loadTemplate('Dockerfile.frontend.hbs')
    files.push({
      path: 'frontend/Dockerfile',
      content: dockerFrontendTemplate(context),
      type: 'config'
    })

    // Environment files
    const envTemplate = await this.templateLoader.loadTemplate('.env.hbs')
    files.push({
      path: '.env.example',
      content: envTemplate(context),
      type: 'config'
    })

    return files
  }

  private async generateTests(config: ApplicationConfig, outputPath: string): Promise<void> {
    const testsDir = path.join(outputPath, 'tests')
    await fs.ensureDir(testsDir)

    // Test configuration
    const testConfigTemplate = await this.templateLoader.loadTemplate('tests/jest.config.js.hbs')
    await fs.writeFile(
      path.join(testsDir, 'jest.config.js'),
      testConfigTemplate({ config, options: {} }),
      'utf8'
    )
  }

  private async generateDocumentation(config: ApplicationConfig, outputPath: string): Promise<void> {
    const docsDir = path.join(outputPath, 'docs')
    await fs.ensureDir(docsDir)

    // README
    const readmeTemplate = await this.templateLoader.loadTemplate('README.md.hbs')
    await fs.writeFile(
      path.join(outputPath, 'README.md'),
      readmeTemplate({ config, options: {} }),
      'utf8'
    )

    // API documentation
    const apiDocTemplate = await this.templateLoader.loadTemplate('docs/api.md.hbs')
    await fs.writeFile(
      path.join(docsDir, 'api.md'),
      apiDocTemplate({ config, options: {} }),
      'utf8'
    )
  }

  private registerHelpers(): Record<string, Function> {
    Handlebars.registerHelper('slugify', (str: string) => this.slugify(str))
    Handlebars.registerHelper('capitalize', (str: string) => str.charAt(0).toUpperCase() + str.slice(1))
    Handlebars.registerHelper('camelCase', (str: string) => this.toCamelCase(str))
    Handlebars.registerHelper('pascalCase', (str: string) => this.toPascalCase(str))
    Handlebars.registerHelper('kebabCase', (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    Handlebars.registerHelper('json', (obj: any) => JSON.stringify(obj, null, 2))
    Handlebars.registerHelper('eq', (a: any, b: any) => a === b)
    Handlebars.registerHelper('gt', (a: number, b: number) => a > b)
    Handlebars.registerHelper('lt', (a: number, b: number) => a < b)

    return {}
  }

  private getTemplateUtils(): Record<string, Function> {
    return {
      slugify: this.slugify,
      camelCase: this.toCamelCase,
      pascalCase: this.toPascalCase,
      kebabCase: (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
      generateId: () => uuidv4(),
      formatType: (type: string) => this.mapFieldType(type),
      formatDate: (date: Date) => date.toISOString()
    }
  }

  private slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  private toCamelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase()
      })
      .replace(/\s+/g, '')
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
        return word.toUpperCase()
      })
      .replace(/\s+/g, '')
  }

  private mapFieldType(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'String',
      'text': 'String',
      'number': 'Number',
      'boolean': 'Boolean',
      'date': 'Date',
      'json': 'Json',
      'email': 'String',
      'url': 'String'
    }
    return typeMap[type] || 'String'
  }

  private getPreview(content: string, maxLength = 200): string {
    if (content.length <= maxLength) {
      return content
    }
    return content.substring(0, maxLength) + '...'
  }
}
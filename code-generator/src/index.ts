import { CodeGenerator } from './services/CodeGenerator'
import { TemplateLoader } from './services/TemplateLoader'
import { ProjectValidator } from './validators/ProjectValidator'
import { ApplicationConfig, GenerationOptions } from './types'

export class CodeGeneratorService {
  private generator: CodeGenerator
  private templateLoader: TemplateLoader
  private validator: ProjectValidator

  constructor() {
    this.templateLoader = new TemplateLoader('./templates')
    this.validator = new ProjectValidator()
    this.generator = new CodeGenerator(this.templateLoader)
  }

  async generateApplication(
    config: ApplicationConfig,
    options: GenerationOptions = {}
  ): Promise<{ success: boolean; outputPath?: string; errors?: string[] }> {
    try {
      // Validate the application configuration
      const validation = await this.validator.validate(config)
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        }
      }

      // Generate the application
      const outputPath = await this.generator.generate(config, options)

      return {
        success: true,
        outputPath
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      }
    }
  }

  async previewGeneration(config: ApplicationConfig): Promise<{
    success: boolean
    files?: Array<{ path: string; preview: string }>
    errors?: string[]
  }> {
    try {
      const validation = await this.validator.validate(config)
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        }
      }

      const files = await this.generator.preview(config)

      return {
        success: true,
        files
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      }
    }
  }
}

// Export types for external use
export { ApplicationConfig, GenerationOptions } from './types'
export { CodeGenerator } from './services/CodeGenerator'
export { TemplateLoader } from './services/TemplateLoader'
export { ProjectValidator } from './validators/ProjectValidator'

// Main service instance
export const codeGeneratorService = new CodeGeneratorService()
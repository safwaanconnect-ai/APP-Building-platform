import * as fs from 'fs-extra'
import * as path from 'path'
import Handlebars from 'handlebars'

export class TemplateLoader {
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map()
  private templatePath: string

  constructor(templatePath: string) {
    this.templatePath = path.resolve(templatePath)
  }

  async loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!
    }

    const templateFilePath = path.join(this.templatePath, templateName)

    try {
      const templateContent = await fs.readFile(templateFilePath, 'utf8')
      const compiledTemplate = Handlebars.compile(templateContent)

      this.templateCache.set(templateName, compiledTemplate)
      return compiledTemplate
    } catch (error) {
      throw new Error(`Failed to load template: ${templateName}. Error: ${error}`)
    }
  }

  async loadPartial(partialName: string): Promise<string> {
    const partialFilePath = path.join(this.templatePath, 'partials', `${partialName}.hbs`)

    try {
      const partialContent = await fs.readFile(partialFilePath, 'utf8')
      Handlebars.registerPartial(partialName, partialContent)
      return partialContent
    } catch (error) {
      throw new Error(`Failed to load partial: ${partialName}. Error: ${error}`)
    }
  }

  async loadAllPartials(): Promise<void> {
    const partialsDir = path.join(this.templatePath, 'partials')

    try {
      const partialFiles = await fs.readdir(partialsDir)
      const hbsFiles = partialFiles.filter(file => file.endsWith('.hbs'))

      for (const file of hbsFiles) {
        const partialName = path.basename(file, '.hbs')
        await this.loadPartial(partialName)
      }
    } catch (error) {
      // Partials directory might not exist, which is fine
      console.warn('Partials directory not found, skipping partials loading')
    }
  }

  clearCache(): void {
    this.templateCache.clear()
  }

  async templateExists(templateName: string): Promise<boolean> {
    const templateFilePath = path.join(this.templatePath, templateName)
    return fs.pathExists(templateFilePath)
  }

  async listTemplates(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.templatePath, { withFileTypes: true })
      return files
        .filter(file => file.isFile() && file.name.endsWith('.hbs'))
        .map(file => file.name)
    } catch (error) {
      throw new Error(`Failed to list templates: ${error}`)
    }
  }
}
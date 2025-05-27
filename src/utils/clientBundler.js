// Client-side bundler that creates single HTML inscriptions from project files
import * as Babel from '@babel/standalone'

class ClientBundler {
  constructor() {
    this.files = {}
    this.inscriptions = {}
    this.processedFiles = new Map()
  }

  setFiles(files) {
    this.files = files
    this.processedFiles.clear()
  }

  setInscriptions(inscriptions) {
    this.inscriptions = inscriptions
  }

  // Build the project files into a single HTML file
  async build() {
    try {
      // Find entry point
      const entryPoint = this.findEntryPoint()
      if (!entryPoint) {
        throw new Error('No entry point found (looking for src/main.jsx or index.js)')
      }

      // Process all files
      const bundledJS = await this.processFile(entryPoint)
      
      // Collect all CSS
      const bundledCSS = this.collectCSS()
      
      // Create final HTML
      const html = this.createHTMLTemplate(bundledJS, bundledCSS)
      
      return html
      
    } catch (error) {
      console.error('Build error:', error)
      throw error
    }
  }

  async processFile(filePath) {
    if (this.processedFiles.has(filePath)) {
      return this.processedFiles.get(filePath)
    }

    if (!this.files[filePath]) {
      throw new Error(`File not found: ${filePath}`)
    }

    let content = this.files[filePath]

    // Transform JSX/TSX files
    if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
      content = this.transformJSX(content)
    }

    // Process imports
    content = await this.processImports(content, filePath)

    this.processedFiles.set(filePath, content)
    return content
  }

  async processImports(code, currentFile) {
    const importRegex = /import\s+(?:[\w*{},\s]+\s+from\s+)?['"]([^'"]+)['"]/g
    let match
    const imports = []

    while ((match = importRegex.exec(code)) !== null) {
      imports.push(match[1])
    }

    for (const importPath of imports) {
      if (this.isExternalImport(importPath)) {
        // Replace with inscription URL if available
        if (this.inscriptions[importPath]) {
          code = code.replace(
            new RegExp(`['"]${importPath}['"]`, 'g'),
            `'${this.inscriptions[importPath]}'`
          )
        }
      } else {
        // Process local file import
        const resolvedPath = this.resolveImportPath(importPath, currentFile)
        if (resolvedPath && this.files[resolvedPath]) {
          const importedContent = await this.processFile(resolvedPath)
          // For simplicity, we'll inline the content instead of using ES modules
          // In a real bundler, you'd handle this more sophisticatedly
        }
      }
    }

    return code
  }

  isExternalImport(importPath) {
    return !importPath.startsWith('.') && !importPath.startsWith('/')
  }

  resolveImportPath(importPath, currentFile) {
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const baseDir = currentFile.split('/').slice(0, -1).join('/')
      return this.resolvePath(baseDir, importPath)
    }
    return importPath
  }

  collectCSS() {
    let allCSS = ''
    Object.entries(this.files).forEach(([path, content]) => {
      if (path.endsWith('.css')) {
        allCSS += content + '\n'
      }
    })
    return allCSS
  }

  findEntryPoint() {
    const candidates = ['src/main.jsx', 'src/main.js', 'src/index.jsx', 'src/index.js', 'main.jsx', 'index.js']
    for (const candidate of candidates) {
      if (this.files[candidate]) {
        return candidate
      }
    }
    return null
  }

  createHTMLTemplate(bundledJS, bundledCSS) {
    // Get base HTML template
    const htmlTemplate = this.files['index.html'] || this.getDefaultHTMLTemplate()
    
    // Create import map for external libraries/inscriptions
    const importMap = {
      imports: {
        ...this.inscriptions,
        // Add common library mappings for ordinals
        'react': '/content/609b117277f1e9c9f27f358fe02db34e13d08915bbcea18770dc36f5f3afcbb2i0',
        'react-dom': '/content/609b117277f1e9c9f27f358fe02db34e13d08915bbcea18770dc36f5f3afcbb2i1',
        'react-dom/client': '/content/4d9308ce08bed11c028acb3d1dd964ea0e9809f51daf141ca0760e745a8070aei0',
        'react/jsx-runtime': '/content/609bad601cdafa4d4a2622bbd9f4ebfdd278b8c5ea1efeb0d468db33f871fffai1',
        'three': '/content/0d013bb60fc5bf5a6c77da7371b07dc162ebc7d7f3af0ff3bd00ae5f0c546445i0',
        '@react-three/fiber': '/content/f1be1caad667af0ec844d1333ad4d38f2cd7cc2855404bba11ac436b53c799b6i0',
        '@react-three/drei': '/content/ded46f972b0f85ea041359cd94a7878a5e902126fb34ee11dbed1c9ae4dfb1ebi0',
        'leva': '/content/609bad601cdafa4d4a2622bbd9f4ebfdd278b8c5ea1efeb0d468db33f871fffai2'
      }
    }

    // Build final HTML
    let finalHTML = htmlTemplate
    
    // Insert import map
    const importMapScript = `<script type="importmap">${JSON.stringify(importMap, null, 2)}</script>`
    finalHTML = finalHTML.replace(/<head>/i, `<head>\n${importMapScript}`)
    
    // Insert CSS if any
    if (bundledCSS.trim()) {
      const styleTag = `<style>${bundledCSS}</style>`
      finalHTML = finalHTML.replace(/<head>/i, `<head>\n${styleTag}`)
    }
    
    // Insert main script
    const scriptTag = `<script type="module">${bundledJS}</script>`
    finalHTML = finalHTML.replace(/<\/body>/i, `${scriptTag}\n</body>`)
    
    // Remove original script references
    finalHTML = finalHTML.replace(/<script[^>]*src="[^"]*main\.jsx?"[^>]*><\/script>/gi, '')
    
    return finalHTML
  }

  getDefaultHTMLTemplate() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bitcoin Inscription</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`
  }

  transformJSX(code) {
    try {
      // Use Babel to transform JSX
      const result = Babel.transform(code, {
        presets: [
          ['@babel/preset-react', { 
            runtime: 'automatic',
            importSource: 'react'
          }]
        ],
        plugins: [
          ['@babel/plugin-transform-modules-es2015', { 
            strict: false 
          }]
        ]
      })
      return result.code
    } catch (error) {
      console.warn('JSX transform failed, using fallback:', error)
      // Fallback to simple string replacement
      return this.simpleJSXTransform(code)
    }
  }

  simpleJSXTransform(code) {
    // Basic JSX transformation fallback
    return code
      .replace(/import\s+React[^;]*;?/g, '')
      .replace(/export\s+default\s+/g, 'const App = ')
      .replace(/<(\w+)([^>]*)\/>/g, 'React.createElement("$1", {$2})')
      .replace(/<(\w+)([^>]*)>(.*?)<\/\1>/gs, 'React.createElement("$1", {$2}, $3)')
  }

  resolvePath(baseDir, relativePath) {
    const parts = baseDir.split('/').filter(p => p)
    const relativeParts = relativePath.split('/').filter(p => p)
    
    for (const part of relativeParts) {
      if (part === '..') {
        parts.pop()
      } else if (part !== '.') {
        parts.push(part)
      }
    }
    
    return parts.join('/')
  }
}

export default ClientBundler

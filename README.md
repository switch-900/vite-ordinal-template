<!-- filepath: /workspaces/vite-ordinal-template/README.md -->
# How Bitcoin Inscription Studio Works

## 🎯 Core Concept

The Bitcoin Inscription Studio is a **meta-circular development environment**—an on-chain IDE that builds other inscriptions. Think of it as “Visual Studio Code for Bitcoin.”

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                Bitcoin Inscription Studio                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Editor    │  │   Preview   │  │   Build System      │  │
│  │ - Code      │  │ - Live      │  │ - Vite Bundler      │  │
│  │ - Files     │  │ - Preview   │  │ - Single HTML       │  │
│  │ - Syntax    │  │ - Iframe    │  │ - Minification      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Sidebar    │  │  Console    │  │  Recursive System   │  │
│  │ - Files     │  │ - Logs      │  │ - Import Map        │  │
│  │ - Imports   │  │ - Errors    │  │ - Dependencies      │  │
│  │ - Templates │  │ - Build     │  │ - /content/ URLs    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Development Workflow

### 1. Code Phase

```javascript
import { Canvas } from '@react-three/fiber'
import { GridFloor } from 'GridFloor' // Recursive inscription

function MyInscription() {
  return (
    <Canvas>
      <GridFloor />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="#ff9900" />
      </mesh>
    </Canvas>
  )
}
```

### 2. Preview Phase

```html
<iframe src="blob:...">
  <!-- Rendered React component -->
</iframe>
```

### 3. Build Phase

```bash
[Vite] Building inscription...
[Vite] Bundling to single HTML...
[Vite] ✅ inscription.html ready (~80KB)
```

### 4. Deploy Phase

```bash
ord wallet inscribe build/inscription.html
```

## ⚡ Vite Ordinal Template Integration

- **Import Map** replaces `import` aliases with `/content/{inscriptionId}`
- **Single HTML** via `vite-plugin-singlefile`
- **Recursive Resolving** caches external inscriptions

```js
export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    downloadExternalModules(),
    postBuildReplacePlugin()
  ]
})
```

## 🔧 Component Architecture

### Context State

```js
const initialState = {
  currentFile: 'src/App.jsx',
  files: { 'src/App.jsx': '...code...', 'src/main.jsx': '...' },
  buildResult: null,
  consoleMessages: []
}
// dispatch({ type: 'UPDATE_FILE', filename, content })
```

### Interaction Flow

```
Editor.jsx ──→ StudioContext ──→ { Preview.jsx, Console.jsx, StatusBar.jsx }
Sidebar.jsx ──┘
```

## 🎨 UI Components

- **Header**: logo + build button
- **Sidebar**: file tree + import shortcuts
- **Editor**: code textarea with line-numbers
- **Preview**: live iframe + download/open
- **Console**: build & log messages
- **StatusBar**: file info & sizes

## 🌐 Recursive System

```js
import { GridFloor } from 'GridFloor'
// resolves to '/content/{inscriptionId}'
```

## 🚀 Deploy & Serve

- `npm run dev` for local
- `npm run build` for production
- `ord wallet inscribe build/inscription.html` for Bitcoin

## Project Files Folder

All user-created source files and assets are stored in the `ProjecrFiles` directory at the root of the workspace. When you open or create a file in the Studio sidebar, it is read from and written to this folder.

---

_This studio itself is an inscription and can build copies of itself on-chain!_

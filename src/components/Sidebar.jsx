import React from 'react'
import { useStudio } from '../context/StudioContext'

export default function Sidebar() {
  const { state, dispatch } = useStudio()

  const selectFile = (filename) => {
    dispatch({ type: 'SET_CURRENT_FILE', payload: filename })
  }

  const insertImport = (moduleName) => {
    const currentContent = state.files[state.currentFile]
    const lines = currentContent.split('\n')
    
    // Find where to insert import
    let insertIndex = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].trim() === '') {
        insertIndex = i + 1
      } else {
        break
      }
    }
    
    const importStatement = `import ${moduleName} from '${moduleName}';`
    lines.splice(insertIndex, 0, importStatement)
    
    dispatch({ 
      type: 'UPDATE_FILE', 
      filename: state.currentFile, 
      content: lines.join('\n') 
    })
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="section-header">Project Files</div>
        <div className="file-tree">
          {/** Build nested tree of files and folders **/}
          {(() => {
            // Construct tree structure
            const tree = {};
            Object.keys(state.files).forEach(path => {
              const parts = path.split('/');
              let node = tree;
              parts.forEach((part, idx) => {
                if (!node[part]) node[part] = { _files: [], _children: {} };
                if (idx === parts.length - 1) {
                  node[part]._files.push(path);
                } else {
                  node = node[part]._children;
                }
              });
            });
            // Recursive render function
            const renderNode = (nodeObj, parentPath = '') => Object.entries(nodeObj).map(([name, data]) => {
              const key = parentPath ? `${parentPath}/${name}` : name;
              const isFile = data._files.length > 0 && Object.keys(data._children).length === 0;
              return (
                <div key={key} style={{ paddingLeft: parentPath ? 16 : 0 }}>
                  {isFile ? (
                    <div
                      className={`file-item ${key === state.currentFile ? 'active' : ''}`}
                      onClick={() => selectFile(key)}
                    >
                      <span className="file-icon">{key.endsWith('.jsx') ? '⚛️' : key.endsWith('.js') ? '📜' : key.endsWith('.css') ? '🎨' : '📄'}</span>
                      <span>{name}</span>
                    </div>
                  ) : (
                    <div className="folder-item">
                      <span className="file-icon">📂</span>
                      <span>{name}</span>
                    </div>
                  )}
                  {data._children && renderNode(data._children, key)}
                </div>
              );
            });
            return renderNode(tree);
          })()}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-header">Recursive Inscriptions</div>
        <div className="import-map">
          {Object.entries(state.inscriptions).map(([name, path]) => (
            <div key={name} className="import-item">
              <span 
                className="import-name" 
                onClick={() => insertImport(name)}
              >
                {name}
              </span>
              <span className="import-id">{path.substring(9, 17)}...{path.slice(-2)}</span>
            </div>
          ))}
          {Object.keys(state.inscriptions).length === 0 && (
            <div className="import-item">
              <span className="import-name">No inscriptions configured</span>
              <span className="import-id">Check package.json</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

import React from 'react'
import { useStudio } from '../context/StudioContext'

export default function Editor() {
  const { state, dispatch } = useStudio()

  const handleContentChange = (e) => {
    dispatch({
      type: 'UPDATE_FILE',
      filename: state.currentFile,
      content: e.target.value
    })
  }

  const generateLineNumbers = () => {
    const lines = state.files[state.currentFile]?.split('\n') || []
    const lineCount = Math.max(lines.length, 20)
    return Array.from({ length: lineCount }, (_, i) => i + 1).join('\n')
  }

  return (
    <div className="editor-container">
      <div className="tabs">
        <div className="tab active">
          <span>⚛️</span>
          <span>{state.currentFile.split('/').pop()}</span>
        </div>
      </div>
      
      <div className="editor-main">
        <div className="line-numbers">
          {generateLineNumbers()}
        </div>
        <textarea
          className="code-editor"
          value={state.files[state.currentFile] || ''}
          onChange={handleContentChange}
          spellCheck={false}
          placeholder="Start coding your Bitcoin inscription..."
        />
      </div>
    </div>
  )
}

import React from 'react'
import { useStudio } from '../context/StudioContext'

export default function StatusBar() {
  const { state } = useStudio()
  
  const currentFileSize = state.files[state.currentFile]?.length || 0
  const buildSize = state.buildResult ? Math.round(state.buildResult.length / 1024) : 0

  return (
    <div className="status-bar">
      <div>
        <span>🟢 Ready</span>
        <span>•</span>
        <span>{state.currentFile}</span>
        <span>•</span>
        <span>Vite Ordinal Template</span>
      </div>
      <div>
        <span>Size: {currentFileSize} bytes</span>
        {buildSize > 0 && (
          <>
            <span>•</span>
            <span>Build: {buildSize} KB</span>
          </>
        )}
        <span>•</span>
        <span>UTF-8</span>
      </div>
    </div>
  )
}
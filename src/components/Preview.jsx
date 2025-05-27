
import React, { useEffect, useRef } from 'react'
import { useStudio } from '../context/StudioContext'

export default function Preview() {
  const { state } = useStudio()
  const iframeRef = useRef()

  useEffect(() => {
    if (state.buildResult && iframeRef.current) {
      const blob = new Blob([state.buildResult], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      iframeRef.current.src = url
      
      return () => URL.revokeObjectURL(url)
    }
  }, [state.buildResult])

  const downloadBuild = () => {
    if (state.buildResult) {
      const blob = new Blob([state.buildResult], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'inscription.html'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <div className="preview-title">
          <span>📱</span>
          <span>Build Preview</span>
          <div className={`build-status ${state.buildStatus}`}>
            {state.buildStatus === 'building' ? 'Building...' : 
             state.buildStatus === 'success' ? 'Ready' : 'Ready'}
          </div>
        </div>
        <div className="preview-actions">
          <button className="icon-btn" onClick={downloadBuild}>💾</button>
          <button className="icon-btn" onClick={() => window.open(iframeRef.current?.src, '_blank')}>🔗</button>
        </div>
      </div>
      <iframe ref={iframeRef} className="preview-frame" />
    </div>
  )
}
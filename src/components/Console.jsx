
import React from 'react'
import { useStudio } from '../context/StudioContext'

export default function Console() {
  const { state, dispatch } = useStudio()

  const switchPanel = (panelName) => {
    dispatch({ type: 'SET_ACTIVE_PANEL', payload: panelName })
  }

  return (
    <div className="bottom-panel">
      <div className="panel-tabs">
        {['console', 'build', 'network'].map(panel => (
          <div 
            key={panel}
            className={`panel-tab ${state.activePanel === panel ? 'active' : ''}`}
            onClick={() => switchPanel(panel)}
          >
            <span>
              {panel === 'console' ? '📟' : 
               panel === 'build' ? '⚡' : '🌐'}
            </span>
            {panel.charAt(0).toUpperCase() + panel.slice(1)}
          </div>
        ))}
      </div>
      
      <div className="panel-content">
        {state.consoleMessages.map((msg, i) => (
          <div key={i} className={`console-message ${msg.type}`}>
            [{new Date().toLocaleTimeString()}] {msg.message}
          </div>
        ))}
        {state.consoleMessages.length === 0 && (
          <div className="console-message">
            [Studio] Bitcoin Inscription Studio ready
            <br />
            [Info] This studio is built with the Vite Ordinal Template
            <br />
            [Info] Click "Build Inscription" to create your inscription
          </div>
        )}
      </div>
    </div>
  )
}
import React from 'react'
import { useStudio } from '../context/StudioContext'
import ClientBundler from '../utils/clientBundler'

export default function Header() {
  const { state, dispatch } = useStudio()

  const buildProject = async () => {
    dispatch({ type: 'SET_BUILD_STATUS', payload: 'building' })
    dispatch({ 
      type: 'ADD_CONSOLE_MESSAGE', 
      payload: { type: 'build', message: '[Client Bundler] Building inscription from project files...' }
    })

    try {
      // Create client bundler instance
      const bundler = new ClientBundler()
      bundler.setFiles(state.files)
      bundler.setInscriptions(state.inscriptions)
      
      // Build the project
      const buildOutput = await bundler.build()
      
      dispatch({ type: 'SET_BUILD_RESULT', payload: buildOutput })
      dispatch({ type: 'SET_BUILD_STATUS', payload: 'success' })
      dispatch({ 
        type: 'ADD_CONSOLE_MESSAGE', 
        payload: { type: 'build', message: '[Client Bundler] Build complete! Project files compiled into single HTML inscription.' }
      })
    } catch (error) {
      dispatch({ type: 'SET_BUILD_STATUS', payload: 'error' })
      dispatch({ 
        type: 'ADD_CONSOLE_MESSAGE', 
        payload: { type: 'error', message: `[Build Error] ${error.message}` }
      })
    }
  }

  return (
    <header className="header">
      <div className="logo">
        <div className="vite-logo">V</div>
        <span>Bitcoin Inscription Studio</span>
        <span className="ordinal-badge">⚔️ Ordinal</span>
      </div>
      <div className="header-actions">
        <button className="btn" onClick={() => alert('New Project')}>
          📁 New Project
        </button>
        <button className="btn primary" onClick={buildProject}>
          ⚡ Build Inscription
        </button>
      </div>
    </header>
  )
}
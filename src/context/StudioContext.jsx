import React, { createContext, useContext, useReducer, useEffect } from 'react'

const StudioContext = createContext()

const initialState = {
  currentFile: '',
  files: {},
  inscriptions: {},
  openTabs: [],
  buildResult: null,
  buildStatus: 'ready',
  consoleMessages: [],
  activePanel: 'console'
}

function studioReducer(state, action) {
  switch (action.type) {
    case 'SET_CURRENT_FILE':
      return { ...state, currentFile: action.payload }
    case 'UPDATE_FILE':
      return {
        ...state,
        files: { ...state.files, [action.filename]: action.content }
      }
    case 'SET_BUILD_RESULT':
      return { ...state, buildResult: action.payload }
    case 'SET_BUILD_STATUS':
      return { ...state, buildStatus: action.payload }
    case 'ADD_CONSOLE_MESSAGE':
      return {
        ...state,
        consoleMessages: [...state.consoleMessages, action.payload]
      }
    case 'CLEAR_CONSOLE':
      return { ...state, consoleMessages: [] }
    case 'SET_ACTIVE_PANEL':
      return { ...state, activePanel: action.payload }
    case 'DELETE_FILE':
      const {[action.payload]: _, ...remaining} = state.files
      const nextFile = Object.keys(remaining)[0] || ''
      return {
        ...state,
        files: remaining,
        currentFile: state.currentFile === action.payload ? nextFile : state.currentFile
      }
    case 'SET_INSCRIPTIONS':
      return { ...state, inscriptions: action.payload }
    default:
      return state
  }
}

export function StudioProvider({ children }) {
  const [state, dispatch] = useReducer(studioReducer, initialState)

  // Load inscriptions mapping from ProjecrFiles/package.json
  useEffect(() => {
    import('../ProjecrFiles/package.json')
      .then(mod => {
        dispatch({ type: 'SET_INSCRIPTIONS', payload: mod.inscriptions || {} })
      })
      .catch(() => {})
  }, [])

  // Load all project files from ProjecrFiles directory at build time
  useEffect(() => {
    // Load all core project files from the ProjecrFiles directory
    const modules = import.meta.glob('../ProjecrFiles/**/*.*', { as: 'raw', eager: true })
    const filePaths = Object.keys(modules).sort()
    filePaths.forEach(path => {
      const content = modules[path]
      // strip all leading folders up to our ProjecrFiles root
      const filename = path.replace(/^.*\/ProjecrFiles\//, '')
      dispatch({ type: 'UPDATE_FILE', filename, content })
    })
    if (filePaths.length) {
      const first = filePaths[0].replace(/^.*\/ProjecrFiles\//, '')
      dispatch({ type: 'SET_CURRENT_FILE', payload: first })
    }
  }, [])

  return (
    <StudioContext.Provider value={{ state, dispatch }}>
      {children}
    </StudioContext.Provider>
  )
}

export const useStudio = () => {
  const context = useContext(StudioContext)
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider')
  }
  return context
}
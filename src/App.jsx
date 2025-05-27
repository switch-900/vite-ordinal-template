import React, { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Leva } from 'leva'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import Preview from './components/Preview'
import Console from './components/Console'
import StatusBar from './components/StatusBar'
import { StudioProvider } from './context/StudioContext'

export default function App() {
  const [showLeva] = useState(false)
  const containerRef = useRef(null)
  const sidebarRef = useRef(null)
  const bottomRef = useRef(null)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [leftWidth, setLeftWidth] = useState(null)
  const [bottomHeight, setBottomHeight] = useState(250)
  const isResizing = useRef(false)
  const resizeType = useRef('')

  useEffect(() => {
    // init widths/heights
    if (containerRef.current) {
      setLeftWidth((containerRef.current.clientWidth - sidebarWidth) / 2)
    }
  }, [sidebarWidth])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return
      const contRect = containerRef.current.getBoundingClientRect()
      if (resizeType.current === 'sidebar') {
        let newW = e.clientX - contRect.left
        newW = Math.max(200, Math.min(600, newW))
        setSidebarWidth(newW)
      } else if (resizeType.current === 'middle') {
        let newW = e.clientX - contRect.left - sidebarWidth
        const min = 200
        const max = contRect.width - sidebarWidth - 200
        newW = Math.max(min, Math.min(max, newW))
        setLeftWidth(newW)
      } else if (resizeType.current === 'bottom') {
        const bottomTop = contRect.bottom - bottomHeight
        let newH = contRect.bottom - e.clientY
        newH = Math.max(100, Math.min(500, newH))
        setBottomHeight(newH)
      }
    }
    const handleMouseUp = () => { isResizing.current = false }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [sidebarWidth])

  const startResize = (type) => {
    resizeType.current = type
    isResizing.current = true
  }

  return (
    <StudioProvider>
      <div className="studio-container" ref={containerRef}>
        <Header />
        <div className="main-layout" style={{ flex: `0 0 calc(100% - ${bottomHeight}px)` }}>
          <div ref={sidebarRef} style={{ flex: `0 0 ${sidebarWidth}px` }}>
            <Sidebar />
          </div>
          <div className="divider divider-sidebar" onMouseDown={() => startResize('sidebar')} />
          <div className="editor-area">
            <div className="pane" style={{ flexBasis: leftWidth }}>
              <Editor />
            </div>
            <div className="divider" onMouseDown={() => startResize('middle')} />
            <div className="pane" style={{ flex: 1 }}>
              <Preview />
            </div>
          </div>
        </div>
        <div className="divider divider-bottom" onMouseDown={() => startResize('bottom')} />
        <div ref={bottomRef} className="bottom-panel" style={{ height: bottomHeight }}>
          <Console />
        </div>
        <StatusBar />
        <Leva hidden={!showLeva} />
      </div>
    </StudioProvider>
  )
}
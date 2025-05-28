// Split-view component for simultaneous 2D/3D viewing with enhanced CAD workflow
import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { useScene } from '../../state/sceneStore.jsx';
import { CameraManager } from '../core/CameraManager.jsx';
import { SceneRenderer } from '../core/SceneRenderer.jsx';
import { SketchCanvas } from '../tools/SketchCanvas.jsx';
import { EnvironmentLighting } from '../core/EnvironmentLighting.jsx';
import { GridFloor } from '../GridFloor.jsx';

export const ViewportSplitter = () => {
  const { viewMode, setSceneState } = useScene();
  const [splitMode, setSplitMode] = useState('single'); // 'single', 'horizontal', 'vertical'
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [primaryViewMode, setPrimaryViewMode] = useState('3d');
  const [secondaryViewMode, setSecondaryViewMode] = useState('2d');
  const containerRef = useRef();
  const resizerRef = useRef();

  const handleSplitModeChange = (mode) => {
    setSplitMode(mode);
    if (mode !== 'single') {
      // Enhanced auto-setup for CAD workflow
      setPrimaryViewMode('2d');
      setSecondaryViewMode('3d');
      setSceneState({ viewMode: '2d' }); // Start in 2D mode for sketching
    } else {
      // Revert to current view mode when in single mode
      setSceneState({ viewMode: primaryViewMode });
    }
  };

  const toggleViewModes = () => {
    const newPrimary = secondaryViewMode;
    const newSecondary = primaryViewMode;
    setPrimaryViewMode(newPrimary);
    setSecondaryViewMode(newSecondary);
    setSceneState({ viewMode: newPrimary });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      let newRatio;
      
      if (splitMode === 'horizontal') {
        newRatio = (e.clientY - rect.top) / rect.height;
      } else {
        newRatio = (e.clientX - rect.left) / rect.width;
      }
      
      setSplitRatio(Math.max(0.2, Math.min(0.8, newRatio)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, splitMode]);

  const renderViewport = (viewType, className, style = {}) => (
    <div className={className} style={style}>
      <Canvas dpr={1}>
        <CameraManager forceViewMode={viewType} />
        <color attach="background" args={[0.02, 0.02, 0.022]} />
        <React.Suspense fallback={null}>
          {viewType === '2d' ? (
            <SketchCanvas />
          ) : (
            <>
              <EnvironmentLighting />
              <SceneRenderer />
              <GridFloor />
            </>
          )}
        </React.Suspense>
      </Canvas>
      
      {/* Viewport Label */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
        {viewType === '2d' ? '2D Drawing' : '3D Model'}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Viewport Controls */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-white text-sm font-medium">View:</span>
          <div className="flex bg-gray-700 rounded">
            <button
              onClick={() => handleSplitModeChange('single')}
              className={`px-3 py-1 text-xs rounded-l ${
                splitMode === 'single' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              Single
            </button>
            <button
              onClick={() => handleSplitModeChange('vertical')}
              className={`px-3 py-1 text-xs ${
                splitMode === 'vertical' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              Split ↔
            </button>
            <button
              onClick={() => handleSplitModeChange('horizontal')}
              className={`px-3 py-1 text-xs rounded-r ${
                splitMode === 'horizontal' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              Split ↕
            </button>
          </div>
        </div>

        {/* Enhanced View Controls */}
        {splitMode === 'single' ? (
          <div className="flex bg-gray-700 rounded">
            <button
              onClick={() => setSceneState({ viewMode: '2d' })}
              className={`px-3 py-1 text-xs rounded-l ${
                viewMode === '2d' 
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              📐 2D Draw
            </button>
            <button
              onClick={() => setSceneState({ viewMode: '3d' })}
              className={`px-3 py-1 text-xs rounded-r ${
                viewMode === '3d' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              🧊 3D Model
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleViewModes}
              className="px-3 py-1 text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 rounded"
              title="Swap viewport views"
            >
              ⇄ Swap Views
            </button>
            <span className="text-xs text-gray-400">
              Left: {primaryViewMode === '2d' ? '📐 2D' : '🧊 3D'} | 
              Right: {secondaryViewMode === '2d' ? '📐 2D' : '🧊 3D'}
            </span>
          </div>
        )}
      </div>

      {/* Viewport Area */}
      <div ref={containerRef} className="flex-1 relative">
        {splitMode === 'single' ? (
          // Single viewport
          renderViewport(viewMode, "w-full h-full relative")
        ) : splitMode === 'vertical' ? (
          // Vertical split (side by side)
          <>
            {renderViewport(primaryViewMode, "absolute left-0 top-0 h-full", { width: `${splitRatio * 100}%` })}
            {renderViewport(secondaryViewMode, "absolute right-0 top-0 h-full", { 
              width: `${(1 - splitRatio) * 100}%`,
              left: `${splitRatio * 100}%`
            })}
            <div
              ref={resizerRef}
              className="absolute top-0 h-full w-1 bg-gray-600 cursor-col-resize hover:bg-orange-500 transition-colors z-10"
              style={{ left: `calc(${splitRatio * 100}% - 2px)` }}
              onMouseDown={handleMouseDown}
            />
          </>
        ) : (
          // Horizontal split (top/bottom)
          <>
            {renderViewport(primaryViewMode, "absolute left-0 top-0 w-full", { height: `${splitRatio * 100}%` })}
            {renderViewport(secondaryViewMode, "absolute left-0 w-full", { 
              height: `${(1 - splitRatio) * 100}%`,
              top: `${splitRatio * 100}%`
            })}
            <div
              ref={resizerRef}
              className="absolute left-0 w-full h-1 bg-gray-600 cursor-row-resize hover:bg-orange-500 transition-colors z-10"
              style={{ top: `calc(${splitRatio * 100}% - 2px)` }}
              onMouseDown={handleMouseDown}
            />
          </>
        )}
      </div>
    </div>
  );
};

// Top toolbar component with main tool categories and integrated controls
import React from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';
import { undoRedoManager } from '../../utils/undoRedo';

export const TopToolbar = () => {
  const { viewMode, view2DMode, currentTool, setSceneState, selectedIds, transformMode } = useScene();
  const { clearSelection } = useSceneActions();

  // Undo/Redo functions
  const undo = () => console.log('Undo temporarily disabled');
  const redo = () => console.log('Redo temporarily disabled');
  const canUndo = () => false;
  const canRedo = () => false;
  
  const undoAvailable = canUndo();
  const redoAvailable = canRedo();

  // Transform modes for quick access
  const transformModes = [
    { id: 'translate', icon: '↔', name: 'Move', key: 'G' },
    { id: 'rotate', icon: '🔄', name: 'Rotate', key: 'R' },
    { id: 'scale', icon: '↗', name: 'Scale', key: 'S' },
  ];

  // 2D View buttons for quick access
  const view2DButtons = [
    { id: 'front', name: 'Front', icon: '📐', key: '2' },
    { id: 'top', name: 'Top', icon: '⬛', key: '3' },
    { id: 'right', name: 'Right', icon: '📏', key: '4' },
    { id: 'left', name: 'Left', icon: '📏', key: '5' },
    { id: 'back', name: 'Back', icon: '📐', key: '6' },
    { id: 'bottom', name: 'Bottom', icon: '⬛', key: '7' },
  ];

  const handleModifyAction = (action) => {
    switch(action) {
      case 'Move':
        setSceneState({ transformMode: 'translate' });
        break;
      case 'Rotate':
        setSceneState({ transformMode: 'rotate' });
        break;
      case 'Scale':
        setSceneState({ transformMode: 'scale' });
        break;
      default:
        break;
    }
  };

  const handleFileAction = (action) => {
    switch(action) {
      case 'New':
        if (confirm('Start a new project? This will clear the current scene.')) {
          clearSelection();
          // Additional reset logic would go here
        }
        break;
      case 'Save':
        console.log('Save functionality would go here');
        break;
      case 'Export':
        console.log('Export functionality would go here');
        break;
      case 'Undo':
        undo();
        break;
      case 'Redo':
        redo();
        break;
      default:
        break;
    }
  };

  const toolCategories = [
    { name: 'File', icon: '📁', items: ['New', 'Open', 'Save', 'Export'], hasAction: true, handler: handleFileAction },
    { name: 'Edit', icon: '✏️', items: ['Undo', 'Redo', 'Copy', 'Paste'], hasAction: true, handler: handleFileAction },
    { name: 'View', icon: '👁️', items: ['Grid', 'Wireframe', 'Shaded', 'Realistic'] },
    { name: 'Modify', icon: '🔧', items: ['Move', 'Rotate', 'Scale', 'Mirror'], hasAction: true, handler: handleModifyAction },
  ];

  return (
    <div className="w-full bg-gray-800 border-b border-gray-700 shadow-lg">
      {/* Main Menu Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
        <div className="flex items-center space-x-1">
          <div className="text-orange-500 font-bold text-lg">🟧 Bitmap Nexus Builder 🟧</div>
        </div>
        
        {/* View Mode Toggle with Enhanced UX */}
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button 
              onClick={() => setSceneState({ viewMode: '2d' })} 
              className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                viewMode === '2d' 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title="Switch to 2D orthographic view for precision drawing"
            >
              <span className="mr-2">📐</span>
              2D Draw
            </button>
            <button 
              onClick={() => setSceneState({ viewMode: '3d' })} 
              className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                viewMode === '3d' 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title="Switch to 3D perspective view for modeling"
            >
              <span className="mr-2">🧊</span>
              3D Model
            </button>
          </div>
          
          {/* 2D View Quick Access */}
          {viewMode === '2d' && (
            <div className="flex bg-gray-800 rounded-lg p-1 space-x-1">
              {view2DButtons.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setSceneState({ view2DMode: view.id })}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    view2DMode === view.id
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                  title={`${view.name} view (${view.key})`}
                >
                  <span className="mr-1">{view.icon}</span>
                  {view.name}
                </button>
              ))}
            </div>
          )}
          
          {/* Visual indicator */}
          <div className="text-xs text-gray-400 px-2">
            {viewMode === '2d' ? 
              `${view2DButtons.find(v => v.id === view2DMode)?.name || 'Front'} View • Draw → Extrude` : 
              '3D Modeling Mode'
            }
          </div>
        </div>
      </div>

      {/* Tool Categories */}
      <div className="flex items-center justify-between px-2 py-1 bg-gray-800 overflow-x-auto">
        <div className="flex items-center">
          {toolCategories.map((category) => (
            <div key={category.name} className="relative group">
              <button className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded">
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
              
              {/* Dropdown menu */}
              <div className="absolute top-full left-0 mt-1 w-40 bg-gray-900 border border-gray-700 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {category.items.map((item) => (
                  <button
                    key={item}
                    onClick={() => category.hasAction && category.handler && category.handler(item)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors first:rounded-t last:rounded-b ${
                      category.hasAction 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!category.hasAction}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Current Tool Indicator */}
        {viewMode === '2d' && (
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-400">Current Tool:</span>
            <span className="text-orange-400 font-medium">{currentTool}</span>
          </div>
        )}
        
        {/* Integrated Transform Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center space-x-2 bg-gray-900 rounded px-3 py-1">
            <span className="text-gray-400 text-sm">Transform:</span>
            {transformModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSceneState({ transformMode: mode.id })}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  transformMode === mode.id
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={`${mode.name} (${mode.key})`}
              >
                <span className="mr-1">{mode.icon}</span>
                {mode.name}
              </button>
            ))}
            <div className="w-px h-4 bg-gray-600 mx-1"></div>
            <button
              onClick={clearSelection}
              className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
              title="Clear Selection (Esc)"
            >
              ✕
            </button>
          </div>
        )}
        
        {/* Undo/Redo Controls */}
        <div className="flex items-center space-x-1 bg-gray-900 rounded px-2 py-1">
          <button
            className={`px-2 py-1 rounded text-xs transition-colors ${
              undoAvailable 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            onClick={() => handleFileAction('Undo')}
            disabled={!undoAvailable}
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            className={`px-2 py-1 rounded text-xs transition-colors ${
              redoAvailable 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            onClick={() => handleFileAction('Redo')}
            disabled={!redoAvailable}
            title="Redo (Ctrl+Y)"
          >
            ↷
          </button>
        </div>
        
        {/* Selection Info */}
        {selectedIds.length > 0 && (
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-400">Selected:</span>
            <span className="text-blue-400 font-medium">{selectedIds.length} object{selectedIds.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};

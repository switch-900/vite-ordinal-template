// Top toolbar component with main tool categories
import React from 'react';
import { useScene } from '../../state/sceneStore.jsx';

export const TopToolbar = () => {
  const { viewMode, setSceneState } = useScene();

  const toolCategories = [
    { name: 'File', icon: '📁', items: ['New', 'Open', 'Save', 'Export'] },
    { name: 'Edit', icon: '✏️', items: ['Undo', 'Redo', 'Copy', 'Paste'] },
    { name: 'View', icon: '👁️', items: ['2D', '3D', 'Grid', 'Wireframe'] },
    { name: 'Draw', icon: '✏️', items: ['Line', 'Rectangle', 'Circle', 'Polygon'] },
    { name: 'Modify', icon: '🔧', items: ['Move', 'Rotate', 'Scale', 'Mirror'] },
    { name: 'Tools', icon: '🛠️', items: ['Measure', 'Text', 'Dimension'] },
  ];

  return (
    <div className="w-full bg-gray-800 border-b border-gray-700 shadow-lg">
      {/* Main Menu Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
        <div className="flex items-center space-x-1">
          <div className="text-orange-500 font-bold text-lg">3D Builder</div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setSceneState({ viewMode: '2d' })} 
            className={`px-3 py-1 rounded text-sm ${
              viewMode === '2d' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            2D Sketch
          </button>
          <button 
            onClick={() => setSceneState({ viewMode: '3d' })} 
            className={`px-3 py-1 rounded text-sm ${
              viewMode === '3d' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            3D Model
          </button>
        </div>
      </div>

      {/* Tool Categories */}
      <div className="flex items-center px-2 py-1 bg-gray-800 overflow-x-auto">
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
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 first:rounded-t last:rounded-b"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

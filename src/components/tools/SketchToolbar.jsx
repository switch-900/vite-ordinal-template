import React from 'react';
import { useScene } from '../../state/sceneStore.jsx';

const toolCategories = [
  {
    name: 'Basic',
    tools: [
      { name: 'Select', icon: '🖱️', key: 'S' },
      { name: 'Line', icon: '📏', key: 'L' },
      { name: 'Rectangle', icon: '⬛', key: 'R' },
      { name: 'Circle', icon: '⭕', key: 'C' },
    ]
  },
  {
    name: 'Advanced',
    tools: [
      { name: 'Polygon', icon: '🔺', key: 'P' },
      { name: 'Arc', icon: '🌙', key: 'A' },
      { name: 'Spline', icon: '〰️', key: 'SP' },
      { name: 'Path', icon: '✏️', key: 'PT' },
    ]
  },
  {
    name: 'Constraints',
    tools: [
      { name: 'Dimension', icon: '📐', key: 'D' },
      { name: 'Parallel', icon: '‖', key: 'PA' },
      { name: 'Perpendicular', icon: '⊥', key: 'PE' },
      { name: 'Equal', icon: '=', key: 'E' },
    ]
  }
];

export const SketchToolbar = () => {
  const { currentTool, setSceneState } = useScene();
  
  const handleToolSelect = (toolName) => {
    setSceneState({ currentTool: toolName });
  };

  return (
    <div className="absolute top-4 left-4 z-10 bg-gray-900 bg-opacity-95 rounded-lg shadow-lg p-3 max-w-xs">
      <div className="flex items-center mb-3">
        <span className="text-orange-400 text-sm font-semibold">2D Sketch Tools</span>
      </div>
      
      {toolCategories.map((category, categoryIndex) => (
        <div key={category.name} className={`${categoryIndex > 0 ? 'mt-3 pt-3 border-t border-gray-700' : ''}`}>
          <div className="text-gray-400 text-xs font-medium mb-2">{category.name}</div>
          <div className="grid grid-cols-2 gap-1">
            {category.tools.map((tool) => (
              <button
                key={tool.name}
                className={`px-2 py-1.5 rounded text-sm flex items-center space-x-1.5 transition-all ${
                  currentTool === tool.name 
                    ? 'bg-orange-600 text-white shadow-lg' 
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
                }`}
                onClick={() => handleToolSelect(tool.name)}
                title={`${tool.name} (${tool.key})`}
              >
                <span className="text-base">{tool.icon}</span>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium">{tool.name}</span>
                  <span className="text-xs opacity-60">{tool.key}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="text-gray-400 text-xs">
          Current: <span className="text-orange-400 font-medium">{currentTool}</span>
        </div>
      </div>
    </div>
  );
};
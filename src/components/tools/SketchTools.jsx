// 2D Sketch Tools for the sidebar
import React from 'react';
import { useScene } from '../../state/sceneStore.jsx';

export const SketchTools = () => {
  const { currentTool, setSceneState } = useScene();
  
  const toolCategories = [
    {
      name: 'Basic Drawing',
      tools: [
        { name: 'Select', icon: '🖱️', key: 'S', description: 'Select and modify objects' },
        { name: 'Line', icon: '📏', key: 'L', description: 'Draw straight lines' },
        { name: 'Rectangle', icon: '⬛', key: 'R', description: 'Draw rectangles' },
        { name: 'Circle', icon: '⭕', key: 'C', description: 'Draw circles' },
      ]
    },
    {
      name: 'Advanced Drawing',
      tools: [
        { name: 'Polygon', icon: '🔺', key: 'P', description: 'Draw polygons' },
        { name: 'Arc', icon: '🌙', key: 'A', description: 'Draw arcs' },
        { name: 'Spline', icon: '〰️', key: 'SP', description: 'Draw spline curves' },
        { name: 'Path', icon: '✏️', key: 'PT', description: 'Draw freehand paths' },
      ]
    },
    {
      name: 'Modify Tools',
      tools: [
        { name: 'Trim', icon: '✂️', key: 'T', description: 'Trim lines and curves' },
        { name: 'Extend', icon: '↔️', key: 'EX', description: 'Extend lines' },
        { name: 'Fillet', icon: '↪️', key: 'F', description: 'Create rounded corners' },
        { name: 'Offset', icon: '📐', key: 'O', description: 'Offset curves' },
      ]
    }
  ];

  const handleToolSelect = (toolName) => {
    setSceneState({ currentTool: toolName });
  };

  return (
    <div className="space-y-4">
      <div className="text-orange-400 text-sm font-semibold mb-3">
        2D Sketch Tools
      </div>
      
      {toolCategories.map((category, categoryIndex) => (
        <div key={category.name} className={`${categoryIndex > 0 ? 'mt-4 pt-4 border-t border-gray-700' : ''}`}>
          <div className="text-gray-400 text-xs font-medium mb-2">{category.name}</div>
          <div className="space-y-1">
            {category.tools.map((tool) => (
              <button
                key={tool.name}
                className={`w-full px-3 py-2 rounded text-sm flex items-center space-x-2 transition-all ${
                  currentTool === tool.name 
                    ? 'bg-orange-600 text-white shadow-lg' 
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
                }`}
                onClick={() => handleToolSelect(tool.name)}
                title={`${tool.description} (${tool.key})`}
              >
                <span className="text-lg">{tool.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{tool.name}</div>
                  <div className="text-xs opacity-60">{tool.key}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-gray-400 text-xs">
          Current Tool: <span className="text-orange-400 font-medium">{currentTool}</span>
        </div>
        <div className="text-gray-400 text-xs mt-1">
          Press keyboard shortcuts for quick tool switching
        </div>
      </div>
    </div>
  );
};

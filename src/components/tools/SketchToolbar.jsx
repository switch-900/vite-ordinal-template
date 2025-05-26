import React from 'react';
import { useScene } from '../../state/sceneStore.jsx';

const tools = [
  { name: 'Line', icon: '📏' },
  { name: 'Rectangle', icon: '⬛' },
  { name: 'Polygon', icon: '🔺' },
  { name: 'Path', icon: '✏️' },
  { name: 'Select', icon: '🖱️' },
];

export const SketchToolbar = () => {
  const { currentTool, setSceneState } = useScene();
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-2 bg-gray-900 bg-opacity-90 p-2 rounded-lg shadow-lg">
      <span className="text-white text-sm mr-2">Draw Tools:</span>
      {tools.map((tool) => (
        <button
          key={tool.name}
          className={`px-3 py-1 rounded flex items-center space-x-1 transition-colors ${
            currentTool === tool.name 
              ? 'bg-orange-600 text-white' 
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
          onClick={() => setSceneState({ currentTool: tool.name })}
        >
          <span>{tool.icon}</span>
          <span className="text-sm">{tool.name}</span>
        </button>
      ))}
    </div>
  );
};
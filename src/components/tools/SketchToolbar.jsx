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
    <div className="absolute top-2 right-2 z-10 flex flex-col space-y-2 bg-gray-900 bg-opacity-80 p-2 rounded shadow">
      {tools.map((tool) => (
        <button
          key={tool.name}
          className={`px-2 py-1 rounded flex items-center space-x-2 ${currentTool === tool.name ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-200'}`}
          onClick={() => setSceneState({ currentTool: tool.name })}
        >
          <span>{tool.icon}</span>
          <span>{tool.name}</span>
        </button>
      ))}
    </div>
  );
};
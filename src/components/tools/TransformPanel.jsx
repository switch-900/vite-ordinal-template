// Transform tools integrated into sidebar
import React from 'react';
import { useScene } from '../../state/sceneStore.jsx';

export const TransformPanel = () => {
  const { selectedIds, transformMode, setSceneState } = useScene();

  const transformModes = [
    { id: 'translate', icon: '↔️', name: 'Move', key: 'G', description: 'Move objects in 3D space' },
    { id: 'rotate', icon: '🔄', name: 'Rotate', key: 'R', description: 'Rotate objects around axes' },
    { id: 'scale', icon: '↗️', name: 'Scale', key: 'S', description: 'Scale objects uniformly or per axis' },
  ];

  const setTransformMode = (mode) => {
    setSceneState({ transformMode: mode });
  };

  if (selectedIds.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-orange-400 text-sm font-semibold mb-3">
          Transform Tools
        </div>
        <div className="text-gray-400 text-sm text-center py-8">
          Select objects to access transform tools
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-orange-400 text-sm font-semibold mb-3">
        Transform Tools
      </div>
      
      <div className="bg-gray-800 rounded p-3 mb-4">
        <div className="text-gray-300 text-sm font-medium mb-2">
          Selection: {selectedIds.length} object{selectedIds.length > 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="space-y-2">
        {transformModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setTransformMode(mode.id)}
            className={`w-full px-3 py-2 rounded text-sm flex items-center space-x-2 transition-all ${
              transformMode === mode.id
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
            }`}
            title={`${mode.description} (${mode.key})`}
          >
            <span className="text-lg">{mode.icon}</span>
            <div className="flex-1 text-left">
              <div className="font-medium">{mode.name}</div>
              <div className="text-xs opacity-60">{mode.key}</div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-gray-400 text-xs">
          Current Mode: <span className="text-orange-400 font-medium">{transformMode || 'translate'}</span>
        </div>
        <div className="text-gray-400 text-xs mt-1">
          Use keyboard shortcuts for quick switching
        </div>
      </div>
    </div>
  );
};

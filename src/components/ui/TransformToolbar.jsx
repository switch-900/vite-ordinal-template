import React from 'react';
import { useScene } from '../../state/sceneStore.jsx';

export const TransformToolbar = () => {
  const { selectedObjectId, transformMode = 'translate', setSceneState } = useScene();

  if (!selectedObjectId) {
    return null;
  }

  const setTransformMode = (mode) => {
    setSceneState({ transformMode: mode });
  };

  return (
    <div className="absolute top-16 left-2 z-10 bg-gray-800 bg-opacity-90 rounded-lg p-2">
      <div className="text-white text-sm font-medium mb-2">Transform</div>
      <div className="flex flex-col space-y-1">
        <button
          onClick={() => setTransformMode('translate')}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            transformMode === 'translate'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Move (G)
        </button>
        <button
          onClick={() => setTransformMode('rotate')}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            transformMode === 'rotate'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Rotate (R)
        </button>
        <button
          onClick={() => setTransformMode('scale')}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            transformMode === 'scale'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Scale (S)
        </button>
      </div>
    </div>
  );
};

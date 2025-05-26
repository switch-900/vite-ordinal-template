// Floating toolbar for quick access tools in the viewport
import React from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';

export const ViewportToolbar = () => {
  const { selectedIds, transformMode, setSceneState } = useScene();
  const { clearSelection } = useSceneActions();

  const transformModes = [
    { id: 'translate', icon: '↔', name: 'Move' },
    { id: 'rotate', icon: '🔄', name: 'Rotate' },
    { id: 'scale', icon: '↗', name: 'Scale' },
  ];

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-2 bg-gray-900 bg-opacity-90 p-2 rounded-lg shadow-lg">
      {/* Selection Info */}
      <div className="text-white text-sm px-2">
        {selectedIds.length === 0 ? (
          <span className="text-gray-400">No selection</span>
        ) : (
          <span>{selectedIds.length} selected</span>
        )}
      </div>

      {/* Separator */}
      {selectedIds.length > 0 && (
        <div className="w-px h-6 bg-gray-600"></div>
      )}

      {/* Transform Tools */}
      {selectedIds.length > 0 && (
        <>
          <div className="flex space-x-1">
            {transformModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSceneState({ transformMode: mode.id })}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  transformMode === mode.id
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={`${mode.name} (${mode.id === 'translate' ? 'G' : mode.id === 'rotate' ? 'R' : 'S'})`}
              >
                <span className="mr-1">{mode.icon}</span>
                {mode.name}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-600"></div>

          {/* Clear Selection */}
          <button
            onClick={clearSelection}
            className="px-3 py-1 rounded text-sm bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
            title="Clear Selection (Esc)"
          >
            ✕ Clear
          </button>
        </>
      )}
      
      {/* Transform Mode Indicator */}
      {selectedIds.length > 0 && (
        <>
          <div className="w-px h-6 bg-gray-600"></div>
          <div className="text-xs text-gray-400 px-2">
            Mode: <span className="text-orange-400 font-medium">{transformMode || 'translate'}</span>
          </div>
        </>
      )}
    </div>
  );
};

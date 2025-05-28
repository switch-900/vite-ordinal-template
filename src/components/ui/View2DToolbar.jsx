import React from 'react';
import { useScene } from '../../state/sceneStore.jsx';

export const View2DToolbar = () => {
  const { view2DMode, setSceneState } = useScene();

  const views = [
    { id: 'front', name: 'Front', icon: '📐', description: 'Front view (XY plane)' },
    { id: 'back', name: 'Back', icon: '📐', description: 'Back view (-XY plane)' },
    { id: 'right', name: 'Right', icon: '📏', description: 'Right view (ZY plane)' },
    { id: 'left', name: 'Left', icon: '📏', description: 'Left view (-ZY plane)' },
    { id: 'top', name: 'Top', icon: '⬛', description: 'Top view (XZ plane)' },
    { id: 'bottom', name: 'Bottom', icon: '⬛', description: 'Bottom view (-XZ plane)' },
  ];

  const handleViewChange = (viewId) => {
    setSceneState({ view2DMode: viewId });
  };

  return (
    <div className="absolute top-16 left-4 z-20 bg-gray-900 bg-opacity-95 rounded-lg shadow-xl border border-gray-700 p-3">
      <div className="text-white text-sm font-semibold mb-2 flex items-center">
        <span className="mr-2">👁️</span>
        2D Orthographic Views
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => handleViewChange(view.id)}
            className={`px-3 py-2 rounded text-sm font-medium transition-all ${
              view2DMode === view.id
                ? 'bg-orange-600 text-white shadow-lg ring-2 ring-orange-400'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
            title={view.description}
          >
            <div className="flex items-center justify-center">
              <span className="mr-1">{view.icon}</span>
              <span>{view.name}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-600 text-xs text-gray-400">
        <div className="mb-1">
          <strong>Current:</strong> {views.find(v => v.id === view2DMode)?.name} View
        </div>
        <div>
          Draw 2D shapes, then extrude to 3D
        </div>
      </div>
    </div>
  );
};

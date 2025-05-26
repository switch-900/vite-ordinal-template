import React from 'react';
import { useScene } from '../state/sceneStore.jsx';

export const DebugInfo = () => {
  const { objects, selectedIds, viewMode, showGrid, gridSize } = useScene();

  return (
    <div className="fixed top-2 right-2 bg-black/80 text-white p-4 rounded-lg text-sm font-mono z-50 max-w-xs">
      <h3 className="text-green-400 font-bold mb-2">Debug Info</h3>
      <div>Objects: {objects.length}</div>
      <div>Selected: {selectedIds.length}</div>
      <div>View Mode: {viewMode}</div>
      <div>Show Grid: {showGrid ? 'Yes' : 'No'}</div>
      <div>Grid Size: {gridSize}</div>
      <div className="mt-2">
        <div className="text-yellow-400">Objects List:</div>
        {objects.length === 0 ? (
          <div className="text-gray-400">No objects</div>
        ) : (
          objects.map(obj => (
            <div key={obj.id} className="text-xs">
              {obj.name || obj.id} ({obj.geometry})
            </div>
          ))
        )}
      </div>
    </div>
  );
};

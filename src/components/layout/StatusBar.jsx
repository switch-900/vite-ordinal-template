// Status bar at the bottom showing current state and statistics
import React from 'react';
import { useScene } from '../../state/sceneStore.jsx';

export const StatusBar = () => {
  const { objects, selectedIds, viewMode, currentTool, snapToGrid, gridSize } = useScene();
  
  const selectedCount = selectedIds.length;
  const totalObjects = objects.length;
  const visibleObjects = objects.filter(obj => obj.visible).length;

  return (
    <div className="bg-gray-900 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-sm text-gray-400">
      {/* Left side - Object counts and selection info */}
      <div className="flex items-center space-x-4">
        <span>Objects: {visibleObjects}/{totalObjects}</span>
        {selectedCount > 0 && (
          <span className="text-orange-400">Selected: {selectedCount}</span>
        )}
        <span>Mode: {viewMode.toUpperCase()}</span>
        {viewMode === '2d' && (
          <span>Tool: {currentTool}</span>
        )}
      </div>

      {/* Center - Current action or tip */}
      <div className="text-center flex-1">
        {selectedCount === 0 ? (
          <span>Select objects to modify them</span>
        ) : (
          <span>Use transform tools or edit properties in the sidebar</span>
        )}
      </div>

      {/* Right side - Settings and coordinates */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${snapToGrid ? 'bg-green-500' : 'bg-gray-600'}`}></span>
          <span>Grid: {gridSize}m</span>
        </div>
        <span>Coords: [0, 0, 0]</span>
      </div>
    </div>
  );
};

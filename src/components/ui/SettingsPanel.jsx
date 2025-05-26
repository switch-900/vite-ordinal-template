import React, { useState } from 'react';
import { useScene } from '../../state/sceneStore.jsx';

export const SettingsPanel = () => {
  const { snapToGrid, gridSize, showGrid, setSceneState } = useScene();
  const [showPanel, setShowPanel] = useState(false);

  const updateSetting = (key, value) => {
    setSceneState({ [key]: value });
  };

  if (!showPanel) {
    return (
      <button
        className="absolute top-2 right-2 px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        onClick={() => setShowPanel(true)}
        title="Settings"
      >
        ⚙️
      </button>
    );
  }

  return (
    <div className="absolute top-2 right-2 w-64 bg-gray-900 bg-opacity-95 text-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold">Settings</h3>
        <button
          className="text-gray-400 hover:text-white"
          onClick={() => setShowPanel(false)}
        >
          ✕
        </button>
      </div>

      {/* Grid Settings */}
      <div className="mb-4">
        <h4 className="text-xs text-gray-400 mb-2">Grid & Snap</h4>
        
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs">Show Grid</label>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => updateSetting('showGrid', e.target.checked)}
            className="w-4 h-4"
          />
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs">Snap to Grid</label>
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={(e) => updateSetting('snapToGrid', e.target.checked)}
            className="w-4 h-4"
          />
        </div>
        
        <div className="mb-2">
          <label className="block text-xs text-gray-400 mb-1">
            Grid Size: {gridSize}
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={gridSize}
            onChange={(e) => updateSetting('gridSize', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Performance Settings */}
      <div className="mb-4">
        <h4 className="text-xs text-gray-400 mb-2">Performance</h4>
        
        <div className="text-xs text-gray-300">
          <div>Objects: {useScene().objects.length}</div>
          <div>Selected: {useScene().selectedIds.length}</div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mb-4">
        <h4 className="text-xs text-gray-400 mb-2">Shortcuts</h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div><kbd className="bg-gray-700 px-1 rounded">G</kbd> - Translate</div>
          <div><kbd className="bg-gray-700 px-1 rounded">R</kbd> - Rotate</div>
          <div><kbd className="bg-gray-700 px-1 rounded">S</kbd> - Scale</div>
          <div><kbd className="bg-gray-700 px-1 rounded">Esc</kbd> - Deselect</div>
          <div><kbd className="bg-gray-700 px-1 rounded">Del</kbd> - Delete</div>
        </div>
      </div>

      <button
        className="w-full px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        onClick={() => setShowPanel(false)}
      >
        Close
      </button>
    </div>
  );
};

// Enhanced snapping and alignment tools for precision CAD modeling
import React, { useState, useCallback, useEffect } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';

export const SnapAndAlign = () => {
  const { selectedIds, objects, snapSettings } = useScene();
  const { setSceneState, updateObject } = useSceneActions();
  
  const [showPanel, setShowPanel] = useState(false);
  const [snapMode, setSnapMode] = useState('grid'); // 'grid', 'object', 'vertex', 'edge', 'center'
  const [alignMode, setAlignMode] = useState('center'); // 'left', 'right', 'center', 'top', 'bottom', 'middle'

  // Default snap settings
  const defaultSnapSettings = {
    enabled: true,
    gridSnap: true,
    objectSnap: true,
    vertexSnap: true,
    edgeSnap: true,
    gridSize: 0.5,
    snapDistance: 0.25,
    showSnapIndicators: true,
    ...snapSettings
  };

  // Update snap settings
  const updateSnapSettings = useCallback((newSettings) => {
    setSceneState({ 
      snapSettings: { 
        ...defaultSnapSettings, 
        ...newSettings 
      } 
    });
  }, [setSceneState, defaultSnapSettings]);

  // Toggle specific snap mode
  const toggleSnapMode = useCallback((mode) => {
    const newSettings = { ...defaultSnapSettings };
    newSettings[`${mode}Snap`] = !newSettings[`${mode}Snap`];
    updateSnapSettings(newSettings);
  }, [defaultSnapSettings, updateSnapSettings]);

  // Align selected objects
  const alignObjects = useCallback((alignType) => {
    if (selectedIds.length < 2) return;

    const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
    if (selectedObjects.length < 2) return;

    // Calculate bounds for alignment
    const bounds = selectedObjects.reduce((acc, obj) => {
      const pos = obj.position || [0, 0, 0];
      return {
        minX: Math.min(acc.minX, pos[0]),
        maxX: Math.max(acc.maxX, pos[0]),
        minY: Math.min(acc.minY, pos[1]),
        maxY: Math.max(acc.maxY, pos[1]),
        minZ: Math.min(acc.minZ, pos[2]),
        maxZ: Math.max(acc.maxZ, pos[2])
      };
    }, {
      minX: Infinity, maxX: -Infinity,
      minY: Infinity, maxY: -Infinity,
      minZ: Infinity, maxZ: -Infinity
    });

    // Calculate alignment target
    let targetX, targetY, targetZ;
    switch (alignType) {
      case 'left':
        targetX = bounds.minX;
        break;
      case 'right':
        targetX = bounds.maxX;
        break;
      case 'centerX':
        targetX = (bounds.minX + bounds.maxX) / 2;
        break;
      case 'top':
        targetY = bounds.maxY;
        break;
      case 'bottom':
        targetY = bounds.minY;
        break;
      case 'centerY':
        targetY = (bounds.minY + bounds.maxY) / 2;
        break;
      case 'front':
        targetZ = bounds.maxZ;
        break;
      case 'back':
        targetZ = bounds.minZ;
        break;
      case 'centerZ':
        targetZ = (bounds.minZ + bounds.maxZ) / 2;
        break;
    }

    // Update object positions
    selectedObjects.forEach(obj => {
      const newPosition = [...(obj.position || [0, 0, 0])];
      if (targetX !== undefined) newPosition[0] = targetX;
      if (targetY !== undefined) newPosition[1] = targetY;
      if (targetZ !== undefined) newPosition[2] = targetZ;
      
      updateObject(obj.id, { position: newPosition });
    });

    console.log(`✅ Aligned ${selectedObjects.length} objects: ${alignType}`);
  }, [selectedIds, objects, updateObject]);

  // Distribute objects evenly
  const distributeObjects = useCallback((axis) => {
    if (selectedIds.length < 3) return;

    const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
    if (selectedObjects.length < 3) return;

    // Sort by position on the specified axis
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
    const sorted = [...selectedObjects].sort((a, b) => 
      (a.position?.[axisIndex] || 0) - (b.position?.[axisIndex] || 0)
    );

    const first = sorted[0].position?.[axisIndex] || 0;
    const last = sorted[sorted.length - 1].position?.[axisIndex] || 0;
    const step = (last - first) / (sorted.length - 1);

    // Update positions
    sorted.forEach((obj, index) => {
      if (index === 0 || index === sorted.length - 1) return; // Keep first and last
      
      const newPosition = [...(obj.position || [0, 0, 0])];
      newPosition[axisIndex] = first + (step * index);
      updateObject(obj.id, { position: newPosition });
    });

    console.log(`✅ Distributed ${selectedObjects.length} objects along ${axis}-axis`);
  }, [selectedIds, objects, updateObject]);

  // Grid snap helper
  const snapToGrid = useCallback(() => {
    if (selectedIds.length === 0) return;

    const gridSize = defaultSnapSettings.gridSize;
    selectedIds.forEach(id => {
      const obj = objects.find(o => o.id === id);
      if (!obj) return;

      const pos = obj.position || [0, 0, 0];
      const snappedPosition = pos.map(coord => 
        Math.round(coord / gridSize) * gridSize
      );

      updateObject(id, { position: snappedPosition });
    });

    console.log(`✅ Snapped ${selectedIds.length} objects to grid`);
  }, [selectedIds, objects, updateObject, defaultSnapSettings.gridSize]);

  if (!showPanel) {
    return (
      <button
        className="fixed right-4 top-32 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-200 z-50"
        onClick={() => setShowPanel(true)}
        title="Snap & Align Tools"
      >
        📐 Snap
      </button>
    );
  }

  return (
    <div className="fixed right-4 top-32 w-72 bg-gray-900 bg-opacity-95 text-white p-4 rounded-lg shadow-xl border border-gray-700 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center">
          <span className="mr-2">📐</span>
          Snap & Align
        </h3>
        <button
          className="text-gray-400 hover:text-white transition-colors"
          onClick={() => setShowPanel(false)}
        >
          ✕
        </button>
      </div>

      {/* Snap Settings */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Snap Settings:</h4>
        <div className="space-y-2">
          {[
            { key: 'grid', label: '🔲 Grid Snap', color: 'blue' },
            { key: 'object', label: '📦 Object Snap', color: 'green' },
            { key: 'vertex', label: '📍 Vertex Snap', color: 'orange' },
            { key: 'edge', label: '📏 Edge Snap', color: 'purple' }
          ].map(({ key, label, color }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <button
                onClick={() => toggleSnapMode(key)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  defaultSnapSettings[`${key}Snap`]
                    ? `bg-${color}-600 text-white`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {defaultSnapSettings[`${key}Snap`] ? 'ON' : 'OFF'}
              </button>
            </div>
          ))}
        </div>

        {/* Grid Size Control */}
        <div className="mt-3">
          <label className="block text-xs text-gray-400 mb-1">
            Grid Size: {defaultSnapSettings.gridSize}
          </label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={defaultSnapSettings.gridSize}
            onChange={(e) => updateSnapSettings({ gridSize: parseFloat(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      {/* Quick Snap Actions */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Quick Actions:</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={snapToGrid}
            disabled={selectedIds.length === 0}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-xs rounded transition-colors"
          >
            🔲 Snap to Grid
          </button>
          <button
            onClick={() => updateSnapSettings({ enabled: !defaultSnapSettings.enabled })}
            className={`px-3 py-2 text-xs rounded transition-colors ${
              defaultSnapSettings.enabled
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {defaultSnapSettings.enabled ? '✅ Snap ON' : '❌ Snap OFF'}
          </button>
        </div>
      </div>

      {/* Alignment Tools */}
      {selectedIds.length >= 2 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">
            Align ({selectedIds.length} selected):
          </h4>
          <div className="grid grid-cols-3 gap-1 mb-2">
            {[
              { action: 'left', label: '←', title: 'Align Left' },
              { action: 'centerX', label: '↔', title: 'Center Horizontally' },
              { action: 'right', label: '→', title: 'Align Right' },
              { action: 'top', label: '↑', title: 'Align Top' },
              { action: 'centerY', label: '↕', title: 'Center Vertically' },
              { action: 'bottom', label: '↓', title: 'Align Bottom' }
            ].map(({ action, label, title }) => (
              <button
                key={action}
                onClick={() => alignObjects(action)}
                title={title}
                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-xs rounded transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Distribution Tools */}
      {selectedIds.length >= 3 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">
            Distribute ({selectedIds.length} selected):
          </h4>
          <div className="flex space-x-2">
            {[
              { axis: 'x', label: '↔ X-Axis' },
              { axis: 'y', label: '↕ Y-Axis' },
              { axis: 'z', label: '⚡ Z-Axis' }
            ].map(({ axis, label }) => (
              <button
                key={axis}
                onClick={() => distributeObjects(axis)}
                className="flex-1 px-2 py-1 bg-orange-600 hover:bg-orange-700 text-xs rounded transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Help */}
      <div className="text-xs text-gray-400">
        💡 Select objects to enable alignment and distribution tools
      </div>
    </div>
  );
};

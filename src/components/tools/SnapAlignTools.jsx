// Integrated snap and alignment tools (replaces floating SnapAndAlign)
import React, { useState, useCallback } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';

export const SnapAlignTools = () => {
  const { selectedIds, objects, snapSettings } = useScene();
  const { setSceneState, updateObject } = useSceneActions();
  
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

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const centerZ = (bounds.minZ + bounds.maxZ) / 2;

    // Apply alignment
    selectedObjects.forEach(obj => {
      const newPosition = [...(obj.position || [0, 0, 0])];
      
      switch (alignType) {
        case 'left':
          newPosition[0] = bounds.minX;
          break;
        case 'right':
          newPosition[0] = bounds.maxX;
          break;
        case 'centerX':
          newPosition[0] = centerX;
          break;
        case 'top':
          newPosition[1] = bounds.maxY;
          break;
        case 'bottom':
          newPosition[1] = bounds.minY;
          break;
        case 'centerY':
          newPosition[1] = centerY;
          break;
        case 'front':
          newPosition[2] = bounds.maxZ;
          break;
        case 'back':
          newPosition[2] = bounds.minZ;
          break;
        case 'centerZ':
          newPosition[2] = centerZ;
          break;
      }

      updateObject(obj.id, { position: newPosition });
    });

    console.log(`✅ Aligned ${selectedObjects.length} objects ${alignType}`);
  }, [selectedIds, objects, updateObject]);

  // Distribute objects evenly
  const distributeObjects = useCallback((axis) => {
    if (selectedIds.length < 3) return;

    const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
    if (selectedObjects.length < 3) return;

    // Sort objects by position on the specified axis
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
    const sortedObjects = [...selectedObjects].sort((a, b) => {
      const posA = (a.position || [0, 0, 0])[axisIndex];
      const posB = (b.position || [0, 0, 0])[axisIndex];
      return posA - posB;
    });

    const firstPos = (sortedObjects[0].position || [0, 0, 0])[axisIndex];
    const lastPos = (sortedObjects[sortedObjects.length - 1].position || [0, 0, 0])[axisIndex];
    const totalDistance = lastPos - firstPos;
    const spacing = totalDistance / (sortedObjects.length - 1);

    // Update positions
    sortedObjects.forEach((obj, index) => {
      if (index === 0 || index === sortedObjects.length - 1) return; // Don't move first and last objects
      
      const newPosition = [...(obj.position || [0, 0, 0])];
      newPosition[axisIndex] = firstPos + (spacing * index);
      updateObject(obj.id, { position: newPosition });
    });

    console.log(`✅ Distributed ${selectedObjects.length} objects along ${axis.toUpperCase()} axis`);
  }, [selectedIds, objects, updateObject]);

  // Snap modes configuration
  const snapModes = [
    { id: 'grid', name: 'Grid', icon: '⊞', description: 'Snap to grid intersections' },
    { id: 'object', name: 'Object', icon: '📦', description: 'Snap to object edges' },
    { id: 'vertex', name: 'Vertex', icon: '⚫', description: 'Snap to vertices' },
    { id: 'edge', name: 'Edge', icon: '📏', description: 'Snap to edge midpoints' },
  ];

  // Alignment tools
  const alignmentTools = [
    { id: 'left', name: 'Left', icon: '⬅️', axis: 'x' },
    { id: 'centerX', name: 'Center X', icon: '↔️', axis: 'x' },
    { id: 'right', name: 'Right', icon: '➡️', axis: 'x' },
    { id: 'top', name: 'Top', icon: '⬆️', axis: 'y' },
    { id: 'centerY', name: 'Center Y', icon: '↕️', axis: 'y' },
    { id: 'bottom', name: 'Bottom', icon: '⬇️', axis: 'y' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white text-sm font-bold flex items-center">
          <span className="mr-2">🧲</span>
          Snap & Align
        </h3>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${defaultSnapSettings.enabled ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          <span className="text-xs text-gray-400">{defaultSnapSettings.enabled ? 'ON' : 'OFF'}</span>
        </div>
      </div>

      {/* Master Snap Toggle */}
      <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
        <span className="text-sm text-gray-300">Enable Snapping</span>
        <button
          onClick={() => updateSnapSettings({ enabled: !defaultSnapSettings.enabled })}
          className={`w-10 h-6 rounded-full transition-colors ${
            defaultSnapSettings.enabled ? 'bg-green-600' : 'bg-gray-600'
          }`}
        >
          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
            defaultSnapSettings.enabled ? 'translate-x-5' : 'translate-x-1'
          }`}></div>
        </button>
      </div>

      {/* Snap Modes */}
      <div>
        <div className="text-xs text-gray-400 mb-2">Snap Modes:</div>
        <div className="grid grid-cols-2 gap-1">
          {snapModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => toggleSnapMode(mode.id)}
              className={`p-2 text-xs rounded transition-colors ${
                defaultSnapSettings[`${mode.id}Snap`]
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={mode.description}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm">{mode.icon}</span>
                <span>{mode.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Snap Settings */}
      <div>
        <div className="text-xs text-gray-400 mb-2">Settings:</div>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-300 block mb-1">
              Grid Size: {defaultSnapSettings.gridSize}
            </label>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={defaultSnapSettings.gridSize}
              onChange={(e) => updateSnapSettings({ gridSize: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-300 block mb-1">
              Snap Distance: {defaultSnapSettings.snapDistance}
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={defaultSnapSettings.snapDistance}
              onChange={(e) => updateSnapSettings({ snapDistance: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Alignment Tools */}
      {selectedIds.length >= 2 && (
        <div>
          <div className="text-xs text-gray-400 mb-2">
            Align ({selectedIds.length} objects):
          </div>
          <div className="grid grid-cols-3 gap-1">
            {alignmentTools.map(tool => (
              <button
                key={tool.id}
                onClick={() => alignObjects(tool.id)}
                className="p-2 text-xs bg-gray-700 hover:bg-purple-600 rounded transition-colors"
                title={`Align ${tool.name}`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm">{tool.icon}</span>
                  <span>{tool.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Distribution Tools */}
      {selectedIds.length >= 3 && (
        <div>
          <div className="text-xs text-gray-400 mb-2">Distribute:</div>
          <div className="grid grid-cols-3 gap-1">
            {['x', 'y', 'z'].map(axis => (
              <button
                key={axis}
                onClick={() => distributeObjects(axis)}
                className="p-2 text-xs bg-gray-700 hover:bg-green-600 rounded transition-colors"
                title={`Distribute along ${axis.toUpperCase()} axis`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm">📐</span>
                  <span>{axis.toUpperCase()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
        💡 Select 2+ objects for alignment • 3+ for distribution
      </div>
    </div>
  );
};

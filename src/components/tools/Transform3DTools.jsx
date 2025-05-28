// Enhanced Transform Tools with scale, rotate, move and advanced options
import React, { useState } from 'react';
import { useScene } from '../../state/sceneStore.jsx';

export const Transform3DTools = () => {
  const { selectedIds, transformMode, setSceneState, objects } = useScene();
  const [transformAxis, setTransformAxis] = useState('all');
  const [transformSpace, setTransformSpace] = useState('world');
  const [snapSettings, setSnapSettings] = useState({
    enabled: true,
    gridSnap: true,
    angleSnap: true,
    distanceSnap: false,
    gridSize: 1,
    angleStep: 15
  });

  const transformModes = [
    { 
      id: 'translate', 
      icon: '↔️', 
      name: 'Move', 
      key: 'G', 
      description: 'Move objects in 3D space',
      color: 'bg-blue-600'
    },
    { 
      id: 'rotate', 
      icon: '🔄', 
      name: 'Rotate', 
      key: 'R', 
      description: 'Rotate objects around axes',
      color: 'bg-green-600'
    },
    { 
      id: 'scale', 
      icon: '↗️', 
      name: 'Scale', 
      key: 'S', 
      description: 'Scale objects uniformly or per axis',
      color: 'bg-purple-600'
    },
  ];

  const axisConstraints = [
    { id: 'all', name: 'Free', icon: '🎯', description: 'All axes' },
    { id: 'x', name: 'X-Axis', icon: '🔴', description: 'X axis only' },
    { id: 'y', name: 'Y-Axis', icon: '🟢', description: 'Y axis only' },
    { id: 'z', name: 'Z-Axis', icon: '🔵', description: 'Z axis only' },
    { id: 'xy', name: 'XY Plane', icon: '🟡', description: 'XY plane' },
    { id: 'xz', name: 'XZ Plane', icon: '🟠', description: 'XZ plane' },
    { id: 'yz', name: 'YZ Plane', icon: '🟣', description: 'YZ plane' },
  ];

  const setTransformMode = (mode) => {
    setSceneState({ transformMode: mode });
  };

  const setAxisConstraint = (axis) => {
    setTransformAxis(axis);
    setSceneState({ transformAxis: axis });
  };

  const toggleSnapSetting = (setting) => {
    setSnapSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const updateSnapValue = (setting, value) => {
    setSnapSettings(prev => ({
      ...prev,
      [setting]: parseFloat(value) || 0
    }));
  };

  const resetTransform = () => {
    setSceneState({ 
      transformMode: 'translate',
      transformAxis: 'all'
    });
    setTransformAxis('all');
  };

  const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
  const hasSelection = selectedIds.length > 0;

  if (!hasSelection) {
    return (
      <div className="space-y-4">
        <div className="text-orange-400 text-sm font-semibold mb-3">
          3D Transform Tools
        </div>
        <div className="text-gray-400 text-sm text-center py-8 bg-gray-800 rounded">
          <div className="text-2xl mb-2">🔧</div>
          <div>Select objects to access transform tools</div>
          <div className="text-xs mt-2 opacity-60">
            Move, rotate, scale in 3D space
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-orange-400 text-sm font-semibold mb-3">
        3D Transform Tools
      </div>
      
      <div className="bg-gray-800 rounded p-3 mb-4">
        <div className="text-gray-300 text-sm font-medium mb-1">
          Selection: {selectedIds.length} object{selectedIds.length > 1 ? 's' : ''}
        </div>
        <div className="text-gray-400 text-xs">
          Current: {transformMode || 'translate'} • {transformAxis || 'all'} axis
        </div>
      </div>
      
      {/* Transform Modes */}
      <div className="space-y-2">
        <div className="text-gray-300 text-sm font-medium">Transform Mode:</div>
        {transformModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setTransformMode(mode.id)}
            className={`w-full px-3 py-2 rounded text-sm flex items-center space-x-2 transition-all ${
              transformMode === mode.id
                ? `${mode.color} text-white shadow-lg`
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
            }`}
            title={`${mode.description} (${mode.key})`}
          >
            <span className="text-lg">{mode.icon}</span>
            <div className="flex-1 text-left">
              <div className="font-medium">{mode.name}</div>
              <div className="text-xs opacity-60">Press {mode.key}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Axis Constraints */}
      <div className="space-y-2">
        <div className="text-gray-300 text-sm font-medium">Axis Constraint:</div>
        <div className="grid grid-cols-2 gap-1">
          {axisConstraints.map((axis) => (
            <button
              key={axis.id}
              onClick={() => setAxisConstraint(axis.id)}
              className={`px-2 py-1 rounded text-xs flex items-center space-x-1 transition-all ${
                transformAxis === axis.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
              title={axis.description}
            >
              <span>{axis.icon}</span>
              <span>{axis.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Transform Space */}
      <div className="space-y-2">
        <div className="text-gray-300 text-sm font-medium">Transform Space:</div>
        <div className="flex space-x-1">
          {['world', 'local'].map(space => (
            <button
              key={space}
              onClick={() => setTransformSpace(space)}
              className={`flex-1 px-2 py-1 rounded text-xs transition-all ${
                transformSpace === space
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              {space.charAt(0).toUpperCase() + space.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Snap Settings */}
      <div className="space-y-2 pt-2 border-t border-gray-700">
        <div className="text-gray-300 text-sm font-medium">Snap Settings:</div>
        
        <div className="space-y-2">
          {Object.entries({
            gridSnap: 'Grid Snap',
            angleSnap: 'Angle Snap',
            distanceSnap: 'Distance Snap'
          }).map(([key, label]) => (
            <label key={key} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={snapSettings[key]}
                onChange={() => toggleSnapSetting(key)}
                className="rounded"
              />
              <span className="text-gray-300">{label}</span>
            </label>
          ))}
        </div>

        {snapSettings.gridSnap && (
          <div className="space-y-1">
            <label className="text-gray-300 text-xs">Grid Size:</label>
            <input
              type="number"
              value={snapSettings.gridSize}
              onChange={(e) => updateSnapValue('gridSize', e.target.value)}
              min="0.1"
              step="0.1"
              className="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs"
            />
          </div>
        )}

        {snapSettings.angleSnap && (
          <div className="space-y-1">
            <label className="text-gray-300 text-xs">Angle Step (°):</label>
            <input
              type="number"
              value={snapSettings.angleStep}
              onChange={(e) => updateSnapValue('angleStep', e.target.value)}
              min="1"
              step="1"
              className="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs"
            />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 pt-2 border-t border-gray-700">
        <button
          onClick={resetTransform}
          className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded text-sm"
        >
          Reset Transform Mode
        </button>
      </div>

      <div className="text-gray-400 text-xs space-y-1">
        <div>• Use G, R, S keys for quick mode switching</div>
        <div>• X, Y, Z keys for axis constraints</div>
        <div>• Hold Shift for precision mode</div>
      </div>
    </div>
  );
};

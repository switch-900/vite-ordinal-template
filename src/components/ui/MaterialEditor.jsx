import React, { useState } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';

export const MaterialEditor = () => {
  const { selectedObjectId, objects } = useScene();
  const { updateObject } = useSceneActions();
  const [showPanel, setShowPanel] = useState(false);

  const selectedObject = selectedObjectId ? objects.find(obj => obj.id === selectedObjectId) : null;

  const updateMaterial = (property, value) => {
    if (selectedObject) {
      updateObject(selectedObject.id, {
        material: {
          ...selectedObject.material,
          [property]: value
        }
      });
    }
  };

  if (!showPanel) {
    return (
      <button
        className={`absolute right-2 top-32 px-3 py-2 rounded text-white ${
          selectedObject ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 cursor-not-allowed'
        }`}
        onClick={() => selectedObject && setShowPanel(true)}
        disabled={!selectedObject}
        title={selectedObject ? 'Material Editor' : 'Select an object to edit materials'}
      >
        Materials
      </button>
    );
  }

  const material = selectedObject?.material || {};

  return (
    <div className="absolute right-2 top-32 w-72 bg-gray-900 bg-opacity-95 text-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold">Material Editor</h3>
        <button
          className="text-gray-400 hover:text-white"
          onClick={() => setShowPanel(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-2">
          Object: {selectedObject?.type || selectedObject?.geometry} ({selectedObject?.id.slice(0, 8)}...)
        </p>
      </div>

      {/* Color */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Color:</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={material.color || '#808080'}
            onChange={(e) => updateMaterial('color', e.target.value)}
            className="w-8 h-8 rounded border border-gray-600"
          />
          <input
            type="text"
            value={material.color || '#808080'}
            onChange={(e) => updateMaterial('color', e.target.value)}
            className="flex-1 px-2 py-1 bg-gray-800 text-white rounded text-xs"
            placeholder="#808080"
          />
        </div>
      </div>

      {/* Metalness */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">
          Metalness: {(material.metalness || 0.1).toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={material.metalness || 0.1}
          onChange={(e) => updateMaterial('metalness', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Roughness */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">
          Roughness: {(material.roughness || 0.8).toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={material.roughness || 0.8}
          onChange={(e) => updateMaterial('roughness', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Opacity */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">
          Opacity: {(material.opacity || 1.0).toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={material.opacity || 1.0}
          onChange={(e) => updateMaterial('opacity', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Emissive */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Emissive:</label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={material.emissive || '#000000'}
            onChange={(e) => updateMaterial('emissive', e.target.value)}
            className="w-8 h-8 rounded border border-gray-600"
          />
          <input
            type="text"
            value={material.emissive || '#000000'}
            onChange={(e) => updateMaterial('emissive', e.target.value)}
            className="flex-1 px-2 py-1 bg-gray-800 text-white rounded text-xs"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Emissive Intensity */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">
          Emissive Intensity: {(material.emissiveIntensity || 0.0).toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={material.emissiveIntensity || 0.0}
          onChange={(e) => updateMaterial('emissiveIntensity', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Material Presets */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Presets:</label>
        <div className="grid grid-cols-2 gap-1">
          <button
            className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
            onClick={() => {
              updateMaterial('color', '#808080');
              updateMaterial('metalness', 0.0);
              updateMaterial('roughness', 0.9);
            }}
          >
            Plastic
          </button>
          <button
            className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
            onClick={() => {
              updateMaterial('color', '#c0c0c0');
              updateMaterial('metalness', 1.0);
              updateMaterial('roughness', 0.2);
            }}
          >
            Metal
          </button>
          <button
            className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
            onClick={() => {
              updateMaterial('color', '#8B4513');
              updateMaterial('metalness', 0.0);
              updateMaterial('roughness', 0.8);
            }}
          >
            Wood
          </button>
          <button
            className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
            onClick={() => {
              updateMaterial('color', '#ffffff');
              updateMaterial('metalness', 0.0);
              updateMaterial('roughness', 0.1);
              updateMaterial('opacity', 0.3);
            }}
          >
            Glass
          </button>
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

import { useState, useEffect, useCallback } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';

// Simple debounce function to limit state updates
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export const MaterialEditor = () => {
  const { selectedObjectId, objects, selectedIds } = useScene();
  const { updateObject } = useSceneActions();
  const [localMaterial, setLocalMaterial] = useState({});
  const [localAngle, setLocalAngle] = useState(0.1);
  
  // Get the currently selected object
  const selectedObject = selectedObjectId ? objects.find(obj => obj.id === selectedObjectId) : 
                         selectedIds.length > 0 ? objects.find(obj => obj.id === selectedIds[0]) : null;

  // Update local material state when selection changes
  useEffect(() => {
    if (selectedObject && selectedObject.material) {
      setLocalMaterial({...selectedObject.material});
      // Set angle from object if available
      setLocalAngle(selectedObject.angle || 0.1);
    } else {
      setLocalMaterial({
        color: '#808080',
        metalness: 0.1,
        roughness: 0.8,
        opacity: 1.0,
        emissive: '#000000',
        emissiveIntensity: 0
      });
      setLocalAngle(0.1);
    }
  }, [selectedObject, selectedObjectId, selectedIds]);
  
  // Debounced update to prevent too many state changes - reduced delay for better responsiveness
  const debouncedUpdate = useCallback(
    debounce((id, updates) => {
      updateObject(id, updates);
    }, 16), // Reduced from 100ms to 16ms (60fps) for more responsive updates
    []
  );
  
  // Update angle with debouncing
  const updateAngle = (value) => {
    if (!selectedObject) return;
    
    // Update local state immediately for responsive UI
    setLocalAngle(value);
    
    // Update object in store with debouncing
    debouncedUpdate(selectedObject.id, { angle: value });
  };

  const updateMaterial = (property, value) => {
    if (!selectedObject) return;
    
    // Update local state immediately for responsive UI
    setLocalMaterial(prev => {
      const newMaterial = { ...prev, [property]: value };
      
      // Only send update to store after a small delay
      debouncedUpdate(selectedObject.id, { material: newMaterial });
      
      return newMaterial;
    });
  };
  
  // The updateAngle function is already defined above

  if (!selectedObject) {
    return (
      <div className="text-gray-400 text-center py-8">
        <div className="text-4xl mb-2">🎨</div>
        <p>Select an object to edit materials</p>
      </div>
    );
  }

  const material = selectedObject?.material || {};

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white text-sm font-bold">Material Editor</h3>
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

      {/* Shape Angle Modifier */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1">
          Shape Angle: {localAngle.toFixed(2)}
        </label>
        <input
          type="range"
          min="0.01"
          max="0.99"
          step="0.01"
          value={localAngle}
          onChange={(e) => updateAngle(parseFloat(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-gray-500 mt-1">Modifies the shape's angles and curves</p>
      </div>

      {/* Material Presets */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Presets:</label>
        <div className="grid grid-cols-2 gap-1">
          <button
            className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
            onClick={() => {
              // Apply plastic preset all at once
              const newMaterial = {
                ...selectedObject.material,
                color: '#808080',
                metalness: 0.0,
                roughness: 0.9
              };
              updateObject(selectedObject.id, { material: newMaterial });
            }}
          >
            Plastic
          </button>
          <button
            className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
            onClick={() => {
              // Apply metal preset all at once
              const newMaterial = {
                ...selectedObject.material,
                color: '#c0c0c0',
                metalness: 1.0,
                roughness: 0.2
              };
              updateObject(selectedObject.id, { material: newMaterial });
            }}
          >
            Metal
          </button>
          <button
            className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
            onClick={() => {
              // Apply wood preset all at once
              const newMaterial = {
                ...selectedObject.material,
                color: '#8B4513',
                metalness: 0.0,
                roughness: 0.8
              };
              updateObject(selectedObject.id, { material: newMaterial });
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

    </div>
  );
};
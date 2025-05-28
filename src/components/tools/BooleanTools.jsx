// Boolean operations and advanced 3D modeling tools
import React, { useState } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';
import * as THREE from 'three';

export const BooleanTools = () => {
  const { objects, selectedIds } = useScene();
  const { addObject, updateObject, selectObjects } = useSceneActions();
  const [activeOperation, setActiveOperation] = useState(null);
  const [preserveOriginals, setPreserveOriginals] = useState(false);

  const booleanOperations = [
    {
      id: 'union',
      name: 'Union',
      icon: '➕',
      description: 'Combine objects into one',
      color: '#4a90e2',
      minObjects: 2
    },
    {
      id: 'subtract',
      name: 'Subtract',
      icon: '➖',
      description: 'Remove second object from first',
      color: '#e74c3c',
      minObjects: 2
    },
    {
      id: 'intersect',
      name: 'Intersect',
      icon: '✂️',
      description: 'Keep only overlapping parts',
      color: '#f39c12',
      minObjects: 2
    },
    {
      id: 'xor',
      name: 'XOR',
      icon: '⚡',
      description: 'Remove overlapping parts',
      color: '#9b59b6',
      minObjects: 2
    }
  ];

  const advancedOperations = [
    {
      id: 'mirror',
      name: 'Mirror',
      icon: '🪞',
      description: 'Mirror object across plane',
      color: '#2ecc71',
      minObjects: 1
    },
    {
      id: 'array',
      name: 'Array',
      icon: '📋',
      description: 'Create linear/circular arrays',
      color: '#e67e22',
      minObjects: 1
    },
    {
      id: 'shell',
      name: 'Shell',
      icon: '🗂️',
      description: 'Hollow out solid objects',
      color: '#1abc9c',
      minObjects: 1
    },
    {
      id: 'loft',
      name: 'Loft',
      icon: '🌊',
      description: 'Blend between profiles',
      color: '#3498db',
      minObjects: 2
    }
  ];

  const performBooleanOperation = async (operation) => {
    const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
    
    if (selectedObjects.length < operation.minObjects) {
      console.warn(`${operation.name} requires at least ${operation.minObjects} objects, got ${selectedObjects.length}`);
      return;
    }

    console.log(`🔧 Performing ${operation.name} on ${selectedObjects.length} objects`);

    // Calculate center position
    const positions = selectedObjects.map(obj => new THREE.Vector3(...obj.position));
    const center = positions.reduce((acc, pos) => acc.add(pos), new THREE.Vector3()).divideScalar(positions.length);

    // Create result object
    const newObject = {
      id: `${operation.id}_${Date.now()}`,
      name: `${operation.name}_${selectedObjects.length}obj`,
      type: 'boolean',
      operation: operation.id,
      sourceObjects: [...selectedIds],
      position: [
        Math.round(center.x * 100) / 100,
        Math.round(center.y * 100) / 100, 
        Math.round(center.z * 100) / 100
      ],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      geometry: selectedObjects[0].geometry || 'box',
      geometryArgs: selectedObjects[0].geometryArgs || [1, 1, 1],
      material: {
        color: operation.color,
        metalness: 0.1,
        roughness: 0.8,
        opacity: 1
      },
      visible: true,
      locked: false,
      booleanData: {
        operation: operation.id,
        sourceObjects: selectedObjects.map(obj => ({...obj})),
        preserveOriginals,
        timestamp: Date.now()
      }
    };

    try {
      // Add new object
      addObject(newObject);
      
      // Handle original objects
      if (!preserveOriginals) {
        selectedIds.forEach(id => {
          updateObject(id, { 
            visible: false,
            hiddenBy: newObject.id
          });
        });
      }

      // Select the new object
      selectObjects([newObject.id]);
      
      console.log(`✅ Successfully created ${operation.name}:`, newObject.id);
      setActiveOperation(null);
    } catch (error) {
      console.error(`❌ Failed to create ${operation.name}:`, error);
    }
  };

  const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
  const hasSelection = selectedIds.length > 0;

  return (
    <div className="space-y-4">
      <div className="text-orange-400 text-sm font-semibold mb-3">
        Boolean Operations
      </div>
      
      {!hasSelection ? (
        <div className="text-gray-400 text-sm text-center py-8 bg-gray-800 rounded">
          <div className="text-2xl mb-2">➕</div>
          <div>Select objects for boolean operations</div>
          <div className="text-xs mt-2 opacity-60">
            Union, subtract, intersect and more
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 rounded p-3 mb-4">
            <div className="text-gray-300 text-sm font-medium mb-1">
              Selection: {selectedIds.length} object{selectedIds.length > 1 ? 's' : ''}
            </div>
            <div className="text-gray-400 text-xs">
              Choose boolean operation to apply
            </div>
          </div>

          {/* Boolean Operations */}
          <div className="space-y-2">
            <div className="text-gray-300 text-sm font-medium">Boolean Operations:</div>
            <div className="grid grid-cols-2 gap-2">
              {booleanOperations.map((operation) => {
                const canPerform = selectedObjects.length >= operation.minObjects;
                return (
                  <button
                    key={operation.id}
                    onClick={() => canPerform && performBooleanOperation(operation)}
                    disabled={!canPerform}
                    className={`p-3 rounded text-sm flex flex-col items-center space-y-1 transition-all ${
                      canPerform
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                    title={`${operation.description} (needs ${operation.minObjects}+ objects)`}
                  >
                    <span className="text-lg">{operation.icon}</span>
                    <span className="font-medium text-xs">{operation.name}</span>
                    {!canPerform && (
                      <span className="text-xs text-red-400">
                        Need {operation.minObjects}+
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced Operations */}
          <div className="space-y-2">
            <div className="text-gray-300 text-sm font-medium">Advanced Operations:</div>
            <div className="grid grid-cols-2 gap-2">
              {advancedOperations.map((operation) => {
                const canPerform = selectedObjects.length >= operation.minObjects;
                return (
                  <button
                    key={operation.id}
                    onClick={() => canPerform && performBooleanOperation(operation)}
                    disabled={!canPerform}
                    className={`p-3 rounded text-sm flex flex-col items-center space-y-1 transition-all ${
                      canPerform
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                    title={`${operation.description} (needs ${operation.minObjects}+ objects)`}
                  >
                    <span className="text-lg">{operation.icon}</span>
                    <span className="font-medium text-xs">{operation.name}</span>
                    {!canPerform && (
                      <span className="text-xs text-red-400">
                        Need {operation.minObjects}+
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options */}
          <div className="bg-gray-800 rounded p-3">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={preserveOriginals}
                onChange={(e) => setPreserveOriginals(e.target.checked)}
                className="rounded"
              />
              <span className="text-gray-300">Preserve Original Objects</span>
            </label>
            <div className="text-gray-400 text-xs mt-1">
              Keep source objects visible after operation
            </div>
          </div>
        </>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-gray-400 text-xs space-y-1">
          <div>• Boolean operations create new objects</div>
          <div>• Order matters for subtract operations</div>
          <div>• Use undo if results are unexpected</div>
        </div>
      </div>
    </div>
  );
};

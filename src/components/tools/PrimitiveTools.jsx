// filepath: src/components/tools/PrimitiveTools.jsx
import React from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';
import * as THREE from 'three';

const primitives = [
  { name: 'Cube', icon: '⬛', type: 'box' },
  { name: 'Sphere', icon: '🟠', type: 'sphere' },
  { name: 'Cylinder', icon: '🗜️', type: 'cylinder' },
  { name: 'Plane', icon: '▭', type: 'plane' },
  { name: 'Cone', icon: '🔺', type: 'cone' },
  { name: 'Boxel', icon: '📦', type: 'boxel' },
];

export const PrimitiveTools = () => {
  const { addObject, selectObjects } = useSceneActions();
  const createPrimitive = (type) => {
    const id = `${type}_${Date.now()}`;
    const position = [0, 0, 0];
    const rotation = [0, 0, 0];
    const scale = [1, 1, 1];
    
    let geometryArgs;
    switch (type) {
      case 'box':
        geometryArgs = [1, 1, 1];
        break;
      case 'sphere':
        geometryArgs = [0.5, 32, 16];
        break;
      case 'cylinder':
        geometryArgs = [0.5, 0.5, 1, 32];
        break;
      case 'plane':
        geometryArgs = [2, 2];
        break;
      case 'cone':
        geometryArgs = [0.5, 1, 32];
        break;
      case 'boxel':
        geometryArgs = [1]; // Scale for boxel
        break;
      default:
        geometryArgs = [1, 1, 1];
    }

    const obj = {
      id,
      name: `${type}_${primitives.length + 1}`,
      type: 'mesh',
      geometry: type,
      geometryArgs,
      material: {
        type: 'standard',
        color: '#ff6600',
        metalness: 0.1,
        roughness: 0.7,
      },
      position,
      rotation,
      scale,
      visible: true,
      locked: false,
    };

    addObject(obj);
    // Automatically select the newly created object
    selectObjects([id]);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-white text-sm font-bold">Add Primitives</h3>
      <div className="grid grid-cols-2 gap-2">
        {primitives.map((primitive) => (
          <button
            key={primitive.name}
            className="px-3 py-2 rounded flex flex-col items-center space-y-1 bg-gray-800 text-gray-200 hover:bg-orange-600 transition-colors"
            onClick={() => createPrimitive(primitive.type)}
          >
            <span className="text-lg">{primitive.icon}</span>
            <span className="text-xs">{primitive.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
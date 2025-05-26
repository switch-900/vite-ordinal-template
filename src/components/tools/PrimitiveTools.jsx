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
];

export const PrimitiveTools = () => {
  const { addObject } = useSceneActions();
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
  };

  return (
    <div className="absolute top-2 right-2 z-10 flex flex-col space-y-2 bg-gray-900 bg-opacity-80 p-2 rounded shadow">
      <h3 className="text-white text-sm font-bold">Primitives</h3>
      {primitives.map((primitive) => (
        <button
          key={primitive.name}
          className="px-2 py-1 rounded flex items-center space-x-2 bg-gray-700 text-gray-200 hover:bg-orange-500"
          onClick={() => createPrimitive(primitive.type)}
        >
          <span>{primitive.icon}</span>
          <span className="text-xs">{primitive.name}</span>
        </button>
      ))}
    </div>
  );
};
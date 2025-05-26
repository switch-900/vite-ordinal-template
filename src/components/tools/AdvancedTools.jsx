// filepath: src/components/tools/AdvancedTools.jsx
import React from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';
import * as THREE from 'three';

const advancedOps = [
  { name: 'Extrude', icon: '⬆️', type: 'extrude' },
  { name: 'Revolve', icon: '🔄', type: 'revolve' },
  { name: 'Union', icon: '➕', type: 'union' },
  { name: 'Subtract', icon: '➖', type: 'subtract' },
  { name: 'Intersect', icon: '✂️', type: 'intersect' },
  { name: 'Mirror', icon: '🪞', type: 'mirror' },
];

export const AdvancedTools = () => {
  const { objects, selectedIds } = useScene();
  const { addObject } = useSceneActions();

  const performOperation = (type) => {
    const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
    
    switch (type) {
      case 'extrude':
        // Create extruded geometry from selected 2D paths
        console.log('Extrude operation - requires 2D paths');
        break;
      case 'revolve':
        // Create revolved geometry
        console.log('Revolve operation - requires 2D profile');
        break;
      case 'union':
        if (selectedObjects.length >= 2) {
          console.log('Union operation on', selectedObjects.length, 'objects');
          // In a real implementation, would use @react-three/csg
        }
        break;
      case 'subtract':
        if (selectedObjects.length >= 2) {
          console.log('Subtract operation on', selectedObjects.length, 'objects');
        }
        break;
      case 'intersect':
        if (selectedObjects.length >= 2) {
          console.log('Intersect operation on', selectedObjects.length, 'objects');
        }
        break;
      case 'mirror':
        if (selectedObjects.length >= 1) {
          // Mirror selected objects
          selectedObjects.forEach(obj => {
            const mirroredObj = {
              ...obj,
              id: `${obj.id}_mirror_${Date.now()}`,
              name: `${obj.name}_mirror`,
              position: [-obj.position[0], obj.position[1], obj.position[2]],
            };
            addObject(mirroredObj);
          });
        }
        break;
      default:
        console.log('Unknown operation:', type);
    }
  };

  return (
    <div className="absolute top-20 right-2 z-10 flex flex-col space-y-2 bg-gray-900 bg-opacity-80 p-2 rounded shadow">
      <h3 className="text-white text-sm font-bold">Advanced</h3>
      {advancedOps.map((op) => (
        <button
          key={op.name}
          className="px-2 py-1 rounded flex items-center space-x-2 bg-gray-700 text-gray-200 hover:bg-blue-500"
          onClick={() => performOperation(op.type)}
          disabled={op.type !== 'mirror' && selectedIds.length < 2}
        >
          <span>{op.icon}</span>
          <span className="text-xs">{op.name}</span>
        </button>
      ))}
    </div>
  );
};

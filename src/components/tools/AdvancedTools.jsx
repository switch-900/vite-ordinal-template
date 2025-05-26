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
  const { addObject, updateObject, selectObjects } = useSceneActions();
  
  const createBooleanOperation = (operation) => {
    const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
    if (selectedObjects.length < 2) return;
    
    // Calculate the center position of the selected objects
    const positions = selectedObjects.map(obj => new THREE.Vector3(...obj.position));
    const center = positions.reduce((acc, pos) => acc.add(pos), new THREE.Vector3()).divideScalar(positions.length);
    
    // Create new boolean object
    const newObject = {
      id: `boolean_${operation}_${Date.now()}`,
      name: `Boolean_${operation}`,
      type: 'boolean',
      operation,
      sourceObjects: selectedIds.slice(), // Make a copy
      position: [center.x, center.y, center.z],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      material: {
        color: '#4a90e2',
        metalness: 0.1,
        roughness: 0.8
      },
      visible: true,
      locked: false
    };
    
    // Add the boolean object
    addObject(newObject);
    
    // Hide source objects but don't delete them
    selectedIds.forEach(id => {
      updateObject(id, { visible: false });
    });
    
    // Select the new boolean object
    selectObjects([newObject.id]);
  };

  const performOperation = (type) => {
    const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
    
    switch (type) {
      case 'extrude':
        if (selectedObjects.length === 1) {
          const obj = selectedObjects[0];
          
          // Create an extruded version
          const extrudedObj = {
            id: `extruded_${Date.now()}`,
            name: `${obj.name}_extruded`,
            type: 'mesh',
            geometry: obj.geometry,
            geometryArgs: obj.geometryArgs ? 
              [obj.geometryArgs[0], obj.geometryArgs[1], obj.geometryArgs[1] * 2] : 
              [1, 1, 2],
            material: { ...obj.material },
            position: [...obj.position],
            rotation: [...obj.rotation],
            scale: [...obj.scale],
            visible: true,
            locked: false,
          };
          
          addObject(extrudedObj);
          selectObjects([extrudedObj.id]);
        }
        break;
      case 'revolve':
        if (selectedObjects.length === 1) {
          const obj = selectedObjects[0];
          
          // Create a revolved version (using cylinder as proxy)
          const revolvedObj = {
            id: `revolved_${Date.now()}`,
            name: `${obj.name}_revolved`,
            type: 'mesh',
            geometry: 'cylinder',
            geometryArgs: [0.5, 0.5, 1, 32],
            material: { ...obj.material },
            position: [...obj.position],
            rotation: [...obj.rotation],
            scale: [...obj.scale],
            visible: true,
            locked: false,
          };
          
          addObject(revolvedObj);
          selectObjects([revolvedObj.id]);
        }
        break;
      case 'union':
        if (selectedObjects.length >= 2) {
          createBooleanOperation('union');
        }
        break;
      case 'subtract':
        if (selectedObjects.length >= 2) {
          createBooleanOperation('subtract');
        }
        break;
      case 'intersect':
        if (selectedObjects.length >= 2) {
          createBooleanOperation('intersect');
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
    <div className="space-y-3">
      <h3 className="text-white text-sm font-bold">Advanced</h3>
      <div className="grid grid-cols-2 gap-2">
        {advancedOps.map((op) => (
          <button
            key={op.name}
            className={`px-3 py-2 rounded flex flex-col items-center space-y-1 ${
              (op.type !== 'mirror' && selectedIds.length < 2) 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-800 text-gray-200 hover:bg-orange-600 transition-colors'
            }`}
            onClick={() => performOperation(op.type)}
            disabled={op.type !== 'mirror' && selectedIds.length < 2}
          >
            <span className="text-lg">{op.icon}</span>
            <span className="text-xs">{op.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

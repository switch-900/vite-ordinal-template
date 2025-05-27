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

  const createBooleanOperation = async (operation) => {
    const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
    if (selectedObjects.length < 2) {
      console.warn(`Need at least 2 objects for ${operation}, got ${selectedObjects.length}`);
      return;
    }

    console.log(`🔧 Creating ${operation} operation with ${selectedObjects.length} objects`);

    // ✅ Calculate center position more accurately
    const positions = selectedObjects.map(obj => new THREE.Vector3(...obj.position));
    const center = positions.reduce((acc, pos) => acc.add(pos), new THREE.Vector3()).divideScalar(positions.length);

    // ✅ Create boolean object with better naming and properties
    const newObject = {
      id: `boolean_${operation}_${Date.now()}`,
      name: `${operation.charAt(0).toUpperCase() + operation.slice(1)}_${selectedObjects.length}obj`,
      type: 'boolean',
      operation,
      sourceObjects: [...selectedIds], // ✅ Use spread to avoid reference issues
      position: [
        Math.round(center.x * 100) / 100,
        Math.round(center.y * 100) / 100, 
        Math.round(center.z * 100) / 100
      ],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      material: {
        color: operation === 'union' ? '#4a90e2' : operation === 'subtract' ? '#e74c3c' : '#f39c12',
        metalness: 0.1,
        roughness: 0.8,
        opacity: 0.9 // ✅ Slightly transparent to show it's a boolean result
      },
      visible: true,
      locked: false,
      // ✅ Store original object data for undo operations
      originalObjects: selectedObjects.map(obj => ({...obj}))
    };

    try {
      // ✅ Add object first, then hide sources to prevent selection issues
      addObject(newObject);
      
      // ✅ Hide source objects but keep them for boolean operations
      selectedIds.forEach(id => {
        updateObject(id, { 
          visible: false,
          hiddenBy: newObject.id // ✅ Track what hid this object
        });
      });

      // ✅ Select the new boolean object
      selectObjects([newObject.id]);
      
      console.log(`✅ Successfully created ${operation} operation:`, newObject.id);
    } catch (error) {
      console.error(`❌ Failed to create ${operation} operation:`, error);
    }
  };

  const performOperation = async (type) => {
    const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
    
    console.log(`🛠️ Performing ${type} operation on ${selectedObjects.length} objects`);

    try {
      switch (type) {
        case 'extrude':
          if (selectedObjects.length === 1) {
            await performExtrude(selectedObjects[0]);
          } else {
            console.warn('Extrude requires exactly 1 object');
          }
          break;
          
        case 'revolve':
          if (selectedObjects.length === 1) {
            await performRevolve(selectedObjects[0]);
          } else {
            console.warn('Revolve requires exactly 1 object');
          }
          break;
          
        case 'union':
          if (selectedObjects.length >= 2) {
            await createBooleanOperation('union');
          } else {
            console.warn('Union requires at least 2 objects');
          }
          break;
          
        case 'subtract':
          if (selectedObjects.length >= 2) {
            await createBooleanOperation('subtract');
          } else {
            console.warn('Subtract requires at least 2 objects');
          }
          break;
          
        case 'intersect':
          if (selectedObjects.length >= 2) {
            await createBooleanOperation('intersect');
          } else {
            console.warn('Intersect requires at least 2 objects');
          }
          break;
          
        case 'mirror':
          if (selectedObjects.length >= 1) {
            await performMirror(selectedObjects);
          }
          break;
          
        default:
          console.warn('Unknown operation:', type);
      }
    } catch (error) {
      console.error(`❌ Operation ${type} failed:`, error);
    }
  };

  // ✅ Improved extrude operation
  const performExtrude = async (obj) => {
    const extrudedObj = {
      id: `extruded_${Date.now()}`,
      name: `${obj.name}_extruded`,
      type: 'mesh',
      geometry: obj.geometry === 'plane' ? 'box' : obj.geometry, // ✅ Convert plane to box for extrude
      geometryArgs: obj.geometryArgs ? 
        [obj.geometryArgs[0] || 1, obj.geometryArgs[1] || 1, (obj.geometryArgs[1] || 1) * 2] :
        [1, 1, 2],
      material: { ...obj.material, color: '#2ecc71' }, // ✅ Green for extruded objects
      position: [...obj.position],
      rotation: [...obj.rotation],
      scale: [...obj.scale],
      visible: true,
      locked: false,
      sourceObject: obj.id // ✅ Track source for undo
    };
    
    addObject(extrudedObj);
    selectObjects([extrudedObj.id]);
    console.log('✅ Extrude operation completed:', extrudedObj.id);
  };

  // ✅ Improved revolve operation  
  const performRevolve = async (obj) => {
    const revolvedObj = {
      id: `revolved_${Date.now()}`,
      name: `${obj.name}_revolved`,
      type: 'mesh',
      geometry: 'cylinder', // ✅ Always use cylinder for revolve
      geometryArgs: [0.5, 0.5, obj.geometryArgs?.[1] || 1, 32],
      material: { ...obj.material, color: '#e74c3c' }, // ✅ Red for revolved objects
      position: [...obj.position],
      rotation: [...obj.rotation],
      scale: [...obj.scale],
      visible: true,
      locked: false,
      sourceObject: obj.id // ✅ Track source for undo
    };
    
    addObject(revolvedObj);
    selectObjects([revolvedObj.id]);
    console.log('✅ Revolve operation completed:', revolvedObj.id);
  };

  // ✅ Improved mirror operation
  const performMirror = async (selectedObjects) => {
    const mirroredObjects = [];
    
    for (const obj of selectedObjects) {
      const mirroredObj = {
        ...obj,
        id: `${obj.id}_mirror_${Date.now()}`,
        name: `${obj.name}_mirror`,
        position: [-obj.position[0], obj.position[1], obj.position[2]], // ✅ Mirror across YZ plane
        material: { 
          ...obj.material, 
          opacity: (obj.material?.opacity || 1) * 0.8 // ✅ Slightly transparent for mirrors
        },
        sourceObject: obj.id // ✅ Track source for undo
      };
      
      addObject(mirroredObj);
      mirroredObjects.push(mirroredObj.id);
    }
    
    // ✅ Select all mirrored objects
    selectObjects(mirroredObjects);
    console.log(`✅ Mirror operation completed: ${mirroredObjects.length} objects created`);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-white text-sm font-bold">Advanced Operations</h3>
      
      {/* ✅ Show selection requirements */}
      <div className="text-xs text-gray-400 mb-2">
        Selected: {selectedIds.length} object{selectedIds.length !== 1 ? 's' : ''}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {advancedOps.map((op) => {
          // ✅ Better button state logic
          const isDisabled = (
            (op.type === 'extrude' || op.type === 'revolve') && selectedIds.length !== 1
          ) || (
            (['union', 'subtract', 'intersect'].includes(op.type)) && selectedIds.length < 2
          ) || (
            op.type === 'mirror' && selectedIds.length === 0
          );

          const getTooltip = () => {
            if (op.type === 'extrude' || op.type === 'revolve') return 'Select 1 object';
            if (['union', 'subtract', 'intersect'].includes(op.type)) return 'Select 2+ objects';
            if (op.type === 'mirror') return 'Select any objects';
            return op.name;
          };

          return (
            <button
              key={op.name}
              className={`px-3 py-2 rounded flex flex-col items-center space-y-1 transition-all duration-200 ${
                isDisabled
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                  : 'bg-gray-800 text-gray-200 hover:bg-orange-600 hover:scale-105 active:scale-95'
              }`}
              onClick={() => !isDisabled && performOperation(op.type)}
              disabled={isDisabled}
              title={getTooltip()}
            >
              <span className="text-lg">{op.icon}</span>
              <span className="text-xs">{op.name}</span>
            </button>
          );
        })}
      </div>
      
      {/* ✅ Help text */}
      <div className="text-xs text-gray-500 mt-2">
        💡 Boolean operations hide source objects. Use layers to organize results.
      </div>
    </div>
  );
};
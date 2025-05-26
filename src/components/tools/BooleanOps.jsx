import React, { useState } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';
import { Geometry, Base, Addition, Subtraction, Intersection } from '@react-three/csg';
import * as THREE from 'three';

export const BooleanOps = () => {
  const { objects, selectedIds } = useScene();
  const { addObject, selectObjects, updateObject } = useSceneActions();
  const [operation, setOperation] = useState('union');
  const [showPanel, setShowPanel] = useState(false);

  const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));

  const canPerformBoolean = selectedObjects.length >= 2;

  const performBooleanOperation = () => {
    if (!canPerformBoolean) return;

    const [firstObj, secondObj, ...restObjs] = selectedObjects;
    
    // Calculate the center position of the selected objects
    const positions = selectedObjects.map(obj => new THREE.Vector3(...obj.position));
    const center = positions.reduce((acc, pos) => acc.add(pos), new THREE.Vector3()).divideScalar(positions.length);
    
    // Create new boolean object
    const newObject = {
      id: `boolean_${Date.now()}`,
      name: `Boolean_${operation}`,
      type: 'boolean',
      operation,
      sourceObjects: selectedIds.slice(), // Use slice to create a copy
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
    
    // Hide source objects using updateObject
    selectedIds.forEach(id => {
      updateObject(id, { visible: false });
    });

    // Select the new boolean object
    selectObjects([newObject.id]);
    setShowPanel(false);
  };

  const BooleanGeometry = ({ booleanObj }) => {
    const sourceObjs = objects.filter(obj => booleanObj.sourceObjects.includes(obj.id));
    
    if (sourceObjs.length < 2) return null;

    const [firstObj, secondObj, ...restObjs] = sourceObjs;

    const getGeometryComponent = (obj) => {
      const { geometry, geometryArgs, position, rotation, scale } = obj;
      
      const GeomComponent = ({ children, ...props }) => (
        <mesh position={position} rotation={rotation} scale={scale} {...props}>
          {geometry === 'box' && <boxGeometry args={geometryArgs} />}
          {geometry === 'sphere' && <sphereGeometry args={geometryArgs} />}
          {geometry === 'cylinder' && <cylinderGeometry args={geometryArgs} />}
          {geometry === 'cone' && <coneGeometry args={geometryArgs} />}
          {geometry === 'plane' && <planeGeometry args={geometryArgs} />}
          {children}
        </mesh>
      );
      return GeomComponent;
    };

    const FirstGeom = getGeometryComponent(firstObj);
    const SecondGeom = getGeometryComponent(secondObj);

    return (
      <Geometry>
        <Base>
          <FirstGeom />
        </Base>
        {booleanObj.operation === 'union' && (
          <Addition>
            <SecondGeom />
          </Addition>
        )}
        {booleanObj.operation === 'subtract' && (
          <Subtraction>
            <SecondGeom />
          </Subtraction>
        )}
        {booleanObj.operation === 'intersect' && (
          <Intersection>
            <SecondGeom />
          </Intersection>
        )}
        {/* Handle additional objects for complex operations */}
        {restObjs.map((obj, index) => {
          const GeomComponent = getGeometryComponent(obj);
          return (
            <Addition key={index}>
              <GeomComponent />
            </Addition>
          );
        })}
      </Geometry>
    );
  };

  if (!showPanel) {
    return (
      <button
        className={`absolute left-2 top-32 px-3 py-2 rounded text-white ${
          canPerformBoolean ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 cursor-not-allowed'
        }`}
        onClick={() => canPerformBoolean && setShowPanel(true)}
        disabled={!canPerformBoolean}
        title={canPerformBoolean ? 'Boolean Operations' : 'Select 2+ objects for boolean operations'}
      >
        Boolean Ops
      </button>
    );
  }

  return (
    <>
      <div className="absolute left-2 top-32 w-64 bg-gray-900 bg-opacity-95 text-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold">Boolean Operations</h3>
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setShowPanel(false)}
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">
            Selected: {selectedObjects.length} objects
          </p>
          <div className="text-xs text-gray-300">
            {selectedObjects.map(obj => (
              <div key={obj.id} className="truncate">
                • {obj.type || obj.geometry} ({obj.id.slice(0, 8)}...)
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-2">Operation:</label>
          <div className="flex space-x-1">
            <button
              className={`px-2 py-1 rounded text-xs ${operation === 'union' ? 'bg-purple-600' : 'bg-gray-700'}`}
              onClick={() => setOperation('union')}
            >
              Union
            </button>
            <button
              className={`px-2 py-1 rounded text-xs ${operation === 'subtract' ? 'bg-purple-600' : 'bg-gray-700'}`}
              onClick={() => setOperation('subtract')}
            >
              Subtract
            </button>
            <button
              className={`px-2 py-1 rounded text-xs ${operation === 'intersect' ? 'bg-purple-600' : 'bg-gray-700'}`}
              onClick={() => setOperation('intersect')}
            >
              Intersect
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <button
            className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            onClick={performBooleanOperation}
          >
            Apply {operation.charAt(0).toUpperCase() + operation.slice(1)}
          </button>
          <button
            className="w-full px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            onClick={() => setShowPanel(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

// Export the BooleanOps component
export { BooleanOps as default };

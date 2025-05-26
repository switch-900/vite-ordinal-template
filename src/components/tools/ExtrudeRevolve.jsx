import React, { useState } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';
import * as THREE from 'three';

export const ExtrudeRevolve = () => {
  const { selectedIds, objects } = useScene();
  const { addObject, selectObjects } = useSceneActions();
  const [operation, setOperation] = useState('extrude');
  const [showPanel, setShowPanel] = useState(false);
  const [extrudeDepth, setExtrudeDepth] = useState(1);
  const [revolveAngle, setRevolveAngle] = useState(360);
  const [segments, setSegments] = useState(32);

  const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
  const canExtrude = selectedObjects.length === 1 && selectedObjects[0].type === 'sketch';

  const createExtrudedGeometry = (sketchObj) => {
    // For demo purposes, create a simple extruded box based on sketch bounds
    // In a real implementation, you would parse the actual sketch path
    const width = 2;
    const height = 2;
    
    return {
      geometry: 'box',
      geometryArgs: [width, extrudeDepth, height]
    };
  };

  const createRevolvedGeometry = (sketchObj) => {
    // For demo purposes, create a cylinder
    // In a real implementation, you would revolve the sketch profile
    const radius = 1;
    const height = 2;
    
    return {
      geometry: 'cylinder',
      geometryArgs: [radius, radius, height, segments]
    };
  };

  const performOperation = () => {
    if (!canExtrude) return;

    const sketchObj = selectedObjects[0];
    let geometryData;

    if (operation === 'extrude') {
      geometryData = createExtrudedGeometry(sketchObj);
    } else {
      geometryData = createRevolvedGeometry(sketchObj);
    }

    const newObject = {
      id: `${operation}_${Date.now()}`,
      type: operation,
      sourceSketch: sketchObj.id,
      ...geometryData,
      position: [...sketchObj.position],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      material: {
        color: operation === 'extrude' ? '#2ecc71' : '#e74c3c',
        metalness: 0.2,
        roughness: 0.7
      },
      visible: true,
      locked: false,
      extrudeDepth: operation === 'extrude' ? extrudeDepth : undefined,
      revolveAngle: operation === 'revolve' ? revolveAngle : undefined,
      segments: operation === 'revolve' ? segments : undefined
    };

    addObject(newObject);
    selectObjects([newObject.id]);
    setShowPanel(false);
  };

  if (!showPanel) {
    return (
      <button
        className={`absolute left-2 top-60 px-3 py-2 rounded text-white ${
          canExtrude ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'
        }`}
        onClick={() => canExtrude && setShowPanel(true)}
        disabled={!canExtrude}
        title={canExtrude ? 'Extrude/Revolve' : 'Select a 2D sketch to extrude/revolve'}
      >
        Extrude/Revolve
      </button>
    );
  }

  return (
    <div className="absolute left-2 top-60 w-72 bg-gray-900 bg-opacity-95 text-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold">Extrude/Revolve</h3>
        <button
          className="text-gray-400 hover:text-white"
          onClick={() => setShowPanel(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-2">
          Selected: {selectedObjects[0]?.type || 'None'}
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-2">Operation:</label>
        <div className="flex space-x-1">
          <button
            className={`px-2 py-1 rounded text-xs ${operation === 'extrude' ? 'bg-green-600' : 'bg-gray-700'}`}
            onClick={() => setOperation('extrude')}
          >
            Extrude
          </button>
          <button
            className={`px-2 py-1 rounded text-xs ${operation === 'revolve' ? 'bg-green-600' : 'bg-gray-700'}`}
            onClick={() => setOperation('revolve')}
          >
            Revolve
          </button>
        </div>
      </div>

      {operation === 'extrude' && (
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Depth:</label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={extrudeDepth}
            onChange={(e) => setExtrudeDepth(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-300 text-center">{extrudeDepth}</div>
        </div>
      )}

      {operation === 'revolve' && (
        <>
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1">Angle (°):</label>
            <input
              type="range"
              min="10"
              max="360"
              step="10"
              value={revolveAngle}
              onChange={(e) => setRevolveAngle(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-300 text-center">{revolveAngle}°</div>
          </div>
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1">Segments:</label>
            <input
              type="range"
              min="8"
              max="64"
              step="8"
              value={segments}
              onChange={(e) => setSegments(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-300 text-center">{segments}</div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <button
          className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={performOperation}
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
  );
};

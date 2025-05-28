import React, { useState, useCallback, useMemo } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';
import * as THREE from 'three';

export const ExtrudeRevolve = () => {
  const { selectedIds, objects } = useScene();
  const { addObject, selectObjects } = useSceneActions();
  
  // ✅ Enhanced state management with preview
  const [operation, setOperation] = useState('extrude');
  const [showPanel, setShowPanel] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewObject, setPreviewObject] = useState(null);
  
  // ✅ Parameters with proper defaults and extended options
  const [parameters, setParameters] = useState({
    extrudeDepth: 1.0,
    revolveAngle: 360,
    segments: 32,
    steps: 1,
    bevelEnabled: false,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 3,
    // Enhanced parameters
    autoSmooth: true,
    generateUVs: true,
    doubleSided: false
  });

  // ✅ Memoized selected objects to prevent unnecessary recalculations
  const selectedObjects = useMemo(() => 
    objects.filter(obj => selectedIds.includes(obj.id)),
    [objects, selectedIds]
  );

  // ✅ Check if operation is possible
  const canExtrude = useMemo(() => {
    if (isProcessing || selectedObjects.length !== 1) return false;
    
    const obj = selectedObjects[0];
    // ✅ Check for valid 2D sketches or shapes that can be extruded
    return obj && (
      obj.type === 'sketch' || 
      obj.geometry === 'plane' ||
      obj.geometry === 'circle' ||
      (obj.sketchData && obj.sketchData.points)
    );
  }, [selectedObjects, isProcessing]);

  // ✅ Calculate bounds of sketch points (moved first to avoid hoisting issues)
  const calculateSketchBounds = useCallback((points) => {
    if (!points || points.length === 0) {
      return { width: 1, height: 1, centerX: 0, centerY: 0 };
    }
    
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    return {
      width: Math.max(0.1, maxX - minX),
      height: Math.max(0.1, maxY - minY),
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    };
  }, []);

  // ✅ Enhanced geometry creation with proper THREE.js geometries
  const createExtrudedGeometry = useCallback((sketchObj) => {
    console.log('🏗️ Creating enhanced extruded geometry from sketch:', sketchObj.id);
    
    // ✅ For basic shapes, create appropriate geometry
    if (sketchObj.geometry === 'plane') {
      return {
        geometry: 'box',
        geometryArgs: [
          sketchObj.geometryArgs?.[0] || 2,
          parameters.extrudeDepth,
          sketchObj.geometryArgs?.[1] || 2
        ]
      };
    }
    
    if (sketchObj.geometry === 'circle') {
      return {
        geometry: 'cylinder',
        geometryArgs: [
          sketchObj.geometryArgs?.[0] || 1, // radius
          sketchObj.geometryArgs?.[0] || 1, // radius (same for cylinder)
          parameters.extrudeDepth,
          32, // segments
          1,  // heightSegments
          false // openEnded
        ]
      };
    }
    
    // ✅ For sketches with point data, create enhanced extrusion
    if (sketchObj.sketchData && sketchObj.sketchData.points) {
      const points = sketchObj.sketchData.points;
      const bounds = calculateSketchBounds(points);
      
      // Create a more sophisticated shape based on points
      if (points.length === 4) {
        // Rectangular sketch
        return {
          geometry: 'box',
          geometryArgs: [
            bounds.width || 1,
            parameters.extrudeDepth,
            bounds.height || 1
          ]
        };
      } else if (points.length > 4) {
        // Complex shape - approximate with rounded cylinder
        const avgRadius = Math.max(bounds.width, bounds.height) / 2;
        return {
          geometry: 'cylinder',
          geometryArgs: [
            avgRadius,
            avgRadius,
            parameters.extrudeDepth,
            Math.min(32, Math.max(6, points.length)),
            1,
            false
          ]
        };
      }
    }
    
    // ✅ Enhanced fallback geometry
    return {
      geometry: 'box',
      geometryArgs: [2, parameters.extrudeDepth, 2]
    };
  }, [parameters.extrudeDepth, calculateSketchBounds]);

  // ✅ Enhanced revolve geometry with better profiles
  const createRevolvedGeometry = useCallback((sketchObj) => {
    console.log('🌀 Creating enhanced revolved geometry from sketch:', sketchObj.id);
    
    // ✅ For basic shapes, create appropriate revolution
    if (sketchObj.geometry === 'plane') {
      return {
        geometry: 'cylinder',
        geometryArgs: [
          (sketchObj.geometryArgs?.[0] || 2) / 2, // radiusTop
          (sketchObj.geometryArgs?.[0] || 2) / 2, // radiusBottom  
          sketchObj.geometryArgs?.[1] || 2,       // height
          parameters.segments,
          1, // heightSegments
          parameters.revolveAngle < 360, // openEnded if not full revolution
          0, // thetaStart
          (parameters.revolveAngle * Math.PI) / 180 // thetaLength
        ]
      };
    }
    
    if (sketchObj.geometry === 'circle') {
      // Revolving a circle creates a torus
      return {
        geometry: 'torus',
        geometryArgs: [
          (sketchObj.geometryArgs?.[0] || 1) * 1.5, // radius
          sketchObj.geometryArgs?.[0] || 1,         // tube
          16, // radialSegments
          parameters.segments, // tubularSegments
          (parameters.revolveAngle * Math.PI) / 180 // arc
        ]
      };
    }
    
    // ✅ For sketches, create cylinder based on bounds
    if (sketchObj.sketchData && sketchObj.sketchData.points) {
      const bounds = calculateSketchBounds(sketchObj.sketchData.points);
      return {
        geometry: 'cylinder',
        geometryArgs: [
          Math.max(0.1, bounds.width / 2 || 0.5),
          Math.max(0.1, bounds.width / 2 || 0.5),
          bounds.height || 1,
          parameters.segments,
          1,
          parameters.revolveAngle < 360, // openEnded if not full revolution
          0,
          (parameters.revolveAngle * Math.PI) / 180
        ]
      };
    }
    
    // ✅ Enhanced fallback geometry
    return {
      geometry: 'cylinder',
      geometryArgs: [0.5, 0.5, 2, parameters.segments, 1, false, 0, (parameters.revolveAngle * Math.PI) / 180]
    };
  }, [parameters.segments, parameters.revolveAngle, calculateSketchBounds]);

  // ✅ Update parameters with validation and preview generation
  const updateParameter = useCallback((key, value) => {
    setParameters(prev => {
      const newParams = { ...prev };
      
      // ✅ Validate parameter values
      switch (key) {
        case 'extrudeDepth':
          newParams[key] = Math.max(0.01, Math.min(10, parseFloat(value) || 0.01));
          break;
        case 'revolveAngle':
          newParams[key] = Math.max(1, Math.min(360, parseInt(value) || 1));
          break;
        case 'segments':
          newParams[key] = Math.max(3, Math.min(128, parseInt(value) || 3));
          break;
        case 'steps':
          newParams[key] = Math.max(1, Math.min(10, parseInt(value) || 1));
          break;
        case 'bevelThickness':
        case 'bevelSize':
          newParams[key] = Math.max(0, Math.min(1, parseFloat(value) || 0));
          break;
        case 'bevelSegments':
          newParams[key] = Math.max(1, Math.min(10, parseInt(value) || 1));
          break;
        default:
          newParams[key] = value;
      }
      
      return newParams;
    });
    
    // Generate preview when parameters change
    if (showPreview && selectedObjects.length === 1) {
      generatePreview();
    }
  }, [showPreview, selectedObjects]);

  // ✅ Generate preview of the 3D operation
  const generatePreview = useCallback(() => {
    if (!canExtrude || selectedObjects.length !== 1) return;
    
    const sketchObj = selectedObjects[0];
    const geometryData = operation === 'extrude' 
      ? createExtrudedGeometry(sketchObj)
      : createRevolvedGeometry(sketchObj);

    const preview = {
      ...geometryData,
      position: [...sketchObj.position],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      material: {
        color: operation === 'extrude' ? '#3498db' : '#e67e22',
        metalness: 0.1,
        roughness: 0.8,
        transparent: true,
        opacity: 0.6,
        wireframe: false
      }
    };

    setPreviewObject(preview);
  }, [canExtrude, selectedObjects, operation, createExtrudedGeometry, createRevolvedGeometry]);

  // ✅ Toggle preview mode
  const togglePreview = useCallback(() => {
    const newShowPreview = !showPreview;
    setShowPreview(newShowPreview);
    
    if (newShowPreview) {
      generatePreview();
    } else {
      setPreviewObject(null);
    }
  }, [showPreview, generatePreview]);



  // ✅ Enhanced revolve geometry with better profiles




  // ✅ Perform the operation with better error handling
  const performOperation = useCallback(async () => {
    if (!canExtrude || selectedObjects.length !== 1) {
      console.warn(`Cannot perform ${operation}: invalid selection`);
      return;
    }

    setIsProcessing(true);
    console.log(`🏗️ Starting ${operation} operation`);

    try {
      const sketchObj = selectedObjects[0];
      
      // ✅ Create geometry based on operation type
      const geometryData = operation === 'extrude' 
        ? createExtrudedGeometry(sketchObj)
        : createRevolvedGeometry(sketchObj);

      // ✅ Create new 3D object
      const newObject = {
        id: `${operation}_${Date.now()}`,
        name: `${sketchObj.name}_${operation}`,
        type: '3d_generated',
        sourceSketch: sketchObj.id,
        operation,
        ...geometryData,
        position: [...sketchObj.position],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        material: {
          color: operation === 'extrude' ? '#2ecc71' : '#e74c3c',
          metalness: 0.2,
          roughness: 0.7,
          transparent: false,
          opacity: 1.0
        },
        visible: true,
        locked: false,
        // ✅ Store operation parameters for potential editing
        operationData: {
          type: operation,
          parameters: { ...parameters },
          sourceSketch: sketchObj.id,
          createdAt: Date.now()
        }
      };

      // ✅ Add object and select it
      addObject(newObject);
      selectObjects([newObject.id]);
      
      console.log(`✅ ${operation} operation completed:`, newObject.id);
      
      // ✅ Auto-close panel after success
      setTimeout(() => setShowPanel(false), 1000);

    } catch (error) {
      console.error(`❌ ${operation} operation failed:`, error);
      alert(`Failed to ${operation} sketch. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  }, [canExtrude, selectedObjects, operation, parameters, createExtrudedGeometry, createRevolvedGeometry, addObject, selectObjects]);

  // ✅ Toggle panel with validation
  const togglePanel = () => {
    if (!canExtrude && !showPanel) {
      console.warn('Cannot show extrude/revolve panel: no valid sketch selected');
      return;
    }
    setShowPanel(!showPanel);
  };

  // ✅ Simple button when panel is hidden
  if (!showPanel) {
    return (
      <button
        className={`absolute left-2 top-60 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
          canExtrude 
            ? 'bg-green-600 hover:bg-green-700 hover:scale-105 shadow-lg' 
            : 'bg-gray-600 cursor-not-allowed opacity-60'
        }`}
        onClick={togglePanel}
        disabled={!canExtrude}
        title={
          canExtrude 
            ? 'Extrude/Revolve sketch to 3D' 
            : 'Select a 2D sketch to extrude/revolve'
        }
      >
        <span className="mr-2">🏗️</span>
        Extrude/Revolve
      </button>
    );
  }

  const selectedSketch = selectedObjects[0];

  return (
    <div className="absolute left-2 top-60 w-80 bg-gray-900 bg-opacity-98 text-white p-4 rounded-lg shadow-xl border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center">
          <span className="mr-2">🏗️</span>
          3D Generation
        </h3>
        <button
          className="text-gray-400 hover:text-white transition-colors"
          onClick={() => setShowPanel(false)}
        >
          ✕
        </button>
      </div>

      {/* ✅ Selected sketch info */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <div className="text-sm font-medium mb-1">Selected Sketch:</div>
        <div className="text-xs text-gray-300">
          {selectedSketch?.name || selectedSketch?.type || 'Unknown'} 
          <span className="text-gray-400 ml-2">
            ({selectedSketch?.id.slice(0, 8)}...)
          </span>
        </div>
      </div>

      {/* ✅ Operation selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Operation:
        </label>
        <div className="flex space-x-2">
          {[
            { id: 'extrude', name: 'Extrude', icon: '⬆️', desc: 'Push 2D to 3D' },
            { id: 'revolve', name: 'Revolve', icon: '🌀', desc: 'Spin around axis' }
          ].map(op => (
            <button
              key={op.id}
              className={`flex-1 p-3 rounded-lg transition-all duration-200 ${
                operation === op.id
                  ? 'bg-green-600 text-white border-2 border-green-400'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-2 border-transparent'
              }`}
              onClick={() => setOperation(op.id)}
            >
              <div className="text-center">
                <div className="text-xl mb-1">{op.icon}</div>
                <div className="text-sm font-medium">{op.name}</div>
                <div className="text-xs opacity-80">{op.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ✅ Enhanced parameters with preview controls */}
      <div className="mb-4 space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-400">Parameters:</h4>
          <button
            onClick={togglePreview}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showPreview 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {showPreview ? '👁️ Hide Preview' : '👁️ Show Preview'}
          </button>
        </div>
        
        {operation === 'extrude' && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Depth: {parameters.extrudeDepth.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.01"
                max="5"
                step="0.01"
                value={parameters.extrudeDepth}
                onChange={(e) => updateParameter('extrudeDepth', e.target.value)}
                className="w-full accent-green-500"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Steps: {parameters.steps}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={parameters.steps}
                onChange={(e) => updateParameter('steps', e.target.value)}
                className="w-full accent-green-500"
              />
            </div>
          </>
        )}

        {operation === 'revolve' && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Angle: {parameters.revolveAngle}° {parameters.revolveAngle < 360 ? '(Partial)' : '(Full)'}
              </label>
              <input
                type="range"
                min="10"
                max="360"
                step="10"
                value={parameters.revolveAngle}
                onChange={(e) => updateParameter('revolveAngle', e.target.value)}
                className="w-full accent-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Quality: {parameters.segments} segments
              </label>
              <input
                type="range"
                min="3"
                max="64"
                step="1"
                value={parameters.segments}
                onChange={(e) => updateParameter('segments', e.target.value)}
                className="w-full accent-orange-500"
              />
            </div>
          </>
        )}

        {/* Enhanced options */}
        <div className="border-t border-gray-700 pt-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-400">Auto Smooth</label>
            <input
              type="checkbox"
              checked={parameters.autoSmooth}
              onChange={(e) => updateParameter('autoSmooth', e.target.checked)}
              className="accent-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Double Sided</label>
            <input
              type="checkbox"
              checked={parameters.doubleSided}
              onChange={(e) => updateParameter('doubleSided', e.target.checked)}
              className="accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ✅ Action buttons */}
      <div className="space-y-2">
        <button
          className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
            isProcessing
              ? 'bg-yellow-600 text-white cursor-wait'
              : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg active:scale-98'
          }`}
          onClick={performOperation}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">⚙️</span>
              Generating 3D...
            </span>
          ) : (
            <span>
              {operation === 'extrude' ? '⬆️ Extrude' : '🌀 Revolve'} to 3D
            </span>
          )}
        </button>
        
        <button
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          onClick={() => setShowPanel(false)}
        >
          Cancel
        </button>
      </div>

      {/* ✅ Enhanced help with workflow guidance */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-900 to-green-900 bg-opacity-50 rounded text-xs">
        <div className="font-medium mb-2 flex items-center">
          <span className="mr-2">💡</span>
          CAD Workflow Guide
        </div>
        <div className="space-y-2">
          <div className="flex items-start">
            <span className="text-blue-300 mr-2 font-bold">1.</span>
            <span className="text-blue-200">Sketch in 2D mode with drawing tools</span>
          </div>
          <div className="flex items-start">
            <span className="text-green-300 mr-2 font-bold">2.</span>
            <span className="text-green-200">Select your 2D sketch</span>
          </div>
          <div className="flex items-start">
            <span className="text-orange-300 mr-2 font-bold">3.</span>
            <span className="text-orange-200">Choose Extrude/Revolve & adjust parameters</span>
          </div>
          <div className="flex items-start">
            <span className="text-purple-300 mr-2 font-bold">4.</span>
            <span className="text-purple-200">Preview and generate 3D model</span>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-600">
          <div className="font-medium mb-1">✨ Pro Tips:</div>
          <ul className="space-y-1 text-gray-300">
            <li>• Use Split View to see 2D and 3D simultaneously</li>
            <li>• Enable Preview to see changes in real-time</li>
            <li>• {operation === 'extrude' ? 'Extrude pushes shapes outward' : 'Revolve spins shapes around center'}</li>
            <li>• Higher quality = more segments but slower performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
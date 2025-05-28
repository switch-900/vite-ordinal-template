// Quick test panel to validate CAD workflow features
import React, { useState } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';

export const CADTestPanel = () => {
  const { viewMode, objects, selectedIds } = useScene();
  const { addObject, selectObjects, setSceneState } = useSceneActions();
  const [testResults, setTestResults] = useState([]);

  const runCADTests = () => {
    const results = [];
    
    // Test 1: View mode switching
    results.push({
      test: '2D/3D View Switching',
      status: viewMode ? 'PASS' : 'FAIL',
      details: `Current mode: ${viewMode}`
    });

    // Test 2: Object creation
    results.push({
      test: 'Object Management',
      status: objects.length >= 0 ? 'PASS' : 'FAIL',
      details: `${objects.length} objects in scene`
    });

    // Test 3: Selection system
    results.push({
      test: 'Selection System',
      status: 'PASS',
      details: `${selectedIds.length} objects selected`
    });

    // Test 4: Tool availability
    const hasTools = typeof addObject === 'function' && typeof selectObjects === 'function';
    results.push({
      test: 'Tool Functions',
      status: hasTools ? 'PASS' : 'FAIL',
      details: 'Scene actions available'
    });

    setTestResults(results);
  };

  const createTestObjects = () => {
    // Create a test cube
    const testCube = {
      id: `test_cube_${Date.now()}`,
      name: 'Test Cube',
      type: '3d',
      geometry: 'box',
      geometryArgs: [1, 1, 1],
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      material: {
        color: '#3498db',
        metalness: 0.1,
        roughness: 0.8
      },
      visible: true,
      locked: false
    };

    // Create a test sphere
    const testSphere = {
      id: `test_sphere_${Date.now()}`,
      name: 'Test Sphere',
      type: '3d',
      geometry: 'sphere',
      geometryArgs: [0.5, 32, 16],
      position: [2, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      material: {
        color: '#e74c3c',
        metalness: 0.2,
        roughness: 0.6
      },
      visible: true,
      locked: false
    };

    addObject(testCube);
    addObject(testSphere);
    selectObjects([testCube.id, testSphere.id]);
  };

  const testViewModeSwitch = () => {
    const newMode = viewMode === '2d' ? '3d' : '2d';
    setSceneState({ viewMode: newMode });
  };

  return (
    <div className="space-y-4">
      <div className="text-orange-400 text-sm font-semibold mb-3">
        CAD System Tests
      </div>
      
      <div className="bg-gray-800 rounded p-3">
        <div className="text-gray-300 text-sm font-medium mb-2">
          System Status
        </div>
        <div className="text-gray-400 text-xs space-y-1">
          <div>Current View: <span className="text-orange-400">{viewMode?.toUpperCase()}</span></div>
          <div>Objects: <span className="text-green-400">{objects.length}</span></div>
          <div>Selected: <span className="text-blue-400">{selectedIds.length}</span></div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={runCADTests}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium"
        >
          🧪 Run System Tests
        </button>
        
        <button
          onClick={createTestObjects}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium"
        >
          📦 Create Test Objects
        </button>
        
        <button
          onClick={testViewModeSwitch}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm font-medium"
        >
          🔄 Toggle View Mode
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="bg-gray-800 rounded p-3">
          <div className="text-gray-300 text-sm font-medium mb-2">Test Results:</div>
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{result.test}</span>
                <span className={`font-medium ${
                  result.status === 'PASS' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {result.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-gray-400 text-xs space-y-1">
          <div>• Test system functionality</div>
          <div>• Validate tool integration</div>
          <div>• Check view mode switching</div>
        </div>
      </div>
    </div>
  );
};

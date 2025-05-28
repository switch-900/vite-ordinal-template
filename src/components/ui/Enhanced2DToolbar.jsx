// Enhanced 2D drawing toolbar for CAD workflow integration
import React, { useState, useCallback } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';

export const Enhanced2DToolbar = () => {
  const { viewMode, currentTool, objects, selectedIds } = useScene();
  const { setSceneState, addObject, selectObjects } = useSceneActions();
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [drawingMode, setDrawingMode] = useState('freehand'); // 'freehand', 'geometric', 'precise'

  // Enhanced 2D drawing tools
  const drawingTools = [
    { 
      id: 'line', 
      name: 'Line', 
      icon: '📏', 
      hotkey: 'L',
      category: 'basic',
      description: 'Draw straight lines'
    },
    { 
      id: 'rectangle', 
      name: 'Rectangle', 
      icon: '▭', 
      hotkey: 'R',
      category: 'basic',
      description: 'Draw rectangles and squares'
    },
    { 
      id: 'circle', 
      name: 'Circle', 
      icon: '○', 
      hotkey: 'C',
      category: 'basic',
      description: 'Draw circles and ellipses'
    },
    { 
      id: 'polygon', 
      name: 'Polygon', 
      icon: '⬟', 
      hotkey: 'P',
      category: 'basic',
      description: 'Draw multi-sided polygons'
    },
    { 
      id: 'bezier', 
      name: 'Bezier', 
      icon: '🌊', 
      hotkey: 'B',
      category: 'advanced',
      description: 'Draw curved paths'
    },
    { 
      id: 'arc', 
      name: 'Arc', 
      icon: '◐', 
      hotkey: 'A',
      category: 'advanced',
      description: 'Draw circular arcs'
    },
    { 
      id: 'spline', 
      name: 'Spline', 
      icon: '〰️', 
      hotkey: 'S',
      category: 'advanced',
      description: 'Draw smooth curves'
    },
    { 
      id: 'dimension', 
      name: 'Dimension', 
      icon: '📐', 
      hotkey: 'D',
      category: 'annotation',
      description: 'Add dimensions and measurements'
    }
  ];

  // Primitive shape tools for quick sketching
  const primitiveShapes = [
    { id: 'square', name: 'Square', icon: '⬜', size: [1, 1] },
    { id: 'circle', name: 'Circle', icon: '⭕', radius: 0.5 },
    { id: 'triangle', name: 'Triangle', icon: '🔺', sides: 3 },
    { id: 'hexagon', name: 'Hexagon', icon: '⬡', sides: 6 }
  ];

  // Set current drawing tool
  const selectTool = useCallback((toolId) => {
    setSceneState({ 
      currentTool: toolId,
      viewMode: '2d' // Auto-switch to 2D mode when selecting drawing tools
    });
  }, [setSceneState]);

  // Quick create primitive shape
  const createPrimitive = useCallback((shape) => {
    const newObject = {
      id: `primitive_${Date.now()}`,
      name: `${shape.name}_${Date.now()}`,
      type: 'sketch',
      geometry: shape.id === 'square' ? 'plane' : shape.id,
      geometryArgs: shape.size || [shape.radius || 0.5],
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      material: {
        color: '#3498db',
        wireframe: true,
        transparent: true,
        opacity: 0.8
      },
      visible: true,
      locked: false,
      sketchData: {
        type: shape.id,
        created: Date.now(),
        points: generateShapePoints(shape)
      }
    };

    addObject(newObject);
    selectObjects([newObject.id]);
    console.log(`✅ Created primitive ${shape.name}:`, newObject.id);
  }, [addObject, selectObjects]);

  // Generate points for primitive shapes
  const generateShapePoints = (shape) => {
    switch (shape.id) {
      case 'square':
        const size = shape.size[0] / 2;
        return [
          [-size, -size], [size, -size], 
          [size, size], [-size, size], [-size, -size]
        ];
      case 'circle':
        const radius = shape.radius;
        const points = [];
        for (let i = 0; i <= 32; i++) {
          const angle = (i / 32) * Math.PI * 2;
          points.push([
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
          ]);
        }
        return points;
      case 'triangle':
        const r = 0.5;
        return [
          [0, r], 
          [-r * Math.sin(Math.PI * 2 / 3), -r * Math.cos(Math.PI * 2 / 3)],
          [r * Math.sin(Math.PI * 2 / 3), -r * Math.cos(Math.PI * 2 / 3)],
          [0, r]
        ];
      case 'hexagon':
        const hex = [];
        for (let i = 0; i <= 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          hex.push([
            Math.cos(angle) * 0.5,
            Math.sin(angle) * 0.5
          ]);
        }
        return hex;
      default:
        return [[0, 0]];
    }
  };

  // Switch to 3D mode for modeling
  const switchTo3D = useCallback(() => {
    setSceneState({ 
      viewMode: '3d',
      currentTool: 'select'
    });
  }, [setSceneState]);

  // Get sketches that can be extruded
  const extrudableObjects = objects.filter(obj => 
    obj.type === 'sketch' || 
    (obj.sketchData && obj.sketchData.points)
  );

  if (viewMode !== '2d') {
    return (
      <div className="fixed left-4 bottom-20 flex flex-col space-y-2">
        <button
          onClick={() => setSceneState({ viewMode: '2d' })}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all duration-200"
          title="Switch to 2D drawing mode"
        >
          📐 2D Draw
        </button>
      </div>
    );
  }

  return (
    <div className="fixed left-4 bottom-20 w-64 bg-gray-900 bg-opacity-95 text-white rounded-lg shadow-xl border border-gray-700">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm flex items-center">
            <span className="mr-2">📐</span>
            2D Drawing Tools
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-2 py-1 text-xs rounded ${
                showAdvanced ? 'bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title="Toggle advanced tools"
            >
              ⚙️
            </button>
            <button
              onClick={switchTo3D}
              className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded"
              title="Switch to 3D modeling"
            >
              🧊 3D
            </button>
          </div>
        </div>
      </div>

      {/* Drawing Mode Selector */}
      <div className="p-3 border-b border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Drawing Mode:</div>
        <div className="flex space-x-1">
          {[
            { id: 'freehand', name: 'Free', icon: '✏️' },
            { id: 'geometric', name: 'Geo', icon: '📐' },
            { id: 'precise', name: 'CAD', icon: '🎯' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setDrawingMode(mode.id)}
              className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                drawingMode === mode.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={`${mode.name} drawing mode`}
            >
              {mode.icon} {mode.name}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Drawing Tools */}
      <div className="p-3">
        <div className="text-xs text-gray-400 mb-2">Basic Tools:</div>
        <div className="grid grid-cols-4 gap-1">
          {drawingTools
            .filter(tool => tool.category === 'basic')
            .map(tool => (
              <button
                key={tool.id}
                onClick={() => selectTool(tool.id)}
                className={`p-2 text-lg rounded transition-all duration-200 ${
                  currentTool === tool.id
                    ? 'bg-green-600 text-white shadow-lg scale-105'
                    : 'bg-gray-700 hover:bg-gray-600 hover:scale-105'
                }`}
                title={`${tool.name} (${tool.hotkey}) - ${tool.description}`}
              >
                {tool.icon}
              </button>
            ))}
        </div>
      </div>

      {/* Advanced Tools */}
      {showAdvanced && (
        <div className="p-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Advanced Tools:</div>
          <div className="grid grid-cols-4 gap-1 mb-3">
            {drawingTools
              .filter(tool => tool.category === 'advanced')
              .map(tool => (
                <button
                  key={tool.id}
                  onClick={() => selectTool(tool.id)}
                  className={`p-2 text-lg rounded transition-all duration-200 ${
                    currentTool === tool.id
                      ? 'bg-orange-600 text-white shadow-lg scale-105'
                      : 'bg-gray-700 hover:bg-gray-600 hover:scale-105'
                  }`}
                  title={`${tool.name} (${tool.hotkey}) - ${tool.description}`}
                >
                  {tool.icon}
                </button>
              ))}
          </div>

          {/* Annotation Tools */}
          <div className="text-xs text-gray-400 mb-2">Annotation:</div>
          <div className="grid grid-cols-4 gap-1">
            {drawingTools
              .filter(tool => tool.category === 'annotation')
              .map(tool => (
                <button
                  key={tool.id}
                  onClick={() => selectTool(tool.id)}
                  className={`p-2 text-lg rounded transition-all duration-200 ${
                    currentTool === tool.id
                      ? 'bg-yellow-600 text-white shadow-lg scale-105'
                      : 'bg-gray-700 hover:bg-gray-600 hover:scale-105'
                  }`}
                  title={`${tool.name} (${tool.hotkey}) - ${tool.description}`}
                >
                  {tool.icon}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Quick Primitives */}
      <div className="p-3 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Quick Shapes:</div>
        <div className="grid grid-cols-4 gap-1">
          {primitiveShapes.map(shape => (
            <button
              key={shape.id}
              onClick={() => createPrimitive(shape)}
              className="p-2 text-lg bg-gray-700 hover:bg-green-600 rounded transition-all duration-200 hover:scale-105"
              title={`Create ${shape.name}`}
            >
              {shape.icon}
            </button>
          ))}
        </div>
      </div>

      {/* 2D to 3D Workflow */}
      {extrudableObjects.length > 0 && (
        <div className="p-3 border-t border-gray-700 bg-gradient-to-r from-blue-900 to-purple-900 bg-opacity-50">
          <div className="text-xs text-gray-300 mb-2">
            🚀 Ready for 3D: {extrudableObjects.length} sketches
          </div>
          <div className="flex space-x-1">
            <button
              onClick={switchTo3D}
              className="flex-1 px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded transition-colors"
            >
              🧊 Model 3D
            </button>
            <button
              onClick={() => {
                // Auto-select first extrudable object and switch to 3D
                if (extrudableObjects.length > 0) {
                  selectObjects([extrudableObjects[0].id]);
                  switchTo3D();
                }
              }}
              className="flex-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded transition-colors"
            >
              ⬆️ Extrude
            </button>
          </div>
        </div>
      )}

      {/* Help */}
      <div className="p-2 text-xs text-gray-500 border-t border-gray-700">
        💡 Use hotkeys for quick tool selection • Hold Shift for constraints
      </div>
    </div>
  );
};

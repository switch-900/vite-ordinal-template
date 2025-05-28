import React, { useState, useEffect } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';

export const ViewTransitionHelper = () => {
  const { viewMode, objects, selectedIds } = useScene();
  const { addObject } = useSceneActions();
  const [showHelper, setShowHelper] = useState(false);
  const [availableActions, setAvailableActions] = useState([]);

  useEffect(() => {
    const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
    const actions = [];
    
    if (viewMode === '2d') {
      // In 2D mode, suggest actions for selected sketches
      const sketches = selectedObjects.filter(obj => obj.isSketch);
      if (sketches.length > 0) {
        actions.push({
          id: 'extrude-to-3d',
          title: 'Extrude to 3D',
          description: 'Convert your 2D sketch into a 3D object',
          icon: '🏗️',
          action: () => extrudeSketch(sketches[0])
        });
        
        actions.push({
          id: 'revolve-to-3d',
          title: 'Revolve to 3D',
          description: 'Revolve your sketch around an axis',
          icon: '🌀',
          action: () => revolveSketch(sketches[0])
        });
      }
      
      if (selectedObjects.length === 0) {
        actions.push({
          id: 'start-sketch',
          title: 'Start Sketching',
          description: 'Begin drawing 2D shapes',
          icon: '✏️',
          action: () => {}
        });
      }
    } else if (viewMode === '3d') {
      // In 3D mode, suggest sketch on face actions
      const meshes = selectedObjects.filter(obj => !obj.isSketch);
      if (meshes.length === 1) {
        actions.push({
          id: 'sketch-on-face',
          title: 'Sketch on Face',
          description: 'Draw 2D shapes on the selected object face',
          icon: '📐',
          action: () => sketchOnFace(meshes[0])
        });
      }
      
      actions.push({
        id: 'switch-to-2d',
        title: 'Switch to 2D',
        description: 'Create precise 2D sketches',
        icon: '📏',
        action: () => {}
      });
    }

    setAvailableActions(actions);
    setShowHelper(actions.length > 0);
  }, [viewMode, selectedIds, objects]); // Use selectedIds and objects instead of selectedObjects

  const extrudeSketch = (sketch) => {
    if (!sketch.sketchData) return;
    
    const bounds = sketch.sketchData.bounds;
    const extrudeDepth = 1.0;
    
    const extrudedObject = {
      id: `extruded-${Date.now()}`,
      type: 'object',
      geometry: 'box',
      geometryArgs: [
        Math.max(0.1, bounds.width) || 1,
        extrudeDepth,
        Math.max(0.1, bounds.height) || 1
      ],
      position: [bounds.centerX || 0, bounds.centerY || 0, bounds.centerZ || 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      material: {
        color: '#4a90e2',
        metalness: 0.1,
        roughness: 0.8,
        opacity: 1.0
      },
      visible: true,
      locked: false,
      sourceSketch: sketch.id
    };

    addObject(extrudedObject);
  };

  const revolveSketch = (sketch) => {
    if (!sketch.sketchData) return;
    
    const bounds = sketch.sketchData.bounds;
    
    const revolvedObject = {
      id: `revolved-${Date.now()}`,
      type: 'object',
      geometry: 'cylinder',
      geometryArgs: [
        Math.max(0.1, bounds.width / 2) || 0.5,
        Math.max(0.1, bounds.width / 2) || 0.5,
        Math.max(0.1, bounds.height) || 1,
        32
      ],
      position: [bounds.centerX || 0, bounds.centerY || 0, bounds.centerZ || 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      material: {
        color: '#e74c3c',
        metalness: 0.1,
        roughness: 0.8,
        opacity: 1.0
      },
      visible: true,
      locked: false,
      sourceSketch: sketch.id
    };

    addObject(revolvedObject);
  };

  const sketchOnFace = (object) => {
    // This would typically detect the face and set up a work plane
    console.log('Sketching on face of object:', object.id);
  };

  if (!showHelper || availableActions.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-20 right-4 z-20 bg-gray-900 bg-opacity-95 rounded-lg shadow-xl border border-gray-700 p-4 max-w-xs">
      <div className="flex justify-between items-center mb-3">
        <div className="text-white text-sm font-semibold flex items-center">
          <span className="mr-2">💡</span>
          Quick Actions
        </div>
        <button 
          onClick={() => setShowHelper(false)}
          className="text-gray-400 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        {availableActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-600 hover:border-gray-500"
          >
            <div className="flex items-start">
              <span className="text-lg mr-3">{action.icon}</span>
              <div>
                <div className="text-white text-sm font-medium">{action.title}</div>
                <div className="text-gray-400 text-xs mt-1">{action.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-600 text-xs text-gray-400">
        {viewMode === '2d' ? 
          'Create 2D sketches, then convert to 3D' : 
          'Model in 3D or sketch on object faces'
        }
      </div>
    </div>
  );
};

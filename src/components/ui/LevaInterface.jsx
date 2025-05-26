import React, { useMemo } from 'react';
import { useControls, button, folder } from 'leva';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';
import * as THREE from 'three';

export const LevaInterface = ({ onLoadInViewer }) => {
  const { 
    objects, 
    selectedObjectId, 
    selectedIds, 
    viewMode, 
    transformMode, 
    snapToGrid, 
    gridSize, 
    showGrid,
    layers,
    setSceneState 
  } = useScene();
  
  const { 
    addObject, 
    selectObjects, 
    updateObject, 
    deleteObject, 
    clearSelection 
  } = useSceneActions();

  const selectedObject = objects.find(obj => obj.id === selectedObjectId);

  // Create primitive objects
  const createPrimitive = (type) => {
    console.log('Creating primitive:', type);
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
      name: `${type}_${Date.now()}`,
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

    console.log('Adding object:', obj);
    addObject(obj);
    console.log('Objects after add:', objects);
  };

  // Main controls organized like Fusion 360
  const controls = useControls({
    // VIEW CONTROLS
    'View Controls': folder({
      'View Mode': {
        value: viewMode,
        options: { '3D': '3d', '2D Sketch': '2d' },
        onChange: (value) => setSceneState({ viewMode: value })
      },
      'Show Grid': {
        value: showGrid,
        onChange: (value) => setSceneState({ showGrid: value })
      },
      'Grid Size': {
        value: gridSize,
        min: 0.1,
        max: 5,
        step: 0.1,
        onChange: (value) => setSceneState({ gridSize: value })
      },
      'Snap to Grid': {
        value: snapToGrid,
        onChange: (value) => setSceneState({ snapToGrid: value })
      }
    }),

    // CREATE TOOLBAR
    'Create': folder({
      'Add Cube': button(() => createPrimitive('box')),
      'Add Sphere': button(() => createPrimitive('sphere')),
      'Add Cylinder': button(() => createPrimitive('cylinder')),
      'Add Plane': button(() => createPrimitive('plane')),
      'Add Cone': button(() => createPrimitive('cone')),
    }),

    // MODIFY TOOLBAR
    'Modify': folder({
      'Transform Mode': {
        value: transformMode,
        options: { 
          'Move': 'translate', 
          'Rotate': 'rotate', 
          'Scale': 'scale' 
        },
        onChange: (value) => setSceneState({ transformMode: value })
      },
      'Clear Selection': button(() => clearSelection()),
      'Delete Selected': button(() => {
        selectedIds.forEach(id => deleteObject(id));
      }),
    }),

    // SELECTION INFO
    'Selection': folder({
      'Selected Objects': `${selectedIds.length} object(s)`,
      'Selected ID': selectedObjectId || 'None',
    }),
  });

  // Object properties panel (only show when object is selected)
  const objectControls = useControls('Object Properties', 
    selectedObject ? {
      'Name': {
        value: selectedObject.name || '',
        onChange: (value) => updateObject(selectedObjectId, { name: value })
      },
      'Visible': {
        value: selectedObject.visible ?? true,
        onChange: (value) => updateObject(selectedObjectId, { visible: value })
      },
      'Position': folder({
        'Pos X': {
          value: selectedObject.position[0],
          min: -10,
          max: 10,
          step: 0.1,
          onChange: (value) => {
            const newPos = [...selectedObject.position];
            newPos[0] = value;
            updateObject(selectedObjectId, { position: newPos });
          }
        },
        'Pos Y': {
          value: selectedObject.position[1],
          min: -10,
          max: 10,
          step: 0.1,
          onChange: (value) => {
            const newPos = [...selectedObject.position];
            newPos[1] = value;
            updateObject(selectedObjectId, { position: newPos });
          }
        },
        'Pos Z': {
          value: selectedObject.position[2],
          min: -10,
          max: 10,
          step: 0.1,
          onChange: (value) => {
            const newPos = [...selectedObject.position];
            newPos[2] = value;
            updateObject(selectedObjectId, { position: newPos });
          }
        }
      }),
      'Rotation': folder({
        'Rot X°': {
          value: selectedObject.rotation[0] * (180 / Math.PI),
          min: -180,
          max: 180,
          step: 1,
          onChange: (value) => {
            const newRot = [...selectedObject.rotation];
            newRot[0] = value * (Math.PI / 180);
            updateObject(selectedObjectId, { rotation: newRot });
          }
        },
        'Rot Y°': {
          value: selectedObject.rotation[1] * (180 / Math.PI),
          min: -180,
          max: 180,
          step: 1,
          onChange: (value) => {
            const newRot = [...selectedObject.rotation];
            newRot[1] = value * (Math.PI / 180);
            updateObject(selectedObjectId, { rotation: newRot });
          }
        },
        'Rot Z°': {
          value: selectedObject.rotation[2] * (180 / Math.PI),
          min: -180,
          max: 180,
          step: 1,
          onChange: (value) => {
            const newRot = [...selectedObject.rotation];
            newRot[2] = value * (Math.PI / 180);
            updateObject(selectedObjectId, { rotation: newRot });
          }
        }
      }),
      'Scale': folder({
        'Scale X': {
          value: selectedObject.scale[0],
          min: 0.1,
          max: 5,
          step: 0.1,
          onChange: (value) => {
            const newScale = [...selectedObject.scale];
            newScale[0] = value;
            updateObject(selectedObjectId, { scale: newScale });
          }
        },
        'Scale Y': {
          value: selectedObject.scale[1],
          min: 0.1,
          max: 5,
          step: 0.1,
          onChange: (value) => {
            const newScale = [...selectedObject.scale];
            newScale[1] = value;
            updateObject(selectedObjectId, { scale: newScale });
          }
        },
        'Scale Z': {
          value: selectedObject.scale[2],
          min: 0.1,
          max: 5,
          step: 0.1,
          onChange: (value) => {
            const newScale = [...selectedObject.scale];
            newScale[2] = value;
            updateObject(selectedObjectId, { scale: newScale });
          }
        }
      })
    } : {
      'No Object Selected': 'Select an object to edit properties'
    }, 
    { collapsed: !selectedObject }
  );

  // Material properties panel
  const materialControls = useControls('Material', 
    selectedObject ? {
      'Color': {
        value: selectedObject.material?.color || '#ff6600',
        onChange: (value) => updateObject(selectedObjectId, {
          material: { ...selectedObject.material, color: value }
        })
      },
      'Metalness': {
        value: selectedObject.material?.metalness || 0.1,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => updateObject(selectedObjectId, {
          material: { ...selectedObject.material, metalness: value }
        })
      },
      'Roughness': {
        value: selectedObject.material?.roughness || 0.7,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => updateObject(selectedObjectId, {
          material: { ...selectedObject.material, roughness: value }
        })
      },
      'Opacity': {
        value: selectedObject.material?.opacity || 1.0,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (value) => updateObject(selectedObjectId, {
          material: { ...selectedObject.material, opacity: value }
        })
      },
      'Emissive': {
        value: selectedObject.material?.emissive || '#000000',
        onChange: (value) => updateObject(selectedObjectId, {
          material: { ...selectedObject.material, emissive: value }
        })
      },
      'Emissive Intensity': {
        value: selectedObject.material?.emissiveIntensity || 0.0,
        min: 0,
        max: 2,
        step: 0.1,
        onChange: (value) => updateObject(selectedObjectId, {
          material: { ...selectedObject.material, emissiveIntensity: value }
        })
      }
    } : {
      'No Material': 'Select an object to edit material'
    },
    { collapsed: !selectedObject }
  );

  // Scene hierarchy panel
  const hierarchyControls = useControls('Scene Hierarchy', {
    'Total Objects': objects.length,
    'Visible Objects': objects.filter(obj => obj.visible).length,
    'Selected Count': selectedIds.length,
    'Clear All': button(() => {
      objects.forEach(obj => deleteObject(obj.id));
    }),
  });

  // Boolean operations panel
  const booleanControls = useControls('Boolean Operations',
    selectedIds.length >= 2 ? {
      'Union': button(() => {
        const unionId = `union_${Date.now()}`;
        const unionObj = {
          id: unionId,
          name: `Union_${Date.now()}`,
          type: 'boolean',
          operation: 'union',
          sourceObjects: [...selectedIds],
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          material: {
            type: 'standard',
            color: '#00ff00',
            metalness: 0.1,
            roughness: 0.7,
          },
          visible: true,
          locked: false,
        };
        addObject(unionObj);
        clearSelection();
      }),
      'Subtract': button(() => {
        const subtractId = `subtract_${Date.now()}`;
        const subtractObj = {
          id: subtractId,
          name: `Subtract_${Date.now()}`,
          type: 'boolean',
          operation: 'subtract',
          sourceObjects: [...selectedIds],
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          material: {
            type: 'standard',
            color: '#ff0000',
            metalness: 0.1,
            roughness: 0.7,
          },
          visible: true,
          locked: false,
        };
        addObject(subtractObj);
        clearSelection();
      }),
      'Intersect': button(() => {
        const intersectId = `intersect_${Date.now()}`;
        const intersectObj = {
          id: intersectId,
          name: `Intersect_${Date.now()}`,
          type: 'boolean',
          operation: 'intersect',
          sourceObjects: [...selectedIds],
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          material: {
            type: 'standard',
            color: '#0000ff',
            metalness: 0.1,
            roughness: 0.7,
          },
          visible: true,
          locked: false,
        };
        addObject(intersectObj);
        clearSelection();
      })
    } : {
      'Info': 'Select 2+ objects for boolean operations'
    },
    { collapsed: selectedIds.length < 2 }
  );

  // Export and Scene Management
  const exportControls = useControls('Export & Scene', {
    'Export GLB': button(() => {
      // Create scene data for export
      const sceneData = {
        objects,
        layers,
        settings: {
          viewMode,
          showGrid,
          gridSize,
          snapToGrid
        },
        metadata: {
          created: new Date().toISOString(),
          version: '1.0.0',
          totalObjects: objects.length
        }
      };
      
      // Call the parent's export handler if provided
      if (onLoadInViewer) {
        onLoadInViewer(sceneData);
      } else {
        // Fallback: download as JSON
        const blob = new Blob([JSON.stringify(sceneData, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scene_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }),
    'Clear Scene': button(() => {
      if (confirm('Are you sure you want to clear the entire scene?')) {
        // Clear all objects
        objects.forEach(obj => deleteObject(obj.id));
        clearSelection();
      }
    }),
    'Load in Viewer': button(() => {
      const sceneData = {
        objects,
        layers,
        settings: { viewMode, showGrid, gridSize, snapToGrid },
        metadata: {
          created: new Date().toISOString(),
          version: '1.0.0',
          totalObjects: objects.length
        }
      };
      
      if (onLoadInViewer) {
        onLoadInViewer(sceneData);
      }
    })
  });

  return null; // Leva handles the UI rendering
};

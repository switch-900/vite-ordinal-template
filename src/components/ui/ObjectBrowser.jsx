import React, { useMemo } from 'react';
import { useControls, button, folder } from 'leva';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';

export const ObjectBrowser = () => {
  const { objects, selectedIds, layers } = useScene();
  const { selectObjects, deleteObject, updateObject } = useSceneActions();

  // Create object browser controls
  const objectBrowserControls = useControls('Object Browser', 
    useMemo(() => {
      const controls = {};

      if (objects.length === 0) {
        controls['No Objects'] = 'Create objects to see them here';
        return controls;
      }

      // Group objects by layer
      const objectsByLayer = {};
      
      objects.forEach(obj => {
        const layerId = obj.layerId || 'default';
        const layer = layers.find(l => l.id === layerId);
        const layerName = layer ? layer.name : 'Default Layer';
        
        if (!objectsByLayer[layerName]) {
          objectsByLayer[layerName] = [];
        }
        objectsByLayer[layerName].push(obj);
      });

      // Create controls for each layer
      Object.keys(objectsByLayer).forEach(layerName => {
        const layerObjects = objectsByLayer[layerName];
        
        const layerControls = {};
        
        layerObjects.forEach(obj => {
          const isSelected = selectedIds.includes(obj.id);
          const prefix = isSelected ? '● ' : '○ ';
          const visibility = obj.visible ? '👁 ' : '🙈 ';
          
          layerControls[`${prefix}${visibility}${obj.name || obj.id}`] = folder({
            [`Select_${obj.id}`]: button(() => selectObjects([obj.id])),
            [`Visible_${obj.id}`]: {
              value: obj.visible ?? true,
              onChange: (value) => updateObject(obj.id, { visible: value })
            },
            [`Delete_${obj.id}`]: button(() => deleteObject(obj.id)),
            [`Type_${obj.id}`]: obj.geometry || obj.type || 'Unknown',
            [`Layer_${obj.id}`]: layerName
          });
        });

        controls[`📁 ${layerName} (${layerObjects.length})`] = folder(layerControls);
      });

      return controls;
    }, [objects, selectedIds, layers, selectObjects, deleteObject, updateObject])
  );

  return null;
};

export const LayerManager = () => {
  const { layers, objects } = useScene();
  const { setSceneState } = useScene();

  const layerControls = useControls('Layer Manager',
    useMemo(() => {
      const controls = {};
      
      layers.forEach(layer => {
        const objectCount = objects.filter(obj => obj.layerId === layer.id).length;
        const visibility = layer.visible ? '👁 ' : '🙈 ';
        
        controls[`${visibility}${layer.name} (${objectCount})`] = folder({
          'Visible': {
            value: layer.visible,
            onChange: (value) => {
              const updatedLayers = layers.map(l => 
                l.id === layer.id ? { ...l, visible: value } : l
              );
              setSceneState({ layers: updatedLayers });
            }
          },
          'Color': {
            value: layer.color || '#3b82f6',
            onChange: (value) => {
              const updatedLayers = layers.map(l => 
                l.id === layer.id ? { ...l, color: value } : l
              );
              setSceneState({ layers: updatedLayers });
            }
          },
          'Locked': {
            value: layer.locked || false,
            onChange: (value) => {
              const updatedLayers = layers.map(l => 
                l.id === layer.id ? { ...l, locked: value } : l
              );
              setSceneState({ layers: updatedLayers });
            }
          }
        });
      });

      controls['Add New Layer'] = button(() => {
        const newLayer = {
          id: `layer_${Date.now()}`,
          name: `Layer ${layers.length + 1}`,
          visible: true,
          locked: false,
          color: '#3b82f6'
        };
        setSceneState({ layers: [...layers, newLayer] });
      });

      return controls;
    }, [layers, objects, setSceneState])
  );

  return null;
};

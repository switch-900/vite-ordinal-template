// filepath: src/components/core/SceneRenderer.jsx
import React, { useRef, useEffect } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';
import { GizmoControls } from '../ui/GizmoControls';
import { Geometry, Base, Addition, Subtraction, Intersection } from '@react-three/csg';

export const SceneRenderer = () => {
  const { objects, selectedObjectId, selectedIds, layers, groups = [] } = useScene();
  const { selectObjects, toggleObjectSelection, clearSelection } = useSceneActions();
  const meshRefs = useRef({});

  // Debug effect to track object changes
  useEffect(() => {
    console.log('SceneRenderer useEffect - objects changed:', objects.length, objects);
  }, [objects]);

  useEffect(() => {
    console.log('SceneRenderer mounted');
    return () => console.log('SceneRenderer unmounted');
  }, []);

  console.log('SceneRenderer render - objects count:', objects.length);
  console.log('SceneRenderer render - full objects array:', objects);
  console.log('SceneRenderer render - selectedIds:', selectedIds);
  console.log('SceneRenderer render - layers:', layers);

  // Filter objects based on layer visibility and group visibility
  const visibleObjects = objects.filter(obj => {
    console.log('Filtering object:', obj.id, 'visible:', obj.visible);
    // Check layer visibility
    const layer = layers.find(l => l.id === obj.layerId);
    const layerVisible = layer ? layer.visible : true;
    console.log('Layer visible for', obj.id, ':', layerVisible);
    
    // Check group visibility if object belongs to a group
    if (obj.groupId) {
      const group = groups.find(g => g.id === obj.groupId);
      const groupVisible = group ? group.visible : true;
      return layerVisible && groupVisible;
    }
    
    return layerVisible;
  });

  console.log('SceneRenderer - visibleObjects count:', visibleObjects.length);
  console.log('SceneRenderer - visibleObjects:', visibleObjects);

  const handleClick = (objectId, event) => {
    event.stopPropagation();
    
    if (event.ctrlKey || event.metaKey) {
      // Multi-select mode
      toggleObjectSelection(objectId);
    } else {
      // Single select mode
      selectObjects([objectId]);
    }
  };

  const handleCanvasClick = (event) => {
    // Clear selection when clicking on empty space
    if (event.target === event.currentTarget) {
      clearSelection();
    }
  };

  // Get mesh reference for TransformGizmo
  const getSelectedMesh = () => {
    return selectedObjectId ? meshRefs.current[selectedObjectId] : null;
  };

  const getGeometry = (geometry, args) => {
    switch (geometry) {
      case 'box':
        return <boxGeometry args={args} />;
      case 'sphere':
        return <sphereGeometry args={args} />;
      case 'cylinder':
        return <cylinderGeometry args={args} />;
      case 'plane':
        return <planeGeometry args={args} />;
      case 'cone':
        return <coneGeometry args={args} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  const getBooleanGeometry = (booleanObj) => {
    const sourceObjs = visibleObjects.filter(obj => booleanObj.sourceObjects.includes(obj.id));
    
    if (sourceObjs.length < 2) return null;

    const [firstObj, secondObj, ...restObjs] = sourceObjs;

    const getGeometryMesh = (obj) => (
      <mesh position={obj.position} rotation={obj.rotation} scale={obj.scale}>
        {getGeometry(obj.geometry, obj.geometryArgs)}
      </mesh>
    );

    return (
      <Geometry>
        <Base>
          {getGeometryMesh(firstObj)}
        </Base>
        {booleanObj.operation === 'union' && (
          <Addition>
            {getGeometryMesh(secondObj)}
          </Addition>
        )}
        {booleanObj.operation === 'subtract' && (
          <Subtraction>
            {getGeometryMesh(secondObj)}
          </Subtraction>
        )}
        {booleanObj.operation === 'intersect' && (
          <Intersection>
            {getGeometryMesh(secondObj)}
          </Intersection>
        )}
      </Geometry>
    );
  };

  const getMaterial = (material, isSelected) => {
    return (
      <meshStandardMaterial
        color={isSelected ? '#ffaa00' : material.color}
        metalness={material.metalness || 0.1}
        roughness={material.roughness || 0.8}
        transparent={isSelected || (material.opacity !== undefined && material.opacity < 1.0)}
        opacity={isSelected ? 0.8 : (material.opacity || 1.0)}
        emissive={material.emissive || '#000000'}
        emissiveIntensity={material.emissiveIntensity || 0.0}
      />
    );
  };

  return (
    <group onClick={handleCanvasClick}>
      {console.log('SceneRenderer rendering - visibleObjects count:', visibleObjects.length)}
      {visibleObjects.length === 0 && (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
      )}
      {visibleObjects.map((obj) => {
        console.log('Rendering object:', obj.id, obj);
        if (!obj.visible) return null;
        
        const isSelected = selectedIds.includes(obj.id);
        
        // Handle boolean objects differently
        if (obj.type === 'boolean') {
          return (
            <mesh
              key={obj.id}
              ref={(ref) => {
                if (ref) {
                  meshRefs.current[obj.id] = ref;
                }
              }}
              position={obj.position}
              rotation={obj.rotation}
              scale={obj.scale}
              onClick={(e) => handleClick(obj.id, e)}
            >
              {getBooleanGeometry(obj)}
              {getMaterial(obj.material, isSelected)}
            </mesh>
          );
        }
        
        // Handle regular objects
        return (
          <mesh
            key={obj.id}
            ref={(ref) => {
              if (ref) {
                meshRefs.current[obj.id] = ref;
              }
            }}
            position={obj.position}
            rotation={obj.rotation}
            scale={obj.scale}
            onClick={(e) => handleClick(obj.id, e)}
          >
            {getGeometry(obj.geometry, obj.geometryArgs)}
            {getMaterial(obj.material, isSelected)}
          </mesh>
        );
      })}
      <GizmoControls selectedMesh={getSelectedMesh()} />
    </group>
  );
};

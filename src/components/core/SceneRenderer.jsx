// filepath: src/components/core/SceneRenderer.jsx
import React, { useRef } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';
import { GizmoControls } from '../ui/GizmoControls';
import { Geometry, Base, Addition, Subtraction, Intersection } from '@react-three/csg';
import { boxelGeometry } from "boxels-shader";
import CustomShaderMaterial from 'three-custom-shader-material';
import * as THREE from "three";

export const SceneRenderer = () => {
  const { objects, selectedObjectId, selectedIds, layers, groups = [], transformMode } = useScene();
  const { selectObjects, toggleObjectSelection, clearSelection } = useSceneActions();
  const meshRefs = useRef({});

  // Filter objects based on layer visibility and group visibility
  const visibleObjects = objects.filter(obj => {
    // Check layer visibility
    const layer = layers.find(l => l.id === obj.layerId);
    const layerVisible = layer ? layer.visible : true;
    
    // Check group visibility if object belongs to a group
    if (obj.groupId) {
      const group = groups.find(g => g.id === obj.groupId);
      const groupVisible = group ? group.visible : true;
      return layerVisible && groupVisible;
    }
    
    return layerVisible;
  });

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
    // Clear selection when clicking on the background plane
    event.stopPropagation();
    clearSelection();
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
      case 'boxel':
        return boxelGeometry; // Boxel uses a pre-built geometry
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

  const getMaterial = (material, isSelected, isBoxel = false) => {
    if (isBoxel) {
      return (
        <CustomShaderMaterial
          baseMaterial={THREE.MeshStandardMaterial}
          flatShading={true}
          transparent={true}
          uniforms={{time: {value: 0}}}
          vertexShader={`
            attribute float angle;
            varying vec3 vPos;
            varying vec3 vNormal;
            void main() {
              csm_Position += normal * 0.1 * 0.5;
              vPos = csm_Position;
              vNormal = normal;
            }
          `}
          fragmentShader={`
            varying vec3 vPos;
            varying vec3 vNormal;
            void main() {
              vec3 color = ${isSelected ? 'vec3(1.0, 0.7, 0.0)' : 'vec3(1.0, 0.4, 0.0)'};
              csm_DiffuseColor = vec4(color, 0.9);
            }
          `}
        />
      );
    }
    
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
    <>
      {/* Background plane for click handling */}
      <mesh 
        position={[0, -0.01, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleCanvasClick}
        visible={false}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      <group>
        {visibleObjects.map((obj) => {
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
              geometry={obj.geometry === 'boxel' ? boxelGeometry : undefined}
            >
              {obj.geometry !== 'boxel' && getGeometry(obj.geometry, obj.geometryArgs)}
              {getMaterial(obj.material, isSelected, obj.geometry === 'boxel')}
            </mesh>
          );
        })}
        <GizmoControls selectedMesh={getSelectedMesh()} />
      </group>
    </>
  );
};

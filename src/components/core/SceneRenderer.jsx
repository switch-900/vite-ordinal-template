// filepath: src/components/core/SceneRenderer.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';
import { GizmoControls } from '../ui/GizmoControls';
import { SimpleTransformControls } from '../ui/SimpleTransformControls';
import { Geometry, Base, Addition, Subtraction, Intersection } from '@react-three/csg';
import { boxelGeometry } from "boxels-shader";
import CustomShaderMaterial from 'three-custom-shader-material';
import * as THREE from "three";

export const SceneRenderer = () => {
  const { objects, selectedObjectId, selectedIds, layers, groups = [], transformMode } = useScene();
  const { selectObjects, toggleObjectSelection, clearSelection } = useSceneActions();
  const meshRefs = useRef({});
  const [time, setTime] = useState(0);
  const isGizmoDragging = useRef(false);
  const isInteracting = useRef(false); // Track if user is interacting with the scene
  
  // Animation time for shaders
  useFrame((state, delta) => {
    setTime(prevTime => prevTime + delta);
  });

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
    // Stop propagation to prevent canvas click handler from triggering
    event.stopPropagation();
    
    // Set interaction flag briefly
    isInteracting.current = true;
    setTimeout(() => {
      isInteracting.current = false;
    }, 100);
    
    // Don't change selection during gizmo operations
    if (isGizmoDragging.current) {
      return;
    }
    
    // Handle selection based on modifier keys
    if (event.ctrlKey || event.metaKey) {
      toggleObjectSelection(objectId);
    } else {
      selectObjects([objectId]);
    }
  };

  const handleCanvasClick = (event) => {
    // Don't clear selection if we're in the middle of a gizmo operation
    if (isGizmoDragging.current || isInteracting.current) {
      return;
    }
    
    // Don't clear selection immediately if transform mode is active
    // Give users time to interact with transform controls
    if (transformMode && selectedIds.length > 0) {
      return;
    }
    
    clearSelection();
  };

  // Get mesh reference for TransformGizmo
  const getSelectedMesh = () => {
    return selectedObjectId ? meshRefs.current[selectedObjectId] : null;
  };

  // Apply custom angle modification to a geometry if needed
  const applyAngleModification = (geometry, angle = 0.1) => {
    if (!geometry || angle === undefined) return geometry;
    
    // Clone the geometry to avoid modifying the original
    const modifiedGeometry = geometry.clone();
    
    // Apply angle modification to each vertex
    const vertices = modifiedGeometry.attributes.position;
    const normals = modifiedGeometry.attributes.normal;
    
    for (let i = 0; i < vertices.count; i++) {
      const nx = normals.getX(i);
      const ny = normals.getY(i);
      const nz = normals.getZ(i);
      
      // Move vertex along its normal direction based on angle value
      vertices.setXYZ(
        i,
        vertices.getX(i) + nx * angle * 0.5,
        vertices.getY(i) + ny * angle * 0.5,
        vertices.getZ(i) + nz * angle * 0.5
      );
    }
    
    vertices.needsUpdate = true;
    return modifiedGeometry;
  };

  const getGeometry = (geometry, args, angle) => {
    // For boxel, we use the pre-built geometry with custom shader
    if (geometry === 'boxel') {
      return boxelGeometry;
    }
    
    // For other geometries
    let threeGeometry;
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
    // Get all source objects, even if they're currently hidden
    const sourceObjs = objects.filter(obj => booleanObj.sourceObjects.includes(obj.id));
    
    if (sourceObjs.length < 2) return null;

    const [firstObj, secondObj, ...restObjs] = sourceObjs;

    // Calculate offset to position the geometry relative to the boolean object's position
    const calculateOffset = (obj) => {
      return [
        obj.position[0] - booleanObj.position[0],
        obj.position[1] - booleanObj.position[1], 
        obj.position[2] - booleanObj.position[2]
      ];
    };

    const getGeometryMesh = (obj) => (
      <mesh position={calculateOffset(obj)} rotation={obj.rotation} scale={obj.scale}>
        {getGeometry(obj.geometry, obj.geometryArgs)}
      </mesh>
    );

    // Render boolean operations with proper CSG geometry
    return (
      <Geometry>
        <Base>
          {getGeometryMesh(firstObj)}
        </Base>
        {booleanObj.operation === 'union' && (
          <Addition>
            {getGeometryMesh(secondObj)}
            {restObjs.map(obj => (
              <Addition key={obj.id}>
                {getGeometryMesh(obj)}
              </Addition>
            ))}
          </Addition>
        )}
        {booleanObj.operation === 'subtract' && (
          <Subtraction>
            {getGeometryMesh(secondObj)}
            {restObjs.map(obj => (
              <Subtraction key={obj.id}>
                {getGeometryMesh(obj)}
              </Subtraction>
            ))}
          </Subtraction>
        )}
        {booleanObj.operation === 'intersect' && (
          <Intersection>
            {getGeometryMesh(secondObj)}
            {restObjs.map(obj => (
              <Intersection key={obj.id}>
                {getGeometryMesh(obj)}
              </Intersection>
            ))}
          </Intersection>
        )}
      </Geometry>
    );
  };

  const getMaterial = (material, isSelected, isBoxel = false, obj = null) => {
    // Get angle from object or default to 0.1
    const angle = obj?.angle || 0.1;

    // Use simple MeshStandardMaterial for most cases, CustomShaderMaterial only for boxel or when angle is used
    if (!isBoxel && angle === 0.1) {
      return (
        <meshStandardMaterial
          transparent={isSelected || (material?.opacity !== undefined && material?.opacity < 1.0)}
          opacity={isSelected ? 0.8 : (material?.opacity || 1.0)}
          color={isSelected ? '#ffaa00' : material?.color || '#808080'}
          metalness={material?.metalness || 0.1}
          roughness={material?.roughness || 0.8}
          emissive={material?.emissive || '#000000'}
          emissiveIntensity={material?.emissiveIntensity || 0.0}
        />
      );
    }

    // Use CustomShaderMaterial for boxel geometry or when angle modification is needed
    return (
      <CustomShaderMaterial
        baseMaterial={THREE.MeshStandardMaterial}
        flatShading={true}
        transparent={isSelected || (material?.opacity !== undefined && material?.opacity < 1.0)}
        opacity={isSelected ? 0.8 : (material?.opacity || 1.0)}
        color={isSelected ? '#ffaa00' : material?.color || '#808080'}
        metalness={material?.metalness || 0.1}
        roughness={material?.roughness || 0.8}
        emissive={material?.emissive || '#000000'}
        emissiveIntensity={material?.emissiveIntensity || 0.0}
        uniforms={{
          time: {value: time},
          angle: {value: angle} // Pass angle as uniform instead of forcing re-render
        }}
        vertexShader={`
          attribute float angle;
          varying vec3 vPos;
          varying vec3 vNormal;
          uniform float time;
          uniform float angle;
          
          void main() {
            // Use uniform angle instead of template literal
            csm_Position += normal * (angle - 0.2 + 0.01) * 0.5;
            vPos = csm_Position;
            vNormal = normal;
          }
        `}
        fragmentShader={`
          varying vec3 vPos;
          varying vec3 vNormal;
          uniform float time;
          
          void main() {
            ${isSelected ? 'float colorPulse = sin(time) * 0.05 + 0.95; csm_DiffuseColor.rgb *= colorPulse;' : ''}
          }
        `}
      />
    );
  };

  return (
    <>
      {/* Background plane for click handling */}
      {/* Background plane - completely disabled during transform operations */}
      {!transformMode && (
        <mesh 
          position={[0, -0.01, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={handleCanvasClick}
          visible={false}
        >
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}
      
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
                    ref.name = `mesh-${obj.id}`;
                    ref.userData = { objectId: obj.id, objectType: 'boolean' };
                  }
                }}
                position={obj.position}
                rotation={obj.rotation}
                scale={obj.scale}
                onClick={(e) => handleClick(obj.id, e)}
              >
                {getBooleanGeometry(obj)}
                {getMaterial(obj.material, isSelected, false, obj)}
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
                  ref.name = `mesh-${obj.id}`;
                  // Store important properties in userData for efficient access
                  ref.userData = { 
                    objectId: obj.id, 
                    objectType: obj.geometry,
                    angle: obj.angle || 0.1 // Default angle value for shape modification
                  };
                }
              }}
              position={obj.position}
              rotation={obj.rotation}
              scale={obj.scale}
              onClick={(e) => handleClick(obj.id, e)}
              geometry={obj.geometry === 'boxel' ? boxelGeometry : undefined}
            >
              {obj.geometry !== 'boxel' && getGeometry(obj.geometry, obj.geometryArgs, obj.angle)}
              {getMaterial(obj.material, isSelected, obj.geometry === 'boxel', obj)}
            </mesh>
          );
        })}
      </group>
      
      {/* Render transform controls LAST to ensure event priority */}
      <GizmoControls 
        selectedMesh={getSelectedMesh()} 
        onDraggingChanged={(isDragging) => isGizmoDragging.current = isDragging} 
      />
    </>
  );
};

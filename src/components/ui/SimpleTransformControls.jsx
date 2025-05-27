import React, { useRef, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';
import * as THREE from 'three';

export const SimpleTransformControls = ({ selectedMesh, onDraggingChanged }) => {
  const { transformMode, selectedObjectId } = useScene();
  const { updateObject } = useSceneActions();
  const { camera, gl, raycaster, pointer } = useThree();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState(null);
  const [dragStartMouse, setDragStartMouse] = useState(null);
  
  const handlePointerDown = useCallback((event) => {
    if (!selectedMesh) return;
    
    event.stopPropagation();
    setIsDragging(true);
    setDragStartPosition(selectedMesh.position.clone());
    setDragStartMouse({ x: pointer.x, y: pointer.y });
    
    if (onDraggingChanged) {
      onDraggingChanged(true);
    }
    
    // Disable orbit controls
    gl.domElement.style.cursor = 'grabbing';
  }, [selectedMesh, pointer, onDraggingChanged, gl]);
  
  const handlePointerMove = useCallback((event) => {
    if (!isDragging || !selectedMesh || !dragStartPosition || !dragStartMouse) return;
    
    const deltaX = pointer.x - dragStartMouse.x;
    const deltaY = pointer.y - dragStartMouse.y;
    
    // Simple translation based on mouse movement
    const newPosition = dragStartPosition.clone();
    newPosition.x += deltaX * 5; // Scale factor for mouse sensitivity
    newPosition.y -= deltaY * 5; // Invert Y axis
    
    selectedMesh.position.copy(newPosition);
    
    // Update the store immediately
    updateObject(selectedObjectId, {
      position: [newPosition.x, newPosition.y, newPosition.z]
    });
  }, [isDragging, selectedMesh, dragStartPosition, dragStartMouse, pointer, updateObject, selectedObjectId]);
  
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDragStartPosition(null);
    setDragStartMouse(null);
    
    if (onDraggingChanged) {
      onDraggingChanged(false);
    }
    
    gl.domElement.style.cursor = 'default';
  }, [onDraggingChanged, gl]);
  
  // Set up event listeners
  React.useEffect(() => {
    if (!selectedMesh) return;
    
    const canvas = gl.domElement;
    
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
    };
  }, [selectedMesh, handlePointerDown, handlePointerMove, handlePointerUp, gl]);
  
  if (!selectedMesh || !selectedObjectId) {
    return null;
  }
  
  // Simple visual gizmo - just a wireframe box around the selected object
  return (
    <group>
      <mesh position={selectedMesh.position} scale={selectedMesh.scale} rotation={selectedMesh.rotation}>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
        <meshBasicMaterial color="orange" wireframe transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

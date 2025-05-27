import React, { useCallback, useRef } from 'react';
import { TransformControls } from '@react-three/drei';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';

export const GizmoControls = ({ selectedMesh, onDraggingChanged }) => {
  const { transformMode, selectedObjectId } = useScene();
  const { updateObject } = useSceneActions();
  const transformRef = useRef();
  const isDragging = useRef(false);

  // ✅ Handle dragging state change events with better state management
  const handleDraggingChanged = useCallback((event) => {
    const newIsDragging = event.value;
    isDragging.current = newIsDragging;
    
    console.log('🎮 Transform dragging changed:', newIsDragging);
    
    // ✅ More robust camera control management
    if (window.cam) {
      window.cam.enabled = !newIsDragging;
      
      // ✅ Ensure camera doesn't interfere during transform
      if (newIsDragging) {
        // Disable any auto-rotation or camera animations
        window.cam.dampingFactor = 0.25; // Slower damping during transform
      } else {
        // Restore normal camera behavior
        window.cam.dampingFactor = 0.05;
      }
    }
    
    // Notify parent component
    if (onDraggingChanged) {
      onDraggingChanged(newIsDragging);
    }
  }, [onDraggingChanged]);

  // ✅ Handle object transformation with immediate updates
  const handleObjectChange = useCallback((event) => {
    if (!selectedObjectId || !event?.target?.object || !isDragging.current) return;
    
    const object = event.target.object;
    console.log('🔄 Transform update:', {
      position: [object.position.x, object.position.y, object.position.z],
      rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
      scale: [object.scale.x, object.scale.y, object.scale.z]
    });
    
    // ✅ Immediate update during drag for responsive feel
    updateObject(selectedObjectId, {
      position: [
        Math.round(object.position.x * 1000) / 1000, // Round to avoid floating point issues
        Math.round(object.position.y * 1000) / 1000,
        Math.round(object.position.z * 1000) / 1000
      ],
      rotation: [
        Math.round(object.rotation.x * 1000) / 1000,
        Math.round(object.rotation.y * 1000) / 1000,
        Math.round(object.rotation.z * 1000) / 1000
      ],
      scale: [
        Math.max(0.01, Math.round(object.scale.x * 1000) / 1000), // Prevent zero/negative scale
        Math.max(0.01, Math.round(object.scale.y * 1000) / 1000),
        Math.max(0.01, Math.round(object.scale.z * 1000) / 1000)
      ]
    });
  }, [selectedObjectId, updateObject]);

  // ✅ Handle mouse events for better interaction
  const handleMouseDown = useCallback(() => {
    if (transformRef.current) {
      console.log('🎯 Transform controls activated');
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (transformRef.current && isDragging.current) {
      console.log('🎯 Transform controls deactivated');
      // Force final update to ensure state consistency
      if (selectedMesh && selectedObjectId) {
        handleObjectChange({ target: { object: selectedMesh } });
      }
    }
  }, [selectedMesh, selectedObjectId, handleObjectChange]);

  // Don't render if no mesh is selected
  if (!selectedMesh || !selectedObjectId) {
    return null;
  }

  return (
    <TransformControls
      ref={transformRef}
      object={selectedMesh}
      mode={transformMode || 'translate'}
      onObjectChange={handleObjectChange}
      onDraggingChanged={handleDraggingChanged}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      // ✅ Transform controls configuration
      showX={true}
      showY={true}
      showZ={true}
      space="world"
      size={1.2} // Slightly larger for easier interaction
      enabled={true}
      visible={true}
      // ✅ Improve gizmo appearance
      lineWidth={3}
      // ✅ Snap settings if needed
      translationSnap={window.scene?.snapToGrid ? window.scene?.gridSize || 0.5 : null}
      rotationSnap={Math.PI / 12} // 15 degree snaps
      scaleSnap={0.1}
    />
  );
};
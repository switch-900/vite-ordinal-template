import React, { useCallback, useRef } from 'react';
import { TransformControls } from '@react-three/drei';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';

export const GizmoControls = ({ selectedMesh }) => {
  const { transformMode, selectedObjectId } = useScene();
  const { updateObject } = useSceneActions();
  const isChangingRef = useRef(false);

  const handleObjectChange = useCallback((event) => {
    if (!selectedObjectId || !event?.target?.object || isChangingRef.current) return;
    
    isChangingRef.current = true;
    const object = event.target.object;
    const updates = {
      position: [object.position.x, object.position.y, object.position.z],
      rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
      scale: [object.scale.x, object.scale.y, object.scale.z]
    };
    
    updateObject(selectedObjectId, updates);
    
    // Reset flag after a short delay
    setTimeout(() => {
      isChangingRef.current = false;
    }, 10);
  }, [selectedObjectId, updateObject]);

  if (!selectedMesh || !selectedObjectId) {
    return null;
  }

  return (
    <TransformControls
      object={selectedMesh}
      mode={transformMode || 'translate'}
      showX={true}
      showY={true}
      showZ={true}
      space="world"
      size={0.8}
      onObjectChange={handleObjectChange}
      enabled={true}
      visible={true}
    />
  );
};

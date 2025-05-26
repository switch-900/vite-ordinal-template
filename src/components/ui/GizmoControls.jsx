import React from 'react';
import { TransformControls } from '@react-three/drei';

export const GizmoControls = ({ selectedMesh }) => {
  if (!selectedMesh) {
    return null;
  }

  return (
    <TransformControls
      object={selectedMesh}
      mode="translate"
      showX={true}
      showY={true}
      showZ={true}
      space="world"
      size={0.8}
    />
  );
};

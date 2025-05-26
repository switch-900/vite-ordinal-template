// filepath: src/components/core/CameraManager.jsx
import React, { useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { OrthographicCamera, PerspectiveCamera, CameraControls } from '@react-three/drei';
import { useScene } from '../../state/sceneStore.jsx';

export const CameraManager = () => {
  const orthoRef = useRef();
  const perspRef = useRef();
  const { viewMode } = useScene();

  return (
    <>
      <OrthographicCamera
        ref={orthoRef}
        makeDefault={viewMode === '2d'}
        position={[0, 10, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        zoom={50}
      />
      <PerspectiveCamera
        ref={perspRef}
        makeDefault={viewMode === '3d'}
        fov={45}
        position={[5, 5, 5]}
      />
      {viewMode === '3d' && <CameraControls makeDefault={false} />}
    </>
  );
};

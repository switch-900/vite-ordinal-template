// filepath: src/components/core/CameraManager.jsx
import React, { useRef, Suspense } from 'react';
import { useThree } from '@react-three/fiber';
import { OrthographicCamera, PerspectiveCamera, CameraControls } from '@react-three/drei';
import { useScene } from '../../state/sceneStore.jsx';

export const CameraManager = () => {
  const orthoRef = useRef();
  const perspRef = useRef();
  const { viewMode } = useScene();
  const { gl } = useThree();

  console.log('CameraManager render - viewMode:', viewMode);

  // Make sure we have a valid gl context before rendering controls
  const canRenderControls = gl && gl.domElement;

  console.log('CameraManager - canRenderControls:', canRenderControls);

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
      {viewMode === '3d' && canRenderControls && (
        <Suspense fallback={null}>
          <CameraControls makeDefault={false} />
        </Suspense>
      )}
    </>
  );
};

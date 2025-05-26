// filepath: src/ViewerApp.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls, Environment } from '@react-three/drei';

// Simple viewer that can load and display exported scenes
export const ViewerApp = ({ sceneData, onBackToBuilder }) => {
  const renderScene = () => {
    if (!sceneData) return null;
    
    // Parse JSON scene data if provided
    if (typeof sceneData === 'string') {
      try {
        const objects = JSON.parse(sceneData);
        return objects.map((obj, index) => (
          <mesh
            key={index}
            position={obj.position}
            rotation={obj.rotation}
            scale={obj.scale}
          >
            {getGeometry(obj.geometry, obj.args)}
            {getMaterial(obj.material)}
          </mesh>
        ));
      } catch (e) {
        console.error('Failed to parse scene data:', e);
        return null;
      }
    }
    
    return null;
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

  const getMaterial = (material) => {
    return (
      <meshStandardMaterial
        color={material.color}
        metalness={material.metalness}
        roughness={material.roughness}
      />
    );
  };

  return (
    <div className="w-full h-full">
      <div className="absolute top-2 left-2 z-10 bg-gray-900 bg-opacity-80 text-white p-2 rounded">
        <h3 className="text-sm font-bold">3D Viewer</h3>
        <p className="text-xs text-gray-300">Orbit • Pan • Zoom</p>
        {onBackToBuilder && (
          <button
            className="mt-2 px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
            onClick={onBackToBuilder}
          >
            ← Back to Builder
          </button>
        )}
      </div>
      
      <Canvas
        camera={{ position: [5, 5, 5], fov: 45 }}
        dpr={1}
      >
        <color attach="background" args={[0.1, 0.1, 0.12]} />
        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.3} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          {renderScene()}
          
          <CameraControls makeDefault />
        </Suspense>
      </Canvas>
    </div>
  );
};

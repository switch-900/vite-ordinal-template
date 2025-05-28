import React, { useState, useRef, useEffect } from 'react';
import { useScene } from '../../state/sceneStore.jsx';
import * as THREE from 'three';

export const DimensionSystem = () => {
  const { objects, selectedIds, view2DMode } = useScene();
  const [dimensions, setDimensions] = useState([]);
  const [showDimensions, setShowDimensions] = useState(true);
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);

  // Calculate dimensions for selected sketches
  useEffect(() => {
    const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
    
    if (selectedObjects.length === 0) {
      setDimensions([]);
      return;
    }

    const newDimensions = [];
    
    selectedObjects.forEach(obj => {
      if (obj.isSketch && obj.sketchData && obj.sketchData.bounds) {
        const bounds = obj.sketchData.bounds;
        
        // Add dimension lines based on view mode
        switch (view2DMode) {
          case 'front':
          case 'back':
            newDimensions.push({
              type: 'horizontal',
              value: bounds.width,
              position: [bounds.centerX, bounds.centerY - bounds.height/2 - 0.5, bounds.centerZ],
              label: `${bounds.width.toFixed(2)}`,
            });
            newDimensions.push({
              type: 'vertical',
              value: bounds.height,
              position: [bounds.centerX - bounds.width/2 - 0.5, bounds.centerY, bounds.centerZ],
              label: `${bounds.height.toFixed(2)}`,
            });
            break;
          case 'top':
          case 'bottom':
            newDimensions.push({
              type: 'horizontal',
              value: bounds.width,
              position: [bounds.centerX, bounds.centerY, bounds.centerZ - bounds.depth/2 - 0.5],
              label: `${bounds.width.toFixed(2)}`,
            });
            newDimensions.push({
              type: 'depth',
              value: bounds.depth,
              position: [bounds.centerX - bounds.width/2 - 0.5, bounds.centerY, bounds.centerZ],
              label: `${bounds.depth.toFixed(2)}`,
            });
            break;
          case 'right':
          case 'left':
            newDimensions.push({
              type: 'vertical',
              value: bounds.height,
              position: [bounds.centerX, bounds.centerY, bounds.centerZ - bounds.depth/2 - 0.5],
              label: `${bounds.height.toFixed(2)}`,
            });
            newDimensions.push({
              type: 'depth',
              value: bounds.depth,
              position: [bounds.centerX, bounds.centerY - bounds.height/2 - 0.5, bounds.centerZ],
              label: `${bounds.depth.toFixed(2)}`,
            });
            break;
        }
      }
    });

    setDimensions(newDimensions);
  }, [selectedIds, view2DMode, objects]); // Use selectedIds instead of selectedObjects

  // Render dimension line
  const DimensionLine = ({ dimension }) => {
    const { type, position, label, value } = dimension;
    
    const linePoints = [];
    const textPosition = [...position];
    
    // Create dimension line points based on type
    switch (type) {
      case 'horizontal':
        linePoints.push(
          new THREE.Vector3(position[0] - value/2, position[1], position[2]),
          new THREE.Vector3(position[0] + value/2, position[1], position[2])
        );
        break;
      case 'vertical':
        linePoints.push(
          new THREE.Vector3(position[0], position[1] - value/2, position[2]),
          new THREE.Vector3(position[0], position[1] + value/2, position[2])
        );
        break;
      case 'depth':
        linePoints.push(
          new THREE.Vector3(position[0], position[1], position[2] - value/2),
          new THREE.Vector3(position[0], position[1], position[2] + value/2)
        );
        break;
    }

    return (
      <group>
        {/* Dimension line */}
        <line geometry={new THREE.BufferGeometry().setFromPoints(linePoints)}>
          <lineBasicMaterial color="#00ff00" linewidth={2} />
        </line>
        
        {/* Extension lines */}
        {type === 'horizontal' && (
          <>
            <line geometry={new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(position[0] - value/2, position[1] - 0.2, position[2]),
              new THREE.Vector3(position[0] - value/2, position[1] + 0.2, position[2])
            ])}>
              <lineBasicMaterial color="#00ff00" linewidth={1} />
            </line>
            <line geometry={new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(position[0] + value/2, position[1] - 0.2, position[2]),
              new THREE.Vector3(position[0] + value/2, position[1] + 0.2, position[2])
            ])}>
              <lineBasicMaterial color="#00ff00" linewidth={1} />
            </line>
          </>
        )}
        
        {/* Dimension text would go here in a real implementation */}
        <mesh position={textPosition}>
          <planeGeometry args={[0.5, 0.2]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
        </mesh>
      </group>
    );
  };

  if (!showDimensions || dimensions.length === 0) {
    return null;
  }

  return (
    <group>
      {dimensions.map((dimension, index) => (
        <DimensionLine key={index} dimension={dimension} />
      ))}
    </group>
  );
};

// Dimension controls component
export const DimensionControls = () => {
  const [showDimensions, setShowDimensions] = useState(true);
  const [constraintMode, setConstraintMode] = useState(false);

  return (
    <div className="absolute top-32 right-4 z-20 bg-gray-900 bg-opacity-95 rounded-lg shadow-xl border border-gray-700 p-3">
      <div className="text-white text-sm font-semibold mb-2 flex items-center">
        <span className="mr-2">📏</span>
        Dimensions & Constraints
      </div>
      
      <div className="space-y-2">
        <label className="flex items-center text-sm text-gray-300">
          <input
            type="checkbox"
            checked={showDimensions}
            onChange={(e) => setShowDimensions(e.target.checked)}
            className="mr-2"
          />
          Show Dimensions
        </label>
        
        <label className="flex items-center text-sm text-gray-300">
          <input
            type="checkbox"
            checked={constraintMode}
            onChange={(e) => setConstraintMode(e.target.checked)}
            className="mr-2"
          />
          Constraint Mode
        </label>
        
        <div className="pt-2 border-t border-gray-600 text-xs text-gray-400">
          <div>• Select sketches to show dimensions</div>
          <div>• Use constraints for precise modeling</div>
        </div>
      </div>
    </div>
  );
};

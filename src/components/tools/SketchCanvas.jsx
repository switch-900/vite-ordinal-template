// filepath: src/components/tools/SketchCanvas.jsx
import React, { useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useScene } from '../../state/sceneStore.jsx';
import * as THREE from 'three';

export const SketchCanvas = () => {
  const { scene, camera, gl } = useThree();
  const { currentTool } = useScene();
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentLine = useRef(null);
  const currentRect = useRef(null);

  // Start drawing based on current tool
  const handlePointerDown = (event) => {
    event.stopPropagation();
    setIsDrawing(true);
    
    switch (currentTool) {
      case 'Line':
      case 'Path':
        startLine(event);
        break;
      case 'Rectangle':
        startRectangle(event);
        break;
      default:
        break;
    }
  };

  const startLine = (event) => {
    const points = [event.point.clone()];
    const material = new THREE.LineBasicMaterial({ color: 'orange' });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    currentLine.current = { line, points };
  };

  const startRectangle = (event) => {
    const startPoint = event.point.clone();
    const material = new THREE.LineBasicMaterial({ color: 'orange' });
    const geometry = new THREE.BufferGeometry();
    const line = new THREE.LineLoop(geometry, material);
    scene.add(line);
    currentRect.current = { line, startPoint };
  };

  // Add point to current shape on move
  const handlePointerMove = (event) => {
    if (!isDrawing) return;
    event.stopPropagation();
    
    switch (currentTool) {
      case 'Line':
      case 'Path':
        updateLine(event);
        break;
      case 'Rectangle':
        updateRectangle(event);
        break;
      default:
        break;
    }
  };

  const updateLine = (event) => {
    if (!currentLine.current) return;
    const point = event.point.clone();
    if (currentTool === 'Path') {
      // For path tool, add points continuously
      currentLine.current.points.push(point);
      currentLine.current.line.geometry.setFromPoints(currentLine.current.points);
    } else {
      // For line tool, just update the end point
      const points = [currentLine.current.points[0], point];
      currentLine.current.line.geometry.setFromPoints(points);
    }
  };

  const updateRectangle = (event) => {
    if (!currentRect.current) return;
    const endPoint = event.point.clone();
    const start = currentRect.current.startPoint;
    
    const rectPoints = [
      new THREE.Vector3(start.x, start.y, start.z),
      new THREE.Vector3(endPoint.x, start.y, start.z),
      new THREE.Vector3(endPoint.x, endPoint.y, start.z),
      new THREE.Vector3(start.x, endPoint.y, start.z),
    ];
    
    currentRect.current.line.geometry.setFromPoints(rectPoints);
  };

  // Finish shape on up
  const handlePointerUp = (event) => {
    if (!isDrawing) return;
    event.stopPropagation();
    setIsDrawing(false);
    
    if (currentLine.current) {
      setLines((prev) => [...prev, currentLine.current.line]);
      currentLine.current = null;
    }
    
    if (currentRect.current) {
      setLines((prev) => [...prev, currentRect.current.line]);
      currentRect.current = null;
    }
  };

  return (
    <>
      {/* Grid for 2D mode */}
      <gridHelper args={[20, 20, '#444', '#222']} rotation={[0, 0, 0]} />
      
      {/* invisible plane to capture pointer events */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </>
  );
};

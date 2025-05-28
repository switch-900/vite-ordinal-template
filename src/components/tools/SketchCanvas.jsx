// filepath: src/components/tools/SketchCanvas.jsx
import React, { useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';
import * as THREE from 'three';

export const SketchCanvas = () => {
  const { scene, camera, gl, raycaster, pointer } = useThree();
  const { currentTool, view2DMode, snapToGrid, gridSize } = useScene();
  const { addObject } = useSceneActions();
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentSketch, setCurrentSketch] = useState(null);
  const currentLine = useRef(null);
  const currentRect = useRef(null);
  const workPlaneRef = useRef();

  // Get the appropriate work plane based on 2D view mode
  const getWorkPlaneNormal = () => {
    switch (view2DMode) {
      case 'front':
      case 'back':
        return new THREE.Vector3(0, 0, 1); // XY plane
      case 'right':
      case 'left':
        return new THREE.Vector3(1, 0, 0); // YZ plane
      case 'top':
      case 'bottom':
        return new THREE.Vector3(0, 1, 0); // XZ plane
      default:
        return new THREE.Vector3(0, 0, 1);
    }
  };

  // Get 3D position from 2D drawing plane
  const get3DPosition = (point2D) => {
    switch (view2DMode) {
      case 'front':
        return new THREE.Vector3(point2D.x, point2D.y, 0);
      case 'back':
        return new THREE.Vector3(-point2D.x, point2D.y, 0);
      case 'right':
        return new THREE.Vector3(0, point2D.y, -point2D.x);
      case 'left':
        return new THREE.Vector3(0, point2D.y, point2D.x);
      case 'top':
        return new THREE.Vector3(point2D.x, 0, -point2D.y);
      case 'bottom':
        return new THREE.Vector3(point2D.x, 0, point2D.y);
      default:
        return new THREE.Vector3(point2D.x, point2D.y, 0);
    }
  };

  // Convert mouse position to world coordinates on the work plane
  const getWorldPosition = (event) => {
    raycaster.setFromCamera(pointer, camera);
    
    // Create a plane at the origin based on current view mode
    const planeNormal = getWorkPlaneNormal();
    const plane = new THREE.Plane(planeNormal, 0);
    
    const intersectionPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectionPoint);
    
    // Snap to grid if enabled
    if (snapToGrid) {
      intersectionPoint.x = Math.round(intersectionPoint.x / gridSize) * gridSize;
      intersectionPoint.y = Math.round(intersectionPoint.y / gridSize) * gridSize;
      intersectionPoint.z = Math.round(intersectionPoint.z / gridSize) * gridSize;
    }
    
    return intersectionPoint;
  };

  // Start drawing based on current tool
  const handlePointerDown = (event) => {
    event.stopPropagation();
    const worldPos = getWorldPosition(event);
    if (!worldPos) return;
    
    setIsDrawing(true);
    
    switch (currentTool) {
      case 'Line':
      case 'Path':
        startLine(worldPos);
        break;
      case 'Rectangle':
        startRectangle(worldPos);
        break;
      default:
        break;
    }
  };

  const startLine = (startPoint) => {
    const points = [startPoint];
    const material = new THREE.LineBasicMaterial({ 
      color: '#ff6600', 
      linewidth: 2,
      transparent: true,
      opacity: 0.9
    });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    currentLine.current = { line, points, startPoint: startPoint.clone() };
  };

  const startRectangle = (startPoint) => {
    const material = new THREE.LineBasicMaterial({ 
      color: '#ff6600', 
      linewidth: 2,
      transparent: true,
      opacity: 0.9
    });
    const geometry = new THREE.BufferGeometry();
    const line = new THREE.LineLoop(geometry, material);
    scene.add(line);
    currentRect.current = { line, startPoint: startPoint.clone() };
  };

  // Add point to current shape on move
  const handlePointerMove = (event) => {
    if (!isDrawing) return;
    
    const worldPos = getWorldPosition(event);
    if (!worldPos) return;

    if (currentTool === 'Line' && currentLine.current) {
      const { line, points } = currentLine.current;
      const newPoints = [...points, worldPos];
      line.geometry.setFromPoints(newPoints);
      currentLine.current.points = newPoints;
    }

    if (currentTool === 'Rectangle' && currentRect.current) {
      const { line, startPoint } = currentRect.current;
      const width = worldPos.x - startPoint.x;
      const height = worldPos.y - startPoint.y;
      
      // Create rectangle points based on current view mode
      let rectPoints;
      switch (view2DMode) {
        case 'front':
        case 'back':
          rectPoints = [
            new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z),
            new THREE.Vector3(startPoint.x + width, startPoint.y, startPoint.z),
            new THREE.Vector3(startPoint.x + width, startPoint.y + height, startPoint.z),
            new THREE.Vector3(startPoint.x, startPoint.y + height, startPoint.z),
          ];
          break;
        case 'right':
        case 'left':
          rectPoints = [
            new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z),
            new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z + width),
            new THREE.Vector3(startPoint.x, startPoint.y + height, startPoint.z + width),
            new THREE.Vector3(startPoint.x, startPoint.y + height, startPoint.z),
          ];
          break;
        case 'top':
        case 'bottom':
          rectPoints = [
            new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z),
            new THREE.Vector3(startPoint.x + width, startPoint.y, startPoint.z),
            new THREE.Vector3(startPoint.x + width, startPoint.y, startPoint.z + height),
            new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z + height),
          ];
          break;
      }
      
      line.geometry.setFromPoints(rectPoints);
    }
  };

  // Finish shape on up and create 3D object
  const handlePointerUp = (event) => {
    if (!isDrawing) return;
    event.stopPropagation();
    setIsDrawing(false);
    
    let sketchData = null;

    if (currentLine.current && currentLine.current.points.length > 1) {
      const { line, points } = currentLine.current;
      
      // Create a 2D sketch object that can be extruded later
      sketchData = {
        type: 'line',
        points: points.map(p => [p.x, p.y, p.z]),
        viewMode: view2DMode,
        bounds: calculateBounds(points)
      };
      
      // Add as a 2D sketch object
      addSketchObject(sketchData, line);
      setLines((prev) => [...prev, line]);
      currentLine.current = null;
    }
    
    if (currentRect.current) {
      const { line, startPoint } = currentRect.current;
      const geometry = line.geometry;
      const positions = geometry.attributes.position;
      
      if (positions && positions.count > 0) {
        const points = [];
        for (let i = 0; i < positions.count; i++) {
          points.push(new THREE.Vector3(
            positions.getX(i),
            positions.getY(i), 
            positions.getZ(i)
          ));
        }
        
        sketchData = {
          type: 'rectangle',
          points: points.map(p => [p.x, p.y, p.z]),
          viewMode: view2DMode,
          bounds: calculateBounds(points)
        };
        
        addSketchObject(sketchData, line);
        setLines((prev) => [...prev, line]);
      }
      currentRect.current = null;
    }
  };

  // Calculate bounding box for sketch
  const calculateBounds = (points) => {
    if (!points || points.length === 0) return { width: 0, height: 0, depth: 0 };
    
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const zs = points.map(p => p.z);
    
    return {
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
      depth: Math.max(...zs) - Math.min(...zs),
      centerX: (Math.max(...xs) + Math.min(...xs)) / 2,
      centerY: (Math.max(...ys) + Math.min(...ys)) / 2,
      centerZ: (Math.max(...zs) + Math.min(...zs)) / 2,
    };
  };

  // Add sketch object to scene
  const addSketchObject = (sketchData, threejsLine) => {
    const bounds = sketchData.bounds;
    
    // Create a temporary plane geometry to represent the 2D sketch
    const sketchObject = {
      id: `sketch-${Date.now()}`,
      type: 'sketch',
      geometry: 'plane',
      geometryArgs: [Math.max(0.1, bounds.width) || 1, Math.max(0.1, bounds.height) || 1],
      position: [bounds.centerX || 0, bounds.centerY || 0, bounds.centerZ || 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      material: {
        color: '#ff6600',
        metalness: 0.1,
        roughness: 0.9,
        opacity: 0.3,
        transparent: true,
      },
      visible: true,
      locked: false,
      sketchData: sketchData, // Store sketch data for extrusion
      isSketch: true,
    };

    addObject(sketchObject);
  };

  return (
    <>
      {/* 2D Grid based on current view mode */}
      {view2DMode === 'front' || view2DMode === 'back' ? (
        <gridHelper args={[20, 20, '#444', '#222']} rotation={[0, 0, 0]} />
      ) : view2DMode === 'top' || view2DMode === 'bottom' ? (
        <gridHelper args={[20, 20, '#444', '#222']} rotation={[0, 0, 0]} />
      ) : (
        <gridHelper args={[20, 20, '#444', '#222']} rotation={[0, 0, Math.PI / 2]} />
      )}
      
      {/* Work plane for drawing - invisible but captures events */}
      <mesh
        ref={workPlaneRef}
        rotation={
          view2DMode === 'front' || view2DMode === 'back' ? [0, 0, 0] :
          view2DMode === 'top' || view2DMode === 'bottom' ? [-Math.PI / 2, 0, 0] :
          [0, Math.PI / 2, 0]
        }
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Render existing lines */}
      {lines.map((line, index) => (
        <primitive key={index} object={line} />
      ))}
    </>
  );
};

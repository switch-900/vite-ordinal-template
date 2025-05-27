// filepath: src/components/ui/TransformIndicator.jsx
import React, { useState, useEffect } from 'react';
import { useScene } from '../../state/sceneStore.jsx';

export const TransformIndicator = () => {
  const { transformMode, selectedIds } = useScene();
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    if (selectedIds.length > 0) {
      setIsVisible(true);
      
      // Automatically hide after 1.5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [transformMode, selectedIds]);
  
  // Track mouse movement for positioning the indicator
  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  if (!isVisible) return null;
  
  const modeInfo = {
    translate: { color: 'bg-blue-500', icon: '↔', name: 'Move' },
    rotate: { color: 'bg-green-500', icon: '🔄', name: 'Rotate' },
    scale: { color: 'bg-purple-500', icon: '↗', name: 'Scale' },
  };
  
  const mode = modeInfo[transformMode] || modeInfo.translate;
  
  return (
    <div 
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x + 20,
        top: position.y + 20,
      }}
    >
      <div className={`${mode.color} text-white text-sm py-1 px-3 rounded-full shadow-lg flex items-center opacity-80`}>
        <span className="mr-2">{mode.icon}</span>
        <span className="font-medium">{mode.name}</span>
      </div>
    </div>
  );
};

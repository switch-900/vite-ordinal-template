// Main layout wrapper for the SketchUp-style interface
import React from 'react';
import { TopToolbar } from './TopToolbar.jsx';
import { LeftSidebar } from './LeftSidebar.jsx';
import { StatusBar } from './StatusBar.jsx';
import { TransformIndicator } from '../ui/TransformIndicator.jsx';

export const MainLayout = ({ children, onLoadInViewer }) => {
  return (
    <div className="w-full h-full flex flex-col bg-gray-800 overflow-hidden">
      {/* Top Toolbar */}
      <TopToolbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar onLoadInViewer={onLoadInViewer} />
        
        {/* 3D Viewport */}
        <div className="flex-1 relative bg-gray-900">
          {children}
          <TransformIndicator />
        </div>
      </div>
      
      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};

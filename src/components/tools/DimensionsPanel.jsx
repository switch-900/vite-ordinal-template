// 2D Dimensions panel for the sidebar
import React from 'react';
import { useScene } from '../../state/sceneStore.jsx';

export const DimensionsPanel = () => {
  const { currentTool, setSceneState, snapToGrid, gridSize } = useScene();
  
  const dimensionTools = [
    { name: 'Linear', icon: '📏', key: 'DL', description: 'Linear dimension' },
    { name: 'Angular', icon: '📐', key: 'DA', description: 'Angular dimension' },
    { name: 'Radial', icon: '⚪', key: 'DR', description: 'Radial dimension' },
    { name: 'Diameter', icon: '⊕', key: 'DD', description: 'Diameter dimension' },
  ];

  const measurementTools = [
    { name: 'Measure', icon: '📊', key: 'M', description: 'Measure distance' },
    { name: 'Area', icon: '⬜', key: 'AR', description: 'Measure area' },
    { name: 'Perimeter', icon: '🔲', key: 'PE', description: 'Measure perimeter' },
    { name: 'Angle', icon: '📐', key: 'AM', description: 'Measure angle' },
  ];

  const handleToolSelect = (toolName) => {
    setSceneState({ currentTool: toolName });
  };

  const toggleSnapToGrid = () => {
    setSceneState({ snapToGrid: !snapToGrid });
  };

  const handleGridSizeChange = (newSize) => {
    setSceneState({ gridSize: newSize });
  };

  return (
    <div className="space-y-4">
      <div className="text-orange-400 text-sm font-semibold mb-3">
        Dimensions & Measurements
      </div>
      
      {/* Dimension Tools */}
      <div>
        <div className="text-gray-400 text-xs font-medium mb-2">Dimension Tools</div>
        <div className="space-y-1">
          {dimensionTools.map((tool) => (
            <button
              key={tool.name}
              className={`w-full px-3 py-2 rounded text-sm flex items-center space-x-2 transition-all ${
                currentTool === tool.name 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
              }`}
              onClick={() => handleToolSelect(tool.name)}
              title={`${tool.description} (${tool.key})`}
            >
              <span className="text-lg">{tool.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{tool.name}</div>
                <div className="text-xs opacity-60">{tool.key}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Measurement Tools */}
      <div className="pt-4 border-t border-gray-700">
        <div className="text-gray-400 text-xs font-medium mb-2">Measurement Tools</div>
        <div className="space-y-1">
          {measurementTools.map((tool) => (
            <button
              key={tool.name}
              className={`w-full px-3 py-2 rounded text-sm flex items-center space-x-2 transition-all ${
                currentTool === tool.name 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
              }`}
              onClick={() => handleToolSelect(tool.name)}
              title={`${tool.description} (${tool.key})`}
            >
              <span className="text-lg">{tool.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{tool.name}</div>
                <div className="text-xs opacity-60">{tool.key}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Grid Settings */}
      <div className="pt-4 border-t border-gray-700">
        <div className="text-gray-400 text-xs font-medium mb-2">Grid & Snap Settings</div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Snap to Grid</span>
            <button
              onClick={toggleSnapToGrid}
              className={`w-12 h-6 rounded-full transition-colors ${
                snapToGrid ? 'bg-orange-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                snapToGrid ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
          
          <div>
            <label className="text-sm text-gray-300 block mb-1">Grid Size</label>
            <select
              value={gridSize}
              onChange={(e) => handleGridSizeChange(parseFloat(e.target.value))}
              className="w-full px-2 py-1 bg-gray-700 text-white rounded text-sm"
            >
              <option value={0.1}>0.1m</option>
              <option value={0.25}>0.25m</option>
              <option value={0.5}>0.5m</option>
              <option value={1}>1m</option>
              <option value={2}>2m</option>
              <option value={5}>5m</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-gray-400 text-xs">
          Dimensions help create precise technical drawings
        </div>
      </div>
    </div>
  );
};

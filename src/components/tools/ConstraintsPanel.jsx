// 2D Constraints panel for the sidebar
import React from 'react';
import { useScene } from '../../state/sceneStore.jsx';

export const ConstraintsPanel = () => {
  const { currentTool, setSceneState } = useScene();
  
  const constraintCategories = [
    {
      name: 'Geometric Constraints',
      tools: [
        { name: 'Parallel', icon: '‖', key: 'PA', description: 'Make lines parallel' },
        { name: 'Perpendicular', icon: '⊥', key: 'PE', description: 'Make lines perpendicular' },
        { name: 'Tangent', icon: '🔗', key: 'TA', description: 'Make line tangent to curve' },
        { name: 'Coincident', icon: '●', key: 'CO', description: 'Make points coincident' },
      ]
    },
    {
      name: 'Dimensional Constraints',
      tools: [
        { name: 'Distance', icon: '📏', key: 'DI', description: 'Set distance between points' },
        { name: 'Angle', icon: '📐', key: 'AN', description: 'Set angle between lines' },
        { name: 'Radius', icon: '⭕', key: 'RA', description: 'Set circle radius' },
        { name: 'Diameter', icon: '⊕', key: 'DA', description: 'Set circle diameter' },
      ]
    },
    {
      name: 'Equality Constraints',
      tools: [
        { name: 'Equal Length', icon: '=', key: 'EL', description: 'Make lines equal length' },
        { name: 'Equal Radius', icon: '⊚', key: 'ER', description: 'Make circles equal radius' },
        { name: 'Symmetric', icon: '↔️', key: 'SY', description: 'Make objects symmetric' },
        { name: 'Concentric', icon: '⊙', key: 'CC', description: 'Make circles concentric' },
      ]
    }
  ];

  const handleConstraintSelect = (constraintName) => {
    setSceneState({ currentTool: constraintName });
  };

  return (
    <div className="space-y-4">
      <div className="text-orange-400 text-sm font-semibold mb-3">
        Sketch Constraints
      </div>
      
      {constraintCategories.map((category, categoryIndex) => (
        <div key={category.name} className={`${categoryIndex > 0 ? 'mt-4 pt-4 border-t border-gray-700' : ''}`}>
          <div className="text-gray-400 text-xs font-medium mb-2">{category.name}</div>
          <div className="space-y-1">
            {category.tools.map((tool) => (
              <button
                key={tool.name}
                className={`w-full px-3 py-2 rounded text-sm flex items-center space-x-2 transition-all ${
                  currentTool === tool.name 
                    ? 'bg-orange-600 text-white shadow-lg' 
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
                }`}
                onClick={() => handleConstraintSelect(tool.name)}
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
      ))}
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-gray-400 text-xs">
          Select objects first, then apply constraints
        </div>
        <div className="text-gray-400 text-xs mt-1">
          Fully constrained sketches are ready for 3D operations
        </div>
      </div>
    </div>
  );
};

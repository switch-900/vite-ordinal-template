import { useState } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';

export function ConstraintSystem() {
  const { selectedObjectId, objects } = useScene();
  const { updateObject } = useSceneActions();
  const [isOpen, setIsOpen] = useState(false);
  const [activeConstraint, setActiveConstraint] = useState(null);
  
  const selectedObject = objects.find(obj => obj.id === selectedObjectId);
  
  const constraintTypes = [
    { id: 'distance', name: 'Distance', icon: '📏', description: 'Fix distance between points' },
    { id: 'parallel', name: 'Parallel', icon: '||', description: 'Make lines parallel' },
    { id: 'perpendicular', name: 'Perpendicular', icon: '⊥', description: 'Make lines perpendicular' },
    { id: 'horizontal', name: 'Horizontal', icon: '─', description: 'Make line horizontal' },
    { id: 'vertical', name: 'Vertical', icon: '│', description: 'Make line vertical' },
    { id: 'equal', name: 'Equal', icon: '=', description: 'Make lengths equal' },
    { id: 'concentric', name: 'Concentric', icon: '⊙', description: 'Share same center' },
    { id: 'tangent', name: 'Tangent', icon: '∩', description: 'Make tangent to curve' },
    { id: 'symmetry', name: 'Symmetry', icon: '↔', description: 'Mirror across line' },
    { id: 'angle', name: 'Angle', icon: '∠', description: 'Fix angle between lines' }
  ];

  const applyConstraint = (constraintType) => {
    if (!selectedObjectId) return;

    const newConstraint = {
      id: Date.now().toString(),
      type: constraintType,
      objectId: selectedObjectId,
      value: getDefaultValue(constraintType),
      applied: Date.now()
    };

    const constraints = selectedObject.constraints || [];
    
    updateObject(selectedObjectId, {
      constraints: [...constraints, newConstraint]
    });

    setActiveConstraint(newConstraint);
  };

  const getDefaultValue = (constraintType) => {
    switch (constraintType) {
      case 'distance': return 1.0;
      case 'angle': return 90;
      case 'horizontal':
      case 'vertical':
      case 'parallel':
      case 'perpendicular':
      case 'equal':
      case 'concentric':
      case 'tangent':
      case 'symmetry':
        return true;
      default: return null;
    }
  };

  const updateConstraintValue = (constraintId, value) => {
    if (!selectedObjectId) return;

    const constraints = selectedObject.constraints || [];
    const updatedConstraints = constraints.map(c =>
      c.id === constraintId ? { ...c, value } : c
    );

    updateObject(selectedObjectId, {
      constraints: updatedConstraints
    });
  };

  const removeConstraint = (constraintId) => {
    if (!selectedObjectId) return;

    const constraints = selectedObject.constraints || [];
    const updatedConstraints = constraints.filter(c => c.id !== constraintId);

    updateObject(selectedObjectId, {
      constraints: updatedConstraints
    });

    if (activeConstraint && activeConstraint.id === constraintId) {
      setActiveConstraint(null);
    }
  };

  const solveConstraints = () => {
    if (!selectedObjectId) return;

    // Constraint solver logic would go here
    // This is a simplified version - in a real app you'd use a proper constraint solver
    console.log('Solving constraints for object:', selectedObjectId);
    
    // For demo purposes, we'll just show that constraints are being processed
    const constraints = selectedObject.constraints || [];
    console.log(`Processing ${constraints.length} constraints...`);
  };

  if (!selectedObjectId) {
    return (
      <div className="absolute top-60 left-2 z-20">
        <div className="px-3 py-2 bg-gray-700 text-gray-400 rounded-lg shadow-lg text-sm">
          📐 Select a sketch to add constraints
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="absolute top-60 left-2 z-20">
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 shadow-lg"
        >
          📐 Constraints
        </button>
      </div>
    );
  }

  const currentConstraints = selectedObject.constraints || [];

  return (
    <div className="absolute top-60 left-2 z-20 bg-gray-900 text-white p-4 rounded-lg shadow-xl w-80 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Constraint System</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Add Constraints */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2">Add Constraints</h4>
        <div className="grid grid-cols-2 gap-2">
          {constraintTypes.map(constraint => (
            <button
              key={constraint.id}
              onClick={() => applyConstraint(constraint.id)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs flex flex-col items-center"
              title={constraint.description}
            >
              <div className="text-lg mb-1">{constraint.icon}</div>
              <div>{constraint.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Constraints */}
      {currentConstraints.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Applied Constraints</h4>
          <div className="space-y-2">
            {currentConstraints.map(constraint => {
              const constraintType = constraintTypes.find(t => t.id === constraint.type);
              return (
                <div key={constraint.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{constraintType?.icon}</span>
                    <span className="text-xs">{constraintType?.name}</span>
                    {(constraint.type === 'distance' || constraint.type === 'angle') && (
                      <input
                        type="number"
                        value={constraint.value}
                        onChange={(e) => updateConstraintValue(constraint.id, parseFloat(e.target.value))}
                        className="w-16 px-1 py-0.5 bg-gray-700 text-white text-xs rounded"
                        step={constraint.type === 'angle' ? 1 : 0.1}
                      />
                    )}
                    {constraint.type === 'angle' && <span className="text-xs">°</span>}
                  </div>
                  <button
                    onClick={() => removeConstraint(constraint.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Constraint Actions */}
      <div className="flex gap-2">
        <button
          onClick={solveConstraints}
          disabled={currentConstraints.length === 0}
          className={`flex-1 px-3 py-2 text-sm rounded ${
            currentConstraints.length > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          🔧 Solve ({currentConstraints.length})
        </button>
        
        {currentConstraints.length > 0 && (
          <button
            onClick={() => updateObject(selectedObjectId, { constraints: [] })}
            className="px-3 py-2 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-400">
        💡 Constraints define relationships between sketch elements
      </div>
    </div>
  );
}

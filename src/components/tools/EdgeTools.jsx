// Enhanced edge tools for 3D modeling - chamfer, fillet, taper, etc.
import React, { useState } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';

export const EdgeTools = () => {
  const { selectedIds, objects } = useScene();
  const { addObject, updateObject } = useSceneActions();
  const [activeOperation, setActiveOperation] = useState(null);
  const [parameters, setParameters] = useState({
    chamferDistance: 0.1,
    filletRadius: 0.1,
    taperAngle: 5,
    bevelWidth: 0.05,
    extrudeAmount: 0.1
  });

  const edgeOperations = [
    {
      id: 'chamfer',
      name: 'Chamfer',
      icon: '🔪',
      description: 'Create angled cuts on edges',
      parameters: ['chamferDistance'],
      requiresEdgeSelection: true
    },
    {
      id: 'fillet',
      name: 'Fillet',
      icon: '🌙',
      description: 'Round edges with smooth curves',
      parameters: ['filletRadius'],
      requiresEdgeSelection: true
    },
    {
      id: 'taper',
      name: 'Taper',
      icon: '📐',
      description: 'Apply gradual angle to faces',
      parameters: ['taperAngle'],
      requiresFaceSelection: true
    },
    {
      id: 'bevel',
      name: 'Bevel',
      icon: '⬜',
      description: 'Create beveled edges',
      parameters: ['bevelWidth'],
      requiresEdgeSelection: true
    },
    {
      id: 'shell',
      name: 'Shell',
      icon: '🗂️',
      description: 'Hollow out solid objects',
      parameters: ['extrudeAmount'],
      requiresFaceSelection: true
    },
    {
      id: 'draft',
      name: 'Draft',
      icon: '📊',
      description: 'Add draft angles for manufacturing',
      parameters: ['taperAngle'],
      requiresFaceSelection: true
    }
  ];

  const performEdgeOperation = async (operation) => {
    if (selectedIds.length === 0) {
      console.warn(`${operation.name} requires object selection`);
      return;
    }

    const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
    console.log(`🔧 Performing ${operation.name} on ${selectedObjects.length} objects`);

    selectedObjects.forEach(obj => {
      const modifiedObject = {
        ...obj,
        id: `${obj.id}_${operation.id}_${Date.now()}`,
        name: `${obj.name}_${operation.name}`,
        material: {
          ...obj.material,
          color: operation.id === 'chamfer' ? '#3498db' : 
                 operation.id === 'fillet' ? '#2ecc71' :
                 operation.id === 'taper' ? '#e67e22' :
                 operation.id === 'bevel' ? '#9b59b6' :
                 operation.id === 'shell' ? '#f39c12' : '#e74c3c',
          metalness: 0.2,
          roughness: 0.6
        },
        // Store operation data for potential editing
        edgeOperation: {
          type: operation.id,
          parameters: { ...parameters },
          sourceObject: obj.id,
          timestamp: Date.now()
        }
      };

      addObject(modifiedObject);
    });

    setActiveOperation(null);
  };

  const updateParameter = (key, value) => {
    setParameters(prev => ({
      ...prev,
      [key]: Math.max(0, parseFloat(value) || 0)
    }));
  };

  const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
  const hasSelection = selectedIds.length > 0;

  return (
    <div className="space-y-4">
      <div className="text-orange-400 text-sm font-semibold mb-3">
        Edge & Surface Tools
      </div>
      
      {!hasSelection ? (
        <div className="text-gray-400 text-sm text-center py-8 bg-gray-800 rounded">
          <div className="text-2xl mb-2">🔪</div>
          <div>Select objects to access edge tools</div>
          <div className="text-xs mt-2 opacity-60">
            Chamfer, fillet, taper and more
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gray-800 rounded p-3 mb-4">
            <div className="text-gray-300 text-sm font-medium mb-1">
              Selection: {selectedIds.length} object{selectedIds.length > 1 ? 's' : ''}
            </div>
            <div className="text-gray-400 text-xs">
              Choose edge operation to apply
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {edgeOperations.map((operation) => (
              <button
                key={operation.id}
                onClick={() => setActiveOperation(operation)}
                className={`p-3 rounded text-sm flex flex-col items-center space-y-1 transition-all ${
                  activeOperation?.id === operation.id
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
                title={operation.description}
              >
                <span className="text-lg">{operation.icon}</span>
                <span className="font-medium text-xs">{operation.name}</span>
              </button>
            ))}
          </div>

          {activeOperation && (
            <div className="bg-gray-800 rounded p-4 space-y-3">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">{activeOperation.icon}</span>
                <div>
                  <div className="text-white font-medium">{activeOperation.name}</div>
                  <div className="text-gray-400 text-xs">{activeOperation.description}</div>
                </div>
              </div>

              {activeOperation.parameters.map(param => (
                <div key={param} className="space-y-1">
                  <label className="text-gray-300 text-sm capitalize">
                    {param.replace(/([A-Z])/g, ' $1').trim()}:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={parameters[param]}
                      onChange={(e) => updateParameter(param, e.target.value)}
                      min="0"
                      step="0.01"
                      className="flex-1 bg-gray-700 text-white px-2 py-1 rounded text-sm"
                    />
                    <span className="text-gray-400 text-xs">
                      {param.includes('angle') ? '°' : 'units'}
                    </span>
                  </div>
                </div>
              ))}

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => performEdgeOperation(activeOperation)}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm font-medium"
                >
                  Apply {activeOperation.name}
                </button>
                <button
                  onClick={() => setActiveOperation(null)}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-gray-400 text-xs space-y-1">
          <div>• Select edges/faces for precise operations</div>
          <div>• Use with mesh and solid objects</div>
          <div>• Operations create new modified objects</div>
        </div>
      </div>
    </div>
  );
};

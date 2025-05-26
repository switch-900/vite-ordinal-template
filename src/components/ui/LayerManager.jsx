import { useState } from 'react';
import { useScene } from '../../state/sceneStore.jsx';

export function LayerManager() {
  const { layers, objects } = useScene();
  const [newLayerName, setNewLayerName] = useState('');
  
  // Temporarily disable layer functions during migration
  const addLayer = () => console.log('Layer management temporarily disabled');
  const deleteLayer = () => console.log('Layer management temporarily disabled');
  const updateLayer = () => console.log('Layer management temporarily disabled');
  const moveObjectToLayer = () => console.log('Layer management temporarily disabled');
  const toggleLayerVisibility = () => console.log('Layer management temporarily disabled');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddLayer = () => {
    if (newLayerName.trim()) {
      addLayer({
        id: Date.now().toString(),
        name: newLayerName.trim(),
        visible: true,
        locked: false,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      });
      setNewLayerName('');
    }
  };

  const handleDeleteLayer = (layerId) => {
    if (layers.length > 1) { // Keep at least one layer
      deleteLayer(layerId);
    }
  };

  const handleDragStart = (e, objectId) => {
    e.dataTransfer.setData('text/plain', objectId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, layerId) => {
    e.preventDefault();
    const objectId = e.dataTransfer.getData('text/plain');
    moveObjectToLayer(objectId, layerId);
  };

  const getObjectsInLayer = (layerId) => {
    return objects.filter(obj => obj.layerId === layerId);
  };

  if (!isExpanded) {
    return (
      <div className="absolute top-20 right-2 z-20">
        <button
          onClick={() => setIsExpanded(true)}
          className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 shadow-lg"
        >
          📁 Layers
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-20 right-2 z-20 bg-gray-900 text-white p-4 rounded-lg shadow-xl w-80 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Layer Manager</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Add new layer */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newLayerName}
          onChange={(e) => setNewLayerName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddLayer()}
          placeholder="New layer name"
          className="flex-1 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-orange-500 outline-none"
        />
        <button
          onClick={handleAddLayer}
          className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          +
        </button>
      </div>

      {/* Layer list */}
      <div className="space-y-2">
        {layers.map(layer => {
          const layerObjects = getObjectsInLayer(layer.id);
          
          return (
            <div
              key={layer.id}
              className="border border-gray-700 rounded p-2"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, layer.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-4 h-4 rounded border border-gray-600"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="text-sm font-medium">{layer.name}</span>
                  <span className="text-xs text-gray-400">({layerObjects.length})</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleLayerVisibility(layer.id)}
                    className={`text-xs px-2 py-1 rounded ${
                      layer.visible ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                  >
                    {layer.visible ? '👁️' : '🙈'}
                  </button>
                  <button
                    onClick={() => updateLayer(layer.id, { locked: !layer.locked })}
                    className={`text-xs px-2 py-1 rounded ${
                      layer.locked ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                    title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                  >
                    {layer.locked ? '🔒' : '🔓'}
                  </button>
                  {layers.length > 1 && (
                    <button
                      onClick={() => handleDeleteLayer(layer.id)}
                      className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700"
                      title="Delete layer"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {/* Objects in layer */}
              {layerObjects.length > 0 && (
                <div className="ml-4 space-y-1">
                  {layerObjects.map(obj => (
                    <div
                      key={obj.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, obj.id)}
                      className="flex items-center justify-between p-1 bg-gray-800 rounded text-xs cursor-move hover:bg-gray-700"
                    >
                      <span>{obj.type || obj.geometry} - {obj.id.slice(0, 8)}</span>
                      {obj.material && (
                        <div
                          className="w-3 h-3 rounded border border-gray-600"
                          style={{ backgroundColor: obj.material.color || '#ffffff' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-400">
        💡 Drag objects between layers to organize your scene
      </div>
    </div>
  );
}

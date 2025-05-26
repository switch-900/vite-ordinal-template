// filepath: src/components/ui/ObjectManager.jsx
import React from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';

export const ObjectManager = () => {
  const { objects, selectedIds, setSceneState } = useScene();
  const { selectObjects, deleteObject: removeObject } = useSceneActions();

  const toggleVisibility = (id) => {
    setSceneState((prev) => ({
      objects: prev.objects.map((obj) =>
        obj.id === id ? { ...obj, visible: !obj.visible } : obj
      ),
    }));
  };

  const toggleLock = (id) => {
    setSceneState((prev) => ({
      objects: prev.objects.map((obj) =>
        obj.id === id ? { ...obj, locked: !obj.locked } : obj
      ),
    }));
  };

  const deleteObject = (id) => {
    removeObject(id);
  };

  const selectObject = (id) => {
    selectObjects([id]);
  };

  return (
    <div className="absolute left-2 bottom-2 w-64 max-h-96 bg-gray-900 bg-opacity-90 text-white p-3 rounded shadow overflow-y-auto">
      <h3 className="text-sm font-bold mb-2">Objects ({objects.length})</h3>
      {objects.length === 0 ? (
        <p className="text-gray-400 text-xs">No objects in scene</p>
      ) : (
        <div className="space-y-1">
          {objects.map((obj) => (
            <div
              key={obj.id}
              className={`flex items-center space-x-2 p-1 rounded text-xs cursor-pointer ${
                selectedIds.includes(obj.id) ? 'bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => selectObject(obj.id)}
            >
              <button
                className={`w-4 h-4 text-xs ${obj.visible ? 'text-green-400' : 'text-gray-500'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(obj.id);
                }}
              >
                👁
              </button>
              <button
                className={`w-4 h-4 text-xs ${obj.locked ? 'text-red-400' : 'text-gray-500'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(obj.id);
                }}
              >
                🔒
              </button>
              <span className="flex-1 truncate">{obj.name}</span>
              <button
                className="w-4 h-4 text-red-400 hover:text-red-300"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteObject(obj.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

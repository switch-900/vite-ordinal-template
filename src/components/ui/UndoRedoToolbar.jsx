import React from 'react';
import { useScene } from '../../state/sceneStore.jsx';
import { undoRedoManager } from '../../utils/undoRedo';

export const UndoRedoToolbar = () => {
  const scene = useScene();
  
  // Temporarily disable undo/redo during migration
  const undo = () => console.log('Undo temporarily disabled');
  const redo = () => console.log('Redo temporarily disabled');
  const canUndo = () => false;
  const canRedo = () => false;
  
  const undoAvailable = canUndo();
  const redoAvailable = canRedo();
  
  const undoInfo = undoRedoManager.getUndoInfo();
  const redoInfo = undoRedoManager.getRedoInfo();

  return (
    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 flex space-x-1 bg-gray-800 bg-opacity-90 rounded p-1">
      <button
        className={`px-2 py-1 rounded text-xs ${
          undoAvailable 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
        onClick={undo}
        disabled={!undoAvailable}
        title={undoAvailable ? `Undo: ${undoInfo?.description}` : 'Nothing to undo'}
      >
        ↶ Undo
      </button>
      
      <button
        className={`px-2 py-1 rounded text-xs ${
          redoAvailable 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
        onClick={redo}
        disabled={!redoAvailable}
        title={redoAvailable ? `Redo: ${redoInfo?.description}` : 'Nothing to redo'}
      >
        ↷ Redo
      </button>
      
      {/* History info */}
      <div className="px-2 py-1 text-xs text-gray-300 bg-gray-700 rounded">
        History: {undoRedoManager.history.length}
      </div>
    </div>
  );
};

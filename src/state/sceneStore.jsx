import { createContext, useContext, useState, useCallback } from 'react';
import { undoRedoManager } from '../utils/undoRedo.js';

// Create context for scene state
const SceneContext = createContext();

// Initial state
const initialState = {
  objects: [],
  selectedIds: [],
  selectedObjectId: null,
  viewMode: '3d',
  currentTool: 'Line',
  transformMode: 'translate',
  snapToGrid: true,
  gridSize: 0.5,
  showGrid: true,
  layers: [
    {
      id: 'default',
      name: 'Default Layer',
      visible: true,
      locked: false,
      color: '#3b82f6'
    }
  ],
  groups: [],
};

// Provider component
export const SceneProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const setSceneState = useCallback((updates) => {
    if (typeof updates === 'function') {
      setState(prevState => ({ ...prevState, ...updates(prevState) }));
    } else {
      setState(prevState => ({ ...prevState, ...updates }));
    }
  }, []);

  const value = {
    ...state,
    setSceneState
  };

  return (
    <SceneContext.Provider value={value}>
      {children}
    </SceneContext.Provider>
  );
};

// Helper to save state for undo/redo
const saveStateForUndo = (description = 'Action') => {
  // This will need to be updated to work with the new context-based approach
  // For now, we'll skip undo functionality to get the app working
};

// Hook to read scene state
export const useScene = () => {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error('useScene must be used within a SceneProvider');
  }
  return context;
};

// Export setSceneState function for backwards compatibility
export const setSceneState = (updates) => {
  // This will be handled by the context provider
  console.warn('setSceneState called outside of component - use useScene hook instead');
};

// Initialize undo system with empty state
undoRedoManager.saveState(initialState, 'Initial State');

// These functions will now be used as helpers that can be called from components
// They need to be wrapped in custom hooks that have access to the context

// Convenience actions - these need to be converted to hooks
export const useSceneActions = () => {
  const { setSceneState } = useScene();

  const addObject = useCallback((obj) => {
    // Assign to default layer if no layer specified
    if (!obj.layerId) {
      obj.layerId = 'default';
    }
    saveStateForUndo(`Add ${obj.type || obj.geometry}`);
    setSceneState((prev) => ({ objects: [...prev.objects, obj] }));
  }, [setSceneState]);

  const selectObjects = useCallback((ids) => {
    setSceneState({ 
      selectedIds: ids,
      selectedObjectId: ids.length === 1 ? ids[0] : null
    });
  }, [setSceneState]);

  const toggleObjectSelection = useCallback((id) => {
    setSceneState((prev) => {
      const isSelected = prev.selectedIds.includes(id);
      const newSelectedIds = isSelected 
        ? prev.selectedIds.filter(selectedId => selectedId !== id)
        : [...prev.selectedIds, id];
      
      return {
        selectedIds: newSelectedIds,
        selectedObjectId: newSelectedIds.length === 1 ? newSelectedIds[0] : null
      };
    });
  }, [setSceneState]);

  const clearSelection = useCallback(() => {
    setSceneState({ selectedIds: [], selectedObjectId: null });
  }, [setSceneState]);

  const updateObject = useCallback((id, updates) => {
    saveStateForUndo(`Update object`);
    setSceneState((prev) => ({
      objects: prev.objects.map(obj =>
        obj.id === id ? { ...obj, ...updates } : obj
      )
    }));
  }, [setSceneState]);

  const deleteObject = useCallback((id) => {
    saveStateForUndo(`Delete object`);
    setSceneState((prev) => ({
      objects: prev.objects.filter(obj => obj.id !== id),
      selectedIds: prev.selectedIds.filter(selectedId => selectedId !== id),
      selectedObjectId: prev.selectedObjectId === id ? null : prev.selectedObjectId
    }));
  }, [setSceneState]);

  return {
    addObject,
    selectObjects,
    toggleObjectSelection,
    clearSelection,
    updateObject,
    deleteObject
  };
};

// For backwards compatibility, export the old function names as well
export const selectObjects = (ids) => {
  console.warn('selectObjects called outside component - use useSceneActions hook instead');
};

export const toggleObjectSelection = (id) => {
  console.warn('toggleObjectSelection called outside component - use useSceneActions hook instead');
};

export const clearSelection = () => {
  console.warn('clearSelection called outside component - use useSceneActions hook instead');
};

export const updateObject = (id, updates) => {
  console.warn('updateObject called outside component - use useSceneActions hook instead');
};

export const deleteObject = (id) => {
  console.warn('deleteObject called outside component - use useSceneActions hook instead');
};

// Undo/Redo actions - temporarily disabled during migration
export const undo = () => {
  console.warn('undo temporarily disabled during state management migration');
};

export const redo = () => {
  console.warn('redo temporarily disabled during state management migration');
};

export const canUndo = () => false; // Temporarily return false
export const canRedo = () => false; // Temporarily return false

export const setViewMode = (mode) => {
  console.warn('setViewMode called outside component - use useScene hook instead');
};

// Layer management functions - temporarily disabled during migration
export const addLayer = (layer) => {
  console.warn('addLayer called outside component - use context hook instead');
};

export const deleteLayer = (layerId) => {
  console.warn('deleteLayer called outside component - use context hook instead');
};

export const updateLayer = (layerId, updates) => {
  console.warn('updateLayer called outside component - use context hook instead');
};

export const toggleLayerVisibility = (layerId) => {
  console.warn('toggleLayerVisibility called outside component - use context hook instead');
};

export const moveObjectToLayer = (objectId, layerId) => {
  console.warn('moveObjectToLayer called outside component - use context hook instead');
};

// Group management functions - temporarily disabled during migration
export const createGroup = (objectIds, groupName) => {
  console.warn('createGroup called outside component - use context hook instead');
};

export const ungroupObjects = (groupId) => {
  console.warn('ungroupObjects called outside component - use context hook instead');
};

export const addObjectToGroup = (objectId, groupId) => {
  console.warn('addObjectToGroup called outside component - use context hook instead');
};

export const removeObjectFromGroup = (objectId) => {
  console.warn('removeObjectFromGroup called outside component - use context hook instead');
};

export const toggleGroupVisibility = (groupId) => {
  console.warn('toggleGroupVisibility called outside component - use context hook instead');
};

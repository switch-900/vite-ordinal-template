import { useEffect } from 'react';
import { useScene, useSceneActions } from '../state/sceneStore.jsx';

export const useKeyboardShortcuts = () => {
  const { selectedIds, viewMode, setSceneState } = useScene();
  const { deleteObject, clearSelection } = useSceneActions();

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle shortcuts in 3D mode and when not typing in inputs
      if (viewMode !== '3d' || event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }
      
      console.log(`Key pressed: ${event.key}, transform mode activated`); // Debug logging

      switch (event.key.toLowerCase()) {
        case 'z':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (event.shiftKey) {
              // redo(); // Ctrl+Shift+Z = Redo - temporarily disabled
              console.log('Redo - temporarily disabled during migration');
            } else {
              // undo(); // Ctrl+Z = Undo - temporarily disabled
              console.log('Undo - temporarily disabled during migration');
            }
          }
          break;

        case 'y':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // redo(); // Ctrl+Y = Redo (alternative) - temporarily disabled
            console.log('Redo - temporarily disabled during migration');
          }
          break;

        case 'delete':
        case 'backspace':
          event.preventDefault();
          selectedIds.forEach(id => deleteObject(id));
          break;
          
        case 'escape':
          // Only clear selection if we're not actively transforming
          if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            // Don't clear selection if a transform mode is active and objects are selected
            // This prevents accidental clearing during transform operations
            setSceneState(prev => {
              if (prev.selectedIds.length > 0 && prev.transformMode) {
                // Just disable transform mode instead of clearing selection
                return { transformMode: 'translate' };
              } else {
                // Clear selection only if no active transform
                clearSelection();
                return {};
              }
            });
          }
          break;
          
        case 'g':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            setSceneState({ transformMode: 'translate' });
          }
          break;
          
        case 'r':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            setSceneState({ transformMode: 'rotate' });
          }
          break;
          
        case 's':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            setSceneState({ transformMode: 'scale' });
          }
          break;

        case 'h':
          event.preventDefault();
          // Toggle grid visibility
          setSceneState(prev => ({ showGrid: !prev.showGrid }));
          break;

        case 'tab':
          event.preventDefault();
          // Toggle snap to grid
          setSceneState(prev => ({ snapToGrid: !prev.snapToGrid }));
          break;

        case '1':
          event.preventDefault();
          setSceneState({ viewMode: '3d' });
          break;

        case '2':
          event.preventDefault();
          setSceneState({ viewMode: '2d' });
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, viewMode]);
};

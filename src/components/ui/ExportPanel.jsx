// filepath: src/components/ui/ExportPanel.jsx
import React, { useState } from 'react';
import { useScene } from '../../state/sceneStore.jsx';
import { exportAsJSX, exportAsJSON } from '../../utils/exportScene';
import { undoRedoManager } from '../../utils/undoRedo';

export const ExportPanel = ({ onLoadInViewer }) => {
  const { objects } = useScene();
  const [showPanel, setShowPanel] = useState(false);
  const [format, setFormat] = useState('jsx');
  const [exportCode, setExportCode] = useState('');
  const [importCode, setImportCode] = useState('');

  const handleExport = () => {
    const code = format === 'jsx' ? exportAsJSX(objects) : exportAsJSON(objects);
    setExportCode(code);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportCode);
  };

  const loadInViewer = () => {
    if (exportCode && onLoadInViewer) {
      onLoadInViewer(exportCode);
    }
  };

  const handleImport = () => {
    try {
      const sceneData = JSON.parse(importCode);
      if (sceneData && Array.isArray(sceneData.objects)) {
        // Save current state for undo
        undoRedoManager.saveState({
          objects: objects,
          selectedIds: [],
          selectedObjectId: null
        }, 'Before Import');
        
        // Load the imported scene
        setSceneState({
          objects: sceneData.objects,
          selectedIds: [],
          selectedObjectId: null
        });
        
        setImportCode('');
        alert('Scene imported successfully!');
      } else {
        alert('Invalid scene data format');
      }
    } catch (error) {
      alert('Error parsing scene data: ' + error.message);
    }
  };

  if (!showPanel) {
    return (
      <button
        className="absolute bottom-2 right-2 px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        onClick={() => setShowPanel(true)}
      >
        Export Scene
      </button>
    );
  }

  return (
    <div className="absolute bottom-2 right-2 w-96 bg-gray-900 bg-opacity-95 text-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold">Export Scene</h3>
        <button
          className="text-gray-400 hover:text-white"
          onClick={() => setShowPanel(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="flex space-x-2 mb-3">
        <button
          className={`px-2 py-1 rounded text-xs ${format === 'jsx' ? 'bg-orange-600' : 'bg-gray-700'}`}
          onClick={() => setFormat('jsx')}
        >
          JSX
        </button>
        <button
          className={`px-2 py-1 rounded text-xs ${format === 'json' ? 'bg-orange-600' : 'bg-gray-700'}`}
          onClick={() => setFormat('json')}
        >
          JSON
        </button>
      </div>

      <button
        className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-3"
        onClick={handleExport}
      >
        Generate {format.toUpperCase()} Code
      </button>

      {exportCode && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Generated Code:</span>
            <div className="flex space-x-1">
              <button
                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                onClick={copyToClipboard}
              >
                Copy
              </button>
              {format === 'json' && (
                <button
                  className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                  onClick={loadInViewer}
                >
                  View
                </button>
              )}
            </div>
          </div>
          <textarea
            className="w-full h-32 bg-gray-800 text-white p-2 rounded text-xs font-mono"
            value={exportCode}
            readOnly
          />
        </div>
      )}
    </div>
  );
};

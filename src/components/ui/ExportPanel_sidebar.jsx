// Simplified Export panel for sidebar
import React, { useState } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';
import { exportAsJSX, exportAsJSON } from '../../utils/exportScene';

export const ExportPanel = ({ onLoadInViewer }) => {
  const { objects } = useScene();
  const [format, setFormat] = useState('jsx');
  const [exportCode, setExportCode] = useState('');

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

  return (
    <div className="space-y-4">
      <h3 className="text-white text-sm font-bold">Export Scene</h3>
      
      <div className="flex space-x-2">
        <button
          className={`px-3 py-1 rounded text-xs ${format === 'jsx' ? 'bg-orange-600' : 'bg-gray-700'}`}
          onClick={() => setFormat('jsx')}
        >
          JSX
        </button>
        <button
          className={`px-3 py-1 rounded text-xs ${format === 'json' ? 'bg-orange-600' : 'bg-gray-700'}`}
          onClick={() => setFormat('json')}
        >
          JSON
        </button>
      </div>

      <button
        className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        onClick={handleExport}
        disabled={objects.length === 0}
      >
        Generate {format.toUpperCase()} Code
      </button>

      {exportCode && (
        <div className="space-y-2">
          <div className="flex space-x-2">
            <button
              className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              onClick={copyToClipboard}
            >
              Copy
            </button>
            {format === 'jsx' && (
              <button
                className="flex-1 px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                onClick={loadInViewer}
              >
                View
              </button>
            )}
          </div>
          <textarea
            className="w-full h-24 bg-gray-800 text-white p-2 rounded text-xs font-mono"
            value={exportCode}
            readOnly
          />
        </div>
      )}

      {objects.length === 0 && (
        <div className="text-gray-400 text-center py-4">
          <div className="text-2xl mb-2">📤</div>
          <p className="text-xs">Add objects to export</p>
        </div>
      )}
    </div>
  );
};

import { useScene } from '../../state/sceneStore.jsx';

export const SettingsPanel = () => {
  const { snapToGrid, gridSize, showGrid, setSceneState } = useScene();

  const updateSetting = (key, value) => {
    setSceneState({ [key]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-white text-sm font-bold">Settings</h3>

      {/* Grid Settings */}
      <div className="mb-4">
        <h4 className="text-xs text-gray-400 mb-2">Grid & Snap</h4>
        
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs">Show Grid</label>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => updateSetting('showGrid', e.target.checked)}
            className="w-4 h-4"
          />
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs">Snap to Grid</label>
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={(e) => updateSetting('snapToGrid', e.target.checked)}
            className="w-4 h-4"
          />
        </div>
        
        <div className="mb-2">
          <label className="block text-xs text-gray-400 mb-1">
            Grid Size: {gridSize}
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={gridSize}
            onChange={(e) => updateSetting('gridSize', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Performance Settings */}
      <div className="mb-4">
        <h4 className="text-xs text-gray-400 mb-2">Performance</h4>
        
        <div className="text-xs text-gray-300">
          <div>Objects: {useScene().objects.length}</div>
          <div>Selected: {useScene().selectedIds.length}</div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mb-4">
        <h4 className="text-xs text-gray-400 mb-2">Shortcuts</h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div><kbd className="bg-gray-700 px-1 rounded">G</kbd> - Translate</div>
          <div><kbd className="bg-gray-700 px-1 rounded">R</kbd> - Rotate</div>
          <div><kbd className="bg-gray-700 px-1 rounded">S</kbd> - Scale</div>
          <div><kbd className="bg-gray-700 px-1 rounded">Esc</kbd> - Deselect</div>
          <div><kbd className="bg-gray-700 px-1 rounded">Del</kbd> - Delete</div>
        </div>
      </div>
    </div>
  );
};

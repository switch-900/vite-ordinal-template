import { useState } from 'react';
import { useScene } from '../../state/sceneStore.jsx';

export function PerformancePanel() {
  const { objects, groups = [], layers } = useScene();
  const [isOpen, setIsOpen] = useState(false);
  const [performanceSettings, setPerformanceSettings] = useState({
    enableFrustumCulling: true,
    enableInstancedRendering: false,
    maxRenderDistance: 100,
    lodEnabled: true,
    shadowsEnabled: true,
    antialiasingEnabled: true,
    pixelRatio: window.devicePixelRatio
  });

  const stats = {
    totalObjects: objects.length,
    visibleObjects: objects.filter(obj => {
      const layer = layers.find(l => l.id === obj.layerId);
      const layerVisible = layer ? layer.visible : true;
      
      if (obj.groupId) {
        const group = groups.find(g => g.id === obj.groupId);
        const groupVisible = group ? group.visible : true;
        return layerVisible && groupVisible;
      }
      
      return layerVisible;
    }).length,
    totalGroups: groups.length,
    totalLayers: layers.length,
    memoryUsage: Math.round((objects.length * 0.5 + groups.length * 0.1) * 100) / 100 // Estimated MB
  };

  const updateSetting = (key, value) => {
    setPerformanceSettings(prev => ({ ...prev, [key]: value }));
  };

  const getPerformanceLevel = () => {
    if (stats.totalObjects < 10) return { level: 'Excellent', color: 'text-green-400' };
    if (stats.totalObjects < 50) return { level: 'Good', color: 'text-yellow-400' };
    if (stats.totalObjects < 100) return { level: 'Moderate', color: 'text-orange-400' };
    return { level: 'Heavy', color: 'text-red-400' };
  };

  const performance = getPerformanceLevel();

  if (!isOpen) {
    return (
      <div className="absolute bottom-20 right-2 z-20">
        <button
          onClick={() => setIsOpen(true)}
          className={`px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 shadow-lg flex items-center gap-2`}
        >
          ⚡ Performance
          <span className={`text-xs ${performance.color}`}>
            ({performance.level})
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-20 right-2 z-20 bg-gray-900 text-white p-4 rounded-lg shadow-xl w-80 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Performance Monitor</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Scene Statistics */}
      <div className="mb-4 p-3 bg-gray-800 rounded">
        <h4 className="text-sm font-semibold mb-2">Scene Statistics</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Total Objects: <span className="text-blue-400">{stats.totalObjects}</span></div>
          <div>Visible Objects: <span className="text-green-400">{stats.visibleObjects}</span></div>
          <div>Groups: <span className="text-yellow-400">{stats.totalGroups}</span></div>
          <div>Layers: <span className="text-purple-400">{stats.totalLayers}</span></div>
          <div className="col-span-2">
            Performance: <span className={performance.color}>{performance.level}</span>
          </div>
          <div className="col-span-2">
            Est. Memory: <span className="text-orange-400">{stats.memoryUsage} MB</span>
          </div>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Optimization Settings</h4>
        
        <div className="flex items-center justify-between">
          <label className="text-xs">Frustum Culling</label>
          <input
            type="checkbox"
            checked={performanceSettings.enableFrustumCulling}
            onChange={(e) => updateSetting('enableFrustumCulling', e.target.checked)}
            className="rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs">Instanced Rendering</label>
          <input
            type="checkbox"
            checked={performanceSettings.enableInstancedRendering}
            onChange={(e) => updateSetting('enableInstancedRendering', e.target.checked)}
            className="rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs">Level of Detail (LOD)</label>
          <input
            type="checkbox"
            checked={performanceSettings.lodEnabled}
            onChange={(e) => updateSetting('lodEnabled', e.target.checked)}
            className="rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs">Shadows</label>
          <input
            type="checkbox"
            checked={performanceSettings.shadowsEnabled}
            onChange={(e) => updateSetting('shadowsEnabled', e.target.checked)}
            className="rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs">Anti-aliasing</label>
          <input
            type="checkbox"
            checked={performanceSettings.antialiasingEnabled}
            onChange={(e) => updateSetting('antialiasingEnabled', e.target.checked)}
            className="rounded"
          />
        </div>

        <div>
          <label className="text-xs block mb-1">Max Render Distance</label>
          <input
            type="range"
            min="10"
            max="500"
            value={performanceSettings.maxRenderDistance}
            onChange={(e) => updateSetting('maxRenderDistance', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-400">{performanceSettings.maxRenderDistance} units</div>
        </div>

        <div>
          <label className="text-xs block mb-1">Pixel Ratio</label>
          <select
            value={performanceSettings.pixelRatio}
            onChange={(e) => updateSetting('pixelRatio', parseFloat(e.target.value))}
            className="w-full bg-gray-800 text-white text-xs rounded p-1"
          >
            <option value={0.5}>0.5x (Performance)</option>
            <option value={1.0}>1.0x (Balanced)</option>
            <option value={1.5}>1.5x (Quality)</option>
            <option value={2.0}>2.0x (High Quality)</option>
          </select>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="mt-4 p-2 bg-blue-900 bg-opacity-30 rounded text-xs">
        <div className="font-semibold mb-1">💡 Performance Tips:</div>
        <ul className="space-y-1 text-gray-300">
          <li>• Use groups to organize similar objects</li>
          <li>• Hide unused layers to reduce render load</li>
          <li>• Enable frustum culling for large scenes</li>
          <li>• Lower pixel ratio on slower devices</li>
          {stats.totalObjects > 50 && (
            <li className="text-orange-400">⚠️ Consider using LOD for {stats.totalObjects}+ objects</li>
          )}
        </ul>
      </div>
    </div>
  );
}

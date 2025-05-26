// Left sidebar with organized tool panels
import React, { useState } from 'react';
import { useScene } from '../../state/sceneStore.jsx';
import { PrimitiveTools } from '../tools/PrimitiveTools.jsx';
import { AdvancedTools } from '../tools/AdvancedTools.jsx';
import { MaterialEditor } from '../ui/MaterialEditor.jsx';
import { ObjectManager } from '../ui/ObjectManager.jsx';
import { LayerManager } from '../ui/LayerManager.jsx';
import { SettingsPanel } from '../ui/SettingsPanel.jsx';
import { ExportPanel } from '../ui/ExportPanel_sidebar.jsx';

export const LeftSidebar = ({ onLoadInViewer }) => {
  const { viewMode } = useScene();
  const [activePanel, setActivePanel] = useState('primitives');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const panels = [
    { id: 'primitives', name: 'Primitives', icon: '⬛', component: PrimitiveTools },
    { id: 'advanced', name: 'Advanced', icon: '🔧', component: AdvancedTools },
    { id: 'materials', name: 'Materials', icon: '🎨', component: MaterialEditor },
    { id: 'objects', name: 'Objects', icon: '📦', component: ObjectManager },
    { id: 'layers', name: 'Layers', icon: '📚', component: LayerManager },
    { id: 'export', name: 'Export', icon: '📤', component: ExportPanel },
    { id: 'settings', name: 'Settings', icon: '⚙️', component: SettingsPanel },
  ];

  // Filter panels based on view mode
  const availablePanels = panels.filter(panel => {
    if (viewMode === '2d') {
      return ['objects', 'layers', 'export', 'settings'].includes(panel.id);
    }
    return true; // Show all panels in 3D mode
  });

  const ActiveComponent = availablePanels.find(p => p.id === activePanel)?.component;

  return (
    <div className={`bg-gray-900 border-r border-gray-700 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-80'
    }`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        {!isCollapsed && (
          <h2 className="text-white font-semibold">Tools</h2>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-gray-400 hover:text-white rounded"
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Panel Tabs */}
      <div className={`flex ${isCollapsed ? 'flex-col' : 'flex-wrap'} ${
        isCollapsed ? 'items-center' : 'border-b border-gray-700'
      }`}>
        {availablePanels.map((panel) => (
          <button
            key={panel.id}
            onClick={() => setActivePanel(panel.id)}
            className={`${
              isCollapsed 
                ? 'w-10 h-10 m-1' 
                : 'flex-1 min-w-0 px-3 py-2'
            } flex items-center justify-center text-sm transition-colors ${
              activePanel === panel.id
                ? 'bg-orange-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title={panel.name}
          >
            <span className="text-lg">{panel.icon}</span>
            {!isCollapsed && (
              <span className="ml-2 truncate">{panel.name}</span>
            )}
          </button>
        ))}
      </div>

      {/* Panel Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto">
          {ActiveComponent && (
            <div className="p-4">
              <ActiveComponent onLoadInViewer={onLoadInViewer} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

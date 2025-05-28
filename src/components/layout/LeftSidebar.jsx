// Left sidebar with organized tool panels
import React, { useState } from 'react';
import { useScene } from '../../state/sceneStore.jsx';
import { PrimitiveTools } from '../tools/PrimitiveTools.jsx';
import { AdvancedTools } from '../tools/AdvancedTools.jsx';
import { BitmonTools } from '../tools/BitmonTools.jsx';
import { IntegratedSketchTools } from '../tools/IntegratedSketchTools.jsx';
import { SnapAlignTools } from '../tools/SnapAlignTools.jsx';
import { ConstraintsPanel } from '../tools/ConstraintsPanel.jsx';
import { DimensionsPanel } from '../tools/DimensionsPanel.jsx';
import { TransformPanel } from '../tools/TransformPanel.jsx';
import { Transform3DTools } from '../tools/Transform3DTools.jsx';
import { EdgeTools } from '../tools/EdgeTools.jsx';
import { BooleanTools } from '../tools/BooleanTools.jsx';
import { MaterialEditor } from '../ui/MaterialEditor.jsx';
import { ObjectManager } from '../ui/ObjectManager.jsx';
import { LayerManager } from '../ui/LayerManager.jsx';
import { SettingsPanel } from '../ui/SettingsPanel.jsx';
import { ExportPanel } from '../ui/ExportPanel_sidebar.jsx';

export const LeftSidebar = ({ onLoadInViewer }) => {
  const { viewMode, selectedIds } = useScene();
  const [activePanel, setActivePanel] = useState(viewMode === '2d' ? 'sketch' : 'primitives');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const panels = [
    // 2D Mode Panels
    { id: 'sketch', name: 'Sketch', icon: '✏️', component: IntegratedSketchTools, viewModes: ['2d'] },
    { id: 'snap', name: 'Snap & Align', icon: '📐', component: SnapAlignTools, viewModes: ['2d'] },
    { id: 'constraints', name: 'Constraints', icon: '🔗', component: ConstraintsPanel, viewModes: ['2d'] },
    { id: 'dimensions', name: 'Dimensions', icon: '📏', component: DimensionsPanel, viewModes: ['2d'] },
    
    // 3D Mode Panels - Organized by functionality
    { id: 'primitives', name: 'Primitives', icon: '⬛', component: PrimitiveTools, viewModes: ['3d'] },
    { id: 'transform3d', name: 'Transform', icon: '🔧', component: Transform3DTools, viewModes: ['3d'] },
    { id: 'boolean', name: 'Boolean', icon: '➕', component: BooleanTools, viewModes: ['3d'] },
    { id: 'edges', name: 'Edges', icon: '🔪', component: EdgeTools, viewModes: ['3d'] },
    { id: 'advanced', name: 'Advanced', icon: '⚙️', component: AdvancedTools, viewModes: ['3d'] },
    { id: 'bitmon', name: 'Bitmon', icon: '🟧', component: BitmonTools, viewModes: ['3d'] },
    
    // Legacy transform panel (shown when objects are selected in 2D)
    { id: 'transform', name: 'Transform', icon: '🔧', component: TransformPanel, viewModes: ['2d'], 
      conditional: () => selectedIds.length > 0 && viewMode === '2d' },
    
    // Common Panels (available in both modes)
    { id: 'materials', name: 'Materials', icon: '🎨', component: MaterialEditor, viewModes: ['2d', '3d'] },
    { id: 'objects', name: 'Objects', icon: '📦', component: ObjectManager, viewModes: ['2d', '3d'] },
    { id: 'layers', name: 'Layers', icon: '📚', component: LayerManager, viewModes: ['2d', '3d'] },
    { id: 'export', name: 'Export', icon: '📤', component: ExportPanel, viewModes: ['2d', '3d'] },
    { id: 'settings', name: 'Settings', icon: '⚙️', component: SettingsPanel, viewModes: ['2d', '3d'] },
  ];

  // Filter panels based on view mode and conditions
  const availablePanels = panels.filter(panel => 
    panel.viewModes.includes(viewMode) && 
    (!panel.conditional || panel.conditional())
  );

  // Auto-switch to appropriate panel when objects are selected
  React.useEffect(() => {
    if (selectedIds.length > 0) {
      // In 3D mode, switch to transform3d panel
      if (viewMode === '3d' && availablePanels.some(p => p.id === 'transform3d')) {
        setActivePanel('transform3d');
      }
      // In 2D mode, switch to legacy transform panel
      else if (viewMode === '2d' && availablePanels.some(p => p.id === 'transform')) {
        setActivePanel('transform');
      }
    } else if (selectedIds.length === 0 && (activePanel === 'transform' || activePanel === 'transform3d')) {
      const defaultPanel = viewMode === '2d' ? 'sketch' : 'primitives';
      setActivePanel(defaultPanel);
    }
  }, [selectedIds.length, viewMode, availablePanels, activePanel]);

  // Auto-switch active panel when changing view modes
  React.useEffect(() => {
    const currentPanelValid = availablePanels.some(p => p.id === activePanel);
    if (!currentPanelValid) {
      const defaultPanel = viewMode === '2d' ? 'sketch' : 'primitives';
      setActivePanel(defaultPanel);
    }
  }, [viewMode, availablePanels, activePanel]);

  const ActiveComponent = availablePanels.find(p => p.id === activePanel)?.component;

  return (
    <div className={`bg-gray-900 border-r border-gray-700 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-80'
    }`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-850">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <h2 className="text-white font-semibold">
              {viewMode === '3d' ? '3D Tools' : '2D Tools'}
            </h2>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Panel Tabs */}
      <div className={`${isCollapsed ? 'flex flex-col items-center' : 'grid grid-cols-3 gap-1 p-2'} ${
        isCollapsed ? '' : 'border-b border-gray-700'
      }`}>
        {availablePanels.map((panel) => (
          <button
            key={panel.id}
            onClick={() => setActivePanel(panel.id)}
            className={`${
              isCollapsed 
                ? 'w-10 h-10 m-1' 
                : 'px-2 py-2 rounded text-xs'
            } flex flex-col items-center justify-center transition-colors ${
              activePanel === panel.id
                ? 'bg-orange-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title={panel.name}
          >
            <span className={isCollapsed ? 'text-lg' : 'text-sm mb-1'}>{panel.icon}</span>
            {!isCollapsed && (
              <span className="text-xs leading-tight text-center">{panel.name}</span>
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

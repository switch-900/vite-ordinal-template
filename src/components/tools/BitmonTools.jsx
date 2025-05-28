import React, { useState, useEffect } from 'react';
import { useSceneActions } from '../../state/sceneStore.jsx';
import { getMondrian } from 'bitmon';

export const BitmonTools = () => {
  const [customId, setCustomId] = useState('');
  const [showBitmon, setShowBitmon] = useState(false);
  const [bitmonOpacity, setBitmonOpacity] = useState(0.7);
  const [bitmonExtrusion, setBitmonExtrusion] = useState(0.1);
  const [bitmonScale, setBitmonScale] = useState(1.0);
  const [selectedParcelHeight, setSelectedParcelHeight] = useState(0.5);
  const [selectedParcelsCount, setSelectedParcelsCount] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [showConversionOptions, setShowConversionOptions] = useState(false);
  const [conversionOptions, setConversionOptions] = useState({
    createGroup: true,
    mergeSelectedParcels: false,
    autoOptimize: true,
    preserveColors: true
  });
  
  const { addObject, selectObjects } = useSceneActions();

  // Get current ID from custom input
  const getCurrentId = () => {
    if (customId && customId.trim()) {
      const numericId = parseInt(customId.trim());
      return !isNaN(numericId) ? numericId : null;
    }
    return null;
  };

  const currentId = getCurrentId();

  // Convert bitmon pattern to actual 3D scene objects
  const convertToSceneObjects = async () => {
    if (!currentId || !showBitmon) {
      alert('Please enter a bitmon ID and enable the pattern first');
      return;
    }

    setIsConverting(true);
    
    try {
      // Get the mondrian layout for the current bitmon
      const layout = getMondrian(currentId);
      if (!layout || !layout.slots) {
        alert('Could not generate bitmon layout');
        setIsConverting(false);
        return;
      }

      // Get current parcel extrusions from global state
      const parcelExtrusions = window.bitmonParcelExtrusions || {};
      const selectedParcels = window.bitmonSelectedParcels || new Set();
      
      const margin = 0.1; // Same margin as used in GridFloor
      const createdObjects = [];

      // Create a scene object for each parcel
      layout.slots.forEach((slot, i) => {
        const parcelId = `${currentId}-${i}`;
        const x = (slot.position.x + slot.size / 2) * bitmonScale;
        const z = (slot.position.y + slot.size / 2) * bitmonScale;
        const slotSize = (slot.size - margin) * bitmonScale;
        
        // Get individual extrusion height for this parcel
        const extrusionHeight = parcelExtrusions[parcelId] || bitmonExtrusion;
        const wasSelected = selectedParcels.has(parcelId);
        
        // Create a cube object for each parcel
        const objectId = `bitmon_${currentId}_parcel_${i}_${Date.now()}`;
        const parcelObject = {
          id: objectId,
          name: `Bitmon_${currentId}_Parcel_${i}`,
          type: 'mesh',
          geometry: 'box',
          geometryArgs: [slotSize, extrusionHeight, slotSize],
          material: {
            type: 'standard',
            color: conversionOptions.preserveColors 
              ? (wasSelected ? '#ff6600' : '#4a90e2')
              : '#808080', // Default gray if not preserving colors
            metalness: conversionOptions.autoOptimize ? 0.1 : 0.2,
            roughness: conversionOptions.autoOptimize ? 0.8 : 0.6,
            emissive: conversionOptions.preserveColors && wasSelected ? '#ff3300' : '#000000',
            emissiveIntensity: conversionOptions.preserveColors && wasSelected ? 0.1 : 0.0
          },
          position: [x, extrusionHeight / 2, z], // Position at half height to sit on ground
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          visible: true,
          locked: false,
          layerId: 'default', // Assign to default layer
          // Store bitmon metadata
          bitmonData: {
            sourceId: currentId,
            parcelIndex: i,
            originalHeight: extrusionHeight,
            wasSelected: wasSelected,
            slot: { ...slot },
            conversionOptions: { ...conversionOptions },
            convertedAt: Date.now()
          }
        };

        createdObjects.push(parcelObject);
        addObject(parcelObject);
      });

      // Select all created objects
      selectObjects(createdObjects.map(obj => obj.id));
      
      // Clear the overlay pattern and reset state after conversion
      setShowBitmon(false);
      window.bitmonResetAll && window.bitmonResetAll();
      
      // Show success message with details
      const selectedCount = Array.from(selectedParcels).length;
      const totalHeight = createdObjects.reduce((sum, obj) => sum + obj.geometryArgs[1], 0);
      
      alert(
        `Successfully converted bitmon ${currentId} to ${createdObjects.length} 3D objects!\n\n` +
        `• Total parcels: ${createdObjects.length}\n` +
        `• Previously selected: ${selectedCount}\n` +
        `• Total volume: ${totalHeight.toFixed(2)} units\n\n` +
        `Objects are now available in the scene and can be:\n` +
        `• Exported to various formats\n` +
        `• Modified with material editor\n` +
        `• Used in boolean operations\n` +
        `• Transformed and animated`
      );
      
    } catch (error) {
      console.error('Error converting bitmon to scene objects:', error);
      alert('Error converting bitmon: ' + error.message);
    }
    
    setIsConverting(false);
  };

  // Monitor selection changes
  useEffect(() => {
    const checkSelection = () => {
      if (window.bitmonSelectedParcels) {
        setSelectedParcelsCount(window.bitmonSelectedParcels.size);
      }
    };
    
    const interval = setInterval(checkSelection, 100);
    return () => clearInterval(interval);
  }, []);

  // Get selected parcels info from global state
  const getSelectedParcelsInfo = () => {
    return {
      count: selectedParcelsCount,
      parcels: window.bitmonSelectedParcels ? Array.from(window.bitmonSelectedParcels) : []
    };
  };

  const selectedInfo = getSelectedParcelsInfo();

  // Update selected parcels height
  const updateSelectedParcelsHeight = (height) => {
    setSelectedParcelHeight(height);
    if (window.bitmonUpdateSelectedHeight) {
      window.bitmonUpdateSelectedHeight(height);
    }
  };

  // Update global controls
  useEffect(() => {
    window.bitmonControls = {
      showBitmon,
      bitmonOpacity,
      bitmonExtrusion,
      bitmonScale,
      currentId,
      selectedParcelHeight
    };
  }, [showBitmon, bitmonOpacity, bitmonExtrusion, bitmonScale, currentId, selectedParcelHeight]);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-white mb-3">Bitmon Pattern Guide</h3>
        
        {/* Show Bitmon Toggle */}
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showBitmon}
              onChange={(e) => setShowBitmon(e.target.checked)}
              className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
            />
            <span className="text-sm text-gray-300">Show Bitmon Guide</span>
          </label>
        </div>

        {showBitmon && (
          <>
            {/* Custom Bitmon ID Input */}
            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2">
                Enter Bitmon Number
              </label>
              <input
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder="Enter bitmon number..."
                className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
              {currentId !== null && (
                <div className="mt-2 p-2 bg-gray-800 rounded">
                  <div className="text-xs text-gray-400">Displaying Bitmon:</div>
                  <div className="text-sm text-orange-400 font-mono">{currentId}</div>
                </div>
              )}
              {customId && currentId === null && (
                <div className="mt-1 text-xs text-red-400">
                  Please enter a valid bitmon number
                </div>
              )}
            </div>

            {/* Pattern Opacity */}
            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2">
                Pattern Opacity: {bitmonOpacity.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={bitmonOpacity}
                onChange={(e) => setBitmonOpacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-orange"
              />
            </div>

            {/* Extrusion Height - changes based on selection */}
            <div className="mb-4">
              {selectedInfo.count > 0 ? (
                <>
                  <label className="block text-xs text-gray-400 mb-2">
                    Selected Parcels Height: {selectedParcelHeight.toFixed(2)} ({selectedInfo.count} selected)
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="5.0"
                    step="0.05"
                    value={selectedParcelHeight}
                    onChange={(e) => updateSelectedParcelsHeight(parseFloat(e.target.value))}
                    className="w-full h-2 bg-orange-600 rounded-lg appearance-none cursor-pointer slider-orange"
                  />
                  <div className="mt-1 text-xs text-orange-400">
                    Controlling selected parcels
                  </div>
                </>
              ) : (
                <>
                  <label className="block text-xs text-gray-400 mb-2">
                    Base Extrusion Height: {bitmonExtrusion.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="2.0"
                    step="0.05"
                    value={bitmonExtrusion}
                    onChange={(e) => setBitmonExtrusion(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-orange"
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    Default height for new parcels
                  </div>
                </>
              )}
            </div>

            {/* Pattern Scale */}
            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2">
                Pattern Scale: {bitmonScale.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={bitmonScale}
                onChange={(e) => setBitmonScale(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-orange"
              />
            </div>

            {/* Parcel Controls */}
            {currentId !== null && (
              <div className="mb-4 p-3 bg-gray-800 rounded border border-gray-600">
                <h4 className="text-xs font-medium text-white mb-3">Parcel Controls</h4>
                
                {selectedInfo.count > 0 && (
                  <div className="mb-3 p-2 bg-orange-900/30 rounded border border-orange-600/30">
                    <div className="text-xs text-orange-300 font-medium">
                      {selectedInfo.count} parcel{selectedInfo.count > 1 ? 's' : ''} selected
                    </div>
                    <div className="text-xs text-orange-400 mt-1">
                      Use the height slider above to adjust selected parcels
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <button
                    onClick={() => window.bitmonExtrudeAll && window.bitmonExtrudeAll()}
                    className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors"
                  >
                    Extrude All Parcels
                  </button>
                  <button
                    onClick={() => window.bitmonResetAll && window.bitmonResetAll()}
                    className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                  >
                    Reset All Extrusions
                  </button>
                  {selectedInfo.count > 0 && (
                    <button
                      onClick={() => window.bitmonClearSelection && window.bitmonClearSelection()}
                      className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                  
                  {/* Convert to 3D Objects Section */}
                  <div className="border-t border-gray-600 pt-2 mt-3">
                    {/* Conversion Options Toggle */}
                    <button
                      onClick={() => setShowConversionOptions(!showConversionOptions)}
                      className="w-full px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded mb-2 transition-colors"
                    >
                      ⚙️ {showConversionOptions ? 'Hide' : 'Show'} Conversion Options
                    </button>
                    
                    {/* Conversion Options Panel */}
                    {showConversionOptions && (
                      <div className="bg-gray-800 p-2 rounded mb-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-gray-300">Preserve Colors</label>
                          <input
                            type="checkbox"
                            checked={conversionOptions.preserveColors}
                            onChange={(e) => setConversionOptions(prev => ({
                              ...prev,
                              preserveColors: e.target.checked
                            }))}
                            className="w-3 h-3"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-gray-300">Auto Optimize</label>
                          <input
                            type="checkbox"
                            checked={conversionOptions.autoOptimize}
                            onChange={(e) => setConversionOptions(prev => ({
                              ...prev,
                              autoOptimize: e.target.checked
                            }))}
                            className="w-3 h-3"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-gray-300">Create Group</label>
                          <input
                            type="checkbox"
                            checked={conversionOptions.createGroup}
                            onChange={(e) => setConversionOptions(prev => ({
                              ...prev,
                              createGroup: e.target.checked
                            }))}
                            className="w-3 h-3"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Main Conversion Button */}
                    <button
                      onClick={convertToSceneObjects}
                      disabled={!currentId || !showBitmon || isConverting}
                      className={`w-full px-3 py-2 text-white text-xs rounded font-medium transition-colors ${
                        !currentId || !showBitmon || isConverting
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {isConverting ? 'Converting...' : '🔧 Convert to 3D Objects'}
                    </button>
                    <p className="text-xs text-gray-400 mt-1 text-center">
                      Creates exportable 3D objects from the current pattern
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  <p>• Click parcels to select them</p>
                  <p>• Drag parcels up/down to change height</p>
                  <p>• Use height slider to control selected parcels</p>
                  <p>• Selected parcels are highlighted in orange</p>
                  <p>• Convert to 3D objects to make them exportable</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="text-xs text-gray-500 mt-4">
        <p>Enter a bitmon number to display its pattern overlay on the grid. Click individual parcels to select them, or drag them vertically to change their height in real-time.</p>
        <p className="mt-2 font-medium text-green-400">Click "Convert to 3D Objects" to turn the pattern into actual 3D scene objects that can be exported, modified with material editor, and used with boolean operations!</p>
      </div>
    </div>
  );
};
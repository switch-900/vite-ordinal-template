import { useState } from 'react';
import { useScene } from '../../state/sceneStore.jsx';

export function OrdinalsExporter() {
  const { objects, layers, groups } = useScene();
  const [isOpen, setIsOpen] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    format: 'minified-jsx',
    optimization: 'aggressive',
    includeTextures: false,
    includeMaterials: true,
    precision: 2,
    compressionLevel: 'high',
    removeComments: true,
    inlineStyles: true,
    treeshake: true,
    target: 'inscription',
    maxSize: 400 // KB for Bitcoin inscription
  });

  const formats = [
    { value: 'minified-jsx', label: 'Minified JSX (Optimal)', size: 'Smallest' },
    { value: 'compact-json', label: 'Compact JSON', size: 'Small' },
    { value: 'threejs-optimized', label: 'Three.js Optimized', size: 'Medium' },
    { value: 'gltf-binary', label: 'glTF Binary', size: 'Large' },
    { value: 'custom-format', label: 'Custom Ordinals Format', size: 'Variable' }
  ];

  const optimizationLevels = [
    { value: 'none', label: 'No Optimization', description: 'Export as-is' },
    { value: 'basic', label: 'Basic', description: 'Remove unused data' },
    { value: 'moderate', label: 'Moderate', description: 'Compress geometries' },
    { value: 'aggressive', label: 'Aggressive', description: 'Maximum compression' }
  ];

  const calculateEstimatedSize = () => {
    let baseSize = objects.length * 50; // Base size per object in bytes
    
    // Add material overhead
    if (exportSettings.includeMaterials) {
      baseSize += objects.length * 30;
    }
    
    // Add texture overhead
    if (exportSettings.includeTextures) {
      baseSize += objects.length * 100; // Assuming texture references
    }
    
    // Apply optimization factors
    const optimizationFactors = {
      none: 1.0,
      basic: 0.8,
      moderate: 0.6,
      aggressive: 0.4
    };
    
    baseSize *= optimizationFactors[exportSettings.optimization];
    
    // Apply format factors
    const formatFactors = {
      'minified-jsx': 0.7,
      'compact-json': 0.8,
      'threejs-optimized': 0.9,
      'gltf-binary': 1.2,
      'custom-format': 0.5
    };
    
    baseSize *= formatFactors[exportSettings.format];
    
    return Math.round(baseSize / 1024 * 100) / 100; // Convert to KB
  };

  const generateOptimizedScene = () => {
    const scene = {
      metadata: {
        version: '1.0',
        generator: '3D Builder for Bitcoin Ordinals',
        timestamp: Date.now(),
        optimization: exportSettings.optimization
      }
    };

    // Filter and optimize objects
    const optimizedObjects = objects.map(obj => {
      const optimized = {
        id: obj.id,
        type: obj.type || obj.geometry,
        p: obj.position.map(p => parseFloat(p.toFixed(exportSettings.precision))), // position
        r: obj.rotation.map(r => parseFloat(r.toFixed(exportSettings.precision))), // rotation  
        s: obj.scale.map(s => parseFloat(s.toFixed(exportSettings.precision)))      // scale
      };

      // Add geometry args with precision
      if (obj.geometryArgs) {
        optimized.g = obj.geometryArgs.map(arg => 
          typeof arg === 'number' ? parseFloat(arg.toFixed(exportSettings.precision)) : arg
        );
      }

      // Add materials if enabled
      if (exportSettings.includeMaterials && obj.material) {
        optimized.m = {
          c: obj.material.color,
          ...(obj.material.metalness !== undefined && { mt: obj.material.metalness }),
          ...(obj.material.roughness !== undefined && { r: obj.material.roughness }),
          ...(obj.material.opacity !== undefined && obj.material.opacity < 1 && { o: obj.material.opacity })
        };
      }

      // Add layer info
      if (obj.layerId && obj.layerId !== 'default') {
        optimized.l = obj.layerId;
      }

      return optimized;
    });

    scene.objects = optimizedObjects;

    // Add layers if they have custom properties
    const customLayers = layers.filter(layer => 
      layer.id !== 'default' || !layer.visible || layer.locked
    );
    
    if (customLayers.length > 0) {
      scene.layers = customLayers.map(layer => ({
        i: layer.id,
        n: layer.name,
        ...(layer.visible === false && { v: false }),
        ...(layer.locked === true && { l: true }),
        ...(layer.color !== '#3b82f6' && { c: layer.color })
      }));
    }

    return scene;
  };

  const generateJSXCode = (sceneData) => {
    const imports = [
      'import { Canvas } from "@react-three/fiber";',
      'import { CameraControls } from "@react-three/drei";'
    ].join('\n');

    const objectsJSX = sceneData.objects.map(obj => {
      const position = `[${obj.p.join(',')}]`;
      const rotation = `[${obj.r.join(',')}]`;
      const scale = `[${obj.s.join(',')}]`;
      const args = obj.g ? `args={[${obj.g.join(',')}]}` : '';
      const color = obj.m?.c ? `color="${obj.m.c}"` : '';
      
      return `    <mesh position={${position}} rotation={${rotation}} scale={${scale}}>
      <${obj.type}Geometry ${args} />
      <meshStandardMaterial ${color} />
    </mesh>`;
    }).join('\n');

    const jsx = `${imports}

export default function Scene() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10,10,10]} />
      <CameraControls makeDefault />
      ${objectsJSX}
    </Canvas>
  );
}`;

    return exportSettings.format === 'minified-jsx' ? minifyJSX(jsx) : jsx;
  };

  const minifyJSX = (jsx) => {
    return jsx
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*=\s*/g, '=')
      .trim();
  };

  const exportForOrdinals = () => {
    const sceneData = generateOptimizedScene();
    const estimatedSize = calculateEstimatedSize();
    
    let output;
    
    switch (exportSettings.format) {
      case 'minified-jsx':
        output = generateJSXCode(sceneData);
        break;
      case 'compact-json':
        output = JSON.stringify(sceneData);
        break;
      case 'custom-format':
        output = generateCustomFormat(sceneData);
        break;
      default:
        output = JSON.stringify(sceneData, null, 2);
    }

    // Create and download file
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ordinal-scene-${Date.now()}.${getFileExtension()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`Exported scene: ${output.length} bytes (${(output.length/1024).toFixed(2)} KB)`);
  };

  const generateCustomFormat = (sceneData) => {
    // Ultra-compressed custom format for Bitcoin Ordinals
    const compressed = sceneData.objects.map(obj => 
      `${obj.type[0]}${obj.p.join(',')}|${obj.r.join(',')}|${obj.s.join(',')}`
    ).join(';');
    
    return compressed;
  };

  const getFileExtension = () => {
    switch (exportSettings.format) {
      case 'minified-jsx': return 'jsx';
      case 'compact-json': return 'json';
      case 'custom-format': return 'ord';
      default: return 'txt';
    }
  };

  const estimatedSize = calculateEstimatedSize();
  const sizeStatus = estimatedSize > exportSettings.maxSize ? 'error' : 
                    estimatedSize > exportSettings.maxSize * 0.8 ? 'warning' : 'success';

  if (!isOpen) {
    return (
      <div className="absolute bottom-60 right-2 z-20">
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-lg flex items-center gap-2"
        >
          ₿ Ordinals Export
          <span className={`text-xs px-2 py-1 rounded ${
            sizeStatus === 'success' ? 'bg-green-600' : 
            sizeStatus === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
          }`}>
            {estimatedSize} KB
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-60 right-2 z-20 bg-gray-900 text-white p-4 rounded-lg shadow-xl w-80 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">₿ Ordinals Export</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Size Status */}
      <div className={`mb-4 p-3 rounded ${
        sizeStatus === 'success' ? 'bg-green-900' : 
        sizeStatus === 'warning' ? 'bg-yellow-900' : 'bg-red-900'
      }`}>
        <div className="flex justify-between items-center">
          <span className="text-sm">Estimated Size:</span>
          <span className="font-bold">{estimatedSize} KB</span>
        </div>
        <div className="text-xs mt-1">
          Target: {exportSettings.maxSize} KB for inscription
        </div>
        {sizeStatus === 'error' && (
          <div className="text-xs mt-1 text-red-300">
            ⚠️ Too large for inscription! Increase optimization.
          </div>
        )}
      </div>

      {/* Export Format */}
      <div className="mb-3">
        <label className="text-xs block mb-1">Export Format</label>
        <select
          value={exportSettings.format}
          onChange={(e) => setExportSettings(prev => ({ ...prev, format: e.target.value }))}
          className="w-full bg-gray-800 text-white text-xs rounded p-2"
        >
          {formats.map(format => (
            <option key={format.value} value={format.value}>
              {format.label} ({format.size})
            </option>
          ))}
        </select>
      </div>

      {/* Optimization Level */}
      <div className="mb-3">
        <label className="text-xs block mb-1">Optimization</label>
        <select
          value={exportSettings.optimization}
          onChange={(e) => setExportSettings(prev => ({ ...prev, optimization: e.target.value }))}
          className="w-full bg-gray-800 text-white text-xs rounded p-2"
        >
          {optimizationLevels.map(level => (
            <option key={level.value} value={level.value}>
              {level.label} - {level.description}
            </option>
          ))}
        </select>
      </div>

      {/* Export Options */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <label className="text-xs">Include Materials</label>
          <input
            type="checkbox"
            checked={exportSettings.includeMaterials}
            onChange={(e) => setExportSettings(prev => ({ ...prev, includeMaterials: e.target.checked }))}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-xs">Include Textures</label>
          <input
            type="checkbox"
            checked={exportSettings.includeTextures}
            onChange={(e) => setExportSettings(prev => ({ ...prev, includeTextures: e.target.checked }))}
          />
        </div>

        <div>
          <label className="text-xs block mb-1">Precision: {exportSettings.precision} decimals</label>
          <input
            type="range"
            min="0"
            max="4"
            value={exportSettings.precision}
            onChange={(e) => setExportSettings(prev => ({ ...prev, precision: parseInt(e.target.value) }))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-xs block mb-1">Max Size: {exportSettings.maxSize} KB</label>
          <input
            type="range"
            min="100"
            max="1000"
            step="50"
            value={exportSettings.maxSize}
            onChange={(e) => setExportSettings(prev => ({ ...prev, maxSize: parseInt(e.target.value) }))}
            className="w-full"
          />
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={exportForOrdinals}
        className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm font-semibold"
      >
        🚀 Export for Bitcoin Ordinals
      </button>

      <div className="mt-3 text-xs text-gray-400">
        💡 Optimized for Bitcoin inscription size limits
      </div>
    </div>
  );
}

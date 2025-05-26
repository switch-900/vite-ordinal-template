import { useState, useRef } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

export function TextureManager() {
  const { selectedObjectId, objects } = useScene();
  const { updateObject } = useSceneActions();
  const [isOpen, setIsOpen] = useState(false);
  const [textureUrls, setTextureUrls] = useState({
    diffuse: '',
    normal: '',
    roughness: '',
    metalness: '',
    displacement: '',
    emissive: ''
  });
  const fileInputRef = useRef();

  const selectedObject = objects.find(obj => obj.id === selectedObjectId);

  const predefinedTextures = [
    { name: 'Brick Wall', diffuse: 'https://threejs.org/examples/textures/brick_diffuse.jpg' },
    { name: 'Wood Floor', diffuse: 'https://threejs.org/examples/textures/hardwood2_diffuse.jpg' },
    { name: 'Metal', diffuse: 'https://threejs.org/examples/textures/metal_diffuse.jpg' },
    { name: 'Concrete', diffuse: 'https://threejs.org/examples/textures/concrete_diffuse.jpg' },
    { name: 'Marble', diffuse: 'https://threejs.org/examples/textures/marble_diffuse.jpg' }
  ];

  const uvMappingTypes = [
    { name: 'Default', value: 'default' },
    { name: 'Planar X', value: 'planar-x' },
    { name: 'Planar Y', value: 'planar-y' },
    { name: 'Planar Z', value: 'planar-z' },
    { name: 'Cylindrical', value: 'cylindrical' },
    { name: 'Spherical', value: 'spherical' }
  ];

  const handleFileUpload = (event, textureType) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTextureUrls(prev => ({ ...prev, [textureType]: url }));
      applyTexture(textureType, url);
    }
  };

  const applyTexture = (textureType, url) => {
    if (!selectedObjectId || !url) return;

    const textureUpdates = {
      material: {
        ...selectedObject.material,
        textures: {
          ...selectedObject.material?.textures,
          [textureType]: url
        }
      }
    };

    updateObject(selectedObjectId, textureUpdates);
  };

  const applyPredefinedTexture = (texture) => {
    if (!selectedObjectId) return;

    const textureUpdates = {
      material: {
        ...selectedObject.material,
        textures: {
          ...selectedObject.material?.textures,
          diffuse: texture.diffuse
        }
      }
    };

    updateObject(selectedObjectId, textureUpdates);
    setTextureUrls(prev => ({ ...prev, diffuse: texture.diffuse }));
  };

  const updateTextureSettings = (setting, value) => {
    if (!selectedObjectId) return;

    const textureUpdates = {
      material: {
        ...selectedObject.material,
        textureSettings: {
          ...selectedObject.material?.textureSettings,
          [setting]: value
        }
      }
    };

    updateObject(selectedObjectId, textureUpdates);
  };

  const clearTexture = (textureType) => {
    if (!selectedObjectId) return;

    const textures = { ...selectedObject.material?.textures };
    delete textures[textureType];

    const textureUpdates = {
      material: {
        ...selectedObject.material,
        textures
      }
    };

    updateObject(selectedObjectId, textureUpdates);
    setTextureUrls(prev => ({ ...prev, [textureType]: '' }));
  };

  if (!selectedObjectId) {
    return (
      <div className="absolute top-80 right-2 z-20">
        <div className="px-3 py-2 bg-gray-700 text-gray-400 rounded-lg shadow-lg text-sm">
          🎨 Select an object to edit textures
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="absolute top-80 right-2 z-20">
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 shadow-lg"
        >
          🎨 Textures
        </button>
      </div>
    );
  }

  const currentTextures = selectedObject.material?.textures || {};
  const currentSettings = selectedObject.material?.textureSettings || {};

  return (
    <div className="absolute top-80 right-2 z-20 bg-gray-900 text-white p-4 rounded-lg shadow-xl w-80 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Texture Manager</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Predefined Textures */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2">Quick Textures</h4>
        <div className="grid grid-cols-2 gap-2">
          {predefinedTextures.map(texture => (
            <button
              key={texture.name}
              onClick={() => applyPredefinedTexture(texture)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs"
            >
              {texture.name}
            </button>
          ))}
        </div>
      </div>

      {/* Texture Upload */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2">Upload Textures</h4>
        <div className="space-y-2">
          {['diffuse', 'normal', 'roughness', 'metalness', 'displacement', 'emissive'].map(type => (
            <div key={type} className="flex items-center gap-2">
              <label className="text-xs w-20 capitalize">{type}:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, type)}
                className="hidden"
                ref={type === 'diffuse' ? fileInputRef : null}
              />
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => handleFileUpload(e, type);
                  input.click();
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs flex-1"
              >
                {currentTextures[type] ? '✓ Loaded' : 'Upload'}
              </button>
              {currentTextures[type] && (
                <button
                  onClick={() => clearTexture(type)}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Texture Settings */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Texture Settings</h4>
        
        <div>
          <label className="text-xs block mb-1">UV Mapping</label>
          <select
            value={currentSettings.uvMapping || 'default'}
            onChange={(e) => updateTextureSettings('uvMapping', e.target.value)}
            className="w-full bg-gray-800 text-white text-xs rounded p-1"
          >
            {uvMappingTypes.map(type => (
              <option key={type.value} value={type.value}>{type.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs block mb-1">Repeat U: {currentSettings.repeatU || 1}</label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={currentSettings.repeatU || 1}
            onChange={(e) => updateTextureSettings('repeatU', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-xs block mb-1">Repeat V: {currentSettings.repeatV || 1}</label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={currentSettings.repeatV || 1}
            onChange={(e) => updateTextureSettings('repeatV', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-xs block mb-1">Rotation: {Math.round((currentSettings.rotation || 0) * 180 / Math.PI)}°</label>
          <input
            type="range"
            min="0"
            max={Math.PI * 2}
            step="0.1"
            value={currentSettings.rotation || 0}
            onChange={(e) => updateTextureSettings('rotation', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-xs block mb-1">Offset U: {(currentSettings.offsetU || 0).toFixed(2)}</label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={currentSettings.offsetU || 0}
            onChange={(e) => updateTextureSettings('offsetU', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-xs block mb-1">Offset V: {(currentSettings.offsetV || 0).toFixed(2)}</label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={currentSettings.offsetV || 0}
            onChange={(e) => updateTextureSettings('offsetV', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        💡 Upload PBR texture maps for realistic materials
      </div>
    </div>
  );
}

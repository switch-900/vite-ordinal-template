import { useState, useRef } from 'react';
import { useScene, useSceneActions } from '../../state/sceneStore.jsx';
import { useFrame } from '@react-three/fiber';

export function AnimationPanel() {
  const { selectedObjectId, objects } = useScene();
  const { updateObject } = useSceneActions();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(5);
  const animationRef = useRef();

  const selectedObject = objects.find(obj => obj.id === selectedObjectId);

  const animationTypes = [
    { id: 'rotation', name: 'Rotation', icon: '🔄' },
    { id: 'translation', name: 'Translation', icon: '🔀' },
    { id: 'scale', name: 'Scale', icon: '📏' },
    { id: 'color', name: 'Color', icon: '🎨' },
    { id: 'opacity', name: 'Opacity', icon: '👻' },
    { id: 'custom', name: 'Custom Path', icon: '🛤️' }
  ];

  const easingTypes = [
    { value: 'linear', label: 'Linear' },
    { value: 'easeIn', label: 'Ease In' },
    { value: 'easeOut', label: 'Ease Out' },
    { value: 'easeInOut', label: 'Ease In Out' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'elastic', label: 'Elastic' }
  ];

  const addKeyframe = (animationType) => {
    if (!selectedObjectId) return;

    const animations = selectedObject.animations || [];
    const newKeyframe = {
      id: Date.now().toString(),
      type: animationType,
      time: currentTime,
      value: getDefaultValue(animationType),
      easing: 'linear'
    };

    updateObject(selectedObjectId, {
      animations: [...animations, newKeyframe]
    });
  };

  const getDefaultValue = (type) => {
    switch (type) {
      case 'rotation': return [0, Math.PI * 2, 0]; // Full Y rotation
      case 'translation': return [0, 2, 0]; // Move up 2 units
      case 'scale': return [1.5, 1.5, 1.5]; // Scale to 150%
      case 'color': return '#ff0000'; // Red color
      case 'opacity': return 0.5; // 50% opacity
      case 'custom': return { path: [[0,0,0], [1,1,1], [2,0,0]] };
      default: return null;
    }
  };

  const updateKeyframe = (keyframeId, updates) => {
    if (!selectedObjectId) return;

    const animations = selectedObject.animations || [];
    const updatedAnimations = animations.map(anim =>
      anim.id === keyframeId ? { ...anim, ...updates } : anim
    );

    updateObject(selectedObjectId, {
      animations: updatedAnimations
    });
  };

  const removeKeyframe = (keyframeId) => {
    if (!selectedObjectId) return;

    const animations = selectedObject.animations || [];
    const updatedAnimations = animations.filter(anim => anim.id !== keyframeId);

    updateObject(selectedObjectId, {
      animations: updatedAnimations
    });
  };

  const playAnimation = () => {
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const interpolateValue = (keyframes, time, type) => {
    if (keyframes.length === 0) return null;
    if (keyframes.length === 1) return keyframes[0].value;

    // Sort keyframes by time
    const sortedKeyframes = keyframes.sort((a, b) => a.time - b.time);
    
    // Find the keyframes to interpolate between
    let startFrame = sortedKeyframes[0];
    let endFrame = sortedKeyframes[sortedKeyframes.length - 1];
    
    for (let i = 0; i < sortedKeyframes.length - 1; i++) {
      if (time >= sortedKeyframes[i].time && time <= sortedKeyframes[i + 1].time) {
        startFrame = sortedKeyframes[i];
        endFrame = sortedKeyframes[i + 1];
        break;
      }
    }

    // Calculate interpolation factor
    const factor = (time - startFrame.time) / (endFrame.time - startFrame.time);
    
    // Apply easing
    const easedFactor = applyEasing(factor, endFrame.easing);

    // Interpolate based on type
    switch (type) {
      case 'rotation':
      case 'translation':
      case 'scale':
        return startFrame.value.map((start, index) => 
          start + (endFrame.value[index] - start) * easedFactor
        );
      case 'opacity':
        return startFrame.value + (endFrame.value - startFrame.value) * easedFactor;
      case 'color':
        // Basic color interpolation (would need proper color space conversion in production)
        return easedFactor > 0.5 ? endFrame.value : startFrame.value;
      default:
        return endFrame.value;
    }
  };

  const applyEasing = (t, easing) => {
    switch (easing) {
      case 'linear': return t;
      case 'easeIn': return t * t;
      case 'easeOut': return 1 - (1 - t) * (1 - t);
      case 'easeInOut': return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
      case 'bounce': return 1 - Math.abs(Math.cos(t * Math.PI * 3)) * (1 - t);
      case 'elastic': return Math.sin(t * Math.PI * 6) * (1 - t) + t;
      default: return t;
    }
  };

  // Animation loop (this would be handled in the SceneRenderer in a real implementation)
  const AnimationEngine = () => {
    useFrame((state, delta) => {
      if (!isPlaying) return;

      const newTime = currentTime + delta;
      if (newTime >= duration) {
        setCurrentTime(duration);
        setIsPlaying(false);
        return;
      }

      setCurrentTime(newTime);

      // Apply animations to selected object
      if (selectedObject && selectedObject.animations) {
        const rotationFrames = selectedObject.animations.filter(a => a.type === 'rotation');
        const translationFrames = selectedObject.animations.filter(a => a.type === 'translation');
        const scaleFrames = selectedObject.animations.filter(a => a.type === 'scale');

        const newRotation = interpolateValue(rotationFrames, newTime, 'rotation');
        const newTranslation = interpolateValue(translationFrames, newTime, 'translation');
        const newScale = interpolateValue(scaleFrames, newTime, 'scale');

        const updates = {};
        if (newRotation) updates.rotation = newRotation;
        if (newTranslation) updates.position = newTranslation;
        if (newScale) updates.scale = newScale;

        if (Object.keys(updates).length > 0) {
          updateObject(selectedObjectId, updates);
        }
      }
    });

    return null;
  };

  if (!selectedObjectId) {
    return (
      <div className="absolute bottom-40 left-2 z-20">
        <div className="px-3 py-2 bg-gray-700 text-gray-400 rounded-lg shadow-lg text-sm">
          🎬 Select an object to animate
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="absolute bottom-40 left-2 z-20">
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 shadow-lg"
        >
          🎬 Animation
        </button>
      </div>
    );
  }

  const currentAnimations = selectedObject.animations || [];

  return (
    <>
      <AnimationEngine />
      <div className="absolute bottom-40 left-2 z-20 bg-gray-900 text-white p-4 rounded-lg shadow-xl w-80 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Animation Panel</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Timeline Controls */}
        <div className="mb-4 p-3 bg-gray-800 rounded">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Timeline</span>
            <span className="text-xs">{currentTime.toFixed(1)}s / {duration}s</span>
          </div>
          
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={currentTime}
            onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
            className="w-full mb-2"
          />

          <div className="flex gap-2 mb-2">
            <button
              onClick={playAnimation}
              disabled={isPlaying}
              className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-xs"
            >
              ▶️ Play
            </button>
            <button
              onClick={pauseAnimation}
              disabled={!isPlaying}
              className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded text-xs"
            >
              ⏸️ Pause
            </button>
            <button
              onClick={stopAnimation}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
            >
              ⏹️ Stop
            </button>
          </div>

          <div>
            <label className="text-xs block mb-1">Duration: {duration}s</label>
            <input
              type="range"
              min="1"
              max="60"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Add Keyframes */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Add Keyframe at {currentTime.toFixed(1)}s</h4>
          <div className="grid grid-cols-3 gap-2">
            {animationTypes.map(type => (
              <button
                key={type.id}
                onClick={() => addKeyframe(type.id)}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded text-xs flex flex-col items-center"
              >
                <div className="text-lg mb-1">{type.icon}</div>
                <div>{type.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Keyframes */}
        {currentAnimations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Keyframes</h4>
            {currentAnimations.map(anim => {
              const animType = animationTypes.find(t => t.id === anim.type);
              return (
                <div key={anim.id} className="p-2 bg-gray-800 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{animType?.icon}</span>
                      <span className="text-xs">{animType?.name}</span>
                      <span className="text-xs text-gray-400">@{anim.time.toFixed(1)}s</span>
                    </div>
                    <button
                      onClick={() => removeKeyframe(anim.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    <div>
                      <label className="text-xs block">Time:</label>
                      <input
                        type="number"
                        value={anim.time}
                        onChange={(e) => updateKeyframe(anim.id, { time: parseFloat(e.target.value) })}
                        className="w-full px-1 py-0.5 bg-gray-700 text-white text-xs rounded"
                        step="0.1"
                        min="0"
                        max={duration}
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs block">Easing:</label>
                      <select
                        value={anim.easing}
                        onChange={(e) => updateKeyframe(anim.id, { easing: e.target.value })}
                        className="w-full bg-gray-700 text-white text-xs rounded p-1"
                      >
                        {easingTypes.map(easing => (
                          <option key={easing.value} value={easing.value}>
                            {easing.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 text-xs text-gray-400">
          💡 Create keyframes to animate object properties over time
        </div>
      </div>
    </>
  );
}

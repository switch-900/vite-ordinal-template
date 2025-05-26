// Snap utilities for precise object placement

export const snapToGrid = (value, gridSize) => {
  return Math.round(value / gridSize) * gridSize;
};

export const snapPositionToGrid = (position, gridSize) => {
  return [
    snapToGrid(position[0], gridSize),
    snapToGrid(position[1], gridSize),
    snapToGrid(position[2], gridSize)
  ];
};

export const snapRotationTo45Degrees = (rotation) => {
  const degreesToRadians = Math.PI / 180;
  const snapAngle = 45 * degreesToRadians;
  
  return [
    Math.round(rotation[0] / snapAngle) * snapAngle,
    Math.round(rotation[1] / snapAngle) * snapAngle,
    Math.round(rotation[2] / snapAngle) * snapAngle
  ];
};

export const snapScaleToQuarters = (scale) => {
  const snapValue = 0.25;
  
  return [
    Math.max(snapValue, Math.round(scale[0] / snapValue) * snapValue),
    Math.max(snapValue, Math.round(scale[1] / snapValue) * snapValue),
    Math.max(snapValue, Math.round(scale[2] / snapValue) * snapValue)
  ];
};

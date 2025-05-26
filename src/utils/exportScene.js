// filepath: src/utils/exportScene.js
export const exportAsJSX = (objects) => {
  const meshes = objects
    .filter((obj) => obj.visible)
    .map((obj) => {
      const geometryTag = getGeometryTag(obj.geometry, obj.geometryArgs);
      const materialTag = getMaterialTag(obj.material);
      
      return `  <mesh position={[${obj.position.join(', ')}]} rotation={[${obj.rotation.join(', ')}]} scale={[${obj.scale.join(', ')}]}>
    ${geometryTag}
    ${materialTag}
  </mesh>`;
    })
    .join('\n');

  return `<>\n${meshes}\n</>`;
};

export const exportAsJSON = (objects) => {
  return JSON.stringify(
    objects
      .filter((obj) => obj.visible)
      .map((obj) => ({
        type: obj.type,
        geometry: obj.geometry,
        args: obj.geometryArgs,
        material: obj.material,
        position: obj.position,
        rotation: obj.rotation,
        scale: obj.scale,
      })),
    null,
    2
  );
};

const getGeometryTag = (geometry, args) => {
  const argsStr = args ? `args={[${args.join(', ')}]}` : '';
  return `<${geometry}Geometry ${argsStr} />`;
};

const getMaterialTag = (material) => {
  const props = Object.entries(material)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}="${value}"`;
      }
      return `${key}={${value}}`;
    })
    .join(' ');
  
  return `<mesh${material.type.charAt(0).toUpperCase() + material.type.slice(1)}Material ${props} />`;
};

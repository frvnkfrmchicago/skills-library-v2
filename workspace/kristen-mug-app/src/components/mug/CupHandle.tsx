import { useMemo } from 'react';
import * as THREE from 'three';

interface CupHandleProps {
  mugColor: string;
}

export default function CupHandle({ mugColor }: CupHandleProps) {
  // Procedurally generate the "K" handle shape with a finger loop hole
  const handleGeometry = useMemo(() => {
    const shape = new THREE.Shape();

    // 1. Trace the outer boundary of the K-handle
    shape.moveTo(0.65, 0.50);      // Top attachment point near cup wall
    shape.lineTo(1.10, 0.50);      // Top outer corner of vertical stem
    shape.lineTo(1.42, 0.50);      // Outer tip of upper diagonal arm
    shape.lineTo(1.42, 0.32);      // Inner edge of upper diagonal arm
    shape.lineTo(1.20, 0.06);      // Crook of the K
    shape.lineTo(1.42, -0.32);     // Inner edge of lower diagonal arm
    shape.lineTo(1.42, -0.50);     // Outer tip of lower diagonal arm
    shape.lineTo(1.10, -0.50);     // Bottom outer corner of vertical stem
    shape.lineTo(0.65, -0.50);     // Bottom attachment point near cup wall
    shape.closePath();

    // 2. Trace the inner finger loop hole (clockwise, to subtract from shape)
    const holePath = new THREE.Path();
    holePath.moveTo(0.78, 0.36);   // Top-left of hole cavity
    holePath.lineTo(0.96, 0.36);   // Top-right of hole cavity
    holePath.lineTo(0.96, -0.36);  // Bottom-right of hole cavity
    holePath.lineTo(0.78, -0.36);  // Bottom-left of hole cavity
    holePath.closePath();

    shape.holes.push(holePath);

    // Extrude setting with smooth bevel for premium ceramic look
    const extrudeSettings = {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelSegments: 5,
      curveSegments: 32
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center(); // Center to align properly
    return geometry;
  }, []);

  return (
    <mesh 
      geometry={handleGeometry} 
      position={[0.55, 0, 0]} // Position handle on the side of the cup
      rotation={[0, 0, 0]} 
      castShadow
      receiveShadow
    >
      <meshPhysicalMaterial
        color={mugColor}
        roughness={0.15}
        metalness={0.05}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

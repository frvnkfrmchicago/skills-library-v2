import { RigidBody } from '@react-three/rapier';
import { MeshReflectorMaterial, Text } from '@react-three/drei';

export function DinerScene() {
  return (
    <group>
      {/* Floor - Glossy Checkered/Reflective */}
      <RigidBody type="fixed" friction={0.5}>
        <mesh receiveShadow position={[0, -0.5, 0]}>
          <boxGeometry args={[40, 1, 15]} />
          <MeshReflectorMaterial 
            blur={[300, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={40}
            roughness={0.2}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#2a2a2a"
            metalness={0.5}
          />
        </mesh>
      </RigidBody>

      {/* Back Wall - Mint Green with Ambient Glow */}
      <RigidBody type="fixed">
        <mesh receiveShadow position={[0, 4, -4]}>
          <boxGeometry args={[40, 10, 1]} />
          <meshStandardMaterial color="#2d4a3e" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Neon Sign */}
      <group position={[0, 6, -3.4]}>
        <Text
          fontSize={1.5}
          color="#ff0055"
          anchorX="center"
          anchorY="middle"
        >
          MARBLE DINER
          <meshBasicMaterial toneMapped={false} color={[5, 0, 2]} />
        </Text>
        <pointLight position={[0, 0, 1]} intensity={5} color="#ff0055" distance={10} />
      </group>

      {/* Wainscoting - Darker Green */}
      <mesh receiveShadow position={[0, 1.5, -3.45]}>
        <boxGeometry args={[40, 3, 0.1]} />
        <meshStandardMaterial color="#1a2e25" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Red Cushioned Booths */}
      {[-10, -5, 0, 5, 10].map((x, i) => (
        <group key={i} position={[x, 0, -2]}>
          {/* Table */}
          <RigidBody type="fixed">
            <mesh castShadow receiveShadow position={[0, 1, 0]}>
              <boxGeometry args={[1.5, 0.1, 2]} />
              <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.1} />
            </mesh>
            <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 1]} />
              <meshStandardMaterial color="#222" metalness={0.9} />
            </mesh>
          </RigidBody>
          {/* Seats */}
          <RigidBody type="fixed">
            <mesh castShadow receiveShadow position={[-1.2, 0.5, 0]}>
              <boxGeometry args={[0.6, 1, 2]} />
              <meshStandardMaterial color="#ff1144" roughness={0.6} />
            </mesh>
            <mesh castShadow receiveShadow position={[1.2, 0.5, 0]}>
              <boxGeometry args={[0.6, 1, 2]} />
              <meshStandardMaterial color="#ff1144" roughness={0.6} />
            </mesh>
          </RigidBody>
        </group>
      ))}
    </group>
  );
}

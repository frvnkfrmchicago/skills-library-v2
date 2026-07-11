import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import FallbackGraphic from './FallbackGraphic';
import CoffeeMug from '../mug/CoffeeMug';
import SteamParticles from '../mug/SteamParticles';

interface SceneCanvasProps {
  mugColor: string;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  isPlaying: boolean;
}

export default function SceneCanvas({ mugColor, analyserRef, isPlaying }: SceneCanvasProps) {
  const [webglSupported, setWebglSupported] = useState(true);

  // Check WebGL support on mount
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        setWebglSupported(false);
      }
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    return <FallbackGraphic />;
  }

  return (
    <div className="canvas-container">
      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#ffc0cb', letterSpacing: '0.1em', fontWeight: 500 }} className="animate-pulse">
          BREWING 3D SCENE...
        </div>
      }>
        <Canvas
          shadows
          camera={{ position: [0, 1.2, 3.2], fov: 45 }}
          dpr={[1, 1.5]} // Performance optimized for mobile retina displays
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => {
            const canvasEl = gl.domElement;
            const handleContextLost = (e: Event) => {
              e.preventDefault();
              console.warn("WebGL Context Lost! Switching to 2D Fallback.");
              setWebglSupported(false);
            };
            canvasEl.addEventListener('webglcontextlost', handleContextLost);
          }}
        >
          {/* Ambient light for general visibility */}
          <ambientLight intensity={0.5} />
          
          {/* Rim light (Backlight) to make mug pop */}
          <directionalLight position={[0, 4, -5]} intensity={1.8} color="#ffffff" />
          
          {/* Dramatic side key lights (Pink & Warm gold) */}
          <pointLight position={[3, 2, 2]} intensity={2.5} color="#ff69b4" />
          <pointLight position={[-3, 1, 2]} intensity={1.5} color="#ffa500" />
          
          {/* Ground shadows for physical presence */}
          <ContactShadows 
            position={[0, -0.62, 0]} 
            opacity={0.6} 
            scale={4} 
            blur={2.2} 
            far={1.5} 
          />

          {/* Interactive Mug & Reactive Plume */}
          <CoffeeMug 
            mugColor={mugColor} 
            analyserRef={analyserRef} 
            isPlaying={isPlaying}
          />
          
          <SteamParticles 
            analyserRef={analyserRef} 
            mugColor={mugColor} 
          />

          {/* Orbit Camera Controls constrained to prevent clipping */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            enableZoom={true}
            minDistance={2.0}
            maxDistance={4.5}
            minPolarAngle={Math.PI / 4} // Don't let camera go fully below cup
            maxPolarAngle={Math.PI / 1.8}
            enablePan={false}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

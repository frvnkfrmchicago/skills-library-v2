import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface AnimatedSpriteProps {
  url: string;
  columns?: number;
  rows?: number;
  playState?: 'idle' | 'walk' | 'punch' | 'kick' | 'block' | 'hurt' | 'special' | 'knockdown' | 'victory';
  scaleX?: number;
  tint?: string;
}

const ANIMATIONS: Record<string, { frames: number[]; speed: number; loop: boolean }> = {
  idle:      { frames: [0, 1], speed: 4, loop: true },
  walk:      { frames: [2, 3], speed: 8, loop: true },
  punch:     { frames: [4, 5], speed: 14, loop: false },
  kick:      { frames: [6, 7], speed: 14, loop: false },
  block:     { frames: [8],    speed: 1,  loop: false },
  hurt:      { frames: [9],    speed: 1,  loop: false },
  special:   { frames: [10, 11], speed: 10, loop: false },
  knockdown: { frames: [14],   speed: 1,  loop: false },
  victory:   { frames: [15],   speed: 1,  loop: false }
};

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uOffset;
  uniform vec2 uRepeat;
  uniform vec3 uTint;
  varying vec2 vUv;

  void main() {
    vec2 mappedUv = (vUv * uRepeat) + uOffset;
    vec4 texColor = texture2D(uTexture, mappedUv);
    
    // Chromakey: Detect bright green background
    float g = texColor.g;
    float r = texColor.r;
    float b = texColor.b;
    
    // If green is dominant, discard
    if (g > 0.4 && r < 0.35 && b < 0.35) {
      discard;
    }
    
    // Output final color with optional tint
    gl_FragColor = vec4(texColor.rgb * uTint, texColor.a);
  }
`;

export function AnimatedSprite({ 
  url, 
  columns = 4, 
  rows = 4, 
  playState = 'idle', 
  scaleX = 1, 
  tint = '#ffffff' 
}: AnimatedSpriteProps) {
  const texture = useTexture(url);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const clonedTexture = useMemo(() => {
    const t = texture.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.needsUpdate = true;
    return t;
  }, [texture]);

  const uniforms = useMemo(() => ({
    uTexture: { value: clonedTexture },
    uOffset: { value: new THREE.Vector2(0, 0) },
    uRepeat: { value: new THREE.Vector2(1 / columns, 1 / rows) },
    uTint: { value: new THREE.Color(tint) }
  }), [clonedTexture, columns, rows, tint]);

  // Track animation playback
  const stateRef = useRef({ currentFrameIndex: 0, clock: 0, currentPlayState: playState });

  // Reset clock and frame index on playState change
  useEffect(() => {
    stateRef.current.currentFrameIndex = 0;
    stateRef.current.clock = 0;
    stateRef.current.currentPlayState = playState;
  }, [playState]);

  useFrame((_, delta) => {
    if (!materialRef.current) return;
    
    const anim = ANIMATIONS[playState] || ANIMATIONS.idle;
    const frameCount = anim.frames.length;
    
    if (frameCount > 1) {
      stateRef.current.clock += delta;
      const frameDuration = 1 / anim.speed;
      
      if (stateRef.current.clock > frameDuration) {
        stateRef.current.clock = 0;
        
        if (anim.loop) {
          stateRef.current.currentFrameIndex = (stateRef.current.currentFrameIndex + 1) % frameCount;
        } else {
          // Clamp to last frame if not looping
          stateRef.current.currentFrameIndex = Math.min(stateRef.current.currentFrameIndex + 1, frameCount - 1);
        }
      }
    } else {
      stateRef.current.currentFrameIndex = 0;
    }

    const absoluteFrame = anim.frames[stateRef.current.currentFrameIndex];
    const column = absoluteFrame % columns;
    const row = Math.floor(absoluteFrame / columns);
    
    const offsetX = column / columns;
    const offsetY = 1 - ((row + 1) / rows);
    
    materialRef.current.uniforms.uOffset.value.set(offsetX, offsetY);
  });

  return (
    <mesh scale={[scaleX * 2.2, 2.2, 1]} castShadow>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial 
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

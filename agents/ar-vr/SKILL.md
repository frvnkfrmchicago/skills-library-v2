---
name: ar-vr
description: AR/VR and spatial computing for the web. WebXR, React Three Fiber XR, A-Frame.
last_updated: 2026-03
owner: Frank
---

# AR/VR & Spatial Computing Skill

**Build augmented and virtual reality experiences for the web.**

---

## Context Questions

Before implementing XR experiences:

1. **VR or AR?** — Immersive headset vs phone camera overlay
2. **Target devices?** — Quest, Vision Pro, mobile, desktop
3. **Complexity level?** — Simple scene vs full interactive experience
4. **User interaction?** — Passive viewing, hand tracking, controllers
5. **Multi-user needed?** — Solo experience vs collaborative

---

## Dimensions

| Dimension | Spectrum |
|-----------|----------|
| **Platform** | VR headset ←→ Mobile AR |
| **Framework** | A-Frame (simple) ←→ Raw WebXR (control) |
| **Interaction** | Passive ←→ Full hand tracking |
| **Realism** | Stylized ←→ Photorealistic |
| **Users** | Single player ←→ Multi-user |

---

## Derivation Logic

| If Context Is... | Then Consider... |
|------------------|------------------|
| Quick VR prototype | A-Frame (HTML-like syntax) |
| React app + VR | @react-three/xr |
| Mobile AR | WebXR AR + hit testing |
| Multi-user VR | R3F + Supabase realtime |
| High performance | Raw Three.js + WebXR |
| Product visualization | AR with object placement |

---

## TL;DR

```bash
# For Three.js/R3F approach
npm install three @react-three/fiber @react-three/xr @react-three/drei

# For A-Frame approach
npm install aframe aframe-react
```

| Goal | Tool | Best For |
|------|------|----------|
| VR experiences | React Three Fiber + @react-three/xr | React apps |
| Quick prototypes | A-Frame | HTML-based VR |
| Custom 3D/XR | Three.js + WebXR Device API | Full control |
| AR (marker-based) | AR.js + A-Frame | Simple AR |
| AR (markerless) | WebXR AR + Three.js | Advanced AR |

---

## WebXR Status (2025)

**WebXR API** is the standard for AR/VR on the web. Key trends:

- ✅ Browser support: Chrome, Edge, Firefox Reality, Quest Browser
- ✅ No app downloads needed - runs in browser
- ✅ Cross-platform: Works on Quest, PSVR2, desktop VR, AR devices
- ✅ WebGPU support improving performance
- ✅ 5G enabling better streaming experiences

---

## Part 1: VR with React Three Fiber

### Basic VR Setup

```bash
npm install three @react-three/fiber @react-three/xr @react-three/drei
```

```tsx
// app/vr/page.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { VRButton, XR, Controllers, Hands } from '@react-three/xr';
import { Box, Sky } from '@react-three/drei';

export default function VRExperience() {
  return (
    <>
      <VRButton />
      <Canvas>
        <XR>
          <Sky />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} />
          
          {/* Controllers for hand tracking */}
          <Controllers />
          <Hands />
          
          {/* 3D content */}
          <Box position={[0, 1.6, -2]}>
            <meshStandardMaterial color="hotpink" />
          </Box>
        </XR>
      </Canvas>
    </>
  );
}
```

---

### Interactive VR Objects

```tsx
import { useXR, useController } from '@react-three/xr';
import { useState } from 'react';

function InteractiveBox() {
  const [color, setColor] = useState('hotpink');
  const { isPresenting } = useXR();

  return (
    <mesh
      position={[0, 1.6, -2]}
      onClick={() => setColor(color === 'hotpink' ? 'cyan' : 'hotpink')}
    >
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
```

---

### Teleportation

```tsx
import { useXREvent } from '@react-three/xr';
import { useRef } from 'react';

function TeleportableFloor() {
  const ref = useRef();

  useXREvent('selectstart', (e) => {
    // Handle teleport logic
    console.log('Teleport to:', e.intersection.point);
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
}
```

---

## Part 2: AR with WebXR

### AR Setup (React Three Fiber)

```tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { ARButton, XR } from '@react-three/xr';
import { Box } from '@react-three/drei';

export default function ARExperience() {
  return (
    <>
      <ARButton
        sessionInit={{
          requiredFeatures: ['hit-test'],
        }}
      />
      <Canvas>
        <XR>
          <ambientLight intensity={1} />
          
          {/* AR content appears in real world */}
          <Box position={[0, 0, -1]}>
            <meshStandardMaterial color="cyan" />
          </Box>
        </XR>
      </Canvas>
    </>
  );
}
```

---

### Hit Testing (Place Objects)

```tsx
import { useHitTest } from '@react-three/xr';
import { useState } from 'react';

function PlaceableObject() {
  const [position, setPosition] = useState([0, 0, -1]);

  useHitTest((hit) => {
    // Update position based on where user taps
    setPosition(hit.pose.transform.position);
  });

  return (
    <mesh position={position}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}
```

---

## Part 3: A-Frame (Declarative VR)

### A-Frame Setup

```bash
npm install aframe aframe-react
```

```tsx
// Simpler, HTML-like approach
import 'aframe';

export default function AFrameVR() {
  return (
    <a-scene>
      <a-sky color="#ECECEC"></a-sky>
      
      <a-box 
        position="-1 0.5 -3" 
        rotation="0 45 0" 
        color="#4CC3D9"
      ></a-box>
      
      <a-sphere 
        position="0 1.25 -5" 
        radius="1.25" 
        color="#EF2D5E"
      ></a-sphere>
      
      <a-cylinder 
        position="1 0.75 -3" 
        radius="0.5" 
        height="1.5" 
        color="#FFC65D"
      ></a-cylinder>
      
      <a-plane 
        position="0 0 -4" 
        rotation="-90 0 0" 
        width="4" 
        height="4" 
        color="#7BC8A4"
      ></a-plane>
    </a-scene>
  );
}
```

---

## Part 4: Use Cases

### VR Applications

| Use Case | Implementation | Tools |
|----------|----------------|-------|
| Virtual tours | 360° photos + hotspots | A-Frame, React XR |
| Product visualization | 3D models + interaction | R3F, Three.js |
| Training simulations | Interactive scenarios | R3F, physics |
| Virtual showrooms | E-commerce + 3D | R3F + XR |
| Games | Full VR gameplay | R3F + physics + controllers |
| Meetings/collaboration | Multi-user spaces | R3F + realtime/SKILL.md |

---

### AR Applications

| Use Case | Implementation | Tools |
|----------|----------------|-------|
| Try-before-buy | Object placement | WebXR hit-test |
| Interior design | Furniture visualization | WebXR + AR.js |
| Navigation | Overlays on real world | WebXR AR |
| Education | 3D models in classroom | A-Frame AR |
| Product manuals | Step-by-step overlays | WebXR AR |
| Marketing | Interactive ads | AR.js |

---

## Part 5: Performance Optimization

### VR Performance Tips

```typescript
// Use instancing for repeated objects
import { Instances, Instance } from '@react-three/drei';

function OptimizedScene() {
  return (
    <Instances limit={1000}>
      <boxGeometry />
      <meshStandardMaterial />
      {Array.from({ length: 1000 }, (_, i) => (
        <Instance key={i} position={[Math.random() * 10, 0,Math.random() * 10]} />
      ))}
    </Instances>
  );
}
```

```typescript
// Use LOD (Level of Detail)
import { Lod } from '@react-three/drei';

function LODModel() {
  return (
    <Lod distances={[0, 10, 20]}>
      <mesh><sphereGeometry args={[1, 32, 32]} /></mesh>
      <mesh><sphereGeometry args={[1, 16, 16]} /></mesh>
      <mesh><sphereGeometry args={[1, 8, 8]} /></mesh>
    </Lod>
  );
}
```

---

## Part 6: AI Integration

| AI Use Case | Implementation | Benefit |
|-------------|----------------|---------|
| 3D asset generation | AI models → GLB/GLTF | Fast prototyping |
| Voice commands | Speech-to-text in VR | Hands-free interaction |
| Dynamic NPCs | LLM integration | Realistic conversations |
| Procedural environments | AI generation | Unlimited content |
| Personalized experiences | User behavior AI | Adaptive difficulty |

```typescript
// Voice commands in VR
import { useEffect } from 'react';

function VoiceCommands() {
  useEffect(() => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    
    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript;
      if (command.includes('teleport')) {
        // Trigger teleport
      }
    };
    
    recognition.start();
    return () => recognition.stop();
  }, []);

  return null;
}
```

---

## Part 7: Common Patterns

### Multi-User VR

```typescript
// Use with agents/realtime/SKILL.md
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

function MultiUserVR() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const channel = supabase.channel('vr-positions');
    
    channel
      .on('broadcast', { event: 'position' }, ({ payload }) => {
        setUsers(prev => [...prev, payload]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return users.map(user => (
    <Avatar key={user.id} position={user.position} />
  ));
}
```

---

### Hand Gestures

```tsx
import { useXREvent } from '@react-three/xr';

function GestureDetection() {
  useXREvent('squeezestart', (e) => {
    console.log('Grab gesture detected');
  });

  useXREvent('selectstart', (e) => {
    console.log('Point gesture detected');
  });

  return null;
}
```

---

## Resources

- **WebXR Spec:** https://immersiveweb.dev/
- **React XR:** https://github.com/pmndrs/react-xr
- **A-Frame:** https://aframe.io/
- **Three.js VR:** https://threejs.org/docs/#manual/en/introduction/How-to-create-VR-content
- **WebXR Samples:** https://immersive-web.github.io/webxr-samples/

---

## Related Skills

- `agents/r3f/SKILL.md` - Three.js and 3D fundamentals  
- `agents/realtime/SKILL.md` - Multi-user experiences
- `agents/gsap/SKILL.md` - Animations in 3D space
- `workflows/assets/SKILL.md` - Generate 3D models with AI
- `agents/performance/SKILL.md` - Optimize VR rendering

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ── VFX Layer for Selective Bloom ──
export const VFX_LAYER = 1;

// ────────────────────────────────────
// Particle Pool — pre-allocated meshes
// ────────────────────────────────────
class ParticlePool {
  constructor(scene, maxSize = 200) {
    this.scene = scene;
    this.pool = [];
    this.active = [];

    // Pre-allocate all particle meshes
    const geo = new THREE.PlaneGeometry(1, 1);
    for (let i = 0; i < maxSize; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false;
      mesh.layers.enable(VFX_LAYER);
      scene.add(mesh);
      this.pool.push(mesh);
    }
  }

  acquire() {
    const mesh = this.pool.pop();
    if (!mesh) return null; // pool exhausted
    mesh.visible = true;
    return mesh;
  }

  release(mesh) {
    mesh.visible = false;
    mesh.position.set(0, -100, 0);
    mesh.scale.set(1, 1, 1);
    mesh.rotation.set(0, 0, 0);
    mesh.material.opacity = 1;
    this.pool.push(mesh);
  }
}

// ────────────────────────────
// Active VFX tracking
// ────────────────────────────
const activeEffects = [];
let pool = null;

export function initVFX(scene) {
  pool = new ParticlePool(scene, 250);
}

// ────────────────────────────
// Impact Sparks
// ────────────────────────────
export function spawnImpactSparks(x, y, color, direction = 1, intensity = 1) {
  if (!pool) return;
  const count = Math.floor(12 * intensity);
  for (let i = 0; i < count; i++) {
    const mesh = pool.acquire();
    if (!mesh) break;

    const size = 0.04 + Math.random() * 0.1;
    mesh.scale.set(size, size, 1);
    mesh.position.set(
      x + (Math.random() - 0.5) * 0.3,
      y + (Math.random() - 0.5) * 0.3,
      0.6
    );
    mesh.material.color.set(color);
    mesh.material.opacity = 1;

    activeEffects.push({
      type: 'spark',
      mesh,
      vx: direction * (0.05 + Math.random() * 0.2),
      vy: (Math.random() - 0.3) * 0.15,
      life: 18 + Math.floor(Math.random() * 10),
      maxLife: 28,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      gravity: 0.008,
    });
  }
}

// ────────────────────────────
// Projectile Trail
// ────────────────────────────
export function spawnTrailParticle(x, y, color) {
  if (!pool) return;
  const mesh = pool.acquire();
  if (!mesh) return;

  const size = 0.08 + Math.random() * 0.12;
  mesh.scale.set(size, size, 1);
  mesh.position.set(
    x + (Math.random() - 0.5) * 0.15,
    y + (Math.random() - 0.5) * 0.15,
    0.5
  );
  mesh.material.color.set(color);
  mesh.material.opacity = 0.7;

  activeEffects.push({
    type: 'trail',
    mesh,
    vx: (Math.random() - 0.5) * 0.02,
    vy: (Math.random() - 0.5) * 0.02,
    life: 15,
    maxLife: 15,
    rotSpeed: Math.random() * 0.1,
    gravity: 0,
  });
}

// ────────────────────────────
// Charge Aura
// ────────────────────────────
export function spawnChargeParticle(x, y, color, charHeight) {
  if (!pool) return;
  const mesh = pool.acquire();
  if (!mesh) return;

  const angle = Math.random() * Math.PI * 2;
  const radius = 0.6 + Math.random() * 0.4;
  const size = 0.04 + Math.random() * 0.06;
  mesh.scale.set(size, size, 1);
  mesh.position.set(
    x + Math.cos(angle) * radius,
    y * 4 + Math.random() * charHeight,
    0.5 + Math.sin(angle) * 0.3
  );
  mesh.material.color.set(color);
  mesh.material.opacity = 0.6;

  activeEffects.push({
    type: 'charge',
    mesh,
    vx: 0,
    vy: 0.03 + Math.random() * 0.04,
    life: 20 + Math.floor(Math.random() * 10),
    maxLife: 30,
    rotSpeed: 0,
    gravity: 0,
    shrink: true,
  });
}

// ────────────────────────────
// KO Explosion
// ────────────────────────────
export function spawnKOExplosion(x, y, color) {
  if (!pool) return;
  // Big radial burst
  for (let i = 0; i < 40; i++) {
    const mesh = pool.acquire();
    if (!mesh) break;

    const angle = (i / 40) * Math.PI * 2 + Math.random() * 0.3;
    const speed = 0.1 + Math.random() * 0.25;
    const size = 0.06 + Math.random() * 0.15;
    mesh.scale.set(size, size, 1);
    mesh.position.set(x, y, 0.6);
    mesh.material.color.set(color);
    mesh.material.opacity = 1;

    activeEffects.push({
      type: 'ko',
      mesh,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 35 + Math.floor(Math.random() * 15),
      maxLife: 50,
      rotSpeed: (Math.random() - 0.5) * 0.4,
      gravity: 0.003,
    });
  }

  // Central flash ring
  for (let i = 0; i < 8; i++) {
    const mesh = pool.acquire();
    if (!mesh) break;
    mesh.scale.set(0.3, 0.3, 1);
    mesh.position.set(x, y, 0.7);
    mesh.material.color.set(0xffffff);
    mesh.material.opacity = 1;

    const angle = (i / 8) * Math.PI * 2;
    activeEffects.push({
      type: 'ko-ring',
      mesh,
      vx: Math.cos(angle) * 0.08,
      vy: Math.sin(angle) * 0.08,
      life: 20,
      maxLife: 20,
      rotSpeed: 0,
      gravity: 0,
      grow: true,
    });
  }
}

// ────────────────────────────
// Block Sparks (lighter)
// ────────────────────────────
export function spawnBlockSparks(x, y) {
  if (!pool) return;
  for (let i = 0; i < 6; i++) {
    const mesh = pool.acquire();
    if (!mesh) break;

    mesh.scale.set(0.05, 0.05, 1);
    mesh.position.set(x, y, 0.6);
    mesh.material.color.set(0xffffff);
    mesh.material.opacity = 0.8;

    activeEffects.push({
      type: 'block',
      mesh,
      vx: (Math.random() - 0.5) * 0.15,
      vy: Math.random() * 0.1 + 0.03,
      life: 12,
      maxLife: 12,
      rotSpeed: 0,
      gravity: 0.005,
    });
  }
}

// ────────────────────────────
// Update all active VFX
// ────────────────────────────
export function updateAllVFX() {
  for (let i = activeEffects.length - 1; i >= 0; i--) {
    const e = activeEffects[i];

    // Physics
    e.mesh.position.x += e.vx;
    e.mesh.position.y += e.vy;
    e.vy -= e.gravity;
    e.mesh.rotation.z += e.rotSpeed;
    e.life--;

    // Fade out
    const lifeFrac = e.life / e.maxLife;
    e.mesh.material.opacity = lifeFrac;

    // Shrink effect (charge particles)
    if (e.shrink) {
      const s = e.mesh.scale.x * 0.96;
      e.mesh.scale.set(s, s, 1);
    }

    // Grow effect (KO ring)
    if (e.grow) {
      const s = e.mesh.scale.x * 1.08;
      e.mesh.scale.set(s, s, 1);
    }

    // Reclaim dead particles
    if (e.life <= 0) {
      pool.release(e.mesh);
      activeEffects.splice(i, 1);
    }
  }
}

// ────────────────────────────
// Post-processing (Bloom)
// ────────────────────────────
export function setupPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.6,  // strength
    0.4,  // radius
    0.85  // threshold
  );
  composer.addPass(bloomPass);

  return composer;
}

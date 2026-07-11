import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { buildDiner, updateDiner } from './diner.js';
import { buildHyperBeach, updateHyperBeach } from './hyperBeach/index.js';
import { loadSpriteSheet } from './sprites.js';
import { load3DFighter } from './fighter3d.js';
import { Fighter } from './fighter.js';
import { InputManager, applyInput } from './input.js';
import { AIController } from './ai.js';
import { HUD } from './hud.js';
import { ROSTER } from './roster.js';
import { initVFX, updateAllVFX, spawnImpactSparks, spawnBlockSparks, spawnKOExplosion, spawnChargeParticle, spawnTrailParticle, setupPostProcessing } from './vfx.js';
import { sound } from './sound.js';

let gameState = 'title';
let round = 1, timer = 99, lastTime = 0;
let currentMap = Math.random() > 0.5 ? 'beach' : 'diner';
let p1 = null, p2 = null;
let p1Pick = 0, p2Pick = 1;
const ai = new AIController(0.6);

// ── Hit Stop System ──
let hitStopFrames = 0;
function triggerHitStop(damage) {
  hitStopFrames = damage > 20 ? 8 : damage > 12 ? 5 : 3;
}

// ── Camera Shake System ──
let shakeIntensity = 0;
const shakeDecay = 0.88;
function triggerShake(intensity) {
  shakeIntensity = Math.max(shakeIntensity, intensity);
}

// ── KO Slow Motion ──
let slowMotionFactor = 1.0;
let slowMotionTimer = 0;

// ── Renderer ──
const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0C0A09);
scene.fog = new THREE.FogExp2(0x0C0A09, 0.03);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
const camPos = new THREE.Vector3(0, 3.5, 10);
const camTarget = new THREE.Vector3(0, 2, 0);
const camBasePos = new THREE.Vector3();
camera.position.copy(camPos);
camera.lookAt(camTarget);

if (currentMap === 'beach') {
  buildHyperBeach(scene, renderer, camera);
} else {
  buildDiner(scene);
}
initVFX(scene);

const composer = setupPostProcessing(renderer, scene, camera);
const input = new InputManager();
const hud = new HUD();

let soundInit = false;
function ensureSound() {
  if (!soundInit) {
    sound.init();
    soundInit = true;
  }
  sound.resume();
}

// ── Multi-Frame Animation System ──
const animState = new Map();

function getAnimFrame(fighter) {
  let state = animState.get(fighter);
  if (!state) {
    state = { anim: 'idle', frameIdx: 0, timer: 0 };
    animState.set(fighter, state);
  }
  return state;
}

function updateAnimation(fighter) {
  const config = fighter.config;
  if (!config.animations) return;

  const as = getAnimFrame(fighter);

  let desiredAnim = 'idle';
  if (fighter.state === 'punch') desiredAnim = 'punch';
  else if (fighter.state === 'kick') desiredAnim = 'kick';
  else if (fighter.state === 'block' || fighter.isCharging) desiredAnim = 'block';
  else if (fighter.state === 'hit') desiredAnim = 'hurt';
  else if (fighter.state === 'fireball') desiredAnim = 'fireball';
  else if (fighter.state === 'special') desiredAnim = 'fireball';
  else if (!fighter.isGrounded && fighter.vy > 0) desiredAnim = 'jump';
  else if (!fighter.isGrounded && fighter.vy <= 0) desiredAnim = 'jump';
  else if (Math.abs(fighter.vx) > 0.01 && fighter.state === 'idle') desiredAnim = 'walk';
  else desiredAnim = 'idle';

  // 3D Animation Hook
  if (fighter.is3D) {
    fighter.play3DAnimation(desiredAnim);
    return;
  }

  const animDef = config.animations[desiredAnim];
  if (!animDef) return;

  if (as.anim !== desiredAnim) {
    as.anim = desiredAnim;
    as.frameIdx = 0;
    as.timer = 0;
  }

  as.timer++;
  const frameDuration = 60 / (animDef.rate || 8);
  if (as.timer >= frameDuration) {
    as.timer = 0;
    as.frameIdx++;
    if (as.frameIdx >= animDef.frames.length) {
      if (animDef.loop) as.frameIdx = 0;
      else as.frameIdx = animDef.frames.length - 1;
    }
  }

  const textureIdx = animDef.frames[as.frameIdx];
  if (textureIdx < fighter.textures.length) {
    fighter.material.map = fighter.textures[textureIdx];
    fighter.material.needsUpdate = true;
  }
  fighter._animControlled = true;
}

// ── Preload ──
const spriteCache = {};
async function preloadRoster() {
  await Promise.all(ROSTER.map(async (cfg) => {
    if (cfg.is3D) {
      spriteCache[cfg.id] = await load3DFighter(cfg.model);
    } else {
      spriteCache[cfg.id] = await loadSpriteSheet(cfg.sprite, cfg.cols, cfg.rows);
    }
  }));
}

// ── Select Screen ──
let selectingPlayer = 1;

function buildSelectUI() {
  const grid = document.getElementById('char-grid');
  grid.innerHTML = '';
  selectingPlayer = 1;
  document.getElementById('select-instruction').textContent = 'Pick YOUR fighter (P1)';

  ROSTER.forEach((cfg, i) => {
    const card = document.createElement('div');
    card.className = 'char-card';
    card.dataset.index = i;
    card.tabIndex = 0; // support keyboard focus
    card.innerHTML = `
      <div class="card-preview" id="preview-${cfg.id}">
        <div class="card-loading">Loading...</div>
      </div>
      <div class="card-name">${cfg.name}</div>
      <div class="card-sub">${cfg.subtitle}</div>
      <div class="card-stats">
        <span>SPD ${cfg.stats.speed}</span>
        <span>PWR ${cfg.stats.power}</span>
        <span>DEF ${cfg.stats.defense}</span>
      </div>
      <div class="card-specials">
        ${cfg.specials.map(s => `<span class="spec-tag">${s.name} (${s.cost}SP)</span>`).join('')}
      </div>
    `;
    grid.appendChild(card);
  });
  updateSelectHighlights();
}

/** After sprites are loaded, render 2D cropped cards OR spin up 3D active selection loops */
function updateSelectPreviews() {
  ROSTER.forEach((cfg) => {
    const container = document.getElementById('preview-' + cfg.id);
    if (!container || !spriteCache[cfg.id]) return;

    // ── Ultra-Dynamic 3D Card Selection Preview Renderer ──
    if (cfg.is3D) {
      const displaySize = 160;
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = displaySize;
      previewCanvas.height = displaySize;
      previewCanvas.className = 'card-preview-canvas-3d';
      container.innerHTML = '';
      container.appendChild(previewCanvas);

      const miniRenderer = new THREE.WebGLRenderer({ canvas: previewCanvas, antialias: true, alpha: true });
      miniRenderer.setSize(displaySize, displaySize);
      miniRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const miniScene = new THREE.Scene();
      const miniCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 10);
      miniCamera.position.set(0, 1.5, 3.8);
      miniCamera.lookAt(0, 1.1, 0);

      const ambient = new THREE.AmbientLight(0xffffff, 0.8);
      miniScene.add(ambient);

      const dirLight = new THREE.DirectionalLight(cfg.color, 2.5);
      dirLight.position.set(2, 4, 3);
      miniScene.add(dirLight);

      const modelClone = SkeletonUtils.clone(spriteCache[cfg.id].model);
      miniScene.add(modelClone);

      const miniMixer = new THREE.AnimationMixer(modelClone);
      const idleClip = spriteCache[cfg.id].clips['idle'];
      if (idleClip) {
        const act = miniMixer.clipAction(idleClip);
        act.play();
      }

      // Add a subtle glowing selection ring
      const ringGeo = new THREE.RingGeometry(0.55, 0.6, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: cfg.color, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.01;
      miniScene.add(ring);

      const miniClock = new THREE.Clock();
      let active = true;

      function animateMini() {
        if (!active) return;
        const currentDOM = document.getElementById('preview-' + cfg.id);
        if (!currentDOM || !currentDOM.contains(previewCanvas)) {
          active = false;
          miniRenderer.dispose();
          ringGeo.dispose();
          ringMat.dispose();
          return;
        }
        requestAnimationFrame(animateMini);
        const dt = miniClock.getDelta();
        miniMixer.update(dt);
        modelClone.rotation.y += 0.015;
        ring.rotation.z -= 0.012;
        miniRenderer.render(miniScene, miniCamera);
      }
      animateMini();
      return;
    }

    // ── Standard 2D Cropped Preview Render ──
    const { textures } = spriteCache[cfg.id];
    const idleTexture = textures[0];
    if (!idleTexture || !idleTexture.image) return;

    const srcCanvas = idleTexture.image;
    const srcCtx = srcCanvas.getContext('2d');
    const imgData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
    const d = imgData.data;

    let minX = srcCanvas.width, maxX = 0, minY = srcCanvas.height, maxY = 0;
    for (let y = 0; y < srcCanvas.height; y++) {
      for (let x = 0; x < srcCanvas.width; x++) {
        const alpha = d[(y * srcCanvas.width + x) * 4 + 3];
        if (alpha > 30) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX <= minX || maxY <= minY) {
      minX = 0; minY = 0; maxX = srcCanvas.width - 1; maxY = srcCanvas.height - 1;
    }

    const pad = 4;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(srcCanvas.width - 1, maxX + pad);
    maxY = Math.min(srcCanvas.height - 1, maxY + pad);

    const contentW = maxX - minX + 1;
    const contentH = maxY - minY + 1;

    const displayCanvas = document.createElement('canvas');
    const displaySize = 160;
    displayCanvas.width = displaySize;
    displayCanvas.height = displaySize;
    displayCanvas.className = 'card-preview-canvas';
    const dCtx = displayCanvas.getContext('2d');

    dCtx.fillStyle = '#12121a';
    dCtx.fillRect(0, 0, displaySize, displaySize);

    const grd = dCtx.createRadialGradient(
      displaySize / 2, displaySize * 0.55, 0,
      displaySize / 2, displaySize * 0.55, displaySize * 0.4
    );
    grd.addColorStop(0, cfg.colorCSS + '35');
    grd.addColorStop(1, 'transparent');
    dCtx.fillStyle = grd;
    dCtx.fillRect(0, 0, displaySize, displaySize);

    const targetFill = displaySize * 0.8;
    const scale = Math.min(targetFill / contentW, targetFill / contentH);
    const drawW = contentW * scale;
    const drawH = contentH * scale;
    const dx = (displaySize - drawW) / 2;
    const dy = (displaySize - drawH) / 2 + 4;

    dCtx.imageSmoothingEnabled = false;
    dCtx.drawImage(
      srcCanvas,
      minX, minY, contentW, contentH,
      dx, dy, drawW, drawH
    );

    container.innerHTML = '';
    container.appendChild(displayCanvas);
  });
}

function updateSelectHighlights() {
  document.querySelectorAll('.char-card').forEach((card, i) => {
    card.classList.remove('p1-selected', 'p2-selected');
    if (i === p1Pick) card.classList.add('p1-selected');
    if (i === p2Pick) card.classList.add('p2-selected');
  });
  document.getElementById('p1-pick-name').textContent = ROSTER[p1Pick].name;
  document.getElementById('p2-pick-name').textContent = ROSTER[p2Pick].name;
  document.getElementById('p1-pick-name').style.color = ROSTER[p1Pick].colorCSS;
  document.getElementById('p2-pick-name').style.color = ROSTER[p2Pick].colorCSS;
}

// Keyboard Navigation Event Listener
document.addEventListener('keydown', (e) => {
  if (gameState !== 'select') return;
  
  const cols = 3; // layout grid width
  const total = ROSTER.length;
  let current = selectingPlayer === 1 ? p1Pick : p2Pick;

  if (e.key === 'ArrowRight') {
    current = (current + 1) % total;
    e.preventDefault();
  } else if (e.key === 'ArrowLeft') {
    current = (current - 1 + total) % total;
    e.preventDefault();
  } else if (e.key === 'ArrowDown') {
    current = (current + cols) % total;
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    current = (current - cols + total) % total;
    e.preventDefault();
  } else if (e.key === 'Enter' || e.key === ' ') {
    ensureSound();
    if (selectingPlayer === 1) {
      selectingPlayer = 2;
      document.getElementById('select-instruction').textContent = 'Now pick the CPU opponent';
    } else {
      document.getElementById('fight-btn').click();
    }
    e.preventDefault();
  }

  if (selectingPlayer === 1) {
    p1Pick = current;
  } else {
    p2Pick = current;
  }
  updateSelectHighlights();
});

// ── Spawn ──
async function spawnFighters() {
  if (p1) p1.removeFromScene(scene);
  if (p2) p2.removeFromScene(scene);
  const c1 = ROSTER[p1Pick], c2 = ROSTER[p2Pick];
  p1 = new Fighter({ config: c1, spriteData: spriteCache[c1.id], x: -3, facing: 1 });
  p2 = new Fighter({ config: c2, spriteData: spriteCache[c2.id], x: 3, facing: -1 });
  p1.addToScene(scene);
  p2.addToScene(scene);
  document.getElementById('p1-name').textContent = c1.name;
  document.getElementById('p2-name').textContent = 'CPU: ' + c2.name;
  document.getElementById('p1-name').style.color = c1.colorCSS;
  document.getElementById('p2-name').style.color = c2.colorCSS;
  animState.clear();
}

// ── Camera ──
function updateCamera() {
  if (!p1 || !p2) return;
  const mid = (p1.x + p2.x) / 2;
  const dist = Math.abs(p1.x - p2.x);
  const tz = 9 + Math.max(0, dist - 4) * 0.5;
  camPos.x += (mid * 0.35 - camPos.x) * 0.15;
  camPos.z += (tz - camPos.z) * 0.15;
  camPos.y = 3.5;
  camTarget.x += (mid * 0.25 - camTarget.x) * 0.15;
  camTarget.y = 2.0;

  camBasePos.copy(camPos);
  if (shakeIntensity > 0.01) {
    camBasePos.x += (Math.random() - 0.5) * shakeIntensity * 0.12;
    camBasePos.y += (Math.random() - 0.5) * shakeIntensity * 0.06;
    shakeIntensity *= shakeDecay;
  }

  if (slowMotionTimer > 0) {
    camBasePos.z -= 1.5 * (slowMotionTimer / 90);
  }

  camera.position.copy(camBasePos);
  camera.lookAt(camTarget);
}

// ── Round Flow ──
async function startRound() {
  gameState = 'announce';
  p1.reset(-3); p2.reset(3);
  timer = 99;
  slowMotionFactor = 1.0;
  slowMotionTimer = 0;
  hud.updateHealth(p1, p2); hud.updateSpecial(p1, p2);
  hud.updateRound(round); hud.updateTimer(timer);
  sound.playRoundStart();
  await hud.showAnnounce('ROUND ' + round, 'FIGHT!', 2000);
  gameState = 'fighting';
  lastTime = performance.now();
}

function endRound(winner) {
  gameState = 'roundEnd';
  winner.wins++;
  const loser = winner === p1 ? p2 : p1;

  sound.playKO();
  spawnKOExplosion(loser.x, loser.charHeight / 2, winner.color);
  triggerShake(20);

  slowMotionFactor = 0.2;
  slowMotionTimer = 90;

  setTimeout(() => {
    slowMotionFactor = 1.0;
    slowMotionTimer = 0;
    if (winner.wins >= 2) {
      gameState = 'victory';
      hud.showVictory(winner.name);
    } else {
      round++;
      setTimeout(() => startRound(), 1000);
    }
  }, 1500);
}

// ── Main Loop ──
function gameLoop(ts) {
  requestAnimationFrame(gameLoop);

  if (hitStopFrames > 0) {
    hitStopFrames--;
    updateCamera();
    composer.render();
    return;
  }

  if (gameState === 'fighting' && p1 && p2) {
    const rawDt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;
    const dt = rawDt * slowMotionFactor;
    timer -= dt;
    hud.updateTimer(timer);

    if (slowMotionTimer > 0) slowMotionTimer--;

    applyInput(p1, input.getP1(), p2, scene);

    const aiInput = ai.getInput(p2, p1);
    applyInput(p2, aiInput, p1, scene);

    p1.update(p2);
    p2.update(p1);

    // Update player 3D skeletal mixers using delta-time
    if (p1.is3D && p1.mixer) p1.mixer.update(dt);
    if (p2.is3D && p2.mixer) p2.mixer.update(dt);

    updateAnimation(p1);
    updateAnimation(p2);

    [p1, p2].forEach((f, idx) => {
      if (f._wasHit) {
        const other = idx === 0 ? p2 : p1;
        const hitY = f.charHeight / 2 + f.y * 4;

        if (f.isBlocking) {
          spawnBlockSparks(f.x, hitY);
          sound.playBlock();
        } else {
          spawnImpactSparks(f.x, hitY, other.color, other.facing, f._hitDamage > 15 ? 1.5 : 1);
          sound.playHit(f._hitDamage > 12 ? 'kick' : 'punch');
          triggerHitStop(f._hitDamage);
          triggerShake(f._hitDamage > 15 ? 12 : 6);
          hud.spawnDamageNumber(f._hitDamage, f.x, hitY);
        }

        f._wasHit = false;
      }

      if (f.isCharging) {
        spawnChargeParticle(f.x, f.y, f.color, f.charHeight);
        sound.playChargeLoop(f.special);
      }
    });

    f1_loop:
    for (let i = p1.projectiles.length - 1; i >= 0; i--) {
      if (p1.projectiles[i].mesh && !p1.projectiles[i].dead) {
        spawnTrailParticle(p1.projectiles[i].x, p1.projectiles[i].y, p1.color);
      }
    }
    f2_loop:
    for (let i = p2.projectiles.length - 1; i >= 0; i--) {
      if (p2.projectiles[i].mesh && !p2.projectiles[i].dead) {
        spawnTrailParticle(p2.projectiles[i].x, p2.projectiles[i].y, p2.color);
      }
    }

    hud.showCombo(p1, p1.comboCount);
    hud.updateHealth(p1, p2);
    hud.updateSpecial(p1, p2);

    if (p1.health <= 0) endRound(p2);
    else if (p2.health <= 0) endRound(p1);
    else if (timer <= 0) endRound(p1.health >= p2.health ? p1 : p2);
  }

  updateAllVFX();
  if (currentMap === 'beach') {
    updateHyperBeach(ts * 0.001);
  } else {
    updateDiner();
  }
  updateCamera();

  composer.render();
}

// ── Events ──
document.getElementById('start-btn').addEventListener('click', async () => {
  ensureSound();
  document.getElementById('title-screen').classList.add('hidden');
  document.getElementById('select-screen').classList.remove('hidden');
  gameState = 'select';
  buildSelectUI();
  await preloadRoster();
  updateSelectPreviews();
  document.getElementById('fight-btn').disabled = false;
  document.getElementById('fight-btn').querySelector('.btn-text').textContent = 'FIGHT!';
});

document.getElementById('char-grid').addEventListener('click', (e) => {
  ensureSound();
  const card = e.target.closest('.char-card');
  if (!card) return;
  const idx = parseInt(card.dataset.index);

  if (selectingPlayer === 1) {
    p1Pick = idx;
    selectingPlayer = 2;
    document.getElementById('select-instruction').textContent = 'Now pick the CPU opponent';
  } else {
    p2Pick = idx;
    selectingPlayer = 1;
    document.getElementById('select-instruction').textContent = 'Ready! Hit FIGHT!';
  }
  updateSelectHighlights();
});

document.getElementById('fight-btn').addEventListener('click', () => {
  ensureSound();
  if (!spriteCache[ROSTER[p1Pick].id]) return;
  document.getElementById('select-screen').classList.add('hidden');
  document.getElementById('map-select-screen').classList.remove('hidden');
  gameState = 'mapSelect';
});

document.querySelector('.map-grid').addEventListener('click', (e) => {
  ensureSound();
  const card = e.target.closest('.map-card');
  if (!card) return;
  document.querySelectorAll('.map-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  currentMap = card.dataset.map;
});

document.getElementById('start-fight-btn').addEventListener('click', async () => {
  ensureSound();
  document.getElementById('map-select-screen').classList.add('hidden');
  
  // Re-build environment based on choice before spawning fighters
  scene.clear();
  
  // Re-add lights and basic environment objects required
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  hemiLight.position.set(0, 200, 0);
  scene.add(hemiLight);

  if (currentMap === 'beach') {
    buildHyperBeach(scene, renderer, camera);
  } else {
    buildDiner(scene);
  }
  
  initVFX(scene);
  await spawnFighters();
  round = 1; p1.wins = 0; p2.wins = 0;
  startRound();
});

document.getElementById('rematch-btn').addEventListener('click', () => {
  hud.hideVictory();
  document.getElementById('select-screen').classList.remove('hidden');
  gameState = 'select';
  buildSelectUI();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

requestAnimationFrame(gameLoop);

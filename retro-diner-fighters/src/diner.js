import * as THREE from 'three';

// Animated elements (updated per frame)
let neonLight = null;
let dustParticles = null;
let dustPositions = null;
let windowMaterials = [];

export function buildDiner(scene) {
  // ── Floor ──
  const floorGeo = new THREE.PlaneGeometry(20, 12);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xd4c5a0, roughness: 0.6 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  // ── Checkerboard pattern tiles ──
  for (let x = -9; x <= 9; x += 2) {
    for (let z = -5; z <= 5; z += 2) {
      const tileGeo = new THREE.PlaneGeometry(1, 1);
      const tileMat = new THREE.MeshStandardMaterial({ color: 0xc4a882, roughness: 0.7 });
      const tile = new THREE.Mesh(tileGeo, tileMat);
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(x, 0.01, z);
      tile.receiveShadow = true;
      scene.add(tile);
    }
  }

  // ── Back Wall ──
  const wallGeo = new THREE.PlaneGeometry(20, 6);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x98d4a8, roughness: 0.8 }); // mint green
  const backWall = new THREE.Mesh(wallGeo, wallMat);
  backWall.position.set(0, 3, -6);
  scene.add(backWall);

  // ── Wainscoting (darker green strip) ──
  const wainGeo = new THREE.PlaneGeometry(20, 2);
  const wainMat = new THREE.MeshStandardMaterial({ color: 0x4a8a5c, roughness: 0.7 });
  const wainscoting = new THREE.Mesh(wainGeo, wainMat);
  wainscoting.position.set(0, 1, -5.99);
  scene.add(wainscoting);

  // ── Side Walls ──
  const sideWallGeo = new THREE.PlaneGeometry(12, 6);
  const leftWall = new THREE.Mesh(sideWallGeo, wallMat.clone());
  leftWall.position.set(-10, 3, 0);
  leftWall.rotation.y = Math.PI / 2;
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(sideWallGeo, wallMat.clone());
  rightWall.position.set(10, 3, 0);
  rightWall.rotation.y = -Math.PI / 2;
  scene.add(rightWall);

  // ── Ceiling ──
  const ceilGeo = new THREE.PlaneGeometry(20, 12);
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0xf0ece0, roughness: 0.9, side: THREE.DoubleSide });
  const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 6;
  scene.add(ceiling);

  // ── Booths (left side) ──
  buildBooth(scene, -7, -4.5);
  buildBooth(scene, -3, -4.5);

  // ── Booths (right side) ──
  buildBooth(scene, 3, -4.5);
  buildBooth(scene, 7, -4.5);

  // ── Counter/Bar at the back ──
  const counterGeo = new THREE.BoxGeometry(6, 1.1, 0.6);
  const counterMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.5 });
  const counter = new THREE.Mesh(counterGeo, counterMat);
  counter.position.set(0, 0.55, -5);
  counter.castShadow = true;
  scene.add(counter);

  // ── Stools at counter ──
  for (let i = -2; i <= 2; i++) {
    buildStool(scene, i * 1.2, -4);
  }

  // ── Windows (bright rectangles on back wall) ──
  for (let x = -6; x <= 6; x += 4) {
    const winGeo = new THREE.PlaneGeometry(2.5, 2.5);
    const winMat = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      emissive: 0x446688,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.6,
    });
    const win = new THREE.Mesh(winGeo, winMat);
    win.position.set(x, 3.5, -5.95);
    scene.add(win);

    // Window frame
    const frameGeo = new THREE.BoxGeometry(2.7, 2.7, 0.08);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e0 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(x, 3.5, -5.93);
    scene.add(frame);

    const innerGeo = new THREE.BoxGeometry(2.3, 2.3, 0.1);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      emissive: 0x446688,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.5,
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.position.set(x, 3.5, -5.92);
    scene.add(inner);
  }

  // ── Posters on wall ──
  buildPoster(scene, -8.5, 3.5, 0x993333, 'left');
  buildPoster(scene, -8.5, 2, 0x339933, 'left');

  // ── Ceiling lights ──
  for (let x = -6; x <= 6; x += 4) {
    const lightFixGeo = new THREE.CylinderGeometry(0.3, 0.5, 0.2, 8);
    const lightFixMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, emissive: 0xffffcc, emissiveIntensity: 0.5 });
    const lightFix = new THREE.Mesh(lightFixGeo, lightFixMat);
    lightFix.position.set(x, 5.85, -2);
    scene.add(lightFix);

    const pointLight = new THREE.PointLight(0xfff5e0, 1.5, 12);
    pointLight.position.set(x, 5.5, -2);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 512;
    pointLight.shadow.mapSize.height = 512;
    scene.add(pointLight);
  }

  // ── Ambient & directional ──
  const ambient = new THREE.AmbientLight(0xfff0d0, 0.6);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xfff5e0, 0.4);
  dirLight.position.set(5, 8, 3);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // ── Neon sign glow (animated flicker) ──
  neonLight = new THREE.PointLight(0xF97316, 1.2, 8); // Street/Raw burnt orange
  neonLight.position.set(0, 5, -5);
  scene.add(neonLight);

  // Neon sign mesh (visible glow source)
  const neonGeo = new THREE.PlaneGeometry(3, 0.6);
  const neonMat = new THREE.MeshBasicMaterial({
    color: 0xF97316,
    transparent: true,
    opacity: 0.9,
  });
  const neonSign = new THREE.Mesh(neonGeo, neonMat);
  neonSign.position.set(0, 5.2, -5.9);
  scene.add(neonSign);

  // ── Atmospheric Dust Particles ──
  const dustCount = 150;
  const dustGeo = new THREE.BufferGeometry();
  dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 16;
    dustPositions[i * 3 + 1] = Math.random() * 5.5;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xfff5e0,
    size: 0.025,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  dustParticles = new THREE.Points(dustGeo, dustMat);
  scene.add(dustParticles);

  // Save window materials for animation
  scene.traverse((child) => {
    if (child.material && child.material.emissiveIntensity > 0) {
      windowMaterials.push(child.material);
    }
  });
}

// ── Animate Diner Atmosphere (called per frame) ──
export function updateDiner() {
  const t = Date.now() * 0.001;

  // Flickering neon light — noise-based flicker
  if (neonLight) {
    const flicker = Math.sin(t * 12) * 0.1 + Math.sin(t * 27) * 0.05 + Math.sin(t * 5) * 0.15;
    neonLight.intensity = 1.2 + flicker;

    // Occasional dramatic flicker (random chance)
    if (Math.random() < 0.003) {
      neonLight.intensity = 0.2; // brief dim
    }
  }

  // Dust particles — slow drift upward
  if (dustPositions) {
    for (let i = 0; i < dustPositions.length / 3; i++) {
      dustPositions[i * 3 + 1] += 0.002; // slow rise
      dustPositions[i * 3] += Math.sin(t + i) * 0.0003; // gentle sway

      // Reset particles that go above ceiling
      if (dustPositions[i * 3 + 1] > 5.5) {
        dustPositions[i * 3 + 1] = 0.1;
        dustPositions[i * 3] = (Math.random() - 0.5) * 16;
      }
    }
    dustParticles.geometry.attributes.position.needsUpdate = true;
  }

  // Window glow pulse (city lights outside)
  windowMaterials.forEach((mat, i) => {
    if (mat.emissiveIntensity !== undefined) {
      mat.emissiveIntensity = 0.4 + Math.sin(t * 0.5 + i * 1.2) * 0.15;
    }
  });
}

function buildBooth(scene, x, z) {
  // Seat
  const seatGeo = new THREE.BoxGeometry(2.5, 0.8, 1.2);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.6 });
  const seat = new THREE.Mesh(seatGeo, seatMat);
  seat.position.set(x, 0.4, z);
  seat.castShadow = true;
  scene.add(seat);

  // Backrest
  const backGeo = new THREE.BoxGeometry(2.5, 1.5, 0.25);
  const back = new THREE.Mesh(backGeo, seatMat);
  back.position.set(x, 1.55, z - 0.5);
  back.castShadow = true;
  scene.add(back);

  // Table
  const tableTopGeo = new THREE.BoxGeometry(2.2, 0.1, 1.4);
  const tableMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.4 });
  const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
  tableTop.position.set(x, 1.05, z + 1.5);
  tableTop.castShadow = true;
  scene.add(tableTop);

  // Table leg
  const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.05);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
  const leg = new THREE.Mesh(legGeo, legMat);
  leg.position.set(x, 0.52, z + 1.5);
  scene.add(leg);
}

function buildStool(scene, x, z) {
  const seatGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 12);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.5 });
  const seat = new THREE.Mesh(seatGeo, seatMat);
  seat.position.set(x, 0.9, z);
  scene.add(seat);

  const poleGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.9, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(x, 0.45, z);
  scene.add(pole);
}

function buildPoster(scene, x, y, color, side) {
  const posterGeo = new THREE.PlaneGeometry(1.2, 1.5);
  const posterMat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
  const poster = new THREE.Mesh(posterGeo, posterMat);
  if (side === 'left') {
    poster.position.set(x + 0.5, y, 0);
    poster.rotation.y = Math.PI / 2;
    poster.position.x = -9.95;
  } else {
    poster.position.set(x, y, 0);
  }
  scene.add(poster);
}

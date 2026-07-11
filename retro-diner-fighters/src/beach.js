import * as THREE from 'three';

let oceanWave = null;
let sunMesh = null;
let birds = [];

export function buildBeach(scene) {
  // ── Sand Floor ──
  const floorGeo = new THREE.PlaneGeometry(40, 20);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xebd9a7, roughness: 0.9 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  // ── Ocean ──
  const oceanGeo = new THREE.PlaneGeometry(40, 20, 32, 32);
  const oceanMat = new THREE.MeshStandardMaterial({ color: 0x1da2d8, roughness: 0.1, metalness: 0.3 });
  oceanWave = new THREE.Mesh(oceanGeo, oceanMat);
  oceanWave.rotation.x = -Math.PI / 2;
  oceanWave.position.set(0, -0.2, -10);
  oceanWave.receiveShadow = true;
  scene.add(oceanWave);

  // ── Sky Dome / Back Wall ──
  const skyGeo = new THREE.CylinderGeometry(30, 30, 15, 32, 1, true, 0, Math.PI);
  const skyMat = new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  sky.position.set(0, 5, -5);
  scene.add(sky);

  // ── Sun ──
  const sunGeo = new THREE.SphereGeometry(2, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
  sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.position.set(-15, 8, -15);
  scene.add(sunMesh);

  // ── Sun Light ──
  const sunLight = new THREE.DirectionalLight(0xfff5b6, 1.2);
  sunLight.position.set(-15, 10, -10);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  scene.add(sunLight);

  // ── Ambient Light ──
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  // ── Palm Trees ──
  buildPalmTree(scene, -8, -3);
  buildPalmTree(scene, 9, -5);
  
  // ── Birds ──
  for(let i=0; i<3; i++) {
    const birdGeo = new THREE.ConeGeometry(0.1, 0.4, 3);
    const birdMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const bird = new THREE.Mesh(birdGeo, birdMat);
    bird.position.set((Math.random() - 0.5) * 20, 6 + Math.random() * 2, -10 + Math.random() * 5);
    bird.rotation.x = Math.PI / 2;
    bird.rotation.z = Math.PI / 2;
    scene.add(bird);
    birds.push({
      mesh: bird,
      speed: 0.02 + Math.random() * 0.02,
      offset: Math.random() * Math.PI * 2
    });
  }
}

function buildPalmTree(scene, x, z) {
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 4, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(x, 2, z);
  trunk.rotation.z = (Math.random() - 0.5) * 0.2;
  trunk.castShadow = true;
  scene.add(trunk);

  const leavesGeo = new THREE.ConeGeometry(2, 1.5, 5);
  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.8 });
  const leaves = new THREE.Mesh(leavesGeo, leavesMat);
  leaves.position.set(x, 4, z);
  leaves.castShadow = true;
  scene.add(leaves);
}

export function updateBeach() {
  const t = Date.now() * 0.001;

  if (oceanWave) {
    const positions = oceanWave.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const px = positions.getX(i);
      const py = positions.getY(i);
      // create a wave effect based on x, y, and time
      const z = Math.sin(px * 0.5 + t) * 0.2 + Math.cos(py * 0.5 + t) * 0.2;
      positions.setZ(i, z);
    }
    positions.needsUpdate = true;
  }
  
  birds.forEach(bird => {
    bird.mesh.position.x += bird.speed;
    bird.mesh.position.y += Math.sin(t * 5 + bird.offset) * 0.01;
    if (bird.mesh.position.x > 20) {
      bird.mesh.position.x = -20;
    }
  });
}

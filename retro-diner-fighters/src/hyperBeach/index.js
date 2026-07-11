import * as THREE from 'three';
import { buildTerrain } from './terrain.js';
import { buildWaterAndSky, updateWater } from './waterAndSky.js';

let sandParticles;

export function buildHyperBeach(scene, renderer, camera) {
    buildTerrain(scene);
    buildWaterAndSky(scene, renderer, camera);

    // Particle system for blowing sand / sea spray
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        // Distribute particles
        positions[i * 3] = (Math.random() - 0.5) * 500;
        positions[i * 3 + 1] = Math.random() * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 500;

        // Assign wind-driven velocity
        velocities.push({
            x: Math.random() * 0.5 + 0.1,
            y: (Math.random() - 0.5) * 0.1,
            z: (Math.random() - 0.5) * 0.1
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0xebd9a9, // Sandy color
        size: 0.8,
        transparent: true,
        opacity: 0.6,
        blending: THREE.NormalBlending
    });

    sandParticles = new THREE.Points(geometry, material);
    sandParticles.userData.velocities = velocities;
    scene.add(sandParticles);
}

export function updateHyperBeach(time) {
    if (updateWater) {
        updateWater(time);
    }

    if (sandParticles) {
        const positions = sandParticles.geometry.attributes.position.array;
        const velocities = sandParticles.userData.velocities;

        for (let i = 0; i < velocities.length; i++) {
            positions[i * 3] += velocities[i].x;
            positions[i * 3 + 1] += velocities[i].y;
            positions[i * 3 + 2] += velocities[i].z;

            // Reset particle if it drifts too far in x
            if (positions[i * 3] > 250) {
                positions[i * 3] = -250;
                positions[i * 3 + 1] = Math.random() * 10;
            }
            // Keep height constrained
            if (positions[i * 3 + 1] < 0 || positions[i * 3 + 1] > 20) {
                positions[i * 3 + 1] = Math.random() * 10;
            }
            // Wrap around z
            if (positions[i * 3 + 2] > 250) {
                positions[i * 3 + 2] = -250;
            } else if (positions[i * 3 + 2] < -250) {
                positions[i * 3 + 2] = 250;
            }
        }
        sandParticles.geometry.attributes.position.needsUpdate = true;
    }
}

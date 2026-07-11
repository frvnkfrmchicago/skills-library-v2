import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Load a 3D GLB fighter model and return sprite-compatible data.
 * Maps GLB animations to the same frame indices the sprite system uses.
 */
export function load3DFighter(url) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      const model = gltf.scene;
      const mixer = new THREE.AnimationMixer(model);

      // Build animation clip map
      const clips = {};
      gltf.animations.forEach(clip => {
        // Strip NLA prefixes if present (e.g. "idleAction" -> "idle")
        const name = clip.name.replace(/Action$/, '').replace(/\..+$/, '').toLowerCase();
        clips[name] = clip;
      });

      // Scale model to match game units (~3 units tall)
      const box = new THREE.Box3().setFromObject(model);
      const height = box.max.y - box.min.y;
      const targetHeight = 3.0;
      const scale = targetHeight / height;
      model.scale.setScalar(scale);

      // Center model at origin, feet at y=0
      box.setFromObject(model);
      model.position.y = -box.min.y;
      model.position.x = 0;
      model.position.z = 0;

      resolve({
        model,
        mixer,
        clips,
        is3D: true,
        // Create a dummy textures array so sprite code doesn't crash
        textures: [new THREE.CanvasTexture(document.createElement('canvas'))],
        frameW: 256,
        frameH: 256,
      });
    }, undefined, reject);
  });
}

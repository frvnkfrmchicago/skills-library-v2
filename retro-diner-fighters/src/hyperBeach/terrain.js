import * as THREE from 'three';

// Simple pseudo-random function
function random(x, y) {
    return Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1;
}

// Simple 2D noise based on trigonometric functions
function noise(x, y) {
    let n = 0;
    n += Math.sin(x * 0.1) * 2;
    n += Math.sin(y * 0.1) * 2;
    n += Math.sin(x * 0.5 + y * 0.5) * 0.5;
    n += random(x * 0.1, y * 0.1) * 0.2; // some high frequency grain for sand texture
    return n;
}

export function buildTerrain(scene) {
    // 1. Create the Sand Terrain
    const width = 200;
    const depth = 200;
    const segments = 200; // High detail

    const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
    
    // Displace vertices to create dunes and uneven sand
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        
        // Local y is world -Z. Positive y is deeper into the background.
        // We slope the terrain downwards towards the background to create a shoreline.
        const z = noise(x, y) - y * 0.08 + 1.0; 
        pos.setZ(i, z);
    }
    
    // Recompute normals for proper lighting on the displaced geometry
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        color: 0xc2b280, // Sand color
        roughness: 1.0,  // Sand is very rough
        metalness: 0.0,  // Sand is not metallic
        flatShading: false,
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2; // Lay flat
    terrain.receiveShadow = true;
    scene.add(terrain);

    // 2. Scatter Procedural Rocks
    const rockGeo = new THREE.DodecahedronGeometry(1, 1);
    const rockMat = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.9,
        metalness: 0.1,
    });

    const rockCount = 50;
    for (let i = 0; i < rockCount; i++) {
        // Random world coordinates within the terrain bounds
        const rx = (Math.random() - 0.5) * width * 0.9;
        const rz = (Math.random() - 0.5) * depth * 0.9;
        
        // Calculate terrain height at this position
        // The plane is rotated -90 deg on X, so world Z maps to local -Y
        const planeX = rx;
        const planeY = -rz; 
        const height = noise(planeX, planeY);
        
        const rock = new THREE.Mesh(rockGeo, rockMat);
        const scale = 0.5 + Math.random() * 2.0;
        rock.scale.set(scale, scale, scale);
        
        // Position rock slightly embedded in the sand
        rock.position.set(rx, height + scale * 0.3, rz);
        rock.rotation.set(
            Math.random() * Math.PI, 
            Math.random() * Math.PI, 
            Math.random() * Math.PI
        );
        
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
    }
}

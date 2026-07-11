import * as THREE from 'three';

interface Particle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    color: THREE.Color;
    size: number;
    alpha: number;
    decay: number;
    gravity: number;
    age: number;
    maxAge: number;
}

export class ParticleSystem {
    private scene: THREE.Scene;
    private maxParticles = 500;
    private particles: Particle[] = [];
    private activeCount = 0;

    // Three.js elements
    private geometry: THREE.BufferGeometry;
    private material: THREE.PointsMaterial;
    private points: THREE.Points;

    // Buffers
    private positionsArray: Float32Array;
    private colorsArray: Float32Array;
    private sizesArray: Float32Array;

    constructor(scene: THREE.Scene) {
        this.scene = scene;

        this.geometry = new THREE.BufferGeometry();
        this.positionsArray = new Float32Array(this.maxParticles * 3);
        this.colorsArray = new Float32Array(this.maxParticles * 3);
        this.sizesArray = new Float32Array(this.maxParticles);

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positionsArray, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colorsArray, 3));

        // Create a custom texture for round particles using a canvas
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
            grad.addColorStop(0, 'rgba(255,255,255,1)');
            grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 16, 16);
        }
        const texture = new THREE.CanvasTexture(canvas);

        this.material = new THREE.PointsMaterial({
            size: 1.0,
            vertexColors: true,
            map: texture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);

        // Preallocate particle pool
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push({
                position: new THREE.Vector3(),
                velocity: new THREE.Vector3(),
                color: new THREE.Color(),
                size: 0,
                alpha: 0,
                decay: 0,
                gravity: 0,
                age: 0,
                maxAge: 0
            });
        }
    }

    private getNextParticle(): Particle | null {
        // Return an inactive or oldest particle in the pool
        if (this.activeCount < this.maxParticles) {
            const p = this.particles[this.activeCount];
            this.activeCount++;
            return p;
        }
        // If full, recycle the oldest active particle
        return this.particles[Math.floor(Math.random() * this.maxParticles)];
    }

    public spawnDust(pos: THREE.Vector3, isShoes: boolean) {
        const count = isShoes ? 1 : 2;
        const colorHex = isShoes ? 0x888888 : 0x00f0ff; // Gray dust for shoes, neon cyan for hoverboard
        
        for (let i = 0; i < count; i++) {
            const p = this.getNextParticle();
            if (!p) continue;

            p.position.copy(pos);
            // Offset position slightly around the feet
            p.position.x += (Math.random() - 0.5) * 0.4;
            p.position.y += 0.05;
            p.position.z += (Math.random() - 0.5) * 0.4;

            // Velocity: blow backwards and outwards
            p.velocity.set(
                (Math.random() - 0.5) * 1.5,
                Math.random() * 1.0 + 0.5,
                Math.random() * 4.0 + 3.0 // Move backward relative to runner
            );

            p.color.setHex(colorHex);
            p.size = Math.random() * 0.5 + 0.3;
            p.alpha = 0.8;
            p.decay = Math.random() * 1.5 + 1.0; // Decay rate
            p.gravity = -0.8; // Float up slightly
            p.age = 0;
            p.maxAge = Math.random() * 0.5 + 0.3;
        }
    }

    public spawnCoinSparkles(pos: THREE.Vector3) {
        const count = 12;
        for (let i = 0; i < count; i++) {
            const p = this.getNextParticle();
            if (!p) continue;

            p.position.copy(pos);
            // Golden sparks explosion
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const speed = Math.random() * 4 + 2;

            p.velocity.set(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.sin(phi) * Math.sin(theta) * speed + 1, // slight upward boost
                Math.cos(phi) * speed
            );

            p.color.setHex(0xffd700); // Golden yellow
            p.size = Math.random() * 0.7 + 0.4;
            p.alpha = 1.0;
            p.decay = Math.random() * 1.0 + 1.0;
            p.gravity = 4.0; // Fall down over time
            p.age = 0;
            p.maxAge = Math.random() * 0.6 + 0.4;
        }
    }

    public spawnCrashExplosion(pos: THREE.Vector3) {
        const count = 50;
        for (let i = 0; i < count; i++) {
            const p = this.getNextParticle();
            if (!p) continue;

            p.position.copy(pos);
            p.position.y += 0.5;

            // Violently explode in all directions
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const speed = Math.random() * 12 + 4;

            p.velocity.set(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.sin(phi) * Math.sin(theta) * speed + 3, // strong upward blast
                Math.cos(phi) * speed
            );

            // Alternate colors between neon pink and neon red
            p.color.setHex(Math.random() > 0.5 ? 0xff007f : 0xff3131);
            p.size = Math.random() * 1.0 + 0.5;
            p.alpha = 1.0;
            p.decay = Math.random() * 0.8 + 0.6;
            p.gravity = 6.0; // strong gravity fall
            p.age = 0;
            p.maxAge = Math.random() * 1.2 + 0.6;
        }
    }

    public update(dt: number) {
        // Clamp delta time to avoid huge leaps
        const delta = Math.min(dt, 0.1);
        let activeIdx = 0;

        for (let i = 0; i < this.activeCount; i++) {
            const p = this.particles[i];
            
            p.age += delta;

            if (p.age >= p.maxAge) {
                // Particle died. We swap it with the last active particle
                this.activeCount--;
                if (this.activeCount > 0 && i < this.activeCount) {
                    const lastActive = this.particles[this.activeCount];
                    // Swap contents
                    this.particles[i] = lastActive;
                    this.particles[this.activeCount] = p;
                    i--; // Re-evaluate this index
                }
                continue;
            }

            // Update physics
            p.velocity.y -= p.gravity * delta;
            p.position.addScaledVector(p.velocity, delta);
            p.alpha = Math.max(0, 1 - (p.age / p.maxAge));

            // Write to buffer arrays at active index
            const offset = activeIdx * 3;
            this.positionsArray[offset] = p.position.x;
            this.positionsArray[offset + 1] = p.position.y;
            this.positionsArray[offset + 2] = p.position.z;

            this.colorsArray[offset] = p.color.r * p.alpha;
            this.colorsArray[offset + 1] = p.color.g * p.alpha;
            this.colorsArray[offset + 2] = p.color.b * p.alpha;

            this.sizesArray[activeIdx] = p.size;
            
            activeIdx++;
        }

        // Notify Three.js that the buffers changed
        const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute;
        posAttr.needsUpdate = true;

        const colorAttr = this.geometry.getAttribute('color') as THREE.BufferAttribute;
        colorAttr.needsUpdate = true;

        // Set draw range to only render active particles
        this.geometry.setDrawRange(0, this.activeCount);
    }

    public clear() {
        this.activeCount = 0;
        this.geometry.setDrawRange(0, 0);
    }
}

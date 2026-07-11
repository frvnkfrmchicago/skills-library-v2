import * as THREE from 'three';
import { ParticleSystem } from './Particles';

export class Player {
    public mesh!: THREE.Group;
    public position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    
    // Physics variables
    public currentLane = 0; // -1 = Left, 0 = Middle, 1 = Right
    private laneWidth = 3.0;
    
    // Jump & Slide state
    public isJumping = false;
    public isSliding = false;
    private vy = 0.0;
    private gravity = 38.0;
    private jumpVelocity = 14.5;
    
    private slideTimer = 0.0;
    private slideDuration = 0.65;
    
    // Customization Mode
    private gearType: 'board' | 'shoes' = 'board';

    // Model components for animation
    private torso!: THREE.Mesh;
    private leftLeg!: THREE.Mesh;
    private rightLeg!: THREE.Mesh;
    private leftArm!: THREE.Mesh;
    private rightArm!: THREE.Mesh;
    private boardMesh!: THREE.Mesh;
    private neonGlowRing!: THREE.Mesh;

    // Bounding box for collisions
    public boundingBox: THREE.Box3 = new THREE.Box3();
    private bboxHelperMesh!: THREE.BoxHelper; // For debug rendering if needed, hidden by default
    
    private dustSpawnTimer = 0.0;

    constructor(scene: THREE.Scene, gearType: 'board' | 'shoes') {
        this.gearType = gearType;
        this.buildCharacterMesh(scene);
        this.reset();
    }

    private buildCharacterMesh(scene: THREE.Scene) {
        this.mesh = new THREE.Group();

        // 1. Torso (Metallic Cyber Suit)
        const torsoGeom = new THREE.BoxGeometry(0.7, 0.8, 0.4);
        const torsoMat = new THREE.MeshStandardMaterial({
            color: 0x111122,
            metalness: 0.8,
            roughness: 0.2
        });
        this.torso = new THREE.Mesh(torsoGeom, torsoMat);
        this.torso.position.y = 0.9;
        this.torso.castShadow = true;
        this.mesh.add(this.torso);

        // 2. Head (Neon Helmet)
        const headGeom = new THREE.SphereGeometry(0.3, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({
            color: 0x050510,
            metalness: 0.9,
            roughness: 0.1
        });
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = 0.55;
        this.torso.add(head);

        // Neon Visor
        const visorGeom = new THREE.BoxGeometry(0.45, 0.15, 0.3);
        const visorMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const visor = new THREE.Mesh(visorGeom, visorMat);
        visor.position.set(0, 0.05, 0.18);
        head.add(visor);

        // 3. Limbs (Low-poly structures)
        const legGeom = new THREE.BoxGeometry(0.2, 0.5, 0.2);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x1b1b3a, metalness: 0.5 });
        
        this.leftLeg = new THREE.Mesh(legGeom, legMat);
        this.leftLeg.position.set(-0.22, -0.65, 0);
        this.leftLeg.castShadow = true;
        this.torso.add(this.leftLeg);

        this.rightLeg = new THREE.Mesh(legGeom, legMat);
        this.rightLeg.position.set(0.22, -0.65, 0);
        this.rightLeg.castShadow = true;
        this.torso.add(this.rightLeg);

        const armGeom = new THREE.BoxGeometry(0.18, 0.55, 0.18);
        const armMat = new THREE.MeshStandardMaterial({ color: 0xff007f, metalness: 0.6 }); // Neon pink sleeves

        this.leftArm = new THREE.Mesh(armGeom, armMat);
        this.leftArm.position.set(-0.48, 0.1, 0);
        this.leftArm.castShadow = true;
        this.torso.add(this.leftArm);

        this.rightArm = new THREE.Mesh(armGeom, armMat);
        this.rightArm.position.set(0.48, 0.1, 0);
        this.rightArm.castShadow = true;
        this.torso.add(this.rightArm);

        // 4. Hoverboard Gear
        if (this.gearType === 'board') {
            const boardGeom = new THREE.BoxGeometry(0.8, 0.08, 1.8);
            const boardMat = new THREE.MeshStandardMaterial({
                color: 0x0a0a14,
                metalness: 0.9,
                roughness: 0.1
            });
            this.boardMesh = new THREE.Mesh(boardGeom, boardMat);
            this.boardMesh.position.y = -1.0;
            this.boardMesh.castShadow = true;
            this.mesh.add(this.boardMesh);

            // Glowing under-ring
            const ringGeom = new THREE.RingGeometry(0.2, 0.35, 16);
            const ringMat = new THREE.MeshBasicMaterial({
                color: 0x00f0ff,
                side: THREE.DoubleSide
            });
            this.neonGlowRing = new THREE.Mesh(ringGeom, ringMat);
            this.neonGlowRing.rotation.x = Math.PI / 2;
            this.neonGlowRing.position.y = -1.05;
            this.mesh.add(this.neonGlowRing);
        }

        // Add whole group to scene
        scene.add(this.mesh);
    }

    public reset() {
        this.position.set(0, 0, 0);
        this.mesh.position.copy(this.position);
        this.mesh.scale.set(1, 1, 1);
        this.currentLane = 0;
        this.vy = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.slideTimer = 0;
        
        // Reset limbs
        this.leftLeg.rotation.set(0, 0, 0);
        this.rightLeg.rotation.set(0, 0, 0);
        this.leftArm.rotation.set(0, 0, 0);
        this.rightArm.rotation.set(0, 0, 0);
        
        if (this.boardMesh) {
            this.boardMesh.rotation.set(0, 0, 0);
        }

        this.updateBoundingBox();
    }

    public jump() {
        if (this.isJumping) return false;
        this.isJumping = true;
        this.vy = this.jumpVelocity;
        
        // Stop slide if sliding
        if (this.isSliding) {
            this.stopSlide();
        }
        return true;
    }

    public slide() {
        if (this.isSliding) return false;
        
        // Instant gravity down-slam if jumping
        if (this.isJumping) {
            this.vy = -18.0; // Slam down quickly
        }
        
        this.isSliding = true;
        this.slideTimer = this.slideDuration;
        
        // Shrink height scale
        this.mesh.scale.y = 0.45;
        this.torso.position.y = 0.55; // Lower center of torso
        return true;
    }

    private stopSlide() {
        this.isSliding = false;
        this.slideTimer = 0;
        this.mesh.scale.y = 1.0;
        this.torso.position.y = 0.9;
    }

    public switchLaneLeft() {
        if (this.currentLane > -1) {
            this.currentLane--;
            return true;
        }
        return false;
    }

    public switchLaneRight() {
        if (this.currentLane < 1) {
            this.currentLane++;
            return true;
        }
        return false;
    }

    public update(dt: number, time: number, particles: ParticleSystem) {
        // 1. Move towards target lane (Lerping X coordinate)
        const targetX = this.currentLane * this.laneWidth;
        this.position.x += (targetX - this.position.x) * 14 * dt;

        // 2. Vertical Jump physics
        if (this.isJumping) {
            this.vy -= this.gravity * dt;
            this.position.y += this.vy * dt;

            // Check ground collision
            if (this.position.y <= 0) {
                this.position.y = 0;
                this.vy = 0;
                this.isJumping = false;
            }
        }

        // 3. Slide Timer countdown
        if (this.isSliding) {
            this.slideTimer -= dt;
            if (this.slideTimer <= 0) {
                this.stopSlide();
            }
        }

        // 4. Update 3D mesh position
        this.mesh.position.copy(this.position);

        // Hoverboard tilt and floating animation
        if (this.gearType === 'board') {
            const hoverHeight = Math.sin(time * 8.0) * 0.04 + 0.15;
            this.mesh.position.y += hoverHeight; // Add hover offset on top of physics Y

            // Board banking tilt
            const targetRoll = (targetX - this.position.x) * -0.15;
            this.boardMesh.rotation.z += (targetRoll - this.boardMesh.rotation.z) * 10 * dt;
            this.boardMesh.rotation.x = this.isJumping ? -0.15 : 0;
        }

        // 5. Limb animations
        this.animateLimbs(time, dt);

        // 6. Spawn running dust particles at feet
        this.dustSpawnTimer += dt;
        if (this.dustSpawnTimer > 0.05 && this.position.y < 0.1) {
            const particlePos = this.position.clone();
            particlePos.x += (Math.random() - 0.5) * 0.3;
            // Hoverboard emits sparks from its glow ring
            if (this.gearType === 'board') {
                particlePos.y += 0.05;
            } else {
                particlePos.y += 0.01;
            }
            particles.spawnDust(particlePos, this.gearType === 'shoes');
            this.dustSpawnTimer = 0;
        }

        // 7. Update Bounding Box for Collisions
        this.updateBoundingBox();
    }

    private animateLimbs(time: number, dt: number) {
        if (this.gearType === 'shoes') {
            // Running swing animation
            // Speed up swing if speed increases
            const swingSpeed = 16.0;
            const angle = Math.sin(time * swingSpeed) * 0.75;
            
            if (!this.isJumping && !this.isSliding) {
                // Alternating legs and arms
                this.leftLeg.rotation.x = angle;
                this.rightLeg.rotation.x = -angle;
                
                this.leftArm.rotation.x = -angle * 0.8;
                this.leftArm.rotation.z = -0.1;
                
                this.rightArm.rotation.x = angle * 0.8;
                this.rightArm.rotation.z = 0.1;
                
                this.torso.rotation.z = Math.sin(time * swingSpeed) * 0.05;
            } else if (this.isJumping) {
                // Jump pose (draw knees up, extend arms)
                this.leftLeg.rotation.x = -0.8;
                this.rightLeg.rotation.x = -0.8;
                this.leftArm.rotation.x = 0.6;
                this.rightArm.rotation.x = 0.6;
            } else if (this.isSliding) {
                // Slide tuck pose
                this.leftLeg.rotation.x = -1.2;
                this.rightLeg.rotation.x = -1.2;
                this.leftArm.rotation.x = -0.5;
                this.rightArm.rotation.x = -0.5;
            }
        } else {
            // Hoverboard boarding stance
            const pulse = Math.sin(time * 4.0) * 0.05;
            
            // Turn shoulders/torso sideways slightly
            this.torso.rotation.y = 0.45;
            
            if (!this.isJumping && !this.isSliding) {
                // Feet placed on board
                this.leftLeg.rotation.set(0.1, 0, 0);
                this.rightLeg.rotation.set(-0.1, 0, 0);
                
                // Arms floating out for balance
                this.leftArm.rotation.z = -0.4 + pulse;
                this.leftArm.rotation.x = 0.2;
                
                this.rightArm.rotation.z = 0.4 - pulse;
                this.rightArm.rotation.x = -0.2;
            } else if (this.isJumping) {
                // Jump balance pose
                this.leftLeg.rotation.x = -0.4;
                this.rightLeg.rotation.x = -0.4;
                this.leftArm.rotation.z = -1.2;
                this.rightArm.rotation.z = 1.2;
            }
        }
    }

    private updateBoundingBox() {
        // Player height changes when sliding
        const height = this.isSliding ? 0.65 : 1.7;
        const width = 0.85;
        const depth = 0.85;

        // Bounding box sits around player's current position
        this.boundingBox.setFromCenterAndSize(
            new THREE.Vector3(this.position.x, this.position.y + height / 2, this.position.z),
            new THREE.Vector3(width, height, depth)
        );
    }

    public destroy(scene: THREE.Scene) {
        scene.remove(this.mesh);
        this.mesh.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                if (Array.isArray(object.material)) {
                    object.material.forEach((m) => m.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
}

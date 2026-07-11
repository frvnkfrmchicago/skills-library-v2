import * as THREE from 'three';

export interface Obstacle {
    mesh: THREE.Group;
    boundingBox: THREE.Box3;
    isCollected: boolean;
    isHit: boolean;
    lane: number; // -1, 0, 1
    type: string;
    update(dt: number, speed: number, time: number): void;
    destroy(scene: THREE.Scene): void;
}

// ----------------------------------------------------
// 1. NEON COIN OBSTACLE
// ----------------------------------------------------
export class CoinObstacle implements Obstacle {
    public mesh: THREE.Group = new THREE.Group();
    public boundingBox: THREE.Box3 = new THREE.Box3();
    public isCollected = false;
    public isHit = false;
    public lane: number;
    public type = 'coin';

    private baseHeight: number;
    private cylinderMesh: THREE.Mesh;

    constructor(scene: THREE.Scene, lane: number, zPos: number, height = 0.8) {
        this.lane = lane;
        this.baseHeight = height;

        // Coin Geometry (Golden spinning disc)
        const geom = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16);
        const mat = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0xffb700,
            emissiveIntensity: 0.5
        });
        
        this.cylinderMesh = new THREE.Mesh(geom, mat);
        this.cylinderMesh.rotation.x = Math.PI / 2; // Face forward
        this.cylinderMesh.castShadow = true;
        
        this.mesh.add(this.cylinderMesh);
        this.mesh.position.set(lane * 3.0, height, zPos);
        
        scene.add(this.mesh);
        this.updateBoundingBox();
    }

    public update(dt: number, speed: number, time: number) {
        // Move backwards at game speed
        this.mesh.position.z -= speed * dt;

        // Spin
        this.mesh.rotation.y += dt * 3.5;

        // Floating hover animation
        this.cylinderMesh.position.y = Math.sin(time * 6.0 + this.mesh.position.z * 0.1) * 0.12;

        this.updateBoundingBox();
    }

    private updateBoundingBox() {
        this.boundingBox.setFromCenterAndSize(
            this.mesh.position,
            new THREE.Vector3(0.7, 0.7, 0.7)
        );
    }

    public destroy(scene: THREE.Scene) {
        scene.remove(this.mesh);
        this.cylinderMesh.geometry.dispose();
        (this.cylinderMesh.material as THREE.Material).dispose();
    }
}

// ----------------------------------------------------
// 2. BARRICADE / HURDLE OBSTACLE
// ----------------------------------------------------
export class BarricadeObstacle implements Obstacle {
    public mesh: THREE.Group = new THREE.Group();
    public boundingBox: THREE.Box3 = new THREE.Box3();
    public isCollected = false;
    public isHit = false;
    public lane: number;
    public type = 'barricade';

    private isHigh: boolean; // True: slide under, False: jump over

    constructor(scene: THREE.Scene, lane: number, zPos: number, isHigh = false) {
        this.lane = lane;
        this.isHigh = isHigh;

        const mainColor = isHigh ? 0xff007f : 0x00f0ff; // Neon pink for high, Cyan for low
        
        // Hazard stripe material
        const barrierMat = new THREE.MeshStandardMaterial({
            color: mainColor,
            metalness: 0.5,
            roughness: 0.3,
            emissive: mainColor,
            emissiveIntensity: 0.3
        });

        const legMat = new THREE.MeshStandardMaterial({ color: 0x11111a, metalness: 0.8 });

        if (isHigh) {
            // High arch barricade - player must duck underneath
            // Top crossbar
            const topGeom = new THREE.BoxGeometry(2.5, 0.25, 0.25);
            const topBar = new THREE.Mesh(topGeom, barrierMat);
            topBar.position.y = 1.9; // Height of 1.9m
            topBar.castShadow = true;
            this.mesh.add(topBar);

            // Left leg
            const leftLegGeom = new THREE.BoxGeometry(0.2, 2.0, 0.2);
            const leftLeg = new THREE.Mesh(leftLegGeom, legMat);
            leftLeg.position.set(-1.1, 1.0, 0);
            leftLeg.castShadow = true;
            this.mesh.add(leftLeg);

            // Right leg
            const rightLegGeom = new THREE.BoxGeometry(0.2, 2.0, 0.2);
            const rightLeg = new THREE.Mesh(rightLegGeom, legMat);
            rightLeg.position.set(1.1, 1.0, 0);
            rightLeg.castShadow = true;
            this.mesh.add(rightLeg);

            // "DUCK" glowing icon
            const signGeom = new THREE.BoxGeometry(0.5, 0.3, 0.05);
            const signMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
            const sign = new THREE.Mesh(signGeom, signMat);
            sign.position.set(0, 1.9, 0.15);
            this.mesh.add(sign);
        } else {
            // Low barrier - player must jump over
            // Horizontal barrier board
            const boardGeom = new THREE.BoxGeometry(2.2, 0.4, 0.15);
            const board = new THREE.Mesh(boardGeom, barrierMat);
            board.position.y = 0.5; // low hurdle
            board.castShadow = true;
            this.mesh.add(board);

            // Left leg
            const leftLegGeom = new THREE.BoxGeometry(0.15, 0.7, 0.4);
            const leftLeg = new THREE.Mesh(leftLegGeom, legMat);
            leftLeg.position.set(-1.0, 0.35, 0);
            leftLeg.castShadow = true;
            this.mesh.add(leftLeg);

            // Right leg
            const rightLeg = leftLeg.clone();
            rightLeg.position.x = 1.0;
            this.mesh.add(rightLeg);
        }

        this.mesh.position.set(lane * 3.0, 0, zPos);
        scene.add(this.mesh);
        this.updateBoundingBox();
    }

    public update(dt: number, speed: number, _time: number) {
        this.mesh.position.z -= speed * dt;
        this.updateBoundingBox();
    }

    private updateBoundingBox() {
        if (this.isHigh) {
            // Collision is with the top bar (Y = 1.8 to 2.1)
            this.boundingBox.setFromCenterAndSize(
                new THREE.Vector3(this.mesh.position.x, 1.9, this.mesh.position.z),
                new THREE.Vector3(2.4, 0.3, 0.3)
            );
        } else {
            // Collision is from ground up to 0.7m
            this.boundingBox.setFromCenterAndSize(
                new THREE.Vector3(this.mesh.position.x, 0.35, this.mesh.position.z),
                new THREE.Vector3(2.2, 0.7, 0.4)
            );
        }
    }

    public destroy(scene: THREE.Scene) {
        scene.remove(this.mesh);
        this.mesh.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                (object.material as THREE.Material).dispose();
            }
        });
    }
}

// ----------------------------------------------------
// 3. VEHICLE / CAR OBSTACLE
// ----------------------------------------------------
export class CarObstacle implements Obstacle {
    public mesh: THREE.Group = new THREE.Group();
    public boundingBox: THREE.Box3 = new THREE.Box3();
    public isCollected = false;
    public isHit = false;
    public lane: number;
    public type = 'car';

    public speedMultiplier = 1.0; // Dynamic car speed modifier
    private isMoving: boolean;
    private carSpeed = 6.0; // base car driving speed relative to chunk
    private wheels: THREE.Mesh[] = [];

    constructor(scene: THREE.Scene, lane: number, zPos: number, isMoving = false, colorHex = 0x2233ff) {
        this.lane = lane;
        this.isMoving = isMoving;

        // Build Cyberpunk Low-Poly Car
        const bodyMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x111116, metalness: 0.9 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x051a24, metalness: 0.9, roughness: 0.1 });
        const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffea00 }); // Yellow glow headlights
        const taillightMat = new THREE.MeshBasicMaterial({ color: 0xff1100 }); // Red glow taillights

        // 1. Lower Chassis
        const chassisGeom = new THREE.BoxGeometry(1.6, 0.5, 3.4);
        const chassis = new THREE.Mesh(chassisGeom, bodyMat);
        chassis.position.y = 0.45;
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        this.mesh.add(chassis);

        // 2. Cabin (Top part)
        const cabinGeom = new THREE.BoxGeometry(1.4, 0.55, 1.8);
        const cabin = new THREE.Mesh(cabinGeom, bodyMat);
        cabin.position.set(0, 0.95, -0.2);
        cabin.castShadow = true;
        this.mesh.add(cabin);

        // Windshield (Front glass)
        const frontGlassGeom = new THREE.BoxGeometry(1.3, 0.4, 0.1);
        const frontGlass = new THREE.Mesh(frontGlassGeom, glassMat);
        frontGlass.position.set(0, 0.95, 0.72);
        frontGlass.rotation.x = -0.5; // slant
        this.mesh.add(frontGlass);

        // Rear window
        const rearGlassGeom = new THREE.BoxGeometry(1.3, 0.4, 0.1);
        const rearGlass = new THREE.Mesh(rearGlassGeom, glassMat);
        rearGlass.position.set(0, 0.95, -1.12);
        rearGlass.rotation.x = 0.5; // slant
        this.mesh.add(rearGlass);

        // Headlights
        const headlightGeom = new THREE.SphereGeometry(0.12, 8, 8);
        const leftHead = new THREE.Mesh(headlightGeom, headlightMat);
        leftHead.position.set(-0.6, 0.45, 1.72);
        const rightHead = leftHead.clone();
        rightHead.position.x = 0.6;
        this.mesh.add(leftHead);
        this.mesh.add(rightHead);

        // Taillights
        const taillightGeom = new THREE.BoxGeometry(0.25, 0.1, 0.05);
        const leftTail = new THREE.Mesh(taillightGeom, taillightMat);
        leftTail.position.set(-0.6, 0.5, -1.72);
        const rightTail = leftTail.clone();
        rightTail.position.x = 0.6;
        this.mesh.add(leftTail);
        this.mesh.add(rightTail);

        // 3. Wheels (4 Cylinders)
        const wheelGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 12);
        wheelGeom.rotateZ(Math.PI / 2); // rotate cylinder sideways
        
        const flWheel = new THREE.Mesh(wheelGeom, darkMetalMat);
        flWheel.position.set(-0.85, 0.35, 1.0);
        flWheel.castShadow = true;
        this.mesh.add(flWheel);
        this.wheels.push(flWheel);

        const frWheel = flWheel.clone();
        frWheel.position.x = 0.85;
        this.mesh.add(frWheel);
        this.wheels.push(frWheel);

        const blWheel = flWheel.clone();
        blWheel.position.z = -1.0;
        this.mesh.add(blWheel);
        this.wheels.push(blWheel);

        const brWheel = frWheel.clone();
        brWheel.position.z = -1.0;
        this.mesh.add(brWheel);
        this.wheels.push(brWheel);

        // Orient car: standard obstacles drive TOWARD the player (pointing down +Z, so headlights are in front)
        // Except if we want them parked facing either direction. Let's make them face the player (headlights facing +Z).
        // That means the back of the car (taillights) faces -Z.
        // Wait, standard cars drive towards the player, which is -Z in relative motion, so the headlights should face +Z (towards player). That's correct! Headlights are at Z = +1.72.

        this.mesh.position.set(lane * 3.0, 0, zPos);
        scene.add(this.mesh);
        this.updateBoundingBox();
    }

    public update(dt: number, speed: number, _time: number) {
        // Z-axis movement combines game speed (city flowing backward) 
        // AND car driving speed (driving towards player)
        let relativeSpeed = speed;
        if (this.isMoving) {
            relativeSpeed += this.carSpeed * this.speedMultiplier;
            
            // Spin wheels based on car speed
            const wheelSpin = (this.carSpeed * this.speedMultiplier) * dt * 3.0;
            this.wheels.forEach(w => w.rotation.x += wheelSpin);
        }

        this.mesh.position.z -= relativeSpeed * dt;
        this.updateBoundingBox();
    }

    public stopCar() {
        // Stop moving (e.g. at red traffic lights)
        this.isMoving = false;
    }

    public startCar() {
        this.isMoving = true;
    }

    private updateBoundingBox() {
        this.boundingBox.setFromCenterAndSize(
            new THREE.Vector3(this.mesh.position.x, 0.65, this.mesh.position.z),
            new THREE.Vector3(1.6, 1.3, 3.4)
        );
    }

    public destroy(scene: THREE.Scene) {
        scene.remove(this.mesh);
        this.mesh.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                (object.material as THREE.Material).dispose();
            }
        });
    }
}

// ----------------------------------------------------
// 4. TRAFFIC LIGHT / CROSSING GATE OBSTACLE
// ----------------------------------------------------
export class TrafficLightObstacle implements Obstacle {
    public mesh: THREE.Group = new THREE.Group();
    public boundingBox: THREE.Box3 = new THREE.Box3();
    public isCollected = false;
    public isHit = false;
    public lane: number;
    public type = 'traffic_light';

    public state: 'green' | 'yellow' | 'red' = 'green';
    
    // Light Meshes
    private redLight!: THREE.Mesh;
    private yellowLight!: THREE.Mesh;
    private greenLight!: THREE.Mesh;

    // Crossing gate arm (blocks lanes when red)
    private gateArm!: THREE.Mesh;
    private gatePivot: THREE.Group = new THREE.Group();
    
    constructor(scene: THREE.Scene, lane: number, zPos: number) {
        this.lane = lane; // The lane the main post stands on (usually left lane -3 or right lane 3)

        const postMat = new THREE.MeshStandardMaterial({ color: 0x22222f, metalness: 0.8 });
        
        // 1. Vertical Pole
        const poleGeom = new THREE.CylinderGeometry(0.12, 0.15, 4.0, 8);
        const pole = new THREE.Mesh(poleGeom, postMat);
        pole.position.y = 2.0;
        pole.castShadow = true;
        this.mesh.add(pole);

        // 2. Light Box
        const boxGeom = new THREE.BoxGeometry(0.4, 1.2, 0.4);
        const box = new THREE.Mesh(boxGeom, postMat);
        box.position.set(0, 3.5, 0.1);
        pole.add(box);

        // Lights
        const lightGeom = new THREE.SphereGeometry(0.12, 8, 8);
        
        this.redLight = new THREE.Mesh(lightGeom, new THREE.MeshBasicMaterial({ color: 0x550000 }));
        this.redLight.position.set(0, 3.9, 0.3);
        this.mesh.add(this.redLight);

        this.yellowLight = new THREE.Mesh(lightGeom, new THREE.MeshBasicMaterial({ color: 0x555500 }));
        this.yellowLight.position.set(0, 3.5, 0.3);
        this.mesh.add(this.yellowLight);

        this.greenLight = new THREE.Mesh(lightGeom, new THREE.MeshBasicMaterial({ color: 0x005500 }));
        this.greenLight.position.set(0, 3.1, 0.3);
        this.mesh.add(this.greenLight);

        // 3. Barricade gate arm pivot (stands at Y=1.2)
        this.gatePivot.position.set(0, 1.2, 0);
        this.mesh.add(this.gatePivot);

        // Crossing Gate Arm (A long striped box that blocks lanes. If pole is at X=-3, arm extends to right by 6m)
        // If pole is at X = -3 (Left), arm extends to +X. If pole is at X = 3 (Right), arm extends to -X.
        const armLength = 7.0;
        const armGeom = new THREE.BoxGeometry(armLength, 0.12, 0.12);
        
        const armMat = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xff8800,
            emissiveIntensity: 0.2
        });
        
        this.gateArm = new THREE.Mesh(armGeom, armMat);
        // Pivot offset so it rotates around the pole
        const directionFactor = (lane < 0) ? 1 : -1;
        this.gateArm.position.x = (armLength / 2) * directionFactor;
        this.gatePivot.add(this.gateArm);

        this.mesh.position.set(lane * 3.0, 0, zPos);
        scene.add(this.mesh);
        
        this.setLightState('green');
        this.updateBoundingBox();
    }

    public setLightState(state: 'green' | 'yellow' | 'red') {
        this.state = state;
        
        // Reset colors
        (this.redLight.material as THREE.MeshBasicMaterial).color.setHex(0x330000);
        (this.yellowLight.material as THREE.MeshBasicMaterial).color.setHex(0x333300);
        (this.greenLight.material as THREE.MeshBasicMaterial).color.setHex(0x003300);

        if (state === 'red') {
            (this.redLight.material as THREE.MeshBasicMaterial).color.setHex(0xff0000);
        } else if (state === 'yellow') {
            (this.yellowLight.material as THREE.MeshBasicMaterial).color.setHex(0xffea00);
        } else {
            (this.greenLight.material as THREE.MeshBasicMaterial).color.setHex(0x39ff14);
        }
    }

    public update(dt: number, speed: number, _time: number) {
        this.mesh.position.z -= speed * dt;

        // Gate Arm rotation animation depending on red light
        // Red -> Gate is down (rotation.z = 0)
        // Green/Yellow -> Gate is up (rotation.z = ~Math.PI/2)
        const targetRot = (this.state === 'red') ? 0 : (Math.PI / 2) * ((this.lane < 0) ? -1 : 1);
        
        // Smooth rotation
        this.gatePivot.rotation.z += (targetRot - this.gatePivot.rotation.z) * 6 * dt;

        this.updateBoundingBox();
    }

    private updateBoundingBox() {
        // If Red, the gate arm is down and blocks lanes. 
        // Let's check rotation to determine collision volume.
        const armAngle = Math.abs(this.gatePivot.rotation.z);
        const isArmDown = armAngle < 0.15; // Closed barrier

        if (isArmDown) {
            // The gate blocks the entire street from X = -3.5 to X = 3.5 at height Y = 1.0 to 1.3
            // The player can slide underneath if sliding, or jump over if timed correctly.
            // Let's make it a slide-under obstacle (Y center = 1.2)
            this.boundingBox.setFromCenterAndSize(
                new THREE.Vector3(0, 1.2, this.mesh.position.z), // Block center is street middle
                new THREE.Vector3(7.5, 0.2, 0.2) // Wide street block
            );
        } else {
            // Arm is up, only pole is an obstacle if they run directly into it
            this.boundingBox.setFromCenterAndSize(
                new THREE.Vector3(this.mesh.position.x, 2.0, this.mesh.position.z),
                new THREE.Vector3(0.3, 4.0, 0.3)
            );
        }
    }

    public destroy(scene: THREE.Scene) {
        scene.remove(this.mesh);
        this.mesh.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                (object.material as THREE.Material).dispose();
            }
        });
    }
}

// ----------------------------------------------------
// 5. PEDESTRIAN OBSTACLE
// ----------------------------------------------------
export class PedestrianObstacle implements Obstacle {
    public mesh: THREE.Group = new THREE.Group();
    public boundingBox: THREE.Box3 = new THREE.Box3();
    public isCollected = false;
    public isHit = false;
    public lane: number;
    public type = 'pedestrian';

    private walkSpeed = 2.5;
    private direction = 1; // 1 = right (+X), -1 = left (-X)
    private boundsX = 4.5; // Walk limits

    // Limbs for animation
    private leftLeg!: THREE.Mesh;
    private rightLeg!: THREE.Mesh;

    constructor(scene: THREE.Scene, zPos: number, startsOnLeft = true) {
        // Pedestrians walk back and forth. 
        // Initial lane doesn't matter since they cross lanes. We'll set a default.
        this.lane = startsOnLeft ? -1 : 1;
        this.direction = startsOnLeft ? 1 : -1;

        // Build Low-Poly Humanoid Pedestrian
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac }); // peach skin
        const clothesMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.5 }); // neon shirt
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x111122 });

        // Torso
        const torsoGeom = new THREE.BoxGeometry(0.4, 0.7, 0.25);
        const torso = new THREE.Mesh(torsoGeom, clothesMat);
        torso.position.y = 0.85;
        torso.castShadow = true;
        this.mesh.add(torso);

        // Head
        const headGeom = new THREE.SphereGeometry(0.2, 10, 10);
        const head = new THREE.Mesh(headGeom, skinMat);
        head.position.y = 0.5;
        torso.add(head);

        // Legs
        const legGeom = new THREE.BoxGeometry(0.12, 0.5, 0.12);
        this.leftLeg = new THREE.Mesh(legGeom, pantsMat);
        this.leftLeg.position.set(-0.12, -0.6, 0);
        this.leftLeg.castShadow = true;
        torso.add(this.leftLeg);

        this.rightLeg = this.leftLeg.clone();
        this.rightLeg.position.x = 0.12;
        torso.add(this.rightLeg);

        this.mesh.position.set(startsOnLeft ? -this.boundsX : this.boundsX, 0, zPos);
        scene.add(this.mesh);
        
        // Face the walking direction
        this.mesh.rotation.y = this.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
        this.updateBoundingBox();
    }

    public update(dt: number, speed: number, time: number) {
        // 1. Move backward with road scroll
        this.mesh.position.z -= speed * dt;

        // 2. Walk side-to-side (crossing the street!)
        this.mesh.position.x += this.direction * this.walkSpeed * dt;

        // Change directions if hitting margins
        if (Math.abs(this.mesh.position.x) > this.boundsX) {
            this.direction *= -1;
            this.mesh.rotation.y = this.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
        }

        // Keep track of which lane they are currently in based on X coord
        if (this.mesh.position.x < -1.5) this.lane = -1;
        else if (this.mesh.position.x > 1.5) this.lane = 1;
        else this.lane = 0;

        // 3. Leg swing animation
        const swing = Math.sin(time * 12.0) * 0.6;
        this.leftLeg.rotation.x = swing;
        this.rightLeg.rotation.x = -swing;

        this.updateBoundingBox();
    }

    private updateBoundingBox() {
        this.boundingBox.setFromCenterAndSize(
            new THREE.Vector3(this.mesh.position.x, 0.75, this.mesh.position.z),
            new THREE.Vector3(0.65, 1.5, 0.5)
        );
    }

    public destroy(scene: THREE.Scene) {
        scene.remove(this.mesh);
        this.mesh.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                (object.material as THREE.Material).dispose();
            }
        });
    }
}

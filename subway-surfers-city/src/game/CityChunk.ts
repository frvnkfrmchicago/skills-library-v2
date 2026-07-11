import * as THREE from 'three';
import { Obstacle, CoinObstacle, BarricadeObstacle, CarObstacle, TrafficLightObstacle, PedestrianObstacle } from './Obstacles';

export class CityChunk {
    public group: THREE.Group = new THREE.Group();
    public zPosition: number;
    public length = 80.0;
    
    // Type: 'normal' or 'crossing'
    public isCrossing = false;
    
    // Lists of items inside this chunk
    public obstacles: Obstacle[] = [];
    private decorMeshes: THREE.Mesh[] = [];
    private lights: (THREE.Light | THREE.Group)[] = [];

    // Crossing state
    private trafficLight: TrafficLightObstacle | null = null;
    private lightTimer = 0.0;
    private lightState: 'green' | 'yellow' | 'red' = 'green';
    private crossCars: CarObstacle[] = [];
    private crossPedestrians: PedestrianObstacle[] = [];
    private hasSpawnedCrossActors = false;

    constructor(scene: THREE.Scene, zPosition: number, isCrossing = false, difficulty = 1.0) {
        this.zPosition = zPosition;
        this.isCrossing = isCrossing;
        this.group.position.z = zPosition;

        this.buildRoadAndSidewalks();
        this.buildBuildings();
        this.buildStreetDecorations();

        // Spawn gameplay elements
        if (isCrossing) {
            this.buildCrossingElements(scene, difficulty);
        } else {
            this.buildLaneObstacles(scene, difficulty);
        }

        scene.add(this.group);
    }

    private buildRoadAndSidewalks() {
        // 1. Tarmac Road (Black-grey grid)
        const roadGeom = new THREE.PlaneGeometry(10.0, this.length);
        const roadMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a0f,
            roughness: 0.8,
            metalness: 0.1
        });
        const road = new THREE.Mesh(roadGeom, roadMat);
        road.rotation.x = -Math.PI / 2;
        road.position.set(0, 0, this.length / 2);
        road.receiveShadow = true;
        this.group.add(road);

        // Lane markings (dashed yellow lines)
        // Two dividing lines between lanes X=-1.5 and X=1.5
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        const dashLength = 2.0;
        const dashGap = 2.0;
        const numDashes = Math.floor(this.length / (dashLength + dashGap));

        for (let i = 0; i < numDashes; i++) {
            const zDash = i * (dashLength + dashGap) + dashLength / 2;
            
            // Left dividing dashes
            const dashLGeom = new THREE.PlaneGeometry(0.1, dashLength);
            const dashL = new THREE.Mesh(dashLGeom, lineMat);
            dashL.rotation.x = -Math.PI / 2;
            dashL.position.set(-1.5, 0.005, zDash);
            this.group.add(dashL);
            this.decorMeshes.push(dashL);

            // Right dividing dashes
            const dashR = dashL.clone();
            dashR.position.x = 1.5;
            this.group.add(dashR);
            this.decorMeshes.push(dashR);
        }

        // Sidewalks (Concrete boxes with neon borders)
        const sidewalkGeom = new THREE.BoxGeometry(4.0, 0.2, this.length);
        const sidewalkMat = new THREE.MeshStandardMaterial({
            color: 0x181822,
            roughness: 0.7,
            metalness: 0.3
        });
        
        // Left sidewalk
        const leftSidewalk = new THREE.Mesh(sidewalkGeom, sidewalkMat);
        leftSidewalk.position.set(-7.0, 0.1, this.length / 2);
        leftSidewalk.receiveShadow = true;
        this.group.add(leftSidewalk);
        this.decorMeshes.push(leftSidewalk);

        // Right sidewalk
        const rightSidewalk = new THREE.Mesh(sidewalkGeom, sidewalkMat);
        rightSidewalk.position.set(7.0, 0.1, this.length / 2);
        rightSidewalk.receiveShadow = true;
        this.group.add(rightSidewalk);
        this.decorMeshes.push(rightSidewalk);

        // Neon edge borders
        const borderGeom = new THREE.BoxGeometry(0.1, 0.22, this.length);
        const borderLMat = new THREE.MeshBasicMaterial({ color: 0xff007f }); // Pink left border
        const borderRMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff }); // Cyan right border

        const leftBorder = new THREE.Mesh(borderGeom, borderLMat);
        leftBorder.position.set(-5.05, 0.11, this.length / 2);
        this.group.add(leftBorder);
        this.decorMeshes.push(leftBorder);

        const rightBorder = new THREE.Mesh(borderGeom, borderRMat);
        rightBorder.position.set(5.05, 0.11, this.length / 2);
        this.group.add(rightBorder);
        this.decorMeshes.push(rightBorder);
        
        // Crosswalk stripes if it's a crossing
        if (this.isCrossing) {
            const crosswalkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const stripeGeom = new THREE.PlaneGeometry(0.6, 8.0);
            
            // Draw zebra lines horizontally across street at Z = length/2
            for (let x = -3.5; x <= 3.5; x += 1.0) {
                const stripe = new THREE.Mesh(stripeGeom, crosswalkMat);
                stripe.rotation.x = -Math.PI / 2;
                stripe.rotation.z = Math.PI / 2;
                stripe.position.set(x, 0.006, this.length / 2);
                this.group.add(stripe);
                this.decorMeshes.push(stripe);
            }
        }
    }

    private buildBuildings() {
        const buildWidth = 5.0;
        const spacing = 15.0;
        const numBuildings = Math.floor(this.length / spacing);

        const buildingColors = [0x0c0c16, 0x111122, 0x070710, 0x16162a];

        for (let side = -1; side <= 1; side += 2) { // -1 = Left side, 1 = Right side
            const xPos = side * 11.0; // Place behind sidewalks
            
            for (let i = 0; i < numBuildings; i++) {
                const zPos = i * spacing + spacing / 2 + (Math.random() - 0.5) * 3;
                const height = Math.random() * 25.0 + 10.0;
                const depth = Math.random() * 6.0 + 8.0;

                const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
                const geom = new THREE.BoxGeometry(buildWidth, height, depth);
                const mat = new THREE.MeshStandardMaterial({
                    color: color,
                    metalness: 0.9,
                    roughness: 0.2
                });

                const bMesh = new THREE.Mesh(geom, mat);
                bMesh.position.set(xPos, height / 2, zPos);
                bMesh.castShadow = true;
                bMesh.receiveShadow = true;
                this.group.add(bMesh);
                this.decorMeshes.push(bMesh);

                // Add volumetric neon windows
                this.addNeonWindows(bMesh, buildWidth, height, depth, side);
            }
        }
    }

    private addNeonWindows(building: THREE.Mesh, w: number, h: number, d: number, side: number) {
        // Windows on the face looking towards the street (X face pointing to center)
        const windowColor = Math.random() > 0.5 ? 0x00f0ff : 0xff007f; // Cyan or Pink
        const winMat = new THREE.MeshBasicMaterial({ color: windowColor });
        
        // Window parameters
        const winW = 0.3;
        const winH = 0.5;
        const winD = 0.05;
        const winGeom = new THREE.BoxGeometry(winD, winH, winW);

        const rows = Math.floor(h / 3.0);
        const cols = Math.floor(d / 2.0);

        const xOffset = (w / 2 + 0.02) * -side; // Just slightly popping out from the inner wall

        for (let r = 1; r < rows - 1; r++) {
            const y = (r * 3.0) - h / 2;
            
            // Randomize if rows are illuminated
            if (Math.random() > 0.3) {
                for (let c = 1; c < cols - 1; c++) {
                    // Randomize individual windows
                    if (Math.random() > 0.25) {
                        const z = (c * 2.0) - d / 2;
                        const win = new THREE.Mesh(winGeom, winMat);
                        win.position.set(xOffset, y, z);
                        building.add(win);
                    }
                }
            }
        }
    }

    private buildStreetDecorations() {
        // Lamp posts spaced along the sidewalks
        const lampSpacing = 40.0;
        const numLamps = Math.floor(this.length / lampSpacing);

        const postMat = new THREE.MeshStandardMaterial({ color: 0x111116, metalness: 0.9 });
        const lightGlobeMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });

        for (let side = -1; side <= 1; side += 2) {
            const xPos = side * 5.2; // Sidewalk edge
            
            for (let i = 0; i < numLamps; i++) {
                const zPos = i * lampSpacing + 10.0;

                const lampGroup = new THREE.Group();
                lampGroup.position.set(xPos, 0, zPos);

                // Base post
                const postGeom = new THREE.CylinderGeometry(0.06, 0.08, 3.5, 8);
                const post = new THREE.Mesh(postGeom, postMat);
                post.position.y = 1.75;
                post.castShadow = true;
                lampGroup.add(post);

                // Arm extending towards street
                const armGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
                armGeom.rotateZ(Math.PI / 2); // horizontal
                const arm = new THREE.Mesh(armGeom, postMat);
                arm.position.set(-0.35 * side, 3.4, 0);
                lampGroup.add(arm);

                // Glowing lamp head
                const headGeom = new THREE.SphereGeometry(0.18, 12, 12);
                const head = new THREE.Mesh(headGeom, lightGlobeMat);
                head.position.set(-0.7 * side, 3.3, 0);
                lampGroup.add(head);

                this.group.add(lampGroup);
                
                // Add a physical light source (cap count to preserve FPS)
                if (i === 0 && Math.random() > 0.5) {
                    const pointLight = new THREE.PointLight(0xffffaa, 1.2, 8.0);
                    pointLight.position.set(-0.7 * side, 3.1, 0);
                    pointLight.castShadow = false; // Turn off shadow mapping on pointlights for huge speedup!
                    lampGroup.add(pointLight);
                    this.lights.push(pointLight);
                }
            }
        }
    }

    private buildLaneObstacles(scene: THREE.Scene, difficulty: number) {
        // Determine how many obstacles to spawn in this chunk (based on difficulty)
        // Normal street chunks hold coins and obstacles.
        // We divide the chunk into 3 segments: Z = 15m, 35m, 55m
        const segments = [20.0, 45.0, 65.0];
        
        // Randomly pick lanes to prevent completely blocking all 3 lanes
        segments.forEach((zOffset) => {
            const worldZ = this.zPosition + zOffset;
            const openLane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1 will be left completely free
            const lanes = [-1, 0, 1];
            
            lanes.forEach((lane) => {
                if (lane === openLane) {
                    // Spawn coins in the free/open lane!
                    this.spawnCoinChain(scene, lane, zOffset);
                    return;
                }

                const spawnRoll = Math.random() * difficulty;
                if (spawnRoll > 0.45) {
                    // Spawn obstacle
                    const obsType = Math.random();
                    if (obsType < 0.35) {
                        // Low hurdle (jump over)
                        const barrier = new BarricadeObstacle(scene, lane, worldZ, false);
                        this.obstacles.push(barrier);
                        this.group.add(barrier.mesh);
                    } else if (obsType < 0.55) {
                        // High hurdle (slide under)
                        const barrier = new BarricadeObstacle(scene, lane, worldZ, true);
                        this.obstacles.push(barrier);
                        this.group.add(barrier.mesh);
                    } else if (obsType < 0.85) {
                        // Static Parked Car
                        const colorHex = Math.random() > 0.5 ? 0x00f0ff : 0xff007f; // Cyan or Pink neon car
                        const car = new CarObstacle(scene, lane, worldZ, false, colorHex);
                        this.obstacles.push(car);
                        this.group.add(car.mesh);
                    } else {
                        // Dynamic Driving Car (moves towards player)
                        // It starts further down the road inside this chunk segment
                        const car = new CarObstacle(scene, lane, worldZ + 10.0, true, 0xffd700);
                        car.speedMultiplier = 1.0 + (difficulty * 0.15); // drives faster on higher speeds
                        this.obstacles.push(car);
                        this.group.add(car.mesh);
                    }
                }
            }
            );
        });
    }

    private spawnCoinChain(scene: THREE.Scene, lane: number, startZOffset: number) {
        // Spawn 3-4 coins in a chain
        const coinCount = Math.floor(Math.random() * 2) + 3;
        const spacing = 2.5;
        const isArc = Math.random() > 0.5; // Jump arc path or straight line path
        
        for (let i = 0; i < coinCount; i++) {
            const zVal = startZOffset + i * spacing;
            if (zVal >= this.length - 2) break; // Don't overflow chunk
            
            // Calculate height
            let height = 0.8;
            if (isArc) {
                // Parabola arc: peaks in the middle
                const mid = (coinCount - 1) / 2;
                height = 0.8 + Math.sin((i / (coinCount - 1)) * Math.PI) * 1.5;
            }

            const coin = new CoinObstacle(scene, lane, this.zPosition + zVal, height);
            this.obstacles.push(coin);
            this.group.add(coin.mesh);
        }
    }

    private buildCrossingElements(scene: THREE.Scene, difficulty: number) {
        const crossingZ = this.length / 2; // Center of chunk is intersection
        
        // 1. Spawning the traffic light poles on sidewalks
        // Pole on left sidewalk (X = -4.5)
        this.trafficLight = new TrafficLightObstacle(scene, -1.5, this.zPosition + crossingZ - 4);
        this.obstacles.push(this.trafficLight);
        this.group.add(this.trafficLight.mesh);

        // Reset timer
        this.lightTimer = 0.0;
        this.lightState = 'green';
        this.trafficLight.setLightState('green');

        // We will spawn pedestrians and cross-cars on demand in the update loop 
        // as the player gets closer to make sure they are active at the right window.
        this.hasSpawnedCrossActors = false;
    }

    private spawnCrossingActors(scene: THREE.Scene) {
        if (this.hasSpawnedCrossActors) return;
        this.hasSpawnedCrossActors = true;

        const crossingZ = this.zPosition + this.length / 2;

        // 1. Spawn cross pedestrian crossing the road
        const ped = new PedestrianObstacle(scene, crossingZ, Math.random() > 0.5);
        this.crossPedestrians.push(ped);
        this.obstacles.push(ped);
        this.group.add(ped.mesh);

        // 2. Spawn 1-2 cross cars driving horizontally across street (from left to right, X=-15 to +15)
        // Note: these drive horizontally, so they need a custom mesh angle. We build them in this.group.
        const crossCarGroup1 = new THREE.Group();
        
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111116, metalness: 0.9 });
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 1.5), bodyMat);
        chassis.position.y = 0.6;
        crossCarGroup1.add(chassis);
        // glowing headlights (facing path)
        const light = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffea00 }));
        light.position.set(1.52, 0.6, 0.4);
        crossCarGroup1.add(light);
        
        // Position cross car offscreen horizontally
        crossCarGroup1.position.set(-15, 0, crossingZ + (Math.random() > 0.5 ? 1.5 : -1.5));
        crossCarGroup1.rotation.y = Math.PI / 2; // point along X axis
        
        // Wrap as a dummy obstacle for positioning/movement
        const dummyCar: Obstacle = {
            mesh: crossCarGroup1,
            boundingBox: new THREE.Box3(),
            isCollected: false,
            isHit: false,
            lane: 0,
            type: 'cross_car',
            update: (dt, speed, _time) => {
                // Flow backward with game speed
                crossCarGroup1.position.z -= speed * dt;
                
                // If light is red, drive horizontally!
                if (this.lightState === 'red') {
                    crossCarGroup1.position.x += 12 * dt; // drives across street at 12m/s
                }
                
                // Update bounds
                dummyCar.boundingBox.setFromCenterAndSize(
                    new THREE.Vector3(crossCarGroup1.position.x, 0.6, crossCarGroup1.position.z),
                    new THREE.Vector3(3.0, 1.2, 1.6)
                );
            },
            destroy: (s) => {
                s.remove(crossCarGroup1);
                chassis.geometry.dispose();
                (chassis.material as THREE.Material).dispose();
                light.geometry.dispose();
                (light.material as THREE.Material).dispose();
            }
        };

        this.obstacles.push(dummyCar);
        scene.add(crossCarGroup1);
        this.group.add(crossCarGroup1);
    }

    public update(dt: number, speed: number, time: number, scene: THREE.Scene) {
        // Move entire chunk group backwards
        this.group.position.z -= speed * dt;
        // Keep track of our virtual z coordinate
        this.zPosition -= speed * dt;

        // Trigger spawning crossing actors as they get within 90m of the player
        if (this.isCrossing && !this.hasSpawnedCrossActors && this.zPosition < 90.0) {
            this.spawnCrossingActors(scene);
        }

        // Handle Traffic Light Cycling & AI Traffic Stopping
        if (this.isCrossing && this.trafficLight) {
            this.lightTimer += dt;
            
            // Cycle: Green (6s) -> Yellow (2s) -> Red (6s) -> repeat
            if (this.lightState === 'green' && this.lightTimer > 6.0) {
                this.lightState = 'yellow';
                this.lightTimer = 0;
                this.trafficLight.setLightState('yellow');
            } else if (this.lightState === 'yellow' && this.lightTimer > 2.0) {
                this.lightState = 'red';
                this.lightTimer = 0;
                this.trafficLight.setLightState('red');
            } else if (this.lightState === 'red' && this.lightTimer > 6.0) {
                this.lightState = 'green';
                this.lightTimer = 0;
                this.trafficLight.setLightState('green');
            }

            // Stop other lane cars if close to red intersection
            // If light is yellow or red, make cars on lanes slow down or stop
            this.obstacles.forEach((obs) => {
                if (obs instanceof CarObstacle) {
                    const carRelZ = obs.mesh.position.z - this.group.position.z;
                    // Check if car is approaching crossing (e.g. Z = 30-40) and light is Red
                    const crossingLocalZ = this.length / 2;
                    if (this.lightState === 'red' && carRelZ > crossingLocalZ && carRelZ < crossingLocalZ + 18.0) {
                        obs.stopCar();
                    } else if (this.lightState === 'green') {
                        obs.startCar();
                    }
                }
            });
        }

        // Update all contained obstacles
        this.obstacles.forEach((obs) => {
            // Obstacles move along with the road, but cars / pedestrians have their own updates
            obs.update(dt, speed, time);
        });
    }

    public destroy(scene: THREE.Scene) {
        scene.remove(this.group);

        // 1. Destroy all active obstacles
        this.obstacles.forEach((obs) => {
            obs.destroy(scene);
        });
        this.obstacles = [];

        // 2. Dispose of static chunk parts
        this.decorMeshes.forEach((mesh) => {
            this.group.remove(mesh);
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach((m) => m.dispose());
            } else {
                mesh.material.dispose();
            }
        });
        this.decorMeshes = [];

        // 3. Dispose of lighting sources
        this.lights.forEach((light) => {
            if (light instanceof THREE.Light) {
                this.group.remove(light);
                light.dispose();
            } else {
                // Group lamp
                scene.remove(light);
            }
        });
        this.lights = [];
        
        this.trafficLight = null;
        this.crossCars = [];
        this.crossPedestrians = [];
    }
}

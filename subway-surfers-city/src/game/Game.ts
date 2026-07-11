import * as THREE from 'three';
import { Player } from './Player';
import { InputController } from './Input';
import { AudioController } from './Audio';
import { ParticleSystem } from './Particles';
import { CityChunk } from './CityChunk';
import { Obstacle } from './Obstacles';

type GameState = 'MENU' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export class GameController {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    
    // Core Subsystems
    private player: Player | null = null;
    private input: InputController;
    private audio: AudioController;
    private particles: ParticleSystem;
    private chunks: CityChunk[] = [];
    
    // Game State
    public state: GameState = 'MENU';
    private baseSpeed = 16.0; // Starting running speed (m/s)
    private currentSpeed = 0.0;
    private maxSpeed = 36.0;
    private speedAcceleration = 0.05; // speed increase per second
    
    // Stats
    private score = 0;
    private coins = 0;
    private distance = 0;
    private multiplier = 1;
    private highScore = 0;
    private chosenGear: 'board' | 'shoes' = 'board';

    // Camera follow parameters
    private targetCamPos = new THREE.Vector3(0, 3.5, -4.5); // offset relative to player
    private camLerpSpeed = 8.0;
    public cameraShakeIntensity = 0.0;
    private timeElapsed = 0.0;

    // Countdown state
    private countdownVal = 3;
    private countdownTimer = 0.0;

    // UI elements cache
    private startScreen = document.getElementById('start-screen')!;
    private pauseScreen = document.getElementById('pause-screen')!;
    private gameoverScreen = document.getElementById('gameover-screen')!;
    private hud = document.getElementById('hud')!;
    private scoreVal = document.getElementById('score-val')!;
    private coinsVal = document.getElementById('coins-val')!;
    private multiplierVal = document.getElementById('multiplier-val')!;
    private distanceVal = document.getElementById('distance-val')!;
    private countdownEl = document.getElementById('countdown')!;
    private hudAlert = document.getElementById('hud-alert')!;
    private highScoreDisplay = document.getElementById('high-score-val')!;

    constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
        this.scene = scene;
        this.camera = camera;

        this.input = new InputController();
        this.audio = new AudioController();
        this.particles = new ParticleSystem(scene);

        this.loadHighScore();
        this.initUIListeners();
        this.setupInputCallbacks();
        this.resetCamera();
    }

    private loadHighScore() {
        const saved = localStorage.getItem('neon_surfer_highscore');
        if (saved) {
            this.highScore = parseInt(saved, 10);
        }
        this.highScoreDisplay.textContent = this.highScore.toString();
        const overHighScore = document.getElementById('high-score-val-over');
        if (overHighScore) {
            overHighScore.textContent = this.highScore.toString();
        }
    }

    private saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('neon_surfer_highscore', this.highScore.toString());
            this.highScoreDisplay.textContent = this.highScore.toString();
            return true; // New record
        }
        return false;
    }

    private initUIListeners() {
        // Gear Selection
        const boardBtn = document.getElementById('gear-board')!;
        const shoesBtn = document.getElementById('gear-shoes')!;
        
        boardBtn.addEventListener('click', () => {
            this.chosenGear = 'board';
            boardBtn.classList.add('active');
            shoesBtn.classList.remove('active');
            this.audio.playCoin(); // audio feedback
        });

        shoesBtn.addEventListener('click', () => {
            this.chosenGear = 'shoes';
            shoesBtn.classList.add('active');
            boardBtn.classList.remove('active');
            this.audio.playCoin(); // audio feedback
        });

        // Start button
        document.getElementById('start-btn')!.addEventListener('click', () => {
            this.startCountdown();
        });

        // Retry / Restart buttons
        document.getElementById('retry-btn')!.addEventListener('click', () => {
            this.startCountdown();
        });
        document.getElementById('restart-btn-pause')!.addEventListener('click', () => {
            this.pauseScreen.classList.add('hidden');
            this.startCountdown();
        });

        // Resume button
        document.getElementById('resume-btn')!.addEventListener('click', () => {
            this.resumeGame();
        });

        // Pause HUD button
        document.getElementById('pause-btn')!.addEventListener('click', () => {
            this.pauseGame();
        });

        // Main Menu buttons
        const returnToMenu = () => {
            this.pauseScreen.classList.add('hidden');
            this.gameoverScreen.classList.add('hidden');
            this.startScreen.classList.remove('screen-fade');
            this.startScreen.classList.remove('hidden');
            this.hud.classList.add('hidden');
            this.state = 'MENU';
            this.cleanupWorld();
            this.resetCamera();
        };
        document.getElementById('menu-btn-pause')!.addEventListener('click', returnToMenu);
        document.getElementById('menu-btn-over')!.addEventListener('click', returnToMenu);

        // Music & SFX toggle buttons
        const musicBtn = document.getElementById('music-toggle-btn')!;
        const sfxBtn = document.getElementById('sfx-toggle-btn')!;

        musicBtn.addEventListener('click', () => {
            const enabled = this.audio.toggleMusic();
            musicBtn.innerHTML = `<span class="btn-icon">🔊</span> Music: ${enabled ? 'ON' : 'OFF'}`;
        });

        sfxBtn.addEventListener('click', () => {
            const enabled = this.audio.toggleSfx();
            sfxBtn.innerHTML = `<span class="btn-icon">🔊</span> SFX: ${enabled ? 'ON' : 'OFF'}`;
        });
    }

    private setupInputCallbacks() {
        this.input.onLeft(() => {
            if (this.state === 'PLAYING' && this.player) {
                if (this.player.switchLaneLeft()) {
                    this.audio.playSlide();
                }
            }
        });

        this.input.onRight(() => {
            if (this.state === 'PLAYING' && this.player) {
                if (this.player.switchLaneRight()) {
                    this.audio.playSlide();
                }
            }
        });

        this.input.onJump(() => {
            if (this.state === 'PLAYING' && this.player) {
                if (this.player.jump()) {
                    this.audio.playJump();
                }
            }
        });

        this.input.onSlide(() => {
            if (this.state === 'PLAYING' && this.player) {
                if (this.player.slide()) {
                    this.audio.playSlide();
                }
            }
        });

        this.input.onPause(() => {
            if (this.state === 'PLAYING') {
                this.pauseGame();
            } else if (this.state === 'PAUSED') {
                this.resumeGame();
            }
        });
    }

    private startCountdown() {
        // Switch screen overlays
        this.startScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.gameoverScreen.classList.add('hidden');
        this.hud.classList.remove('hidden');
        this.countdownEl.classList.remove('hidden');
        
        // Start Web Audio Context on user click gesture
        this.audio.start();

        // Reset game stats
        this.score = 0;
        this.coins = 0;
        this.distance = 0;
        this.multiplier = 1;
        this.currentSpeed = this.baseSpeed;
        this.timeElapsed = 0;
        this.cameraShakeIntensity = 0;

        this.syncHUD();
        this.cleanupWorld();

        // Spawn player character
        if (this.player) {
            this.player.destroy(this.scene);
        }
        this.player = new Player(this.scene, this.chosenGear);

        // Spawn initial city layout chunks (3 segments of 80m each)
        // Segment 0: starts behind player (e.g. -20) to +60
        this.chunks.push(new CityChunk(this.scene, -20.0, false, 1.0));
        this.chunks.push(new CityChunk(this.scene, 60.0, false, 1.0));
        // Segment 2: spawn a crossing/intersection
        this.chunks.push(new CityChunk(this.scene, 140.0, true, 1.0));

        // Start 3-2-1 countdown sequence
        this.state = 'COUNTDOWN';
        this.countdownVal = 3;
        this.countdownTimer = 0.0;
        this.countdownEl.textContent = '3';
    }

    private startGameplay() {
        this.state = 'PLAYING';
        this.countdownEl.classList.add('hidden');
    }

    private pauseGame() {
        if (this.state !== 'PLAYING') return;
        this.state = 'PAUSED';
        this.pauseScreen.classList.remove('hidden');
        this.audio.setMusicEnabled(false);
    }

    private resumeGame() {
        if (this.state !== 'PAUSED') return;
        this.state = 'PLAYING';
        this.pauseScreen.classList.add('hidden');
        this.audio.setMusicEnabled(true);
        this.audio.start(); // Resumes loop
    }

    private triggerGameOver() {
        this.state = 'GAMEOVER';
        this.audio.setMusicEnabled(false);
        this.hud.classList.add('hidden');
        
        // Save score and check record
        const isNewRecord = this.saveHighScore();
        
        // Update stats on Game Over screen
        document.getElementById('final-score-val')!.textContent = this.score.toString();
        document.getElementById('final-dist-val')!.textContent = `${Math.floor(this.distance)} m`;
        document.getElementById('final-coins-val')!.textContent = this.coins.toString();
        
        const recordAlert = document.getElementById('new-high-score-msg')!;
        if (isNewRecord) {
            recordAlert.classList.remove('hidden');
        } else {
            recordAlert.classList.add('hidden');
        }

        this.gameoverScreen.classList.remove('hidden');
    }

    private cleanupWorld() {
        // Destroy chunks
        this.chunks.forEach(c => c.destroy(this.scene));
        this.chunks = [];

        // Destroy player
        if (this.player) {
            this.player.destroy(this.scene);
            this.player = null;
        }

        // Clear particles
        this.particles.clear();
        this.hudAlert.classList.add('hidden');
    }

    private resetCamera() {
        // Center camera behind start position
        this.camera.position.set(0, 4.0, -5.0);
        this.camera.lookAt(new THREE.Vector3(0, 1.2, 8.0));
    }

    private updateCamera(dt: number) {
        if (!this.player) {
            this.resetCamera();
            return;
        }

        // Target position slides side to side with player lane but smoothed out
        const targetX = this.player.position.x * 0.7; // follow side transitions slightly less for comfort
        const targetY = this.player.position.y + this.targetCamPos.y;
        const targetZ = this.player.position.z + this.targetCamPos.z;

        // Smooth interpolate camera position
        this.camera.position.x += (targetX - this.camera.position.x) * this.camLerpSpeed * dt;
        this.camera.position.y += (targetY - this.camera.position.y) * this.camLerpSpeed * 0.8 * dt; // vertical slower
        this.camera.position.z += (targetZ - this.camera.position.z) * this.camLerpSpeed * dt;

        // Apply screen shake
        if (this.cameraShakeIntensity > 0.01) {
            this.camera.position.x += (Math.random() - 0.5) * this.cameraShakeIntensity;
            this.camera.position.y += (Math.random() - 0.5) * this.cameraShakeIntensity;
            this.cameraShakeIntensity *= Math.pow(0.05, dt); // fast decay (damping)
        } else {
            this.cameraShakeIntensity = 0;
        }

        // Point camera at a spot slightly in front of player
        const lookTarget = new THREE.Vector3(
            this.player.position.x * 0.9,
            1.2 + this.player.position.y * 0.2, // don't pitch camera wildly when jumping
            8.0
        );
        this.camera.lookAt(lookTarget);
    }

    private checkCollisions() {
        if (!this.player) return;

        const playerBox = this.player.boundingBox;
        let showRedAlert = false;

        this.chunks.forEach((chunk) => {
            // Check if there is an upcoming RED traffic light in any active chunks
            if (chunk.isCrossing && chunk.zPosition > 0 && chunk.zPosition < 60.0) {
                // If the crossing is ahead and the light is Red, turn on the hud warning alert
                const crossLight = chunk.obstacles.find(o => o.type === 'traffic_light');
                // @ts-ignore
                if (crossLight && crossLight.state === 'red') {
                    showRedAlert = true;
                }
            }

            chunk.obstacles.forEach((obstacle) => {
                if (obstacle.isHit || obstacle.isCollected) return;

                // Collide
                if (playerBox.intersectsBox(obstacle.boundingBox)) {
                    if (obstacle.type === 'coin') {
                        // Coin Collection
                        obstacle.isCollected = true;
                        obstacle.mesh.visible = false;
                        
                        this.coins++;
                        this.score += 50 * this.multiplier;
                        this.audio.playCoin();
                        this.particles.spawnCoinSparkles(obstacle.mesh.position);
                        this.syncHUD();
                    } else {
                        // Collision Crash (Obstacles, Barricades, Cars, Pedestrians)
                        obstacle.isHit = true;
                        this.cameraShakeIntensity = 0.55; // strong camera shake
                        this.audio.playCrash();
                        
                        // Spawn explosion centered at impact
                        const crashPos = this.player!.position.clone();
                        crashPos.z += 0.5; // nudge forward
                        this.particles.spawnCrashExplosion(crashPos);
                        
                        // Stop player animation pose and trigger gameover
                        this.triggerGameOver();
                    }
                }
            });
        });

        // Set alert visual
        if (showRedAlert) {
            this.hudAlert.classList.remove('hidden');
        } else {
            this.hudAlert.classList.add('hidden');
        }
    }

    private syncHUD() {
        // format score: e.g. 002340
        const formattedScore = String(this.score).padStart(6, '0');
        this.scoreVal.textContent = formattedScore;
        this.coinsVal.textContent = this.coins.toString();
        this.multiplierVal.textContent = `x${this.multiplier}`;
        this.distanceVal.textContent = `${Math.floor(this.distance)} m`;
    }

    public update(dt: number) {
        this.timeElapsed += dt;
        
        // Limit dt to prevent massive jumps on frames drop
        const frameDt = Math.min(dt, 0.1);

        if (this.state === 'COUNTDOWN') {
            this.countdownTimer += frameDt;
            if (this.countdownTimer >= 1.0) {
                this.countdownTimer = 0.0;
                this.countdownVal--;
                
                if (this.countdownVal > 0) {
                    this.countdownEl.textContent = this.countdownVal.toString();
                    this.audio.playBeep(); // feedback tick
                } else {
                    this.countdownEl.textContent = 'GO!';
                    this.audio.playJump(); // starting high chime
                    this.startGameplay();
                }
            }
            
            // Still update particles (dust) and keep character animated at idle
            this.particles.update(frameDt);
            if (this.player) {
                this.player.update(frameDt, this.timeElapsed, this.particles);
            }
            this.updateCamera(frameDt);
        }
        else if (this.state === 'PLAYING') {
            // 1. Accelerate forward velocity slowly
            if (this.currentSpeed < this.maxSpeed) {
                this.currentSpeed += this.speedAcceleration * frameDt;
            }

            // Calculate difficulty level based on current speed
            const difficultyMultiplier = this.currentSpeed / this.baseSpeed;

            // 2. Score and distance updates
            this.distance += this.currentSpeed * frameDt * 0.2; // scaling factor for realism
            this.score += Math.round(this.currentSpeed * frameDt * this.multiplier * 0.5);
            
            // Adjust score multiplier based on distance run
            const newMultiplier = Math.min(10, Math.floor(this.distance / 200) + 1);
            if (newMultiplier > this.multiplier) {
                this.multiplier = newMultiplier;
                this.audio.playCoin(); // signal level-up speed multipliers
            }

            this.syncHUD();

            // 3. Update player kinematics (lane switches, jumping, sliding)
            if (this.player) {
                this.player.update(frameDt, this.timeElapsed, this.particles);
            }

            // 4. Update particle system (dust, sparkles, trails)
            this.particles.update(frameDt);

            // 5. Update and cycle city chunks (scroll streets backward)
            let oldestChunkIndex = -1;
            
            this.chunks.forEach((chunk, index) => {
                chunk.update(frameDt, this.currentSpeed, this.timeElapsed, this.scene);
                
                // If chunk has scrolled completely behind camera (Z border < -30)
                if (chunk.zPosition + chunk.length < -30.0) {
                    oldestChunkIndex = index;
                }
            });

            // If a chunk is past, recycle it
            if (oldestChunkIndex !== -1) {
                const oldest = this.chunks[oldestChunkIndex];
                
                // Spawn a new chunk at the end of the chain
                const lastChunk = this.chunks[this.chunks.length - 1];
                const newZ = lastChunk.zPosition + lastChunk.length;

                // Alternate: Spawning intersections (crossing chunks) every 3rd chunk
                // Or spawn random layout to make it varied.
                const shouldBeCrossing = (Math.random() > 0.65 && !lastChunk.isCrossing); // don't spawn two crossings in a row

                const newChunk = new CityChunk(this.scene, newZ, shouldBeCrossing, difficultyMultiplier);
                
                this.chunks.push(newChunk);

                // Destroy past chunk
                oldest.destroy(this.scene);
                this.chunks.splice(oldestChunkIndex, 1);
            }

            // 6. Perform collision resolution checks
            this.checkCollisions();

            // 7. Update camera tracking
            this.updateCamera(frameDt);
        } 
        else if (this.state === 'GAMEOVER') {
            // Still update physics gravity drop for player, and particles explosion
            this.particles.update(frameDt);
            if (this.player) {
                this.player.update(frameDt, this.timeElapsed, this.particles);
            }
            this.updateCamera(frameDt);
        }
    }
}

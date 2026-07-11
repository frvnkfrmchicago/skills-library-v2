import * as THREE from 'three';
import { GameController } from './game/Game';

class Application {
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private clock!: THREE.Clock;
    private game!: GameController;

    constructor() {
        this.initThree();
        this.initLights();
        this.initGame();
        this.initResizeListener();
        this.startLoop();
    }

    private initThree() {
        const container = document.getElementById('game-container')!;

        // 1. Scene with cyberpunk dark-blue background
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x05050d);

        // Exponential fog for synthwave sky merge
        this.scene.fog = new THREE.FogExp2(0x05050d, 0.007);

        // 2. Perspective Camera (60 deg field of view)
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            300.0
        );

        // 3. WebGL Renderer with optimized settings
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        // Cap pixel ratio at 2 for mobile/high-res desktop performance
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Shadow mapping configurations
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Mount canvas
        container.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();
    }

    private initLights() {
        // Ambient Light (deep indigo base)
        const ambientLight = new THREE.AmbientLight(0x0a0a22, 1.2);
        this.scene.add(ambientLight);

        // Directional Light (bright neon pink/purple overhead sun/moon)
        const dirLight = new THREE.DirectionalLight(0xff00aa, 1.6);
        dirLight.position.set(15, 30, 20);
        
        // Setup shadow parameters
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 100.0;
        
        // Ortho volume around play zone
        const d = 15;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        
        dirLight.shadow.bias = -0.0005; // reduce shadow acne
        
        this.scene.add(dirLight);

        // Subordinate blue fill light from the opposite side
        const fillLight = new THREE.DirectionalLight(0x00d2ff, 1.0);
        fillLight.position.set(-15, 10, -10);
        this.scene.add(fillLight);
    }

    private initGame() {
        // Create Game controller
        this.game = new GameController(this.scene, this.camera);
    }

    private initResizeListener() {
        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(width, height);
        });
    }

    private startLoop() {
        const loop = () => {
            requestAnimationFrame(loop);

            const dt = this.clock.getDelta();
            
            // Update game state, inputs, objects, and collisions
            this.game.update(dt);

            // Render scene
            this.renderer.render(this.scene, this.camera);
        };

        // Fire off rendering loop
        loop();
    }
}

// Start application when page is loaded
window.addEventListener('DOMContentLoaded', () => {
    new Application();
});

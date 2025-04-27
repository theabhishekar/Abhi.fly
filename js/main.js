class GameEngine {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true
        });

        this.world = new World(this.scene);
        this.physics = new PhysicsEngine();
        this.playerAircraft = null;
        this.instruments = new Instruments();
        this.multiplayer = new MultiplayerManager(this);
        this.ui = new UIManager(this);
        
        this.lastTime = 0;
        this.gameStarted = false;
        this.keys = {};
        this.cameraYaw = 0;
        this.cameraPitch = 0;
        this.isPointerLocked = false;
        this.throttle = 0;
        
        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.position.set(0, 10, -20);
        this.camera.lookAt(0, 0, 0);
        
        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Show menu
        this.ui.showMenu();
        
        // Start animation loop
        this.animate(0);
    }
    
    startGame(playerName) {
        // Spawn on runway: center (x=0), just above ground (y=groundY+2), at start of runway (z=-140)
        const groundY = -CONFIG.world.terrainHeight / 2;
        const initialPosition = new THREE.Vector3(0, groundY + 2, -140);
        const initialVelocity = new THREE.Vector3(0, 0, 0);
        this.playerAircraft = new Aircraft(null, playerName, initialPosition, initialVelocity);
        this.scene.add(this.playerAircraft.mesh);
        
        // Connect to multiplayer server
        this.multiplayer.connect(playerName);
        
        this.gameStarted = true;

        // Enable mouse look controls only after game starts
        this._mouseMoveHandler = (e) => this.handleMouseMove(e);
        this._mouseDownHandler = () => this.requestPointerLock();
        this._pointerLockHandler = () => this.onPointerLockChange();
        document.addEventListener('mousemove', this._mouseMoveHandler);
        document.addEventListener('mousedown', this._mouseDownHandler);
        document.addEventListener('pointerlockchange', this._pointerLockHandler);
    }
    
    handleKeyDown(event) {
        this.keys[event.key] = true;
        
        // Handle special keys
        if (event.key === ' ' && this.gameStarted) {
            this.fireWeapon();
        } else if (event.key === 'r' && this.gameStarted) {
            this.playerAircraft.reload();
        } else if (event.key === 'w' && this.gameStarted) {
            this.throttle = Math.min(1, this.throttle + 0.1); // Increase throttle
        } else if (event.key === 's' && this.gameStarted) {
            this.throttle = Math.max(0, this.throttle - 0.1); // Decrease throttle
        }
    }
    
    handleKeyUp(event) {
        this.keys[event.key] = false;
    }
    
    fireWeapon() {
        if (!this.gameStarted || !this.playerAircraft) return;
        
        const bullet = this.playerAircraft.fire();
        if (bullet) {
            this.world.addBullet(bullet);
            this.multiplayer.sendBulletFired(bullet);
        }
    }
    
    processInput() {
        if (!this.gameStarted || !this.playerAircraft) return;
        let pitch = 0;
        let roll = 0;
        if (this.keys['ArrowUp']) pitch = -0.05;      // Pitch up
        if (this.keys['ArrowDown']) pitch = 0.05;     // Pitch down
        if (this.keys['ArrowLeft']) roll = -0.05;
        if (this.keys['ArrowRight']) roll = 0.05;
        this.playerAircraft.setControls(pitch, 0, roll, this.throttle);
        this.playerAircraft.setThrust(this.throttle);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate(currentTime) {
        requestAnimationFrame((time) => this.animate(time));

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        if (this.gameStarted) {
            // Process input
            this.processInput();
            
            // Update player aircraft
            if (this.playerAircraft) {
                this.playerAircraft.update(deltaTime);
                this.instruments.update(this.playerAircraft);
                
                // Update camera to follow aircraft
                this.updateCamera();
                
                // Send player update to server
                this.multiplayer.sendUpdate(this.playerAircraft.position, this.playerAircraft.rotation);
            }
            
            // Update other players
            const otherPlayers = this.multiplayer.getPlayers();
            for (const player of otherPlayers) {
                player.update(deltaTime);
            }
            
            // Update bullets and check collisions
            this.world.updateBullets(deltaTime, [this.playerAircraft, ...otherPlayers]);
        }
        
        // Update world
        this.world.update();

        this.renderer.render(this.scene, this.camera);
    }
    
    updateCamera() {
        if (!this.playerAircraft) return;
        // Always behind the plane
        const offset = new THREE.Vector3(0, 5, -15);
        offset.applyEuler(this.playerAircraft.rotation);
        const targetPosition = this.playerAircraft.position.clone();
        const cameraPosition = targetPosition.clone().add(offset);
        this.camera.position.copy(cameraPosition);
        this.camera.lookAt(targetPosition);
        // Reset cameraYaw/cameraPitch to disable free look
        this.cameraYaw = 0;
        this.cameraPitch = 0;
    }
    
    sendChatMessage(message) {
        if (!this.gameStarted) return;
        this.multiplayer.sendChatMessage(message);
    }

    requestPointerLock() {
        const canvas = this.renderer.domElement;
        if (canvas.requestPointerLock) {
            canvas.requestPointerLock();
        }
    }

    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
    }

    handleMouseMove(event) {
        if (!this.isPointerLocked) return;
        const sensitivity = 0.002;
        this.cameraYaw -= event.movementX * sensitivity;
        this.cameraPitch -= event.movementY * sensitivity;
        // Clamp pitch to avoid flipping
        this.cameraPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.cameraPitch));

        // Mouse flight controls (yaw only)
        if (this.gameStarted && this.playerAircraft) {
            // Use mouse X for yaw only
            const flightSensitivity = 0.0025;
            this.playerAircraft.rotation.y -= event.movementX * flightSensitivity; // yaw only
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new GameEngine();
});
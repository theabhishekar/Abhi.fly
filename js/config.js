const CONFIG = {
    // Aircraft settings
    aircraft: {
        wingArea: 16,
        frontalArea: 4,
        maxThrust: 1000,
        maxSpeed: 300,
        turnRate: 45,
        climbRate: 10,
        health: 100,
        respawnTime: 5
    },
    
    // Physics settings
    physics: {
        gravity: 9.81,
        airDensity: 1.225,
        dragCoefficient: 0.02
    },
    
    // World settings
    world: {
        terrainSize: 10000,
        terrainHeight: 1000,
        cloudDensity: 0.5,
        treeCount: 300,
        buildingCount: 60
    },
    
    // Environment settings
    environment: {
        // Set to 'development' or 'production'
        mode: 'development',
        // Server URLs for different environments
        servers: {
            development: 'ws://localhost:8080',
            production: 'wss://your-public-server.com:8080' // Replace with your actual public server URL
        }
    },
    
    // Multiplayer settings
    multiplayer: {
        // This will be set dynamically based on environment
        serverUrl: null,
        updateRate: 20,
        interpolationDelay: 100
    },
    
    // UI settings
    ui: {
        crosshairColor: 0xffffff,
        hitMarkerColor: 0xff0000,
        hitMarkerDuration: 0.5
    },
    
    // Weapons settings
    weapons: {
        bulletSpeed: 200,
        bulletLifetime: 3,
        fireRate: 0.2,
        damage: 10,
        ammo: 100,
        reloadTime: 2
    }
};

// Set the server URL based on the current environment
CONFIG.multiplayer.serverUrl = CONFIG.environment.servers[CONFIG.environment.mode];

function updateCamera() {
    if (!this.playerAircraft) return;
    // Always behind the plane
    const offset = new THREE.Vector3(0, 5, -15);
    offset.applyEuler(this.playerAircraft.rotation);
    const targetPosition = this.playerAircraft.position.clone();
    const cameraPosition = targetPosition.clone().add(offset);
    this.camera.position.copy(cameraPosition);
    this.camera.lookAt(targetPosition);
    // Optionally, reset cameraYaw/cameraPitch if you want to disable free look
    this.cameraYaw = 0;
    this.cameraPitch = 0;
}
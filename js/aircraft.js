class Aircraft {
    constructor(playerId = null, playerName = "Player", initialPosition = null, initialVelocity = null) {
        this.playerId = playerId;
        this.playerName = playerName;
        // Default spawn: center of runway, slightly above ground
        this.position = initialPosition ? initialPosition.clone() : new THREE.Vector3(0, 5, -140);
        this.velocity = initialVelocity ? initialVelocity.clone() : new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.angleOfAttack = 0;
        this.thrust = 0;
        this.power = 0;
        this.wingArea = CONFIG.aircraft.wingArea;
        this.frontalArea = CONFIG.aircraft.frontalArea;
        this.initialSpeed = 0; // Start at rest on runway
        
        // Combat properties
        this.health = CONFIG.aircraft.health;
        this.maxHealth = CONFIG.aircraft.health;
        this.ammo = CONFIG.weapons.ammo;
        this.lastFireTime = 0;
        this.isReloading = false;
        this.reloadStartTime = 0;
        this.isDead = false;
        this.respawnTime = 0;
        
        this.createMesh();
        // Set initial velocity
        this.velocity.z = this.initialSpeed;
    }

    createMesh() {
        // Create a more detailed aircraft mesh
        const group = new THREE.Group();
        
        // Fuselage
        const fuselageGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
        const fuselageMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
        const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
        fuselage.rotation.x = Math.PI / 2;
        group.add(fuselage);
        
        // Wings
        const wingGeometry = new THREE.BoxGeometry(5, 0.1, 1);
        const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x606060 });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.y = 0;
        group.add(wings);
        
        // Tail
        const tailGeometry = new THREE.BoxGeometry(1, 0.5, 0.1);
        const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x606060 });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0, -1.5);
        group.add(tail);
        
        // Vertical stabilizer
        const vStabGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.5);
        const vStabMaterial = new THREE.MeshPhongMaterial({ color: 0x606060 });
        const vStab = new THREE.Mesh(vStabGeometry, vStabMaterial);
        vStab.position.set(0, 0.25, -1.5);
        group.add(vStab);
        
        this.mesh = group;
        this.updateMesh();
    }

    setControls(pitch, yaw, roll, throttle) {
        if (this.isDead) return;
        
        // Update rotation with smoother control
        this.rotation.x += pitch * 0.05;
        this.rotation.y += yaw * 0.05;
        this.rotation.z += roll * 0.05;
        
        // Update thrust
        this.thrust = Math.max(0, Math.min(1, throttle));
        this.power = this.thrust * CONFIG.aircraft.maxThrust;
    }

    setThrust(value) {
        if (this.isDead) return;
        
        this.thrust = Math.max(0, Math.min(1, this.thrust + value * 0.1));
        this.power = this.thrust * CONFIG.aircraft.maxThrust;
    }
    
    fire() {
        if (this.isDead || this.isReloading || this.ammo <= 0) return null;
        
        const currentTime = performance.now() / 1000;
        if (currentTime - this.lastFireTime < CONFIG.weapons.fireRate) return null;
        
        this.lastFireTime = currentTime;
        this.ammo--;
        
        // Calculate bullet direction based on aircraft rotation
        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyEuler(this.rotation);
        
        // Create bullet at aircraft position
        const bulletPosition = this.position.clone();
        bulletPosition.add(direction.clone().multiplyScalar(2)); // Offset from aircraft
        
        return new Bullet(bulletPosition, direction, this.playerId);
    }
    
    reload() {
        if (this.isDead || this.isReloading || this.ammo === CONFIG.weapons.ammo) return;
        
        this.isReloading = true;
        this.reloadStartTime = performance.now() / 1000;
        
        // Reload will complete after CONFIG.weapons.reloadTime seconds
        setTimeout(() => {
            this.ammo = CONFIG.weapons.ammo;
            this.isReloading = false;
        }, CONFIG.weapons.reloadTime * 1000);
    }
    
    takeDamage(amount) {
        if (this.isDead) return;
        
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        this.isDead = true;
        this.health = 0;
        this.respawnTime = performance.now() / 1000 + CONFIG.aircraft.respawnTime;
        
        // Hide aircraft
        this.mesh.visible = false;
    }
    
    respawn() {
        if (!this.isDead) return;
        
        const currentTime = performance.now() / 1000;
        if (currentTime < this.respawnTime) return;
        
        // Reset aircraft state
        this.isDead = false;
        this.health = this.maxHealth;
        this.position = new THREE.Vector3(
            (Math.random() - 0.5) * 1000,
            1000,
            (Math.random() - 0.5) * 1000
        );
        this.velocity = new THREE.Vector3(0, 0, this.initialSpeed);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.thrust = 0;
        this.power = 0;
        this.ammo = CONFIG.weapons.ammo;
        
        // Show aircraft
        this.mesh.visible = true;
        this.updateMesh();
    }

    update(deltaTime) {
        if (this.isDead) {
            this.respawn();
            return;
        }
        
        // Calculate forward direction based on rotation
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyEuler(this.rotation);
        
        // Update velocity based on thrust and drag
        const speed = this.velocity.length();
        const drag = speed * speed * 0.01; // Simple drag model
        
        // Apply thrust in forward direction
        this.velocity.add(forward.multiplyScalar(this.power * deltaTime));
        
        // Apply drag
        this.velocity.multiplyScalar(1 - drag * deltaTime);
        
        // Apply gravity
        this.velocity.y -= 9.81 * deltaTime;
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Calculate angle of attack
        const velocityDirection = this.velocity.clone().normalize();
        const forwardDirection = new THREE.Vector3(0, 0, 1).applyEuler(this.rotation);
        this.angleOfAttack = velocityDirection.angleTo(forwardDirection);
        
        // Update mesh
        this.updateMesh();

        // --- Ground collision logic ---
        const groundY = -CONFIG.world.terrainHeight / 2;
        if (this.position.y <= groundY + 2) { // 2 is the wheel height or clearance
            this.position.y = groundY + 2;
            if (this.velocity.y < 0) this.velocity.y = 0;
        }
    }

    updateMesh() {
        this.mesh.position.copy(this.position);
        this.mesh.rotation.copy(this.rotation);
    }
}
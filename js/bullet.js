class Bullet {
    constructor(position, direction, playerId) {
        this.position = position.clone();
        this.direction = direction.clone().normalize();
        this.playerId = playerId;
        this.speed = CONFIG.weapons.bulletSpeed;
        this.lifetime = CONFIG.weapons.bulletLifetime;
        this.damage = CONFIG.weapons.damage;
        this.alive = true;
        
        this.createMesh();
    }
    
    createMesh() {
        // Create a simple bullet mesh
        const geometry = new THREE.SphereGeometry(0.2, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
    }
    
    update(deltaTime) {
        if (!this.alive) return;
        
        // Update position based on direction and speed
        this.position.add(this.direction.clone().multiplyScalar(this.speed * deltaTime));
        this.mesh.position.copy(this.position);
        
        // Decrease lifetime
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.alive = false;
        }
    }
    
    checkCollision(object) {
        if (!this.alive) return false;
        
        // Simple distance-based collision detection
        const distance = this.position.distanceTo(object.position);
        return distance < 1.0; // Collision threshold
    }
    
    destroy() {
        this.alive = false;
    }
} 
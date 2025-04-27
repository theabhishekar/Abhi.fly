class World {
    constructor(scene) {
        this.scene = scene;
        this.trees = [];
        this.buildings = [];
        this.bullets = [];
        
        this.createTerrain();
        this.createSky();
        this.createLighting();
        this.createTrees();
        this.createBuildings();
    }

    createTerrain() {
        // Create a simple terrain using a plane
        const geometry = new THREE.PlaneGeometry(
            CONFIG.world.terrainSize,
            CONFIG.world.terrainSize,
            100,
            100
        );
        geometry.rotateX(-Math.PI / 2);
        
        // Create a simple texture
        const material = new THREE.MeshPhongMaterial({
            color: 0x3a7d44,
            side: THREE.DoubleSide
        });
        
        this.terrain = new THREE.Mesh(geometry, material);
        this.terrain.position.y = -CONFIG.world.terrainHeight / 2;
        this.scene.add(this.terrain);

        // Add a runway (long, dark rectangle)
        const runwayWidth = 20;
        const runwayLength = 300;
        const runwayGeometry = new THREE.PlaneGeometry(runwayWidth, runwayLength);
        const runwayMaterial = new THREE.MeshPhongMaterial({
            color: 0x222222,
            side: THREE.DoubleSide
        });
        this.runway = new THREE.Mesh(runwayGeometry, runwayMaterial);
        this.runway.rotation.x = -Math.PI / 2;
        this.runway.position.set(0, this.terrain.position.y + 0.01, 0); // Slightly above terrain
        this.scene.add(this.runway);
    }

    createSky() {
        // Create a skybox
        const geometry = new THREE.BoxGeometry(10000, 10000, 10000);
        const material = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide
        });
        
        this.sky = new THREE.Mesh(geometry, material);
        this.scene.add(this.sky);
    }

    createLighting() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(100, 100, 100);
        sunLight.castShadow = true;
        this.scene.add(sunLight);
    }

    createTree(x, z) {
        const treeGroup = new THREE.Group();

        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x4A2B0F });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        treeGroup.add(trunk);

        // Tree top
        const topGeometry = new THREE.ConeGeometry(2, 4, 8);
        const topMaterial = new THREE.MeshPhongMaterial({ color: 0x0F4A2B });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 5;
        treeGroup.add(top);

        treeGroup.position.set(x, 0, z);
        return treeGroup;
    }

    createTrees() {
        for (let i = 0; i < CONFIG.world.treeCount; i++) {
            const x = (Math.random() - 0.5) * CONFIG.world.terrainSize * 0.8;
            const z = (Math.random() - 0.5) * CONFIG.world.terrainSize * 0.8;
            const tree = this.createTree(x, z);
            this.scene.add(tree);
            this.trees.push(tree);
        }
    }

    createBuilding(x, z) {
        const height = 5 + Math.random() * 15;
        const width = 5 + Math.random() * 10;
        const depth = 5 + Math.random() * 10;

        // Random pastel color
        const color = new THREE.Color(`hsl(${Math.floor(Math.random()*360)}, 60%, 70%)`);
        const buildingMaterial = new THREE.MeshPhongMaterial({ color: color });
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);

        building.position.set(x, height/2, z);
        return building;
    }

    createBuildings() {
        for (let i = 0; i < CONFIG.world.buildingCount; i++) {
            const x = (Math.random() - 0.5) * CONFIG.world.terrainSize * 0.8;
            const z = (Math.random() - 0.5) * CONFIG.world.terrainSize * 0.8;
            const building = this.createBuilding(x, z);
            this.scene.add(building);
            this.buildings.push(building);
        }
    }
    
    addBullet(bullet) {
        this.bullets.push(bullet);
        this.scene.add(bullet.mesh);
    }
    
    updateBullets(deltaTime, aircrafts) {
        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(deltaTime);
            
            // Check for collisions with aircraft
            for (const aircraft of aircrafts) {
                if (aircraft.playerId !== bullet.playerId && bullet.checkCollision(aircraft)) {
                    aircraft.takeDamage(bullet.damage);
                    bullet.destroy();
                    break;
                }
            }
            
            // Check for collisions with trees and buildings
            for (const tree of this.trees) {
                if (bullet.checkCollision(tree)) {
                    bullet.destroy();
                    break;
                }
            }
            
            for (const building of this.buildings) {
                if (bullet.checkCollision(building)) {
                    bullet.destroy();
                    break;
                }
            }
            
            // Remove dead bullets
            if (!bullet.alive) {
                this.scene.remove(bullet.mesh);
                this.bullets.splice(i, 1);
            }
        }
    }

    update() {
        // Update any dynamic world elements here
        // For example, cloud movement, day/night cycle, etc.
    }
}
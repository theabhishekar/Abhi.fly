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

        // Tree trunk - more detailed with slight taper
        const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.6, 5, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4A2B0F,
            roughness: 0.8,
            metalness: 0.2
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2.5;
        treeGroup.add(trunk);

        // Add some branches
        const branchCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < branchCount; i++) {
            const branchHeight = 1 + Math.random() * 1.5;
            const branchRadius = 0.2 + Math.random() * 0.2;
            const branchGeometry = new THREE.CylinderGeometry(branchRadius, branchRadius, branchHeight, 6);
            const branchMaterial = new THREE.MeshPhongMaterial({ color: 0x3A1B0F });
            const branch = new THREE.Mesh(branchGeometry, branchMaterial);
            
            // Position branch at different heights and angles
            const angle = (i / branchCount) * Math.PI * 2;
            const height = 3 + Math.random() * 2;
            branch.position.set(
                Math.cos(angle) * 0.8,
                height,
                Math.sin(angle) * 0.8
            );
            branch.rotation.z = Math.PI / 2;
            branch.rotation.y = angle;
            treeGroup.add(branch);
        }

        // Tree foliage - multiple layers for more realism
        const foliageLayers = 3;
        for (let i = 0; i < foliageLayers; i++) {
            const scale = 1 - (i * 0.2);
            const height = 1.5;
            const yOffset = 4 + (i * 1.2);
            
            // Create a more natural-looking foliage shape
            const foliageGeometry = new THREE.ConeGeometry(2 * scale, height, 8);
            const foliageMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color(`hsl(${120 + Math.random() * 20}, 70%, ${30 + Math.random() * 10}%)`),
                flatShading: true
            });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = yOffset;
            treeGroup.add(foliage);
        }

        // Add some small details like pine cones
        const coneCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < coneCount; i++) {
            const coneGeometry = new THREE.ConeGeometry(0.2, 0.4, 6);
            const coneMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            const cone = new THREE.Mesh(coneGeometry, coneMaterial);
            
            // Position cones on the trunk
            const angle = (i / coneCount) * Math.PI * 2;
            const height = 2 + Math.random() * 3;
            cone.position.set(
                Math.cos(angle) * 0.6,
                height,
                Math.sin(angle) * 0.6
            );
            cone.rotation.x = Math.PI / 2;
            cone.rotation.z = angle;
            treeGroup.add(cone);
        }

        // Position the tree on the terrain
        treeGroup.position.set(x, 0, z);
        
        // Add some random rotation for variety
        treeGroup.rotation.y = Math.random() * Math.PI * 2;
        
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
        const buildingGroup = new THREE.Group();
        
        // Main building dimensions
        const height = 5 + Math.random() * 15;
        const width = 5 + Math.random() * 10;
        const depth = 5 + Math.random() * 10;

        // Create main building structure
        const buildingMaterial = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color(`hsl(${Math.floor(Math.random()*360)}, 30%, 60%)`),
            roughness: 0.7,
            metalness: 0.2
        });
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.y = height/2;
        buildingGroup.add(building);

        // Add windows
        const windowMaterial = new THREE.MeshPhongMaterial({
            color: 0xADD8E6,
            emissive: 0x111111,
            transparent: true,
            opacity: 0.8
        });

        // Add windows to front and back
        const windowRows = Math.floor(height / 3);
        const windowCols = Math.floor(width / 2);
        
        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                const windowGeometry = new THREE.PlaneGeometry(1, 1);
                
                // Front window
                const frontWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                frontWindow.position.set(
                    (col * 2) - (width/2) + 1,
                    (row * 3) - (height/2) + 2,
                    depth/2 + 0.1
                );
                buildingGroup.add(frontWindow);
                
                // Back window
                const backWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                backWindow.position.set(
                    (col * 2) - (width/2) + 1,
                    (row * 3) - (height/2) + 2,
                    -depth/2 - 0.1
                );
                backWindow.rotation.y = Math.PI;
                buildingGroup.add(backWindow);
            }
        }

        // Add a roof
        const roofGeometry = new THREE.ConeGeometry(Math.max(width, depth) / 1.5, height/4, 4);
        const roofMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B0000,
            roughness: 0.8
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = height + height/8;
        roof.rotation.y = Math.PI/4;
        buildingGroup.add(roof);

        // Position the building
        buildingGroup.position.set(x, 0, z);
        
        return buildingGroup;
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
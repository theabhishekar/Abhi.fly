class Instruments {
    constructor() {
        this.airspeedElement = document.getElementById('airspeed');
        this.attitudeElement = document.getElementById('attitude');
        this.altimeterElement = document.getElementById('altimeter');
        this.headingElement = document.getElementById('heading');
        this.verticalSpeedElement = document.getElementById('vertical-speed');
        this.ammoElement = document.getElementById('ammo');
    }

    update(aircraft) {
        this.updateAirspeed(aircraft.velocity.length());
        this.updateAttitude(aircraft.rotation);
        this.updateAltimeter(aircraft.position.y);
        this.updateHeading(aircraft.rotation.y);
        this.updateVerticalSpeed(aircraft.velocity.y);
        this.updateAmmo(aircraft.ammo, aircraft.isReloading);
        this.updateHealth(aircraft.health, aircraft.maxHealth);
    }

    updateAirspeed(speed) {
        const speedKnots = Math.round(speed * 1.94384); // Convert m/s to knots
        this.airspeedElement.textContent = `${speedKnots} kts`;
    }

    updateAttitude(rotation) {
        const pitchDegrees = THREE.MathUtils.radToDeg(rotation.x);
        const rollDegrees = THREE.MathUtils.radToDeg(rotation.z);
        this.attitudeElement.style.transform = `rotate(${rollDegrees}deg)`;
        this.attitudeElement.textContent = `Pitch: ${Math.round(pitchDegrees)}°`;
    }

    updateAltimeter(altitude) {
        const altitudeFeet = Math.round(altitude * 3.28084); // Convert meters to feet
        this.altimeterElement.textContent = `${altitudeFeet} ft`;
    }

    updateHeading(heading) {
        const headingDegrees = THREE.MathUtils.radToDeg(heading);
        this.headingElement.textContent = `HDG: ${Math.round(headingDegrees)}°`;
    }

    updateVerticalSpeed(verticalSpeed) {
        const verticalSpeedFpm = Math.round(verticalSpeed * 196.85); // Convert m/s to feet per minute
        this.verticalSpeedElement.textContent = `${verticalSpeedFpm} fpm`;
    }
    
    updateAmmo(ammo, isReloading) {
        if (isReloading) {
            this.ammoElement.textContent = "Reloading...";
            this.ammoElement.style.color = "#ff9900";
        } else {
            this.ammoElement.textContent = `Ammo: ${ammo}`;
            this.ammoElement.style.color = ammo > 20 ? "#ffffff" : "#ff0000";
        }
    }
    
    updateHealth(health, maxHealth) {
        const healthPercent = Math.round((health / maxHealth) * 100);
        const healthBar = document.createElement('div');
        healthBar.style.width = `${healthPercent}%`;
        healthBar.style.height = '5px';
        healthBar.style.backgroundColor = this.getHealthColor(healthPercent);
        healthBar.style.position = 'absolute';
        healthBar.style.bottom = '0';
        healthBar.style.left = '0';
        
        // Update player info with health
        const playerInfo = document.getElementById('player-info');
        playerInfo.innerHTML = `Health: ${healthPercent}%`;
        playerInfo.appendChild(healthBar);
    }
    
    getHealthColor(percent) {
        if (percent > 70) return '#00ff00';
        if (percent > 30) return '#ffff00';
        return '#ff0000';
    }
}
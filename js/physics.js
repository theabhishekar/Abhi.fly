class PhysicsEngine {
    constructor() {
        this.gravity = CONFIG.physics.gravity;
        this.airDensity = CONFIG.physics.airDensity;
        this.dragCoefficient = CONFIG.physics.dragCoefficient;
    }

    calculateLift(velocity, wingArea, angleOfAttack) {
        const liftCoefficient = 2 * Math.PI * angleOfAttack;
        return 0.5 * this.airDensity * velocity * velocity * wingArea * liftCoefficient;
    }

    calculateDrag(velocity, frontalArea) {
        return 0.5 * this.airDensity * velocity * velocity * frontalArea * this.dragCoefficient;
    }

    calculateThrust(power, velocity) {
        return power / Math.max(velocity, 1);
    }

    update(aircraft, deltaTime) {
        // Apply forces
        const lift = this.calculateLift(aircraft.velocity, aircraft.wingArea, aircraft.angleOfAttack);
        const drag = this.calculateDrag(aircraft.velocity, aircraft.frontalArea);
        const thrust = this.calculateThrust(aircraft.power, aircraft.velocity);
        
        // Update aircraft state
        aircraft.altitude += aircraft.verticalSpeed * deltaTime;
        aircraft.velocity += (thrust - drag) * deltaTime;
        aircraft.verticalSpeed += (lift - this.gravity) * deltaTime;
    }
}
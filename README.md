# 3D Plane Combat Simulator

A multiplayer 3D plane combat simulator built with Three.js and WebSockets.

## Features

- 3D aircraft physics simulation
- Multiplayer combat
- Real-time player synchronization
- Chat system
- Score tracking

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Local Development

1. Clone the repository:
   ```
   git clone <repository-url>
   cd 3d-plane-combat-simulator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

### Configuration

The game can be configured for different environments:

- **Development Mode**: Edit `js/config.js` and set `environment.mode` to `'development'`
- **Production Mode**: Edit `js/config.js` and set `environment.mode` to `'production'`

Make sure to update the server URLs in the configuration file:

```javascript
environment: {
    mode: 'development', // or 'production'
    servers: {
        development: 'ws://localhost:8080',
        production: 'wss://your-public-server.com:8080' // Replace with your actual public server URL
    }
}
```

## Deployment to Production

### Option 1: Deploy to a VPS (Virtual Private Server)

1. Set up a VPS with a provider like DigitalOcean, AWS, or Linode
2. Install Node.js on the server
3. Upload your game files to the server
4. Install dependencies: `npm install`
5. Start the server: `npm start`
6. Set up a reverse proxy with Nginx or Apache to handle HTTPS
7. Update the production server URL in `js/config.js`

### Option 2: Deploy to a Platform as a Service (PaaS)

1. Create an account with a PaaS provider like Heroku, Render, or Railway
2. Connect your repository
3. Configure the environment variables (if needed)
4. Deploy the application
5. Update the production server URL in `js/config.js`

## Game Controls

- W/S - Throttle Up/Down
- A/D - Yaw Left/Right
- Arrow Keys - Pitch/Roll
- Space - Shoot
- R - Respawn

## License

[MIT License](LICENSE) 
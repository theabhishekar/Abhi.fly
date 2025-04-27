const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create HTTP server to serve static files
const server = http.createServer((req, res) => {
    // Serve index.html for the root path
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }
    
    // Serve other static files
    const filePath = path.join(__dirname, req.url);
    const extname = path.extname(filePath);
    
    // Set content type based on file extension
    let contentType = 'text/plain';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected players
const players = new Map();
let nextPlayerId = 1;

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    // Assign a player ID
    const playerId = nextPlayerId++;
    
    // Send player ID to the client
    ws.send(JSON.stringify({
        type: 'player_id',
        playerId: playerId
    }));
    
    // Handle messages from the client
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'player_join':
                    // Store player info
                    players.set(playerId, {
                        ws,
                        name: data.name,
                        position: data.position || { x: 0, y: 0, z: 0 },
                        rotation: data.rotation || { x: 0, y: 0, z: 0 }
                    });
                    
                    // Broadcast to all clients that a new player joined
                    broadcastToAll({
                        type: 'player_joined',
                        playerId,
                        name: data.name,
                        position: data.position
                    }, ws);
                    
                    // Send current players list to the new player
                    const playersList = Array.from(players.entries()).map(([id, player]) => ({
                        playerId: id,
                        name: player.name,
                        position: player.position
                    }));
                    
                    ws.send(JSON.stringify({
                        type: 'players_list',
                        players: playersList
                    }));
                    break;
                    
                case 'update':
                    // Update player position and rotation
                    if (players.has(playerId)) {
                        const player = players.get(playerId);
                        player.position = data.position;
                        player.rotation = data.rotation;
                        
                        // Broadcast update to all other clients
                        broadcastToAll({
                            type: 'player_update',
                            playerId,
                            position: data.position,
                            rotation: data.rotation
                        }, ws);
                    }
                    break;
                    
                case 'bullet_fired':
                    // Broadcast bullet fired event to all other clients
                    broadcastToAll({
                        type: 'bullet_fired',
                        playerId,
                        position: data.position,
                        direction: data.direction
                    }, ws);
                    break;
                    
                case 'player_damaged':
                    // Broadcast player damaged event
                    broadcastToAll({
                        type: 'player_damaged',
                        playerId,
                        targetId: data.targetId
                    });
                    break;
                    
                case 'player_killed':
                    // Broadcast player killed event
                    broadcastToAll({
                        type: 'player_killed',
                        playerId,
                        targetId: data.targetId,
                        killerId: data.killerId
                    });
                    break;
                    
                case 'chat_message':
                    // Broadcast chat message to all clients
                    broadcastToAll({
                        type: 'chat_message',
                        playerId,
                        playerName: players.get(playerId)?.name || 'Unknown',
                        message: data.message
                    });
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
        console.log(`Player ${playerId} disconnected`);
        
        // Remove player from the list
        if (players.has(playerId)) {
            players.delete(playerId);
            
            // Broadcast to all clients that a player left
            broadcastToAll({
                type: 'player_left',
                playerId
            });
        }
    });
});

// Helper function to broadcast a message to all connected clients
function broadcastToAll(message, excludeWs = null) {
    const messageStr = JSON.stringify(message);
    
    wss.clients.forEach((client) => {
        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server is ready for connections`);
}); 
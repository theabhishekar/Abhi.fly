class MultiplayerManager {
    constructor(game) {
        this.game = game;
        this.players = new Map();
        this.playerId = null;
        this.playerName = "Player";
        this.score = 0;
        this.socket = null;
        this.connected = false;
    }

    connect(playerName) {
        this.playerName = playerName;
        
        // In a real implementation, replace with your WebSocket server URL
        this.socket = new WebSocket(CONFIG.multiplayer.serverUrl);
        
        this.socket.onopen = () => {
            console.log('Connected to game server');
            this.connected = true;
            
            // Send player info to server
            this.sendMessage({
                type: 'player_join',
                name: this.playerName
            });
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.socket.onclose = () => {
            console.log('Disconnected from game server');
            this.connected = false;
        };
    }

    handleMessage(data) {
        switch(data.type) {
            case 'player_id':
                this.playerId = data.playerId;
                break;
                
            case 'player_joined':
                this.addPlayer(data.playerId, data.name, data.position);
                break;
                
            case 'player_left':
                this.removePlayer(data.playerId);
                break;
                
            case 'player_update':
                this.updatePlayer(data.playerId, data.position, data.rotation);
                break;
                
            case 'player_damaged':
                if (data.playerId === this.playerId) {
                    this.game.ui.showHitMarker();
                }
                break;
                
            case 'player_killed':
                if (data.playerId === this.playerId) {
                    this.game.ui.showDeathMessage();
                } else if (data.killerId === this.playerId) {
                    this.score += 10;
                    this.game.ui.updateScore(this.score);
                }
                break;
                
            case 'chat_message':
                this.game.ui.addChatMessage(data.playerName, data.message);
                break;
                
            case 'players_list':
                this.updatePlayersList(data.players);
                break;
                
            case 'bullet_fired':
                if (data.playerId !== this.playerId) {
                    this.handleRemoteBullet(data);
                }
                break;
        }
    }

    addPlayer(playerId, name, position) {
        if (playerId === this.playerId) return;
        
        const aircraft = new Aircraft(playerId, name);
        aircraft.position.copy(position);
        this.players.set(playerId, aircraft);
        this.game.scene.add(aircraft.mesh);
    }

    removePlayer(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            this.game.scene.remove(player.mesh);
            this.players.delete(playerId);
        }
    }

    updatePlayer(playerId, position, rotation) {
        const player = this.players.get(playerId);
        if (player) {
            player.position.copy(position);
            player.rotation.copy(rotation);
        }
    }
    
    handleRemoteBullet(data) {
        const bullet = new Bullet(
            new THREE.Vector3().fromArray(data.position),
            new THREE.Vector3().fromArray(data.direction),
            data.playerId
        );
        this.game.world.addBullet(bullet);
    }

    sendUpdate(position, rotation) {
        if (!this.connected) return;
        
        this.sendMessage({
            type: 'update',
            position: [position.x, position.y, position.z],
            rotation: [rotation.x, rotation.y, rotation.z]
        });
    }
    
    sendBulletFired(bullet) {
        if (!this.connected) return;
        
        this.sendMessage({
            type: 'bullet_fired',
            position: [bullet.position.x, bullet.position.y, bullet.position.z],
            direction: [bullet.direction.x, bullet.direction.y, bullet.direction.z]
        });
    }
    
    sendPlayerDamaged(targetId) {
        if (!this.connected) return;
        
        this.sendMessage({
            type: 'player_damaged',
            targetId: targetId
        });
    }
    
    sendPlayerKilled(targetId) {
        if (!this.connected) return;
        
        this.sendMessage({
            type: 'player_killed',
            targetId: targetId,
            killerId: this.playerId
        });
    }
    
    sendChatMessage(message) {
        if (!this.connected) return;
        
        this.sendMessage({
            type: 'chat_message',
            message: message
        });
    }
    
    sendMessage(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }
    
    updatePlayersList(players) {
        const playersList = players.map(player => ({
            id: player.id,
            name: player.name,
            score: player.score
        }));
        
        this.game.ui.updatePlayersList(playersList);
    }
    
    getPlayers() {
        return Array.from(this.players.values());
    }
}
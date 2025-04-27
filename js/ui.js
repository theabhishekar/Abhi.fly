class UIManager {
    constructor(game) {
        this.game = game;
        this.menuOverlay = document.getElementById('menu-overlay');
        this.playerNameInput = document.getElementById('player-name');
        this.startGameButton = document.getElementById('start-game');
        this.scoreElement = document.getElementById('score');
        this.chatContainer = document.getElementById('chat-container');
        this.playersList = document.getElementById('players-list');
        this.crosshair = this.createCrosshair();
        
        this.setupEventListeners();
    }
    
    createCrosshair() {
        const crosshair = document.createElement('div');
        crosshair.id = 'crosshair';
        document.body.appendChild(crosshair);
        return crosshair;
    }
    
    setupEventListeners() {
        this.startGameButton.addEventListener('click', () => {
            const playerName = this.playerNameInput.value.trim() || 'Player';
            this.game.startGame(playerName);
            this.hideMenu();
        });
        
        // Chat input
        const chatInput = document.createElement('input');
        chatInput.type = 'text';
        chatInput.placeholder = 'Type a message...';
        chatInput.style.width = '100%';
        chatInput.style.padding = '5px';
        chatInput.style.marginTop = '5px';
        chatInput.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        chatInput.style.color = '#fff';
        chatInput.style.border = '1px solid #444';
        chatInput.style.borderRadius = '3px';
        
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && chatInput.value.trim()) {
                this.game.sendChatMessage(chatInput.value.trim());
                chatInput.value = '';
            }
        });
        
        this.chatContainer.appendChild(chatInput);
    }
    
    showMenu() {
        this.menuOverlay.style.display = 'flex';
    }
    
    hideMenu() {
        this.menuOverlay.style.display = 'none';
    }
    
    updateScore(score) {
        this.scoreElement.textContent = `Score: ${score}`;
    }
    
    addChatMessage(playerName, message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${playerName}: ${message}`;
        messageElement.style.marginBottom = '5px';
        this.chatContainer.insertBefore(messageElement, this.chatContainer.firstChild);
        
        // Limit chat history
        if (this.chatContainer.children.length > 50) {
            this.chatContainer.removeChild(this.chatContainer.lastChild);
        }
    }
    
    updatePlayersList(players) {
        this.playersList.innerHTML = '<h3>Players</h3>';
        
        players.forEach(player => {
            const playerElement = document.createElement('div');
            playerElement.textContent = `${player.name} - ${player.score} pts`;
            playerElement.style.marginBottom = '5px';
            this.playersList.appendChild(playerElement);
        });
    }
    
    showHitMarker() {
        const hitMarker = document.createElement('div');
        hitMarker.style.position = 'absolute';
        hitMarker.style.top = '50%';
        hitMarker.style.left = '50%';
        hitMarker.style.transform = 'translate(-50%, -50%)';
        hitMarker.style.width = '20px';
        hitMarker.style.height = '20px';
        hitMarker.style.border = '2px solid red';
        hitMarker.style.borderRadius = '50%';
        hitMarker.style.pointerEvents = 'none';
        hitMarker.style.opacity = '0.8';
        hitMarker.style.transition = 'opacity 0.3s';
        
        document.body.appendChild(hitMarker);
        
        setTimeout(() => {
            hitMarker.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(hitMarker);
            }, 300);
        }, 100);
    }
    
    showDeathMessage() {
        const deathMessage = document.createElement('div');
        deathMessage.textContent = 'YOU DIED';
        deathMessage.style.position = 'absolute';
        deathMessage.style.top = '50%';
        deathMessage.style.left = '50%';
        deathMessage.style.transform = 'translate(-50%, -50%)';
        deathMessage.style.color = 'red';
        deathMessage.style.fontSize = '48px';
        deathMessage.style.fontWeight = 'bold';
        deathMessage.style.textShadow = '0 0 10px rgba(255, 0, 0, 0.7)';
        deathMessage.style.pointerEvents = 'none';
        
        document.body.appendChild(deathMessage);
        
        setTimeout(() => {
            deathMessage.style.opacity = '0';
            deathMessage.style.transition = 'opacity 1s';
            setTimeout(() => {
                document.body.removeChild(deathMessage);
            }, 1000);
        }, 2000);
    }
} 
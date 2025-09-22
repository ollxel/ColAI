export class MafiaGameManager {
    constructor() {
        this.players = [];
        this.roles = [];
        this.playerCount = 4; // Default value
        this.mafiaCount = 1;  // Default value
        this.doctorCount = 0; // Default doctor count
        this.sheriffCount = 0; // Default sheriff count
        this.detectiveCount = 0; // Default detective count
        this.dayCount = 0;
        this.gameState = 'setup'; // setup, day, night, voting, finished
        this.eliminatedPlayers = [];
        this.nightActions = [];
        this.votes = {};
        this.gameLog = [];
        this.discussionRounds = 1; // Default discussion rounds
        this.healedPlayerId = null; // Track who was healed by doctor
        this.investigationResults = {}; // Store sheriff investigation results
        
        // Player colors for the UI
        this.playerColors = [
            '#3a86ff', '#8338ec', '#ff9e00', '#06d6a0', 
            '#ef476f', '#118ab2', '#ffd166', '#e63946'
        ];
    }
    
    setupGame(playerCount, mafiaCount = null, doctorCount = 0, sheriffCount = 0, detectiveCount = 0) {
        this.playerCount = playerCount;
        this.players = [];
        this.roles = [];
        this.eliminatedPlayers = [];
        this.gameLog = [];
        this.dayCount = 0;
        this.gameState = 'setup';
        this.votes = {};
        this.nightActions = [];
        this.healedPlayerId = null;
        this.investigationResults = {};
        
        // Calculate mafia count based on player count if not specified
        if (mafiaCount === null) {
            if (playerCount <= 4) {
                this.mafiaCount = 1;
            } else if (playerCount <= 7) {
                this.mafiaCount = 2;
            } else {
                this.mafiaCount = 3;
            }
        } else {
            // Ensure mafia count is valid
            this.mafiaCount = Math.min(Math.floor(playerCount / 2), Math.max(1, mafiaCount));
        }
        
        // Set special role counts
        this.doctorCount = doctorCount;
        this.sheriffCount = sheriffCount;
        this.detectiveCount = detectiveCount;
        
        // Ensure special roles don't exceed available civilian spots
        const maxSpecialRoles = playerCount - this.mafiaCount - 1; // At least one regular civilian
        let totalSpecialRoles = doctorCount + sheriffCount + detectiveCount;
        
        if (totalSpecialRoles > maxSpecialRoles) {
            // Proportionally adjust all special roles
            const reduction = maxSpecialRoles / totalSpecialRoles;
            this.doctorCount = Math.floor(doctorCount * reduction);
            this.sheriffCount = Math.floor(sheriffCount * reduction);
            this.detectiveCount = Math.floor(detectiveCount * reduction);
            
            // Ensure at least one of each requested role if possible
            totalSpecialRoles = this.doctorCount + this.sheriffCount + this.detectiveCount;
            if (totalSpecialRoles < maxSpecialRoles) {
                const remaining = maxSpecialRoles - totalSpecialRoles;
                if (doctorCount > 0 && this.doctorCount === 0) this.doctorCount = 1;
                else if (sheriffCount > 0 && this.sheriffCount === 0) this.sheriffCount = 1;
                else if (detectiveCount > 0 && this.detectiveCount === 0) this.detectiveCount = 1;
            }
        }
        
        // Add custom network names for more diversity
        const networkPrefixes = [
            "Analytical", "Creative", "Technical", "Logical", 
            "Intuitive", "Systematic", "Strategic", "Tactical",
            "Visionary", "Critical", "Rational", "Innovative",
            "Pragmatic", "Emotional", "Adaptive", "Collaborative"
        ];
        
        for (let i = 0; i < playerCount; i++) {
            this.players.push({
                id: `player${i+1}`,
                name: `${networkPrefixes[i % networkPrefixes.length]} Network`,
                alive: true,
                color: this.playerColors[i % this.playerColors.length]
            });
        }
        
        // Assign roles
        this.assignRoles();
        
        return {
            playerCount: this.playerCount,
            mafiaCount: this.mafiaCount,
            doctorCount: this.doctorCount,
            sheriffCount: this.sheriffCount,
            detectiveCount: this.detectiveCount,
            civilianCount: this.playerCount - this.mafiaCount - this.doctorCount - this.sheriffCount - this.detectiveCount,
            players: this.players.map(p => ({id: p.id, name: p.name, alive: p.alive, color: p.color}))
        };
    }
    
    assignRoles() {
        // Create array with roles
        
        // Add mafia roles
        const roles = [];
        for (let i = 0; i < this.mafiaCount; i++) {
            roles.push('mafia');
        }
        
        // Add special roles
        for (let i = 0; i < this.doctorCount; i++) {
            roles.push('doctor');
        }
        
        for (let i = 0; i < this.sheriffCount; i++) {
            roles.push('sheriff');
        }
        
        for (let i = 0; i < this.detectiveCount; i++) {
            roles.push('detective');
        }
        
        // Add remaining civilian roles
        const regularCivilians = this.playerCount - roles.length;
        for (let i = 0; i < regularCivilians; i++) {
            roles.push('civilian');
        }
        
        // Shuffle roles
        for (let i = roles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [roles[i], roles[j]] = [roles[j], roles[i]];
        }
        
        // Assign roles to players
        this.roles = roles;
    }
    
    getRoleForPlayer(playerId) {
        const index = this.players.findIndex(p => p.id === playerId);
        if (index !== -1) {
            return this.roles[index];
        }
        return null;
    }
    
    getAlivePlayerCount() {
        return this.players.filter(p => p.alive).length;
    }
    
    getAliveMafiaCount() {
        let count = 0;
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].alive && this.roles[i] === 'mafia') {
                count++;
            }
        }
        return count;
    }
    
    getAliveCivilianCount() {
        let count = 0;
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].alive && this.roles[i] !== 'mafia') {
                count++;
            }
        }
        return count;
    }
    
    startGame() {
        this.gameState = 'night';
        this.dayCount = 1;
        this.addToLog(`Game started with ${this.playerCount} players, ${this.mafiaCount} mafia members.`);
        return this.getNightInstructions();
    }
    
    getNightInstructions() {
        // Generate private instructions for each player based on their role
        const instructions = {};
        
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            const role = this.roles[i];
            
            if (!player.alive) continue;
            
            if (role === 'mafia') {
                // Get list of alive players that aren't mafia
                const targets = [];
                const fellowMafia = [];
                
                for (let j = 0; j < this.players.length; j++) {
                    if (this.players[j].alive) {
                        if (this.roles[j] === 'mafia' && i !== j) {
                            fellowMafia.push(this.players[j].name);
                        } else if (this.roles[j] !== 'mafia') {
                            targets.push({
                                id: this.players[j].id,
                                name: this.players[j].name
                            });
                        }
                    }
                }
                
                instructions[player.id] = {
                    role: 'mafia',
                    action: 'kill',
                    targets: targets,
                    fellowMafia: fellowMafia
                };
            } else if (role === 'doctor') {
                // Doctor can heal any alive player including themselves
                const targets = [];
                
                for (let j = 0; j < this.players.length; j++) {
                    if (this.players[j].alive) {
                        targets.push({
                            id: this.players[j].id,
                            name: this.players[j].name
                        });
                    }
                }
                
                instructions[player.id] = {
                    role: 'doctor',
                    action: 'heal',
                    targets: targets,
                    message: "You are the Doctor. Choose a player to protect tonight."
                };
            } else if (role === 'sheriff') {
                // Sheriff can investigate any alive player except themselves
                const targets = [];
                
                for (let j = 0; j < this.players.length; j++) {
                    if (this.players[j].alive && i !== j) {
                        targets.push({
                            id: this.players[j].id,
                            name: this.players[j].name
                        });
                    }
                }
                
                instructions[player.id] = {
                    role: 'sheriff',
                    action: 'investigate',
                    targets: targets,
                    message: "You are the Sheriff. Choose a player to investigate tonight.",
                    previousResults: this.investigationResults[player.id] || []
                };
            } else if (role === 'detective') {
                // Detective can track any alive player except themselves
                const targets = [];
                
                for (let j = 0; j < this.players.length; j++) {
                    if (this.players[j].alive && i !== j) {
                        targets.push({
                            id: this.players[j].id,
                            name: this.players[j].name
                        });
                    }
                }
                
                instructions[player.id] = {
                    role: 'detective',
                    action: 'track',
                    targets: targets,
                    message: "You are the Detective. Choose a player to track tonight.",
                    previousResults: this.investigationResults[player.id] || []
                };
            } else {
                // Regular civilian instructions
                instructions[player.id] = {
                    role: 'civilian',
                    action: 'sleep',
                    message: "It's night time. You are a civilian, so you will sleep through the night."
                };
            }
        }
        
        return instructions;
    }
    
    submitNightAction(playerId, targetId, action = null) {
        const playerRole = this.getRoleForPlayer(playerId);
        
        // Use specific action or default based on role
        const actionType = action || (
            playerRole === 'mafia' ? 'kill' : 
            playerRole === 'doctor' ? 'heal' : 
            playerRole === 'sheriff' ? 'investigate' : 
            playerRole === 'detective' ? 'track' : null
        );
        
        if (!actionType) return false;
        
        // Make sure target is alive (except for doctor who can heal anyone)
        const targetPlayer = this.players.find(p => p.id === targetId);
        if (!targetPlayer || (!targetPlayer.alive && actionType !== 'heal')) {
            return false;
        }
        
        // Add the action
        this.nightActions.push({
            playerId,
            targetId,
            action: actionType
        });
        
        return true;
    }
    
    endNight() {
        // Process night actions
        const killedPlayers = new Set();
        const healedPlayers = new Set();
        const investigationResults = {};
        const trackingResults = {};
        
        // Process doctor heals first
        for (const action of this.nightActions) {
            if (action.action === 'heal') {
                healedPlayers.add(action.targetId);
                this.healedPlayerId = action.targetId;
            }
        }
        
        // Process mafia kills
        for (const action of this.nightActions) {
            if (action.action === 'kill' && !healedPlayers.has(action.targetId)) {
                killedPlayers.add(action.targetId);
            }
        }
        
        // Process sheriff investigations
        for (const action of this.nightActions) {
            if (action.action === 'investigate') {
                const targetRole = this.getRoleForPlayer(action.targetId);
                const isMafia = targetRole === 'mafia';
                
                // Store investigation result for this sheriff
                if (!this.investigationResults[action.playerId]) {
                    this.investigationResults[action.playerId] = [];
                }
                
                this.investigationResults[action.playerId].push({
                    target: this.players.find(p => p.id === action.targetId).name,
                    result: isMafia ? 'mafia' : 'not-mafia',
                    night: this.dayCount
                });
                
                // Add to current results to return
                investigationResults[action.playerId] = {
                    targetId: action.targetId,
                    targetName: this.players.find(p => p.id === action.targetId).name,
                    isMafia: isMafia
                };
            }
        }
        
        // Process detective tracking
        for (const action of this.nightActions) {
            if (action.action === 'track') {
                // Find who the target interacted with
                const targetActions = this.nightActions.filter(a => a.playerId === action.targetId);
                const interactedWith = [];
                
                for (const targetAction of targetActions) {
                    if (targetAction.targetId) {
                        interactedWith.push({
                            id: targetAction.targetId,
                            name: this.players.find(p => p.id === targetAction.targetId).name
                        });
                    }
                }
                
                // Store tracking result for this detective
                if (!this.investigationResults[action.playerId]) {
                    this.investigationResults[action.playerId] = [];
                }
                
                this.investigationResults[action.playerId].push({
                    target: this.players.find(p => p.id === action.targetId).name,
                    result: interactedWith.length > 0 ? `visited ${interactedWith.map(p => p.name).join(', ')}` : 'stayed home',
                    night: this.dayCount
                });
                
                // Add to current results to return
                trackingResults[action.playerId] = {
                    targetId: action.targetId,
                    targetName: this.players.find(p => p.id === action.targetId).name,
                    interactedWith: interactedWith
                };
            }
        }
        
        // Update player states and prepare night results
        const nightResults = {
            killed: [],
            healed: [],
            investigations: investigationResults,
            tracking: trackingResults
        };
        
        for (const playerId of killedPlayers) {
            const player = this.players.find(p => p.id === playerId);
            if (player) {
                player.alive = false;
                const role = this.getRoleForPlayer(playerId);
                
                this.eliminatedPlayers.push({
                    id: player.id,
                    name: player.name,
                    role: role,
                    cause: 'mafia'
                });
                
                nightResults.killed.push({
                    id: player.id,
                    name: player.name
                });
                
                this.addToLog(`${player.name} was killed during the night.`);
            }
        }
        
        for (const playerId of healedPlayers) {
            nightResults.healed.push({
                id: playerId,
                name: this.players.find(p => p.id === playerId).name
            });
        }
        
        // Determine if the game has ended
        const gameStatus = this.checkGameStatus();
        
        this.gameState = 'day';
        this.nightActions = [];
        
        return {
            results: nightResults,
            gameStatus
        };
    }
    
    startDay() {
        this.votes = {};
        this.gameState = 'day';
        const alivePlayers = this.players.filter(p => p.alive);
        
        return {
            dayNumber: this.dayCount,
            alivePlayers: alivePlayers.map(p => ({
                id: p.id,
                name: p.name
            }))
        };
    }
    
    startVoting() {
        this.gameState = 'voting';
        const alivePlayers = this.players.filter(p => p.alive);
        
        return {
            eligibleVoters: alivePlayers.map(p => ({
                id: p.id,
                name: p.name
            })),
            voteCandidates: alivePlayers.map(p => ({
                id: p.id,
                name: p.name
            }))
        };
    }
    
    submitVote(voterId, targetId) {
        // Check if voter is alive
        const voter = this.players.find(p => p.id === voterId);
        if (!voter || !voter.alive) return false;
        
        // Check if target is alive
        const target = this.players.find(p => p.id === targetId);
        if (!target || !target.alive) return false;
        
        // Record vote
        this.votes[voterId] = targetId;
        return true;
    }
    
    endDay() {
        // Count votes
        const voteCounts = {};
        let maxVotes = 0;
        let eliminatedPlayerId = null;
        
        // Count votes for each player
        for (const voterId in this.votes) {
            const targetId = this.votes[voterId];
            if (!voteCounts[targetId]) {
                voteCounts[targetId] = 0;
            }
            voteCounts[targetId]++;
            
            if (voteCounts[targetId] > maxVotes) {
                maxVotes = voteCounts[targetId];
                eliminatedPlayerId = targetId;
            } else if (voteCounts[targetId] === maxVotes) {
                // Tie - no elimination
                eliminatedPlayerId = null;
            }
        }
        
        // Process elimination
        const dayResults = {
            votes: voteCounts,
            eliminated: null
        };
        
        if (eliminatedPlayerId) {
            const eliminatedPlayer = this.players.find(p => p.id === eliminatedPlayerId);
            eliminatedPlayer.alive = false;
            const role = this.getRoleForPlayer(eliminatedPlayerId);
            
            this.eliminatedPlayers.push({
                id: eliminatedPlayer.id,
                name: eliminatedPlayer.name,
                role: role,
                cause: 'vote'
            });
            
            dayResults.eliminated = {
                id: eliminatedPlayer.id,
                name: eliminatedPlayer.name,
                role: role
            };
            
            this.addToLog(`${eliminatedPlayer.name} was voted out and revealed to be a ${role}.`);
        } else {
            this.addToLog("The vote was tied. No one was eliminated today.");
        }
        
        // Determine if the game has ended
        const gameStatus = this.checkGameStatus();
        
        this.dayCount++;
        this.gameState = 'night';
        
        return {
            results: dayResults,
            gameStatus,
            nextNightInstructions: gameStatus.gameOver ? null : this.getNightInstructions()
        };
    }
    
    checkGameStatus() {
        const mafiaCount = this.getAliveMafiaCount();
        const civilianCount = this.getAliveCivilianCount();
        
        if (mafiaCount === 0) {
            this.gameState = 'finished';
            this.addToLog("Game over! All mafia members have been eliminated. Civilians win!");
            return {
                gameOver: true,
                winner: 'civilians',
                message: "All mafia members have been eliminated. Civilians win!"
            };
        } else if (mafiaCount >= civilianCount) {
            this.gameState = 'finished';
            this.addToLog("Game over! Mafia members equal or outnumber civilians. Mafia wins!");
            return {
                gameOver: true,
                winner: 'mafia',
                message: "Mafia members equal or outnumber civilians. Mafia wins!"
            };
        }
        
        return {
            gameOver: false
        };
    }
    
    setDiscussionRounds(rounds) {
        this.discussionRounds = Math.max(1, Math.min(10, parseInt(rounds) || 1));
        return this.discussionRounds;
    }

    getDiscussionRounds() {
        return this.discussionRounds;
    }
    
    addToLog(message) {
        this.gameLog.push({
            day: this.dayCount,
            message: message
        });
    }
    
    getGameStatus() {
        return {
            gameState: this.gameState,
            dayCount: this.dayCount,
            alivePlayers: this.players.filter(p => p.alive).map(p => ({
                id: p.id,
                name: p.name
            })),
            eliminatedPlayers: this.eliminatedPlayers,
            gameLog: this.gameLog
        };
    }
}
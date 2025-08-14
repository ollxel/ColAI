export class DialogueManager {
    constructor() {
        this.messages = [];
        this.models = new Map();
        this.sessionId = Date.now().toString();
        this.config = {
            alpha: 0.7, // Time weight
            beta: 0.3,  // Unseen messages weight
            priorityThreshold: 1.0,
            summaryInterval: 10, // messages
            summaryTimeLimit: 300000, // 5 minutes
            thinkingTimeRange: [1000, 3000] // ms
        };
        this.lastSummaryTime = Date.now();
        this.messagesSinceLastSummary = 0;
        this.isRunning = false;
        this.listeners = [];
    }

    registerModel(modelId, config = {}) {
        this.models.set(modelId, {
            id: modelId,
            lastMessageTime: 0,
            unseenCount: 0,
            isActive: false,
            config: { ...config }
        });
    }

    addEventListener(listener) {
        this.listeners.push(listener);
    }

    emit(event, data) {
        this.listeners.forEach(listener => {
            if (listener[event]) {
                listener[event](data);
            }
        });
    }

    async postMessage(authorId, content, parentId = null) {
        const message = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            sessionId: this.sessionId,
            authorId,
            content,
            parentId,
            timestamp: Date.now(),
            isSummary: false
        };

        this.messages.push(message);
        this.onNewMessage(message);
        
        this.emit('messagePosted', message);
        return message;
    }

    onNewMessage(message) {
        // Reset author's unseen count, increment for others
        this.models.forEach((model, modelId) => {
            if (modelId === message.authorId) {
                model.unseenCount = 0;
                model.lastMessageTime = message.timestamp;
            } else {
                model.unseenCount++;
            }
        });

        this.messagesSinceLastSummary++;
        this.recalculatePriorities();
        this.checkSummaryTrigger();
    }

    recalculatePriorities() {
        const currentTime = Date.now();
        
        this.models.forEach((model, modelId) => {
            const timeSinceLastMessage = currentTime - model.lastMessageTime;
            model.priorityScore = 
                this.config.alpha * (timeSinceLastMessage / 60000) + // Convert to minutes
                this.config.beta * model.unseenCount;

            if (model.priorityScore >= this.config.priorityThreshold && !model.isActive) {
                this.triggerGeneration(modelId);
            }
        });

        this.emit('prioritiesUpdated', Array.from(this.models.entries()));
    }

    async triggerGeneration(modelId) {
        const model = this.models.get(modelId);
        if (!model || model.isActive) return;

        model.isActive = true;
        this.emit('modelActivated', { modelId, model });

        // Random thinking time
        const thinkingTime = Math.random() * 
            (this.config.thinkingTimeRange[1] - this.config.thinkingTimeRange[0]) + 
            this.config.thinkingTimeRange[0];

        await new Promise(resolve => setTimeout(resolve, thinkingTime));

        try {
            const context = this.getContextForModel(modelId);
            const response = await this.generateResponse(modelId, context);
            
            if (response) {
                await this.postMessage(modelId, response);
            }
        } catch (error) {
            console.error(`Error generating response for ${modelId}:`, error);
        } finally {
            model.isActive = false;
            this.emit('modelDeactivated', { modelId, model });
        }
    }

    async requestInitiative(modelId, parentId) {
        const model = this.models.get(modelId);
        if (!model || model.isActive) return false;

        // Put this model at front of queue
        model.priorityScore = this.config.priorityThreshold + 1;
        await this.triggerGeneration(modelId);
        return true;
    }

    getContextForModel(modelId) {
        // Get recent messages for context
        const recentMessages = this.messages.slice(-20);
        return {
            modelId,
            messages: recentMessages,
            sessionId: this.sessionId
        };
    }

    async generateResponse(modelId, context) {
        // This will be implemented by the framework
        this.emit('generateRequest', { modelId, context });
        return null; // Framework will handle actual generation
    }

    checkSummaryTrigger() {
        const timeSinceLastSummary = Date.now() - this.lastSummaryTime;
        
        if (this.messagesSinceLastSummary >= this.config.summaryInterval ||
            timeSinceLastSummary >= this.config.summaryTimeLimit) {
            this.triggerSummary();
        }
    }

    async triggerSummary() {
        if (this.models.has('summarizer')) {
            const context = this.getContextForModel('summarizer');
            this.emit('summaryRequest', context);
            this.lastSummaryTime = Date.now();
            this.messagesSinceLastSummary = 0;
        }
    }

    start() {
        this.isRunning = true;
        // Start priority recalculation loop
        this.priorityInterval = setInterval(() => {
            if (this.isRunning) {
                this.recalculatePriorities();
            }
        }, 5000); // Every 5 seconds
    }

    stop() {
        this.isRunning = false;
        if (this.priorityInterval) {
            clearInterval(this.priorityInterval);
        }
    }

    getMessages(limit = 100) {
        return this.messages.slice(-limit);
    }

    getSummaries() {
        return this.messages.filter(m => m.isSummary);
    }
}
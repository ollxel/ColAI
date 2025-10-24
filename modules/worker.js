import { ModelManager } from './modelManager.js';

export class Worker {
    constructor(config = {}) {
        this.id = config.workerId || crypto.randomUUID();
        this.modelManager = new ModelManager();
        this.capabilities = {
            models: config.models || [],
            free_vram: config.free_vram || 0,
            max_concurrent: config.max_concurrent || 1,
            type: config.type || 'cpu' // 'cpu', 'gpu', 'browser'
        };
        this.schedulerUrl = config.schedulerUrl || 'http://localhost:3000';
        this.heartbeatInterval = null;
        this.busy = false;
    }

    async start() {
        // Register with scheduler
        await this.register();
        
        // Start heartbeat
        this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), 30000);
        
        // Start processing loop
        this.processLoop();
    }

    async register() {
        try {
            const response = await fetch(`${this.schedulerUrl}/worker/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    worker_id: this.id,
                    capabilities: this.capabilities
                })
            });
            if (!response.ok) throw new Error('Registration failed');
        } catch (error) {
            console.error('Worker registration failed:', error);
            throw error;
        }
    }

    async processLoop() {
        while (true) {
            if (!this.busy) {
                try {
                    const task = await this.getNextTask();
                    if (task) {
                        await this.processTask(task);
                    }
                } catch (error) {
                    console.error('Error in process loop:', error);
                }
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    async getNextTask() {
        try {
            const response = await fetch(`${this.schedulerUrl}/worker/${this.id}/task`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Error getting next task:', error);
            return null;
        }
    }

    async processTask(task) {
        this.busy = true;
        try {
            // Load required model if needed
            if (task.options.model && !this.modelManager.isModelLoaded(task.options.model)) {
                await this.modelManager.loadModel(task.options.model);
            }

            // Process the task
            const result = await this.modelManager.infer(task.prompt, task.options);
            
            // Send result back
            await this.sendResult(task.id, result);
        } catch (error) {
            console.error('Task processing error:', error);
            await this.sendError(task.id, error);
        } finally {
            this.busy = false;
        }
    }

    async sendHeartbeat() {
        try {
            await fetch(`${this.schedulerUrl}/worker/${this.id}/heartbeat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: this.busy ? 'busy' : 'available',
                    current_stats: {
                        free_vram: this.capabilities.free_vram,
                        cpu_load: process.cpuUsage().user / 1000000
                    }
                })
            });
        } catch (error) {
            console.error('Heartbeat failed:', error);
        }
    }

    async sendResult(taskId, result) {
        try {
            await fetch(`${this.schedulerUrl}/task/${taskId}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ result })
            });
        } catch (error) {
            console.error('Error sending result:', error);
        }
    }

    async sendError(taskId, error) {
        try {
            await fetch(`${this.schedulerUrl}/task/${taskId}/error`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: error.message })
            });
        } catch (error) {
            console.error('Error sending error:', error);
        }
    }
}

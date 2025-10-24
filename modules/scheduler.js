import { v4 as uuidv4 } from 'uuid';

export class Scheduler {
    constructor(config = {}) {
        this.queues = {
            high_priority: [],
            normal: [],
            economy: []
        };
        this.workers = new Map(); // worker_id -> {capabilities, status, lastHeartbeat}
        this.sessionManager = null;
        this.inMemoryStore = true;
        this.redisClient = config.redisClient;
    }

    async enqueue(request) {
        const taskId = uuidv4();
        const task = {
            id: taskId,
            status: 'pending',
            priority: request.priority || 'normal',
            session_id: request.session_id,
            prompt: request.prompt,
            options: request.options,
            created_at: Date.now()
        };

        if (this.redisClient) {
            await this.redisClient.hSet(`task:${taskId}`, task);
            await this.redisClient.lPush(`queue:${task.priority}`, taskId);
        } else {
            this.queues[task.priority].push(task);
        }

        return taskId;
    }

    async getStatus(taskId) {
        if (this.redisClient) {
            const task = await this.redisClient.hGetAll(`task:${taskId}`);
            return task || { status: 'not_found' };
        }
        
        for (const queue of Object.values(this.queues)) {
            const task = queue.find(t => t.id === taskId);
            if (task) return task;
        }
        return { status: 'not_found' };
    }

    async cancel(taskId) {
        if (this.redisClient) {
            const task = await this.redisClient.hGetAll(`task:${taskId}`);
            if (task) {
                await this.redisClient.hSet(`task:${taskId}`, { ...task, status: 'cancelled' });
                return true;
            }
        } else {
            for (const queue of Object.values(this.queues)) {
                const taskIndex = queue.findIndex(t => t.id === taskId);
                if (taskIndex >= 0) {
                    queue[taskIndex].status = 'cancelled';
                    return true;
                }
            }
        }
        return false;
    }

    async registerWorker(workerId, capabilities) {
        const worker = {
            id: workerId,
            capabilities,
            status: 'available',
            lastHeartbeat: Date.now()
        };
        this.workers.set(workerId, worker);
        return worker;
    }

    async assignTask(workerId) {
        const worker = this.workers.get(workerId);
        if (!worker || worker.status !== 'available') return null;

        // Check if there's an affinity task for this worker
        if (this.sessionManager) {
            const affinityTask = await this.findAffinityTask(workerId);
            if (affinityTask) return affinityTask;
        }

        // Otherwise find next suitable task
        for (const priority of ['high_priority', 'normal', 'economy']) {
            const task = await this.findSuitableTask(priority, worker.capabilities);
            if (task) return task;
        }

        return null;
    }

    private async findAffinityTask(workerId) {
        if (!this.redisClient) {
            return this.queues.high_priority.find(t => 
                this.sessionManager.getWorkerAffinity(t.session_id) === workerId
            ) || this.queues.normal.find(t => 
                this.sessionManager.getWorkerAffinity(t.session_id) === workerId
            );
        }
        // Redis implementation...
    }

    private async findSuitableTask(priority, capabilities) {
        if (!this.redisClient) {
            return this.queues[priority].find(t => 
                this.isTaskSuitableForCapabilities(t, capabilities)
            );
        }
        // Redis implementation...
    }

    private isTaskSuitableForCapabilities(task, capabilities) {
        // Match task requirements with worker capabilities
        if (task.options.required_models) {
            return task.options.required_models.every(model => 
                capabilities.models.includes(model)
            );
        }
        return true;
    }
}

export class SessionManager {
    constructor(config = {}) {
        this.redisClient = config.redisClient;
        this.sessions = new Map(); // In-memory fallback
        this.workerAffinities = new Map();
    }

    async saveSession(sessionId, data) {
        if (this.redisClient) {
            await this.redisClient.hSet(`session:${sessionId}`, data);
        } else {
            this.sessions.set(sessionId, data);
        }
    }

    async getSession(sessionId) {
        if (this.redisClient) {
            return await this.redisClient.hGetAll(`session:${sessionId}`);
        }
        return this.sessions.get(sessionId);
    }

    async updateSession(sessionId, updates) {
        if (this.redisClient) {
            await this.redisClient.hSet(`session:${sessionId}`, updates);
        } else {
            const session = this.sessions.get(sessionId) || {};
            this.sessions.set(sessionId, { ...session, ...updates });
        }
    }

    setWorkerAffinity(sessionId, workerId) {
        this.workerAffinities.set(sessionId, workerId);
    }

    getWorkerAffinity(sessionId) {
        return this.workerAffinities.get(sessionId);
    }

    async clearSession(sessionId) {
        if (this.redisClient) {
            await this.redisClient.del(`session:${sessionId}`);
        } else {
            this.sessions.delete(sessionId);
        }
        this.workerAffinities.delete(sessionId);
    }
}

export class ModelManager {
    constructor() {
        this.loadedModels = new Map();
        this.modelConfigs = new Map();
        this.maxModels = 2; // Maximum number of models to keep loaded
    }

    async loadModel(modelId) {
        if (this.loadedModels.has(modelId)) {
            // Update LRU status
            this.loadedModels.get(modelId).lastUsed = Date.now();
            return;
        }

        // Check if we need to unload models
        if (this.loadedModels.size >= this.maxModels) {
            await this.unloadLeastRecentlyUsed();
        }

        // Load the model
        try {
            const model = await this.createModel(modelId);
            this.loadedModels.set(modelId, {
                model,
                lastUsed: Date.now()
            });
        } catch (error) {
            console.error(`Error loading model ${modelId}:`, error);
            throw error;
        }
    }

    async unloadModel(modelId) {
        const modelInfo = this.loadedModels.get(modelId);
        if (modelInfo) {
            try {
                await modelInfo.model.unload();
                this.loadedModels.delete(modelId);
            } catch (error) {
                console.error(`Error unloading model ${modelId}:`, error);
            }
        }
    }

    async unloadLeastRecentlyUsed() {
        let lruModelId = null;
        let lruTime = Infinity;

        for (const [modelId, info] of this.loadedModels.entries()) {
            if (info.lastUsed < lruTime) {
                lruTime = info.lastUsed;
                lruModelId = modelId;
            }
        }

        if (lruModelId) {
            await this.unloadModel(lruModelId);
        }
    }

    isModelLoaded(modelId) {
        return this.loadedModels.has(modelId);
    }

    async infer(prompt, options) {
        const modelId = options.model;
        if (!this.loadedModels.has(modelId)) {
            throw new Error(`Model ${modelId} is not loaded`);
        }

        const modelInfo = this.loadedModels.get(modelId);
        modelInfo.lastUsed = Date.now();

        try {
            return await modelInfo.model.generate(prompt, options);
        } catch (error) {
            console.error(`Inference error with model ${modelId}:`, error);
            throw error;
        }
    }

    private async createModel(modelId) {
        // Implementation will depend on the specific model framework being used
        // This is a placeholder for the actual model initialization logic
        throw new Error('createModel must be implemented');
    }
}

/**
 * Ollama Session Manager
 * Управляет сессиями для локальных моделей Ollama
 */
export class OllamaSessionManager {
    constructor() {
        this.sessions = new Map();
        this.baseUrl = 'http://localhost:11434';
        this.defaultModel = 'qwen2.5:14b';
        this.connectionStatus = 'unknown';
    }

    /**
     * Проверяет доступность Ollama
     */
    async checkConnection() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                this.connectionStatus = 'connected';
                return true;
            } else {
                this.connectionStatus = 'error';
                return false;
            }
        } catch (error) {
            this.connectionStatus = 'disconnected';
            console.error('Ollama connection error:', error);
            return false;
        }
    }

    /**
     * Получает или создает сессию для модели
     */
    async getOrCreateSession(sessionId, modelConfig) {
        if (this.sessions.has(sessionId)) {
            return this.sessions.get(sessionId);
        }

        const session = {
            id: sessionId,
            model: modelConfig.model || this.defaultModel,
            systemPrompt: modelConfig.systemPrompt || '',
            temperature: modelConfig.temperature || 0.7,
            maxTokens: modelConfig.maxTokens || 2048,
            topP: modelConfig.topP || 1.0,
            contextWindow: modelConfig.contextWindow || 4096,
            conversationHistory: []
        };

        this.sessions.set(sessionId, session);
        return session;
    }

    /**
     * Отправляет сообщение в Ollama
     */
    async sendMessage(sessionId, messages, options = {}) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }

        // Проверяем подключение
        const isConnected = await this.checkConnection();
        if (!isConnected) {
            throw new Error('Ollama не запущен. Убедитесь, что Ollama запущен на http://localhost:11434');
        }

        // Формируем сообщения для Ollama
        const ollamaMessages = [];
        
        // Определяем system prompt: приоритет у system prompt из сессии, если он есть
        let systemPrompt = session.systemPrompt || '';
        
        // Проверяем, есть ли system prompt в новых сообщениях
        const systemMessages = messages.filter(msg => msg.role === 'system');
        if (systemMessages.length > 0 && !systemPrompt) {
            // Используем system prompt из сообщений, если в сессии его нет
            systemPrompt = systemMessages[0].content;
        } else if (systemMessages.length > 0 && systemPrompt) {
            // Если есть и в сессии, и в сообщениях, объединяем их
            systemPrompt = systemPrompt + '\n\n' + systemMessages[0].content;
        }
        
        // Добавляем system prompt если есть
        if (systemPrompt) {
            ollamaMessages.push({
                role: 'system',
                content: systemPrompt
            });
        }

        // Добавляем историю разговора (без system сообщений)
        if (session.conversationHistory.length > 0) {
            const historyWithoutSystem = session.conversationHistory.filter(msg => msg.role !== 'system');
            ollamaMessages.push(...historyWithoutSystem);
        }

        // Добавляем новые сообщения (исключая system, так как он уже обработан)
        for (const msg of messages) {
            if (msg.role === 'system') {
                continue; // System prompt уже обработан
            }
            
            if (typeof msg.content === 'string') {
                ollamaMessages.push({
                    role: msg.role,
                    content: msg.content
                });
            } else if (Array.isArray(msg.content)) {
                // Обработка мультимодального контента
                const textParts = [];
                for (const part of msg.content) {
                    if (part.type === 'text') {
                        textParts.push(part.text);
                    } else if (part.type === 'image_url') {
                        // Ollama поддерживает изображения через base64
                        textParts.push(`[Image: ${part.image_url.url.substring(0, 50)}...]`);
                    }
                }
                ollamaMessages.push({
                    role: msg.role,
                    content: textParts.join('\n\n')
                });
            }
        }

        // Формируем запрос к Ollama
        const payload = {
            model: options.model || session.model,
            messages: ollamaMessages,
            stream: false,
            options: {
                temperature: options.temperature !== undefined ? options.temperature : session.temperature,
                num_predict: options.maxTokens !== undefined ? options.maxTokens : session.maxTokens,
                top_p: options.topP !== undefined ? options.topP : session.topP,
                num_ctx: session.contextWindow
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            if (!data.message || !data.message.content) {
                throw new Error('Invalid response from Ollama');
            }

            // Обновляем историю разговора
            session.conversationHistory.push(...ollamaMessages.slice(-messages.length));
            session.conversationHistory.push({
                role: 'assistant',
                content: data.message.content
            });

            // Ограничиваем размер истории (последние 20 сообщений)
            if (session.conversationHistory.length > 20) {
                session.conversationHistory = session.conversationHistory.slice(-20);
            }

            return {
                content: data.message.content,
                model: data.model || session.model
            };
        } catch (error) {
            console.error('Ollama API error:', error);
            throw error;
        }
    }

    /**
     * Очищает историю сессии
     */
    clearSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.conversationHistory = [];
        }
    }

    /**
     * Удаляет сессию
     */
    deleteSession(sessionId) {
        this.sessions.delete(sessionId);
    }

    /**
     * Устанавливает модель по умолчанию
     */
    setDefaultModel(modelName) {
        this.defaultModel = modelName;
    }

    /**
     * Получает список доступных моделей
     */
    async getAvailableModels() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            return data.models ? data.models.map(m => m.name) : [];
        } catch (error) {
            console.error('Error fetching models:', error);
            return [];
        }
    }

    /**
     * Проверяет наличие модели
     */
    async checkModel(modelName) {
        const models = await this.getAvailableModels();
        return models.includes(modelName);
    }
}


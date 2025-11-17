import { OllamaSessionManager } from './ollamaManager.js';

export class MafiaAiClient {
    constructor() {
        // Инициализируем менеджер Ollama
        this.ollamaManager = new OllamaSessionManager();
        this.selectedModel = localStorage.getItem('ollama-model') || 'qwen2.5:14b';
        
        // Initialize with default model settings
        this.modelSettings = {
            temperature: 0.7,
            max_tokens: 300,
            top_p: 1.0,
            presence_penalty: 0.0,
            frequency_penalty: 0.0
        };
        this.retryCount = 0;
        this.maxRetries = 3; // Increased retry count
    }
    
    updateSettings(settings) {
        this.modelSettings = {
            ...this.modelSettings,
            ...settings
        };
    }

    /**
     * Устанавливает модель для использования
     */
    setModel(modelName) {
        this.selectedModel = modelName;
        localStorage.setItem('ollama-model', modelName);
        this.ollamaManager.setDefaultModel(modelName);
    }

    /**
     * Получает текущую модель
     */
    getModel() {
        return this.selectedModel;
    }
    
    async getChatCompletion(prompt, temperature = null, language = 'en') {
        try {
            this.retryCount = 0;
            return await this._attemptChatCompletion(prompt, temperature, language);
        } catch (error) {
            console.error("Error in MafiaAiClient.getChatCompletion:", error);
            // Return more varied fallback messages instead of the same generic one
            const fallbackMessages = language === 'ru' ? [
                "Я анализирую поведение каждого игрока и их мотивы.",
                "Некоторые из вас ведут себя очень подозрительно сегодня.",
                "Давайте внимательно посмотрим на голосование в прошлом раунде.",
                "Я заметил интересные закономерности в поведении некоторых игроков.",
                "Мне кажется, мафия пытается направить подозрения не в ту сторону.",
                "Важно проанализировать, кто кого защищает в этой игре.",
                "Слишком много совпадений, чтобы это было случайностью.",
                "Поведение некоторых игроков кардинально изменилось с начала игры.",
                "Мафия определенно пытается скрыться среди нас.",
                "Нужно обратить внимание на тех, кто молчит больше обычного."
            ] : [
                "I'm analyzing each player's behavior and their motivations.",
                "Some of you are acting very suspiciously today.",
                "Let's look carefully at the voting patterns from the last round.",
                "I've noticed interesting patterns in some players' behavior.",
                "I think the mafia is trying to redirect suspicion elsewhere.",
                "It's important to analyze who is defending whom in this game.",
                "Too many coincidences for this to be random.",
                "Some players' behavior has changed dramatically since the start.",
                "The mafia is definitely trying to hide among us.",
                "We need to pay attention to those who are quieter than usual."
            ];
            return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
        }
    }
    
    async _attemptChatCompletion(prompt, temperature = null, language = 'en') {
        try {
            const systemPrompt = language === 'ru'
                ? "Вы играете за персонажа в игре Мафия. Отвечайте как ваш персонаж, основываясь на информации об игре. Держите свою роль в секрете, если вы член мафии. Никогда прямо не указывайте свою роль. Отвечайте содержательно и вдумчиво, избегая шаблонных и общих ответов."
                : "You are playing a character in a Mafia game. Respond as your character would, based on the game information. Keep your role secret if you are a mafia member. Never directly state your role. Give thoughtful and meaningful responses, avoiding generic answers.";
                
            const messages = [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: prompt
                }
            ];
            
            // Use provided temperature or default
            const tempToUse = temperature !== null ? temperature : this.modelSettings.temperature;
            
            // Используем Ollama для запросов
            const sessionId = 'mafia-game';
            
            // Создаем или получаем сессию
            await this.ollamaManager.getOrCreateSession(sessionId, {
                model: this.selectedModel,
                systemPrompt: systemPrompt,
                temperature: tempToUse,
                maxTokens: this.modelSettings.max_tokens,
                topP: this.modelSettings.top_p,
                contextWindow: 4096
            });

            const completion = await this.ollamaManager.sendMessage(sessionId, messages, {
                temperature: tempToUse,
                maxTokens: this.modelSettings.max_tokens,
                topP: this.modelSettings.top_p,
                model: this.selectedModel
            });
            
            // Validate response
            if (!completion || !completion.content) {
                throw new Error("Invalid response from Ollama API");
            }
            
            return completion.content;
        } catch (error) {
            console.error(`Chat completion attempt ${this.retryCount + 1} failed:`, error);
            
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                // Exponential backoff
                const delay = Math.pow(2, this.retryCount) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return this._attemptChatCompletion(prompt, temperature, language);
            }
            throw error;
        }
    }
}

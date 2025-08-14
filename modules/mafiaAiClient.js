export class MafiaAiClient {
    constructor() {
        // Initialize with default model settings
        this.modelSettings = {
            temperature: 0.7,
            max_tokens: 300,
            top_p: 1.0,
            presence_penalty: 0.0,
            frequency_penalty: 0.0
        };
        this.retryCount = 0;
        this.maxRetries = 2;
    }
    
    updateSettings(settings) {
        this.modelSettings = {
            ...this.modelSettings,
            ...settings
        };
    }
    
    async getChatCompletion(prompt, temperature = null, language = 'en') {
        try {
            this.retryCount = 0;
            const response = await this._attemptChatCompletion(prompt, temperature, language);
            
            // Check for generic fallback responses that indicate API issues
            if (this.isGenericFallbackResponse(response)) {
                return "Turn on the VPN, or if it doesn't work, then go to https://col-ai--ollxel.on.websim.com/";
            }
            
            return response;
        } catch (error) {
            console.error("Error in MafiaAiClient.getChatCompletion:", error);
            return "Turn on the VPN, or if it doesn't work, then go to https://col-ai--ollxel.on.websim.com/";
        }
    }
    
    isGenericFallbackResponse(response) {
        const genericPatterns = [
            "I'm analyzing each player's behavior",
            "Some of you are acting very suspiciously",
            "Let's look carefully at the voting patterns",
            "I've noticed interesting patterns",
            "I think the mafia is trying to redirect",
            "It's important to analyze who is defending",
            "Too many coincidences for this to be random",
            "Some players' behavior has changed dramatically",
            "The mafia is definitely trying to hide",
            "We need to pay attention to those who are quieter",
            "I'm thinking about the situation and will respond soon",
            "I'm analyzing the key components"
        ];
        
        return genericPatterns.some(pattern => 
            response.toLowerCase().includes(pattern.toLowerCase())
        );
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
            
            const completion = await websim.chat.completions.create({
                messages: messages,
                temperature: tempToUse,
                max_tokens: this.modelSettings.max_tokens,
                top_p: this.modelSettings.top_p,
                presence_penalty: this.modelSettings.presence_penalty,
                frequency_penalty: this.modelSettings.frequency_penalty
            });
            
            return completion.content;
        } catch (error) {
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this._attemptChatCompletion(prompt, temperature, language);
            }
            throw error;
        }
    }
}
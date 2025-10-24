import { SessionManager } from './modules/sessionManager.js';
import { BrowserWorker } from './modules/browserWorker.js';

class ColAIWeb {
    constructor() {
        this.sessionId = localStorage.getItem('session_id') || crypto.randomUUID();
        this.sessionManager = new SessionManager();
        this.browserWorker = new BrowserWorker();
        this.qualityMode = 'normal';
        this.initializeUI();
    }

    initializeUI() {
        this.elements = {
            qualitySelector: document.getElementById('quality-mode'),
            chatMessages: document.getElementById('chat-messages'),
            userInput: document.getElementById('user-input'),
            sendButton: document.getElementById('send-button'),
            sendProButton: document.getElementById('send-pro'),
            queueStatus: document.getElementById('queue-status'),
            estTime: document.getElementById('est-time')
        };

        this.elements.qualitySelector.addEventListener('change', (e) => {
            this.qualityMode = e.target.value;
        });

        this.elements.sendButton.addEventListener('click', () => this.sendMessage());
        this.elements.sendProButton.addEventListener('click', () => this.sendMessage(true));
        
        // Initialize browser worker for local processing
        this.browserWorker.initialize();
    }

    async sendMessage(forcePro = false) {
        const message = this.elements.userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessageToChat('user', message);
        this.elements.userInput.value = '';

        const priority = forcePro || this.qualityMode === 'pro' ? 'high_priority' : 
                        this.qualityMode === 'normal' ? 'normal' : 'economy';

        try {
            // For economy mode, try browser processing first
            if (priority === 'economy') {
                try {
                    const result = await this.browserWorker.process(message);
                    this.addMessageToChat('assistant', result);
                    return;
                } catch (error) {
                    console.log('Browser processing failed, falling back to server');
                }
            }

            // Server processing
            const response = await fetch('/api/enqueue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    prompt: message,
                    priority,
                    options: {
                        quality_mode: this.qualityMode
                    }
                })
            });

            const { task_id } = await response.json();
            this.pollTaskStatus(task_id);

        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessageToChat('system', 'Error processing message. Please try again.');
        }
    }

    async pollTaskStatus(taskId) {
        const poll = async () => {
            try {
                const response = await fetch(`/api/status/${taskId}`);
                const status = await response.json();

                this.updateQueueStatus(status);

                if (status.status === 'completed') {
                    this.addMessageToChat('assistant', status.result);
                    return;
                } else if (status.status === 'failed') {
                    this.addMessageToChat('system', 'Processing failed. Please try again.');
                    return;
                }

                setTimeout(poll, 1000);
            } catch (error) {
                console.error('Error polling status:', error);
            }
        };

        poll();
    }

    updateQueueStatus(status) {
        this.elements.queueStatus.textContent = `Queue: ${status.status}`;
        if (status.estimated_time) {
            this.elements.estTime.textContent = `Est. wait: ${Math.ceil(status.estimated_time)}s`;
        }
    }

    addMessageToChat(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        messageDiv.textContent = content;
        this.elements.chatMessages.appendChild(messageDiv);
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.colAIWeb = new ColAIWeb();
});

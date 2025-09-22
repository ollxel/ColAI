import { MafiaGameManager } from './mafiaGameManager.js';
import { MafiaUiManager } from './mafiaUiManager.js';
import { MafiaAiClient } from './mafiaAiClient.js';

export class MafiaMode {
    constructor() {
        this.mafiaGameManager = new MafiaGameManager();
        this.aiClient = new MafiaAiClient();
        this.uiManager = new MafiaUiManager(this.mafiaGameManager, this.aiClient);
        this.initialized = false;
    }
    
    initialize() {
        // Check if hash is #mafia or #wiki
        if (window.location.hash === '#mafia') {
            this.activateMafiaMode();
        } else if (window.location.hash === '#wiki') {
            this.activateWikiMode();
        }
        
        // Add event listener for hash changes
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#mafia') {
                this.activateMafiaMode();
            } else if (window.location.hash === '#wiki') {
                this.activateWikiMode();
            } else if (this.initialized) {
                this.deactivateMafiaMode();
            }
        });
    }
    
    activateMafiaMode() {
        document.querySelector('.container').innerHTML = '';
        
        const mafiaContainer = document.createElement('div');
        mafiaContainer.className = 'mafia-container';
        document.querySelector('.container').appendChild(mafiaContainer);
        
        // Initialize UI
        this.uiManager.initializeUi(mafiaContainer);
        
        // Add mafia-specific styles
        this.addMafiaStyles();
        
        this.initialized = true;
    }
    
    deactivateMafiaMode() {
        // Reset page to reload main app
        location.reload();
    }
    
    addMafiaStyles() {
        // Check if mafia styles already exist
        if (document.getElementById('mafia-styles')) {
            return;
        }
        
        const styleElement = document.createElement('style');
        styleElement.id = 'mafia-styles';
        
        styleElement.textContent = `
            .mafia-container {
                width: 100%;
                max-width: 1400px;
                margin: 0 auto;
                background-color: var(--card-bg);
                border-radius: 20px;
                box-shadow: var(--shadow);
                overflow: hidden;
            }
            
            .mafia-header {
                padding: 20px;
                background: linear-gradient(to right, #2c3e50, #4a69bd);
                color: white;
                border-bottom: 1px solid #1a2a3a;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
            }
            
            .mafia-header h2 {
                font-size: 24px;
                font-weight: 700;
                margin: 0;
                text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
                flex: 1;
            }
            
            .language-switcher {
                margin-right: 15px;
            }
            
            .language-switcher select {
                padding: 8px 12px;
                border-radius: 8px;
                border: none;
                background-color: rgba(255,255,255,0.2);
                color: white;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .language-switcher select:hover {
                background-color: rgba(255,255,255,0.3);
            }
            
            .mafia-controls {
                display: flex;
                gap: 15px;
                margin-top: 10px;
                width: 100%;
            }
            
            .player-count-select select {
                padding: 8px 12px;
                border-radius: 8px;
                border: none;
                background-color: rgba(255,255,255,0.2);
                color: white;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .player-count-select select:hover {
                background-color: rgba(255,255,255,0.3);
            }
            
            .player-count-select select:focus {
                outline: none;
                box-shadow: 0 0 0 2px rgba(255,255,255,0.5);
            }
            
            .setup-controls {
                display: flex;
                align-items: center;
                gap: 15px;
                flex-wrap: wrap;
                width: 100%;
                justify-content: flex-start;
            }
            
            .setup-controls label {
                color: white;
                margin: 0;
            }
            
            .mafia-count-control {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .mafia-count-control input {
                width: 60px;
                padding: 8px 12px;
                border-radius: 8px;
                border: none;
                background-color: rgba(255,255,255,0.2);
                color: white;
                font-weight: 500;
            }
            
            .mafia-count-control input:focus {
                outline: none;
                box-shadow: 0 0 0 2px rgba(255,255,255,0.5);
            }
            
            .discussion-rounds-control {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .discussion-rounds-control input {
                width: 60px;
                padding: 8px 12px;
                border-radius: 8px;
                border: none;
                background-color: rgba(255,255,255,0.2);
                color: white;
                font-weight: 500;
            }
            
            .discussion-rounds-control input:focus {
                outline: none;
                box-shadow: 0 0 0 2px rgba(255,255,255,0.5);
            }
            
            .mafia-game-area {
                display: grid;
                grid-template-columns: 300px 1fr 300px;
                height: calc(100vh - 150px);
                min-height: 500px;
            }
            
            .mafia-game-log {
                background-color: #f8f9fa;
                border-right: 1px solid #e9ecef;
                padding: 15px;
                overflow-y: auto;
            }
            
            .mafia-game-log h3 {
                color: #2c3e50;
                margin-bottom: 15px;
                font-size: 16px;
                font-weight: 600;
                padding-bottom: 8px;
                border-bottom: 1px solid #dee2e6;
            }
            
            .mafia-action-panel {
                background-color: #f8f9fa;
                border-left: 1px solid #e9ecef;
                padding: 15px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
            }
            
            .mafia-action-panel h3 {
                color: #2c3e50;
                margin-bottom: 15px;
                font-size: 16px;
                font-weight: 600;
                padding-bottom: 8px;
                border-bottom: 1px solid #dee2e6;
            }
            
            .thought-process-header {
                margin-top: 20px;
            }
            
            .thought-process-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
                flex-grow: 1;
            }
            
            #player-thought-selector {
                padding: 8px;
                border-radius: 8px;
                border: 1px solid #ced4da;
                background-color: white;
            }
            
            #thought-process-content {
                flex-grow: 1;
                background-color: white;
                border: 1px solid #ced4da;
                border-radius: 8px;
                padding: 10px;
                font-size: 14px;
                overflow-y: auto;
                min-height: 150px;
            }
            
            .mafia-game-board {
                background-color: #ecf0f1;
                padding: 20px;
                display: flex;
                flex-direction: column;
                position: relative;
                background-image: 
                    radial-gradient(circle at 10% 10%, rgba(52, 73, 94, 0.1) 0%, transparent 70%),
                    radial-gradient(circle at 90% 90%, rgba(74, 105, 189, 0.1) 0%, transparent 70%);
            }
            
            .game-status-banner {
                background-color: rgba(52, 73, 94, 0.9);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                text-align: center;
                font-weight: 600;
                margin-bottom: 20px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }
            
            .game-status-banner.mafia-win {
                background-color: rgba(231, 76, 60, 0.9);
                animation: pulse-red 2s infinite;
            }
            
            .game-status-banner.civilian-win {
                background-color: rgba(46, 204, 113, 0.9);
                animation: pulse-green 2s infinite;
            }
            
            @keyframes pulse-red {
                0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
                100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
            }
            
            @keyframes pulse-green {
                0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(46, 204, 113, 0); }
                100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
            }
            
            .mafia-town {
                flex-grow: 1;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .mafia-players-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 20px;
                max-width: 600px;
            }
            
            .mafia-player {
                width: 120px;
                height: 150px;
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 15px 10px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .mafia-player.alive:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 16px rgba(0,0,0,0.15);
            }
            
            .mafia-player.dead {
                filter: grayscale(100%);
                opacity: 0.7;
            }
            
            .mafia-player.dead::after {
                content: '☠️';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 32px;
                z-index: 1;
            }
            
            .mafia-player.mafia-revealed::before {
                content: 'MAFIA';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                background-color: rgba(231, 76, 60, 0.8);
                color: white;
                text-align: center;
                padding: 3px 0;
                font-weight: bold;
                font-size: 12px;
            }
            
            .mafia-player.civilian-revealed::before {
                content: 'CIVILIAN';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                background-color: rgba(46, 204, 113, 0.8);
                color: white;
                text-align: center;
                padding: 3px 0;
                font-weight: bold;
                font-size: 12px;
            }
            
            .player-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 10px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            .player-initial {
                color: white;
                font-size: 24px;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }
            
            .player-name {
                font-weight: 600;
                font-size: 14px;
                text-align: center;
                margin-bottom: 5px;
            }
            
            .player-status {
                font-size: 12px;
                color: #6c757d;
            }
            
            .mafia-day-counter {
                display: flex;
                justify-content: center;
                padding: 10px 0;
            }
            
            #day-phase-indicator {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 20px;
                border-radius: 20px;
                background-color: #ffc107;
                color: #343a40;
                font-weight: 600;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
            }
            
            #day-phase-indicator.night-phase {
                background-color: #6c5ce7;
                color: white;
            }
            
            #day-phase-indicator.day-phase {
                background-color: #ffc107;
                color: #343a40;
            }
            
            .phase-icon {
                font-size: 20px;
            }
            
            .log-entry {
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px solid #f1f3f5;
                font-size: 14px;
            }
            
            .log-sender {
                font-weight: 600;
                margin-bottom: 3px;
            }
            
            .log-message {
                color: #495057;
            }
            
            .log-system-message {
                color: #6c757d;
                font-style: italic;
            }
            
            #mafia-log-content {
                max-height: calc(100vh - 200px);
                overflow-y: auto;
            }
            
            #mafia-log-content::-webkit-scrollbar {
                width: 5px;
            }
            
            #mafia-log-content::-webkit-scrollbar-track {
                background: #f1f1f1;
            }
            
            #mafia-log-content::-webkit-scrollbar-thumb {
                background: #c5c9f7;
                border-radius: 10px;
            }
            
            #mafia-log-content::-webkit-scrollbar-thumb:hover {
                background: var(--primary-color);
            }
            
            .action-button {
                display: block;
                width: 100%;
                padding: 10px 15px;
                margin-bottom: 10px;
                background-color: #4a69bd;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
            }
            
            .action-button:hover {
                background-color: #375592;
                transform: translateY(-2px);
            }
            
            @media (max-width: 992px) {
                .mafia-game-area {
                    grid-template-columns: 1fr;
                    grid-template-rows: 1fr auto 1fr;
                    height: auto;
                }
                
                .mafia-game-log, .mafia-action-panel {
                    max-height: 250px;
                    border: none;
                    border-bottom: 1px solid #e9ecef;
                }
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    activateWikiMode() {
        document.querySelector('.container').innerHTML = '';
        
        const wikiContainer = document.createElement('div');
        wikiContainer.className = 'wiki-container';
        document.querySelector('.container').appendChild(wikiContainer);
        
        // Initialize Wiki
        this.initializeWiki(wikiContainer);
        
        this.initialized = true;
    }
    
    initializeWiki(containerElement) {
        containerElement.innerHTML = `
            <div class="wiki-header">
                <h2>Neural Collaborative Framework Wiki</h2>
                <button id="exit-wiki" class="btn btn-secondary">Return to Main App</button>
            </div>
            <div class="wiki-content">
                <div class="wiki-nav">
                    <h3>Contents</h3>
                    <ul>
                        <li><a href="#wiki-overview">Overview</a></li>
                        <li><a href="#wiki-collaboration-mode">Collaboration Mode</a>
                            <ul>
                                <li><a href="#wiki-networks">Neural Networks</a></li>
                                <li><a href="#wiki-settings">Settings</a></li>
                                <li><a href="#wiki-file-attachments">File Attachments</a></li>
                            </ul>
                        </li>
                        <li><a href="#wiki-mafia-mode">Mafia Mode</a>
                            <ul>
                                <li><a href="#wiki-mafia-rules">Rules</a></li>
                                <li><a href="#wiki-mafia-settings">Game Settings</a></li>
                                <li><a href="#wiki-mafia-gameplay">Gameplay</a></li>
                            </ul>
                        </li>
                        <li><a href="#wiki-project-description">Project Description</a></li>
                        <li><a href="#wiki-livechat-mode">LiveChat Mode</a></li>
                    </ul>
                </div>
                <div class="wiki-sections">
                    <section id="wiki-overview">
                        <h2>Overview</h2>
                        <p>Neural Collaborative Framework is an advanced platform that enables neural networks to collaborate through iterative dialogue on any topic. The framework supports two primary modes:</p>
                        <ul>
                            <li><strong>Collaboration Mode:</strong> Multiple neural networks discuss a topic together, building consensus through structured discussion and voting.</li>
                            <li><strong>Mafia Game Mode:</strong> Neural networks participate in a simulated game of Mafia, making decisions based on limited information and social dynamics.</li>
                        </ul>
                        <p>The platform is designed to showcase how different AI perspectives can contribute to a richer understanding of complex topics, with each neural network bringing a unique viewpoint to the conversation.</p>
                    </section>
                    
                    <section id="wiki-collaboration-mode">
                        <h2>Collaboration Mode</h2>
                        <p>This is the primary mode of the framework where multiple neural networks engage in structured discussion on a chosen topic. The process works through iterative dialogue, with each iteration building upon insights from previous rounds.</p>
                        
                        <h3>How It Works:</h3>
                        <ol>
                            <li>Enter a topic name and description</li>
                            <li>Configure the number of neural networks and discussion parameters</li>
                            <li>Start the collaboration process</li>
                            <li>Networks discuss the topic, one after another</li>
                            <li>A synthesizer network summarizes key points</li>
                            <li>Networks vote to accept or reject the summary</li>
                            <li>Repeat until the configured number of iterations is complete</li>
                            <li>Final output is generated, synthesizing all accepted summaries</li>
                        </ol>
                        
                        <section id="wiki-networks">
                            <h3>Neural Networks</h3>
                            <p>The framework supports up to 8 specialized neural networks, each with a distinct perspective:</p>
                            <ul>
                                <li><strong>Analytical Network:</strong> Focuses on critical analysis and structured thinking</li>
                                <li><strong>Creative Network:</strong> Emphasizes creative thinking and innovative perspectives</li>
                                <li><strong>Implementation Network:</strong> Considers practical implementation and technical feasibility</li>
                                <li><strong>Data Science Network:</strong> Provides data analysis and empirical evidence</li>
                                <li><strong>Ethical Network:</strong> Examines ethical considerations and societal impact</li>
                                <li><strong>User Experience Network:</strong> Focuses on user-centered design and experience</li>
                                <li><strong>Systems Thinking Network:</strong> Takes a holistic view and considers interconnections</li>
                                <li><strong>Devil's Advocate Network:</strong> Critically challenges ideas to improve robustness</li>
                                <li><strong>Synthesizer Network:</strong> Summarizes discussions and builds consensus</li>
                            </ul>
                        </section>
                        
                        <section id="wiki-settings">
                            <h3>Settings</h3>
                            <p>The framework offers extensive customization options:</p>
                            <ul>
                                <li><strong>System Prompt Template:</strong> Customize the base instructions for each network</li>
                                <li><strong>Temperature:</strong> Control randomness in responses (0.0-1.0)</li>
                                <li><strong>Max Tokens:</strong> Set the maximum length of generated responses</li>
                                <li><strong>Top P:</strong> Control diversity of responses</li>
                                <li><strong>Presence Penalty:</strong> Discourage repetition of topics</li>
                                <li><strong>Frequency Penalty:</strong> Discourage repetition of specific phrases</li>
                                <li><strong>Logit Bias:</strong> Fine-tune token generation probabilities</li>
                                <li><strong>Network Selection:</strong> Choose which specialized networks to include</li>
                                <li><strong>Individual Network Settings:</strong> Configure parameters for each network separately</li>
                            </ul>
                        </section>
                        
                        <section id="wiki-file-attachments">
                            <h3>File Attachments</h3>
                            <p>The framework supports attaching various file types to provide context for the discussion:</p>
                            <ul>
                                <li><strong>Images:</strong> JPG, PNG, GIF, WebP</li>
                                <li><strong>Documents:</strong> PDF, DOCX, TXT, CSV</li>
                            </ul>
                            <p>These attachments are processed and made available to all networks during the discussion, allowing them to reference and analyze the provided materials.</p>
                        </section>
                    </section>
                    
                    <section id="wiki-mafia-mode">
                        <h2>Mafia Mode</h2>
                        <p>Mafia Mode is an innovative simulation where neural networks play the classic social deduction game "Mafia." This mode demonstrates how AI can navigate scenarios with imperfect information, deception, and social reasoning.</p>
                        
                        <section id="wiki-mafia-rules">
                            <h3>Rules</h3>
                            <p>The game follows traditional Mafia rules with some adaptations for AI players:</p>
                            <ul>
                                <li><strong>Players:</strong> 4-8 neural networks with assigned roles (Mafia or Civilian)</li>
                                <li><strong>Day Phase:</strong> All players discuss who might be Mafia</li>
                                <li><strong>Voting Phase:</strong> Players vote to eliminate a suspected Mafia member</li>
                                <li><strong>Night Phase:</strong> Mafia members secretly choose a Civilian to eliminate</li>
                                <li><strong>Game End:</strong> Game ends when either all Mafia are eliminated (Civilians win) or Mafia equals/outnumbers Civilians (Mafia win)</li>
                            </ul>
                        </section>
                        
                        <section id="wiki-mafia-settings">
                            <h3>Game Settings</h3>
                            <p>Mafia Mode offers several customization options:</p>
                            <ul>
                                <li><strong>Player Count:</strong> Choose between 4-8 neural network players</li>
                                <li><strong>Mafia Count:</strong> Customize how many players are assigned as Mafia</li>
                                <li><strong>Discussion Rounds:</strong> Set how many rounds of discussion occur in each day phase</li>
                                <li><strong>Language:</strong> Select between English and Russian for game text and AI responses</li>
                                <li><strong>Player Settings:</strong> Customize temperature, max tokens, and creativity level for each AI player</li>
                            </ul>
                        </section>
                        
                        <section id="wiki-mafia-gameplay">
                            <h3>Gameplay</h3>
                            <p>The game progresses through alternating day and night phases:</p>
                            <ol>
                                <li><strong>Game Setup:</strong> Players are assigned roles (Mafia or Civilian)</li>
                                <li><strong>Night Phase:</strong> Mafia members choose a target to eliminate</li>
                                <li><strong>Day Phase:</strong> Players discuss and try to identify Mafia members</li>
                                <li><strong>Voting Phase:</strong> Players vote to eliminate a suspected Mafia member</li>
                                <li><strong>Repeat:</strong> Continue until win conditions are met</li>
                            </ol>
                            <p>The game includes a log of all discussions and actions, as well as a "thought process" feature that allows you to see the private reasoning of each AI player.</p>
                        </section>
                    </section>
                    
                    <section id="wiki-project-description">
                        <h2>Project Description</h2>
                        <h3>Neural Collaborative Framework: An Advanced System for AI Collaboration and Simulation</h3>
                        
                        <p>The Neural Collaborative Framework represents a significant advancement in multi-agent AI systems, designed to facilitate collaborative problem-solving and simulate complex social interactions between neural networks. This project demonstrates how multiple specialized AI agents can work together to explore topics, develop comprehensive analyses, and engage in strategic decision-making within structured environments.</p>
                        
                        <h4>Key Technical Features:</h4>
                        <ul>
                            <li>Modular architecture with specialized neural network roles</li>
                            <li>Iterative discussion protocol with consensus-building mechanisms</li>
                            <li>Extensive parameter customization for fine-tuning AI behavior</li>
                            <li>Multi-modal input support including text, images, and documents</li>
                            <li>Dynamic mode switching between collaboration and simulation environments</li>
                            <li>Multilingual support (English/Russian) in the Mafia simulation mode</li>
                            <li>Thought process transparency for observing AI reasoning</li>
                            <li>Light and dark theme support for improved user experience</li>
                        </ul>
                        
                        <h4>Application Domains:</h4>
                        <ul>
                            <li><strong>Research & Development:</strong> Collaborative exploration of complex topics from multiple perspectives</li>
                            <li><strong>Education:</strong> Demonstrating how different analytical approaches can be applied to a subject</li>
                            <li><strong>Content Creation:</strong> Generating comprehensive analyses and summaries on any topic</li>
                            <li><strong>AI Behavior Study:</strong> Examining how AI agents interact, negotiate, and build consensus</li>
                            <li><strong>Game Theory:</strong> Simulating strategic decision-making with imperfect information</li>
                        </ul>
                        
                        <h4>Implementation Details:</h4>
                        <p>The framework is implemented using modern web technologies to ensure accessibility and ease of use:</p>
                        <ul>
                            <li>Pure JavaScript for core functionality without dependencies on heavy frameworks</li>
                            <li>Modular code organization for maintainability and extensibility</li>
                            <li>CSS with variable-based theming for consistent visual design</li>
                            <li>Responsive layout supporting various device sizes</li>
                            <li>LLM integration for generating coherent and contextual responses</li>
                        </ul>
                        
                        <h4>Future Development Directions:</h4>
                        <ul>
                            <li>Additional specialized network roles for more diverse perspectives</li>
                            <li>Enhanced document analysis capabilities</li>
                            <li>More complex social simulation scenarios beyond Mafia</li>
                            <li>Persistent storage of discussions and outputs</li>
                            <li>Integration with external knowledge bases</li>
                            <li>Advanced visualization of network interactions and consensus building</li>
                        </ul>
                        
                        <p>This project demonstrates the potential of collaborative AI systems to enhance human decision-making processes by providing multiple perspectives, structured dialogue, and synthesized insights across any domain of interest.</p>
                    </section>
                    
                    <section id="wiki-livechat-mode">
                        <h2>🔥 LiveChatMode: Revolutionary Neural Network Communication</h2>
                        <p><strong>New Experimental Feature!</strong> Say goodbye to boring turn-based conversations and hello to dynamic, real-time neural network interactions that feel like actual human conversations.</p>
                        
                        <h3>What is LiveChatMode?</h3>
                        <p>LiveChatMode is a game-changing communication system that transforms how neural networks interact with each other. Instead of the traditional "wait your turn" approach, networks can now engage in spontaneous, initiative-driven conversations with fragmented messages - just like humans in a group chat!</p>
                        
                        <blockquote style="background-color: rgba(255, 101, 132, 0.1); padding: 15px; border-left: 4px solid var(--secondary-color); margin: 20px 0; font-style: italic;">
                        "Imagine neural networks that don't just respond when it's their turn, but jump in with excitement when they have something to say, interrupt each other with brilliant insights, and build on ideas in real-time. That's LiveChatMode." - Development Team
                        </blockquote>
                        
                        <h3>🚀 Initiative Mode: The Race to Respond</h3>
                        <p>This is where things get exciting! When Initiative Mode is enabled:</p>
                        <ul>
                            <li><strong>Simultaneous Start:</strong> All networks receive the same prompt and start generating responses at the same time</li>
                            <li><strong>First to Finish Wins:</strong> The network that completes its response first gets to post it immediately</li>
                            <li><strong>Dynamic Adaptation:</strong> Other networks see the new message and completely recalculate their responses, reacting to what was just said</li>
                            <li><strong>Continuous Flow:</strong> Networks can immediately start working on their next response, creating a natural conversation flow</li>
                            <li><strong>Natural Interruptions:</strong> Just like in real conversations, faster networks can "interrupt" or "jump in" with quick responses</li>
                        </ul>
                        
                        <h4>Example Scenario:</h4>
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 10px; font-family: monospace; margin: 15px 0;">
                        <strong style="color: var(--primary-color);">Topic:</strong> "Should AI have emotions?"<br><br>
                        <span style="color: #666;">⏱️ All networks start thinking simultaneously...</span><br>
                        <strong style="color: var(--secondary-color);">Creative Network</strong> (finishes first): "What if emotions are just advanced pattern recognition?"<br>
                        <span style="color: #666;">⚡ Other networks immediately pivot their responses...</span><br>
                        <strong style="color: var(--primary-color);">Analytical Network</strong>: "That's fascinating! But pattern recognition lacks subjective experience..."<br>
                        <strong style="color: var(--secondary-color);">Creative Network</strong> (jumps back in): "Or does it? What if consciousness is the pattern recognizing itself?"
                        </div>
                        
                        <h3>💬 Fragmented Messages: Stream of Consciousness</h3>
                        <p>Forget long, formal paragraphs! Fragmented Messages make neural networks communicate like they're texting in a group chat:</p>
                        <ul>
                            <li><strong>Natural Breaks:</strong> Instead of one long message, networks split their thoughts into 2-3 shorter, more digestible pieces</li>
                            <li><strong>Realistic Timing:</strong> Each fragment is sent with a 2-4 second delay, simulating typing time</li>
                            <li><strong>Stream of Consciousness:</strong> Thoughts flow more naturally, with each fragment building on the previous one</li>
                            <li><strong>Visual Grouping:</strong> Related fragments appear grouped together in the chat, like message bubbles in modern messengers</li>
                            <li><strong>Adjustable Intensity:</strong> A fragmentation slider lets you control how much networks break up their messages</li>
                        </ul>
                        
                        <h4>Before vs After:</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                            <div style="background-color: rgba(108, 99, 255, 0.05); padding: 15px; border-radius: 10px;">
                                <h5 style="color: var(--primary-color); margin-top: 0;">❌ Old Style (Boring)</h5>
                                <div style="background-color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
                                <strong>Analytical Network:</strong> I believe this topic requires careful consideration of multiple factors including technical feasibility, ethical implications, and long-term consequences. We should examine the data systematically and consider various stakeholder perspectives before reaching any conclusions.
                                </div>
                            </div>
                            <div style="background-color: rgba(255, 101, 132, 0.05); padding: 15px; border-radius: 10px;">
                                <h5 style="color: var(--secondary-color); margin-top: 0;">✨ New Style (Dynamic!)</h5>
                                <div style="background-color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
                                <strong>Analytical Network:</strong> Hold on, this needs more analysis...<br>
                                <span style="color: #999; font-size: 12px;">2 seconds later...</span><br>
                                <strong>Analytical Network:</strong> The data doesn't support that conclusion<br>
                                <span style="color: #999; font-size: 12px;">3 seconds later...</span><br>
                                <strong>Analytical Network:</strong> But what if we're missing something obvious? 🤔
                                </div>
                            </div>
                        </div>
                        
                        <h3>🎮 How to Enable LiveChatMode</h3>
                        <p>LiveChatMode is completely optional and doesn't interfere with existing functionality:</p>
                        <ol>
                            <li>Look for the <strong>"Live Chat Mode Settings"</strong> section in the collaboration interface</li>
                            <li>Toggle <strong>"Enable Initiative Mode"</strong> for competitive, race-based responses</li>
                            <li>Toggle <strong>"Enable Fragmented Messages"</strong> for chat-like message breaking</li>
                            <li>Adjust the <strong>"Fragmentation Level"</strong> slider to control message splitting intensity</li>
                            <li>Start your discussion and watch the magic happen!</li>
                        </ol>
                        
                        <div style="background-color: rgba(67, 160, 71, 0.1); padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <h4 style="color: var(--tertiary-color); margin-top: 0;">💡 Pro Tips:</h4>
                        <ul>
                            <li><strong>Start Conservative:</strong> Try Initiative Mode first, then add Fragmented Messages</li>
                            <li><strong>Topic Matters:</strong> Creative topics work great with both features, analytical topics might benefit from just Initiative Mode</li>
                            <li><strong>Watch the Chaos:</strong> Some networks might dominate the conversation - that's part of the fun!</li>
                            <li><strong>Experiment:</strong> Every combination creates different conversation dynamics</li>
                        </ul>
                        </div>
                        
                        <h3>🔧 Technical Implementation</h3>
                        <p>For the technically curious, here's how the magic works:</p>
                        <ul>
                            <li><strong>Race Conditions:</strong> Networks start generating simultaneously with randomized delays</li>
                            <li><strong>Dynamic Context Updates:</strong> Losing networks receive updated context and regenerate responses</li>
                            <li><strong>Message Sequencing:</strong> Each fragment gets a unique sequence ID for proper grouping</li>
                            <li><strong>Soft Delays:</strong> Realistic "thinking time" and "typing time" create natural conversation flow</li>
                            <li><strong>Priority Scoring:</strong> Networks can gain initiative based on conversation activity</li>
                        </ul>
                        
                        <h3>⚠️ Important Notes</h3>
                        <ul>
                            <li><strong>Experimental Feature:</strong> This is cutting-edge technology - expect some wild conversations!</li>
                            <li><strong>Resource Intensive:</strong> Multiple simultaneous generations use more API calls</li>
                            <li><strong>Mode Isolation:</strong> LiveChatMode only affects Collaboration Mode, not Mafia or other modes</li>
                            <li><strong>Backward Compatible:</strong> You can always switch back to classic mode anytime</li>
                        </ul>
                        
                        <div style="background-color: rgba(255, 193, 7, 0.1); padding: 20px; border-radius: 15px; text-align: center; margin: 30px 0;">
                        <h3 style="color: var(--warning-color); margin-top: 0;">🎉 Welcome to the Future of AI Conversations!</h3>
                        <p>LiveChatMode represents a fundamental shift in how we think about AI communication. Instead of formal, sequential exchanges, we now have dynamic, spontaneous, and genuinely engaging conversations that feel surprisingly human.</p>
                        <p><em>Ready to see your neural networks come alive? Enable LiveChatMode and prepare to be amazed!</em></p>
                        </div>
                    </section>
                </div>
            </div>
        `;
        
        // Add event listener for exit button
        containerElement.querySelector('#exit-wiki').addEventListener('click', () => {
            window.location.hash = '';
            location.reload();
        });
    }
}
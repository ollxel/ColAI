<img width="605" height="353" alt="Screenshot" src="https://github.com/ollxel/ColAI/blob/e43b2b9d1c76448a2e083264c7b2dec09b43a596/image1" />

Russian README - [README_RU.md](README_RU.md)
# ColAI - Collaborative AI Ecosystem

ColAI is a fully offline platform for collaborative work of multiple neural networks. The system allows multiple AI models to communicate with each other, play games (such as Mafia), discuss projects and work together using local Ollama models.

## 🚀 Key Features

- **Collaborative Mode**: Up to 8 specialized neural networks work together on any topic
- **Mafia Mode**: AI players participate in Mafia game with realistic behavior
- **Fully Offline**: Everything works locally through Ollama, no dependency on external APIs
- **Flexible Model Configuration**: Choice of any Ollama model at startup
- **Multimodality**: Support for image and document uploads
- **Live Chat**: Dynamic communication between networks with initiative and fragmented messages

## 📋 System Requirements

### Minimum Requirements:
- **OS**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+)
- **RAM**: 8 GB (16 GB recommended for large models)
- **Storage**: 20 GB free space (for models)
- **CPU**: Modern processor with AVX2 support
- **GPU**: Optional, but NVIDIA GPU with 6+ GB VRAM recommended for better performance

### Recommended Requirements:
- **RAM**: 32 GB
- **GPU**: NVIDIA RTX 3060 or better (12+ GB VRAM)
- **Storage**: 50+ GB SSD

## 📦 Installation

### Step 1: Install Node.js

1. Download Node.js from the [official website](https://nodejs.org/)
2. Install the LTS version (18.x or higher recommended)
3. Verify installation:
```bash
node --version
npm --version
```

Step 2: Install Ollama

Windows:

1. Download the installer from ollama.ai
2. Run the installer and follow instructions
3. Ollama will be automatically added to PATH

macOS:

```bash
brew install ollama
# or download from ollama.ai
```

Linux:

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

Step 3: Start Ollama

Open terminal and run:

```bash
ollama serve
```

Ollama will be available at http://localhost:11434

Important: Ollama must be running before using ColAI!

Step 4: Download Models

Recommended models for ColAI:

```bash
# Main model (recommended)
ollama pull qwen2.5:14b

# Alternative models
ollama pull llama3.2:3b        # Lightweight model for weak PCs
ollama pull deepseek-r1         # For analytical tasks
ollama pull gemma2:2b          # For Mafia games
ollama pull mistral:7b         # Universal model
```

Note: The qwen2.5:14b model requires ~8 GB RAM. For systems with less memory, use qwen2.5:7b or llama3.2:3b.

Step 5: Install ColAI

1. Extract the project archive
2. Open terminal in the project folder
3. Install dependencies (if required):

```bash
npm install
```

Note: ColAI uses native ES modules and can work without npm by opening index.html directly in the browser. However, for better compatibility, using a local server is recommended.

Step 6: Start Local Server (Optional)

To run via local server:

```bash
# Using Python (if installed)
python -m http.server 8000

# Or using Node.js http-server
npx http-server -p 8000

# Or using PHP
php -S localhost:8000
```

Then open in browser: http://localhost:8000

Alternative: You can open index.html directly in the browser (Chrome, Firefox, Edge).

🎮 Usage

First Launch

1. Ensure Ollama is running:
   · Open terminal and run ollama serve
   · Or check that the Ollama process is running
2. Open ColAI in browser
3. Configure model:
   · In the "Ollama Model" field, enter the model name (e.g.: qwen2.5:14b)
   · Click "Check Connection" to verify Ollama availability
   · Ensure the model is downloaded: ollama pull qwen2.5:14b
4. Start working:
   · Enter project name
   · Describe discussion topic
   · Configure parameters (temperature, tokens, etc.)
   · Click "Start Collaboration"

<img width="605" height="353" alt="Screenshot" src="https://github.com/ollxel/ColAI/blob/e43b2b9d1c76448a2e083264c7b2dec09b43a596/image2" />


Collaborative Mode

1. Project Setup:
   · Enter project name
   · Describe discussion topic
   · Upload files if needed (images, PDF, text)
2. Network Selection:
   · Select which neural networks participate (up to 8 networks)
   · Each network has its own specialization:
     · Analytical Network: Critical analysis
     · Creative Network: Creative thinking
     · Implementation Network: Practical implementation
     · Data Science Network: Data analysis
     · Ethical Network: Ethical issues
     · User Experience Network: User experience
     · Systems Thinking Network: Systems thinking
     · Devil's Advocate Network: Critical validation
3. Parameter Configuration:
   · Temperature: Controls response randomness (0.0-2.0)
   · Max Tokens: Maximum response length
   · Top P: Diversity control
   · Iterations: Number of discussion iterations
4. Start Discussion:
   · Click "Start Collaboration"
   · Networks will start discussing the topic in turns
   · After each round, a summary is created
   · Networks vote to accept the summary
   · Process repeats until all iterations are completed

Mafia Mode

1. Navigate to Mafia mode through navigation menu
2. Configure game:
   · Number of players (4-8)
   · Number of mafia members
   · Number of discussion rounds
   · Game language (Russian/English)
3. Click "Start Game"
4. Game proceeds through day and night phases
5. You can view each player's "thoughts"

⚙️ Configuration

Model Selection

When starting a project, enter the Ollama model name in the "Ollama Model" field. Examples:

· qwen2.5:14b - Recommended model (14B parameters)
· qwen2.5:7b - Lightweight version (7B parameters)
· llama3.2:3b - Lightweight model for weak PCs
· deepseek-r1 - For analytical tasks
· mistral:7b - Universal model

The model is saved in localStorage and will be used on next launch.

Model Parameter Configuration

In the "Model Settings" section, you can configure:

· System Prompt Template: System prompt template for networks
· Temperature: Generation temperature (0.0-2.0)
· Max Tokens: Maximum tokens in response
· Top P: Diversity parameter (0.0-1.0)
· Presence Penalty: Penalty for topic repetition
· Frequency Penalty: Penalty for phrase repetition

Configuration for Different Models

For Large Models (14B+):

· Use more RAM (16+ GB)
· Increase max_tokens for longer responses
· Decrease temperature for more deterministic responses

For Small Models (3B-7B):

· Decrease max_tokens (500-1000)
· Increase temperature for more creative responses
· Use fewer networks simultaneously

🔧 Troubleshooting

Ollama Not Connecting

Problem: "Ollama not available"

Solutions:

1. Ensure Ollama is running: ollama serve
2. Check if Ollama is accessible: open http://localhost:11434/api/tags in browser
3. Restart Ollama
4. Check if firewall is blocking port 11434

Model Not Found

Problem: "Model not found"

Solutions:

1. Check model list: ollama list
2. Download model: ollama pull <model_name>
3. Ensure model name is entered correctly (including tag, e.g.: qwen2.5:14b)

Slow Performance

Problem: Models respond very slowly

Solutions:

1. Use a smaller model (e.g., qwen2.5:7b instead of qwen2.5:14b)
2. Decrease max_tokens in settings
3. Use GPU acceleration (install CUDA for NVIDIA GPU)
4. Close other applications, free up RAM
5. Use fewer networks simultaneously

Memory Errors

Problem: "Out of memory" or browser freezes

Solutions:

1. Use a smaller model
2. Reduce number of active networks
3. Close other browser tabs
4. Increase virtual memory (Windows) or swap (Linux/macOS)

CORS Errors

Problem: CORS errors when accessing Ollama

Solutions:

1. Ensure you're opening via http://localhost or local server
2. Don't open index.html directly via file://
3. Use local web server (see Installation Step 6)

📚 Additional Information

Supported File Formats

· Images: JPG, PNG, GIF, WebP
· Documents: PDF, DOCX, TXT, CSV

Interface Languages

Interface supports multiple languages including:

· Russian
· English
· Español
· Français
· Deutsch
· And many more...

Data Storage

All settings and selected model are saved in browser's localStorage. Discussions can also be saved locally.

Result Export

Discussion results can be exported in formats:

· JSON
· TXT
· HTML

🛠️ Development

Project Structure

```
ColAI-master/
├── app.js                 # Main application file
├── index.html             # HTML interface
├── styles.css             # Styles
├── darkModeManager.js      # Dark theme management
└── modules/
    ├── framework.js        # Main framework
    ├── networkManager.js  # Network management
    ├── ollamaManager.js    # Ollama manager
    ├── mafiaMode.js        # Mafia mode
    ├── mafiaAiClient.js    # AI client for Mafia
    └── ...                 # Other modules
```

Technologies

· Frontend: Vanilla JavaScript (ES6+ modules)
· Backend: Ollama (local)
· Styling: CSS3 with variables
· Markup: HTML5

📝 License

See LICENSE file in project root.

🤝 Support

If you encounter problems:

1. Check the "Troubleshooting" section
2. Ensure Ollama is installed and running
3. Check that model is downloaded: ollama list
4. Check browser logs (F12 → Console)

🎯 Performance Recommendations

For Optimal Performance:

1. Use GPU: Install CUDA for NVIDIA GPU
2. Choose Suitable Model:
   · For weak PCs: llama3.2:3b or qwen2.5:7b
   · For medium PCs: qwen2.5:14b
   · For powerful PCs: qwen2.5:32b or llama3.1:70b
3. Configure Parameters: Decrease max_tokens for faster responses
4. Use Fewer Networks: 2-4 networks work faster than 8

🔄 Updates

To update ColAI:

1. Download new version
2. Replace project files
3. Update Ollama models: ollama pull <model>

To update models:

```bash
ollama pull qwen2.5:14b  # Updates model to latest version
```

---

Enjoy using ColAI! 🚀

If you have questions or suggestions, create an issue in the project repository.



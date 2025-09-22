// This file has been refactored and split into multiple modules
// Import the main framework class from the new module structure
import { NeuralCollaborativeFramework } from './modules/framework.js';
import { MafiaMode } from './modules/mafiaMode.js';
import { DarkModeManager } from './darkModeManager.js';

// Initialize the framework when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Dark Mode Manager
    const darkModeManager = new DarkModeManager();
    
    // Set up the theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    
    // Update icons based on current mode
    if (darkModeManager.isDarkMode()) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
    
    themeToggle.addEventListener('click', () => {
        const isDarkMode = darkModeManager.toggle();
        
        if (isDarkMode) {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    });
    
    // Initialize the mafia mode first
    const mafiaMode = new MafiaMode();
    mafiaMode.initialize();
    
    // Only initialize the main framework if we're not in mafia or wiki mode
    if (window.location.hash !== '#mafia' && window.location.hash !== '#wiki') {
        const framework = new NeuralCollaborativeFramework();
    }
});
class DarkModeManager {
    constructor() {
        this.darkModeEnabled = localStorage.getItem('darkMode') === 'true';
        this.init();
    }
    
    init() {
        // Apply saved preference on initial load
        if (this.darkModeEnabled) {
            document.body.classList.add('dark-mode');
        }
    }
    
    toggle() {
        this.darkModeEnabled = !this.darkModeEnabled;
        
        if (this.darkModeEnabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // Save preference to localStorage
        localStorage.setItem('darkMode', this.darkModeEnabled);
        
        return this.darkModeEnabled;
    }
    
    isDarkMode() {
        return this.darkModeEnabled;
    }
}

export { DarkModeManager };
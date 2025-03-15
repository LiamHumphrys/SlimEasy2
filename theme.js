/**
 * SlimEasy Theme Management
 * Handles theme setting, loading and toggle functionality
 */

// Initialize theme when page loads
function initializeTheme() {
    // First load the theme
    loadTheme();
    
    // Then create the toggle button
    createThemeToggle();
}

/**
 * Load theme based on saved preference or device setting
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // Use saved user preference
        setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Use system preference (dark mode)
        setTheme('dark');
    } else {
        // Default to light mode
        setTheme('light');
    }
}

/**
 * Set theme by updating data-theme attribute and saving to localStorage
 * @param {string} themeName - 'light' or 'dark'
 */
function setTheme(themeName) {
    // Save to localStorage for persistence
    localStorage.setItem('theme', themeName);
    
    // Update document root attribute
    document.documentElement.setAttribute('data-theme', themeName);
    
    // Update any existing toggle button
    const existingToggle = document.querySelector('.theme-toggle');
    if (existingToggle) {
        existingToggle.innerHTML = themeName === 'dark' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }
}

/**
 * Create theme toggle button and add to document
 */
function createThemeToggle() {
    // Prevent multiple toggle buttons
    if (document.querySelector('.theme-toggle')) {
        return;
    }
    
    // Create button
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Toggle dark/light mode');
    themeToggle.setAttribute('title', 'Toggle dark/light mode');
    
    // Set initial icon based on current theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    themeToggle.innerHTML = currentTheme === 'dark' 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    
    // Add click handler
    themeToggle.addEventListener('click', toggleTheme);
    
    // Add to document
    document.body.appendChild(themeToggle);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Apply the new theme
    setTheme(newTheme);
}

// Export the theme functions for use in other files
window.initializeTheme = initializeTheme;
window.setTheme = setTheme;
window.toggleTheme = toggleTheme;
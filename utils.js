/**
 * SlimEasy Utility Functions
 * Common utility functions for use across the application
 */

/**
 * Safely parse JSON from localStorage with error handling
 * @param {string} key - localStorage key to retrieve
 * @param {*} defaultValue - Default value if key not found or invalid
 * @returns {*} Parsed value or default
 */
function getFromStorage(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error(`Error retrieving ${key} from localStorage:`, error);
        return defaultValue;
    }
}

/**
 * Safely save JSON to localStorage with error handling
 * @param {string} key - localStorage key to set
 * @param {*} value - Value to stringify and store
 * @returns {boolean} Success status
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
        return false;
    }
}

/**
 * Format a number with specified precision
 * @param {number} value - Number to format
 * @param {number} precision - Decimal places to round to
 * @returns {string} Formatted number
 */
function formatNumber(value, precision = 0) {
    return Number(value).toFixed(precision);
}

/**
 * Create an element with specified attributes and children
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Element attributes 
 * @param {Array|string} children - Child elements or text content
 * @returns {HTMLElement} Created element
 */
function createElement(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    
    // Add attributes
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'class' || key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Add children
    if (typeof children === 'string' || typeof children === 'number') {
        element.textContent = children;
    } else if (Array.isArray(children)) {
        children.forEach(child => {
            if (child instanceof HTMLElement) {
                element.appendChild(child);
            } else if (child !== null && child !== undefined) {
                element.appendChild(document.createTextNode(String(child)));
            }
        });
    }
    
    return element;
}

/**
 * Debounce a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Show a notification toast
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', 'info', 'warning'
 * @param {number} duration - Time in ms to show notification
 */
function showNotification(message, type = 'success', duration = 3000) {
    // Check if notification container exists
    let container = document.getElementById('notification-container');
    
    if (!container) {
        container = createElement('div', {
            id: 'notification-container',
            style: {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: '1000'
            }
        });
        document.body.appendChild(container);
    }
    
    // Set color based on type
    const colors = {
        success: 'var(--success-color, #4CAF50)',
        error: 'var(--error-color, #F44336)',
        warning: 'var(--warning-color, #FFC107)',
        info: 'var(--info-color, #2196F3)'
    };
    
    // Create notification element
    const notification = createElement('div', {
        style: {
            backgroundColor: colors[type] || colors.info,
            color: 'white',
            padding: '15px',
            margin: '10px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            transform: 'translateX(100%)',
            opacity: '0',
            transition: 'all 0.3s'
        }
    }, [
        createElement('i', {
            class: `fas fa-${type === 'success' ? 'check-circle' : 
                  type === 'error' ? 'exclamation-circle' :
                  type === 'warning' ? 'exclamation-triangle' : 'info-circle'}`,
            style: {
                marginRight: '10px'
            }
        }),
        message
    ]);
    
    // Add to container
    container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 50);
    
    // Remove after duration
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (container.contains(notification)) {
                container.removeChild(notification);
            }
        }, 300);
    }, duration);
}

/**
 * Register service worker for PWA functionality
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker failed:', err));
        });
    }
}

/**
 * Set up mobile menu toggle functionality
 */
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('mainNavLinks');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('show');
            
            // Change icon based on state
            const icon = this.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('show')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        });
    }
}

/**
 * Check user login status and redirect if not logged in
 */
function checkUserLogin() {
    // Check if user is logged in
    const currentUser = getFromStorage('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    
    // Display welcome message
    const welcomeElement = document.getElementById('welcomeMessage');
    if (welcomeElement && currentUser.name) {
        welcomeElement.textContent = `Welcome, ${currentUser.name}`;
    }
    
    return true;
}

/**
 * Initialize common page elements and behavior
 */
function initializePage() {
    // First initialize theme
    initializeTheme();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Check user login
    return checkUserLogin();
}

// Export utilities to global scope
window.getFromStorage = getFromStorage;
window.saveToStorage = saveToStorage;
window.formatNumber = formatNumber;
window.createElement = createElement;
window.debounce = debounce;
window.showNotification = showNotification;
window.registerServiceWorker = registerServiceWorker;
window.setupMobileMenu = setupMobileMenu;
window.checkUserLogin = checkUserLogin;
window.initializePage = initializePage;
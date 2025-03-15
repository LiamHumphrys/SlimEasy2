// Exercise definitions with METs (Metabolic Equivalent of Task)
const exercises = {
    "running_5mph": 8, 
    "running_6mph": 10, 
    "running_7mph": 12,
    "walking_3mph": 3, 
    "walking_4mph": 4, 
    "walking_5mph": 5,
    "cycling_10mph": 6, 
    "cycling_12mph": 8, 
    "cycling_14mph": 10
};

// Get user information from localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { email: 'guest' };
const profileKey = currentUser.email ? `profile_${currentUser.email}` : 'profile_guest';
const profile = JSON.parse(localStorage.getItem(profileKey)) || {};

// Get weight from profile, or use default if not available
const currentWeight = profile ? (parseFloat(profile.weightKg) || parseFloat(profile.weight) || 70) : 70;

// Constants for conversions
const kcalToKj = 4.184;

// Track added exercises during this session
let sessionExercises = [];

document.getElementById('exerciseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const dayIndex = parseInt(document.getElementById('exerciseDay').value);
    const exerciseType = document.getElementById('exerciseType').value;
    const duration = parseInt(document.getElementById('duration').value);

    // Calculate calories burned using MET formula
    const met = exercises[exerciseType];
    const caloriesBurned = Math.round(met * currentWeight * (duration / 60));
    
    // Get exercise name from select option
    const exerciseTypeSelect = document.getElementById('exerciseType');
    let exerciseName = "Exercise";
    
    if (exerciseTypeSelect && exerciseTypeSelect.selectedIndex >= 0) {
        exerciseName = exerciseTypeSelect.options[exerciseTypeSelect.selectedIndex].text.split(' - ')[0];
    }
    
    // Save to localStorage with validation
    const userKey = currentUser && currentUser.email ? `planner_${currentUser.email}` : 'planner_guest';
    
    // Initialize arrays with proper validation
    let weeklyCalories, weeklyExercise, weeklyFoods;
    
    try {
        const caloriesData = localStorage.getItem(`${userKey}_calories`);
        weeklyCalories = caloriesData ? JSON.parse(caloriesData) : [0,0,0,0,0,0,0];
        // Validate array
        if (!Array.isArray(weeklyCalories) || weeklyCalories.length !== 7) {
            weeklyCalories = [0,0,0,0,0,0,0];
        }
    } catch (e) {
        console.error('Error parsing calories data:', e);
        weeklyCalories = [0,0,0,0,0,0,0];
    }
    
    try {
        const exerciseData = localStorage.getItem(`${userKey}_exercise`);
        weeklyExercise = exerciseData ? JSON.parse(exerciseData) : [0,0,0,0,0,0,0];
        // Validate array
        if (!Array.isArray(weeklyExercise) || weeklyExercise.length !== 7) {
            weeklyExercise = [0,0,0,0,0,0,0];
        }
    } catch (e) {
        console.error('Error parsing exercise data:', e);
        weeklyExercise = [0,0,0,0,0,0,0];
    }
    
    try {
        const foodsData = localStorage.getItem(`${userKey}_foods`);
        weeklyFoods = foodsData ? JSON.parse(foodsData) : [[],[],[],[],[],[],[]];
        // Validate array
        if (!Array.isArray(weeklyFoods) || weeklyFoods.length !== 7) {
            weeklyFoods = [[],[],[],[],[],[],[]];
        }
    } catch (e) {
        console.error('Error parsing foods data:', e);
        weeklyFoods = [[],[],[],[],[],[],[]];
    }

    // Update storage
    weeklyExercise[dayIndex] += caloriesBurned;
    weeklyFoods[dayIndex].push({
        text: `${exerciseName} (${duration} min, ${caloriesBurned} kcal)`,
        cal: caloriesBurned,
        type: 'exercise'
    });

    localStorage.setItem(`${userKey}_calories`, JSON.stringify(weeklyCalories));
    localStorage.setItem(`${userKey}_exercise`, JSON.stringify(weeklyExercise));
    localStorage.setItem(`${userKey}_foods`, JSON.stringify(weeklyFoods));

    // Track this exercise for the session
    sessionExercises.push({
        name: exerciseName,
        duration: duration,
        calories: caloriesBurned,
        day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex]
    });

    // Update summary display
    updateExerciseSummary();
    
    // Reset form
    document.getElementById('exerciseForm').reset();
    
    // Show a notification
    showNotification(`Added: ${exerciseName} - ${caloriesBurned} kcal burned`);
});

// Update the exercise summary display
function updateExerciseSummary() {
    const summary = document.getElementById('exerciseSummary');
    
    if (sessionExercises.length === 0) {
        summary.textContent = '';
        summary.classList.remove('visible');
        return;
    }
    
    const lastExercise = sessionExercises[sessionExercises.length - 1];
    
    // Show the most recently added exercise
    summary.innerHTML = `
        <strong>Added:</strong> ${lastExercise.name} for ${lastExercise.duration} min on ${lastExercise.day} 
        (${lastExercise.calories} kcal / ${Math.round(lastExercise.calories * kcalToKj)} kJ burned)
    `;
    
    summary.classList.add('visible');
}

// Show a temporary notification
function showNotification(message) {
    // Check if notification container exists, otherwise create it
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.bottom = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '1000';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    notification.style.backgroundColor = 'var(--primary-color)';
    notification.style.color = 'white';
    notification.style.padding = '12px 15px';
    notification.style.marginTop = '10px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '10px';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.transition = 'opacity 0.3s, transform 0.3s';
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize based on URL parameters if available
document.addEventListener('DOMContentLoaded', function() {
    // Check URL for parameters from tracker page
    const urlParams = new URLSearchParams(window.location.search);
    const today = new Date().getDay(); // 0 is Sunday in JS
    const dayIndex = today === 0 ? 6 : today - 1; // Convert to our 0-based index (Monday = 0)
    
    // Pre-select current day of the week
    document.getElementById('exerciseDay').value = dayIndex;
});
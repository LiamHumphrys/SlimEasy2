/**
 * SlimEasy - Profile Form Handler
 * Handles unit conversions, BMR/TDEE calculations, and profile storage
 */

// Constants for unit conversions
const CONVERSION = {
    LB_TO_KG: 0.453592,
    FT_TO_CM: 30.48,
    IN_TO_CM: 2.54,
    MONTHS_TO_WEEKS: 4.345
};

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const heightUnitSelect = document.getElementById('heightUnit');
    const heightInchesField = document.getElementById('heightInches');
    const userForm = document.getElementById('userForm');
    
    // Only add listeners if elements exist (prevents errors on other pages)
    if (heightUnitSelect && heightInchesField) {
        // Initial state
        heightInchesField.style.display = heightUnitSelect.value === 'ft' ? 'inline' : 'none';
        
        // Toggle inches field based on height unit selection
        heightUnitSelect.addEventListener('change', function() {
            heightInchesField.style.display = this.value === 'ft' ? 'inline' : 'none';
        });
    }
    
    // Handle form submission
    if (userForm) {
        userForm.addEventListener('submit', handleProfileSubmission);
    }
});

/**
 * Handle profile form submission
 * @param {Event} e - Form submission event
 */
function handleProfileSubmission(e) {
    e.preventDefault();
    
    // Get form values
    const formData = getFormValues();
    
    // Convert to metric for calculations
    const metricValues = convertToMetric(formData);
    
    // Calculate BMR and TDEE
    const bmr = calculateBMR(metricValues.weight, metricValues.height, formData.age, formData.gender);
    const tdee = bmr * formData.activity;
    
    // Save profile data
    saveProfileData(formData, bmr, tdee);
    
    // Navigate to tracker page
    window.location.href = `tracker.html?bmr=${bmr}&tdee=${tdee}&weight=${metricValues.weight}&goal=${metricValues.goal}&time=${metricValues.time}`;
}

/**
 * Get all values from the profile form
 * @returns {Object} Form data
 */
function getFormValues() {
    return {
        age: parseInt(document.getElementById('age').value) || 0,
        weight: parseFloat(document.getElementById('weight').value) || 0,
        height: parseFloat(document.getElementById('height').value) || 0,
        heightInches: parseFloat(document.getElementById('heightInches').value) || 0,
        gender: document.getElementById('gender').value,
        activity: parseFloat(document.getElementById('activity').value) || 1.2,
        goal: parseFloat(document.getElementById('goal').value) || 0,
        time: parseFloat(document.getElementById('time').value) || 1,
        weightUnit: document.getElementById('weightUnit').value,
        heightUnit: document.getElementById('heightUnit').value,
        goalUnit: document.getElementById('goalUnit').value,
        timeUnit: document.getElementById('timeUnit').value
    };
}

/**
 * Convert imperial measurements to metric for calculations
 * @param {Object} data - Form data
 * @returns {Object} Metric values
 */
function convertToMetric(data) {
    let weight = data.weight;
    let height = data.height;
    let goal = data.goal;
    let time = data.time;
    
    // Convert weight to kg if needed
    if (data.weightUnit === 'lb') weight *= CONVERSION.LB_TO_KG;
    
    // Convert height to cm if needed
    if (data.heightUnit === 'ft') {
        height = (height * CONVERSION.FT_TO_CM) + (data.heightInches * CONVERSION.IN_TO_CM);
    }
    
    // Convert goal weight to kg if needed
    if (data.goalUnit === 'lb') goal *= CONVERSION.LB_TO_KG;
    
    // Convert time to weeks if needed
    if (data.timeUnit === 'months') time *= CONVERSION.MONTHS_TO_WEEKS;
    
    return { weight, height, goal, time };
}

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor formula
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} BMR value
 */
function calculateBMR(weight, height, age, gender) {
    // Use standard formula with gender adjustment
    const baseFormula = 10 * weight + 6.25 * height - 5 * age;
    return gender === 'male' ? baseFormula + 5 : baseFormula - 161;
}

/**
 * Save profile data to localStorage
 * @param {Object} formData - Original form data
 * @param {number} bmr - Calculated BMR
 * @param {number} tdee - Calculated TDEE
 */
function saveProfileData(formData, bmr, tdee) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.email) {
            console.error('User not logged in');
            return;
        }
        
        const profileKey = `profile_${currentUser.email}`;
        const profileData = {
            ...formData,
            bmr: Math.round(bmr),
            tdee: Math.round(tdee)
        };
        
        localStorage.setItem(profileKey, JSON.stringify(profileData));
    } catch (error) {
        console.error('Error saving profile data:', error);
    }
}
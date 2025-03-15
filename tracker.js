// Parse URL parameters with fallback to avoid NaN
const urlParams = new URLSearchParams(window.location.search);
const bmr = parseFloat(urlParams.get('bmr')) || 0;
const tdee = parseFloat(urlParams.get('tdee')) || 0;
const currentWeight = parseFloat(urlParams.get('weight')) || 0;
const goalWeight = parseFloat(urlParams.get('goal')) || 0;
const timeWeeks = parseFloat(urlParams.get('time')) || 0;
const goalCalories = parseFloat(urlParams.get('goalCalories')) || 0;

// Constants for unit conversions
const kcalToKj = 4.184;
const kgToLb = 2.20462;
const unitMultipliers = {
    g: 0.01, cup: 2.4, oz: 0.2835, tbsp: 0.15, tsp: 0.05, unit: 1
};

// Use goalCalories from URL if provided, otherwise calculate with validation
let dailyGoal;

// Check if we have all necessary values for calculation
if (goalCalories > 0) {
    dailyGoal = goalCalories;
} else if (tdee > 0 && currentWeight > goalWeight && timeWeeks > 0) {
    // Calculate from weight loss target
    dailyGoal = tdee - ((currentWeight - goalWeight) * 7700 / (timeWeeks * 7));
} else {
    // Fallback to TDEE or a reasonable default
    dailyGoal = tdee > 0 ? tdee : 2000;
}

// Round and ensure a reasonable value
dailyGoal = isNaN(dailyGoal) || !isFinite(dailyGoal) || dailyGoal < 1200 ? tdee : Math.round(dailyGoal);

// Calculate daily deficit for display (with fallback to avoid NaN)
const dailyDeficit = !isNaN(tdee) && !isNaN(dailyGoal) ? tdee - dailyGoal : 0; // Reflects the actual deficit used

// Display initial values with units
document.getElementById('bmr').textContent = bmr.toFixed(0);
document.getElementById('bmrUnits').textContent = `kcal (${Math.round(bmr * kcalToKj)} kJ)`;
document.getElementById('tdee').textContent = tdee.toFixed(0);
document.getElementById('tdeeUnits').textContent = `kcal (${Math.round(tdee * kcalToKj)} kJ)`;
document.getElementById('dailyDeficit').textContent = Math.round(dailyDeficit);
document.getElementById('deficitUnits').textContent = `kcal (${Math.round(dailyDeficit * kcalToKj)} kJ)`;
document.getElementById('dailyGoal').textContent = dailyGoal;
document.getElementById('goalUnits').textContent = `kcal (${Math.round(dailyGoal * kcalToKj)} kJ)`;
document.getElementById('goalDisplay').textContent = `${dailyGoal} kcal (${Math.round(dailyGoal * kcalToKj)} kJ)`;

// Weight displays
const weightDisplay = `${currentWeight} kg (${Math.round(currentWeight * kgToLb)} lb)`;
const goalWeightDisplay = `${goalWeight} kg (${Math.round(goalWeight * kgToLb)} lb)`;

// Load or initialize planner data with safeguards
const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { email: 'guest' };
const userKey = `planner_${currentUser.email}`;
let weeklyCalories = JSON.parse(localStorage.getItem(`${userKey}_calories`));
let weeklyExercise = JSON.parse(localStorage.getItem(`${userKey}_exercise`));
let weeklyFoods = JSON.parse(localStorage.getItem(`${userKey}_foods`));

// Force reset if invalid or extreme
if (!Array.isArray(weeklyCalories) || weeklyCalories.length !== 7 || weeklyCalories.some(val => val < -1000 || val > 10000)) {
    console.log('Resetting weeklyCalories due to invalid data:', weeklyCalories);
    weeklyCalories = [0, 0, 0, 0, 0, 0, 0];
    localStorage.setItem(`${userKey}_calories`, JSON.stringify(weeklyCalories));
} else {
    weeklyCalories = weeklyCalories.map(val => parseFloat(val) || 0);
}

if (!Array.isArray(weeklyExercise) || weeklyExercise.length !== 7 || weeklyExercise.some(val => val < -1000 || val > 10000)) {
    console.log('Resetting weeklyExercise due to invalid data:', weeklyExercise);
    weeklyExercise = [0, 0, 0, 0, 0, 0, 0];
    localStorage.setItem(`${userKey}_exercise`, JSON.stringify(weeklyExercise));
} else {
    weeklyExercise = weeklyExercise.map(val => parseFloat(val) || 0);
}

if (!Array.isArray(weeklyFoods) || weeklyFoods.length !== 7) {
    console.log('Resetting weeklyFoods due to invalid data:', weeklyFoods);
    weeklyFoods = [[], [], [], [], [], [], []];
    localStorage.setItem(`${userKey}_foods`, JSON.stringify(weeklyFoods));
}

// 300 Common Ingredients (full list)
const ingredients = [
    // Meats (25)
    { name: "Chicken Breast (100g)", calories: 165, defaultUnit: "100g" },
    { name: "Chicken Thigh (100g)", calories: 209, defaultUnit: "100g" },
    { name: "Chicken Drumstick (100g)", calories: 172, defaultUnit: "100g" },
    { name: "Turkey Breast (100g)", calories: 135, defaultUnit: "100g" },
    { name: "Turkey Leg (100g)", calories: 208, defaultUnit: "100g" },
    { name: "Beef Steak (100g)", calories: 271, defaultUnit: "100g" },
    { name: "Ground Beef 80/20 (100g)", calories: 254, defaultUnit: "100g" },
    { name: "Beef Ribeye (100g)", calories: 291, defaultUnit: "100g" },
    { name: "Pork Chop (100g)", calories: 231, defaultUnit: "100g" },
    { name: "Pork Belly (100g)", calories: 518, defaultUnit: "100g" },
    { name: "Bacon (1 slice)", calories: 43, defaultUnit: "unit" },
    { name: "Ham (100g)", calories: 145, defaultUnit: "100g" },
    { name: "Lamb Chop (100g)", calories: 294, defaultUnit: "100g" },
    { name: "Sausage (1 link)", calories: 85, defaultUnit: "unit" },
    { name: "Pepperoni (1 oz)", calories: 138, defaultUnit: "oz" },
    { name: "Salmon (100g)", calories: 206, defaultUnit: "100g" },
    { name: "Tuna (100g)", calories: 144, defaultUnit: "100g" },
    { name: "Cod (100g)", calories: 82, defaultUnit: "100g" },
    { name: "Tilapia (100g)", calories: 96, defaultUnit: "100g" },
    { name: "Shrimp (100g)", calories: 99, defaultUnit: "100g" },
    { name: "Crab (100g)", calories: 83, defaultUnit: "100g" },
    { name: "Lobster (100g)", calories: 77, defaultUnit: "100g" },
    { name: "Duck Breast (100g)", calories: 337, defaultUnit: "100g" },
    { name: "Venison (100g)", calories: 158, defaultUnit: "100g" },
    { name: "Bison (100g)", calories: 143, defaultUnit: "100g" },

    // Fruits (25)
    { name: "Apple (1 medium)", calories: 95, defaultUnit: "unit" },
    { name: "Banana (1 medium)", calories: 105, defaultUnit: "unit" },
    { name: "Orange (1 medium)", calories: 62, defaultUnit: "unit" },
    { name: "Strawberries (1 cup)", calories: 49, defaultUnit: "cup" },
    { name: "Blueberries (1 cup)", calories: 83, defaultUnit: "cup" },
    { name: "Raspberries (1 cup)", calories: 64, defaultUnit: "cup" },
    { name: "Blackberries (1 cup)", calories: 62, defaultUnit: "cup" },
    { name: "Grapes (1 cup)", calories: 104, defaultUnit: "cup" },
    { name: "Pineapple (1 cup)", calories: 82, defaultUnit: "cup" },
    { name: "Mango (1 cup)", calories: 99, defaultUnit: "cup" },
    { name: "Peach (1 medium)", calories: 59, defaultUnit: "unit" },
    { name: "Pear (1 medium)", calories: 101, defaultUnit: "unit" },
    { name: "Watermelon (1 cup)", calories: 46, defaultUnit: "cup" },
    { name: "Cantaloupe (1 cup)", calories: 53, defaultUnit: "cup" },
    { name: "Honeydew (1 cup)", calories: 61, defaultUnit: "cup" },
    { name: "Kiwi (1 medium)", calories: 42, defaultUnit: "unit" },
    { name: "Plum (1 medium)", calories: 30, defaultUnit: "unit" },
    { name: "Cherry (1 cup)", calories: 87, defaultUnit: "cup" },
    { name: "Pomegranate (1 cup)", calories: 144, defaultUnit: "cup" },
    { name: "Grapefruit (1 medium)", calories: 52, defaultUnit: "unit" },
    { name: "Apricot (1 medium)", calories: 17, defaultUnit: "unit" },
    { name: "Fig (1 medium)", calories: 37, defaultUnit: "unit" },
    { name: "Date (1 piece)", calories: 20, defaultUnit: "unit" },
    { name: "Cranberries (1 cup)", calories: 46, defaultUnit: "cup" },
    { name: "Lemon (1 medium)", calories: 17, defaultUnit: "unit" },

    // Vegetables (25)
    { name: "Broccoli (1 cup)", calories: 55, defaultUnit: "cup" },
    { name: "Carrots (1 cup)", calories: 52, defaultUnit: "cup" },
    { name: "Spinach (1 cup)", calories: 7, defaultUnit: "cup" },
    { name: "Kale (1 cup)", calories: 33, defaultUnit: "cup" },
    { name: "Potato (1 medium)", calories: 130, defaultUnit: "unit" },
    { name: "Sweet Potato (1 medium)", calories: 103, defaultUnit: "unit" },
    { name: "Tomato (1 medium)", calories: 22, defaultUnit: "unit" },
    { name: "Cucumber (1 cup)", calories: 16, defaultUnit: "cup" },
    { name: "Bell Pepper (1 medium)", calories: 25, defaultUnit: "unit" },
    { name: "Zucchini (1 cup)", calories: 33, defaultUnit: "cup" },
    { name: "Cauliflower (1 cup)", calories: 25, defaultUnit: "cup" },
    { name: "Brussels Sprouts (1 cup)", calories: 56, defaultUnit: "cup" },
    { name: "Asparagus (1 cup)", calories: 27, defaultUnit: "cup" },
    { name: "Green Beans (1 cup)", calories: 31, defaultUnit: "cup" },
    { name: "Peas (1 cup)", calories: 118, defaultUnit: "cup" },
    { name: "Corn (1 cup)", calories: 132, defaultUnit: "cup" },
    { name: "Onion (1 medium)", calories: 44, defaultUnit: "unit" },
    { name: "Garlic (1 clove)", calories: 4, defaultUnit: "unit" },
    { name: "Mushrooms (1 cup)", calories: 15, defaultUnit: "cup" },
    { name: "Eggplant (1 cup)", calories: 20, defaultUnit: "cup" },
    { name: "Celery (1 stalk)", calories: 6, defaultUnit: "unit" },
    { name: "Radish (1 cup)", calories: 19, defaultUnit: "cup" },
    { name: "Beet (1 medium)", calories: 35, defaultUnit: "unit" },
    { name: "Cabbage (1 cup)", calories: 22, defaultUnit: "cup" },
    { name: "Lettuce (1 cup)", calories: 5, defaultUnit: "cup" },

    // Grains & Cereals (25)
    { name: "Brown Rice (1 cup cooked)", calories: 218, defaultUnit: "cup" },
    { name: "White Rice (1 cup cooked)", calories: 205, defaultUnit: "cup" },
    { name: "Quinoa (1 cup cooked)", calories: 222, defaultUnit: "cup" },
    { name: "Oats (1 cup cooked)", calories: 154, defaultUnit: "cup" },
    { name: "Whole Wheat Bread (1 slice)", calories: 81, defaultUnit: "unit" },
    { name: "White Bread (1 slice)", calories: 79, defaultUnit: "unit" },
    { name: "Pasta (1 cup cooked)", calories: 131, defaultUnit: "cup" },
    { name: "Couscous (1 cup cooked)", calories: 176, defaultUnit: "cup" },
    { name: "Barley (1 cup cooked)", calories: 193, defaultUnit: "cup" },
    { name: "Bulgur (1 cup cooked)", calories: 151, defaultUnit: "cup" },
    { name: "Millet (1 cup cooked)", calories: 207, defaultUnit: "cup" },
    { name: "Cornmeal (1 cup cooked)", calories: 94, defaultUnit: "cup" },
    { name: "Bagel (1 medium)", calories: 289, defaultUnit: "unit" },
    { name: "English Muffin (1 piece)", calories: 134, defaultUnit: "unit" },
    { name: "Pita Bread (1 medium)", calories: 165, defaultUnit: "unit" },
    { name: "Tortilla (1 medium)", calories: 90, defaultUnit: "unit" },
    { name: "Crackers (5 pieces)", calories: 70, defaultUnit: "unit" },
    { name: "Rice Cake (1 piece)", calories: 35, defaultUnit: "unit" },
    { name: "Granola (1 cup)", calories: 471, defaultUnit: "cup" },
    { name: "Cereal (Corn Flakes, 1 cup)", calories: 100, defaultUnit: "cup" },
    { name: "Cereal (Oatmeal Squares, 1 cup)", calories: 210, defaultUnit: "cup" },
    { name: "Popcorn (1 cup popped)", calories: 31, defaultUnit: "cup" },
    { name: "Pretzels (1 oz)", calories: 108, defaultUnit: "oz" },
    { name: "Rye Bread (1 slice)", calories: 83, defaultUnit: "unit" },
    { name: "Sourdough Bread (1 slice)", calories: 93, defaultUnit: "unit" },

    // Dairy (25)
    { name: "Milk (1 cup)", calories: 103, defaultUnit: "cup" },
    { name: "Skim Milk (1 cup)", calories: 83, defaultUnit: "cup" },
    { name: "Almond Milk (1 cup)", calories: 39, defaultUnit: "cup" },
    { name: "Soy Milk (1 cup)", calories: 80, defaultUnit: "cup" },
    { name: "Greek Yogurt (1 cup)", calories: 100, defaultUnit: "cup" },
    { name: "Plain Yogurt (1 cup)", calories: 112, defaultUnit: "cup" },
    { name: "Cheddar Cheese (1 oz)", calories: 113, defaultUnit: "oz" },
    { name: "Mozzarella (1 oz)", calories: 85, defaultUnit: "oz" },
    { name: "Parmesan (1 oz)", calories: 111, defaultUnit: "oz" },
    { name: "Swiss Cheese (1 oz)", calories: 106, defaultUnit: "oz" },
    { name: "Cream Cheese (1 tbsp)", calories: 51, defaultUnit: "tbsp" },
    { name: "Butter (1 tbsp)", calories: 102, defaultUnit: "tbsp" },
    { name: "Margarine (1 tbsp)", calories: 75, defaultUnit: "tbsp" },
    { name: "Sour Cream (1 tbsp)", calories: 23, defaultUnit: "tbsp" },
    { name: "Heavy Cream (1 tbsp)", calories: 51, defaultUnit: "tbsp" },
    { name: "Whipped Cream (1 tbsp)", calories: 8, defaultUnit: "tbsp" },
    { name: "Cottage Cheese (1 cup)", calories: 163, defaultUnit: "cup" },
    { name: "Ricotta Cheese (1 cup)", calories: 428, defaultUnit: "cup" },
    { name: "Feta Cheese (1 oz)", calories: 75, defaultUnit: "oz" },
    { name: "Goat Cheese (1 oz)", calories: 75, defaultUnit: "oz" },
    { name: "Blue Cheese (1 oz)", calories: 100, defaultUnit: "oz" },
    { name: "Ice Cream (1 cup)", calories: 267, defaultUnit: "cup" },
    { name: "Frozen Yogurt (1 cup)", calories: 221, defaultUnit: "cup" },
    { name: "Half and Half (1 tbsp)", calories: 20, defaultUnit: "tbsp" },
    { name: "Evaporated Milk (1 cup)", calories: 338, defaultUnit: "cup" },

    // Nuts & Seeds (25)
    { name: "Almonds (1 oz)", calories: 161, defaultUnit: "oz" },
    { name: "Peanuts (1 oz)", calories: 161, defaultUnit: "oz" },
    { name: "Walnuts (1 oz)", calories: 185, defaultUnit: "oz" },
    { name: "Cashews (1 oz)", calories: 157, defaultUnit: "oz" },
    { name: "Pecans (1 oz)", calories: 196, defaultUnit: "oz" },
    { name: "Hazelnuts (1 oz)", calories: 178, defaultUnit: "oz" },
    { name: "Macadamia Nuts (1 oz)", calories: 204, defaultUnit: "oz" },
    { name: "Pistachios (1 oz)", calories: 159, defaultUnit: "oz" },
    { name: "Brazil Nuts (1 oz)", calories: 186, defaultUnit: "oz" },
    { name: "Peanut Butter (1 tbsp)", calories: 94, defaultUnit: "tbsp" },
    { name: "Almond Butter (1 tbsp)", calories: 98, defaultUnit: "tbsp" },
    { name: "Cashew Butter (1 tbsp)", calories: 94, defaultUnit: "tbsp" },
    { name: "Sunflower Seeds (1 oz)", calories: 163, defaultUnit: "oz" },
    { name: "Pumpkin Seeds (1 oz)", calories: 151, defaultUnit: "oz" },
    { name: "Chia Seeds (1 oz)", calories: 137, defaultUnit: "oz" },
    { name: "Flaxseeds (1 oz)", calories: 150, defaultUnit: "oz" },
    { name: "Sesame Seeds (1 oz)", calories: 161, defaultUnit: "oz" },
    { name: "Hemp Seeds (1 oz)", calories: 166, defaultUnit: "oz" },
    { name: "Pine Nuts (1 oz)", calories: 191, defaultUnit: "oz" },
    { name: "Tahini (1 tbsp)", calories: 89, defaultUnit: "tbsp" },
    { name: "Trail Mix (1 oz)", calories: 131, defaultUnit: "oz" },
    { name: "Coconut (shredded, 1 oz)", calories: 99, defaultUnit: "oz" },
    { name: "Nutella (1 tbsp)", calories: 100, defaultUnit: "tbsp" },
    { name: "Peanut Oil (1 tbsp)", calories: 119, defaultUnit: "tbsp" },
    { name: "Sunflower Butter (1 tbsp)", calories: 99, defaultUnit: "tbsp" },

    // Legumes & Beans (25)
    { name: "Lentils (1 cup cooked)", calories: 230, defaultUnit: "cup" },
    { name: "Chickpeas (1 cup cooked)", calories: 269, defaultUnit: "cup" },
    { name: "Black Beans (1 cup cooked)", calories: 227, defaultUnit: "cup" },
    { name: "Kidney Beans (1 cup cooked)", calories: 225, defaultUnit: "cup" },
    { name: "Pinto Beans (1 cup cooked)", calories: 245, defaultUnit: "cup" },
    { name: "Navy Beans (1 cup cooked)", calories: 255, defaultUnit: "cup" },
    { name: "White Beans (1 cup cooked)", calories: 249, defaultUnit: "cup" },
    { name: "Soybeans (1 cup cooked)", calories: 298, defaultUnit: "cup" },
    { name: "Tofu (100g)", calories: 76, defaultUnit: "100g" },
    { name: "Tempeh (100g)", calories: 193, defaultUnit: "100g" },
    { name: "Edamame (1 cup)", calories: 121, defaultUnit: "cup" },
    { name: "Split Peas (1 cup cooked)", calories: 231, defaultUnit: "cup" },
    { name: "Fava Beans (1 cup cooked)", calories: 187, defaultUnit: "cup" },
    { name: "Lima Beans (1 cup cooked)", calories: 209, defaultUnit: "cup" },
    { name: "Mung Beans (1 cup cooked)", calories: 212, defaultUnit: "cup" },
    { name: "Adzuki Beans (1 cup cooked)", calories: 294, defaultUnit: "cup" },
    { name: "Black-Eyed Peas (1 cup cooked)", calories: 200, defaultUnit: "cup" },
    { name: "Hummus (1 tbsp)", calories: 25, defaultUnit: "tbsp" },
    { name: "Falafel (1 patty)", calories: 57, defaultUnit: "unit" },
    { name: "Peanut Soup (1 cup)", calories: 200, defaultUnit: "cup" },
    { name: "Bean Burrito (1 medium)", calories: 300, defaultUnit: "unit" },
    { name: "Lentil Soup (1 cup)", calories: 130, defaultUnit: "cup" },
    { name: "Chili with Beans (1 cup)", calories: 287, defaultUnit: "cup" },
    { name: "Refried Beans (1 cup)", calories: 217, defaultUnit: "cup" },
    { name: "Soy Milk (1 cup)", calories: 80, defaultUnit: "cup" },

    // Snacks & Sweets (25)
    { name: "Dark Chocolate (1 oz)", calories: 170, defaultUnit: "oz" },
    { name: "Milk Chocolate (1 oz)", calories: 152, defaultUnit: "oz" },
    { name: "Gummy Bears (1 oz)", calories: 100, defaultUnit: "oz" },
    { name: "Jelly Beans (1 oz)", calories: 105, defaultUnit: "oz" },
    { name: "Granola Bar (1 bar)", calories: 120, defaultUnit: "unit" },
    { name: "Protein Bar (1 bar)", calories: 200, defaultUnit: "unit" },
    { name: "Potato Chips (1 oz)", calories: 152, defaultUnit: "oz" },
    { name: "Tortilla Chips (1 oz)", calories: 138, defaultUnit: "oz" },
    { name: "Pretzels (1 oz)", calories: 108, defaultUnit: "oz" },
    { name: "Popcorn (1 cup popped)", calories: 31, defaultUnit: "cup" },
    { name: "Rice Cakes (1 piece)", calories: 35, defaultUnit: "unit" },
    { name: "Cookies (1 medium)", calories: 78, defaultUnit: "unit" },
    { name: "Brownie (1 square)", calories: 112, defaultUnit: "unit" },
    { name: "Donut (1 medium)", calories: 195, defaultUnit: "unit" },
    { name: "Muffin (1 medium)", calories: 200, defaultUnit: "unit" },
    { name: "Cake Slice (1 piece)", calories: 235, defaultUnit: "unit" },
    { name: "Candy Bar (Snickers, 1 bar)", calories: 215, defaultUnit: "unit" },
    { name: "Ice Cream (1 cup)", calories: 267, defaultUnit: "cup" },
    { name: "Pudding (1 cup)", calories: 160, defaultUnit: "cup" },
    { name: "Fruit Snack (1 oz)", calories: 90, defaultUnit: "oz" },
    { name: "Cheese Puffs (1 oz)", calories: 150, defaultUnit: "oz" },
    { name: "Crackers (5 pieces)", calories: 70, defaultUnit: "unit" },
    { name: "Trail Mix (1 oz)", calories: 131, defaultUnit: "oz" },
    { name: "Energy Gel (1 packet)", calories: 100, defaultUnit: "unit" },
    { name: "Chocolate Chip Cookie (1 large)", calories: 221, defaultUnit: "unit" },

    // Beverages (25)
    { name: "Coffee (black, 1 cup)", calories: 2, defaultUnit: "cup" },
    { name: "Green Tea (1 cup)", calories: 0, defaultUnit: "cup" },
    { name: "Black Tea (1 cup)", calories: 2, defaultUnit: "cup" },
    { name: "Orange Juice (1 cup)", calories: 112, defaultUnit: "cup" },
    { name: "Apple Juice (1 cup)", calories: 114, defaultUnit: "cup" },
    { name: "Grape Juice (1 cup)", calories: 152, defaultUnit: "cup" },
    { name: "Cranberry Juice (1 cup)", calories: 116, defaultUnit: "cup" },
    { name: "Sports Drink (8 oz)", calories: 60, defaultUnit: "oz" },
    { name: "Energy Drink (8 oz)", calories: 110, defaultUnit: "oz" },
    { name: "Cola (12 oz)", calories: 136, defaultUnit: "oz" },
    { name: "Diet Cola (12 oz)", calories: 0, defaultUnit: "oz" },
    { name: "Lemonade (1 cup)", calories: 99, defaultUnit: "cup" },
    { name: "Iced Tea (1 cup)", calories: 90, defaultUnit: "cup" },
    { name: "Beer (12 oz)", calories: 153, defaultUnit: "oz" },
    { name: "Wine (5 oz)", calories: 123, defaultUnit: "oz" },
    { name: "Vodka (1 oz)", calories: 64, defaultUnit: "oz" },
    { name: "Whiskey (1 oz)", calories: 64, defaultUnit: "oz" },
    { name: "Smoothie (1 cup)", calories: 130, defaultUnit: "cup" },
    { name: "Protein Shake (1 cup)", calories: 160, defaultUnit: "cup" },
    { name: "Coconut Water (1 cup)", calories: 46, defaultUnit: "cup" },
    { name: "Kombucha (1 cup)", calories: 30, defaultUnit: "cup" },
    { name: "Hot Chocolate (1 cup)", calories: 192, defaultUnit: "cup" },
    { name: "Latte (1 cup)", calories: 120, defaultUnit: "cup" },
    { name: "Cappuccino (1 cup)", calories: 60, defaultUnit: "cup" },
    { name: "Water (1 cup)", calories: 0, defaultUnit: "cup" },

    // Oils & Condiments (25)
    { name: "Olive Oil (1 tbsp)", calories: 119, defaultUnit: "tbsp" },
    { name: "Canola Oil (1 tbsp)", calories: 124, defaultUnit: "tbsp" },
    { name: "Coconut Oil (1 tbsp)", calories: 117, defaultUnit: "tbsp" },
    { name: "Vegetable Oil (1 tbsp)", calories: 120, defaultUnit: "tbsp" },
    { name: "Butter (1 tbsp)", calories: 102, defaultUnit: "tbsp" },
    { name: "Margarine (1 tbsp)", calories: 75, defaultUnit: "tbsp" },
    { name: "Mayonnaise (1 tbsp)", calories: 94, defaultUnit: "tbsp" },
    { name: "Ketchup (1 tbsp)", calories: 15, defaultUnit: "tbsp" },
    { name: "Mustard (1 tsp)", calories: 3, defaultUnit: "tsp" },
    { name: "Soy Sauce (1 tbsp)", calories: 8, defaultUnit: "tbsp" },
    { name: "Hot Sauce (1 tsp)", calories: 1, defaultUnit: "tsp" },
    { name: "BBQ Sauce (1 tbsp)", calories: 29, defaultUnit: "tbsp" },
    { name: "Honey (1 tbsp)", calories: 64, defaultUnit: "tbsp" },
    { name: "Maple Syrup (1 tbsp)", calories: 52, defaultUnit: "tbsp" },
    { name: "Jam (1 tbsp)", calories: 56, defaultUnit: "tbsp" },
    { name: "Peanut Butter (1 tbsp)", calories: 94, defaultUnit: "tbsp" },
    { name: "Ranch Dressing (1 tbsp)", calories: 73, defaultUnit: "tbsp" },
    { name: "Caesar Dressing (1 tbsp)", calories: 78, defaultUnit: "tbsp" },
    { name: "Vinaigrette (1 tbsp)", calories: 43, defaultUnit: "tbsp" },
    { name: "Salsa (1 tbsp)", calories: 4, defaultUnit: "tbsp" },
    { name: "Guacamole (1 tbsp)", calories: 23, defaultUnit: "tbsp" },
    { name: "Hummus (1 tbsp)", calories: 25, defaultUnit: "tbsp" },
    { name: "Tahini (1 tbsp)", calories: 89, defaultUnit: "tbsp" },
    { name: "Fish Sauce (1 tbsp)", calories: 10, defaultUnit: "tbsp" },
    { name: "Teriyaki Sauce (1 tbsp)", calories: 15, defaultUnit: "tbsp" },

    // Prepared Foods (25)
    { name: "Pizza Slice (1/8 of 12\")", calories: 200, defaultUnit: "unit" },
    { name: "Cheeseburger (1 medium)", calories: 300, defaultUnit: "unit" },
    { name: "Hamburger (1 medium)", calories: 240, defaultUnit: "unit" },
    { name: "Hot Dog (1 piece)", calories: 150, defaultUnit: "unit" },
    { name: "Chicken Nuggets (1 piece)", calories: 48, defaultUnit: "unit" },
    { name: "French Fries (1 cup)", calories: 312, defaultUnit: "cup" },
    { name: "Onion Rings (1 ring)", calories: 41, defaultUnit: "unit" },
    { name: "Salmon Sushi Roll (1 piece)", calories: 48, defaultUnit: "unit" },
    { name: "California Roll (1 piece)", calories: 33, defaultUnit: "unit" },
    { name: "Taco (1 medium)", calories: 150, defaultUnit: "unit" },
    { name: "Burrito (1 medium)", calories: 300, defaultUnit: "unit" },
    { name: "Sandwich (Turkey, 1 piece)", calories: 200, defaultUnit: "unit" },
    { name: "BLT Sandwich (1 piece)", calories: 240, defaultUnit: "unit" },
    { name: "Grilled Cheese (1 piece)", calories: 290, defaultUnit: "unit" },
    { name: "Pancake (1 medium)", calories: 88, defaultUnit: "unit" },
    { name: "Waffle (1 medium)", calories: 218, defaultUnit: "unit" },
    { name: "Omelette (2 eggs)", calories: 160, defaultUnit: "unit" },
    { name: "Fried Egg (1 large)", calories: 90, defaultUnit: "unit" },
    { name: "Scrambled Eggs (2 eggs)", calories: 140, defaultUnit: "unit" },
    { name: "Spaghetti with Sauce (1 cup)", calories: 221, defaultUnit: "cup" },
    { name: "Lasagna (1 piece)", calories: 336, defaultUnit: "unit" },
    { name: "Mac and Cheese (1 cup)", calories: 310, defaultUnit: "cup" },
    { name: "Chicken Soup (1 cup)", calories: 75, defaultUnit: "cup" },
    { name: "Vegetable Soup (1 cup)", calories: 98, defaultUnit: "cup" },
    { name: "Beef Stew (1 cup)", calories: 235, defaultUnit: "cup" }
];

// Populate Ingredient Dropdown
const ingredientSelect = document.getElementById('ingredient');
function populateIngredients(filter = '') {
    ingredientSelect.innerHTML = '';
    const filtered = ingredients.filter(ing => ing.name.toLowerCase().includes(filter.toLowerCase()));
    filtered.forEach(ing => {
        const option = document.createElement('option');
        option.value = JSON.stringify({ calories: ing.calories, unit: ing.defaultUnit });
        option.textContent = `${ing.name} (${ing.calories} kcal / ${Math.round(ing.calories * kcalToKj)} kJ per ${ing.defaultUnit})`;
        ingredientSelect.appendChild(option);
    });
}
populateIngredients();

// Event Listeners
document.getElementById('ingredientSearch').addEventListener('input', function(e) {
    populateIngredients(e.target.value);
});

// Quick add common foods
const quickAddFoods = [
    { name: "Banana", calories: 105, type: "snack" },
    { name: "Apple", calories: 95, type: "snack" },
    { name: "Greek Yogurt", calories: 150, type: "breakfast" },
    { name: "Oatmeal", calories: 158, type: "breakfast" },
    { name: "Scrambled Eggs", calories: 140, type: "breakfast" },
    { name: "Chicken Breast", calories: 165, type: "lunch" },
    { name: "Turkey Sandwich", calories: 330, type: "lunch" },
    { name: "Tuna Salad", calories: 180, type: "lunch" },
    { name: "Green Salad", calories: 50, type: "dinner" },
    { name: "Salmon Fillet", calories: 175, type: "dinner" },
    { name: "Brown Rice", calories: 215, type: "dinner" },
    { name: "Coffee with Milk", calories: 30, type: "breakfast" }
];

// Create quick add buttons
function createQuickAddButtons() {
    // Find or create the quick add container
    let quickAddContainer = document.getElementById('quickAddContainer');
    if (!quickAddContainer) {
        // Only add if in manual food section
        const manualSection = document.getElementById('manual');
        if (!manualSection) return;
        
        // Create container
        quickAddContainer = document.createElement('div');
        quickAddContainer.id = 'quickAddContainer';
        quickAddContainer.className = 'card';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'card-header';
        header.innerHTML = '<i class="fas fa-bolt"></i><h3 class="card-title">Quick Add Common Foods</h3>';
        
        // Create content
        const content = document.createElement('div');
        content.className = 'card-body';
        content.innerHTML = '<p>Click to quickly add common foods to your daily log:</p>';
        
        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'quick-add';
        
        // Add quick add food buttons
        quickAddFoods.forEach(food => {
            const button = document.createElement('button');
            button.className = 'quick-add-btn';
            button.setAttribute('data-calories', food.calories);
            button.setAttribute('data-name', food.name);
            button.setAttribute('data-type', food.type);
            button.innerHTML = `<i class="fas fa-utensils"></i> ${food.name}`;
            
            button.addEventListener('click', function(e) {
                e.preventDefault();
                // Get current day selection
                const dayIndex = parseInt(document.getElementById('manualDay').value);
                const calories = parseInt(this.getAttribute('data-calories'));
                const foodName = this.getAttribute('data-name');
                const mealType = this.getAttribute('data-type');
                
                // Add to planner
                addToPlanner(dayIndex, `${foodName} (${calories} kcal)`, calories, true, mealType);
                
                // Show feedback
                showQuickAddNotification(foodName, calories);
            });
            
            buttonsContainer.appendChild(button);
        });
        
        // Assemble and add to DOM
        content.appendChild(buttonsContainer);
        quickAddContainer.appendChild(header);
        quickAddContainer.appendChild(content);
        
        // Insert before the manual form
        const manualForm = document.getElementById('manualForm');
        manualSection.insertBefore(quickAddContainer, manualForm);
    }
}

// Show notification for quick add
function showQuickAddNotification(foodName, calories) {
    // Create notification container if it doesn't exist
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
    
    // Create notification
    const notification = document.createElement('div');
    notification.style.backgroundColor = 'var(--success-color)';
    notification.style.color = 'white';
    notification.style.padding = '15px';
    notification.style.margin = '10px';
    notification.style.borderRadius = 'var(--border-radius)';
    notification.style.boxShadow = 'var(--card-shadow)';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.transition = 'all 0.3s';
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    
    notification.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 10px;"></i> Added ${foodName} (${calories} kcal)`;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 50);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 300);
    }, 3000);
}

// Event listener for manual food form
document.getElementById('manualForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const dayIndex = parseInt(document.getElementById('manualDay').value);
    const mealType = document.getElementById('manualMealType').value;
    const foodName = document.getElementById('manualFoodName').value;
    const amount = parseFloat(document.getElementById('manualAmount').value) || 0;
    const unit = document.getElementById('manualUnit').value;
    const calories = unit === 'kcal' ? amount : Math.round(amount / kcalToKj);
    addToPlanner(dayIndex, `${foodName} (${amount} ${unit})`, calories, true, mealType);
    
    // Show notification
    showQuickAddNotification(foodName, calories);
    
    this.reset();
});

let mealIngredients = [];
let mealTotalCalories = 0;

document.getElementById('addIngredient').addEventListener('click', function() {
    const { calories, unit } = JSON.parse(document.getElementById('ingredient').value);
    const qty = parseFloat(document.getElementById('ingredientQty').value) || 0;
    const selectedUnit = document.getElementById('ingredientUnit').value;
    const baseMultiplier = unit === "100g" ? 100 : (unit === "cup" ? 1 : (unit === "oz" ? 1 : (unit === "tbsp" ? 1 : (unit === "tsp" ? 1 : 1))));
    const caloriesPerUnit = calories / (unit === "100g" ? 100 : baseMultiplier);
    const multiplier = unitMultipliers[selectedUnit] * (unit === "100g" ? 100 : 1);
    const adjustedCalories = Math.round(caloriesPerUnit * qty * multiplier);
    const foodText = document.getElementById('ingredient').options[document.getElementById('ingredient').selectedIndex].text;
    mealIngredients.push({ name: `${qty} ${selectedUnit} ${foodText}`, calories: adjustedCalories });
    mealTotalCalories += adjustedCalories;
    updateMealDisplay();
});

document.getElementById('removeIngredient').addEventListener('click', function() {
    if (mealIngredients.length > 0) {
        const lastIng = mealIngredients.pop();
        mealTotalCalories -= lastIng.calories;
        updateMealDisplay();
    }
});

document.getElementById('saveMealForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const dayIndex = parseInt(document.getElementById('mealDay').value);
    const mealType = document.getElementById('mealType').value;
    const mealName = document.getElementById('mealName').value;
    addToPlanner(dayIndex, `${mealName} (${mealIngredients.map(i => i.name).join(', ')})`, mealTotalCalories, true, mealType);
    mealIngredients = [];
    mealTotalCalories = 0;
    updateMealDisplay();
    this.reset();
});

document.getElementById('addExercise').addEventListener('click', function() {
    saveToStorage();
    window.location.href = `exercise.html?bmr=${bmr}&dailyGoal=${dailyGoal}&weight=${currentWeight}&goal=${goalWeight}&tdee=${tdee}&time=${timeWeeks}`;
});

// Helper Functions
function addToPlanner(dayIndex, itemText, calories, isFood = true, mealType = null) {
    calories = parseFloat(calories) || 0;
    if (isFood) {
        weeklyCalories[dayIndex] = (parseFloat(weeklyCalories[dayIndex]) || 0) + calories;
        weeklyFoods[dayIndex].push({ text: itemText, cal: calories, type: mealType });
    } else {
        weeklyExercise[dayIndex] = (parseFloat(weeklyExercise[dayIndex]) || 0) + calories;
        weeklyFoods[dayIndex].push({ text: itemText, cal: -calories, type: 'exercise' });
    }
    console.log('After addToPlanner:', { dayIndex, itemText, calories, weeklyCalories, weeklyExercise });
    updatePlanner();
    saveToStorage();
}

function updateMealDisplay() {
    const list = document.getElementById('mealIngredients');
    list.innerHTML = mealIngredients.map(i => `<li>${i.name}</li>`).join('');
    document.getElementById('mealCalories').textContent = mealTotalCalories;
    document.getElementById('mealKj').textContent = Math.round(mealTotalCalories * kcalToKj);
}

function updatePlanner() {
    try {
        const plannerBody = document.getElementById('plannerBody');
        if (!plannerBody) {
            console.error('Planner body element not found');
            return;
        }
        
        const rows = plannerBody.getElementsByTagName('tr');
        if (!rows || rows.length !== 7) {
            console.error('Expected 7 rows in planner, found', rows ? rows.length : 0);
            return;
        }
        
        let weeklyTotal = 0;
        let weeklyExerciseTotal = 0;
        const dailyGoalValue = parseFloat(dailyGoal) || 2000; // Use dailyGoal with fallback

        for (let i = 0; i < 7; i++) {
            const totalIntake = parseFloat(weeklyCalories[i]) || 0;
            const exerciseBurn = parseFloat(weeklyExercise[i]) || 0;
            weeklyTotal += totalIntake;
            weeklyExerciseTotal += exerciseBurn;
            const row = rows[i];
            const breakfastItems = weeklyFoods[i].filter(f => f.type === 'breakfast');
            const lunchItems = weeklyFoods[i].filter(f => f.type === 'lunch');
            const dinnerItems = weeklyFoods[i].filter(f => f.type === 'dinner');
            const snackItems = weeklyFoods[i].filter(f => f.type === 'snack');
            const exerciseItems = weeklyFoods[i].filter(f => f.type === 'exercise');
            row.cells[1].innerHTML = breakfastItems.length > 0 
                ? breakfastItems.map((f, idx) => `<span>${f.text}</span> <button class="remove-btn" onclick="removeItem(${i}, ${idx}, 'breakfast')">Remove</button>`).join('<br>')
                : 'None';
            row.cells[2].innerHTML = lunchItems.length > 0 
                ? lunchItems.map((f, idx) => `<span>${f.text}</span> <button class="remove-btn" onclick="removeItem(${i}, ${idx}, 'lunch')">Remove</button>`).join('<br>')
                : 'None';
            row.cells[3].innerHTML = dinnerItems.length > 0 
                ? dinnerItems.map((f, idx) => `<span>${f.text}</span> <button class="remove-btn" onclick="removeItem(${i}, ${idx}, 'dinner')">Remove</button>`).join('<br>')
                : 'None';
            row.cells[4].innerHTML = snackItems.length > 0 
                ? snackItems.map((f, idx) => `<span>${f.text}</span> <button class="remove-btn" onclick="removeItem(${i}, ${idx}, 'snack')">Remove</button>`).join('<br>')
                : 'None';
            row.cells[5].innerHTML = exerciseItems.length > 0 
                ? exerciseItems.map((f, idx) => `<span>${f.text}</span> <button class="remove-btn" onclick="removeItem(${i}, ${idx}, 'exercise')">Remove</button>`).join('<br>')
                : 'None';
            row.cells[6].textContent = `${totalIntake} kcal (${Math.round(totalIntake * kcalToKj)} kJ)`;
            row.cells[7].textContent = `${exerciseBurn} kcal (${Math.round(exerciseBurn * kcalToKj)} kJ)`;
            const netCalories = totalIntake - exerciseBurn;
            row.cells[8].textContent = `${netCalories} kcal (${Math.round(netCalories * kcalToKj)} kJ)`;
            const remaining = dailyGoalValue - totalIntake + exerciseBurn;
            row.cells[9].textContent = `${remaining} kcal (${Math.round(remaining * kcalToKj)} kJ)`;
            row.cells[9].className = remaining >= 0 ? 'green' : 'red';
        }
        document.getElementById('weeklyTotal').textContent = weeklyTotal;
        document.getElementById('weeklyTotalKj').textContent = Math.round(weeklyTotal * kcalToKj);
        document.getElementById('weeklyExercise').textContent = weeklyExerciseTotal;
        document.getElementById('weeklyExerciseKj').textContent = Math.round(weeklyExerciseTotal * kcalToKj);
        const weeklyGoal = dailyGoalValue * 7;
        const weeklyOutcome = weeklyGoal - (weeklyTotal - weeklyExerciseTotal);
        document.getElementById('weeklyOutcome').textContent = weeklyOutcome >= 0 
            ? `Deficit: ${Math.round(weeklyOutcome)} kcal (${Math.round(weeklyOutcome * kcalToKj)} kJ)` 
            : `Surplus: ${Math.abs(Math.round(weeklyOutcome))} kcal (${Math.abs(Math.round(weeklyOutcome * kcalToKj))} kJ)`;
        document.getElementById('weeklyOutcome').className = weeklyOutcome >= 0 ? 'green' : 'red';
        const weeklyDeficit = weeklyExerciseTotal + (tdee * 7 - weeklyTotal);
        const weightLostKg = weeklyDeficit > 0 ? weeklyDeficit / 7700 : 0;
        document.getElementById('weightLost').textContent = weightLostKg.toFixed(2);
        document.getElementById('weightLostLb').textContent = (weightLostKg * kgToLb).toFixed(2);
        let weeksToGoal = "N/A";
        if (weightLostKg > 0 && currentWeight > goalWeight) {
            weeksToGoal = ((currentWeight - goalWeight) / weightLostKg).toFixed(1);
            // Sanity check for ridiculous numbers
            if (weeksToGoal > 1000 || weeksToGoal < 0) weeksToGoal = "N/A";
        }
        document.getElementById('timeToGoal').textContent = weeksToGoal;
    } catch (error) {
        console.error('Error in updatePlanner:', error);
    }
}

function saveToStorage() {
    localStorage.setItem(`${userKey}_calories`, JSON.stringify(weeklyCalories));
    localStorage.setItem(`${userKey}_exercise`, JSON.stringify(weeklyExercise));
    localStorage.setItem(`${userKey}_foods`, JSON.stringify(weeklyFoods));
}

function removeItem(dayIndex, itemIndex, type) {
    const dayItems = weeklyFoods[dayIndex];
    const filteredItems = dayItems.filter(f => f.type === type);
    if (itemIndex < 0 || itemIndex >= filteredItems.length) {
        console.error('Invalid itemIndex:', itemIndex, 'for type:', type, 'in day:', dayIndex);
        return;
    }
    const item = filteredItems[itemIndex];
    const globalIndex = dayItems.indexOf(item);
    if (globalIndex === -1) {
        console.error('Item not found in dayItems at day:', dayIndex, 'item:', item);
        return;
    }
    if (type === 'exercise') {
        weeklyExercise[dayIndex] = Math.max(0, (parseFloat(weeklyExercise[dayIndex]) || 0) - Math.abs(item.cal));
    } else {
        weeklyCalories[dayIndex] = Math.max(0, (parseFloat(weeklyCalories[dayIndex]) || 0) - item.cal);
    }
    weeklyFoods[dayIndex].splice(globalIndex, 1);
    console.log('After removeItem:', { dayIndex, type, weeklyCalories, weeklyExercise });
    updatePlanner();
    saveToStorage();
}

document.getElementById('exportPlan').addEventListener('click', function() {
    const exportWindow = window.open('', '_blank');
    exportWindow.document.write(`
        <html>
        <head>
            <title>SlimEasy Meal Plan</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #2ecc71; text-align: center; }
                h2 { color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #2ecc71; color: white; }
                .green { color: green; }
                .red { color: red; }
            </style>
        </head>
        <body>
            <h1>SlimEasy Meal Plan</h1>
            <h2>Your Goals</h2>
            <p>Current Weight: ${weightDisplay}</p>
            <p>Goal Weight: ${goalWeightDisplay}</p>
            <p>Weeks to Goal: ${timeWeeks.toFixed(2)}</p>
            <p>BMR: ${bmr} kcal (${Math.round(bmr * kcalToKj)} kJ)</p>
            <p>TDEE: ${tdee} kcal (${Math.round(tdee * kcalToKj)} kJ)</p>
            <p>Daily Deficit: ${Math.round(dailyDeficit)} kcal (${Math.round(dailyDeficit * kcalToKj)} kJ)</p>
            <p>Daily Goal: ${dailyGoal} kcal (${Math.round(dailyGoal * kcalToKj)} kJ)</p>
            <h2>Weekly Meal Plan</h2>
            <table>
                <tr><th>Day</th><th>Breakfast</th><th>Lunch</th><th>Dinner</th><th>Snack</th><th>Exercises</th><th>Total Intake</th><th>Exercise Burn</th><th>Net Calories</th><th>Remaining Goal</th></tr>
                ${weeklyFoods.map((day, i) => `
                    <tr>
                        <td>${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]}</td>
                        <td>${day.filter(f => f.type === 'breakfast').map(f => f.text).join(', ') || 'None'}</td>
                        <td>${day.filter(f => f.type === 'lunch').map(f => f.text).join(', ') || 'None'}</td>
                        <td>${day.filter(f => f.type === 'dinner').map(f => f.text).join(', ') || 'None'}</td>
                        <td>${day.filter(f => f.type === 'snack').map(f => f.text).join(', ') || 'None'}</td>
                        <td>${day.filter(f => f.type === 'exercise').map(f => f.text).join(', ') || 'None'}</td>
                        <td>${weeklyCalories[i]} kcal (${Math.round(weeklyCalories[i] * kcalToKj)} kJ)</td>
                        <td>${weeklyExercise[i]} kcal (${Math.round(weeklyExercise[i] * kcalToKj)} kJ)</td>
                        <td>${weeklyCalories[i] - weeklyExercise[i]} kcal (${Math.round((weeklyCalories[i] - weeklyExercise[i]) * kcalToKj)} kJ)</td>
                        <td class="${(dailyGoal - weeklyCalories[i] + weeklyExercise[i]) >= 0 ? 'green' : 'red'}">${dailyGoal - weeklyCalories[i] + weeklyExercise[i]} kcal (${Math.round((dailyGoal - weeklyCalories[i] + weeklyExercise[i]) * kcalToKj)} kJ)</td>
                    </tr>
                `).join('')}
            </table>
            <h2>Weekly Summary</h2>
            <p>Total Weekly Intake: ${weeklyCalories.reduce((a, b) => a + b, 0)} kcal (${Math.round(weeklyCalories.reduce((a, b) => a + b, 0) * kcalToKj)} kJ)</p>
            <p>Total Weekly Exercise Burn: ${weeklyExercise.reduce((a, b) => a + b, 0)} kcal (${Math.round(weeklyExercise.reduce((a, b) => a + b, 0) * kcalToKj)} kJ)</p>
            <p>Weekly Outcome: ${document.getElementById('weeklyOutcome').textContent}</p>
            <p>Estimated Weight Lost: ${document.getElementById('weightLost').textContent} kg (${document.getElementById('weightLostLb').textContent} lb)</p>
            <p>Estimated Time to Goal: ${document.getElementById('timeToGoal').textContent} weeks</p>
        </body>
        </html>
    `);
    exportWindow.document.close();
});

// Initialize daily tips
function loadDailyTip() {
    const tips = [
        "Stay consistent with your tracking. Research shows that people who log their food regularly lose more weight and keep it off longer.",
        "Don't forget to drink water! Often thirst can be mistaken for hunger.",
        "Focus on progress, not perfection. Small, consistent changes lead to lasting results.",
        "Include protein with each meal to help you feel fuller longer.",
        "Plan your meals ahead of time to avoid last-minute unhealthy choices.",
        "Get enough sleep! Poor sleep is linked to increased appetite and cravings.",
        "A 10-minute walk after meals can help digestion and stabilize blood sugar.",
        "Eating slowly and mindfully helps you recognize when you're full.",
        "Focus on nutrient-dense foods rather than just calorie counting.",
        "Celebrate non-scale victories like increased energy and better-fitting clothes.",
        "Incorporate strength training to boost your metabolism.",
        "Remember that weight fluctuates naturally day to day.",
        "Prepping healthy snacks can help you avoid vending machines and drive-thrus.",
        "Find physical activities you enjoy rather than exercises you dread."
    ];
    
    // Get date-based index to keep the tip consistent for the whole day
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (24 * 60 * 60 * 1000));
    const tipIndex = dayOfYear % tips.length;
    
    const dailyTipElement = document.getElementById('dailyTip');
    if (dailyTipElement) {
        dailyTipElement.textContent = tips[tipIndex];
    }
}

// Initialize week selector
let currentWeekStart = getStartOfWeek(new Date());
let copiedWeekData = null;

function getStartOfWeek(date) {
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to get Monday
    return new Date(date.setDate(diff));
}

function formatWeekRange(startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const options = { month: 'short', day: 'numeric' };
    const startFormatted = startDate.toLocaleDateString('en-US', options);
    const endFormatted = endDate.toLocaleDateString('en-US', options);
    const yearFormatted = startDate.getFullYear();
    
    return `${startFormatted} - ${endFormatted}, ${yearFormatted}`;
}

function initializeWeekSelector() {
    const datePicker = document.getElementById('weekStartDate');
    const weekLabel = document.getElementById('weekLabel');
    const prevWeekBtn = document.getElementById('prevWeek');
    const nextWeekBtn = document.getElementById('nextWeek');
    const copyWeekBtn = document.getElementById('copyWeek');
    const pasteWeekBtn = document.getElementById('pasteWeek');
    
    if (!datePicker || !weekLabel) return;
    
    // Set initial date and label
    const formattedDate = currentWeekStart.toISOString().split('T')[0];
    datePicker.value = formattedDate;
    weekLabel.textContent = formatWeekRange(currentWeekStart);
    
    // Previous week button
    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', function() {
            const newDate = new Date(currentWeekStart);
            newDate.setDate(newDate.getDate() - 7);
            changeWeek(newDate);
        });
    }
    
    // Next week button
    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', function() {
            const newDate = new Date(currentWeekStart);
            newDate.setDate(newDate.getDate() + 7);
            changeWeek(newDate);
        });
    }
    
    // Date picker change
    datePicker.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        changeWeek(getStartOfWeek(selectedDate));
    });
    
    // Copy week functionality
    if (copyWeekBtn) {
        copyWeekBtn.addEventListener('click', function() {
            copyCurrentWeek();
        });
    }
    
    // Paste week functionality
    if (pasteWeekBtn) {
        pasteWeekBtn.addEventListener('click', function() {
            pasteWeekToCurrentWeek();
        });
    }
}

function changeWeek(newStartDate) {
    // Update global current week
    currentWeekStart = newStartDate;
    
    // Update UI
    const datePicker = document.getElementById('weekStartDate');
    const weekLabel = document.getElementById('weekLabel');
    
    if (datePicker) {
        datePicker.value = currentWeekStart.toISOString().split('T')[0];
    }
    
    if (weekLabel) {
        weekLabel.textContent = formatWeekRange(currentWeekStart);
    }
    
    // Load data for the selected week
    loadWeekData(currentWeekStart);
}

function getWeekKey(date) {
    return date.toISOString().split('T')[0].substring(0, 10); // YYYY-MM-DD format
}

function loadWeekData(weekStart) {
    const currentUser = getFromStorage('currentUser');
    if (!currentUser) return;
    
    const weekKey = getWeekKey(weekStart);
    const userKey = `planner_${currentUser.email}`;
    const weekStorageKey = `${userKey}_week_${weekKey}`;
    
    // Try to load saved data for this specific week
    let weekData = getFromStorage(weekStorageKey);
    
    if (weekData) {
        // We have data for this week, use it
        weeklyCalories = weekData.calories || [0, 0, 0, 0, 0, 0, 0];
        weeklyExercise = weekData.exercise || [0, 0, 0, 0, 0, 0, 0];
        weeklyFoods = weekData.foods || [[], [], [], [], [], [], []];
    } else {
        // For current week, use current data
        const today = new Date();
        const todayWeekStart = getStartOfWeek(today);
        
        if (weekStart.getTime() === todayWeekStart.getTime()) {
            // This is the current week, use regular keys
            weeklyCalories = getFromStorage(`${userKey}_calories`) || [0, 0, 0, 0, 0, 0, 0];
            weeklyExercise = getFromStorage(`${userKey}_exercise`) || [0, 0, 0, 0, 0, 0, 0];
            weeklyFoods = getFromStorage(`${userKey}_foods`) || [[], [], [], [], [], [], []];
        } else {
            // This is a different week, initialize with empty data
            weeklyCalories = [0, 0, 0, 0, 0, 0, 0];
            weeklyExercise = [0, 0, 0, 0, 0, 0, 0];
            weeklyFoods = [[], [], [], [], [], [], []];
        }
    }
    
    // Update the planner display
    updatePlanner();
}

function saveWeekData() {
    const currentUser = getFromStorage('currentUser');
    if (!currentUser) return;
    
    const weekKey = getWeekKey(currentWeekStart);
    const userKey = `planner_${currentUser.email}`;
    const weekStorageKey = `${userKey}_week_${weekKey}`;
    
    // Create week data object
    const weekData = {
        calories: weeklyCalories,
        exercise: weeklyExercise,
        foods: weeklyFoods,
        lastUpdated: new Date().toISOString()
    };
    
    // Save to localStorage
    saveToStorage(weekStorageKey, weekData);
    
    // If this is the current week, update regular keys too
    const today = new Date();
    const todayWeekStart = getStartOfWeek(today);
    
    if (currentWeekStart.getTime() === todayWeekStart.getTime()) {
        saveToStorage(`${userKey}_calories`, weeklyCalories);
        saveToStorage(`${userKey}_exercise`, weeklyExercise);
        saveToStorage(`${userKey}_foods`, weeklyFoods);
    }
}

function copyCurrentWeek() {
    // Store the current week's data in our variable
    copiedWeekData = {
        calories: [...weeklyCalories],
        exercise: [...weeklyExercise],
        foods: JSON.parse(JSON.stringify(weeklyFoods)) // Deep copy
    };
    
    // Show paste button
    const pasteWeekBtn = document.getElementById('pasteWeek');
    if (pasteWeekBtn) {
        pasteWeekBtn.style.display = 'inline-block';
    }
    
    // Show notification
    showNotification('Week copied! Select another week to paste.', 'success');
}

function pasteWeekToCurrentWeek() {
    if (!copiedWeekData) {
        showNotification('No week data to paste!', 'error');
        return;
    }
    
    // Confirm before overwriting
    if (!confirm('This will overwrite the current week\'s data. Continue?')) {
        return;
    }
    
    // Copy data from our stored week
    weeklyCalories = [...copiedWeekData.calories];
    weeklyExercise = [...copiedWeekData.exercise];
    weeklyFoods = JSON.parse(JSON.stringify(copiedWeekData.foods)); // Deep copy
    
    // Update display
    updatePlanner();
    
    // Save changes
    saveWeekData();
    
    // Show notification
    showNotification('Week data pasted successfully!', 'success');
}

// Extended saveToStorage function to save current week data
function saveToStorage() {
    // Save regular keys
    localStorage.setItem(`${userKey}_calories`, JSON.stringify(weeklyCalories));
    localStorage.setItem(`${userKey}_exercise`, JSON.stringify(weeklyExercise));
    localStorage.setItem(`${userKey}_foods`, JSON.stringify(weeklyFoods));
    
    // Also save to week-specific storage
    saveWeekData();
}

// Initialize on document load
document.addEventListener('DOMContentLoaded', function() {
    // Create quick add buttons
    createQuickAddButtons();
    
    // Load daily tip
    loadDailyTip();
    
    // Initialize week selector
    initializeWeekSelector();
    
    // Update planner with initial week
    loadWeekData(currentWeekStart);
});

// Make functions accessible to window
window.removeItem = removeItem;
window.loadDailyTip = loadDailyTip;
window.changeWeek = changeWeek;
window.copyCurrentWeek = copyCurrentWeek;
window.pasteWeekToCurrentWeek = pasteWeekToCurrentWeek;

/**
 * Load user profile data and initialize tracker
 * @param {Object} currentUser - Current user data
 */
function loadUserProfile(currentUser) {
    // Get profile data
    const profileKey = `profile_${currentUser.email}`;
    const profile = getFromStorage(profileKey);
    
    if (!profile) {
        window.location.href = 'index.html'; // Redirect to profile if no data
        return;
    }
    
    // Get or parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // If no URL parameters, redirect with profile data
    if (urlParams.toString() === '') {
        const params = new URLSearchParams({
            bmr: profile.bmr || 0,
            tdee: profile.tdee || 0,
            weight: profile.weight || 0,
            goalWeight: profile.goalWeight || 0,
            timeToGoal: profile.timeToGoal || 0,
            dailyDeficit: profile.dailyDeficit || 0,
            goalCalories: profile.dailyGoal || 0,
            timeUnit: profile.timeUnit || 'weeks'
        });
        window.location.href = `tracker.html?${params.toString()}`;
        return;
    }
    
    // Initialize components
    initializeComponents();
}

/**
 * Initialize all tracker page components
 */
function initializeComponents() {
    // Set up tab navigation
    setupTabNavigation();
    
    // Initialize water tracker
    initializeWaterTracker();
    
    // Set up quick add buttons
    createQuickAddButtons();
    
    // Load daily tip
    loadDailyTip();
    
    // Update planner
    updatePlanner();
}

/**
 * Set up tab navigation between sections
 */
function setupTabNavigation() {
    // Tab navigation buttons
    const tabButtons = [
        { id: 'viewSummary', target: 'summary' },
        { id: 'viewManual', target: 'manual' },
        { id: 'viewMealBuilder', target: 'automatic' },
        { id: 'viewPlanner', target: 'planner' },
        { id: 'goToManual', target: 'manual' }
    ];
    
    // Add click handlers to buttons
    tabButtons.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            element.addEventListener('click', () => showTab(button.target));
        }
    });
    
    // Handle button clicks for profile and dashboard
    const backToProfileBtn = document.getElementById('backToProfile');
    if (backToProfileBtn) {
        backToProfileBtn.addEventListener('click', () => window.location.href = 'index.html');
    }
    
    const navDashboard = document.getElementById('navDashboard');
    if (navDashboard) {
        navDashboard.addEventListener('click', () => window.location.href = 'dashboard.html');
    }
    
    // Add Exercise button
    const goToExerciseBtn = document.getElementById('goToExercise');
    if (goToExerciseBtn) {
        goToExerciseBtn.addEventListener('click', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const currentUser = getFromStorage('currentUser');
            const profileKey = `profile_${currentUser.email}`;
            const profile = getFromStorage(profileKey);
            
            const params = new URLSearchParams({
                bmr: urlParams.get('bmr') || profile.bmr || 0,
                dailyGoal: urlParams.get('goalCalories') || profile.dailyGoal || 0,
                weight: profile.weight || 0,
                goal: profile.goalWeight || 0,
                tdee: urlParams.get('tdee') || profile.tdee || 0,
                time: profile.timeToGoal || 0
            });
            
            window.location.href = `exercise.html?${params.toString()}`;
        });
    }
    
    // Add Export Plan button handler
    const exportPlanBtn = document.getElementById('exportPlan');
    if (exportPlanBtn) {
        exportPlanBtn.addEventListener('click', exportPlan);
    }
}

/**
 * Show the specified tab content
 * @param {string} tabId - ID of the tab to show
 */
function showTab(tabId) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Deactivate all nav buttons
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Activate corresponding nav button
    const navSelector = `[id="view${tabId.charAt(0).toUpperCase() + tabId.slice(1)}"]`;
    const activeNavButton = document.querySelector(navSelector);
    if (activeNavButton) {
        activeNavButton.classList.add('active');
    }
}
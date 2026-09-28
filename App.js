import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Share,
  Clipboard,
  Image,
} from "react-native";
import { Flame, Settings, TrendingDown, TrendingUp, Target, Dumbbell, Utensils, Heart, ArrowRight, Check, ChevronRight, Plus, X, Clock, RotateCcw, Zap, Timer, Trophy, Activity, Star, Search, Edit2, Trash2, Copy, Play, Pause, Square, ChevronLeft, ChevronRight as ChevronRightIcon, History, Menu, MoreVertical, Moon, Scale, Camera, Minus, Clipboard as ClipboardIcon } from "lucide-react-native";
import Dropdown from "./Dropdown";
import Card from "./Card";
import Stat from "./Stat";
import Ring from "./Ring";
import TabBar from "./TabBar";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import * as BarCodeScanner from "expo-barcode-scanner";
import storage from "./storage";

// Meal types
const MEALS = [
  { key: "breakfast", label: "Breakfast", icon: "🌅", color: "#E8A23D" },
  { key: "lunch", label: "Lunch", icon: "☀️", color: "#4FB0A5" },
  { key: "dinner", label: "Dinner", icon: "🌙", color: "#7C5CD8" },
  { key: "snacks", label: "Snacks", icon: "🍪", color: "#E2665A" },
];

// Common food database (local fallback)
const FOOD_DATABASE = [
  { name: "Chicken Breast (100g)", calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: "100g" },
  { name: "Salmon (100g)", calories: 208, protein: 20, carbs: 0, fat: 13, serving: "100g" },
  { name: "Egg (large)", calories: 78, protein: 6, carbs: 0.6, fat: 5, serving: "1 egg" },
  { name: "Greek Yogurt (170g)", calories: 100, protein: 17, carbs: 6, fat: 0, serving: "1 cup" },
  { name: "White Rice (cooked, 100g)", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, serving: "100g" },
  { name: "Brown Rice (cooked, 100g)", calories: 111, protein: 2.6, carbs: 23, fat: 0.9, serving: "100g" },
  { name: "Sweet Potato (100g)", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, serving: "100g" },
  { name: "Oats (dry, 50g)", calories: 190, protein: 7, carbs: 32, fat: 3.5, serving: "50g" },
  { name: "Banana (medium)", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, serving: "1 medium" },
  { name: "Apple (medium)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, serving: "1 medium" },
  { name: "Broccoli (100g)", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, serving: "100g" },
  { name: "Spinach (100g)", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, serving: "100g" },
  { name: "Avocado (half)", calories: 160, protein: 2, carbs: 8.5, fat: 15, serving: "1/2 avocado" },
  { name: "Almonds (28g)", calories: 164, protein: 6, carbs: 6, fat: 14, serving: "28g (1 oz)" },
  { name: "Peanut Butter (1 tbsp)", calories: 94, protein: 4, carbs: 3, fat: 8, serving: "1 tbsp" },
  { name: "Olive Oil (1 tbsp)", calories: 119, protein: 0, carbs: 0, fat: 14, serving: "1 tbsp" },
  { name: "Whole Milk (240ml)", calories: 149, protein: 8, carbs: 12, fat: 8, serving: "1 cup" },
  { name: "Whey Protein (1 scoop)", calories: 120, protein: 24, carbs: 3, fat: 1, serving: "1 scoop" },
  { name: "Ground Beef 90% (100g)", calories: 250, protein: 26, carbs: 0, fat: 15, serving: "100g" },
  { name: "Tofu (100g)", calories: 76, protein: 8, carbs: 1.9, fat: 4.8, serving: "100g" },
];

// Exercise Library - categorized by muscle group with MET values for calorie estimation
const EXERCISE_LIBRARY = [
  // Chest
  { name: "Bench Press (Barbell)", muscle: "chest", type: "strength", met: 6.0, equipment: "barbell" },
  { name: "Bench Press (Dumbbell)", muscle: "chest", type: "strength", met: 6.0, equipment: "dumbbell" },
  { name: "Incline Bench Press", muscle: "chest", type: "strength", met: 6.0, equipment: "barbell" },
  { name: "Decline Bench Press", muscle: "chest", type: "strength", met: 6.0, equipment: "barbell" },
  { name: "Push-ups", muscle: "chest", type: "strength", met: 8.0, equipment: "bodyweight" },
  { name: "Chest Fly (Dumbbell)", muscle: "chest", type: "strength", met: 5.0, equipment: "dumbbell" },
  { name: "Chest Fly (Machine)", muscle: "chest", type: "strength", met: 4.5, equipment: "machine" },
  { name: "Dips (Chest focus)", muscle: "chest", type: "strength", met: 7.0, equipment: "bodyweight" },
  { name: "Cable Crossover", muscle: "chest", type: "strength", met: 5.0, equipment: "cable" },
  { name: "Landmine Press", muscle: "chest", type: "strength", met: 5.5, equipment: "barbell" },
  
  // Back
  { name: "Deadlift (Barbell)", muscle: "back", type: "strength", met: 8.0, equipment: "barbell" },
  { name: "Pull-ups", muscle: "back", type: "strength", met: 8.0, equipment: "bodyweight" },
  { name: "Chin-ups", muscle: "back", type: "strength", met: 8.0, equipment: "bodyweight" },
  { name: "Bent-over Row (Barbell)", muscle: "back", type: "strength", met: 6.0, equipment: "barbell" },
  { name: "Bent-over Row (Dumbbell)", muscle: "back", type: "strength", met: 6.0, equipment: "dumbbell" },
  { name: "Lat Pulldown", muscle: "back", type: "strength", met: 5.0, equipment: "machine" },
  { name: "Seated Cable Row", muscle: "back", type: "strength", met: 5.0, equipment: "cable" },
  { name: "T-Bar Row", muscle: "back", type: "strength", met: 6.0, equipment: "barbell" },
  { name: "Face Pulls", muscle: "back", type: "strength", met: 4.0, equipment: "cable" },
  { name: "Hyperextension", muscle: "back", type: "strength", met: 4.5, equipment: "machine" },
  
  // Shoulders
  { name: "Overhead Press (Barbell)", muscle: "shoulders", type: "strength", met: 6.0, equipment: "barbell" },
  { name: "Overhead Press (Dumbbell)", muscle: "shoulders", type: "strength", met: 6.0, equipment: "dumbbell" },
  { name: "Arnold Press", muscle: "shoulders", type: "strength", met: 5.5, equipment: "dumbbell" },
  { name: "Lateral Raise", muscle: "shoulders", type: "strength", met: 4.0, equipment: "dumbbell" },
  { name: "Front Raise", muscle: "shoulders", type: "strength", met: 4.0, equipment: "dumbbell" },
  { name: "Rear Delt Fly", muscle: "shoulders", type: "strength", met: 4.0, equipment: "dumbbell" },
  { name: "Upright Row", muscle: "shoulders", type: "strength", met: 5.0, equipment: "barbell" },
  { name: "Pike Push-ups", muscle: "shoulders", type: "strength", met: 7.0, equipment: "bodyweight" },
  { name: "Handstand Push-up", muscle: "shoulders", type: "strength", met: 8.0, equipment: "bodyweight" },
  
  // Arms - Biceps
  { name: "Bicep Curl (Barbell)", muscle: "biceps", type: "strength", met: 4.5, equipment: "barbell" },
  { name: "Bicep Curl (Dumbbell)", muscle: "biceps", type: "strength", met: 4.5, equipment: "dumbbell" },
  { name: "Hammer Curl", muscle: "biceps", type: "strength", met: 4.5, equipment: "dumbbell" },
  { name: "Preacher Curl", muscle: "biceps", type: "strength", met: 4.0, equipment: "machine" },
  { name: "Concentration Curl", muscle: "biceps", type: "strength", met: 4.0, equipment: "dumbbell" },
  { name: "Cable Curl", muscle: "biceps", type: "strength", met: 4.0, equipment: "cable" },
  
  // Arms - Triceps
  { name: "Tricep Pushdown", muscle: "triceps", type: "strength", met: 4.0, equipment: "cable" },
  { name: "Overhead Tricep Extension", muscle: "triceps", type: "strength", met: 4.5, equipment: "dumbbell" },
  { name: "Skull Crushers", muscle: "triceps", type: "strength", met: 4.5, equipment: "barbell" },
  { name: "Diamond Push-ups", muscle: "triceps", type: "strength", met: 8.0, equipment: "bodyweight" },
  { name: "Tricep Dip", muscle: "triceps", type: "strength", met: 7.0, equipment: "bodyweight" },
  { name: "Close-grip Bench Press", muscle: "triceps", type: "strength", met: 6.0, equipment: "barbell" },
  
  // Legs - Quads
  { name: "Squat (Barbell)", muscle: "quads", type: "strength", met: 8.0, equipment: "barbell" },
  { name: "Front Squat", muscle: "quads", type: "strength", met: 8.0, equipment: "barbell" },
  { name: "Goblet Squat", muscle: "quads", type: "strength", met: 7.0, equipment: "dumbbell" },
  { name: "Leg Press", muscle: "quads", type: "strength", met: 5.0, equipment: "machine" },
  { name: "Leg Extension", muscle: "quads", type: "strength", met: 4.0, equipment: "machine" },
  { name: "Bulgarian Split Squat", muscle: "quads", type: "strength", met: 7.0, equipment: "dumbbell" },
  { name: "Lunges", muscle: "quads", type: "strength", met: 7.0, equipment: "bodyweight" },
  { name: "Step-ups", muscle: "quads", type: "strength", met: 6.0, equipment: "dumbbell" },
  
  // Legs - Hamstrings/Glutes
  { name: "Romanian Deadlift", muscle: "hamstrings", type: "strength", met: 7.0, equipment: "barbell" },
  { name: "Leg Curl (Lying)", muscle: "hamstrings", type: "strength", met: 4.0, equipment: "machine" },
  { name: "Leg Curl (Seated)", muscle: "hamstrings", type: "strength", met: 4.0, equipment: "machine" },
  { name: "Glute Bridge", muscle: "glutes", type: "strength", met: 5.0, equipment: "bodyweight" },
  { name: "Hip Thrust", muscle: "glutes", type: "strength", met: 6.0, equipment: "barbell" },
  { name: "Good Morning", muscle: "hamstrings", type: "strength", met: 6.0, equipment: "barbell" },
  { name: "Nordic Curl", muscle: "hamstrings", type: "strength", met: 8.0, equipment: "bodyweight" },
  
  // Core
  { name: "Plank", muscle: "core", type: "strength", met: 5.0, equipment: "bodyweight" },
  { name: "Hanging Leg Raise", muscle: "core", type: "strength", met: 6.0, equipment: "bodyweight" },
  { name: "Cable Crunch", muscle: "core", type: "strength", met: 4.5, equipment: "cable" },
  { name: "Ab Wheel Rollout", muscle: "core", type: "strength", met: 6.0, equipment: "equipment" },
  { name: "Russian Twist", muscle: "core", type: "strength", met: 4.5, equipment: "bodyweight" },
  { name: "Dead Bug", muscle: "core", type: "strength", met: 3.5, equipment: "bodyweight" },
  
  // Cardio
  { name: "Running (6 mph / 10 min/mile)", muscle: "cardio", type: "cardio", met: 9.8, equipment: "none" },
  { name: "Running (8 mph / 7.5 min/mile)", muscle: "cardio", type: "cardio", met: 11.5, equipment: "none" },
  { name: "Running (10 mph / 6 min/mile)", muscle: "cardio", type: "cardio", met: 14.5, equipment: "none" },
  { name: "Cycling (moderate, 12-14 mph)", muscle: "cardio", type: "cardio", met: 8.0, equipment: "bike" },
  { name: "Cycling (vigorous, 16-19 mph)", muscle: "cardio", type: "cardio", met: 12.0, equipment: "bike" },
  { name: "Rowing (moderate)", muscle: "cardio", type: "cardio", met: 7.0, equipment: "rower" },
  { name: "Rowing (vigorous)", muscle: "cardio", type: "cardio", met: 12.0, equipment: "rower" },
  { name: "Swimming (moderate)", muscle: "cardio", type: "cardio", met: 8.0, equipment: "pool" },
  { name: "Swimming (vigorous)", muscle: "cardio", type: "cardio", met: 11.0, equipment: "pool" },
  { name: "Jump Rope", muscle: "cardio", type: "cardio", met: 12.0, equipment: "rope" },
  { name: "Elliptical (moderate)", muscle: "cardio", type: "cardio", met: 5.0, equipment: "elliptical" },
  { name: "Stair Climber", muscle: "cardio", type: "cardio", met: 9.0, equipment: "machine" },
  { name: "Walking (3.5 mph)", muscle: "cardio", type: "cardio", met: 4.3, equipment: "none" },
  { name: "HIIT (Bodyweight)", muscle: "cardio", type: "hiit", met: 12.0, equipment: "bodyweight" },
  { name: "Battle Ropes", muscle: "cardio", type: "hiit", met: 10.0, equipment: "ropes" },
  { name: "Burpees", muscle: "cardio", type: "hiit", met: 12.0, equipment: "bodyweight" },
];

// Workout Templates
const WORKOUT_TEMPLATES = {
  push: {
    name: "Push Day",
    description: "Chest, Shoulders, Triceps",
    exercises: [
      { name: "Bench Press (Barbell)", sets: 4, reps: "6-8", restSec: 120 },
      { name: "Incline Bench Press", sets: 3, reps: "8-10", restSec: 90 },
      { name: "Overhead Press (Dumbbell)", sets: 3, reps: "8-10", restSec: 90 },
      { name: "Lateral Raise", sets: 3, reps: "12-15", restSec: 60 },
      { name: "Tricep Pushdown", sets: 3, reps: "10-12", restSec: 60 },
      { name: "Overhead Tricep Extension", sets: 3, reps: "10-12", restSec: 60 },
    ],
  },
  pull: {
    name: "Pull Day",
    description: "Back, Biceps, Rear Delts",
    exercises: [
      { name: "Deadlift (Barbell)", sets: 4, reps: "5-6", restSec: 180 },
      { name: "Pull-ups", sets: 3, reps: "8-12", restSec: 120 },
      { name: "Bent-over Row (Dumbbell)", sets: 3, reps: "8-10", restSec: 90 },
      { name: "Face Pulls", sets: 3, reps: "12-15", restSec: 60 },
      { name: "Bicep Curl (Dumbbell)", sets: 3, reps: "10-12", restSec: 60 },
      { name: "Hammer Curl", sets: 3, reps: "10-12", restSec: 60 },
    ],
  },
  legs: {
    name: "Leg Day",
    description: "Quads, Hamstrings, Glutes, Calves",
    exercises: [
      { name: "Squat (Barbell)", sets: 4, reps: "6-8", restSec: 180 },
      { name: "Romanian Deadlift", sets: 3, reps: "8-10", restSec: 120 },
      { name: "Leg Press", sets: 3, reps: "10-12", restSec: 90 },
      { name: "Leg Curl (Seated)", sets: 3, reps: "12-15", restSec: 60 },
      { name: "Hip Thrust", sets: 3, reps: "10-12", restSec: 90 },
      { name: "Calf Raise", sets: 4, reps: "15-20", restSec: 60 },
    ],
  },
  upper: {
    name: "Upper Body",
    description: "Full upper body workout",
    exercises: [
      { name: "Bench Press (Barbell)", sets: 4, reps: "6-8", restSec: 120 },
      { name: "Bent-over Row (Barbell)", sets: 4, reps: "6-8", restSec: 120 },
      { name: "Overhead Press (Dumbbell)", sets: 3, reps: "8-10", restSec: 90 },
      { name: "Pull-ups", sets: 3, reps: "8-12", restSec: 120 },
      { name: "Lateral Raise", sets: 3, reps: "12-15", restSec: 60 },
      { name: "Bicep Curl (Dumbbell)", sets: 3, reps: "10-12", restSec: 60 },
      { name: "Tricep Pushdown", sets: 3, reps: "10-12", restSec: 60 },
    ],
  },
  lower: {
    name: "Lower Body",
    description: "Full lower body workout",
    exercises: [
      { name: "Squat (Barbell)", sets: 4, reps: "6-8", restSec: 180 },
      { name: "Romanian Deadlift", sets: 3, reps: "8-10", restSec: 120 },
      { name: "Leg Press", sets: 3, reps: "10-12", restSec: 90 },
      { name: "Leg Curl (Seated)", sets: 3, reps: "12-15", restSec: 60 },
      { name: "Hip Thrust", sets: 3, reps: "10-12", restSec: 90 },
      { name: "Plank", sets: 3, reps: "45-60s", restSec: 60 },
    ],
  },
  fullbody: {
    name: "Full Body",
    description: "Complete full body workout",
    exercises: [
      { name: "Squat (Barbell)", sets: 3, reps: "8-10", restSec: 120 },
      { name: "Bench Press (Barbell)", sets: 3, reps: "8-10", restSec: 120 },
      { name: "Bent-over Row (Dumbbell)", sets: 3, reps: "10-12", restSec: 90 },
      { name: "Overhead Press (Dumbbell)", sets: 3, reps: "8-10", restSec: 90 },
      { name: "Romanian Deadlift", sets: 3, reps: "10-12", restSec: 90 },
      { name: "Pull-ups", sets: 3, reps: "8-12", restSec: 120 },
      { name: "Plank", sets: 3, reps: "45-60s", restSec: 60 },
    ],
  },
  cardio_hiit: {
    name: "HIIT Cardio",
    description: "High-intensity interval training",
    exercises: [
      { name: "Burpees", sets: 4, reps: "30s on/30s off", restSec: 60 },
      { name: "Jump Rope", sets: 4, reps: "45s on/15s off", restSec: 60 },
      { name: "Mountain Climbers", sets: 3, reps: "30s on/30s off", restSec: 60 },
      { name: "High Knees", sets: 3, reps: "30s on/30s off", restSec: 60 },
    ],
  },
  cardio_steady: {
    name: "Steady State Cardio",
    description: "Moderate intensity cardio",
    exercises: [
      { name: "Running (6 mph / 10 min/mile)", sets: 1, reps: "30 min", restSec: 0 },
      { name: "Cycling (moderate, 12-14 mph)", sets: 1, reps: "45 min", restSec: 0 },
    ],
  },
};

// Muscle group colors for UI
const MUSCLE_COLORS = {
  chest: "#E2665A",
  back: "#4FB0A5",
  shoulders: "#E8A23D",
  biceps: "#7C5CD8",
  triceps: "#E8A23D",
  quads: "#E2665A",
  hamstrings: "#4FB0A5",
  glutes: "#7C5CD8",
  core: "#E8A23D",
  cardio: "#4FB0A5",
  hiit: "#E2665A",
};

// ---------- option data ----------
const SEX_OPTIONS = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
];

const ACTIVITY_OPTIONS = [
  { key: "sedentary", label: "Desk job, little to no exercise", description: "Sedentary" },
  { key: "light", label: "Light activity 1-3 days/week", description: "Light" },
  { key: "moderate", label: "Moderate exercise 3-5 days/week", description: "Moderate" },
  { key: "active", label: "Hard exercise 6-7 days/week", description: "Active" },
  { key: "very_active", label: "Physical job + daily training", description: "Very Active" },
];

const GOAL_OPTIONS = [
  { key: "lose", label: "Lose weight", description: "Fat loss focus" },
  { key: "maintain", label: "Maintain weight", description: "Stay where you are" },
  { key: "gain", label: "Gain weight", description: "Muscle building focus" },
];

const PACE_OPTIONS = [
  { key: "conservative", label: "Conservative", deficit: 250, description: "Slow & sustainable (~0.25kg/week)" },
  { key: "moderate", label: "Moderate", deficit: 500, description: "Balanced pace (~0.5kg/week)" },
  { key: "aggressive", label: "Aggressive", deficit: 750, description: "Fast results (~0.75kg/week)" },
];

const UNIT_OPTIONS = [
  { key: "metric", label: "Metric", height: "cm", weight: "kg" },
  { key: "imperial", label: "Imperial", height: "ft/in", weight: "lbs" },
];

// Onboarding steps
const ONBOARDING_STEPS = [
  { id: "welcome", title: "Welcome to Daily Fuel" },
  { id: "permissions", title: "Permissions" },
  { id: "units", title: "Units" },
  { id: "profile", title: "Your Profile" },
  { id: "training", title: "Training" },
  { id: "goal", title: "Your Goal" },
  { id: "review", title: "Review Targets" },
];

// ---------- main screen ----------
export default function App() {
  const [profile, setProfile] = useState({
    age: "",
    heightCm: "",
    weightKg: "",
    heightFt: "",
    heightIn: "",
    weightLbs: "",
    sex: "male",
    activityLevel: "moderate",
    goal: "lose",
    pace: "moderate",
    trainingDays: 3,
    sessionLength: 45,
    units: "metric",
  });
  const [result, setResult] = useState(null);
  const [screen, setScreen] = useState("loading");
  // Food state: grouped by meal { breakfast: [], lunch: [], dinner: [], snacks: [] }
  const [foodByMeal, setFoodByMeal] = useState({ breakfast: [], lunch: [], dinner: [], snacks: [] });
  const [foodForm, setFoodForm] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "", meal: "breakfast", serving: "1", servingUnit: "serving" });
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  // Food logging UI states
  const [activeMeal, setActiveMeal] = useState("breakfast");
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [barcodeScanned, setBarcodeScanned] = useState(false);
  const [recentFoods, setRecentFoods] = useState([]);
  const [favoriteFoods, setFavoriteFoods] = useState([]);
  const [waterMl, setWaterMl] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2500); // 2.5L default
  
  // Workout state
  const [workouts, setWorkouts] = useState([]);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [workoutTemplates, setWorkoutTemplates] = useState([]);
  const [showWorkoutBuilder, setShowWorkoutBuilder] = useState(false);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [workoutForm, setWorkoutForm] = useState({ name: "", type: "strength", notes: "" });
  const [restTimer, setRestTimer] = useState({ active: false, exerciseId: null, setIndex: null, remaining: 0, total: 0 });
  const [steps, setSteps] = useState(0);
  const [stepsGoal, setStepsGoal] = useState(10000);

  // Load persisted data on startup
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedProfile, savedResult, todayLog] = await Promise.all([
          storage.loadProfile(),
          storage.loadSettings(),
          storage.loadDailyLog(storage.getTodayKey()),
        ]);
        if (savedProfile) {
          setProfile(savedProfile);
          // Convert imperial to metric if needed for display
          if (savedProfile.units === "imperial" && savedProfile.heightFt) {
            const imperial = { heightFt: savedProfile.heightFt, heightIn: savedProfile.heightIn, weightLbs: savedProfile.weightLbs };
            // Keep imperial values for display
          }
        }
        if (savedResult?.calorieGoal) {
          setResult({
            bmr: savedResult.bmr,
            tdee: savedResult.tdee,
            calorieGoal: savedResult.calorieGoal,
            proteinGoal: savedResult.proteinGoal,
            fatGoal: savedResult.fatGoal,
            carbGoal: savedResult.carbGoal,
            fiberGoal: savedResult.fiberGoal,
            paceDeficit: savedResult.paceDeficit,
          });
          setScreen("home");
        }
        if (todayLog) {
          // Load food by meal
          if (todayLog.food) {
            const grouped = { breakfast: [], lunch: [], dinner: [], snacks: [] };
            todayLog.food.forEach(item => {
              if (grouped[item.meal]) {
                grouped[item.meal].push(item);
              } else {
                grouped.snacks.push(item); // fallback
              }
            });
            setFoodByMeal(grouped);
          }
          // Load water
          if (todayLog.waterMl) {
            setWaterMl(todayLog.waterMl);
          }
          // Load workouts
          if (todayLog.workouts?.length) {
            setWorkouts(todayLog.workouts);
          }
          // Load steps
          if (todayLog.steps) {
            setSteps(todayLog.steps);
          }
        }
        // Load recent foods (last 20 unique foods from all logs)
        const allLogs = await storage.loadAllDailyLogs();
        const recent = [];
        const seen = new Set();
        Object.values(allLogs).reverse().forEach(log => {
          log.food?.forEach(item => {
            const key = item.name.toLowerCase();
            if (!seen.has(key) && recent.length < 20) {
              seen.add(key);
              recent.push({ ...item, meal: "breakfast" }); // default meal for quick add
            }
          });
        });
        setRecentFoods(recent);
        // Load favorites from settings
        if (savedResult?.favorites) {
          setFavoriteFoods(savedResult.favorites);
        }
      } catch (e) {
        console.error('Failed to load data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Check onboarding completion and load settings
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const settings = await storage.loadSettings();
        if (settings?.onboardingComplete) {
          setOnboardingComplete(true);
          // If profile exists but no result, we need to recalculate
          if (settings?.calorieGoal && !result) {
            setResult({
              bmr: settings.bmr,
              tdee: settings.tdee,
              calorieGoal: settings.calorieGoal,
              proteinGoal: settings.proteinGoal,
              fatGoal: settings.fatGoal,
              carbGoal: settings.carbGoal,
              fiberGoal: settings.fiberGoal,
              paceDeficit: settings.paceDeficit,
            });
            setScreen("home");
          }
        } else {
          // First time user - start onboarding
          setOnboardingComplete(false);
          setScreen("onboarding");
        }
      } catch (e) {
        console.error('Failed to check onboarding:', e);
        setScreen("onboarding");
      }
    };
    
    // Only run after initial load
    if (!loading) {
      checkOnboarding();
    }
  }, [loading]);

  // Unit conversion helpers
  const toMetric = (profile) => {
    if (profile.units === "imperial") {
      const heightInches = (parseFloat(profile.heightFt) || 0) * 12 + (parseFloat(profile.heightIn) || 0);
      const heightCm = Math.round(heightInches * 2.54);
      const weightKg = Math.round((parseFloat(profile.weightLbs) || 0) * 0.453592);
      return { ...profile, heightCm: String(heightCm), weightKg: String(weightKg) };
    }
    return profile;
  };

  const toImperial = (heightCm, weightKg) => {
    const heightInches = heightCm / 2.54;
    const ft = Math.floor(heightInches / 12);
    const in_ = Math.round(heightInches % 12);
    const lbs = Math.round(weightKg / 0.453592);
    return { heightFt: String(ft), heightIn: String(in_), weightLbs: String(lbs) };
  };

  const updateField = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = async () => {
    // Convert to metric for calculations
    const metricProfile = toMetric(profile);
    const w = parseFloat(metricProfile.weightKg);
    const h = parseFloat(metricProfile.heightCm);
    const age = parseFloat(metricProfile.age);
    if (!w || !h || !age) return;

    let bmr = 10 * w + 6.25 * h - 5 * age;
    bmr += metricProfile.sex === "male" ? 5 : -161;

    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const tdee = bmr * multipliers[metricProfile.activityLevel];
    
    // Use pace-based deficit instead of fixed goal delta
    const paceDeficit = PACE_OPTIONS.find(p => p.key === metricProfile.pace)?.deficit || 500;
    const goalDelta = { lose: -paceDeficit, maintain: 0, gain: paceDeficit };
    const calorieGoal = tdee + goalDelta[metricProfile.goal];

    const proteinGoal = Math.round(w * 1.8);
    const proteinCal = proteinGoal * 4;
    const fatCal = calorieGoal * 0.3;
    const fatGoal = Math.round(fatCal / 9);
    const carbCal = Math.max(calorieGoal - proteinCal - fatCal, 0);
    const carbGoal = Math.round(carbCal / 4);
    const fiberGoal = Math.round((calorieGoal / 1000) * 14); // 14g per 1000 kcal

    const newResult = {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calorieGoal: Math.round(calorieGoal),
      proteinGoal,
      fatGoal,
      carbGoal,
      fiberGoal,
      paceDeficit,
    };

    setResult(newResult);

    // Persist profile and result
    await Promise.all([
      storage.saveProfile({ ...profile, ...metricProfile }), // save with metric values
      storage.saveSettings({ ...newResult, units: profile.units }),
    ]);

    // Complete onboarding
    setOnboardingComplete(true);
    await storage.saveSettings({ ...newResult, units: profile.units, onboardingComplete: true });
    setScreen("home");
  };

  // Validation for each onboarding step
  const getStepValid = (stepId) => {
    switch (stepId) {
      case "profile":
        return metricProfile.age && metricProfile.heightCm && metricProfile.weightKg;
      case "training":
        return profile.trainingDays > 0 && profile.sessionLength > 0;
      case "goal":
        return true; // goal and pace always have defaults
      default:
        return true;
    }
  };

  const metricProfile = toMetric(profile);

  // Show loading screen while data loads
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Flame size={48} color="#E8A23D" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // ---------- ONBOARDING FLOW ----------
  if (screen === "onboarding") {
    const currentStep = ONBOARDING_STEPS[onboardingStep];
    const progress = (onboardingStep + 1) / ONBOARDING_STEPS.length;

    const renderWelcome = () => (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.onboardingCard}>
          <Flame size={64} color="#E8A23D" />
          <Text style={styles.onboardingTitle}>Welcome to Daily Fuel</Text>
          <Text style={styles.onboardingSubtitle}>
            Your all-in-one fitness & nutrition tracker.
            Log food, track workouts, monitor progress — all in one place.
          </Text>
          <View style={styles.featureList}>
            {[
              { icon: Utensils, text: "Smart food logging with AI photo scan" },
              { icon: Dumbbell, text: "Workout tracking with rest timers" },
              { icon: Target, text: "Personalized calorie & macro targets" },
              { icon: Heart, text: "Progress tracking & weekly summaries" },
            ].map((item, i) => (
              <View key={i} style={styles.featureItem}>
                <item.icon size={20} color="#E8A23D" />
                <Text style={styles.featureText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );

    const renderPermissions = () => (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.onboardingCard}>
          <Target size={64} color="#E8A23D" />
          <Text style={styles.onboardingTitle}>Permissions</Text>
          <Text style={styles.onboardingSubtitle}>
            We need a few permissions to give you the best experience:
          </Text>
          <View style={styles.permissionList}>
            {[
              { icon: "📷", title: "Camera", desc: "Scan food photos for instant nutrition estimates" },
              { icon: "🔔", title: "Notifications", desc: "Daily reminders & weekly progress reports" },
            ].map((item, i) => (
              <View key={i} style={styles.permissionItem}>
                <Text style={styles.permissionIcon}>{item.icon}</Text>
                <View>
                  <Text style={styles.permissionTitle}>{item.title}</Text>
                  <Text style={styles.permissionDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );

    const renderUnits = () => (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.onboardingCard}>
          <Text style={styles.onboardingTitle}>Choose Your Units</Text>
          <Text style={styles.onboardingSubtitle}>
            How would you like to track your measurements?
          </Text>
          {UNIT_OPTIONS.map((unit) => (
            <TouchableOpacity
              key={unit.key}
              style={[
                styles.unitOption,
                { borderColor: profile.units === unit.key ? "#E8A23D" : "#2A323C" },
                { borderWidth: profile.units === unit.key ? 2 : 1 },
                { backgroundColor: profile.units === unit.key ? "rgba(232, 162, 61, 0.1)" : "#1B2129" },
              ]}
              onPress={() => updateField("units", unit.key)}
            >
              <Text style={[
                styles.unitOptionLabel,
                { color: profile.units === unit.key ? "#E8A23D" : "#F2F4F6" }
              ]}>
                {unit.label}
              </Text>
              <Text style={styles.unitOptionDetail}>
                Height in {unit.height} • Weight in {unit.weight}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );

    const renderProfile = () => (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.onboardingCard}>
          <Text style={styles.onboardingTitle}>Your Profile</Text>
          <Text style={styles.onboardingSubtitle}>
            Used to calculate your BMR, TDEE and daily targets.
          </Text>

          {/* Age + Sex */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="28"
                placeholderTextColor="#8B95A1"
                keyboardType="numeric"
                value={profile.age}
                onChangeText={(v) => updateField("age", v)}
              />
            </View>
            <Dropdown
              label="Sex"
              options={SEX_OPTIONS}
              value={profile.sex}
              onChange={(v) => updateField("sex", v)}
            />
          </View>

          {/* Height + Weight - dynamic based on units */}
          {profile.units === "metric" ? (
            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="175"
                  placeholderTextColor="#8B95A1"
                  keyboardType="numeric"
                  value={profile.heightCm}
                  onChangeText={(v) => updateField("heightCm", v)}
                />
              </View>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="78"
                  placeholderTextColor="#8B95A1"
                  keyboardType="numeric"
                  value={profile.weightKg}
                  onChangeText={(v) => updateField("weightKg", v)}
                />
              </View>
            </View>
          ) : (
            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>Height (ft/in)</Text>
                <View style={styles.imperialInputRow}>
                  <TextInput
                    style={[styles.input, styles.imperialInput]}
                    placeholder="5"
                    placeholderTextColor="#8B95A1"
                    keyboardType="numeric"
                    value={profile.heightFt}
                    onChangeText={(v) => updateField("heightFt", v)}
                  />
                  <Text style={styles.imperialSeparator}>ft</Text>
                  <TextInput
                    style={[styles.input, styles.imperialInput]}
                    placeholder="9"
                    placeholderTextColor="#8B95A1"
                    keyboardType="numeric"
                    value={profile.heightIn}
                    onChangeText={(v) => updateField("heightIn", v)}
                  />
                  <Text style={styles.imperialSeparator}>in</Text>
                </View>
              </View>
              <View style={styles.fieldHalf}>
                <Text style={styles.label}>Weight (lbs)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="172"
                  placeholderTextColor="#8B95A1"
                  keyboardType="numeric"
                  value={profile.weightLbs}
                  onChangeText={(v) => updateField("weightLbs", v)}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    );

    const renderTraining = () => (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.onboardingCard}>
          <Dumbbell size={64} color="#E8A23D" />
          <Text style={styles.onboardingTitle}>Training Schedule</Text>
          <Text style={styles.onboardingSubtitle}>
            How often and how long do you typically train?
          </Text>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Training days per week</Text>
            <View style={styles.sliderValueRow}>
              <Text style={styles.sliderValue}>{profile.trainingDays}</Text>
              <Text style={styles.sliderValueUnit}>days</Text>
            </View>
            <View style={styles.sliderTrack}>
              {[0,1,2,3,4,5,6,7].map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.sliderDot,
                    { backgroundColor: profile.trainingDays >= day ? "#E8A23D" : "#2A323C" }
                  ]}
                  onPress={() => updateField("trainingDays", day)}
                />
              ))}
            </View>
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Typical session length</Text>
            <View style={styles.sliderValueRow}>
              <Text style={styles.sliderValue}>{profile.sessionLength}</Text>
              <Text style={styles.sliderValueUnit}>minutes</Text>
            </View>
            <View style={styles.sliderTrack}>
              {[15,20,30,45,60,75,90,120].map((min) => (
                <TouchableOpacity
                  key={min}
                  style={[
                    styles.sliderDot,
                    { backgroundColor: profile.sessionLength >= min ? "#E8A23D" : "#2A323C" }
                  ]}
                  onPress={() => updateField("sessionLength", min)}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    );

    const renderGoal = () => (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.onboardingCard}>
          <Target size={64} color="#E8A23D" />
          <Text style={styles.onboardingTitle}>Your Goal</Text>
          <Text style={styles.onboardingSubtitle}>
            What are you working towards?
          </Text>

          <View style={styles.optionGrid}>
            {GOAL_OPTIONS.map((goal) => (
              <TouchableOpacity
                key={goal.key}
                style={[
                  styles.goalOption,
                  { borderColor: profile.goal === goal.key ? "#E8A23D" : "#2A323C" },
                  { borderWidth: profile.goal === goal.key ? 2 : 1 },
                  { backgroundColor: profile.goal === goal.key ? "rgba(232, 162, 61, 0.1)" : "#1B2129" },
                ]}
                onPress={() => updateField("goal", goal.key)}
              >
                <Text style={[
                  styles.goalOptionLabel,
                  { color: profile.goal === goal.key ? "#E8A23D" : "#F2F4F6" }
                ]}>
                  {goal.label}
                </Text>
                <Text style={styles.goalOptionDesc}>{goal.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ marginTop: 24 }}>
            <Text style={styles.onboardingTitle}>Pace</Text>
            <Text style={styles.onboardingSubtitle}>
              How fast do you want to reach your goal?
            </Text>
            <View style={styles.optionGrid}>
              {PACE_OPTIONS.map((pace) => (
                <TouchableOpacity
                  key={pace.key}
                  style={[
                    styles.paceOption,
                    { borderColor: profile.pace === pace.key ? "#E8A23D" : "#2A323C" },
                    { borderWidth: profile.pace === pace.key ? 2 : 1 },
                    { backgroundColor: profile.pace === pace.key ? "rgba(232, 162, 61, 0.1)" : "#1B2129" },
                  ]}
                  onPress={() => updateField("pace", pace.key)}
                >
                  <Text style={[
                    styles.paceOptionLabel,
                    { color: profile.pace === pace.key ? "#E8A23D" : "#F2F4F6" }
                  ]}>
                    {pace.label}
                  </Text>
                  <Text style={styles.paceOptionDesc}>{pace.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    );

    const renderReview = () => {
      // Calculate preview targets
      const mProfile = toMetric(profile);
      const w = parseFloat(mProfile.weightKg);
      const h = parseFloat(mProfile.heightCm);
      const age = parseFloat(mProfile.age);
      
      if (!w || !h || !age) {
        return (
          <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.onboardingCard}>
              <Text style={styles.onboardingTitle}>Complete Your Profile</Text>
              <Text style={styles.onboardingSubtitle}>
                Please fill in your age, height, and weight to see your targets.
              </Text>
            </View>
          </ScrollView>
        );
      }

      let bmr = 10 * w + 6.25 * h - 5 * age;
      bmr += mProfile.sex === "male" ? 5 : -161;

      const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
      const tdee = bmr * multipliers[mProfile.activityLevel];
      const paceDeficit = PACE_OPTIONS.find(p => p.key === mProfile.pace)?.deficit || 500;
      const goalDelta = { lose: -paceDeficit, maintain: 0, gain: paceDeficit };
      const calorieGoal = Math.round(tdee + goalDelta[mProfile.goal]);
      const proteinGoal = Math.round(w * 1.8);
      const proteinCal = proteinGoal * 4;
      const fatCal = calorieGoal * 0.3;
      const fatGoal = Math.round(fatCal / 9);
      const carbCal = Math.max(calorieGoal - proteinCal - fatCal, 0);
      const carbGoal = Math.round(carbCal / 4);
      const fiberGoal = Math.round((calorieGoal / 1000) * 14);

      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.onboardingCard}>
            <Text style={styles.onboardingTitle}>Your Daily Targets</Text>
            <Text style={styles.onboardingSubtitle}>
              Based on your profile, here's your personalized plan:
            </Text>

            <View style={styles.reviewTargets}>
              <View style={styles.reviewTarget}>
                <Text style={styles.reviewTargetLabel}>Calories</Text>
                <Text style={styles.reviewTargetValue}>{calorieGoal} kcal</Text>
              </View>
              <View style={styles.reviewTarget}>
                <Text style={styles.reviewTargetLabel}>Protein</Text>
                <Text style={styles.reviewTargetValue}>{proteinGoal}g</Text>
              </View>
              <View style={styles.reviewTarget}>
                <Text style={styles.reviewTargetLabel}>Carbs</Text>
                <Text style={styles.reviewTargetValue}>{carbGoal}g</Text>
              </View>
              <View style={styles.reviewTarget}>
                <Text style={styles.reviewTargetLabel}>Fat</Text>
                <Text style={styles.reviewTargetValue}>{fatGoal}g</Text>
              </View>
              <View style={styles.reviewTarget}>
                <Text style={styles.reviewTargetLabel}>Fiber</Text>
                <Text style={styles.reviewTargetValue}>{fiberGoal}g</Text>
              </View>
              <View style={styles.reviewTarget}>
                <Text style={styles.reviewTargetLabel}>Steps Target</Text>
                <Text style={styles.reviewTargetValue}>
                  {mProfile.goal === "lose" ? "10,000" : mProfile.goal === "gain" ? "8,000" : "9,000"}+
                </Text>
              </View>
            </View>

            <View style={styles.reviewDetails}>
              <Text style={styles.reviewDetail}>BMR: {Math.round(bmr)} kcal</Text>
              <Text style={styles.reviewDetail}>TDEE: {Math.round(tdee)} kcal</Text>
              <Text style={styles.reviewDetail}>
                {mProfile.goal === "lose" ? "Deficit" : mProfile.goal === "gain" ? "Surplus" : "Maintenance"}:
                {Math.abs(goalDelta[mProfile.goal])} kcal
              </Text>
              <Text style={styles.reviewDetail}>
                Projected: {mProfile.goal === "lose" ? "~" + (paceDeficit * 7 / 7700).toFixed(2) + "kg/week loss" :
                  mProfile.goal === "gain" ? "~" + (paceDeficit * 7 / 7700).toFixed(2) + "kg/week gain" : "Maintain weight"}
              </Text>
            </View>
          </View>
        </ScrollView>
      );
    };

    const stepRenderers = {
      welcome: renderWelcome,
      permissions: renderPermissions,
      units: renderUnits,
      profile: renderProfile,
      training: renderTraining,
      goal: renderGoal,
      review: renderReview,
    };

    const StepContent = stepRenderers[currentStep.id] || renderWelcome;
    const isLastStep = onboardingStep === ONBOARDING_STEPS.length - 1;
    const stepValid = getStepValid(currentStep.id);

    return (
      <View style={{ flex: 1, backgroundColor: "#12161B" }}>
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progress * 100}%` }
              ]}
            />
          </View>
          <View style={styles.progressSteps}>
            {ONBOARDING_STEPS.map((step, i) => (
              <View key={step.id} style={[
                styles.progressStep,
                { opacity: i <= onboardingStep ? 1 : 0.4 }
              ]}>
                <View style={[
                  styles.progressDot,
                  { backgroundColor: i < onboardingStep ? "#4FB0A5" : i === onboardingStep ? "#E8A23D" : "#2A323C" }
                ]} />
                <Text style={[
                  styles.progressStepLabel,
                  { color: i <= onboardingStep ? "#F2F4F6" : "#8B95A1" }
                ]}>
                  {i + 1}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <StepContent />

        {/* Navigation */}
        <View style={styles.onboardingNav}>
          {onboardingStep > 0 && (
            <TouchableOpacity style={styles.navButtonBack} onPress={() => setOnboardingStep(onboardingStep - 1)}>
              <ChevronRight size={20} color="#8B95A1" style={{ transform: [{ rotate: '180deg' }] }} />
              <Text style={styles.navButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.navButtonNext,
              { opacity: stepValid ? 1 : 0.5, backgroundColor: stepValid ? "#E8A23D" : "#E8A23D" }
            ]}
            onPress={stepValid ? () => {
              if (isLastStep) {
                calculate();
              } else {
                setOnboardingStep(onboardingStep + 1);
              }
            } : undefined}
            disabled={!stepValid}
          >
            <Text style={styles.navButtonText}>
              {isLastStep ? "Get Started" : "Next"}
            </Text>
            <ChevronRight size={20} color="#181008" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ---------- FOOD SCREEN ----------
  if (screen === "food") {

    // Calculate per-meal totals
    const mealTotals = {};
    MEALS.forEach(meal => {
      const items = foodByMeal[meal.key] || [];
      mealTotals[meal.key] = {
        calories: items.reduce((sum, i) => sum + (i.calories || 0), 0),
        protein: items.reduce((sum, i) => sum + (i.protein || 0), 0),
        carbs: items.reduce((sum, i) => sum + (i.carbs || 0), 0),
        fat: items.reduce((sum, i) => sum + (i.fat || 0), 0),
      };
    });
    const dailyTotals = MEALS.reduce((acc, meal) => ({
      calories: acc.calories + mealTotals[meal.key].calories,
      protein: acc.protein + mealTotals[meal.key].protein,
      carbs: acc.carbs + mealTotals[meal.key].carbs,
      fat: acc.fat + mealTotals[meal.key].fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Helper: Save food to storage
    const saveFoodToStorage = async (updatedFoodByMeal) => {
      const allFood = MEALS.flatMap(m => updatedFoodByMeal[m.key] || []);
      await storage.saveDailyLog(storage.getTodayKey(), { food: allFood, waterMl });
    };

    // Add food to specific meal
    const addFood = async (entry = null) => {
      const data = entry || foodForm;
      if (!data.name || !data.calories) return;

      const serving = parseFloat(data.serving) || 1;
      const newEntry = {
        id: Date.now(),
        name: data.name,
        calories: Math.round((parseFloat(data.calories) || 0) * serving),
        protein: Math.round((parseFloat(data.protein) || 0) * serving * 10) / 10,
        carbs: Math.round((parseFloat(data.carbs) || 0) * serving * 10) / 10,
        fat: Math.round((parseFloat(data.fat) || 0) * serving * 10) / 10,
        meal: data.meal || activeMeal,
        serving: data.serving || "1",
        servingUnit: data.servingUnit || "serving",
        timestamp: Date.now(),
      };

      setFoodByMeal(prev => ({
        ...prev,
        [newEntry.meal]: [newEntry, ...(prev[newEntry.meal] || [])],
      }));

      await saveFoodToStorage({
        ...foodByMeal,
        [newEntry.meal]: [newEntry, ...(foodByMeal[newEntry.meal] || [])],
      });

      // Update recent foods
      setRecentFoods(prev => {
        const filtered = prev.filter(f => f.name.toLowerCase() !== newEntry.name.toLowerCase());
        return [newEntry, ...filtered].slice(0, 20);
      });

      if (!entry) {
        setFoodForm({ name: "", calories: "", protein: "", carbs: "", fat: "", meal: activeMeal, serving: "1", servingUnit: "serving" });
      }
      setShowFoodSearch(false);
    };

    // Quick add from recent/favorites/database
    const quickAddFood = (foodItem) => {
      addFood({
        name: foodItem.name,
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: foodItem.carbs,
        fat: foodItem.fat,
        meal: activeMeal,
        serving: "1",
        servingUnit: foodItem.serving || "serving",
      });
    };

    // Toggle favorite
    const toggleFavorite = (foodItem) => {
      setFavoriteFoods(prev => {
        const isFav = prev.some(f => f.name === foodItem.name);
        if (isFav) {
          return prev.filter(f => f.name !== foodItem.name);
        } else {
          const updated = [foodItem, ...prev].slice(0, 50);
          // Persist favorites
          storage.saveSettings({ ...result, favorites: updated, units: profile.units, onboardingComplete: true });
          return updated;
        }
      });
    };

    const isFavorite = (name) => favoriteFoods.some(f => f.name === name);

    // Water tracking
    const addWater = (amount) => {
      const newWater = Math.min(waterMl + amount, waterGoal);
      setWaterMl(newWater);
      storage.saveDailyLog(storage.getTodayKey(), { waterMl: newWater, food: MEALS.flatMap(m => foodByMeal[m.key] || []) });
    };

    const scanPlate = async () => {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        alert("Camera permission is needed to scan food.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        base64: true,
        quality: 0.5,
      });

      if (result.canceled) return;

      setScanning(true);
      try {
        const photoBase64 = result.assets[0].base64;
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.EXPO_PUBLIC_EXPLABS_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: "Estimate the calories, protein, carbs, and fat for the food in this image. Respond ONLY with JSON in this exact shape, no other text: {\"name\": \"short food description\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number}" },
                  { inline_data: { mime_type: "image/jpeg", data: photoBase64 } },
                ],
              }],
            }),
          }
        );

        const data = await response.json();
        const replyText = data.candidates[0].content.parts[0].text;
        console.log("Extracted text:", replyText);
        const parsed = JSON.parse(replyText);
        
        // Pre-fill form with AI result
        setFoodForm({
          name: parsed.name,
          calories: parsed.calories,
          protein: parsed.protein,
          carbs: parsed.carbs,
          fat: parsed.fat,
          meal: activeMeal,
          serving: "1",
          servingUnit: "serving",
        });
        setShowFoodSearch(false);
      } catch (error) {
        console.error("Scan failed:", error);
        alert("Couldn't analyze that photo. Try again.");
      } finally {
        setScanning(false);
      }
    };

    // Barcode scanner handler
    const handleBarcodeScanned = async ({ type, data }) => {
      if (barcodeScanned) return;
      setBarcodeScanned(true);
      setShowBarcodeScanner(false);
      // In production, lookup barcode in OpenFoodFacts or similar API
      // For now, show alert with barcode
      alert(`Barcode scanned: ${data}\n\nIn production, this would lookup the product in a food database.`);
      setTimeout(() => setBarcodeScanned(false), 1000);
    };

    // Filter food database by search query
    const filteredFoods = FOOD_DATABASE.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
  <>
  <View style={{ flex: 1, backgroundColor: "#12161B" }}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Water Tracker */}
      <View style={styles.waterCard}>
        <View style={styles.waterHeader}>
          <Text style={styles.waterTitle}>💧 Water</Text>
          <Text style={styles.waterProgress}>{waterMl} / {waterGoal} ml</Text>
        </View>
        <View style={styles.waterBarTrack}>
          <View style={[styles.waterBarFill, { width: `${Math.min((waterMl / waterGoal) * 100, 100)}%` }]} />
        </View>
        <View style={styles.waterQuickAdd}>
          {[250, 500, 750].map(amt => (
            <TouchableOpacity key={amt} style={styles.waterQuickBtn} onPress={() => addWater(amt)}>
              <Text style={styles.waterQuickBtnText}>+{amt}ml</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Meal Tabs */}
      <View style={styles.mealTabs}>
        {MEALS.map((meal) => (
          <TouchableOpacity
            key={meal.key}
            style={[
              styles.mealTab,
              { borderBottomColor: activeMeal === meal.key ? meal.color : "transparent" },
              { backgroundColor: activeMeal === meal.key ? `${meal.color}20` : "transparent" },
            ]}
            onPress={() => { setActiveMeal(meal.key); setFoodForm(prev => ({ ...prev, meal: meal.key })); }}
          >
            <Text style={styles.mealTabIcon}>{meal.icon}</Text>
            <Text style={[
              styles.mealTabLabel,
              { color: activeMeal === meal.key ? meal.color : "#8B95A1" }
            ]}>
              {meal.label}
            </Text>
            <Text style={[
              styles.mealTabCalories,
              { color: activeMeal === meal.key ? meal.color : "#8B95A1" }
            ]}>
              {mealTotals[meal.key].calories} kcal
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active Meal Section */}
      <View style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealSectionTitle}>{MEALS.find(m => m.key === activeMeal).label}</Text>
          <Text style={styles.mealSectionSubtitle}>
            {mealTotals[activeMeal].calories} kcal  •  P: {mealTotals[activeMeal].protein}g  C: {mealTotals[activeMeal].carbs}g  F: {mealTotals[activeMeal].fat}g
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => setShowFoodSearch(true)}>
            <Text style={styles.quickActionIcon}>🔍</Text>
            <Text style={styles.quickActionText}>Search Foods</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => { setShowBarcodeScanner(true); setBarcodeScanned(false); }}>
            <Text style={styles.quickActionIcon}>📱</Text>
            <Text style={styles.quickActionText}>Scan Barcode</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={scanPlate}>
            <Text style={styles.quickActionIcon}>📷</Text>
            <Text style={styles.quickActionText}>AI Photo Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => setShowFoodSearch(true)}>
            <Text style={styles.quickActionIcon}>➕</Text>
            <Text style={styles.quickActionText}>Manual Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Food List for Active Meal */}
        {(foodByMeal[activeMeal] || []).length > 0 && (
          <View style={styles.foodListContainer}>
            {(foodByMeal[activeMeal] || []).map((item) => (
              <View key={item.id} style={styles.foodItem}>
                <View style={styles.foodItemMain}>
                  <View style={styles.foodItemLeft}>
                    <Text style={styles.foodItemName}>{item.name}</Text>
                    <Text style={styles.foodItemServing}>{item.serving} {item.servingUnit}</Text>
                  </View>
                  <Text style={styles.foodItemCalories}>{item.calories} kcal</Text>
                </View>
                <View style={styles.foodItemMacros}>
                  <Text style={[styles.macroTag, styles.macroTagProtein]}>P: {item.protein}g</Text>
                  <Text style={[styles.macroTag, styles.macroTagCarbs]}>C: {item.carbs}g</Text>
                  <Text style={[styles.macroTag, styles.macroTagFat]}>F: {item.fat}g</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty state */}
        {(foodByMeal[activeMeal] || []).length === 0 && (
          <View style={styles.emptyMeal}>
            <Text style={styles.emptyMealText}>No foods logged for {MEALS.find(m => m.key === activeMeal).label.toLowerCase()} yet</Text>
            <Text style={styles.emptyMealHint}>Tap + to add your first item</Text>
          </View>
        )}
      </View>

      {/* Daily Summary */}
      <View style={styles.dailySummaryCard}>
        <Text style={styles.dailySummaryTitle}>Daily Totals</Text>
        <View style={styles.dailySummaryMacros}>
          <View style={styles.dailySummaryMacro}>
            <Text style={styles.dailySummaryMacroLabel}>Calories</Text>
            <Text style={styles.dailySummaryMacroValue}>{dailyTotals.calories} / {result?.calorieGoal || 0} kcal</Text>
          </View>
          <View style={styles.dailySummaryMacro}>
            <Text style={styles.dailySummaryMacroLabel}>Protein</Text>
            <Text style={styles.dailySummaryMacroValue}>{dailyTotals.protein}g / {result?.proteinGoal || 0}g</Text>
          </View>
          <View style={styles.dailySummaryMacro}>
            <Text style={styles.dailySummaryMacroLabel}>Carbs</Text>
            <Text style={styles.dailySummaryMacroValue}>{dailyTotals.carbs}g / {result?.carbGoal || 0}g</Text>
          </View>
          <View style={styles.dailySummaryMacro}>
            <Text style={styles.dailySummaryMacroLabel}>Fat</Text>
            <Text style={styles.dailySummaryMacroValue}>{dailyTotals.fat}g / {result?.fatGoal || 0}g</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  </View>

    {/* Food Search Modal */}
    {showFoodSearch && (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Food</Text>
            <TouchableOpacity onPress={() => { setShowFoodSearch(false); setSearchQuery(""); }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods..."
            placeholderTextColor="#8B95A1"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />

          {/* Tabs: Database / Recent / Favorites */}
          <View style={styles.searchTabs}>
            {["database", "recent", "favorites"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.searchTab, { backgroundColor: (showFoodSearch === tab || tab === "database") ? "#E8A23D" : "#1B2129" }]}
                onPress={() => {}}
              >
                <Text style={styles.searchTabLabel}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Food Database Results */}
          <ScrollView style={styles.searchResults} contentContainerStyle={styles.searchResultsContent}>
            {searchQuery ? (
              filteredFoods.map((food) => (
                <TouchableOpacity key={food.name} style={styles.searchResultItem} onPress={() => quickAddFood(food)}>
                  <View style={styles.searchResultMain}>
                    <Text style={styles.searchResultName}>{food.name}</Text>
                    <View style={styles.searchResultMacros}>
                      <Text style={[styles.macroTag, styles.macroTagProtein, { fontSize: 9 }]}>P: {food.protein}g</Text>
                      <Text style={[styles.macroTag, styles.macroTagCarbs, { fontSize: 9 }]}>C: {food.carbs}g</Text>
                      <Text style={[styles.macroTag, styles.macroTagFat, { fontSize: 9 }]}>F: {food.fat}g</Text>
                    </View>
                  </View>
                  <Text style={styles.searchResultCalories}>{food.calories} kcal / {food.serving}</Text>
                </TouchableOpacity>
              ))
            ) : (
              FOOD_DATABASE.map((food) => (
                <TouchableOpacity key={food.name} style={styles.searchResultItem} onPress={() => quickAddFood(food)}>
                  <View style={styles.searchResultMain}>
                    <Text style={styles.searchResultName}>{food.name}</Text>
                    <View style={styles.searchResultMacros}>
                      <Text style={[styles.macroTag, styles.macroTagProtein, { fontSize: 9 }]}>P: {food.protein}g</Text>
                      <Text style={[styles.macroTag, styles.macroTagCarbs, { fontSize: 9 }]}>C: {food.carbs}g</Text>
                      <Text style={[styles.macroTag, styles.macroTagFat, { fontSize: 9 }]}>F: {food.fat}g</Text>
                    </View>
                  </View>
                  <Text style={styles.searchResultCalories}>{food.calories} kcal / {food.serving}</Text>
                </TouchableOpacity>
              ))
            )}
            
            {/* Recent Foods */}
            {recentFoods.length > 0 && (
              <View style={styles.searchSection}>
                <Text style={styles.searchSectionTitle}>Recent Foods</Text>
                {recentFoods.map((food) => (
                  <TouchableOpacity key={food.id} style={styles.searchResultItem} onPress={() => quickAddFood(food)}>
                    <View style={styles.searchResultMain}>
                      <Text style={styles.searchResultName}>{food.name}</Text>
                      <View style={styles.searchResultMacros}>
                        <Text style={[styles.macroTag, styles.macroTagProtein, { fontSize: 9 }]}>P: {food.protein}g</Text>
                        <Text style={[styles.macroTag, styles.macroTagCarbs, { fontSize: 9 }]}>C: {food.carbs}g</Text>
                        <Text style={[styles.macroTag, styles.macroTagFat, { fontSize: 9 }]}>F: {food.fat}g</Text>
                      </View>
                    </View>
                    <Text style={styles.searchResultCalories}>{food.calories} kcal</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Favorite Foods */}
            {favoriteFoods.length > 0 && (
              <View style={styles.searchSection}>
                <Text style={styles.searchSectionTitle}>Favorites ⭐</Text>
                {favoriteFoods.map((food) => (
                  <TouchableOpacity key={food.id} style={styles.searchResultItem} onPress={() => quickAddFood(food)}>
                    <View style={styles.searchResultMain}>
                      <Text style={styles.searchResultName}>⭐ {food.name}</Text>
                      <View style={styles.searchResultMacros}>
                        <Text style={[styles.macroTag, styles.macroTagProtein, { fontSize: 9 }]}>P: {food.protein}g</Text>
                        <Text style={[styles.macroTag, styles.macroTagCarbs, { fontSize: 9 }]}>C: {food.carbs}g</Text>
                        <Text style={[styles.macroTag, styles.macroTagFat, { fontSize: 9 }]}>F: {food.fat}g</Text>
                      </View>
                    </View>
                    <Text style={styles.searchResultCalories}>{food.calories} kcal</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Manual Entry Form */}
          <View style={styles.manualEntryForm}>
            <Text style={styles.formSectionTitle}>Manual Entry</Text>
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Food name"
              placeholderTextColor="#8B95A1"
              value={foodForm.name}
              onChangeText={(v) => setFoodForm(prev => ({ ...prev, name: v }))}
            />
            <View style={styles.formRow}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Calories"
                placeholderTextColor="#8B95A1"
                keyboardType="numeric"
                value={foodForm.calories}
                onChangeText={(v) => setFoodForm(prev => ({ ...prev, calories: v }))}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Protein (g)"
                placeholderTextColor="#8B95A1"
                keyboardType="numeric"
                value={foodForm.protein}
                onChangeText={(v) => setFoodForm(prev => ({ ...prev, protein: v }))}
              />
            </View>
            <View style={styles.formRow}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Carbs (g)"
                placeholderTextColor="#8B95A1"
                keyboardType="numeric"
                value={foodForm.carbs}
                onChangeText={(v) => setFoodForm(prev => ({ ...prev, carbs: v }))}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Fat (g)"
                placeholderTextColor="#8B95A1"
                keyboardType="numeric"
                value={foodForm.fat}
                onChangeText={(v) => setFoodForm(prev => ({ ...prev, fat: v }))}
              />
            </View>
            <View style={styles.formRow}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Serving (e.g. 1.5)"
                placeholderTextColor="#8B95A1"
                keyboardType="numeric"
                value={foodForm.serving}
                onChangeText={(v) => setFoodForm(prev => ({ ...prev, serving: v }))}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Unit (e.g. cup, piece)"
                placeholderTextColor="#8B95A1"
                value={foodForm.servingUnit}
                onChangeText={(v) => setFoodForm(prev => ({ ...prev, servingUnit: v }))}
              />
            </View>
            <TouchableOpacity style={[styles.button, { marginTop: 14 }]} onPress={addFood}>
              <Text style={styles.buttonText}>Add to {MEALS.find(m => m.key === activeMeal).label}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )}

      {showBarcodeScanner && (
        <View style={styles.modalOverlay}>
          <View style={styles.barcodeModal}>
            <BarCodeScanner
              onBarCodeScanned={handleBarcodeScanned}
              style={styles.barcodeScanner}
            />
            <View style={styles.barcodeOverlay}>
              <Text style={styles.barcodeInstruction}>Position barcode within frame</Text>
              <TouchableOpacity style={styles.barcodeCloseBtn} onPress={() => { setShowBarcodeScanner(false); setBarcodeScanned(false); }}>
                <Text style={styles.barcodeCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    <TabBar active={screen} onChange={setScreen} />
  </>
);
  }

  // ---------- WORKOUT SCREEN ----------
  if (screen === "workout") {
    // Workout state management
    const [workoutView, setWorkoutView] = useState("list"); // list, active, history, templatePicker
    const [activeWorkout, setActiveWorkout] = useState(null); // { id, name, type, exercises: [{name, sets:[{reps, weight, completed, rpe}]}, ...], startTime, caloriesBurned }
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showExerciseSearch, setShowExerciseSearch] = useState(false);
    const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
    const [restTimer, setRestTimer] = useState({ active: false, exerciseId: null, setIndex: null, remaining: 0, total: 0 });
    const [showRestTimerModal, setShowRestTimerModal] = useState(false);
    const [workoutHistory, setWorkoutHistory] = useState([]);
    const [editingSet, setEditingSet] = useState(null); // { exerciseIndex, setIndex, exercise }
    const [showWorkoutSummary, setShowWorkoutSummary] = useState(false);

    // Workout templates from constants
    const templates = Object.entries(WORKOUT_TEMPLATES).map(([key, t]) => ({ key, ...t }));

    // Filter exercises by search query
    const filteredExercises = EXERCISE_LIBRARY.filter(ex =>
      ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
      ex.muscle.toLowerCase().includes(exerciseSearchQuery.toLowerCase())
    );

    // Group exercises by muscle for picker
    const exercisesByMuscle = EXERCISE_LIBRARY.reduce((acc, ex) => {
      if (!acc[ex.muscle]) acc[ex.muscle] = [];
      acc[ex.muscle].push(ex);
      return acc;
    }, {});

    // Calculate calories burned for a workout
    const calculateCaloriesBurned = (workout) => {
      if (!profile.weightKg) return 0;
      const weight = parseFloat(profile.weightKg);
      let totalCalories = 0;
      workout.exercises?.forEach(ex => {
        const exerciseDef = EXERCISE_LIBRARY.find(e => e.name === ex.name);
        const met = exerciseDef?.met || 5;
        // Estimate duration: sets * (avg 45 sec work + rest)
        const setsCount = ex.sets?.length || 0;
        const avgRest = ex.sets?.reduce((sum, s) => sum + (exerciseDef?.restSec || 60), 0) / setsCount || 60;
        const durationMinutes = (setsCount * (45 + avgRest)) / 60;
        const calories = met * weight * durationMinutes / 60;
        totalCalories += calories;
      });
      return Math.round(totalCalories);
    };

    // Save workout to daily log
    const saveWorkoutToLog = async (workout) => {
      const dateKey = storage.getTodayKey();
      const existingLog = await storage.loadDailyLog(dateKey);
      const existingWorkouts = existingLog?.workouts || [];
      const updatedWorkouts = [...existingWorkouts, workout];
      await storage.saveDailyLog(dateKey, { ...existingLog, workouts: updatedWorkouts });
      setWorkouts(updatedWorkouts);
    };

    // Load workout history from all logs
    const loadWorkoutHistory = async () => {
      const allLogs = await storage.loadAllDailyLogs();
      const history = [];
      Object.values(allLogs).forEach(log => {
        if (log.workouts?.length) {
          log.workouts.forEach(w => history.push({ ...w, date: log.date }));
        }
      });
      history.sort((a, b) => new Date(b.startTime || b.date) - new Date(a.startTime || a.date));
      setWorkoutHistory(history);
    };

    // Load history on mount
    useEffect(() => {
      loadWorkoutHistory();
    }, []);

    // Start rest timer
    const startRestTimer = (exerciseId, setIndex, duration) => {
      setRestTimer({ active: true, exerciseId, setIndex, remaining: duration, total: duration });
      setShowRestTimerModal(true);
      // Schedule notification for when timer ends
      if (duration > 0) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Rest Complete",
            body: `Ready for your next set!`,
            sound: true,
          },
          trigger: { seconds: duration, repeats: false },
        });
      }
    };

    // Rest timer countdown
    useEffect(() => {
      let interval;
      if (restTimer.active && restTimer.remaining > 0) {
        interval = setInterval(() => {
          setRestTimer(prev => ({ ...prev, remaining: prev.remaining - 1 }));
        }, 1000);
      } else if (restTimer.active && restTimer.remaining <= 0) {
        setRestTimer(prev => ({ ...prev, active: false }));
        setShowRestTimerModal(false);
      }
      return () => clearInterval(interval);
    }, [restTimer.active, restTimer.remaining]);

    // Format time for display
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Format workout duration
    const formatDuration = (startTime) => {
      if (!startTime) return "0:00";
      const diff = Date.now() - startTime;
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Start a new workout from template
    const startWorkoutFromTemplate = (template) => {
      const exercises = template.exercises.map((ex, i) => {
        const exerciseDef = EXERCISE_LIBRARY.find(e => e.name === ex.name);
        return {
          ...ex,
          id: `ex_${Date.now()}_${i}`,
          exerciseDef,
          sets: Array.from({ length: ex.sets }, (_, si) => ({
            id: `set_${Date.now()}_${i}_${si}`,
            targetReps: ex.reps,
            targetWeight: 0,
            reps: "",
            weight: "",
            completed: false,
            rpe: "",
            restSec: ex.restSec,
          })),
        };
      });
      const newWorkout = {
        id: `workout_${Date.now()}`,
        name: template.name,
        type: template.key,
        exercises,
        startTime: Date.now(),
        completed: false,
        caloriesBurned: 0,
      };
      setActiveWorkout(newWorkout);
      setWorkoutView("active");
      setShowTemplatePicker(false);
    };

    // Start custom workout
    const startCustomWorkout = () => {
      const newWorkout = {
        id: `workout_${Date.now()}`,
        name: "Custom Workout",
        type: "custom",
        exercises: [],
        startTime: Date.now(),
        completed: false,
        caloriesBurned: 0,
      };
      setActiveWorkout(newWorkout);
      setWorkoutView("active");
    };

    // Add exercise to active workout
    const addExerciseToWorkout = (exercise) => {
      const exerciseDef = EXERCISE_LIBRARY.find(e => e.name === exercise.name);
      const newExercise = {
        name: exercise.name,
        muscle: exercise.muscle,
        type: exercise.type,
        met: exercise.met,
        id: `ex_${Date.now()}`,
        exerciseDef,
        sets: [
          { id: `set_${Date.now()}_0`, targetReps: "8-12", targetWeight: 0, reps: "", weight: "", completed: false, rpe: "", restSec: 90 },
          { id: `set_${Date.now()}_1`, targetReps: "8-12", targetWeight: 0, reps: "", weight: "", completed: false, rpe: "", restSec: 90 },
          { id: `set_${Date.now()}_2`, targetReps: "8-12", targetWeight: 0, reps: "", weight: "", completed: false, rpe: "", restSec: 90 },
        ],
      };
      setActiveWorkout(prev => ({
        ...prev,
        exercises: [...prev.exercises, newExercise],
      }));
      setShowExerciseSearch(false);
      setExerciseSearchQuery("");
    };

    // Update a set
    const updateSet = (exerciseIndex, setIndex, field, value) => {
      setActiveWorkout(prev => ({
        ...prev,
        exercises: prev.exercises.map((ex, ei) =>
          ei === exerciseIndex
            ? { ...ex, sets: ex.sets.map((s, si) => si === setIndex ? { ...s, [field]: value } : s) }
            : ex
        ),
      }));
    };

    // Toggle set completion
    const toggleSetComplete = (exerciseIndex, setIndex) => {
      setActiveWorkout(prev => ({
        ...prev,
        exercises: prev.exercises.map((ex, ei) =>
          ei === exerciseIndex
            ? {
                ...ex,
                sets: ex.sets.map((s, si) => {
                  if (si === setIndex) {
                    const newCompleted = !s.completed;
                    // Auto-start rest timer if completing a set (not the last set)
                    if (newCompleted && si < ex.sets.length - 1 && s.restSec > 0) {
                      setTimeout(() => startRestTimer(ex.id, si, s.restSec), 500);
                    }
                    return { ...s, completed: newCompleted };
                  }
                  return s;
                }),
              }
            : ex
        ),
      }));
    };

    // Delete exercise from workout
    const deleteExercise = (exerciseIndex) => {
      setActiveWorkout(prev => ({
        ...prev,
        exercises: prev.exercises.filter((_, i) => i !== exerciseIndex),
      }));
    };

    // Delete set from exercise
    const deleteSet = (exerciseIndex, setIndex) => {
      setActiveWorkout(prev => ({
        ...prev,
        exercises: prev.exercises.map((ex, ei) =>
          ei === exerciseIndex
            ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) }
            : ex
        ),
      }));
    };

    // Add set to exercise
    const addSet = (exerciseIndex) => {
      setActiveWorkout(prev => ({
        ...prev,
        exercises: prev.exercises.map((ex, ei) =>
          ei === exerciseIndex
            ? {
                ...ex,
                sets: [
                  ...ex.sets,
                  { id: `set_${Date.now()}`, targetReps: "8-12", targetWeight: 0, reps: "", weight: "", completed: false, rpe: "", restSec: 90 },
                ],
              }
            : ex
        ),
      }));
    };

    // Complete workout
    const completeWorkout = async () => {
      if (!activeWorkout) return;
      const caloriesBurned = calculateCaloriesBurned(activeWorkout);
      const completedWorkout = {
        ...activeWorkout,
        endTime: Date.now(),
        duration: Date.now() - activeWorkout.startTime,
        completed: true,
        caloriesBurned,
      };
      await saveWorkoutToLog(completedWorkout);
      setActiveWorkout(null);
      setWorkoutView("list");
      setShowWorkoutSummary(true);
      // Reload history
      loadWorkoutHistory();
    };

    // Discard workout
    const discardWorkout = () => {
      Alert.alert("Discard Workout?", "Are you sure you want to discard this workout? All progress will be lost.", [
        { text: "Cancel", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => { setActiveWorkout(null); setWorkoutView("list"); } },
      ]);
    };

    // Get muscle color
    const getMuscleColor = (muscle) => MUSCLE_COLORS[muscle] || "#8B95A1";

    // Render workout list view
    const renderWorkoutList = () => (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Dumbbell size={22} color="#E8A23D" />
            <Text style={styles.headerTitle}>Workout</Text>
          </View>
          <TouchableOpacity style={styles.addWorkoutBtn} onPress={() => setShowTemplatePicker(true)}>
            <Plus size={20} color="#E8A23D" />
          </TouchableOpacity>
        </View>

        {/* Today's Workouts */}
        {workouts.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Today</Text>
            {workouts.map((w, i) => (
              <View key={w.id} style={styles.workoutCard}>
                <View style={styles.workoutCardHeader}>
                  <View style={styles.workoutCardTitleRow}>
                    <Text style={styles.workoutCardName}>{w.name}</Text>
                    <View style={{ backgroundColor: getMuscleColor(w.type === "cardio_hiit" ? "hiit" : w.type === "cardio_steady" ? "cardio" : "chest"), borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={styles.workoutCardType}>{w.type.replace("_", " ").toUpperCase()}</Text>
                    </View>
                  </View>
                  {w.completed && (
                    <View style={styles.workoutCardMeta}>
                      <Text style={styles.workoutCardDuration}>{formatDuration(w.duration)}</Text>
                      <Text style={styles.workoutCardCalories}>🔥 {w.caloriesBurned} kcal</Text>
                    </View>
                  )}
                </View>
                {w.exercises?.map((ex, ei) => (
                  <View key={ex.id} style={styles.workoutExerciseRow}>
                    <Text style={styles.workoutExerciseName}>{ex.name}</Text>
                    <Text style={styles.workoutExerciseSets}>
                      {ex.sets?.filter(s => s.completed).length || 0} / {ex.sets?.length || 0} sets
                    </Text>
                  </View>
                ))}
                {!w.completed && activeWorkout?.id === w.id && (
                  <TouchableOpacity style={styles.resumeBtn} onPress={() => { setActiveWorkout(w); setWorkoutView("active"); }}>
                    <Text style={styles.resumeBtnText}>Resume Workout</Text>
                  </TouchableOpacity>
                )}
                {w.completed && (
                  <TouchableOpacity style={styles.viewDetailsBtn} onPress={() => { setActiveWorkout(w); setWorkoutView("active"); }}>
                    <Text style={styles.viewDetailsBtnText}>View Details</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Quick Start Templates */}
        <View style={{ marginTop: 24 }}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <View style={styles.templateGrid}>
            {templates.map((template) => (
              <TouchableOpacity key={template.key} style={styles.templateCard} onPress={() => startWorkoutFromTemplate(template)}>
                <View style={styles.templateCardHeader}>
                  <Text style={styles.templateCardName}>{template.name}</Text>
                  <Text style={styles.templateCardDesc}>{template.description}</Text>
                </View>
                <View style={styles.templateCardExercises}>
                  {template.exercises.slice(0, 3).map((ex, i) => (
                    <Text key={i} style={styles.templateExerciseName}>{ex.name}</Text>
                  ))}
                  {template.exercises.length > 3 && (
                    <Text style={styles.templateExerciseName}>+{template.exercises.length - 3} more</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Workout Button */}
        <TouchableOpacity style={styles.customWorkoutBtn} onPress={startCustomWorkout}>
          <View style={styles.customWorkoutBtnContent}>
            <Plus size={20} color="#E8A23D" />
            <Text style={styles.customWorkoutBtnText}>Create Custom Workout</Text>
          </View>
        </TouchableOpacity>

        {/* History Button */}
        <TouchableOpacity style={styles.historyBtn} onPress={() => { setWorkoutView("history"); loadWorkoutHistory(); }}>
          <View style={styles.historyBtnContent}>
            <History size={20} color="#8B95A1" />
            <Text style={styles.historyBtnText}>View Workout History</Text>
            <ChevronRightIcon size={20} color="#8B95A1" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    );

    // Render active workout view
    const renderActiveWorkout = () => {
      if (!activeWorkout) return null;

      const totalSets = activeWorkout.exercises?.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0) || 0;
      const completedSets = activeWorkout.exercises?.reduce((sum, ex) => sum + (ex.sets?.filter(s => s.completed).length || 0), 0) || 0;
      const progress = totalSets > 0 ? completedSets / totalSets : 0;

      return (
        <>
          <View style={{ flex: 1, backgroundColor: "#12161B" }}>
            {/* Workout Header */}
            <View style={styles.activeWorkoutHeader}>
              <View style={styles.activeWorkoutHeaderLeft}>
                <TouchableOpacity onPress={() => discardWorkout()}>
                  <X size={24} color="#8B95A1" />
                </TouchableOpacity>
                <View style={styles.activeWorkoutTitleContainer}>
                  <Text style={styles.activeWorkoutName}>{activeWorkout.name}</Text>
                  <Text style={styles.activeWorkoutDuration}>{formatDuration(activeWorkout.startTime)}</Text>
                </View>
              </View>
              <View style={styles.activeWorkoutHeaderRight}>
                <View style={styles.progressRingContainer}>
                  <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
                </View>
                <TouchableOpacity style={styles.completeWorkoutBtn} onPress={completeWorkout} disabled={completedSets === 0}>
                  <Check size={20} color="#181008" />
                  <Text style={styles.completeWorkoutBtnText}>Finish</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.activeProgressBar}>
              <View style={[styles.activeProgressFill, { width: `${progress * 100}%` }]} />
            </View>

            {/* Exercises List */}
            <ScrollView style={styles.activeScrollView} contentContainerStyle={styles.activeScrollContent}>
              {activeWorkout.exercises?.map((ex, exIndex) => (
                <View key={ex.id} style={styles.activeExerciseCard}>
                  <View style={styles.activeExerciseHeader}>
                    <View style={styles.activeExerciseInfo}>
                      <Text style={styles.activeExerciseName}>{ex.name}</Text>
                      <View style={styles.activeExerciseMeta}>
                        <View style={{ backgroundColor: getMuscleColor(ex.muscle), borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                          <Text style={styles.activeExerciseMuscle}>{ex.muscle.toUpperCase()}</Text>
                        </View>
                        <Text style={styles.activeExerciseType}>{ex.type}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.deleteExerciseBtn} onPress={() => deleteExercise(exIndex)}>
                      <Trash2 size={18} color="#E2665A" />
                    </TouchableOpacity>
                  </View>

                  {/* Sets */}
                  <View style={styles.setsContainer}>
                    {ex.sets?.map((set, setIndex) => (
                      <View key={set.id} style={[
                        styles.setRow,
                        set.completed && styles.setRowCompleted,
                        restTimer.active && restTimer.exerciseId === ex.id && restTimer.setIndex === setIndex && styles.setRowActiveRest,
                      ]}>
                        <View style={styles.setNumberContainer}>
                          <Text style={[
                            styles.setNumber,
                            set.completed && styles.setNumberCompleted,
                            restTimer.active && restTimer.exerciseId === ex.id && restTimer.setIndex === setIndex && styles.setNumberActive,
                          ]}>
                            {setIndex + 1}
                          </Text>
                          {set.completed && <Check size={16} color="#4FB0A5" style={styles.setCheck} />}
                        </View>

                        <View style={styles.setInputs}>
                          <TextInput
                            style={styles.setInput}
                            placeholder={set.targetReps}
                            value={set.reps}
                            onChangeText={(v) => updateSet(exIndex, setIndex, "reps", v)}
                            keyboardType="numeric"
                            editable={!set.completed}
                          />
                          <Text style={styles.setInputSeparator}>×</Text>
                          <TextInput
                            style={styles.setInput}
                            placeholder="Weight"
                            value={set.weight}
                            onChangeText={(v) => updateSet(exIndex, setIndex, "weight", v)}
                            keyboardType="numeric"
                            editable={!set.completed}
                          />
                          <Text style={styles.setUnit}>{profile.units === "imperial" ? "lbs" : "kg"}</Text>
                        </View>

                        <View style={styles.setActions}>
                          <TouchableOpacity
                            style={[
                              styles.setActionBtn,
                              set.completed && styles.setActionBtnCompleted,
                            ]}
                            onPress={() => toggleSetComplete(exIndex, setIndex)}
                            disabled={set.completed}
                          >
                            {set.completed ? (
                              <Check size={18} color="#4FB0A5" />
                            ) : (
                              <Square size={18} color="#8B95A1" />
                            )}
                          </TouchableOpacity>
                          {set.restSec > 0 && !set.completed && setIndex < (ex.sets?.length || 0) - 1 && (
                            <TouchableOpacity style={styles.restBtn} onPress={() => startRestTimer(ex.id, setIndex, set.restSec)}>
                              <Timer size={16} color="#E8A23D" />
                              <Text style={styles.restBtnText}>{set.restSec}s</Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* RPE Input */}
                        <View style={styles.rpeInputContainer}>
                          <Text style={styles.rpeLabel}>RPE</Text>
                          <TextInput
                            style={styles.rpeInput}
                            placeholder="0"
                            value={set.rpe}
                            onChangeText={(v) => updateSet(exIndex, setIndex, "rpe", v)}
                            keyboardType="numeric"
                            editable={!set.completed}
                          />
                        </View>
                      </View>
                    ))}
                    {/* Add Set Button */}
                    <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(exIndex)}>
                      <Plus size={18} color="#8B95A1" />
                      <Text style={styles.addSetBtnText}>Add Set</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Add Exercise Button */}
              <TouchableOpacity style={styles.addExerciseBtn} onPress={() => { setShowExerciseSearch(true); setExerciseSearchQuery(""); }}>
                <Plus size={20} color="#E8A23D" />
                <Text style={styles.addExerciseBtnText}>Add Exercise</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Rest Timer Modal */}
          {showRestTimerModal && restTimer.active && (
            <Modal visible={true} animationType="slide" transparent={true}>
              <View style={styles.restTimerModalOverlay}>
                <View style={styles.restTimerModal}>
                  <Text style={styles.restTimerTitle}>Rest Timer</Text>
                  <View style={styles.restTimerCircle}>
                    <Text style={styles.restTimerTime}>{formatTime(restTimer.remaining)}</Text>
                    <Text style={styles.restTimerLabel}>{restTimer.total}s rest</Text>
                  </View>
                  <View style={styles.restTimerProgress}>
                    <View style={[styles.restTimerProgressFill, { width: `${(restTimer.remaining / restTimer.total) * 100}%` }]} />
                  </View>
                  <TouchableOpacity style={styles.restTimerSkipBtn} onPress={() => { setRestTimer(prev => ({ ...prev, active: false, remaining: 0 })); setShowRestTimerModal(false); }}>
                    <Text style={styles.restTimerSkipText}>Skip Rest</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}

          {/* Exercise Search Modal */}
          {showExerciseSearch && (
            <Modal visible={true} animationType="slide" transparent={true}>
              <View style={styles.modalOverlay}>
                <View style={styles.exerciseSearchModal}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Add Exercise</Text>
                    <TouchableOpacity onPress={() => { setShowExerciseSearch(false); setExerciseSearchQuery(""); }}>
                      <X size={24} color="#8B95A1" />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search exercises..."
                    placeholderTextColor="#8B95A1"
                    value={exerciseSearchQuery}
                    onChangeText={setExerciseSearchQuery}
                    autoFocus
                  />
                  <ScrollView style={styles.exerciseSearchResults} contentContainerStyle={styles.exerciseSearchResultsContent}>
                    {Object.entries(exercisesByMuscle).map(([muscle, exercises]) => (
                      <View key={muscle} style={styles.exerciseMuscleGroup}>
                        <Text style={styles.exerciseMuscleLabel}>{muscle.toUpperCase()}</Text>
                        {exercises
                          .filter(ex => ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()))
                          .map((ex) => (
                            <TouchableOpacity key={ex.name} style={styles.exerciseSearchItem} onPress={() => addExerciseToWorkout(ex)}>
                              <View style={styles.exerciseSearchItemMain}>
                                <Text style={styles.exerciseSearchItemName}>{ex.name}</Text>
                                <View style={styles.exerciseSearchItemMeta}>
                                  <View style={{ backgroundColor: getMuscleColor(ex.muscle), borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 }}>
                                    <Text style={styles.exerciseSearchItemMuscle}>{ex.muscle}</Text>
                                  </View>
                                  <Text style={styles.exerciseSearchItemType}>{ex.type}</Text>
                                  <Text style={styles.exerciseSearchItemMet}>MET: {ex.met}</Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                          ))}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          )}

          {/* Template Picker Modal */}
          {showTemplatePicker && (
            <Modal visible={true} animationType="slide" transparent={true}>
              <View style={styles.modalOverlay}>
                <View style={styles.templatePickerModal}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Start New Workout</Text>
                    <TouchableOpacity onPress={() => setShowTemplatePicker(false)}>
                      <X size={24} color="#8B95A1" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.templatePickerList} contentContainerStyle={styles.templatePickerListContent}>
                    {templates.map((template) => (
                      <TouchableOpacity key={template.key} style={styles.templatePickerCard} onPress={() => startWorkoutFromTemplate(template)}>
                        <View style={styles.templatePickerCardHeader}>
                          <Text style={styles.templatePickerCardName}>{template.name}</Text>
                          <Text style={styles.templatePickerCardDesc}>{template.description}</Text>
                        </View>
                        <View style={styles.templatePickerCardExercises}>
                          {template.exercises.map((ex, i) => (
                            <Text key={i} style={styles.templatePickerExercise}>{ex.name} • {ex.sets}×{ex.reps} • {ex.restSec}s rest</Text>
                          ))}
                        </View>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.customTemplateBtn} onPress={startCustomWorkout}>
                      <Plus size={20} color="#E8A23D" />
                      <Text style={styles.customTemplateBtnText}>Create Custom Workout</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            </Modal>
          )}

          {/* Workout Summary Modal */}
          {showWorkoutSummary && activeWorkout && (
            <Modal visible={true} animationType="slide" transparent={true}>
              <View style={styles.modalOverlay}>
                <View style={styles.summaryModal}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Workout Complete!</Text>
                  </View>
                  <View style={styles.summaryContent}>
                    <View style={styles.summaryStat}>
                      <Text style={styles.summaryStatLabel}>Duration</Text>
                      <Text style={styles.summaryStatValue}>{formatDuration(activeWorkout.duration)}</Text>
                    </View>
                    <View style={styles.summaryStat}>
                      <Text style={styles.summaryStatLabel}>Exercises</Text>
                      <Text style={styles.summaryStatValue}>{activeWorkout.exercises?.length || 0}</Text>
                    </View>
                    <View style={styles.summaryStat}>
                      <Text style={styles.summaryStatLabel}>Total Sets</Text>
                      <Text style={styles.summaryStatValue}>{activeWorkout.exercises?.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0) || 0}</Text>
                    </View>
                    <View style={styles.summaryStat}>
                      <Text style={styles.summaryStatLabel}>Calories Burned</Text>
                      <Text style={[styles.summaryStatValue, { color: "#E8A23D" }]}>🔥 {calculateCaloriesBurned(activeWorkout)} kcal</Text>
                    </View>
                    <View style={styles.summaryStat}>
                      <Text style={styles.summaryStatLabel}>Volume</Text>
                      <Text style={styles.summaryStatValue}>
                        {activeWorkout.exercises?.reduce((sum, ex) =>
                          sum + (ex.sets?.reduce((s, set) => s + (parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0), 0) || 0), 0).toFixed(0)
                        } {profile.units === "imperial" ? "lbs" : "kg"}·reps
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.summaryCloseBtn} onPress={() => { setShowWorkoutSummary(false); setActiveWorkout(null); setWorkoutView("list"); }}>
                    <Text style={styles.summaryCloseBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
          <TabBar active={screen} onChange={setScreen} />
        </>
      );
    };

    // Render workout history view
    const renderWorkoutHistory = () => (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setWorkoutView("list")} style={styles.backBtn}>
            <ChevronLeft size={24} color="#E8A23D" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout History</Text>
          <View style={{ width: 40 }} />
        </View>

        {workoutHistory.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Trophy size={48} color="#8B95A1" />
            <Text style={styles.emptyHistoryText}>No workouts yet</Text>
            <Text style={styles.emptyHistorySubtext}>Complete your first workout to see history</Text>
          </View>
        ) : (
          <>
            {/* Group by date */}
            {workoutHistory.reduce((acc, w) => {
              const date = w.date || new Date(w.startTime).toISOString().split('T')[0];
              if (!acc[date]) acc[date] = [];
              acc[date].push(w);
              return acc;
            }, {}) && Object.entries(
              workoutHistory.reduce((acc, w) => {
                const date = w.date || new Date(w.startTime).toISOString().split('T')[0];
                if (!acc[date]) acc[date] = [];
                acc[date].push(w);
                return acc;
              }, {})
            ).map(([date, dayWorkouts]) => (
              <View key={date} style={styles.historyDayGroup}>
                <Text style={styles.historyDate}>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                {dayWorkouts.map((w) => (
                  <View key={w.id} style={styles.historyWorkoutCard}>
                    <View style={styles.historyWorkoutHeader}>
                      <Text style={styles.historyWorkoutName}>{w.name}</Text>
                      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                        <Text style={styles.historyWorkoutTime}>{formatDuration(w.duration)}</Text>
                        <Text style={styles.historyWorkoutCalories}>🔥 {w.caloriesBurned} kcal</Text>
                      </View>
                    </View>
                    <View style={styles.historyWorkoutExercises}>
                      {w.exercises?.map((ex, i) => (
                        <View key={ex.id} style={styles.historyExerciseRow}>
                          <Text style={styles.historyExerciseName}>{ex.name}</Text>
                          <Text style={styles.historyExerciseVolume}>
                            {ex.sets?.reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseFloat(s.reps) || 0), 0).toFixed(0)} vol
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}
        <TabBar active={screen} onChange={setScreen} />
      </ScrollView>
    );

    // Render based on current view
    if (workoutView === "list") return renderWorkoutList();
    if (workoutView === "active") return renderActiveWorkout();
    if (workoutView === "history") return renderWorkoutHistory();
    return renderWorkoutList();
  }

  // ---------- CALENDAR / HISTORY / BODY METRICS SCREEN ----------
  if (screen === "weight") {
    const [calendarView, setCalendarView] = useState("month"); // month, week, metrics
    const [selectedDate, setSelectedDate] = useState(storage.getTodayKey());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [dayDetail, setDayDetail] = useState(null);
    const [showDayDetail, setShowDayDetail] = useState(false);
    const [exportData, setExportData] = useState(null);
    const [showExportModal, setShowExportModal] = useState(false);
    
    // Body Metrics state
    const [bodyMetrics, setBodyMetrics] = useState({ weight: [], bodyFat: [], measurements: [], photos: [] });
    const [showAddWeight, setShowAddWeight] = useState(false);
    const [showAddBodyFat, setShowAddBodyFat] = useState(false);
    const [showAddMeasurements, setShowAddMeasurements] = useState(false);
    const [showAddPhoto, setShowAddPhoto] = useState(false);
    const [newWeight, setNewWeight] = useState("");
    const [newBodyFat, setNewBodyFat] = useState("");
    const [newMeasurements, setNewMeasurements] = useState({ waist: "", chest: "", leftArm: "", rightArm: "", leftThigh: "", rightThigh: "", neck: "", hips: "" });
    const [newPhoto, setNewPhoto] = useState(null);
    const [photoDate, setPhotoDate] = useState(storage.getTodayKey());
    const [comparePhotoDate, setComparePhotoDate] = useState("");
    const [goalWeight, setGoalWeight] = useState("");
    const [goalWeightDate, setGoalWeightDate] = useState("");

    // Load all daily logs for calendar
    const [allLogs, setAllLogs] = useState({});
    useEffect(() => {
      storage.loadAllDailyLogs().then(setAllLogs);
    }, []);

    // Extract body metrics from logs
    useEffect(() => {
      if (Object.keys(allLogs).length > 0) {
        const weightData = [];
        const bodyFatData = [];
        const measurementsData = [];
        const photosData = [];
        
        Object.entries(allLogs).forEach(([dateKey, log]) => {
          if (log.weight !== undefined && log.weight !== null) {
            weightData.push({ date: dateKey, value: parseFloat(log.weight), unit: profile.units });
          }
          if (log.bodyFat !== undefined && log.bodyFat !== null) {
            bodyFatData.push({ date: dateKey, value: parseFloat(log.bodyFat) });
          }
          if (log.measurements) {
            measurementsData.push({ date: dateKey, ...log.measurements });
          }
          if (log.photoUri) {
            photosData.push({ date: dateKey, uri: log.photoUri, note: log.photoNote });
          }
        });
        
        // Sort by date
        weightData.sort((a, b) => a.date.localeCompare(b.date));
        bodyFatData.sort((a, b) => a.date.localeCompare(b.date));
        measurementsData.sort((a, b) => a.date.localeCompare(b.date));
        photosData.sort((a, b) => a.date.localeCompare(b.date));
        
        setBodyMetrics({ weight: weightData, bodyFat: bodyFatData, measurements: measurementsData, photos: photosData });
      }
    }, [allLogs, profile.units]);

    // Get completion score for a date (0-1)
    const getDayCompletion = (dateKey) => {
      const log = allLogs[dateKey];
      if (!log) return 0;
      let score = 0;
      let factors = 0;
      
      // Food logging (30%)
      if (log.food?.length > 0) {
        factors += 0.3;
        const totalCal = log.food.reduce((s, f) => s + (f.calories || 0), 0);
        if (totalCal > (result?.calorieGoal || 1) * 0.5) score += 0.3;
        else score += 0.15;
      }
      
      // Water (15%)
      if (log.waterMl > 0) {
        factors += 0.15;
        if (log.waterMl >= (waterGoal || 2500)) score += 0.15;
        else score += 0.07;
      }
      
      // Workout (25%)
      if (log.workouts?.length > 0) {
        factors += 0.25;
        const completed = log.workouts.filter(w => w.completed).length;
        if (completed > 0) score += 0.25;
        else score += 0.1;
      }
      
      // Steps (15%)
      if (log.steps > 0) {
        factors += 0.15;
        if (log.steps >= (stepsGoal || 10000)) score += 0.15;
        else score += 0.07;
      }
      
      // Weight entry (15%)
      if (log.weight) {
        factors += 0.15;
        score += 0.15;
      }
      
      return factors > 0 ? score / factors : 0;
    };

    // Get color for completion
    const getCompletionColor = (completion) => {
      if (completion >= 0.8) return "#4FB0A5";
      if (completion >= 0.5) return "#E8A23D";
      if (completion > 0) return "#E2665A";
      return "#2A323C";
    };

    // ---------- BODY METRICS HELPERS ----------
    // Calculate moving average (7-day)
    const getMovingAverage = (data, window = 7) => {
      if (data.length < window) return null;
      const recent = data.slice(-window);
      const sum = recent.reduce((s, d) => s + d.value, 0);
      return sum / window;
    };

    // Calculate weight trend (linear regression slope over last 14 days)
    const getWeightTrend = (data) => {
      if (data.length < 3) return { slope: 0, direction: "stable", weeklyChange: 0 };
      const recent = data.slice(-14);
      const n = recent.length;
      const x = recent.map((_, i) => i);
      const y = recent.map(d => d.value);
      const xMean = x.reduce((a, b) => a + b, 0) / n;
      const yMean = y.reduce((a, b) => a + b, 0) / n;
      const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
      const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0);
      const slope = denominator !== 0 ? numerator / denominator : 0;
      const weeklyChange = slope * 7;
      let direction = "stable";
      if (weeklyChange < -0.1) direction = "down";
      else if (weeklyChange > 0.1) direction = "up";
      return { slope, direction, weeklyChange };
    };

    // Project goal date
    const getGoalProjection = (currentWeight, goalWeight, weeklyChange) => {
      if (!currentWeight || !goalWeight || weeklyChange === 0) return null;
      const diff = goalWeight - currentWeight;
      const weeks = diff / weeklyChange;
      if (weeks <= 0) return null;
      const days = Math.round(weeks * 7);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      return { days, date: targetDate.toISOString().split('T')[0], weeks: weeks.toFixed(1) };
    };

    // Save body metric to daily log
    const saveBodyMetric = async (dateKey, metricType, value, extra = {}) => {
      const existingLog = await storage.loadDailyLog(dateKey);
      const updatedLog = { ...existingLog, [metricType]: value, ...extra };
      await storage.saveDailyLog(dateKey, updatedLog);
      setAllLogs(prev => ({ ...prev, [dateKey]: updatedLog }));
    };

    // Add weight entry
    const addWeightEntry = async () => {
      if (!newWeight) return;
      await saveBodyMetric(selectedDate, "weight", parseFloat(newWeight));
      setNewWeight("");
      setShowAddWeight(false);
    };

    // Add body fat entry
    const addBodyFatEntry = async () => {
      if (!newBodyFat) return;
      await saveBodyMetric(selectedDate, "bodyFat", parseFloat(newBodyFat));
      setNewBodyFat("");
      setShowAddBodyFat(false);
    };

    // Add measurements
    const addMeasurementsEntry = async () => {
      const measurements = {};
      Object.entries(newMeasurements).forEach(([key, val]) => {
        if (val) measurements[key] = parseFloat(val);
      });
      if (Object.keys(measurements).length === 0) return;
      await saveBodyMetric(selectedDate, "measurements", measurements);
      setNewMeasurements({ waist: "", chest: "", leftArm: "", rightArm: "", leftThigh: "", rightThigh: "", neck: "", hips: "" });
      setShowAddMeasurements(false);
    };

    // Format date for display
    const formatMetricDate = (key) => {
      const [y, m, d] = key.split('-');
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Get latest weight
    const latestWeight = bodyMetrics.weight.length > 0 ? bodyMetrics.weight[bodyMetrics.weight.length - 1].value : null;
    const latestBodyFat = bodyMetrics.bodyFat.length > 0 ? bodyMetrics.bodyFat[bodyMetrics.bodyFat.length - 1].value : null;
    const weightTrend = getWeightTrend(bodyMetrics.weight);
    const weightMA7 = getMovingAverage(bodyMetrics.weight, 7);
    const goalProjection = goalWeight && latestWeight ? getGoalProjection(latestWeight, parseFloat(goalWeight), weightTrend.weeklyChange) : null;

    // Generate month days
    const getMonthDays = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDay = firstDay.getDay(); // 0 = Sunday
      const daysInMonth = lastDay.getDate();
      const days = [];
      
      // Previous month trailing days
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = startDay - 1; i >= 0; i--) {
        const d = prevMonthLastDay - i;
        const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({ day: d, dateKey: key, currentMonth: false });
      }
      
      // Current month days
      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({ day: d, dateKey: key, currentMonth: true });
      }
      
      // Next month leading days to fill 6 rows (42 cells)
      const remaining = 42 - days.length;
      for (let d = 1; d <= remaining; d++) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        const key = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({ day: d, dateKey: key, currentMonth: false });
      }
      
      return days;
    };

    const monthDays = getMonthDays(currentMonth);
    const todayKey = storage.getTodayKey();
    const selectedLog = allLogs[selectedDate];

    // Format date for display
    const formatDateKey = (key) => {
      const [y, m, d] = key.split('-');
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
      });
    };

    // Get day stats
    const getDayStats = (log) => {
      if (!log) return null;
      const food = log.food || [];
      const workouts = log.workouts || [];
      const totalCal = food.reduce((s, f) => s + (f.calories || 0), 0);
      const totalProtein = food.reduce((s, f) => s + (f.protein || 0), 0);
      const totalCarbs = food.reduce((s, f) => s + (f.carbs || 0), 0);
      const totalFat = food.reduce((s, f) => s + (f.fat || 0), 0);
      const workoutCal = workouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0);
      const workoutCount = workouts.filter(w => w.completed).length;
      return { totalCal, totalProtein, totalCarbs, totalFat, workoutCal, workoutCount, steps: log.steps || 0, water: log.waterMl || 0, weight: log.weight };
    };

    const dayStats = getDayStats(selectedLog);

    // Week view helpers
    const getWeekDays = (date) => {
      const d = new Date(date);
      const day = d.getDay(); // 0 = Sunday
      const monday = new Date(d);
      monday.setDate(d.getDate() - day + (day === 0 ? -6 : 1)); // Monday start
      const days = [];
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(monday);
        dayDate.setDate(monday.getDate() + i);
        const key = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
        days.push({ date: dayDate, dateKey: key });
      }
      return days;
    };

    const weekDays = getWeekDays(selectedDate);
    const weekStats = weekDays.map(d => ({ dateKey: d.dateKey, completion: getDayCompletion(d.dateKey), log: allLogs[d.dateKey] }));

    // Export data as CSV
    const generateExport = () => {
      const logs = Object.entries(allLogs).sort(([a], [b]) => b.localeCompare(a));
      let csv = "Date,Calories,Protein (g),Carbs (g),Fat (g),Water (ml),Steps,Workouts,Workout Calories,Weight (kg),Body Fat (%),Notes\n";
      
      logs.forEach(([dateKey, log]) => {
        const food = log.food || [];
        const workouts = log.workouts || [];
        const totalCal = food.reduce((s, f) => s + (f.calories || 0), 0);
        const totalProtein = food.reduce((s, f) => s + (f.protein || 0), 0);
        const totalCarbs = food.reduce((s, f) => s + (f.carbs || 0), 0);
        const totalFat = food.reduce((s, f) => s + (f.fat || 0), 0);
        const workoutCal = workouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0);
        const workoutNames = workouts.filter(w => w.completed).map(w => w.name).join('; ');
        
        csv += `${dateKey},${totalCal},${totalProtein.toFixed(1)},${totalCarbs.toFixed(1)},${totalFat.toFixed(1)},${log.waterMl || 0},${log.steps || 0},"${workoutNames}",${workoutCal},${log.weight || ''},${log.bodyFat || ''},"${log.notes || ''}"\n`;
      });
      
      setExportData(csv);
      setShowExportModal(true);
    };

    // Share export
    const shareExport = async () => {
      if (!exportData) return;
      try {
        await Share.share({
          message: `Daily Fuel Export - ${new Date().toISOString().split('T')[0]}`,
          title: "Export Nutrition & Workout Data",
        });
      } catch (e) {
        console.log('Share failed:', e);
      }
    };

    // Copy to clipboard
    const copyExport = () => {
      if (!exportData) return;
      Clipboard.setString(exportData);
      Alert.alert("Copied", "Export data copied to clipboard");
    };

    // Render month view
    const renderMonthView = () => (
      <View style={{ flex: 1, backgroundColor: "#12161B" }}>
        {/* Month Header */}
        <View style={styles.calHeader}>
          <TouchableOpacity onPress={() => setCurrentMonth(prev => {
            const d = new Date(prev);
            d.setMonth(d.getMonth() - 1);
            setCurrentMonth(d);
          })}>
            <ChevronLeft size={24} color="#E8A23D" />
          </TouchableOpacity>
          <View style={styles.calHeaderCenter}>
            <Text style={styles.calMonthTitle}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <Text style={styles.calMonthSubtitle}>
              Tap a day to view details
            </Text>
          </View>
          <TouchableOpacity onPress={() => setCurrentMonth(prev => {
            const d = new Date(prev);
            d.setMonth(d.getMonth() + 1);
            setCurrentMonth(d);
          })}>
            <ChevronRightIcon size={24} color="#E8A23D" />
          </TouchableOpacity>
        </View>

        {/* Weekday Headers */}
        <View style={styles.calWeekdayRow}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <Text key={day} style={styles.calWeekday}>{day}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calGrid}>
          {monthDays.map((item, i) => {
            const isToday = item.dateKey === todayKey;
            const isSelected = item.dateKey === selectedDate;
            const completion = getDayCompletion(item.dateKey);
            const color = getCompletionColor(completion);
            const hasData = allLogs[item.dateKey] !== undefined;
            
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.calDay,
                  !item.currentMonth && styles.calDayOtherMonth,
                  isToday && styles.calDayToday,
                  isSelected && styles.calDaySelected,
                ]}
                onPress={() => {
                  setSelectedDate(item.dateKey);
                  setCalendarView("day");
                  setShowDayDetail(true);
                }}
              >
                <Text style={[
                  styles.calDayNumber,
                  !item.currentMonth && styles.calDayNumberOtherMonth,
                  isToday && styles.calDayNumberToday,
                ]}>
                  {item.day}
                </Text>
                {hasData && (
                  <View style={styles.calDayRing}>
                    <View style={[
                      styles.calDayRingFill,
                      { backgroundColor: color },
                      { width: `${Math.max(completion * 28, 2)}px` },
                      { height: `${Math.max(completion * 28, 2)}px` },
                    ]} />
                  </View>
                )}
                {isToday && !hasData && (
                  <View style={styles.calDayDotToday} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.calLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#4FB0A5" }]} />
            <Text style={styles.legendText}>Complete (≥80%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#E8A23D" }]} />
            <Text style={styles.legendText}>Partial (50-79%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#E2665A" }]} />
            <Text style={styles.legendText}>Minimal (&lt;50%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendDotEmpty} />
            <Text style={styles.legendText}>No Data</Text>
          </View>
        </View>

        {/* View Toggle */}
        <View style={styles.viewToggle}>
          {["month", "week", "metrics"].map(view => (
            <TouchableOpacity
              key={view}
              style={[
                styles.viewToggleBtn,
                calendarView === view && styles.viewToggleBtnActive,
              ]}
              onPress={() => setCalendarView(view)}
            >
              <Text style={[
                styles.viewToggleBtnText,
                calendarView === view && styles.viewToggleBtnTextActive,
              ]}>
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TabBar active={screen} onChange={setScreen} />
      </View>
    );

    // Render week view
    const renderWeekView = () => (
      <View style={{ flex: 1, backgroundColor: "#12161B" }}>
        {/* Week Header */}
        <View style={styles.calHeader}>
          <TouchableOpacity onPress={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() - 7);
            setSelectedDate(storage.getDateKey(d));
            setCurrentMonth(d);
          }}>
            <ChevronLeft size={24} color="#E8A23D" />
          </TouchableOpacity>
          <View style={styles.calHeaderCenter}>
            <Text style={styles.calMonthTitle}>
              {weekDays[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
            <Text style={styles.calMonthSubtitle}>
              Weekly overview
            </Text>
          </View>
          <TouchableOpacity onPress={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + 7);
            setSelectedDate(storage.getDateKey(d));
            setCurrentMonth(d);
          }}>
            <ChevronRightIcon size={24} color="#E8A23D" />
          </TouchableOpacity>
        </View>

        {/* Week Days */}
        <ScrollView style={styles.weekScroll} contentContainerStyle={styles.weekScrollContent}>
          {weekDays.map((item, i) => {
            const isToday = item.dateKey === todayKey;
            const isSelected = item.dateKey === selectedDate;
            const completion = getDayCompletion(item.dateKey);
            const color = getCompletionColor(completion);
            const log = allLogs[item.dateKey];
            const stats = getDayStats(log);
            
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.weekDayCard,
                  isToday && styles.weekDayCardToday,
                  isSelected && styles.weekDayCardSelected,
                ]}
                onPress={() => {
                  setSelectedDate(item.dateKey);
                  setShowDayDetail(true);
                }}
              >
                <View style={styles.weekDayHeader}>
                  <View style={styles.weekDayNameContainer}>
                    <Text style={[
                      styles.weekDayName,
                      isToday && styles.weekDayNameToday,
                    ]}>
                      {item.date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </Text>
                    <Text style={[
                      styles.weekDayDate,
                      isToday && styles.weekDayDateToday,
                    ]}>
                      {item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {isToday && ' • Today'}
                    </Text>
                  </View>
                  <View style={[
                    styles.weekDayRing,
                    { borderColor: color },
                  ]}>
                    <Text style={[styles.weekDayRingPct, { color }]}>{Math.round(completion * 100)}%</Text>
                  </View>
                </View>
                
                {stats && (
                  <View style={styles.weekDayStats}>
                    <View style={styles.weekStat}>
                      <Text style={styles.weekStatValue}>{Math.round(stats.totalCal)}</Text>
                      <Text style={styles.weekStatLabel}>kcal</Text>
                    </View>
                    <View style={styles.weekStat}>
                      <Text style={styles.weekStatValue}>{Math.round(stats.totalProtein)}g</Text>
                      <Text style={styles.weekStatLabel}>Protein</Text>
                    </View>
                    <View style={styles.weekStat}>
                      <Text style={styles.weekStatValue}>{stats.workoutCount}</Text>
                      <Text style={styles.weekStatLabel}>Workouts</Text>
                    </View>
                    <View style={styles.weekStat}>
                      <Text style={styles.weekStatValue}>{(stats.steps || 0).toLocaleString()}</Text>
                      <Text style={styles.weekStatLabel}>Steps</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Weekly Summary */}
        <View style={styles.weekSummaryCard}>
          <Text style={styles.weekSummaryTitle}>Weekly Summary</Text>
          <View style={styles.weekSummaryGrid}>
            <View style={styles.weekSummaryStat}>
              <Text style={styles.weekSummaryValue}>
                {weekStats.reduce((s, d) => s + (d.log?.food?.reduce((a, f) => a + (f.calories || 0), 0) || 0), 0) / 7 | 0}
              </Text>
              <Text style={styles.weekSummaryLabel}>Avg Calories</Text>
            </View>
            <View style={styles.weekSummaryStat}>
              <Text style={styles.weekSummaryValue}>
                {weekStats.reduce((s, d) => s + (d.log?.food?.reduce((a, f) => a + (f.protein || 0), 0) || 0), 0) / 7 | 0}
              </Text>
              <Text style={styles.weekSummaryLabel}>Avg Protein</Text>
            </View>
            <View style={styles.weekSummaryStat}>
              <Text style={styles.weekSummaryValue}>
                {weekStats.filter(d => d.log?.workouts?.some(w => w.completed)).length}
              </Text>
              <Text style={styles.weekSummaryLabel}>Workout Days</Text>
            </View>
            <View style={styles.weekSummaryStat}>
              <Text style={styles.weekSummaryValue}>
                {(weekStats.reduce((s, d) => s + (d.log?.steps || 0), 0) / 7) | 0}
              </Text>
              <Text style={styles.weekSummaryLabel}>Avg Steps</Text>
            </View>
          </View>
        </View>

        {/* Export Button */}
        <TouchableOpacity style={styles.exportBtn} onPress={generateExport}>
          <View style={styles.exportBtnContent}>
            <ArrowRight size={20} color="#181008" />
            <Text style={styles.exportBtnText}>Export Data (CSV)</Text>
          </View>
        </TouchableOpacity>

        <TabBar active={screen} onChange={setScreen} />
      </View>
    );

    // Render day detail view
    const renderDayDetail = () => {
      if (!showDayDetail) return null;
      const log = allLogs[selectedDate];
      const stats = getDayStats(log);
      const completion = getDayCompletion(selectedDate);
      const color = getCompletionColor(completion);

      return (
        <Modal visible={true} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.dayDetailModal}>
              <View style={styles.dayDetailHeader}>
                <View style={styles.dayDetailDateRow}>
                  <Text style={styles.dayDetailDate}>{formatDateKey(selectedDate)}</Text>
                  <View style={[
                    styles.dayDetailRing,
                    { borderColor: color },
                  ]}>
                    <Text style={[styles.dayDetailRingPct, { color }]}>{Math.round(completion * 100)}%</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowDayDetail(false)}>
                  <X size={24} color="#8B95A1" />
                </TouchableOpacity>
              </View>

              {log ? (
                <ScrollView style={styles.dayDetailScroll} contentContainerStyle={styles.dayDetailScrollContent}>
                  {/* Food Section */}
                  {log.food?.length > 0 && (
                    <View style={styles.dayDetailSection}>
                      <View style={styles.dayDetailSectionHeader}>
                        <Text style={styles.dayDetailSectionTitle}>Food ({log.food.length} items)</Text>
                        <Text style={styles.dayDetailSectionTotals}>
                          {Math.round(stats.totalCal)} kcal • P:{Math.round(stats.totalProtein)}g C:{Math.round(stats.totalCarbs)}g F:{Math.round(stats.totalFat)}g
                        </Text>
                      </View>
                      {log.food.map((item, i) => (
                        <View key={i} style={styles.dayDetailFoodItem}>
                          <View style={styles.dayDetailFoodMain}>
                            <Text style={styles.dayDetailFoodName}>{item.name}</Text>
                            <Text style={styles.dayDetailFoodServing}>{item.serving} {item.servingUnit}</Text>
                          </View>
                          <View style={styles.dayDetailFoodMacros}>
                            <Text style={styles.dayDetailMacro}>P:{item.protein}g</Text>
                            <Text style={styles.dayDetailMacro}>C:{item.carbs}g</Text>
                            <Text style={styles.dayDetailMacro}>F:{item.fat}g</Text>
                            <Text style={styles.dayDetailCalories}>{item.calories} kcal</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Water */}
                  {(log.waterMl || 0) > 0 && (
                    <View style={styles.dayDetailSection}>
                      <Text style={styles.dayDetailSectionTitle}>Water</Text>
                      <View style={styles.dayDetailWaterRow}>
                        <Text style={styles.dayDetailWaterValue}>{log.waterMl} ml</Text>
                        <View style={styles.dayDetailWaterBar}>
                          <View style={[styles.dayDetailWaterFill, { width: `${Math.min((log.waterMl / waterGoal) * 100, 100)}%` }]} />
                        </View>
                        <Text style={styles.dayDetailWaterGoal}>/ {waterGoal} ml</Text>
                      </View>
                    </View>
                  )}

                  {/* Workouts */}
                  {log.workouts?.length > 0 && (
                    <View style={styles.dayDetailSection}>
                      <Text style={styles.dayDetailSectionTitle}>Workouts ({log.workouts.filter(w => w.completed).length} completed)</Text>
                      {log.workouts.map((w, i) => (
                        <View key={i} style={styles.dayDetailWorkoutItem}>
                          <View style={styles.dayDetailWorkoutHeader}>
                            <Text style={styles.dayDetailWorkoutName}>{w.name}</Text>
                            {w.completed && <Text style={styles.dayDetailWorkoutCompleted}>✓ Completed</Text>}
                          </View>
                          <Text style={styles.dayDetailWorkoutMeta}>
                            {w.duration ? Math.round(w.duration / 60000) + 'min' : ''} • {w.caloriesBurned || 0} kcal • {w.exercises?.length || 0} exercises
                          </Text>
                          <View style={styles.dayDetailWorkoutExercises}>
                            {w.exercises?.map((ex, ei) => (
                              <Text key={ei} style={styles.dayDetailExerciseLine}>
                                {ex.name}: {ex.sets?.filter(s => s.completed).length || 0}/{ex.sets?.length || 0} sets
                              </Text>
                            ))}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Steps */}
                  {(log.steps || 0) > 0 && (
                    <View style={styles.dayDetailSection}>
                      <Text style={styles.dayDetailSectionTitle}>Activity</Text>
                      <View style={styles.dayDetailActivityRow}>
                        <View style={styles.dayDetailActivityItem}>
                          <Activity size={20} color="#4FB0A5" />
                          <Text style={styles.dayDetailActivityLabel}>Steps</Text>
                          <Text style={styles.dayDetailActivityValue}>{log.steps.toLocaleString()} / {stepsGoal.toLocaleString()}</Text>
                        </View>
                        {log.sleepHours && (
                          <View style={styles.dayDetailActivityItem}>
                            <Moon size={20} color="#7C5CD8" />
                            <Text style={styles.dayDetailActivityLabel}>Sleep</Text>
                            <Text style={styles.dayDetailActivityValue}>{log.sleepHours}h</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Body Metrics */}
                  {(log.weight || log.bodyFat) && (
                    <View style={styles.dayDetailSection}>
                      <Text style={styles.dayDetailSectionTitle}>Body Metrics</Text>
                      <View style={styles.dayDetailMetricsRow}>
                        {log.weight && (
                          <View style={styles.dayDetailMetricItem}>
                            <Text style={styles.dayDetailMetricLabel}>Weight</Text>
                            <Text style={styles.dayDetailMetricValue}>{log.weight} {profile.units === 'imperial' ? 'lbs' : 'kg'}</Text>
                          </View>
                        )}
                        {log.bodyFat && (
                          <View style={styles.dayDetailMetricItem}>
                            <Text style={styles.dayDetailMetricLabel}>Body Fat</Text>
                            <Text style={styles.dayDetailMetricValue}>{log.bodyFat}%</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Notes */}
                  {log.notes && (
                    <View style={styles.dayDetailSection}>
                      <Text style={styles.dayDetailSectionTitle}>Notes</Text>
                      <Text style={styles.dayDetailNotes}>{log.notes}</Text>
                    </View>
                  )}
                </ScrollView>
              ) : (
                <View style={styles.dayDetailEmpty}>
                  <Text style={styles.dayDetailEmptyText}>No data for this day</Text>
                  <Text style={styles.dayDetailEmptySub}>Start logging to build your history</Text>
                </View>
              )}

              <TouchableOpacity style={styles.dayDetailCloseBtn} onPress={() => setShowDayDetail(false)}>
                <Text style={styles.dayDetailCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      );
    };

    // Export Modal
    const renderExportModal = () => {
      if (!showExportModal) return null;
      return (
        <Modal visible={true} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.exportModal}>
              <View style={styles.exportModalHeader}>
                <Text style={styles.exportModalTitle}>Export Data</Text>
                <TouchableOpacity onPress={() => setShowExportModal(false)}>
                  <X size={24} color="#8B95A1" />
                </TouchableOpacity>
              </View>
              <Text style={styles.exportModalDesc}>
                Your data will be exported as CSV with all daily logs including food, workouts, steps, water, and body metrics.
              </Text>
              <View style={styles.exportModalPreview}>
                <Text style={styles.exportModalPreviewText}>
                  {exportData?.split('\n').slice(0, 5).join('\n')}\n...
                </Text>
              </View>
              <View style={styles.exportModalActions}>
                <TouchableOpacity style={styles.exportModalBtn} onPress={copyExport}>
                  <Text style={styles.exportModalBtnText}>Copy to Clipboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.exportModalBtn, styles.exportModalBtnPrimary]} onPress={shareExport}>
                  <Text style={styles.exportModalBtnTextPrimary}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      );
    };
  
      // Render Metrics View (Body Metrics Tracking)
      const renderMetricsView = () => (
        <View style={{ flex: 1, backgroundColor: "#12161B" }}>
          <ScrollView style={styles.container} contentContainerStyle={styles.metricsContent}>
            {/* Header */}
            <View style={styles.metricsHeader}>
              <Text style={styles.metricsTitle}>Body Metrics</Text>
              <Text style={styles.metricsSubtitle}>Track weight, body fat, measurements & progress photos</Text>
            </View>
  
            {/* Current Stats Cards */}
            <View style={styles.metricsStatsGrid}>
              <View style={styles.metricStatCard}>
                <View style={styles.metricStatIcon}><Scale size={24} color="#E8A23D" /></View>
                <Text style={styles.metricStatValue}>{latestWeight ? latestWeight.toFixed(1) : "—"}</Text>
                <Text style={styles.metricStatLabel}>Current Weight</Text>
                <Text style={styles.metricStatUnit}>{profile.units === "imperial" ? "lbs" : "kg"}</Text>
              </View>
              <View style={styles.metricStatCard}>
                <View style={styles.metricStatIcon}><Target size={24} color="#4FB0A5" /></View>
                <Text style={styles.metricStatValue}>{latestBodyFat ? latestBodyFat.toFixed(1) : "—"}</Text>
                <Text style={styles.metricStatLabel}>Body Fat %</Text>
                <Text style={styles.metricStatUnit}>,</Text>
              </View>
              <View style={styles.metricStatCard}>
                <View style={styles.metricStatIcon}>
                  {weightTrend.direction === "down" ? <TrendingDown size={24} color="#4FB0A5" /> :
                   weightTrend.direction === "up" ? <TrendingUp size={24} color="#E2665A" /> : <Minus size={24} color="#8B95A1" />}
                </View>
                <Text style={styles.metricStatValue}>
                  {weightTrend.direction === "down" ? "−" : weightTrend.direction === "up" ? "+" : ""}{Math.abs(weightTrend.weeklyChange).toFixed(2)}
                </Text>
                <Text style={styles.metricStatLabel}>Weekly Trend</Text>
                <Text style={styles.metricStatUnit}>{profile.units === "imperial" ? "lbs" : "kg"}/wk</Text>
              </View>
              <View style={styles.metricStatCard}>
                <View style={styles.metricStatIcon}><Activity size={24} color="#7C5CD8" /></View>
                <Text style={styles.metricStatValue}>{weightMA7 ? weightMA7.toFixed(1) : "—"}</Text>
                <Text style={styles.metricStatLabel}>7-Day Avg</Text>
                <Text style={styles.metricStatUnit}>{profile.units === "imperial" ? "lbs" : "kg"}</Text>
              </View>
            </View>
  
            {/* Goal Weight Tracker */}
            <View style={styles.metricsSection}>
              <Text style={styles.metricsSectionTitle}>Goal Weight Tracker</Text>
              <View style={styles.goalTrackerCard}>
                <View style={styles.goalInputRow}>
                  <TextInput
                    style={styles.goalInput}
                    placeholder="Goal Weight"
                    placeholderTextColor="#8B95A1"
                    keyboardType="numeric"
                    value={goalWeight}
                    onChangeText={setGoalWeight}
                  />
                  <Text style={styles.goalInputUnit}>{profile.units === "imperial" ? "lbs" : "kg"}</Text>
                </View>
                {goalProjection && (
                  <View style={styles.goalProjection}>
                    <Text style={styles.goalProjectionText}>
                      Projected: <Text style={styles.goalProjectionHighlight}>{goalProjection.days} days</Text> ({goalProjection.weeks} weeks)
                    </Text>
                    <Text style={styles.goalProjectionDate}>Target date: {new Date(goalProjection.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                    <View style={styles.goalProgressBar}>
                      <View style={[styles.goalProgressFill, { width: `${Math.min(Math.max((latestWeight - parseFloat(goalWeight)) / (latestWeight - (result?.calorieGoal ? 0 : 0)) * 100, 0), 100)}%` }]} />
                    </View>
                  </View>
                )}
                {!goalProjection && goalWeight && (
                  <Text style={styles.goalProjectionText}>Enter current weight trend data to see projection</Text>
                )}
              </View>
            </View>
  
            {/* Quick Add Buttons */}
            <View style={styles.metricsSection}>
              <Text style={styles.metricsSectionTitle}>Log Today</Text>
              <View style={styles.quickAddGrid}>
                <TouchableOpacity style={styles.quickAddBtn} onPress={() => setShowAddWeight(true)}>
                  <Scale size={20} color="#E8A23D" />
                  <Text style={styles.quickAddBtnText}>Weight</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAddBtn} onPress={() => setShowAddBodyFat(true)}>
                  <Target size={20} color="#4FB0A5" />
                  <Text style={styles.quickAddBtnText}>Body Fat %</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAddBtn} onPress={() => setShowAddMeasurements(true)}>
                  <Activity size={20} color="#7C5CD8" />
                  <Text style={styles.quickAddBtnText}>Measurements</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAddBtn} onPress={() => setShowAddPhoto(true)}>
                  <Camera size={20} color="#E2665A" />
                  <Text style={styles.quickAddBtnText}>Progress Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
  
            {/* Weight Trend Chart */}
            {bodyMetrics.weight.length > 0 && (
              <View style={styles.metricsSection}>
                <Text style={styles.metricsSectionTitle}>Weight Trend</Text>
                <View style={styles.chartCard}>
                  <View style={styles.chartLegend}>
                    <View style={styles.legendRow}>
                      <View style={[styles.legendDot, { backgroundColor: "#E8A23D" }]} />
                      <Text style={styles.legendText}>Actual</Text>
                    </View>
                    {weightMA7 && (
                      <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: "#4FB0A5" }]} />
                        <Text style={styles.legendText}>7-Day MA</Text>
                      </View>
                    )}
                    {goalWeight && (
                      <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: "#7C5CD8", borderWidth: 2, borderStyle: "dashed" }]} />
                        <Text style={styles.legendText}>Goal</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.chartContainer}>
                    {renderWeightChart()}
                  </View>
                </View>
              </View>
            )}
  
            {/* Body Fat Trend */}
            {bodyMetrics.bodyFat.length > 0 && (
              <View style={styles.metricsSection}>
                <Text style={styles.metricsSectionTitle}>Body Fat % Trend</Text>
                <View style={styles.chartCard}>
                  <View style={styles.chartContainer}>
                    {renderBodyFatChart()}
                  </View>
                </View>
              </View>
            )}
  
            {/* Measurements History */}
            {bodyMetrics.measurements.length > 0 && (
              <View style={styles.metricsSection}>
                <Text style={styles.metricsSectionTitle}>Measurements</Text>
                <View style={styles.measurementsCard}>
                  {bodyMetrics.measurements.slice().reverse().map((m, i) => (
                    <View key={i} style={styles.measurementRow}>
                      <Text style={styles.measurementDate}>{formatMetricDate(m.date)}</Text>
                      <View style={styles.measurementValues}>
                        {m.waist && <Text style={styles.measurementVal}>Waist: {m.waist}{profile.units === "imperial" ? '"' : 'cm'}</Text>}
                        {m.chest && <Text style={styles.measurementVal}>Chest: {m.chest}{profile.units === "imperial" ? '"' : 'cm'}</Text>}
                        {m.hips && <Text style={styles.measurementVal}>Hips: {m.hips}{profile.units === "imperial" ? '"' : 'cm'}</Text>}
                        {m.neck && <Text style={styles.measurementVal}>Neck: {m.neck}{profile.units === "imperial" ? '"' : 'cm'}</Text>}
                        {m.leftArm && <Text style={styles.measurementVal}>L-Arm: {m.leftArm}{profile.units === "imperial" ? '"' : 'cm'}</Text>}
                        {m.rightArm && <Text style={styles.measurementVal}>R-Arm: {m.rightArm}{profile.units === "imperial" ? '"' : 'cm'}</Text>}
                        {m.leftThigh && <Text style={styles.measurementVal}>L-Thigh: {m.leftThigh}{profile.units === "imperial" ? '"' : 'cm'}</Text>}
                        {m.rightThigh && <Text style={styles.measurementVal}>R-Thigh: {m.rightThigh}{profile.units === "imperial" ? '"' : 'cm'}</Text>}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
  
            {/* Progress Photos */}
            {bodyMetrics.photos.length > 0 && (
              <View style={styles.metricsSection}>
                <Text style={styles.metricsSectionTitle}>Progress Photos</Text>
                <View style={styles.photosGrid}>
                  {bodyMetrics.photos.slice().reverse().map((p, i) => (
                    <View key={i} style={styles.photoCard}>
                      <Image source={{ uri: p.uri }} style={styles.photoImage} />
                      <View style={styles.photoOverlay}>
                        <Text style={styles.photoDate}>{formatMetricDate(p.date)}</Text>
                        {p.note && <Text style={styles.photoNote}>{p.note}</Text>}
                      </View>
                    </View>
                  ))}
                </View>
                {/* Photo Comparison */}
                {bodyMetrics.photos.length >= 2 && (
                  <View style={styles.photoCompare}>
                    <Text style={styles.photoCompareTitle}>Side-by-Side Comparison</Text>
                    <View style={styles.photoCompareRow}>
                      <View style={styles.photoCompareCol}>
                        <Text style={styles.photoCompareLabel}>Earliest</Text>
                        <Image source={{ uri: bodyMetrics.photos[0].uri }} style={styles.photoCompareImage} />
                        <Text style={styles.photoCompareDate}>{formatMetricDate(bodyMetrics.photos[0].date)}</Text>
                      </View>
                      <View style={styles.photoCompareCol}>
                        <Text style={styles.photoCompareLabel}>Latest</Text>
                        <Image source={{ uri: bodyMetrics.photos[bodyMetrics.photos.length - 1].uri }} style={styles.photoCompareImage} />
                        <Text style={styles.photoCompareDate}>{formatMetricDate(bodyMetrics.photos[bodyMetrics.photos.length - 1].date)}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
  
            {/* Weight History List */}
            {bodyMetrics.weight.length > 0 && (
              <View style={styles.metricsSection}>
                <Text style={styles.metricsSectionTitle}>Weight History</Text>
                <View style={styles.historyList}>
                  {bodyMetrics.weight.slice().reverse().map((w, i) => (
                    <View key={i} style={styles.historyItem}>
                      <View style={styles.historyItemLeft}>
                        <Text style={styles.historyItemDate}>{formatMetricDate(w.date)}</Text>
                        <Text style={styles.historyItemMeta}>Entry #{bodyMetrics.weight.length - i}</Text>
                      </View>
                      <View style={styles.historyItemRight}>
                        <Text style={styles.historyItemWeight}>{w.value.toFixed(1)} {w.unit === "imperial" ? "lbs" : "kg"}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
  
            {/* Empty State */}
            {bodyMetrics.weight.length === 0 && bodyMetrics.bodyFat.length === 0 && bodyMetrics.measurements.length === 0 && bodyMetrics.photos.length === 0 && (
              <View style={styles.metricsEmpty}>
                <Scale size={64} color="#8B95A1" />
                <Text style={styles.metricsEmptyTitle}>No Body Metrics Yet</Text>
                <Text style={styles.metricsEmptySub}>Start tracking your weight, body fat, measurements, and progress photos</Text>
                <TouchableOpacity style={styles.metricsEmptyBtn} onPress={() => setShowAddWeight(true)}>
                  <Text style={styles.metricsEmptyBtnText}>Log First Weight</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
  
          {/* Add Weight Modal */}
          {showAddWeight && (
            <Modal visible={true} animationType="slide" transparent={true}>
              <View style={styles.modalOverlay}>
                <View style={styles.metricModal}>
                  <View style={styles.metricModalHeader}>
                    <Text style={styles.metricModalTitle}>Log Weight</Text>
                    <TouchableOpacity onPress={() => { setShowAddWeight(false); setNewWeight(""); }}>
                      <X size={24} color="#8B95A1" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.metricModalBody}>
                    <Text style={styles.metricModalLabel}>Current Weight</Text>
                    <TextInput
                      style={styles.metricModalInput}
                      placeholder={profile.units === "imperial" ? "e.g. 175.5" : "e.g. 79.5"}
                      placeholderTextColor="#8B95A1"
                      keyboardType="numeric"
                      value={newWeight}
                      onChangeText={setNewWeight}
                      autoFocus
                    />
                    <Text style={styles.metricModalUnit}>{profile.units === "imperial" ? "lbs" : "kg"}</Text>
                    <Text style={styles.metricModalHint}>Date: {formatDateKey(selectedDate)}</Text>
                  </View>
                  <TouchableOpacity style={styles.metricModalBtn} onPress={addWeightEntry}>
                    <Text style={styles.metricModalBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
  
          {/* Add Body Fat Modal */}
          {showAddBodyFat && (
            <Modal visible={true} animationType="slide" transparent={true}>
              <View style={styles.modalOverlay}>
                <View style={styles.metricModal}>
                  <View style={styles.metricModalHeader}>
                    <Text style={styles.metricModalTitle}>Log Body Fat %</Text>
                    <TouchableOpacity onPress={() => { setShowAddBodyFat(false); setNewBodyFat(""); }}>
                      <X size={24} color="#8B95A1" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.metricModalBody}>
                    <Text style={styles.metricModalLabel}>Body Fat Percentage</Text>
                    <TextInput
                      style={styles.metricModalInput}
                      placeholder="e.g. 18.5"
                      placeholderTextColor="#8B95A1"
                      keyboardType="numeric"
                      value={newBodyFat}
                      onChangeText={setNewBodyFat}
                      autoFocus
                    />
                    <Text style={styles.metricModalUnit}>%</Text>
                    <Text style={styles.metricModalHint}>Date: {formatDateKey(selectedDate)}</Text>
                  </View>
                  <TouchableOpacity style={styles.metricModalBtn} onPress={addBodyFatEntry}>
                    <Text style={styles.metricModalBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
  
          {/* Add Measurements Modal */}
          {showAddMeasurements && (
            <Modal visible={true} animationType="slide" transparent={true}>
              <View style={styles.modalOverlay}>
                <View style={styles.metricModal}>
                  <View style={styles.metricModalHeader}>
                    <Text style={styles.metricModalTitle}>Log Measurements</Text>
                    <TouchableOpacity onPress={() => { setShowAddMeasurements(false); setNewMeasurements({ waist: "", chest: "", leftArm: "", rightArm: "", leftThigh: "", rightThigh: "", neck: "", hips: "" }); }}>
                      <X size={24} color="#8B95A1" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.metricModalBody}>
                    <Text style={styles.metricModalLabel}>Enter measurements ({profile.units === "imperial" ? "inches" : "cm"})</Text>
                    <View style={styles.measurementInputGrid}>
                      <TextInput style={styles.measurementInput} placeholder="Waist" value={newMeasurements.waist} onChangeText={v => setNewMeasurements(prev => ({ ...prev, waist: v }))} keyboardType="numeric" />
                      <TextInput style={styles.measurementInput} placeholder="Chest" value={newMeasurements.chest} onChangeText={v => setNewMeasurements(prev => ({ ...prev, chest: v }))} keyboardType="numeric" />
                      <TextInput style={styles.measurementInput} placeholder="Hips" value={newMeasurements.hips} onChangeText={v => setNewMeasurements(prev => ({ ...prev, hips: v }))} keyboardType="numeric" />
                      <TextInput style={styles.measurementInput} placeholder="Neck" value={newMeasurements.neck} onChangeText={v => setNewMeasurements(prev => ({ ...prev, neck: v }))} keyboardType="numeric" />
                      <TextInput style={styles.measurementInput} placeholder="Left Arm" value={newMeasurements.leftArm} onChangeText={v => setNewMeasurements(prev => ({ ...prev, leftArm: v }))} keyboardType="numeric" />
                      <TextInput style={styles.measurementInput} placeholder="Right Arm" value={newMeasurements.rightArm} onChangeText={v => setNewMeasurements(prev => ({ ...prev, rightArm: v }))} keyboardType="numeric" />
                      <TextInput style={styles.measurementInput} placeholder="Left Thigh" value={newMeasurements.leftThigh} onChangeText={v => setNewMeasurements(prev => ({ ...prev, leftThigh: v }))} keyboardType="numeric" />
                      <TextInput style={styles.measurementInput} placeholder="Right Thigh" value={newMeasurements.rightThigh} onChangeText={v => setNewMeasurements(prev => ({ ...prev, rightThigh: v }))} keyboardType="numeric" />
                    </View>
                    <Text style={styles.metricModalHint}>Date: {formatDateKey(selectedDate)}</Text>
                  </ScrollView>
                  <TouchableOpacity style={styles.metricModalBtn} onPress={addMeasurementsEntry}>
                    <Text style={styles.metricModalBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
  
          {/* Add Photo Modal */}
          {showAddPhoto && (
            <Modal visible={true} animationType="slide" transparent={true}>
              <View style={styles.modalOverlay}>
                <View style={styles.metricModal}>
                  <View style={styles.metricModalHeader}>
                    <Text style={styles.metricModalTitle}>Add Progress Photo</Text>
                    <TouchableOpacity onPress={() => { setShowAddPhoto(false); setNewPhoto(null); }}>
                      <X size={24} color="#8B95A1" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.metricModalBody}>
                    <Text style={styles.metricModalLabel}>Photo</Text>
                    {newPhoto ? (
                      <View style={styles.photoPreview}>
                        <Image source={{ uri: newPhoto }} style={styles.photoPreviewImage} />
                        <TouchableOpacity style={styles.photoRemoveBtn} onPress={() => setNewPhoto(null)}>
                          <X size={20} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.photoAddBtn} onPress={pickPhoto}>
                        <Camera size={32} color="#8B95A1" />
                        <Text style={styles.photoAddText}>Tap to select photo</Text>
                      </TouchableOpacity>
                    )}
                    <TextInput
                      style={styles.metricModalInput}
                      placeholder="Optional note (e.g. 'Front pose', '2 weeks out')"
                      placeholderTextColor="#8B95A1"
                      value={photoNote}
                      onChangeText={setPhotoNote}
                    />
                    <Text style={styles.metricModalHint}>Date: {formatDateKey(photoDate)}</Text>
                  </View>
                  <TouchableOpacity style={[styles.metricModalBtn, !newPhoto && styles.metricModalBtnDisabled]} onPress={newPhoto ? savePhotoEntry : pickPhoto}>
                    <Text style={styles.metricModalBtnText}>{newPhoto ? "Save" : "Select Photo"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
          <TabBar active={screen} onChange={setScreen} />
        </View>
      );
  
      // Helper: Render weight chart (simple SVG-like using Views)
      const renderWeightChart = () => {
        if (bodyMetrics.weight.length < 2) return null;
        const data = bodyMetrics.weight;
        const values = data.map(d => d.value);
        const minVal = Math.min(...values) - (profile.units === "imperial" ? 2 : 1);
        const maxVal = Math.max(...values) + (profile.units === "imperial" ? 2 : 1);
        const range = maxVal - minVal;
        const width = 320;
        const height = 160;
        const stepX = width / (data.length - 1);
        
        const getY = (val) => height - ((val - minVal) / range) * height;
        
        // Moving average line
        const maData = data.slice(-7).length >= 7 ? data.slice(-7) : null;
        
        return (
          <View style={styles.chartSvg}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
              <View key={i} style={[styles.chartGridLine, { top: height * frac }]} />
            ))}
            {/* Goal line */}
            {goalWeight && (
              <View style={[styles.chartGoalLine, { top: getY(parseFloat(goalWeight)) }]} />
            )}
            {/* Actual weight line */}
            <View style={styles.chartLineContainer}>
              {data.map((d, i) => (
                <View
                  key={i}
                  style={[
                    styles.chartPoint,
                    { left: i * stepX - 4, top: getY(d.value) - 4 },
                  ]}
                />
              ))}
              {/* Connecting lines would need SVG - using points for now */}
            </View>
            {/* MA7 line */}
            {maData && (
              <View style={styles.chartLineContainerMA}>
                {maData.map((d, i) => (
                  <View
                    key={i}
                    style={[
                      styles.chartPointMA,
                      { left: (data.length - maData.length + i) * stepX - 3, top: getY(d.value) - 3 },
                    ]}
                  />
                ))}
              </View>
            )}
            {/* X-axis labels */}
            <View style={styles.chartXAxis}>
              {data.map((d, i) => i % Math.ceil(data.length / 5) === 0 && (
                <Text key={i} style={[styles.chartXLabel, { left: i * stepX - 15 }]}>{formatMetricDate(d.date).split(' ')[0]}</Text>
              ))}
            </View>
          </View>
        );
      };
  
      const renderBodyFatChart = () => {
        if (bodyMetrics.bodyFat.length < 2) return null;
        const data = bodyMetrics.bodyFat;
        const values = data.map(d => d.value);
        const minVal = Math.max(0, Math.min(...values) - 2);
        const maxVal = Math.min(50, Math.max(...values) + 2);
        const range = maxVal - minVal;
        const width = 320;
        const height = 120;
        const stepX = width / (data.length - 1);
        
        const getY = (val) => height - ((val - minVal) / range) * height;
        
        return (
          <View style={{ ...styles.chartSvg, height }}>
            {[0, 0.5, 1].map((frac, i) => (
              <View key={i} style={[styles.chartGridLine, { top: height * frac }]} />
            ))}
            <View style={styles.chartLineContainer}>
              {data.map((d, i) => (
                <View
                  key={i}
                  style={[
                    styles.chartPointBF,
                    { left: i * stepX - 4, top: getY(d.value) - 4 },
                  ]}
                />
              ))}
            </View>
            <View style={styles.chartXAxis}>
              {data.map((d, i) => i % Math.ceil(data.length / 5) === 0 && (
                <Text key={i} style={[styles.chartXLabel, { left: i * stepX - 15 }]}>{formatMetricDate(d.date).split(' ')[0]}</Text>
              ))}
            </View>
          </View>
        );
      };
  
      // Photo picker
      const [photoNote, setPhotoNote] = useState("");
      const pickPhoto = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          alert("Permission needed to access photos");
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
        if (!result.canceled) {
          setNewPhoto(result.assets[0].uri);
        }
      };
  
      const savePhotoEntry = async () => {
        if (!newPhoto) return;
        await saveBodyMetric(photoDate, "photoUri", newPhoto, { photoNote });
        setNewPhoto(null);
        setPhotoNote("");
        setShowAddPhoto(false);
      };
  
      // Render based on view
      if (calendarView === "month") return renderMonthView();
      if (calendarView === "week") return renderWeekView();
      if (calendarView === "metrics") return renderMetricsView();
      return renderMonthView();
    }

  // ---------- HOME SCREEN ----------
  // Calculate totals from foodByMeal
  const allFood = MEALS.flatMap(m => foodByMeal[m.key] || []);
  const target = result ? result.calorieGoal : 0;
  const consumed = allFood.reduce((sum, item) => sum + (item.calories || 0), 0);
  const proteinConsumed = allFood.reduce((sum, item) => sum + (item.protein || 0), 0);
  const carbsConsumed = allFood.reduce((sum, item) => sum + (item.carbs || 0), 0);
  const fatConsumed = allFood.reduce((sum, item) => sum + (item.fat || 0), 0);
  const burned = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const netVsTDEE = result ? result.tdee + burned - consumed : 0;

  // ---------- PHASE 4: RECOMMENDATION ENGINE ----------
  // Weekly workout schedule based on trainingDays
  const getWorkoutSchedule = () => {
    if (!result || !profile.trainingDays) return [];
    const days = parseInt(profile.trainingDays) || 3;
    const sessionLength = parseInt(profile.sessionLength) || 45;
    
    const schedules = {
      1: [{ day: "Mon", workout: "Full Body", duration: sessionLength, focus: "Strength + Cardio" }],
      2: [
        { day: "Mon", workout: "Upper Body", duration: sessionLength, focus: "Push/Pull" },
        { day: "Thu", workout: "Lower Body", duration: sessionLength, focus: "Squat/Hinge" },
      ],
      3: [
        { day: "Mon", workout: "Push", duration: sessionLength, focus: "Chest/Shoulders/Triceps" },
        { day: "Wed", workout: "Pull", duration: sessionLength, focus: "Back/Biceps/Rear Delts" },
        { day: "Fri", workout: "Legs", duration: sessionLength, focus: "Quads/Hamstrings/Glutes" },
      ],
      4: [
        { day: "Mon", workout: "Upper", duration: sessionLength, focus: "Strength" },
        { day: "Tue", workout: "Lower", duration: sessionLength, focus: "Strength" },
        { day: "Thu", workout: "Push", duration: sessionLength, focus: "Hypertrophy" },
        { day: "Fri", workout: "Pull", duration: sessionLength, focus: "Hypertrophy" },
      ],
      5: [
        { day: "Mon", workout: "Push", duration: sessionLength, focus: "Heavy" },
        { day: "Tue", workout: "Pull", duration: sessionLength, focus: "Heavy" },
        { day: "Wed", workout: "Legs", duration: sessionLength, focus: "Heavy" },
        { day: "Thu", workout: "Upper", duration: sessionLength, focus: "Volume" },
        { day: "Fri", workout: "Lower", duration: sessionLength, focus: "Volume" },
      ],
      6: [
        { day: "Mon", workout: "Push", duration: sessionLength, focus: "Heavy" },
        { day: "Tue", workout: "Pull", duration: sessionLength, focus: "Heavy" },
        { day: "Wed", workout: "Legs", duration: sessionLength, focus: "Heavy" },
        { day: "Thu", workout: "Push", duration: sessionLength, focus: "Volume" },
        { day: "Fri", workout: "Pull", duration: sessionLength, focus: "Volume" },
        { day: "Sat", workout: "Legs", duration: sessionLength, focus: "Volume" },
      ],
      7: [
        { day: "Mon", workout: "Push", duration: sessionLength, focus: "Heavy" },
        { day: "Tue", workout: "Pull", duration: sessionLength, focus: "Heavy" },
        { day: "Wed", workout: "Legs", duration: sessionLength, focus: "Heavy" },
        { day: "Thu", workout: "Active Recovery", duration: 30, focus: "Mobility/Cardio" },
        { day: "Fri", workout: "Upper", duration: sessionLength, focus: "Volume" },
        { day: "Sat", workout: "Lower", duration: sessionLength, focus: "Volume" },
        { day: "Sun", workout: "Full Body", duration: sessionLength, focus: "Pump/Finisher" },
      ],
    };
    return schedules[days] || schedules[3];
  };

  // Dynamic step target based on goal and activity
  const getStepTarget = () => {
    if (!result) return 10000;
    const baseSteps = { lose: 10000, maintain: 8000, gain: 7000 };
    const activityBonus = { sedentary: 0, light: 1000, moderate: 2000, active: 3000, very_active: 4000 };
    return (baseSteps[result.paceDeficit > 0 ? "lose" : result.paceDeficit < 0 ? "gain" : "maintain"] || 10000)
      + (activityBonus[profile.activityLevel] || 2000);
  };

  // Weekly projections
  const weeklyDeficit = netVsTDEE * 7;
  const weeklyWeightChange = weeklyDeficit / 7700; // kg (7700 kcal ≈ 1kg fat)
  const projectedWeight = profile.weightKg ? parseFloat(profile.weightKg) + weeklyWeightChange : null;
  const daysToGoal = result && result.paceDeficit !== 0 && profile.weightKg
    ? Math.abs((parseFloat(profile.weightKg) - (result.goal === "lose" ? parseFloat(profile.weightKg) - 5 : parseFloat(profile.weightKg) + 5)) / (weeklyWeightChange / 7))
    : null;

  // Meal timing suggestions
  const getMealTiming = () => {
    if (!result) return [];
    const suggestions = [];
    const hasWorkoutToday = workouts.some(w => !w.completed || (w.startTime && Date.now() - w.startTime < 86400000));
    
    if (hasWorkoutToday) {
      suggestions.push({
        title: "Pre-Workout",
        timing: "60-90 min before",
        macros: "30-40g carbs, 20g protein, low fat",
        example: "Banana + whey protein / Oats + egg whites",
        color: "#E8A23D",
      });
      suggestions.push({
        title: "Post-Workout",
        timing: "Within 60 min after",
        macros: "30-50g carbs, 30-40g protein, moderate fat",
        example: "Chicken + rice / Protein shake + fruit",
        color: "#4FB0A5",
      });
    }
    
    suggestions.push({
      title: "Daily Distribution",
      timing: `${profile.trainingDays || 3} meals + ${(profile.trainingDays || 3) > 4 ? "2" : "1"} snacks`,
      macros: `${Math.round((result.proteinGoal || 0) / ((profile.trainingDays || 3) + 1))}g protein per meal`,
      example: "Evenly spaced every 3-4 hours",
      color: "#7C5CD8",
    });
    
    return suggestions;
  };

  // Weekly summary stats
  const weeklyStats = {
    avgCalories: consumed > 0 ? consumed : (result?.calorieGoal || 0),
    avgProtein: proteinConsumed > 0 ? proteinConsumed : (result?.proteinGoal || 0),
    workoutsThisWeek: 1, // Would calculate from history
    avgSteps: steps || 0,
    waterAvg: waterMl || 0,
  };

  // ---------- PHASE 7: WEEKLY SUMMARY REPORT ----------
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [weeklySummaryData, setWeeklySummaryData] = useState(null);

  // Generate comprehensive weekly summary
  const generateWeeklySummary = async () => {
    const allLogs = await storage.loadAllDailyLogs();
    const today = new Date();
    const weekLogs = [];
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = storage.getDateKey(d);
      weekLogs.push({ date: key, log: allLogs[key] });
    }

    // Calculate daily stats
    const dailyStats = weekLogs.map(({ date, log }) => {
      const food = log?.food || [];
      const workouts = log?.workouts || [];
      const totalCal = food.reduce((s, f) => s + (f.calories || 0), 0);
      const totalProtein = food.reduce((s, f) => s + (f.protein || 0), 0);
      const totalCarbs = food.reduce((s, f) => s + (f.carbs || 0), 0);
      const totalFat = food.reduce((s, f) => s + (f.fat || 0), 0);
      const completedWorkouts = workouts.filter(w => w.completed).length;
      const workoutCal = workouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0);
      return {
        date,
        calories: totalCal,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        water: log?.waterMl || 0,
        steps: log?.steps || 0,
        workouts: completedWorkouts,
        workoutCal,
        weight: log?.weight,
        bodyFat: log?.bodyFat,
        hasData: log !== undefined,
      };
    });

    // Macro adherence (days within ±10% of targets)
    const calorieGoal = result?.calorieGoal || 0;
    const proteinGoal = result?.proteinGoal || 0;
    const carbGoal = result?.carbGoal || 0;
    const fatGoal = result?.fatGoal || 0;
    
    let calorieAdherentDays = 0;
    let proteinAdherentDays = 0;
    let carbAdherentDays = 0;
    let fatAdherentDays = 0;
    let daysWithFood = 0;
    
    dailyStats.forEach(d => {
      if (d.calories > 0) {
        daysWithFood++;
        if (Math.abs(d.calories - calorieGoal) / calorieGoal <= 0.1) calorieAdherentDays++;
        if (Math.abs(d.protein - proteinGoal) / proteinGoal <= 0.1) proteinAdherentDays++;
        if (Math.abs(d.carbs - carbGoal) / carbGoal <= 0.1) carbAdherentDays++;
        if (Math.abs(d.fat - fatGoal) / fatGoal <= 0.1) fatAdherentDays++;
      }
    });
    
    const macroAdherence = daysWithFood > 0
      ? Math.round(((calorieAdherentDays + proteinAdherentDays + carbAdherentDays + fatAdherentDays) / (daysWithFood * 4)) * 100)
      : 0;

    // Workout consistency
    const plannedWorkouts = profile.trainingDays || 3;
    const actualWorkouts = dailyStats.reduce((s, d) => s + d.workouts, 0);
    const workoutConsistency = plannedWorkouts > 0 ? Math.min(Math.round((actualWorkouts / plannedWorkouts) * 100), 100) : 0;

    // Step adherence
    const stepTarget = getStepTarget();
    const stepAdherentDays = dailyStats.filter(d => d.steps >= stepTarget).length;
    const stepAdherence = Math.round((stepAdherentDays / 7) * 100);

    // Water adherence
    const waterAdherentDays = dailyStats.filter(d => d.water >= waterGoal).length;
    const waterAdherence = Math.round((waterAdherentDays / 7) * 100);

    // Weight trend
    const weightEntries = dailyStats.filter(d => d.weight !== undefined && d.weight !== null);
    let weightChange = 0;
    let weightTrendDir = "stable";
    if (weightEntries.length >= 2) {
      weightChange = weightEntries[weightEntries.length - 1].weight - weightEntries[0].weight;
      weightTrendDir = weightChange < -0.2 ? "down" : weightChange > 0.2 ? "up" : "stable";
    }

    // Streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    dailyStats.forEach(d => {
      const isGoodDay = d.hasData && d.calories > 0;
      if (isGoodDay) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });
    // Current streak from most recent
    for (let i = dailyStats.length - 1; i >= 0; i--) {
      if (dailyStats[i].hasData && dailyStats[i].calories > 0) currentStreak++;
      else break;
    }

    // Best/worst days
    const daysWithData = dailyStats.filter(d => d.calories > 0);
    const bestDay = daysWithData.reduce((best, d) => {
      const score = (d.protein / proteinGoal) * 0.4 +
        (1 - Math.abs(d.calories - calorieGoal) / calorieGoal) * 0.3 +
        (d.steps / stepTarget) * 0.3;
      return score > best.score ? { ...d, score } : best;
    }, { score: -1 });
    
    const worstDay = daysWithData.reduce((worst, d) => {
      const score = (d.protein / proteinGoal) * 0.4 +
        (1 - Math.abs(d.calories - calorieGoal) / calorieGoal) * 0.3 +
        (d.steps / stepTarget) * 0.3;
      return score < worst.score ? { ...d, score } : worst;
    }, { score: 10 });

    // Weekly totals
    const weeklyTotals = {
      calories: dailyStats.reduce((s, d) => s + d.calories, 0),
      protein: dailyStats.reduce((s, d) => s + d.protein, 0),
      carbs: dailyStats.reduce((s, d) => s + d.carbs, 0),
      fat: dailyStats.reduce((s, d) => s + d.fat, 0),
      water: dailyStats.reduce((s, d) => s + d.water, 0),
      steps: dailyStats.reduce((s, d) => s + d.steps, 0),
      workoutCal: dailyStats.reduce((s, d) => s + d.workoutCal, 0),
      workouts: actualWorkouts,
    };

    // Averages
    const loggedDays = dailyStats.filter(d => d.hasData).length;
    const averages = loggedDays > 0 ? {
      calories: Math.round(weeklyTotals.calories / loggedDays),
      protein: Math.round(weeklyTotals.protein / loggedDays),
      carbs: Math.round(weeklyTotals.carbs / loggedDays),
      fat: Math.round(weeklyTotals.fat / loggedDays),
      water: Math.round(weeklyTotals.water / loggedDays),
      steps: Math.round(weeklyTotals.steps / loggedDays),
    } : {};

    // Achievements
    const achievements = [];
    if (macroAdherence >= 90) achievements.push({ id: "macro_master", title: "Macro Master", desc: "Hit macros within 10% all week", icon: Target, color: "#E8A23D" });
    if (workoutConsistency >= 100) achievements.push({ id: "workout_warrior", title: "Workout Warrior", desc: "Completed all planned workouts", icon: Dumbbell, color: "#4FB0A5" });
    if (stepAdherence >= 85) achievements.push({ id: "step_star", title: "Step Star", desc: "Hit step goal 6+ days", icon: Activity, color: "#7C5CD8" });
    if (waterAdherence >= 85) achievements.push({ id: "hydration_hero", title: "Hydration Hero", desc: "Hit water goal 6+ days", icon: Heart, color: "#4FB0A5" });
    if (currentStreak >= 7) achievements.push({ id: "week_streak", title: "Perfect Week", desc: "Logged food every day", icon: Flame, color: "#E8A23D" });
    if (weightTrendDir === "down" && result?.goal === "lose") achievements.push({ id: "fat_loss", title: "Fat Loss", desc: "Weight trending down", icon: TrendingDown, color: "#4FB0A5" });
    if (weightTrendDir === "up" && result?.goal === "gain") achievements.push({ id: "muscle_gain", title: "Muscle Gain", desc: "Weight trending up", icon: TrendingUp, color: "#E2665A" });
    if (loggedDays === 7) achievements.push({ id: "consistency_king", title: "Consistency King", desc: "Tracked every day this week", icon: Trophy, color: "#E8A23D" });

    // Grade calculation
    const scores = [macroAdherence, workoutConsistency, stepAdherence, waterAdherence].filter(s => s > 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    let grade = "F";
    if (avgScore >= 90) grade = "A+";
    else if (avgScore >= 80) grade = "A";
    else if (avgScore >= 70) grade = "B";
    else if (avgScore >= 60) grade = "C";
    else if (avgScore >= 50) grade = "D";

    const summary = {
      weekStart: weekLogs[0].date,
      weekEnd: weekLogs[6].date,
      dailyStats,
      macroAdherence,
      workoutConsistency,
      stepAdherence,
      waterAdherence,
      weightChange,
      weightTrendDir,
      currentStreak,
      longestStreak,
      bestDay: bestDay.score > -1 ? bestDay : null,
      worstDay: worstDay.score < 10 ? worstDay : null,
      weeklyTotals,
      averages,
      achievements,
      grade,
      avgScore,
    };

    setWeeklySummaryData(summary);
    setShowWeeklySummary(true);
  };

  const workoutSchedule = getWorkoutSchedule();
  const stepTarget = getStepTarget();
  const mealTiming = getMealTiming();

  return (
    <View style={{ flex: 1, backgroundColor: "#12161B" }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.homeHeaderRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Flame size={22} color="#E8A23D" />
            <Text style={styles.homeTitle}>Daily Fuel</Text>
          </View>
          <TouchableOpacity onPress={() => setScreen("setup")}>
            <Settings size={20} color="#8B95A1" />
          </TouchableOpacity>
        </View>

        <Card style={styles.ringCard}>
          <Ring consumed={consumed} target={target} />
          <View style={{ gap: 14 }}>
            <Stat label="Protein" value={Math.round(proteinConsumed)} unit={`/ ${result ? result.proteinGoal : 0}g`} color="#4FB0A5" />
        <Stat label="Carbs" value={Math.round(carbsConsumed)} unit={`/ ${result ? result.carbGoal : 0}g`} />
        <Stat label="Fat" value={Math.round(fatConsumed)} unit={`/ ${result ? result.fatGoal : 0}g`} />
          </View>
        </Card>

        <Card style={{ marginTop: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            {netVsTDEE >= 0 ? (
              <TrendingDown size={16} color="#4FB0A5" />
            ) : (
              <TrendingUp size={16} color="#E2665A" />
            )}
            <Text style={{ color: "#8B95A1", fontSize: 13 }}>
              Estimated {netVsTDEE >= 0 ? "deficit" : "surplus"} by EOD (vs maintenance)
            </Text>
          </View>
          <Text
            style={{
              color: netVsTDEE >= 0 ? "#4FB0A5" : "#E2665A",
              fontSize: 26,
              fontWeight: "800",
            }}
          >
            {netVsTDEE >= 0 ? "-" : "+"}
            {Math.abs(netVsTDEE)} kcal
          </Text>
          <Text style={{ color: "#8B95A1", fontSize: 12, marginTop: 4 }}>
            TDEE {result ? result.tdee : 0} kcal + {burned} kcal burned − {consumed} kcal eaten.
          </Text>
        </Card>

        <Card style={{ marginTop: 14 }}>
          <Text style={styles.cardLabel}>Macros today</Text>
          <View style={{ flexDirection: "row", gap: 18, marginTop: 8 }}>
            <Stat label="Protein" value={Math.round(proteinConsumed)} unit={`/ ${result ? result.proteinGoal : 0}g`} color="#4FB0A5" />
            <Stat label="Carbs" value={Math.round(carbsConsumed)} unit={`/ ${result ? result.carbGoal : 0}g`} />
            <Stat label="Fat" value={Math.round(fatConsumed)} unit={`/ ${result ? result.fatGoal : 0}g`} />
          </View>
        </Card>

        <Card style={{ marginTop: 14 }}>
          <Text style={styles.cardLabel}>Your numbers</Text>
          <View style={{ flexDirection: "row", gap: 18, marginTop: 8 }}>
            <Stat label="BMR" value={result ? result.bmr : 0} unit="kcal" />
            <Stat label="TDEE" value={result ? result.tdee : 0} unit="kcal" />
          </View>
        </Card>

        {/* ---------- PHASE 4: RECOMMENDATION CARDS ---------- */}
        
        {/* Weekly Workout Schedule */}
        {workoutSchedule.length > 0 && (
          <Card style={{ marginTop: 14 }}>
            <View style={styles.recCardHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Dumbbell size={18} color="#E8A23D" />
                <Text style={styles.recCardTitle}>Weekly Workout Schedule</Text>
              </View>
              <Text style={styles.recCardSubtitle}>{profile.trainingDays} days • {profile.sessionLength}min sessions</Text>
            </View>
            <View style={styles.scheduleList}>
              {workoutSchedule.map((item, i) => (
                <View key={i} style={styles.scheduleItem}>
                  <View style={styles.scheduleDay}>
                    <Text style={styles.scheduleDayLabel}>{item.day}</Text>
                    <View style={[styles.scheduleDayDot, { backgroundColor: "#E8A23D" }]} />
                  </View>
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.scheduleWorkout}>{item.workout}</Text>
                    <Text style={styles.scheduleFocus}>{item.focus} • {item.duration}min</Text>
                  </View>
                  <TouchableOpacity style={styles.scheduleActionBtn}>
                    <Text style={styles.scheduleActionText}>Start</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Step Target & Weekly Projection */}
        <Card style={{ marginTop: 14 }}>
          <View style={styles.recCardHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Activity size={18} color="#4FB0A5" />
              <Text style={styles.recCardTitle}>Activity Targets</Text>
            </View>
            <Text style={styles.recCardSubtitle}>Daily steps • Weekly projection</Text>
          </View>
          <View style={styles.targetsGrid}>
            <View style={styles.targetCard}>
              <View style={styles.targetIcon}><Activity size={24} color="#4FB0A5" /></View>
              <Text style={styles.targetValue}>{stepTarget.toLocaleString()}</Text>
              <Text style={styles.targetLabel}>Daily Steps</Text>
              <View style={styles.targetProgress}>
                <View style={[styles.targetProgressFill, { width: `${Math.min((steps / stepTarget) * 100, 100)}%` }]} />
              </View>
              <Text style={styles.targetProgressText}>{steps.toLocaleString()} / {stepTarget.toLocaleString()}</Text>
            </View>
            <View style={styles.targetCard}>
              <View style={styles.targetIcon}><TrendingDown size={24} color={weeklyWeightChange < 0 ? "#4FB0A5" : "#E2665A"} /></View>
              <Text style={styles.targetValue}>
                {weeklyWeightChange >= 0 ? "+" : ""}{weeklyWeightChange.toFixed(2)}
              </Text>
              <Text style={styles.targetLabel}>Weekly Weight Δ (kg)</Text>
              <Text style={[styles.targetProjection, { color: weeklyWeightChange < 0 ? "#4FB0A5" : "#E2665A" }]}>
                {weeklyWeightChange < 0 ? "Loss" : weeklyWeightChange > 0 ? "Gain" : "Maintain"} pace
              </Text>
            </View>
            <View style={styles.targetCard}>
              <View style={styles.targetIcon}><Target size={24} color="#E8A23D" /></View>
              <Text style={styles.targetValue}>{Math.abs(netVsTDEE)}</Text>
              <Text style={styles.targetLabel}>Daily Deficit/Surplus</Text>
              <Text style={styles.targetProjection}>
                {netVsTDEE >= 0 ? "Deficit" : "Surplus"} × 7 = {Math.abs(weeklyDeficit).toLocaleString()} kcal/wk
              </Text>
            </View>
            {projectedWeight && (
              <View style={styles.targetCard}>
                <View style={styles.targetIcon}><Trophy size={24} color="#7C5CD8" /></View>
                <Text style={styles.targetValue}>{projectedWeight.toFixed(1)}</Text>
                <Text style={styles.targetLabel}>Projected Weight (kg)</Text>
                <Text style={styles.targetProjection}>
                  {daysToGoal ? `~${Math.round(daysToGoal)} days to 5kg goal` : "On track"}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Meal Timing Suggestions */}
        {mealTiming.length > 0 && (
          <Card style={{ marginTop: 14 }}>
            <View style={styles.recCardHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Utensils size={18} color="#7C5CD8" />
                <Text style={styles.recCardTitle}>Meal Timing</Text>
              </View>
              <Text style={styles.recCardSubtitle}>Nutrient timing for performance</Text>
            </View>
            <View style={styles.mealTimingList}>
              {mealTiming.map((item, i) => (
                <View key={i} style={styles.mealTimingItem}>
                  <View style={[styles.mealTimingColorBar, { backgroundColor: item.color }]} />
                  <View style={styles.mealTimingContent}>
                    <View style={styles.mealTimingHeader}>
                      <Text style={styles.mealTimingTitle}>{item.title}</Text>
                      <Text style={styles.mealTimingTime}>{item.timing}</Text>
                    </View>
                    <Text style={styles.mealTimingMacros}>{item.macros}</Text>
                    <Text style={styles.mealTimingExample}>{item.example}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Weekly Summary Preview */}
        <Card style={{ marginTop: 14 }}>
          <View style={styles.recCardHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <History size={18} color="#E8A23D" />
              <Text style={styles.recCardTitle}>This Week (Projected)</Text>
            </View>
            <Text style={styles.recCardSubtitle}>Based on today's data</Text>
          </View>
          <View style={styles.weeklyStatsGrid}>
            <View style={styles.weeklyStat}>
              <Text style={styles.weeklyStatValue}>{Math.round(weeklyStats.avgCalories).toLocaleString()}</Text>
              <Text style={styles.weeklyStatLabel}>Avg Daily Calories</Text>
            </View>
            <View style={styles.weeklyStat}>
              <Text style={styles.weeklyStatValue}>{Math.round(weeklyStats.avgProtein)}g</Text>
              <Text style={styles.weeklyStatLabel}>Avg Daily Protein</Text>
            </View>
            <View style={styles.weeklyStat}>
              <Text style={styles.weeklyStatValue}>{weeklyStats.workoutsThisWeek}</Text>
              <Text style={styles.weeklyStatLabel}>Workouts Logged</Text>
            </View>
            <View style={styles.weeklyStat}>
              <Text style={styles.weeklyStatValue}>{weeklyStats.avgSteps.toLocaleString()}</Text>
              <Text style={styles.weeklyStatLabel}>Avg Daily Steps</Text>
            </View>
            <View style={styles.weeklyStat}>
              <Text style={styles.weeklyStatValue}>{(weeklyStats.waterAvg / 1000).toFixed(1)}L</Text>
              <Text style={styles.weeklyStatLabel}>Avg Daily Water</Text>
            </View>
            <View style={styles.weeklyStat}>
              <Text style={styles.weeklyStatValue}>{Math.round((weeklyStats.avgCalories / 1000) * 14)}g</Text>
              <Text style={styles.weeklyStatLabel}>Fiber Target</Text>
            </View>
          </View>
        </Card>

        {/* Weekly Summary Report Card */}
        <Card style={{ marginTop: 14 }}>
          <View style={styles.summaryReportCard}>
            <View style={styles.summaryReportHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <ClipboardIcon size={20} color="#E8A23D" />
                <Text style={styles.summaryReportTitle}>Weekly Report</Text>
              </View>
              <TouchableOpacity style={styles.summaryReportBtn} onPress={generateWeeklySummary}>
                <Text style={styles.summaryReportBtnText}>Generate</Text>
                <ChevronRightIcon size={16} color="#181008" />
              </TouchableOpacity>
            </View>
            <Text style={styles.summaryReportDesc}>
              Comprehensive analysis of your nutrition, training, and progress over the last 7 days.
            </Text>
            <View style={styles.summaryReportPreview}>
              <View style={styles.summaryPreviewItem}>
                <Text style={styles.summaryPreviewLabel}>Macro Adherence</Text>
                <Text style={styles.summaryPreviewValue}>—</Text>
              </View>
              <View style={styles.summaryPreviewItem}>
                <Text style={styles.summaryPreviewLabel}>Workout Consistency</Text>
                <Text style={styles.summaryPreviewValue}>—</Text>
              </View>
              <View style={styles.summaryPreviewItem}>
                <Text style={styles.summaryPreviewLabel}>Step Adherence</Text>
                <Text style={styles.summaryPreviewValue}>—</Text>
              </View>
              <View style={styles.summaryPreviewItem}>
                <Text style={styles.summaryPreviewLabel}>Grade</Text>
                <Text style={styles.summaryPreviewValue}>—</Text>
              </View>
            </View>
          </View>
        </Card>

      </ScrollView>
      <TabBar active={screen} onChange={setScreen} />
    </View>
  );

  // Weekly Summary Modal
  if (showWeeklySummary && weeklySummaryData) {
    const s = weeklySummaryData;
    const formatWeekDate = (key) => {
      const [y, m, d] = key.split('-');
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    const getGradeColor = (grade) => {
      if (grade.startsWith('A')) return "#4FB0A5";
      if (grade.startsWith('B')) return "#E8A23D";
      if (grade.startsWith('C')) return "#E2665A";
      return "#8B95A1";
    };

    return (
      <Modal visible={true} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.weeklySummaryModal}>
            <View style={styles.weeklySummaryHeader}>
              <View style={styles.weeklySummaryTitleRow}>
                <Text style={styles.weeklySummaryTitle}>Weekly Report</Text>
                <View style={[styles.weeklySummaryGrade, { backgroundColor: getGradeColor(s.grade) }]}>
                  <Text style={styles.weeklySummaryGradeText}>{s.grade}</Text>
                </View>
              </View>
              <Text style={styles.weeklySummaryDateRange}>
                {formatWeekDate(s.weekStart)} - {formatWeekDate(s.weekEnd)}
              </Text>
              <TouchableOpacity onPress={() => setShowWeeklySummary(false)}>
                <X size={24} color="#8B95A1" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.weeklySummaryScroll} contentContainerStyle={styles.weeklySummaryScrollContent}>
              {/* Score Cards */}
              <View style={styles.weeklySummaryScores}>
                <View style={styles.scoreCard}>
                  <Text style={styles.scoreCardLabel}>Overall Score</Text>
                  <Text style={[styles.scoreCardValue, { color: getGradeColor(s.grade) }]}>{s.avgScore}%</Text>
                </View>
                <View style={styles.scoreCard}>
                  <Text style={styles.scoreCardLabel}>Macro Adherence</Text>
                  <Text style={styles.scoreCardValue}>{s.macroAdherence}%</Text>
                </View>
                <View style={styles.scoreCard}>
                  <Text style={styles.scoreCardLabel}>Workout Consistency</Text>
                  <Text style={styles.scoreCardValue}>{s.workoutConsistency}%</Text>
                </View>
                <View style={styles.scoreCard}>
                  <Text style={styles.scoreCardLabel}>Step Adherence</Text>
                  <Text style={styles.scoreCardValue}>{s.stepAdherence}%</Text>
                </View>
                <View style={styles.scoreCard}>
                  <Text style={styles.scoreCardLabel}>Water Adherence</Text>
                  <Text style={styles.scoreCardValue}>{s.waterAdherence}%</Text>
                </View>
              </View>

              {/* Weight Trend */}
              {s.weightChange !== 0 && (
                <View style={styles.weeklySummarySection}>
                  <Text style={styles.weeklySummarySectionTitle}>Weight Trend</Text>
                  <View style={styles.weightTrendCard}>
                    <View style={styles.weightTrendMain}>
                      <Text style={[styles.weightTrendValue, { color: s.weightTrendDir === "down" ? "#4FB0A5" : s.weightTrendDir === "up" ? "#E2665A" : "#8B95A1" }]}>
                        {s.weightChange > 0 ? "+" : ""}{s.weightChange.toFixed(1)} {profile.units === "imperial" ? "lbs" : "kg"}
                      </Text>
                      <Text style={styles.weightTrendLabel}>
                        {s.weightTrendDir === "down" ? "Lost" : s.weightTrendDir === "up" ? "Gained" : "Maintained"} this week
                      </Text>
                    </View>
                    <View style={styles.weightTrendStreaks}>
                      <View style={styles.streakItem}>
                        <Text style={styles.streakValue}>{s.currentStreak}</Text>
                        <Text style={styles.streakLabel}>Current Streak</Text>
                      </View>
                      <View style={styles.streakItem}>
                        <Text style={styles.streakValue}>{s.longestStreak}</Text>
                        <Text style={styles.streakLabel}>Longest Streak</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Weekly Totals */}
              <View style={styles.weeklySummarySection}>
                <Text style={styles.weeklySummarySectionTitle}>Weekly Totals</Text>
                <View style={styles.totalsGrid}>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalValue}>{s.weeklyTotals.calories.toLocaleString()}</Text>
                    <Text style={styles.totalLabel}>Calories</Text>
                  </View>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalValue}>{Math.round(s.weeklyTotals.protein)}g</Text>
                    <Text style={styles.totalLabel}>Protein</Text>
                  </View>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalValue}>{Math.round(s.weeklyTotals.carbs)}g</Text>
                    <Text style={styles.totalLabel}>Carbs</Text>
                  </View>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalValue}>{Math.round(s.weeklyTotals.fat)}g</Text>
                    <Text style={styles.totalLabel}>Fat</Text>
                  </View>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalValue}>{(s.weeklyTotals.water / 1000).toFixed(1)}L</Text>
                    <Text style={styles.totalLabel}>Water</Text>
                  </View>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalValue}>{s.weeklyTotals.steps.toLocaleString()}</Text>
                    <Text style={styles.totalLabel}>Steps</Text>
                  </View>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalValue}>{s.weeklyTotals.workoutCal}</Text>
                    <Text style={styles.totalLabel}>Workout kcal</Text>
                  </View>
                  <View style={styles.totalItem}>
                    <Text style={styles.totalValue}>{s.weeklyTotals.workouts}</Text>
                    <Text style={styles.totalLabel}>Workouts</Text>
                  </View>
                </View>
              </View>

              {/* Daily Breakdown */}
              <View style={styles.weeklySummarySection}>
                <Text style={styles.weeklySummarySectionTitle}>Daily Breakdown</Text>
                <View style={styles.dailyBreakdownList}>
                  {s.dailyStats.map((d, i) => (
                    <View key={i} style={styles.dailyBreakdownItem}>
                      <Text style={styles.dailyBreakdownDate}>{formatWeekDate(d.date)}</Text>
                      <View style={styles.dailyBreakdownMetrics}>
                        <Text style={styles.dailyMetric}>{d.calories > 0 ? d.calories : "—"} kcal</Text>
                        <Text style={styles.dailyMetric}>{d.protein > 0 ? d.protein + "g" : "—"} P</Text>
                        <Text style={styles.dailyMetric}>{d.steps > 0 ? (d.steps / 1000).toFixed(1) + "k" : "—"} steps</Text>
                        <Text style={styles.dailyMetric}>{d.workouts > 0 ? d.workouts + " 💪" : "—"} WO</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Best/Worst Days */}
              {(s.bestDay || s.worstDay) && (
                <View style={styles.weeklySummarySection}>
                  <Text style={styles.weeklySummarySectionTitle}>Highlights</Text>
                  <View style={styles.highlightsRow}>
                    {s.bestDay && (
                      <View style={styles.highlightCard}>
                        <View style={styles.highlightIcon}><Trophy size={20} color="#E8A23D" /></View>
                        <View style={styles.highlightContent}>
                          <Text style={styles.highlightTitle}>Best Day</Text>
                          <Text style={styles.highlightDate}>{formatWeekDate(s.bestDay.date)}</Text>
                          <Text style={styles.highlightStats}>
                            {s.bestDay.calories} kcal • {s.bestDay.protein}g P • {s.bestDay.steps.toLocaleString()} steps
                          </Text>
                        </View>
                      </View>
                    )}
                    {s.worstDay && (
                      <View style={styles.highlightCard}>
                        <View style={styles.highlightIcon}><Target size={20} color="#E2665A" /></View>
                        <View style={styles.highlightContent}>
                          <Text style={styles.highlightTitle}>Room to Improve</Text>
                          <Text style={styles.highlightDate}>{formatWeekDate(s.worstDay.date)}</Text>
                          <Text style={styles.highlightStats}>
                            {s.worstDay.calories} kcal • {s.worstDay.protein}g P • {s.worstDay.steps.toLocaleString()} steps
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Achievements */}
              {s.achievements.length > 0 && (
                <View style={styles.weeklySummarySection}>
                  <Text style={styles.weeklySummarySectionTitle}>Achievements Unlocked ({s.achievements.length})</Text>
                  <View style={styles.achievementsList}>
                    {s.achievements.map((a, i) => (
                      <View key={i} style={styles.achievementItem}>
                        <View style={[styles.achievementIcon, { backgroundColor: a.color }]}>
                          <a.icon size={20} color="#181008" />
                        </View>
                        <View style={styles.achievementContent}>
                          <Text style={styles.achievementTitle}>{a.title}</Text>
                          <Text style={styles.achievementDesc}>{a.desc}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Averages */}
              {Object.keys(s.averages).length > 0 && (
                <View style={styles.weeklySummarySection}>
                  <Text style={styles.weeklySummarySectionTitle}>Daily Averages (Logged Days)</Text>
                  <View style={styles.averagesGrid}>
                    <View style={styles.avgItem}>
                      <Text style={styles.avgValue}>{s.averages.calories.toLocaleString()}</Text>
                      <Text style={styles.avgLabel}>Calories</Text>
                    </View>
                    <View style={styles.avgItem}>
                      <Text style={styles.avgValue}>{s.averages.protein}g</Text>
                      <Text style={styles.avgLabel}>Protein</Text>
                    </View>
                    <View style={styles.avgItem}>
                      <Text style={styles.avgValue}>{s.averages.carbs}g</Text>
                      <Text style={styles.avgLabel}>Carbs</Text>
                    </View>
                    <View style={styles.avgItem}>
                      <Text style={styles.avgValue}>{s.averages.fat}g</Text>
                      <Text style={styles.avgLabel}>Fat</Text>
                    </View>
                    <View style={styles.avgItem}>
                      <Text style={styles.avgValue}>{(s.averages.water / 1000).toFixed(1)}L</Text>
                      <Text style={styles.avgLabel}>Water</Text>
                    </View>
                    <View style={styles.avgItem}>
                      <Text style={styles.avgValue}>{s.averages.steps.toLocaleString()}</Text>
                      <Text style={styles.avgLabel}>Steps</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Share Button */}
              <TouchableOpacity style={styles.weeklySummaryShareBtn} onPress={() => {
                const shareText = `Daily Fuel Weekly Report (${formatWeekDate(s.weekStart)} - ${formatWeekDate(s.weekEnd)})\nGrade: ${s.grade} (${s.avgScore}%)\nMacro Adherence: ${s.macroAdherence}%\nWorkout Consistency: ${s.workoutConsistency}%\nSteps: ${s.stepAdherence}%\nWater: ${s.waterAdherence}%\nWeight: ${s.weightChange > 0 ? "+" : ""}${s.weightChange.toFixed(1)} ${profile.units === "imperial" ? "lbs" : "kg"}\nStreak: ${s.currentStreak} days`;
                Share.share({ message: shareText, title: "Daily Fuel Weekly Report" });
              }}>
                <View style={styles.shareBtnContent}>
                  <ArrowRight size={20} color="#181008" />
                  <Text style={styles.shareBtnText}>Share Report</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
        </Modal>
    );
 }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#12161B",
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    color: "#F2F4F6",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: "#8B95A1",
    fontSize: 14,
    marginTop: 6,
    marginBottom: 20,
  },
  fieldRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  fieldHalf: {
    flex: 1,
  },
  label: {
    color: "#8B95A1",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: "#F2F4F6",
    fontSize: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#E8A23D",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#181008",
    fontWeight: "700",
    fontSize: 15,
  },
  homeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  homeTitle: {
    color: "#F2F4F6",
    fontSize: 17,
    fontWeight: "800",
  },
  cardLabel: {
    color: "#8B95A1",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ringCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 14,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    color: "#8B95A1",
    fontSize: 16,
    fontWeight: "600",
  },
  foodListContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2A323C",
  },
  foodListTitle: {
    color: "#F2F4F6",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  foodItem: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  foodItemMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  foodItemName: {
    color: "#F2F4F6",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  foodItemCalories: {
    color: "#E8A23D",
    fontSize: 15,
    fontWeight: "700",
  },
  foodItemMacros: {
    flexDirection: "row",
    gap: 12,
  },
  macroTag: {
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  macroTagProtein: {
    backgroundColor: "rgba(79, 176, 165, 0.2)",
    color: "#4FB0A5",
  },
  macroTagCarbs: {
    backgroundColor: "rgba(232, 162, 61, 0.2)",
    color: "#E8A23D",
  },
  macroTagFat: {
    backgroundColor: "rgba(226, 102, 90, 0.2)",
    color: "#E2665A",
  },
  foodSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2A323C",
  },
  summaryLabel: {
    color: "#8B95A1",
    fontSize: 13,
    fontWeight: "600",
  },
  summaryValue: {
    color: "#F2F4F6",
    fontSize: 13,
    fontWeight: "600",
  },
  // Onboarding styles
  onboardingCard: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
  },
  onboardingTitle: {
    color: "#F2F4F6",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  onboardingSubtitle: {
    color: "#8B95A1",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    color: "#F2F4F6",
    fontSize: 15,
  },
  permissionList: {
    gap: 16,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  permissionIcon: {
    fontSize: 24,
  },
  permissionTitle: {
    color: "#F2F4F6",
    fontSize: 16,
    fontWeight: "600",
  },
  permissionDesc: {
    color: "#8B95A1",
    fontSize: 13,
    marginTop: 2,
  },
  unitOption: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  unitOptionLabel: {
    fontSize: 17,
    fontWeight: "700",
  },
  unitOptionDetail: {
    color: "#8B95A1",
    fontSize: 13,
    marginTop: 4,
  },
  imperialInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  imperialInput: {
    flex: 1,
    minWidth: 50,
  },
  imperialSeparator: {
    color: "#8B95A1",
    fontSize: 15,
    fontWeight: "600",
  },
  sliderContainer: {
    marginTop: 20,
  },
  sliderLabel: {
    color: "#F2F4F6",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  sliderValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 12,
  },
  sliderValue: {
    color: "#E8A23D",
    fontSize: 28,
    fontWeight: "800",
  },
  sliderValueUnit: {
    color: "#8B95A1",
    fontSize: 15,
  },
  sliderTrack: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  sliderDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  goalOption: {
    flex: 1,
    minWidth: 140,
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
    padding: 16,
  },
  goalOptionLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  goalOptionDesc: {
    color: "#8B95A1",
    fontSize: 12,
  },
  paceOption: {
    flex: 1,
    minWidth: 140,
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
    padding: 16,
  },
  paceOptionLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  paceOptionDesc: {
    color: "#8B95A1",
    fontSize: 12,
  },
  reviewTargets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
    marginBottom: 20,
  },
  reviewTarget: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  reviewTargetLabel: {
    color: "#8B95A1",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  reviewTargetValue: {
    color: "#E8A23D",
    fontSize: 20,
    fontWeight: "800",
  },
  reviewDetails: {
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2A323C",
  },
  reviewDetail: {
    color: "#8B95A1",
    fontSize: 13,
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: "#2A323C",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#E8A23D",
    borderRadius: 2,
  },
  progressSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressStep: {
    alignItems: "center",
    flex: 1,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  progressStepLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  onboardingNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  navButtonBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
  },
  navButtonNext: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: "#E8A23D",
    borderRadius: 12,
  },
  navButtonText: {
    color: "#181008",
    fontWeight: "700",
    fontSize: 15,
  },
  // Food v2 styles
  waterCard: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  waterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  waterTitle: {
    color: "#F2F4F6",
    fontSize: 17,
    fontWeight: "700",
  },
  waterProgress: {
    color: "#8B95A1",
    fontSize: 13,
    fontWeight: "600",
  },
  waterBarTrack: {
    height: 8,
    backgroundColor: "#2A323C",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  waterBarFill: {
    height: "100%",
    backgroundColor: "#4FB0A5",
    borderRadius: 4,
  },
  waterQuickAdd: {
    flexDirection: "row",
    gap: 8,
  },
  waterQuickBtn: {
    flex: 1,
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  waterQuickBtnText: {
    color: "#4FB0A5",
    fontSize: 12,
    fontWeight: "700",
  },
  mealTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#2A323C",
    marginBottom: 16,
  },
  mealTab: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  mealTabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  mealTabLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  mealTabCalories: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  mealSection: {
    marginBottom: 20,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mealSectionTitle: {
    color: "#F2F4F6",
    fontSize: 17,
    fontWeight: "700",
  },
  mealSectionSubtitle: {
    color: "#8B95A1",
    fontSize: 12,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  quickActionBtn: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  quickActionIcon: {
    fontSize: 18,
  },
  quickActionText: {
    color: "#F2F4F6",
    fontSize: 12,
    fontWeight: "600",
  },
  foodItemLeft: {
    flex: 1,
  },
  foodItemServing: {
    color: "#8B95A1",
    fontSize: 11,
    marginTop: 2,
  },
  emptyMeal: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyMealText: {
    color: "#8B95A1",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 4,
  },
  emptyMealHint: {
    color: "#57606A",
    fontSize: 13,
    textAlign: "center",
  },
  dailySummaryCard: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  dailySummaryTitle: {
    color: "#F2F4F6",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  dailySummaryMacros: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-around",
  },
  dailySummaryMacro: {
    flex: 1,
    minWidth: "40%",
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  dailySummaryMacroLabel: {
    color: "#8B95A1",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dailySummaryMacroValue: {
    color: "#E8A23D",
    fontSize: 15,
    fontWeight: "700",
  },
  // Modal styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
    zIndex: 100,
  },
  modalContent: {
    backgroundColor: "#1B2129",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A323C",
  },
  modalTitle: {
    color: "#F2F4F6",
    fontSize: 18,
    fontWeight: "700",
  },
  modalClose: {
    color: "#8B95A1",
    fontSize: 24,
    fontWeight: "600",
  },
  searchInput: {
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: "#F2F4F6",
    fontSize: 15,
    marginTop: 16,
    marginBottom: 12,
  },
  searchTabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  searchTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  searchTabLabel: {
    color: "#F2F4F6",
    fontSize: 13,
    fontWeight: "600",
  },
  searchResults: {
    maxHeight: 400,
  },
  searchResultsContent: {
    paddingBottom: 20,
  },
  searchSection: {
    marginTop: 20,
    marginBottom: 12,
  },
  searchSectionTitle: {
    color: "#8B95A1",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  searchResultItem: {
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchResultMain: {
    flex: 1,
  },
  searchResultName: {
    color: "#F2F4F6",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  searchResultMacros: {
    flexDirection: "row",
    gap: 6,
  },
  searchResultCalories: {
    color: "#E8A23D",
    fontSize: 13,
    fontWeight: "700",
  },
  manualEntryForm: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2A323C",
  },
  formSectionTitle: {
    color: "#F2F4F6",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  formRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  halfInput: {
    flex: 1,
  },
  // Barcode scanner modal
  barcodeModal: {
    flex: 1,
    backgroundColor: "#000",
  },
  barcodeScanner: {
    flex: 1,
  },
  barcodeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "space-between",
    padding: 40,
  },
  barcodeInstruction: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  barcodeCloseBtn: {
    backgroundColor: "#E2665A",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  barcodeCloseText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  // Workout styles
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    color: "#F2F4F6",
    fontSize: 20,
    fontWeight: "800",
  },
  addWorkoutBtn: {
    padding: 8,
  },
  sectionTitle: {
    color: "#F2F4F6",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  workoutCard: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  workoutCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  workoutCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  workoutCardName: {
    color: "#F2F4F6",
    fontSize: 16,
    fontWeight: "700",
  },
  workoutCardType: {
    color: "#181008",
    fontSize: 10,
    fontWeight: "700",
  },
  workoutCardMeta: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  workoutCardDuration: {
    color: "#8B95A1",
    fontSize: 12,
  },
  workoutCardCalories: {
    color: "#E8A23D",
    fontSize: 12,
    fontWeight: "600",
  },
  workoutExerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#2A323C",
  },
  workoutExerciseName: {
    color: "#F2F4F6",
    fontSize: 14,
  },
  workoutExerciseSets: {
    color: "#8B95A1",
    fontSize: 12,
  },
  resumeBtn: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: "#E8A23D",
    borderRadius: 8,
    alignItems: "center",
  },
  resumeBtnText: {
    color: "#181008",
    fontWeight: "700",
    fontSize: 14,
  },
  viewDetailsBtn: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 8,
    alignItems: "center",
  },
  viewDetailsBtnText: {
    color: "#E8A23D",
    fontWeight: "600",
    fontSize: 14,
  },
  templateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  templateCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
  },
  templateCardHeader: {
    marginBottom: 12,
  },
  templateCardName: {
    color: "#F2F4F6",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  templateCardDesc: {
    color: "#8B95A1",
    fontSize: 12,
  },
  templateCardExercises: {
    gap: 4,
  },
  templateExerciseName: {
    color: "#F2F4F6",
    fontSize: 12,
    marginBottom: 2,
  },
  customWorkoutBtn: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  customWorkoutBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  customWorkoutBtnText: {
    color: "#E8A23D",
    fontSize: 15,
    fontWeight: "700",
  },
  historyBtn: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  historyBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  historyBtnText: {
    color: "#F2F4F6",
    fontSize: 15,
    fontWeight: "700",
  },
  // Active Workout Styles
  activeWorkoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#1B2129",
    borderBottomWidth: 1,
    borderBottomColor: "#2A323C",
  },
  activeWorkoutHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activeWorkoutTitleContainer: {
    gap: 2,
  },
  activeWorkoutName: {
    color: "#F2F4F6",
    fontSize: 18,
    fontWeight: "800",
  },
  activeWorkoutDuration: {
    color: "#8B95A1",
    fontSize: 13,
  },
  activeWorkoutHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressRingContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#12161B",
    borderWidth: 3,
    borderColor: "#E8A23D",
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    color: "#E8A23D",
    fontSize: 14,
    fontWeight: "800",
  },
  completeWorkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8A23D",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  completeWorkoutBtnText: {
    color: "#181008",
    fontWeight: "700",
    fontSize: 14,
  },
  activeProgressBar: {
    height: 4,
    backgroundColor: "#2A323C",
    overflow: "hidden",
  },
  activeProgressFill: {
    height: "100%",
    backgroundColor: "#E8A23D",
    borderRadius: 2,
  },
  activeScrollView: {
    flex: 1,
  },
  activeScrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  activeExerciseCard: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  activeExerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  activeExerciseInfo: {
    flex: 1,
  },
  activeExerciseName: {
    color: "#F2F4F6",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  activeExerciseMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeExerciseMuscle: {
    color: "#181008",
    fontSize: 10,
    fontWeight: "700",
  },
  activeExerciseType: {
    color: "#8B95A1",
    fontSize: 12,
  },
  deleteExerciseBtn: {
    padding: 4,
  },
  setsContainer: {
    gap: 8,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
  },
  setRowCompleted: {
    backgroundColor: "rgba(79, 176, 165, 0.1)",
    borderColor: "#4FB0A5",
  },
  setRowActiveRest: {
    backgroundColor: "rgba(232, 162, 61, 0.1)",
    borderColor: "#E8A23D",
  },
  setNumberContainer: {
    width: 40,
    alignItems: "center",
  },
  setNumber: {
    color: "#8B95A1",
    fontSize: 16,
    fontWeight: "700",
  },
  setNumberCompleted: {
    color: "#4FB0A5",
  },
  setNumberActive: {
    color: "#E8A23D",
  },
  setCheck: {
    marginTop: 2,
  },
  setInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  setInput: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: "#F2F4F6",
    fontSize: 14,
    width: 60,
  },
  setInputSeparator: {
    color: "#8B95A1",
    fontSize: 16,
  },
  setUnit: {
    color: "#8B95A1",
    fontSize: 12,
    marginLeft: 4,
  },
  setActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  setActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1B2129",
    borderWidth: 2,
    borderColor: "#2A323C",
    justifyContent: "center",
    alignItems: "center",
  },
  setActionBtnCompleted: {
    backgroundColor: "rgba(79, 176, 165, 0.2)",
    borderColor: "#4FB0A5",
  },
  restBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 8,
  },
  restBtnText: {
    color: "#E8A23D",
    fontSize: 11,
    fontWeight: "700",
  },
  rpeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 4,
  },
  rpeLabel: {
    color: "#8B95A1",
    fontSize: 11,
    fontWeight: "600",
  },
  rpeInput: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: "#F2F4F6",
    fontSize: 14,
    width: 50,
  },
  addSetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
    borderStyle: "dashed",
  },
  addSetBtnText: {
    color: "#8B95A1",
    fontSize: 13,
    fontWeight: "600",
  },
  addExerciseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginTop: 16,
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    borderStyle: "dashed",
  },
  addExerciseBtnText: {
    color: "#E8A23D",
    fontSize: 15,
    fontWeight: "700",
  },
  // Rest Timer Modal
  restTimerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  restTimerModal: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    minWidth: 280,
  },
  restTimerTitle: {
    color: "#F2F4F6",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },
  restTimerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 6,
    borderColor: "#E8A23D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  restTimerTime: {
    color: "#E8A23D",
    fontSize: 48,
    fontWeight: "800",
    fontFamily: "monospace",
  },
  restTimerLabel: {
    color: "#8B95A1",
    fontSize: 14,
    marginTop: 4,
  },
  restTimerProgress: {
    width: "100%",
    height: 8,
    backgroundColor: "#2A323C",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 20,
  },
  restTimerProgressFill: {
    height: "100%",
    backgroundColor: "#E8A23D",
    borderRadius: 4,
  },
  restTimerSkipBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: "#E2665A",
    borderRadius: 12,
  },
  restTimerSkipText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  // Exercise Search Modal
  exerciseSearchModal: {
    backgroundColor: "#1B2129",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: "85%",
    flex: 1,
  },
  exerciseSearchResults: {
    maxHeight: 400,
  },
  exerciseSearchResultsContent: {
    paddingBottom: 20,
  },
  exerciseMuscleGroup: {
    marginBottom: 20,
  },
  exerciseMuscleLabel: {
    color: "#8B95A1",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  exerciseSearchItem: {
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  exerciseSearchItemMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseSearchItemName: {
    color: "#F2F4F6",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  exerciseSearchItemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  exerciseSearchItemMuscle: {
    color: "#181008",
    fontSize: 10,
    fontWeight: "700",
  },
  exerciseSearchItemType: {
    color: "#8B95A1",
    fontSize: 11,
  },
  exerciseSearchItemMet: {
    color: "#E8A23D",
    fontSize: 11,
    fontWeight: "600",
  },
  // Template Picker Modal
  templatePickerModal: {
    backgroundColor: "#1B2129",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: "85%",
    flex: 1,
  },
  templatePickerList: {
    maxHeight: 500,
  },
  templatePickerListContent: {
    paddingBottom: 20,
  },
  templatePickerCard: {
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  templatePickerCardHeader: {
    marginBottom: 12,
  },
  templatePickerCardName: {
    color: "#F2F4F6",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  templatePickerCardDesc: {
    color: "#8B95A1",
    fontSize: 12,
  },
  templatePickerCardExercises: {
    gap: 4,
  },
  templatePickerExercise: {
    color: "#F2F4F6",
    fontSize: 12,
    marginBottom: 2,
  },
  customTemplateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginTop: 16,
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    borderStyle: "dashed",
  },
  customTemplateBtnText: {
    color: "#E8A23D",
    fontSize: 15,
    fontWeight: "700",
  },
  // Workout Summary Modal
  summaryModal: {
    backgroundColor: "#1B2129",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  summaryContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-around",
    marginTop: 16,
    marginBottom: 24,
  },
  summaryStat: {
    flex: 1,
    minWidth: "40%",
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  summaryStatLabel: {
    color: "#8B95A1",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  summaryStatValue: {
    color: "#F2F4F6",
    fontSize: 22,
    fontWeight: "800",
  },
  summaryCloseBtn: {
    backgroundColor: "#E8A23D",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  summaryCloseBtnText: {
    color: "#181008",
    fontSize: 16,
    fontWeight: "700",
  },
  // History Styles
  backBtn: {
    padding: 4,
  },
  emptyHistory: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyHistoryText: {
    color: "#F2F4F6",
    fontSize: 18,
    fontWeight: "700",
  },
  emptyHistorySubtext: {
    color: "#8B95A1",
    fontSize: 14,
    textAlign: "center",
  },
  historyDayGroup: {
    marginBottom: 24,
  },
  historyDate: {
    color: "#E8A23D",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  historyWorkoutCard: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  historyWorkoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyWorkoutName: {
    color: "#F2F4F6",
    fontSize: 16,
    fontWeight: "700",
  },
  historyWorkoutTime: {
    color: "#8B95A1",
    fontSize: 12,
  },
  historyWorkoutCalories: {
    color: "#E8A23D",
    fontSize: 12,
    fontWeight: "600",
  },
  historyWorkoutExercises: {
    gap: 6,
  },
  historyExerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  historyExerciseName: {
    color: "#F2F4F6",
    fontSize: 13,
  },
  historyExerciseVolume: {
    color: "#8B95A1",
    fontSize: 12,
  },

  // Phase 4: Recommendation Engine Styles
  recCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  recCardTitle: {
    color: "#F2F4F6",
    fontSize: 16,
    fontWeight: "700",
  },
  recCardSubtitle: {
    color: "#8B95A1",
    fontSize: 12,
    marginTop: 2,
  },
  scheduleList: {
    gap: 10,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
  },
  scheduleDay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: 50,
  },
  scheduleDayLabel: {
    color: "#E8A23D",
    fontSize: 12,
    fontWeight: "700",
    width: 36,
  },
  scheduleDayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleWorkout: {
    color: "#F2F4F6",
    fontSize: 14,
    fontWeight: "600",
  },
  scheduleFocus: {
    color: "#8B95A1",
    fontSize: 11,
    marginTop: 2,
  },
  scheduleActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E8A23D",
    borderRadius: 8,
  },
  scheduleActionText: {
    color: "#181008",
    fontSize: 11,
    fontWeight: "700",
  },
  targetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  targetCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  targetIcon: {
    marginBottom: 8,
  },
  targetValue: {
    color: "#F2F4F6",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  targetLabel: {
    color: "#8B95A1",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
    marginBottom: 8,
  },
  targetProgress: {
    width: "100%",
    height: 6,
    backgroundColor: "#2A323C",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  targetProgressFill: {
    height: "100%",
    backgroundColor: "#4FB0A5",
    borderRadius: 3,
  },
  targetProgressText: {
    color: "#8B95A1",
    fontSize: 10,
    textAlign: "center",
  },
  targetProjection: {
    color: "#8B95A1",
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },
  mealTimingList: {
    gap: 12,
  },
  mealTimingItem: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 8,
  },
  mealTimingColorBar: {
    width: 4,
    borderRadius: 2,
    flex: 0,
  },
  mealTimingContent: {
    flex: 1,
  },
  mealTimingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  mealTimingTitle: {
    color: "#F2F4F6",
    fontSize: 14,
    fontWeight: "700",
  },
  mealTimingTime: {
    color: "#8B95A1",
    fontSize: 11,
    fontWeight: "600",
  },
  mealTimingMacros: {
    color: "#E8A23D",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  mealTimingExample: {
    color: "#8B95A1",
    fontSize: 11,
  },
  weeklyStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  weeklyStat: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  weeklyStatValue: {
    color: "#F2F4F6",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  weeklyStatLabel: {
    color: "#8B95A1",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  // Calendar / History Styles
  calHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A323C",
  },
  calHeaderCenter: {
    flex: 1,
    alignItems: "center",
  },
  calMonthTitle: {
    color: "#F2F4F6",
    fontSize: 18,
    fontWeight: "800",
  },
  calMonthSubtitle: {
    color: "#8B95A1",
    fontSize: 12,
    marginTop: 2,
  },
  calWeekdayRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  calWeekday: {
    flex: 1,
    textAlign: "center",
    color: "#8B95A1",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 4,
  },
  calDay: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: "14.28%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    position: "relative",
  },
  calDayOtherMonth: {
    opacity: 0.3,
  },
  calDayToday: {
    backgroundColor: "rgba(232, 162, 61, 0.15)",
    borderWidth: 2,
    borderColor: "#E8A23D",
  },
  calDaySelected: {
    borderWidth: 2,
    borderColor: "#4FB0A5",
  },
  calDayNumber: {
    color: "#F2F4F6",
    fontSize: 14,
    fontWeight: "600",
    zIndex: 1,
  },
  calDayNumberOtherMonth: {
    color: "#57606A",
  },
  calDayNumberToday: {
    color: "#E8A23D",
    fontWeight: "800",
  },
  calDayRing: {
    position: "absolute",
    bottom: 4,
    left: "50%",
    transform: [{ translateX: -14 }],
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#2A323C",
    justifyContent: "center",
    alignItems: "center",
  },
  calDayRingFill: {
    borderRadius: 12,
  },
  calDayDotToday: {
    position: "absolute",
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E8A23D",
  },
  calLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendDotEmpty: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#2A323C",
  },
  legendText: {
    color: "#8B95A1",
    fontSize: 11,
  },
  viewToggle: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  viewToggleBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 10,
  },
  viewToggleBtnActive: {
    backgroundColor: "#E8A23D",
    borderColor: "#E8A23D",
  },
  viewToggleBtnText: {
    color: "#F2F4F6",
    fontSize: 13,
    fontWeight: "600",
  },
  viewToggleBtnTextActive: {
    color: "#181008",
  },
  // Week View
  weekScroll: {
    flex: 1,
  },
  weekScrollContent: {
    padding: 20,
    gap: 12,
  },
  weekDayCard: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
  },
  weekDayCardToday: {
    borderColor: "#E8A23D",
    borderWidth: 2,
    backgroundColor: "rgba(232, 162, 61, 0.1)",
  },
  weekDayCardSelected: {
    borderColor: "#4FB0A5",
    borderWidth: 2,
  },
  weekDayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  weekDayNameContainer: {
    flex: 1,
  },
  weekDayName: {
    color: "#F2F4F6",
    fontSize: 16,
    fontWeight: "700",
  },
  weekDayNameToday: {
    color: "#E8A23D",
  },
  weekDayDate: {
    color: "#8B95A1",
    fontSize: 12,
    marginTop: 2,
  },
  weekDayDateToday: {
    color: "#E8A23D",
  },
  weekDayRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#12161B",
  },
  weekDayRingPct: {
    fontSize: 12,
    fontWeight: "800",
  },
  weekDayStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  weekStat: {
    alignItems: "center",
  },
  weekStatValue: {
    color: "#F2F4F6",
    fontSize: 18,
    fontWeight: "800",
  },
  weekStatLabel: {
    color: "#8B95A1",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  weekSummaryCard: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  weekSummaryTitle: {
    color: "#F2F4F6",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  weekSummaryGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  weekSummaryStat: {
    alignItems: "center",
  },
  weekSummaryValue: {
    color: "#E8A23D",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  weekSummaryLabel: {
    color: "#8B95A1",
    fontSize: 11,
    textAlign: "center",
  },
  exportBtn: {
    backgroundColor: "#E8A23D",
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  exportBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  exportBtnText: {
    color: "#181008",
    fontSize: 15,
    fontWeight: "700",
  },
  // Day Detail Modal
  dayDetailModal: {
    backgroundColor: "#1B2129",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: "85%",
    flex: 1,
  },
  dayDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A323C",
  },
  dayDetailDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dayDetailDate: {
    color: "#F2F4F6",
    fontSize: 18,
    fontWeight: "700",
  },
  dayDetailRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#12161B",
  },
  dayDetailRingPct: {
    fontSize: 14,
    fontWeight: "800",
  },
  dayDetailScroll: {
    flex: 1,
  },
  dayDetailScrollContent: {
    paddingTop: 16,
    gap: 20,
  },
  dayDetailSection: {
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
  },
  dayDetailSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dayDetailSectionTitle: {
    color: "#F2F4F6",
    fontSize: 16,
    fontWeight: "700",
  },
  dayDetailSectionTotals: {
    color: "#8B95A1",
    fontSize: 12,
  },
  dayDetailFoodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2A323C",
  },
  dayDetailFoodMain: {
    flex: 1,
  },
  dayDetailFoodName: {
    color: "#F2F4F6",
    fontSize: 14,
    fontWeight: "600",
  },
  dayDetailFoodServing: {
    color: "#8B95A1",
    fontSize: 11,
    marginTop: 2,
  },
  dayDetailFoodMacros: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dayDetailMacro: {
    color: "#8B95A1",
    fontSize: 11,
    fontWeight: "600",
  },
  dayDetailCalories: {
    color: "#E8A23D",
    fontSize: 13,
    fontWeight: "700",
  },
  dayDetailWaterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dayDetailWaterValue: {
    color: "#F2F4F6",
    fontSize: 16,
    fontWeight: "700",
  },
  dayDetailWaterBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#2A323C",
    borderRadius: 4,
    overflow: "hidden",
  },
  dayDetailWaterFill: {
    height: "100%",
    backgroundColor: "#4FB0A5",
    borderRadius: 4,
  },
  dayDetailWaterGoal: {
    color: "#8B95A1",
    fontSize: 13,
  },
  dayDetailWorkoutItem: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  dayDetailWorkoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  dayDetailWorkoutName: {
    color: "#F2F4F6",
    fontSize: 15,
    fontWeight: "700",
  },
  dayDetailWorkoutCompleted: {
    color: "#4FB0A5",
    fontSize: 11,
    fontWeight: "600",
  },
  dayDetailWorkoutMeta: {
    color: "#8B95A1",
    fontSize: 11,
    marginBottom: 8,
  },
  dayDetailWorkoutExercises: {
    gap: 4,
  },
  dayDetailExerciseLine: {
    color: "#F2F4F6",
    fontSize: 12,
  },
  dayDetailActivityRow: {
    flexDirection: "row",
    gap: 16,
  },
  dayDetailActivityItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dayDetailActivityLabel: {
    color: "#8B95A1",
    fontSize: 11,
    marginTop: 2,
  },
  dayDetailActivityValue: {
    color: "#F2F4F6",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  dayDetailMetricsRow: {
    flexDirection: "row",
    gap: 16,
  },
  dayDetailMetricItem: {
    flex: 1,
  },
  dayDetailMetricLabel: {
    color: "#8B95A1",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dayDetailMetricValue: {
    color: "#F2F4F6",
    fontSize: 18,
    fontWeight: "800",
  },
  dayDetailNotes: {
    color: "#F2F4F6",
    fontSize: 13,
    lineHeight: 20,
  },
  dayDetailEmpty: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  dayDetailEmptyText: {
    color: "#F2F4F6",
    fontSize: 16,
    fontWeight: "600",
  },
  dayDetailEmptySub: {
    color: "#8B95A1",
    fontSize: 13,
  },
  dayDetailCloseBtn: {
    backgroundColor: "#E8A23D",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  dayDetailCloseText: {
    color: "#181008",
    fontSize: 16,
    fontWeight: "700",
  },
  // Export Modal
  exportModal: {
    backgroundColor: "#1B2129",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  exportModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  exportModalTitle: {
    color: "#F2F4F6",
    fontSize: 18,
    fontWeight: "700",
  },
  exportModalDesc: {
    color: "#8B95A1",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  exportModalPreview: {
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    maxHeight: 150,
  },
  exportModalPreviewText: {
    color: "#F2F4F6",
    fontSize: 11,
    fontFamily: "monospace",
  },
  exportModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  exportModalBtn: {
    flex: 1,
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  exportModalBtnPrimary: {
    backgroundColor: "#E8A23D",
    borderColor: "#E8A23D",
  },
  exportModalBtnText: {
    color: "#F2F4F6",
    fontSize: 14,
    fontWeight: "700",
  },
  exportModalBtnTextPrimary: {
    color: "#181008",
  },

  // Body Metrics Styles
  metricsContent: {
    padding: 20,
    paddingBottom: 100,
    gap: 24,
  },
  metricsHeader: {
    marginBottom: 8,
  },
  metricsTitle: {
    color: "#F2F4F6",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  metricsSubtitle: {
    color: "#8B95A1",
    fontSize: 14,
  },
  metricsStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricStatCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  metricStatIcon: {
    marginBottom: 4,
  },
  metricStatValue: {
    color: "#F2F4F6",
    fontSize: 22,
    fontWeight: "800",
  },
  metricStatLabel: {
    color: "#8B95A1",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  metricStatUnit: {
    color: "#57606A",
    fontSize: 10,
    textAlign: "center",
  },
  metricsSection: {
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 16,
    padding: 16,
  },
  metricsSectionTitle: {
    color: "#F2F4F6",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  goalTrackerCard: {
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
    padding: 16,
  },
  goalInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  goalInput: {
    flex: 1,
    backgroundColor: "#1B2129",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: "#F2F4F6",
    fontSize: 16,
  },
  goalInputUnit: {
    color: "#8B95A1",
    fontSize: 16,
    fontWeight: "600",
  },
  goalProjection: {
    gap: 8,
  },
  goalProjectionText: {
    color: "#F2F4F6",
    fontSize: 13,
    lineHeight: 20,
  },
  goalProjectionHighlight: {
    color: "#E8A23D",
    fontWeight: "700",
  },
  goalProjectionDate: {
    color: "#8B95A1",
    fontSize: 12,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: "#2A323C",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 8,
  },
  goalProgressFill: {
    height: "100%",
    backgroundColor: "#4FB0A5",
    borderRadius: 4,
  },
  quickAddGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickAddBtn: {
    flex: 1,
    minWidth: "45%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#12161B",
    borderWidth: 1,
    borderColor: "#2A323C",
    borderRadius: 12,
    paddingVertical: 14,
  },
  quickAddBtnText: {
    color: "#F2F4F6",
    fontSize: 13,
    fontWeight: "600",
  },
});
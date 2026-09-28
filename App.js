import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Flame, Settings, TrendingDown, TrendingUp, Target, Dumbbell, Utensils, Heart, ArrowRight, Check, ChevronRight } from "lucide-react-native";
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

  // ---------- WORKOUT SCREEN (placeholder) ----------
  if (screen === "workout") {
    return (
      <View style={{ flex: 1, backgroundColor: "#12161B" }}>
        <View style={styles.placeholderContent}>
          <Text style={{ color: "#F2F4F6" }}>Workout screen coming soon</Text>
        </View>
        <TabBar active={screen} onChange={setScreen} />
      </View>
    );
  }

  // ---------- WEIGHT SCREEN (placeholder) ----------
  if (screen === "weight") {
    return (
      <View style={{ flex: 1, backgroundColor: "#12161B" }}>
        <View style={styles.placeholderContent}>
          <Text style={{ color: "#F2F4F6" }}>Weight screen coming soon</Text>
        </View>
        <TabBar active={screen} onChange={setScreen} />
      </View>
    );
  }

  // ---------- HOME SCREEN ----------
  const target = result ? result.calorieGoal : 0;
 const consumed = food.reduce((sum, item) => sum + item.calories, 0);
const proteinConsumed = food.reduce((sum, item) => sum + item.protein, 0);
const carbsConsumed = food.reduce((sum, item) => sum + item.carbs, 0);
const fatConsumed = food.reduce((sum, item) => sum + item.fat, 0);
const burned = 0;
  const netVsTDEE = result ? result.tdee + burned - consumed : 0;

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
      </ScrollView>
      <TabBar active={screen} onChange={setScreen} />
    </View>
  );
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
});
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
import storage from "./storage";

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
  const [food, setFood] = useState([]);
  const [foodForm, setFoodForm] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "" });
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Load persisted data on startup
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedProfile, savedResult, todayFood] = await Promise.all([
          storage.loadProfile(),
          storage.loadSettings(), // result stored in settings for now
          storage.getTodayFood(),
        ]);
        if (savedProfile) {
          setProfile(savedProfile);
        }
        if (savedResult?.calorieGoal) {
          setResult({
            bmr: savedResult.bmr,
            tdee: savedResult.tdee,
            calorieGoal: savedResult.calorieGoal,
            proteinGoal: savedResult.proteinGoal,
            fatGoal: savedResult.fatGoal,
            carbGoal: savedResult.carbGoal,
          });
          setScreen("home");
        }
        if (todayFood?.length) {
          setFood(todayFood);
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

  // ---------- FOOD SCREEN (placeholder) ----------
  if (screen === "food") {

    const addFood = async () => {
      if (!foodForm.name || !foodForm.calories) return;

      const newEntry = {
        id: Date.now(),
        name: foodForm.name,
        calories: parseFloat(foodForm.calories) || 0,
        protein: parseFloat(foodForm.protein) || 0,
        carbs: parseFloat(foodForm.carbs) || 0,
        fat: parseFloat(foodForm.fat) || 0,
        timestamp: Date.now(),
      };

      const updatedFood = [newEntry, ...food];
      setFood(updatedFood);
      await storage.addFoodToToday(newEntry);

      setFoodForm({ name: "", calories: "", protein: "", carbs: "", fat: "" });
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

    setScanning(true)
try{
   const photoBase64 = result.assets[0].base64;
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.EXPO_PUBLIC_EXPLABS_API_KEY}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: "Estimate the calories, protein, carbs, and fat for the food in this image. Respond ONLY with JSON in this exact shape, no other text: {\"name\": \"short food description\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number}",
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: photoBase64,
              },
            },
          ],
        },
      ],
    }),
  }
);

const data = await response.json();
const replyText = data.candidates[0].content.parts[0].text;
console.log("Extracted text:", replyText);
const parsed = JSON.parse(replyText);
const newEntry = {
  id: Date.now(),
  name: parsed.name,
  calories: parsed.calories,
  protein: parsed.protein,
  carbs: parsed.carbs,
  fat: parsed.fat,
  timestamp: Date.now(),
};
const updatedFood = [newEntry, ...food];
setFood(updatedFood);
await storage.addFoodToToday(newEntry);

} catch (error) {
console.error("Scan failed:", error);
alert("Couldn't analyze that photo. Try again.");
} finally {
setScanning(false);
}
};

    return (
  <View style={{ flex: 1, backgroundColor: "#12161B" }}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.homeTitle}>Log food</Text>

      <TextInput
        style={[styles.input, { marginTop: 14 }]}
        placeholder="What did you eat?"
        placeholderTextColor="#8B95A1"
        value={foodForm.name}
        onChangeText={(v) => setFoodForm((prev) => ({ ...prev, name: v }))}
      />
      <TextInput
        style={[styles.input, { marginTop: 10 }]}
        placeholder="Calories (kcal)"
        placeholderTextColor="#8B95A1"
        keyboardType="numeric"
        value={foodForm.calories}
        onChangeText={(v) => setFoodForm((prev) => ({ ...prev, calories: v }))}
      />
      <TextInput
        style={[styles.input, { marginTop: 10 }]}
        placeholder="Protein (g)"
        placeholderTextColor="#8B95A1"
        keyboardType="numeric"
        value={foodForm.protein}
        onChangeText={(v) => setFoodForm((prev) => ({ ...prev, protein: v }))}
      />
      <TextInput
        style={[styles.input, { marginTop: 10 }]}
        placeholder="Carbs (g)"
        placeholderTextColor="#8B95A1"
        keyboardType="numeric"
        value={foodForm.carbs}
        onChangeText={(v) => setFoodForm((prev) => ({ ...prev, carbs: v }))}
      />
      <TextInput
        style={[styles.input, { marginTop: 10 }]}
        placeholder="Fat (g)"
        placeholderTextColor="#8B95A1"
        keyboardType="numeric"
        value={foodForm.fat}
        onChangeText={(v) => setFoodForm((prev) => ({ ...prev, fat: v }))}
      />
      <TouchableOpacity style={[styles.button, { marginTop: 14 }]} onPress={addFood}>
        <Text style={styles.buttonText}>Add food</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { marginTop: 10, backgroundColor: "#4FB0A5" }]} onPress={scanPlate}>
        <Text style={styles.buttonText}>📷 Scan plate</Text>
      </TouchableOpacity>

      {/* Food list - shows stacked entries */}
      {food.length > 0 && (
        <View style={styles.foodListContainer}>
          <Text style={styles.foodListTitle}>Today's Foods</Text>
          {food.map((item) => (
            <View key={item.id} style={styles.foodItem}>
              <View style={styles.foodItemMain}>
                <Text style={styles.foodItemName}>{item.name}</Text>
                <Text style={styles.foodItemCalories}>{item.calories} kcal</Text>
              </View>
              <View style={styles.foodItemMacros}>
                <Text style={[styles.macroTag, styles.macroTagProtein]}>P: {item.protein}g</Text>
                <Text style={[styles.macroTag, styles.macroTagCarbs]}>C: {item.carbs}g</Text>
                <Text style={[styles.macroTag, styles.macroTagFat]}>F: {item.fat}g</Text>
              </View>
            </View>
          ))}
          <View style={styles.foodSummary}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>
              {food.reduce((sum, i) => sum + i.calories, 0)} kcal  •
              P: {food.reduce((sum, i) => sum + i.protein, 0)}g  •
              C: {food.reduce((sum, i) => sum + i.carbs, 0)}g  •
              F: {food.reduce((sum, i) => sum + i.fat, 0)}g
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
    <TabBar active={screen} onChange={setScreen} />
  </View>
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
});
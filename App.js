import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Flame, Settings, TrendingDown, TrendingUp } from "lucide-react-native";
import Dropdown from "./Dropdown";
import Card from "./Card";
import Stat from "./Stat";
import Ring from "./Ring";
import TabBar from "./TabBar";
import * as ImagePicker from "expo-image-picker";
import storage from "./storage";

// ---------- option data ----------
const SEX_OPTIONS = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
];

const ACTIVITY_OPTIONS = [
  { key: "sedentary", label: "Sedentary" },
  { key: "light", label: "Light (1-3x/wk)" },
  { key: "moderate", label: "Moderate (3-5x/wk)" },
  { key: "active", label: "Active (6-7x/wk)" },
  { key: "very_active", label: "Very active" },
];

const GOAL_OPTIONS = [
  { key: "lose", label: "Lose weight" },
  { key: "maintain", label: "Maintain" },
  { key: "gain", label: "Gain weight" },
];

// ---------- main screen ----------
export default function App() {
  const [profile, setProfile] = useState({
    age: "",
    heightCm: "",
    weightKg: "",
    sex: "male",
    activityLevel: "moderate",
    goal: "lose",
  });
  const [result, setResult] = useState(null);
  const [screen, setScreen] = useState("setup");
  const [food, setFood] = useState([]);
  const [foodForm, setFoodForm] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "" });
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const updateField = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = async () => {
    const w = parseFloat(profile.weightKg);
    const h = parseFloat(profile.heightCm);
    const age = parseFloat(profile.age);
    if (!w || !h || !age) return;

    let bmr = 10 * w + 6.25 * h - 5 * age;
    bmr += profile.sex === "male" ? 5 : -161;

    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const tdee = bmr * multipliers[profile.activityLevel];
    const goalDelta = { lose: -500, maintain: 0, gain: 500 };
    const calorieGoal = tdee + goalDelta[profile.goal];

    const proteinGoal = Math.round(w * 1.8);
    const proteinCal = proteinGoal * 4;
    const fatCal = calorieGoal * 0.3;
    const fatGoal = Math.round(fatCal / 9);
    const carbCal = Math.max(calorieGoal - proteinCal - fatCal, 0);
    const carbGoal = Math.round(carbCal / 4);

    const newResult = {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calorieGoal: Math.round(calorieGoal),
      proteinGoal,
      fatGoal,
      carbGoal,
    };

    setResult(newResult);
    setScreen("home");

    // Persist profile and result
    await Promise.all([
      storage.saveProfile(profile),
      storage.saveSettings({ ...newResult, units: 'metric' }),
    ]);
  };

  const valid = profile.age && profile.heightCm && profile.weightKg;

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

  // ---------- SETUP SCREEN ----------
  if (screen === "setup") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Flame size={24} color="#E8A23D" />
          <Text style={styles.title}>Set up your goals</Text>
        </View>
        <Text style={styles.subtitle}>
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

        {/* Height + Weight */}
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

        {/* Activity level */}
        <View style={styles.fieldRow}>
          <Dropdown
            label="Activity level"
            options={ACTIVITY_OPTIONS}
            value={profile.activityLevel}
            onChange={(v) => updateField("activityLevel", v)}
          />
        </View>

        {/* Goal */}
        <View style={styles.fieldRow}>
          <Dropdown
            label="Goal"
            options={GOAL_OPTIONS}
            value={profile.goal}
            onChange={(v) => updateField("goal", v)}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { opacity: valid ? 1 : 0.5 }]}
          onPress={calculate}
        >
          <Text style={styles.buttonText}>Calculate my targets</Text>
        </TouchableOpacity>
      </ScrollView>
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
});
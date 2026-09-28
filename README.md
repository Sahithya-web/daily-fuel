# Daily Fuel — All-in-One Fitness & Nutrition Tracker

A comprehensive React Native/Expo app for tracking food, workouts, body metrics, and progress — built for gym enthusiasts who want everything in one place.

## Features

### 🍽️ Food Logging (Phase 2)
- **Meal grouping**: Breakfast, Lunch, Dinner, Snacks with per-meal macro totals
- **Water tracker**: Progress bar + quick-add (250/500/750ml)
- **Local food database**: 20 common gym foods (chicken, rice, eggs, etc.)
- **AI photo scan**: Gemini API estimates macros from food photos
- **Barcode scanner**: Ready for OpenFoodFacts integration
- **Manual entry**: Serving size calculator (auto-scales macros)
- **Favorites & Recent foods**: Persisted for quick re-entry
- **Daily summary**: Totals vs goals with macro breakdown

### 🏋️ Workout Logger (Phase 3)
- **8 Built-in templates**: Push/Pull/Legs/Upper/Lower/Full Body/HIIT/Steady Cardio
- **Custom workouts**: Add any exercise from 95-exercise library
- **Live tracking**: Reps × weight per set, RPE, rest timers
- **Auto rest timer**: Starts when completing a set (with push notification)
- **Exercise search**: Filter by name/muscle, grouped by muscle group
- **Calorie estimation**: MET-based calculation per exercise
- **History**: Date-grouped with volume, duration, calories

### 📊 Recommendation Engine (Phase 4)
- **Weekly workout schedule**: Auto-generated from training days (1-7) and session length
- **Dynamic step target**: Goal-based (lose 10k/maintain 8k/gain 7k) + activity bonus
- **Weekly projections**: Weight change, deficit/surplus, days to 5kg goal
- **Meal timing**: Pre/post-workout nutrition + daily distribution
- **Weekly preview**: Avg calories, protein, workouts, steps, water, fiber

### 📅 Calendar & History (Phase 5)
- **Month view**: Heatmap with completion rings (green/yellow/red/gray)
- **Week view**: 7-day cards with key stats + weekly summary
- **Day detail modal**: Full breakdown (food, water, workouts, steps, body metrics, notes)
- **CSV export**: All historical data with copy/share options

### 📈 Body Metrics (Phase 6)
- **Weight tracking**: Trend chart with 7-day moving average + goal line
- **Body fat %**: Separate trend chart
- **Measurements**: 8 sites (waist, chest, hips, neck, L/R arms, L/R thighs)
- **Progress photos**: Grid + side-by-side comparison (earliest vs latest)
- **Goal weight tracker**: Projects target date from current trend
- **Weight history**: Reverse chronological list

### 📋 Weekly Summary Report (Phase 7)
- **Grade system**: A+/A/B/C/D/F from 4 pillars
- **Score cards**: Macro adherence, workout consistency, step adherence, water adherence
- **Weight trend**: Weekly change + streaks
- **Weekly totals & averages**: 8 metrics
- **Daily breakdown**: Per-day calories, protein, steps, workouts
- **Highlights**: Best day / room to improve
- **Achievements**: 8 unlockable (Macro Master, Workout Warrior, etc.)
- **Shareable report**: Formatted text via system share sheet

### 🎯 Onboarding (Phase 1)
- 7 steps: Welcome → Permissions → Units → Profile → Training → Goal/Pace → Review
- Metric/Imperial with live conversion
- Pace-based deficit: Conservative (250), Moderate (500), Aggressive (750 kcal)
- Fiber target: 14g per 1000 kcal
- Projected weekly outcomes on review screen

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo 57 (Managed Workflow) |
| React | React 19 |
| React Native | 0.86 |
| Navigation | Custom state-based (no React Navigation) |
| Storage | `expo-secure-store` (encrypted, Expo Go compatible) |
| Camera/Photos | `expo-image-picker` |
| Barcode | `expo-barcode-scanner` |
| Notifications | `expo-notifications` |
| Icons | `lucide-react-native` |
| Charts | Custom View-based (no SVG dependency) |
| AI | Google Gemini API (photo food scan) |

---

## Data Architecture

```
No traditional database. All data stored locally via expo-secure-store:

Keys:
├── daily_fuel_profile          → User profile (age, height, weight, goals, units)
├── daily_fuel_settings         → Calculated targets + preferences + onboarding flag
└── daily_fuel_daily_logs       → Object keyed by date (YYYY-MM-DD)
    └── YYYY-MM-DD: {
        food: [{ id, name, calories, protein, carbs, fat, meal, serving, servingUnit, timestamp }],
        workouts: [{ id, name, type, exercises: [{ name, sets: [{ reps, weight, completed, rpe, restSec }] }, startTime, endTime, duration, caloriesBurned, completed }],
        steps: number,
        waterMl: number,
        weight: number | null,
        bodyFat: number | null,
        measurements: { waist, chest, hips, neck, leftArm, rightArm, leftThigh, rightThigh } | null,
        photoUri: string | null,
        photoNote: string | null,
        sleepHours: number | null,
        notes: string | null
    }
```

### Reference Data (Constants in App.js)
- `FOOD_DATABASE` — 20 foods with macros per serving
- `EXERCISE_LIBRARY` — 95 exercises with muscle, type, MET, equipment
- `WORKOUT_TEMPLATES` — 8 templates with exercises, sets, reps, rest
- `MEALS` — Breakfast/Lunch/Dinner/Snacks config

---

## Project Structure

```
daily-fuel/
├── App.js              # Main app (~4500 lines) — all screens, logic, styles
├── storage.js          # expo-secure-store wrapper
├── Card.js             # Reusable card container
├── Dropdown.js         # Modal-based dropdown picker
├── Ring.js             # SVG circular progress ring
├── Stat.js             # Stat display (label + value + unit)
├── TabBar.js           # Bottom navigation (Home/Food/Workout/Body)
├── index.js            # Entry point
├── app.json            # Expo config
├── package.json        # Dependencies
├── .env                # EXPO_PUBLIC_EXPLABS_API_KEY (gitignored)
└── .gitignore          # Includes .env
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator / Android Emulator / Physical device with Expo Go

### Installation
```bash
cd daily-fuel
npm install
```

### Environment
Create `.env` in `daily-fuel/`:
```
EXPO_PUBLIC_EXPLABS_API_KEY=your_gemini_api_key_here
```
Get a key from [Google AI Studio](https://aistudio.google.com/)

### Run
```bash
npx expo start
```
- Press `w` for web
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR with Expo Go on physical device

### Build for Web
```bash
npx expo export --platform web
# Output in dist/
```

---

## Screens

| Tab | Screen | Key Features |
|-----|--------|--------------|
| 🏠 Home | Dashboard | Calorie ring, macros, net vs TDEE, recommendations, weekly report |
| 🍽️ Food | Food Logger | Meal tabs, water, search/barcode/AI/manual entry, daily summary |
| 🏋️ Workout | Workout Logger | Templates, live tracking, rest timer, exercise search, history |
| 📊 Body | Calendar/Metrics | Month/Week/Metrics views, day detail, CSV export, charts, photos |

---

## Security & Privacy

- **No backend** — all data stays on device
- **Encrypted storage** — `expo-secure-store` uses Keychain (iOS) / Keystore (Android)
- **No tracking/analytics** — zero network calls except Gemini API (photo scan)
- **API key** — Stored in `.env` (gitignored), never committed
- **Permissions** — Camera (photo scan), Notifications (rest timer), Media Library (progress photos)

---

## Development Notes

### Adding Food to Database
Edit `FOOD_DATABASE` in `App.js`:
```js
const FOOD_DATABASE = [
  { name: "Food Name", calories: 100, protein: 20, carbs: 10, fat: 5, serving: "100g" },
  // ...
];
```

### Adding Exercises
Edit `EXERCISE_LIBRARY` in `App.js`:
```js
const EXERCISE_LIBRARY = [
  { name: "Exercise Name", muscle: "chest", type: "strength", met: 6.0, equipment: "barbell" },
  // ...
];
```

### Adding Workout Templates
Edit `WORKOUT_TEMPLATES` in `App.js`:
```js
const WORKOUT_TEMPLATES = {
  my_template: {
    name: "My Template",
    description: "Description",
    exercises: [
      { name: "Exercise Name", sets: 3, reps: "8-12", restSec: 90 },
    ],
  },
};
```

### Modifying Onboarding Steps
Edit `ONBOARDING_STEPS` and corresponding render functions in `App.js`.

---

## Known Limitations

- Single-file `App.js` (~4500 lines) — could be split into screens/components
- No React Navigation — custom state-based routing
- Charts are View-based (not SVG) — limited interactivity
- No cloud sync — data only on current device
- Gemini API requires internet for photo scan
- Barcode scanner shows code only — no OpenFoodFacts lookup yet
- HealthKit/Apple Watch integration paused (Phase 8+)

---

## Roadmap (Future Phases)

- **Phase 8**: HealthKit / Apple Watch integration
- **Phase 9**: Recipe builder + meal planning
- **Phase 10**: Social features (share workouts, compete with friends)
- **Phase 11**: Cloud backup/sync (optional)
- **Phase 12**: Native builds (EAS Build) for App Store / Play Store

---

## License

MIT — Built for personal use, feel free to fork and modify.

---

## Credits

- **Icons**: [Lucide](https://lucide.dev/)
- **AI**: Google Gemini API
- **Framework**: Expo Team
- **Inspiration**: Apple Fitness, MyFitnessPal, Strong, Hevy
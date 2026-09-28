import EncryptedStorage from 'react-native-encrypted-storage';

// Storage keys
const KEYS = {
  PROFILE: 'daily_fuel_profile',
  DAILY_LOGS: 'daily_fuel_daily_logs', // keyed by date: { '2025-01-15': DailyLog }
  SETTINGS: 'daily_fuel_settings',
};

// Helper to get today's date key in YYYY-MM-DD format
export const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get date key from Date object
export const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Profile ---
export const saveProfile = async (profile) => {
  try {
    await EncryptedStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    return true;
  } catch (e) {
    console.error('Failed to save profile:', e);
    return false;
  }
};

export const loadProfile = async () => {
  try {
    const data = await EncryptedStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to load profile:', e);
    return null;
  }
};

export const clearProfile = async () => {
  try {
    await EncryptedStorage.removeItem(KEYS.PROFILE);
    return true;
  } catch (e) {
    console.error('Failed to clear profile:', e);
    return false;
  }
};

// --- Daily Logs ---
// DailyLog shape:
// {
//   date: 'YYYY-MM-DD',
//   food: [{ id, name, calories, protein, carbs, fat, timestamp }],
//   workouts: [],
//   steps: number,
//   weight: number | null,
//   bodyFat: number | null,
//   waterMl: number,
//   sleepHours: number | null,
//   notes: string,
// }

export const saveDailyLog = async (dateKey, log) => {
  try {
    const allLogs = await loadAllDailyLogs();
    allLogs[dateKey] = { ...allLogs[dateKey], ...log, date: dateKey };
    await EncryptedStorage.setItem(KEYS.DAILY_LOGS, JSON.stringify(allLogs));
    return true;
  } catch (e) {
    console.error('Failed to save daily log:', e);
    return false;
  }
};

export const loadDailyLog = async (dateKey) => {
  try {
    const allLogs = await loadAllDailyLogs();
    return allLogs[dateKey] || null;
  } catch (e) {
    console.error('Failed to load daily log:', e);
    return null;
  }
};

export const loadAllDailyLogs = async () => {
  try {
    const data = await EncryptedStorage.getItem(KEYS.DAILY_LOGS);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to load all daily logs:', e);
    return {};
  }
};

export const clearAllDailyLogs = async () => {
  try {
    await EncryptedStorage.removeItem(KEYS.DAILY_LOGS);
    return true;
  } catch (e) {
    console.error('Failed to clear daily logs:', e);
    return false;
  }
};

// --- Settings ---
export const saveSettings = async (settings) => {
  try {
    await EncryptedStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Failed to save settings:', e);
    return false;
  }
};

export const loadSettings = async () => {
  try {
    const data = await EncryptedStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : { units: 'metric' }; // default metric
  } catch (e) {
    console.error('Failed to load settings:', e);
    return { units: 'metric' };
  }
};

// --- Utility: Get today's food from daily log ---
export const getTodayFood = async () => {
  const log = await loadDailyLog(getTodayKey());
  return log?.food || [];
};

// --- Utility: Save today's food ---
export const saveTodayFood = async (food) => {
  const dateKey = getTodayKey();
  const existingLog = await loadDailyLog(dateKey);
  return saveDailyLog(dateKey, { ...existingLog, food });
};

// --- Utility: Add food entry to today's log ---
export const addFoodToToday = async (foodEntry) => {
  const dateKey = getTodayKey();
  const existingLog = await loadDailyLog(dateKey);
  const existingFood = existingLog?.food || [];
  const updatedFood = [foodEntry, ...existingFood];
  return saveDailyLog(dateKey, { ...existingLog, food: updatedFood });
};

export default {
  saveProfile,
  loadProfile,
  clearProfile,
  saveDailyLog,
  loadDailyLog,
  loadAllDailyLogs,
  clearAllDailyLogs,
  saveSettings,
  loadSettings,
  getTodayKey,
  getDateKey,
  getTodayFood,
  saveTodayFood,
  addFoodToToday,
};
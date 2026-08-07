const DEVICE_KEY = "talkflow_device_id";
const SETTINGS_KEY = "talkflow_settings";
const RECENT_KEY = "talkflow_recent";
const FAV_KEY = "talkflow_favorites";
const RECORDING_KEY_PREFIX = "talkflow_rec_";

export const getDeviceId = () => {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = "dev_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
};

const DEFAULT_SETTINGS = {
  theme: "dark",
  fontSize: "lg",
  autoAdvance: true,
  autoAdvanceSeconds: 6,
  defaultSessionMinutes: 5,
};

export const getSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

export const saveSettings = (s) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
};

export const pushRecent = (item) => {
  const list = getRecent().filter((r) => r.id !== item.id);
  list.unshift({ ...item, ts: Date.now() });
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));
};

export const getRecent = () => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
};

export const getFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
  } catch {
    return [];
  }
};

export const toggleFavorite = (topicId) => {
  const favs = new Set(getFavorites());
  if (favs.has(topicId)) favs.delete(topicId);
  else favs.add(topicId);
  const arr = Array.from(favs);
  localStorage.setItem(FAV_KEY, JSON.stringify(arr));
  return arr;
};

export const saveRecording = async (sessionId, blob) => {
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.onloadend = () => {
      try {
        localStorage.setItem(RECORDING_KEY_PREFIX + sessionId, reader.result);
        resolve(true);
      } catch {
        resolve(false);
      }
    };
    reader.readAsDataURL(blob);
  });
};

export const getRecording = (sessionId) => {
  return localStorage.getItem(RECORDING_KEY_PREFIX + sessionId);
};

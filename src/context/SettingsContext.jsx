import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext(null);

const COOKIE_NAME = "app-settings";
const COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

// No settings API exists in this project yet, and browser storage
// (localStorage/sessionStorage) is off the table for this feature - React
// state is the source of truth at runtime, with a cookie as a lightweight
// persistence fallback across visits.
const DEFAULT_SETTINGS = {
  theme: "light",
  fontSize: "medium", // small | medium | large
  autoplayVideos: true,
  showLikeCounts: true,
  feedOrder: "newest", // newest | relevant - see Settings page comment
  muteNotifications: false,
  notificationSound: true,
};

const FONT_SCALE_PX = { small: "14px", medium: "16px", large: "18px" };

function readCookie() {
  try {
    const match = document.cookie.match(/(?:^|; )app-settings=([^;]*)/);
    if (!match) return {};
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return {};
  }
}

function writeCookie(settings) {
  try {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify(settings)
    )}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
  } catch {
    // Cookies unavailable in this environment - in-memory state still
    // drives the current session, it just won't survive a reload.
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...readCookie() }));

  // Flips the `.dark` class the project's existing `dark:` variant config
  // (index.css) already keys off of - the CSS variables it swaps live in
  // index.css, not here.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--font-scale",
      FONT_SCALE_PX[settings.fontSize] || FONT_SCALE_PX.medium
    );
  }, [settings.fontSize]);

  useEffect(() => {
    writeCookie(settings);
  }, [settings]);

  const updateSetting = (key, value) => setSettings((current) => ({ ...current, [key]: value }));

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}

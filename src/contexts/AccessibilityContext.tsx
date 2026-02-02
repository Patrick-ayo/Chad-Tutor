import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import type { AccessibilitySettings } from "@/types/settings";

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: AccessibilitySettings) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

interface AccessibilityProviderProps {
  children: ReactNode;
  settings: AccessibilitySettings;
  onUpdate: (settings: AccessibilitySettings) => void;
}

export function AccessibilityProvider({ children, settings, onUpdate }: AccessibilityProviderProps) {
  useEffect(() => {
    const root = document.documentElement;

    // Apply theme
    if (settings.theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.remove("light", "dark");
      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.remove("light", "dark");
      root.classList.add(settings.theme);
    }

    // Apply text size
    root.classList.remove("text-small", "text-default", "text-large");
    root.classList.add(`text-${settings.textSize}`);

    // Apply reduce motion
    if (settings.reduceMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    // Apply focus mode aids
    if (settings.focusModeAids.extraWarningTime) {
      root.classList.add("extra-warning-time");
    } else {
      root.classList.remove("extra-warning-time");
    }

    if (settings.focusModeAids.largerTimerText) {
      root.classList.add("large-timer");
    } else {
      root.classList.remove("large-timer");
    }

    if (settings.focusModeAids.clearerViolationFeedback) {
      root.classList.add("clear-violations");
    } else {
      root.classList.remove("clear-violations");
    }

    // Listen for system theme changes
    if (settings.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove("light", "dark");
        root.classList.add(e.matches ? "dark" : "light");
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [settings]);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings: onUpdate }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}

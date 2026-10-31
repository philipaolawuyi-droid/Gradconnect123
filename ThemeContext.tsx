import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemePreference = Theme | "system";

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemePreference;
  switchable?: boolean;
}

function getSystemTheme(): Theme {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialTheme(defaultTheme: ThemePreference): Theme {
  if (typeof window === "undefined") return defaultTheme === "dark" ? "dark" : "light";

  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  if (defaultTheme === "system") return getSystemTheme();
  return defaultTheme;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme(defaultTheme));

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;

    if (switchable) {
      window.localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  useEffect(() => {
    if (!switchable || window.localStorage.getItem("theme")) return;

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mediaQuery) return;

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener?.("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener?.("change", handleSystemThemeChange);
  }, [switchable]);

  const toggleTheme = switchable
    ? () => setTheme((previous) => (previous === "light" ? "dark" : "light"))
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

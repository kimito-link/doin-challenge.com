import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SchemeColors, type ColorScheme } from "@/constants/theme";

const THEME_STORAGE_KEY = "app_theme_preference";

type ThemeMode = "system" | "light" | "dark";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  themeMode: ThemeMode;
  setColorScheme: (scheme: ColorScheme) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(systemScheme);
  const [isInitialized, setIsInitialized] = useState(false);

  // 保存されたテーマ設定を読み込み
  useEffect(() => {
    async function loadThemePreference() {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored && (stored === "system" || stored === "light" || stored === "dark")) {
          setThemeModeState(stored as ThemeMode);
          if (stored !== "system") {
            setColorSchemeState(stored as ColorScheme);
          }
        }
      } catch (error) {
        console.error("[ThemeProvider] Failed to load theme:", error);
      } finally {
        setIsInitialized(true);
      }
    }
    loadThemePreference();
  }, []);

  // システムテーマの変更を監視
  useEffect(() => {
    if (themeMode === "system") {
      setColorSchemeState(systemScheme);
    }
  }, [systemScheme, themeMode]);

  const applyScheme = useCallback((scheme: ColorScheme) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      const palette = SchemeColors[scheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    applyScheme(scheme);
  }, [applyScheme]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    
    // テーマ設定を保存
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error("[ThemeProvider] Failed to save theme:", error);
    }

    // 実際のカラースキームを設定
    if (mode === "system") {
      setColorScheme(systemScheme);
    } else {
      setColorScheme(mode);
    }
  }, [systemScheme, setColorScheme]);

  const toggleTheme = useCallback(() => {
    // light -> dark -> system -> light のサイクル
    const nextMode: ThemeMode = 
      themeMode === "light" ? "dark" :
      themeMode === "dark" ? "system" : "light";
    setThemeMode(nextMode);
  }, [themeMode, setThemeMode]);

  useEffect(() => {
    if (isInitialized) {
      applyScheme(colorScheme);
    }
  }, [applyScheme, colorScheme, isInitialized]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": SchemeColors[colorScheme].primary,
        "color-background": SchemeColors[colorScheme].background,
        "color-surface": SchemeColors[colorScheme].surface,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      }),
    [colorScheme],
  );

  const value = useMemo(
    () => ({
      colorScheme,
      themeMode,
      setColorScheme,
      setThemeMode,
      toggleTheme,
    }),
    [colorScheme, themeMode, setColorScheme, setThemeMode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}

/**
 * テーマモードのラベルを取得
 */
export function getThemeModeLabel(mode: ThemeMode): string {
  switch (mode) {
    case "system":
      return "システム設定に従う";
    case "light":
      return "ライトモード";
    case "dark":
      return "ダークモード";
  }
}

/**
 * テーマモードのアイコン名を取得
 */
export function getThemeModeIcon(mode: ThemeMode): string {
  switch (mode) {
    case "system":
      return "settings-brightness";
    case "light":
      return "light-mode";
    case "dark":
      return "dark-mode";
  }
}

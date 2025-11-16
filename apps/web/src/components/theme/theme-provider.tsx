import * as React from "react";
import { logger } from "@/lib/logger";

const themeLogger = logger.createChildLogger("theme-provider");

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme?: "light" | "dark";
  systemTheme?: "light" | "dark";
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: undefined,
  systemTheme: undefined,
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") {
      return defaultTheme;
    }

    try {
      const stored = localStorage.getItem(storageKey) as Theme;
      return stored || defaultTheme;
    } catch (error) {
      themeLogger.warn("Failed to read theme from localStorage", { error });
      return defaultTheme;
    }
  });

  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark" | undefined>(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const [isMounted, setIsMounted] = React.useState(false);

  const resolvedTheme = theme === "system" ? systemTheme : theme;

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (error) {
        themeLogger.warn("Failed to save theme to localStorage", { error });
      }
      setThemeState(newTheme);
    },
    [storageKey],
  );

  const applyTheme = React.useCallback(
    (targetTheme: "light" | "dark" | undefined) => {
      if (!targetTheme || typeof document === "undefined") return;

      const root = document.documentElement;

      if (disableTransitionOnChange) {
        const css = document.createElement("style");
        css.appendChild(
          document.createTextNode(
            `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`,
          ),
        );
        document.head.appendChild(css);

        (() => window.getComputedStyle(document.body))();

        setTimeout(() => {
          document.head.removeChild(css);
        }, 1);
      }

      if (attribute === "class") {
        root.classList.remove("light", "dark");
        root.classList.add(targetTheme);
      } else {
        root.setAttribute(attribute, targetTheme);
      }
    },
    [attribute, disableTransitionOnChange],
  );

  React.useEffect(() => {
    if (isMounted) {
      applyTheme(resolvedTheme);
    }
  }, [resolvedTheme, applyTheme, isMounted]);

  React.useEffect(() => {
    if (!enableSystem || typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [enableSystem]);

  React.useEffect(() => {
    setIsMounted(true);

    const currentTheme = theme === "system" ? systemTheme : theme;
    applyTheme(currentTheme);
  }, [theme, systemTheme, applyTheme]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme: isMounted ? resolvedTheme : undefined,
      systemTheme: isMounted ? systemTheme : undefined,
    }),
    [theme, setTheme, resolvedTheme, systemTheme, isMounted],
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

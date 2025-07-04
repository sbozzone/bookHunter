"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type ColorTheme = "default" | "green" | "orange"

type ThemeProviderProps = {
  children: ReactNode
  defaultColorTheme?: ColorTheme
  storageKey?: string
}

type ThemeProviderState = {
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
}

const initialState: ThemeProviderState = {
  colorTheme: "default",
  setColorTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultColorTheme = "default",
  storageKey = "bibliosleuth-color-theme",
  ...props
}: ThemeProviderProps) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    if (typeof window === 'undefined') {
      return defaultColorTheme;
    }
    try {
      return (localStorage.getItem(storageKey) as ColorTheme) || defaultColorTheme
    } catch (e) {
      console.warn('Failed to read theme from localStorage', e);
      return defaultColorTheme;
    }
  });

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("theme-default", "theme-green", "theme-orange")

    if (colorTheme !== "default") {
      root.classList.add(`theme-${colorTheme}`)
    } else {
      root.classList.add('theme-default')
    }

    try {
      localStorage.setItem(storageKey, colorTheme)
    } catch(e) {
       console.warn('Failed to set theme in localStorage', e);
    }

  }, [colorTheme, storageKey])

  const value = {
    colorTheme,
    setColorTheme: (newColorTheme: ColorTheme) => {
      setColorTheme(newColorTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

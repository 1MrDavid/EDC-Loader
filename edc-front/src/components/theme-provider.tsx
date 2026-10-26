import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "edc-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    const apply = (value: "light" | "dark") => {
      root.classList.add(value)
      root.style.colorScheme = value
    }

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      apply(systemTheme)
      return
    }

    apply(theme)
  }, [theme])

  const value: ThemeProviderState = {
    theme,
    setTheme: (nextTheme) => {
      localStorage.setItem(storageKey, nextTheme)
      setTheme(nextTheme)
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
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

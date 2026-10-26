import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    const isDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative"
      onClick={toggleTheme}
      aria-label="Cambiar tema"
    >
      <Sun className="size-4 rotate-0 scale-100 opacity-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 dark:opacity-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 opacity-0 transition-all duration-300 dark:rotate-0 dark:scale-100 dark:opacity-100" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}

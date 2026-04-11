import { createContext, useContext } from "react"

export const ThemeContext = createContext({ isDark: true })

export function useThemeContext() {
  return useContext(ThemeContext)
}
import { useState, useEffect } from "react"

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("deluludose-theme")
    return saved ? saved === "dark" : true // default dark
  })

  useEffect(() => {
    localStorage.setItem("deluludose-theme", isDark ? "dark" : "light")
  }, [isDark])

  function toggleTheme() {
    setIsDark((prev) => !prev)
  }

  return { isDark, toggleTheme }
}
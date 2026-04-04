import { useState, useEffect } from "react"

const MAX_RECENT = 5

export function useMoods() {
  const [recentMoods, setRecentMoods] = useState(() => {
    try {
      const saved = localStorage.getItem("deluludose-moods")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem("deluludose-moods", JSON.stringify(recentMoods))
  }, [recentMoods])

  function addMood(emoji) {
    setRecentMoods((prev) => [emoji, ...prev].slice(0, MAX_RECENT))
  }

  return { recentMoods, addMood }
}
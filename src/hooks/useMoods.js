import { useState, useEffect } from "react"

const MAX_RECENT = 5

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function useMoods() {
  const [recentMoods, setRecentMoods] = useState(() => {
    try {
      const saved = localStorage.getItem("deluludose-moods")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [moodHistory, setMoodHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("deluludose-mood-history")
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem("deluludose-moods", JSON.stringify(recentMoods))
  }, [recentMoods])

  useEffect(() => {
    localStorage.setItem("deluludose-mood-history", JSON.stringify(moodHistory))
  }, [moodHistory])

  function addMood(emoji) {
    // Recent 5 — unchanged
    setRecentMoods(prev => [emoji, ...prev].slice(0, MAX_RECENT))

    // Dated history — only latest mood per day is kept
    const today = getTodayKey()
    setMoodHistory(prev => ({ ...prev, [today]: emoji }))
  }

  return { recentMoods, addMood, moodHistory }
}
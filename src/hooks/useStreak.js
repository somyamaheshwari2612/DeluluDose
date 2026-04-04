import { useState, useEffect } from "react"

export function useStreak() {
  const [streak, setStreak] = useState(0)
  const [isNewDay, setIsNewDay] = useState(false)

  useEffect(() => {
    const today = new Date().toDateString()
    const lastVisit = localStorage.getItem("deluludose-last-visit")
    const savedStreak = parseInt(localStorage.getItem("deluludose-streak") || "0")
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    let newStreak = savedStreak

    if (lastVisit === today) {
      // Same day — just load saved streak, no animation
      setIsNewDay(false)
    } else if (lastVisit === yesterday.toDateString()) {
      // Consecutive day — increment!
      newStreak = savedStreak + 1
      setIsNewDay(true)
    } else if (!lastVisit) {
      // First ever visit
      newStreak = 1
      setIsNewDay(true)
    } else {
      // Missed a day — reset
      newStreak = 1
      setIsNewDay(true)
    }

    setStreak(newStreak)
    localStorage.setItem("deluludose-streak", newStreak)
    localStorage.setItem("deluludose-last-visit", today)
  }, [])

  return { streak, isNewDay }
}
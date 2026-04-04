import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const STREAK_MESSAGES = {
  1:  "First dose of the day! 🌱",
  2:  "Two days in. You're warming up 👀",
  3:  "Day 3! The delusion is becoming discipline 💪",
  5:  "5 days strong. Main character arc loading... 🎬",
  7:  "A whole week?! You're unhinged. We love it. 🖤",
  10: "10 days of doses. You're basically a guru now. 🔮",
  14: "Two weeks! The delusion has fully taken over. 💜",
  21: "21 days. This is your personality now. No refunds. 😎",
  30: "30 days. You didn't come this far to only come this far. 👑",
}

const COMEBACK_QUOTES = [
  "Come back tomorrow. Your future self is counting on it. ✦",
  "Tomorrow's dose might be the one that changes everything. 💜",
  "The streak won't keep itself alive. See you tomorrow? 🔥",
  "One more day = one more level up. Don't break the chain. ⚡",
  "Your delusion deserves daily maintenance. Come back. 🫠",
]

function getStreakMessage(streak) {
  const milestones = Object.keys(STREAK_MESSAGES)
    .map(Number)
    .filter((m) => streak >= m)
  if (milestones.length === 0) return `Day ${streak}! Keep going! 🌱`
  const closest = Math.max(...milestones)
  return STREAK_MESSAGES[closest]
}

function getDailyComeback() {
  const dayIndex = new Date().getDay()
  return COMEBACK_QUOTES[dayIndex % COMEBACK_QUOTES.length]
}

export default function StreakDisplay({ streak, isNewDay, position }) {
  const [showTop, setShowTop] = useState(isNewDay)
  const [showBottom, setShowBottom] = useState(!isNewDay)

  useEffect(() => {
    if (isNewDay) {
      const timer = setTimeout(() => {
        setShowTop(false)
        setTimeout(() => setShowBottom(true), 400)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isNewDay])

  if (position === "top") {
    return (
      <AnimatePresence>
        {showTop && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-1 mb-6"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-3xl"
            >
              ❤️‍🔥
            </motion.div>
            <p className="text-base font-bold text-purple-300">
              Day {streak} Streak!
            </p>
            <p className="text-xs text-purple-400/60 text-center">
              {getStreakMessage(streak)}
            </p>
            <motion.div
              className="mt-2 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              initial={{ width: "120px" }}
              animate={{ width: "0px" }}
              transition={{ duration: 5, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {showBottom && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6 flex flex-col items-center gap-2 w-full max-w-xl"
        >
          <div className="w-full h-px bg-purple-800/20 mb-1" />
          <div className="flex items-center gap-2">
            <span className="text-lg">❤️‍🔥</span>
            <span className="text-sm font-semibold text-purple-300">
              Day {streak}
            </span>
            <span className="text-xs text-purple-400/60">
              — {getStreakMessage(streak)}
            </span>
          </div>
          <p className="text-xs text-purple-400/40 text-center italic mt-1">
            {getDailyComeback()}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
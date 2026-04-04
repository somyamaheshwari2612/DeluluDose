import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const MOODS = [
  { emoji: "😁", label: "joyful" },
  { emoji: "🥰", label: "loved" },
  { emoji: "😎", label: "confident" },
  { emoji: "🫠", label: "melting" },
  { emoji: "😭", label: "emotional" },
  { emoji: "🥹", label: "touched" },
]

const FEEDBACK = {
  "😁": "Look at you, thriving! 😁💜",
  "🥰": "Okay, this one gave you ALL the feels. 🥰",
  "😎": "Main character energy activated. 😎✨",
  "🫠": "Yeah... it got you, didn't it. 🫠💜",
  "😭": "Let it out bestie, let it out. 😭💜",
  "🥹": "That little smile trying to hide? We see it. 🥹",
}

const CAPTIONS = [
  "how did that land? ✦",
  "log your vibe ✦",
  "what did that do to you? ✦",
  "rate this dose ✦",
  "your reaction? ✦",
  "felt something? ✦",
]

export default function MoodReactions({ onMoodSelect, recentMoods }) {
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [captionIndex, setCaptionIndex] = useState(0)
  const [captionVisible, setCaptionVisible] = useState(true)

  // Rotate caption every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCaptionVisible(false)
      setTimeout(() => {
        setCaptionIndex((prev) => (prev + 1) % CAPTIONS.length)
        setCaptionVisible(true)
      }, 300)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  function handleMoodClick(mood) {
    setSelected(mood.emoji)
    setFeedback(FEEDBACK[mood.emoji])
    onMoodSelect(mood.emoji)
    setTimeout(() => {
      setSelected(null)
      setFeedback("")
    }, 3000)
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-xl">

      {/* Dynamic caption */}
      <AnimatePresence mode="wait">
        {captionVisible && (
          <motion.p
            key={captionIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="text-xs text-purple-400/50 tracking-widest uppercase"
          >
            {CAPTIONS[captionIndex]}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Emoji row */}
      <div className="flex items-center gap-3">
        {MOODS.map((mood) => (
          <motion.button
            key={mood.emoji}
            onClick={() => handleMoodClick(mood)}
            whileHover={{ scale: 1.3, y: -4 }}
            whileTap={{ scale: 0.9 }}
            animate={selected === mood.emoji ? { scale: [1, 1.5, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`text-2xl cursor-pointer transition-all duration-200 ${
              selected && selected !== mood.emoji ? "opacity-30" : "opacity-100"
            }`}
            aria-label={mood.label}
          >
            {mood.emoji}
          </motion.button>
        ))}
      </div>

      {/* Feedback message */}
      <AnimatePresence>
        {feedback && (
          <motion.p
            key={feedback}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-purple-300/80 text-center"
          >
            {feedback}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Recent moods */}
      <AnimatePresence>
        {recentMoods.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 mt-1"
          >
            <span className="text-xs text-purple-400/40 tracking-widest uppercase">
              recent vibes
            </span>
            <div className="flex gap-1">
              {recentMoods.map((emoji, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1 - i * 0.15, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-base"
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
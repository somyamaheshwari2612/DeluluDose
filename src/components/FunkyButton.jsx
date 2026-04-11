import { motion } from "framer-motion"
import { useState } from "react"
import { useThemeContext } from "../contexts/ThemeContext"

const BUTTON_LABELS = [
  "✨ Give me a dose",
  "🥰 Hit me again",
  "🔮 Another one",
  "⚡ Refill please",
  "🫠 I need this",
  "💫 Keep it coming",
  "😎 Next dose pls",
  "🌙 One more won't hurt",
]

export default function FunkyButton({ onClick, isLoading }) {
  const { isDark } = useThemeContext()
  const [labelIndex, setLabelIndex] = useState(0)
  const [labelVisible, setLabelVisible] = useState(true)

  function handleClick() {
    if (isLoading) return
    onClick()
    setLabelVisible(false)
    setTimeout(() => {
      setLabelIndex((prev) => (prev + 1) % BUTTON_LABELS.length)
      setLabelVisible(true)
    }, 300)
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={isLoading}
      whileHover={!isLoading ? { scale: 1.08, rotate: -2 } : {}}
      whileTap={!isLoading ? { scale: 0.93, rotate: 2 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`
        relative mt-8 px-10 py-4 rounded-2xl font-extrabold text-lg tracking-wide
        text-white shadow-lg transition-all duration-300 cursor-pointer select-none
        flex items-center gap-3 min-w-[220px] justify-center overflow-hidden
        bg-gradient-to-r ${isDark
          ? "from-purple-600 via-fuchsia-500 to-pink-500 shadow-fuchsia-700/40 hover:shadow-fuchsia-500/60"
          : "from-blue-500 via-sky-400 to-cyan-400 shadow-blue-400/40 hover:shadow-blue-400/60"
        }
        ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
      `}
    >
      <motion.span
        className={`absolute inset-0 rounded-2xl blur-xl opacity-30 -z-10 ${
          isDark ? "bg-fuchsia-500" : "bg-sky-400"
        }`}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {isLoading && (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
          className="text-xl"
        >
          ✨
        </motion.span>
      )}

      {isLoading ? (
        "Loading..."
      ) : (
        <motion.span
          key={labelIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: labelVisible ? 1 : 0, y: labelVisible ? 0 : -6 }}
          transition={{ duration: 0.25 }}
        >
          {BUTTON_LABELS[labelIndex]}
        </motion.span>
      )}
    </motion.button>
  )
}
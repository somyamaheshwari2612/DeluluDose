import { motion } from "framer-motion"
import { useThemeContext } from "../contexts/ThemeContext"

export default function ThemeToggle({ onToggle }) {
  const { isDark } = useThemeContext()

  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      className={`fixed top-5 right-5 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer transition-colors duration-500 ${
        isDark
          ? "bg-purple-950/60 border-purple-700/40 hover:border-purple-500/60"
          : "bg-sky-900/30 border-sky-400/40 hover:border-sky-400/70"
      }`}
      aria-label="Toggle theme"
    >
      {/* Moon side */}
      <motion.span
        animate={{ opacity: isDark ? 1 : 0.3, scale: isDark ? 1.1 : 0.85 }}
        transition={{ duration: 0.3 }}
        className="text-base"
      >
        🌙
      </motion.span>

      {/* Track */}
      <div className={`relative w-10 h-5 rounded-full transition-colors duration-500 ${
        isDark ? "bg-purple-800/60" : "bg-sky-500/60"
      }`}>
        <motion.div
          animate={{ x: isDark ? 2 : 22 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md"
        />
      </div>

      {/* Sun side */}
      <motion.span
        animate={{ opacity: isDark ? 0.3 : 1, scale: isDark ? 0.85 : 1.1 }}
        transition={{ duration: 0.3 }}
        className="text-base"
      >
        ☀️
      </motion.span>
    </motion.button>
  )
}
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useThemeContext } from "../contexts/ThemeContext"

const CATEGORY_EMOJIS = {
  funny: "😂", chaotic: "🌀", roast: "🔥", flirty: "💘",
  soft: "🌸", healing: "💚", savage: "⚔️", thought: "💭",
  motivational: "💪", delulu: "✨", dreamy: "🌙", villain: "😈",
  cozy: "🧸", digital: "💻", absurdist: "🎪", midnight: "🕛",
  feral: "🐺", cosmic: "🌌", "chaos-romantic": "💥", poetic: "🪶",
  recovery: "🌱", rebel: "⚡", "self-love": "💜", "tiny-win": "🎯",
}

export default function CategoryFilter({ allCategories, selectedCategories, onToggle, onGoRandom, isFiltered }) {
  const { isDark } = useThemeContext()
  const [isOpen, setIsOpen] = useState(false)

  const excludedCount = allCategories.length - selectedCategories.length

  return (
    <div className="mt-5">
      {/* Filter trigger button */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors duration-300 cursor-pointer ${
          isFiltered
            ? isDark
              ? "bg-purple-700/50 border-purple-500 text-purple-200"
              : "bg-sky-600/50 border-sky-400 text-sky-100"
            : isDark
              ? "bg-transparent border-purple-800/40 text-purple-400/70 hover:border-purple-600"
              : "bg-transparent border-sky-700/40 text-sky-400/70 hover:border-sky-500"
        }`}
      >
        🏷️ {isFiltered ? `blocking ${excludedCount} of ${allCategories.length} categories` : "all categories on"}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="opacity-60 text-[10px]"
        >▾</motion.span>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden mt-3"
          >
            <div className={`rounded-2xl p-4 ${
              isDark
                ? "bg-[#120d1e] border border-purple-800/40"
                : "bg-sky-950/50 border border-sky-600/30"
            }`}>
              <p className={`text-xs mb-3 ${isDark ? "text-purple-400/50" : "text-sky-400/50"}`}>
                tap to block a category · 1 must stay on
              </p>

              {/* Category pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {allCategories.map(cat => {
                  const isActive = selectedCategories.includes(cat)
                  const isLast = isActive && selectedCategories.length === 1

                  return (
                    <motion.button
                      key={cat}
                      onClick={() => !isLast && onToggle(cat)}
                      whileHover={{ scale: isLast ? 1 : 1.05 }}
                      whileTap={{ scale: isLast ? 1 : 0.95 }}
                      title={isLast ? "At least 1 category must stay active" : isActive ? "Tap to block" : "Tap to unblock"}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300 ${
                        isLast
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      } ${
                        isActive
                          // Active = bright/included
                          ? isDark
                            ? "bg-purple-700 border-purple-500 text-white"
                            : "bg-sky-600 border-sky-400 text-white"
                          // Inactive = dimmed/excluded
                          : isDark
                            ? "bg-transparent border-purple-800/30 text-purple-600/50 line-through"
                            : "bg-transparent border-sky-800/30 text-sky-600/50 line-through"
                      }`}
                    >
                      {CATEGORY_EMOJIS[cat] || "✦"} {cat}
                    </motion.button>
                  )
                })}
              </div>

              {/* Restore all — only shows when something is blocked */}
              {isFiltered && (
                <motion.button
                  onClick={() => { onGoRandom(); setIsOpen(false) }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={`text-xs underline underline-offset-2 cursor-pointer transition-colors ${
                    isDark ? "text-purple-400/60 hover:text-purple-300" : "text-sky-400/60 hover:text-sky-300"
                  }`}
                >
                  ✦ restore all categories
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
import { motion, AnimatePresence } from "framer-motion"
import { useThemeContext } from "../contexts/ThemeContext"
import CategoryFilter from "./CategoryFilter"

export default function AffirmationCard({ affirmation, isFavorite, onToggleFavorite, allCategories, selectedCategories, onToggleCategory, onGoRandom, isFiltered }) {
  const { isDark } = useThemeContext()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={affirmation.id}
        initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)", y: 30 }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
        exit={{ opacity: 0, scale: 0.88, filter: "blur(10px)", y: -20 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={`relative rounded-3xl p-8 shadow-2xl max-w-xl w-full transition-colors duration-500 ${
          isDark
            ? "bg-[#1a1025] border border-purple-800/40 shadow-purple-950/60"
            : "bg-sky-900/30 border border-sky-500/30 shadow-sky-900/40 backdrop-blur-sm"
        }`}
      >
        <span className={`text-xs uppercase tracking-widest font-semibold ${
          isDark ? "text-purple-400" : "text-sky-400"
        }`}>
          {affirmation.category}
        </span>

        <p className={`mt-4 text-xl font-bold leading-relaxed bg-clip-text text-transparent bg-gradient-to-r ${
          isDark
            ? "from-purple-300 via-fuchsia-300 to-pink-300"
            : "from-sky-300 via-cyan-300 to-blue-300"
        }`}>
          {affirmation.text}
        </p>
        {/* Add this block after the quote <p> tag */}
      <CategoryFilter
        allCategories={allCategories}
        selectedCategories={selectedCategories}
        onToggle={onToggleCategory}
        onGoRandom={onGoRandom}
        isFiltered={isFiltered}
      />
        <motion.button
          onClick={() => onToggleFavorite(affirmation)}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-5 right-5 text-2xl cursor-pointer"
          aria-label="Toggle favorite"
        >
          {isFavorite ? (isDark ? "💜" : "🩵") : isDark ? "🤍" : "🤍"}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}
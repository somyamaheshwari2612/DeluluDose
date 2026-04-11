import { motion, AnimatePresence } from "framer-motion"
import { useThemeContext } from "../contexts/ThemeContext"

export default function FavoritesList({ favorites, onRemove }) {
  const { isDark } = useThemeContext()

  if (favorites.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-14 max-w-xl w-full"
    >
      <h2 className={`text-sm uppercase tracking-widest font-semibold mb-4 flex items-center gap-2 ${
        isDark ? "text-purple-400/70" : "text-blue-400/70"
      }`}>
        <span>{isDark ? "💜" : "💙"}</span> Saved Doses
      </h2>

      <ul className="flex flex-col gap-3">
        <AnimatePresence>
          {favorites.map((affirmation) => (
            <motion.li
              key={affirmation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start justify-between gap-4 rounded-2xl px-5 py-4 transition-colors duration-500 ${
                isDark
                  ? "bg-[#1a1025] border border-purple-800/30"
                  : "bg-sky-500/20 border border-sky-400/30 backdrop-blur-sm"
              }`}
            >
              <p className={`text-sm leading-relaxed font-medium bg-clip-text text-transparent bg-gradient-to-r ${
                isDark
                  ? "from-purple-300 via-fuchsia-300 to-pink-300"
                  : "from-blue-500 via-sky-400 to-cyan-500"
              }`}>
                {affirmation.text}
              </p>

              <motion.button
                onClick={() => onRemove(affirmation)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.85 }}
                className="text-lg shrink-0 mt-0.5 cursor-pointer"
                aria-label="Remove from favorites"
              >
                {isDark ? "💜" : "💙"}
              </motion.button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  )
}
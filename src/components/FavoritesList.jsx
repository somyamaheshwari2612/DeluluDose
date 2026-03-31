import { motion, AnimatePresence } from "framer-motion"

export default function FavoritesList({ favorites, onRemove }) {
  if (favorites.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-14 max-w-xl w-full"
    >
      {/* Section header */}
      <h2 className="text-sm uppercase tracking-widest text-purple-400/70 font-semibold mb-4 flex items-center gap-2">
        <span>💜</span> Saved Doses
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
              className="flex items-start justify-between gap-4 bg-[#1a1025] border border-purple-800/30 rounded-2xl px-5 py-4"
            >
              {/* Quote text */}
              <p className="text-sm bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent leading-relaxed font-medium">
                {affirmation.text}
              </p>

              {/* Remove button */}
              <motion.button
                onClick={() => onRemove(affirmation)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.85 }}
                className="text-lg shrink-0 mt-0.5 cursor-pointer"
                aria-label="Remove from favorites"
              >
                💜
              </motion.button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.div>
  )
}
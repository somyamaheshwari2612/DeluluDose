import { motion, AnimatePresence } from "framer-motion"

export default function AffirmationCard({ affirmation, isFavorite, onToggleFavorite }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={affirmation.id}
        initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)", y: 30 }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
        exit={{ opacity: 0, scale: 0.88, filter: "blur(10px)", y: -20 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative bg-[#1a1025] border border-purple-800/40 rounded-3xl p-8 shadow-2xl shadow-purple-950/60 max-w-xl w-full"
      >
        {/* Category badge */}
        <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold">
          {affirmation.category}
        </span>

        {/* Gradient quote text */}
        <p className="mt-4 text-xl font-bold leading-relaxed bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
          {affirmation.text}
        </p>

        {/* Favorite button */}
        <motion.button
          onClick={() => onToggleFavorite(affirmation)}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-5 right-5 text-2xl cursor-pointer"
          aria-label="Toggle favorite"
        >
          {isFavorite ? "💜" : "🤍"}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}
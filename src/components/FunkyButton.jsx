import { motion } from "framer-motion"

export default function FunkyButton({ onClick, isLoading }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      whileHover={!isLoading ? { scale: 1.08, rotate: -2 } : {}}
      whileTap={!isLoading ? { scale: 0.93, rotate: 2 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`
        relative mt-8 px-10 py-4 rounded-2xl font-extrabold text-lg tracking-wide
        bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500
        text-white shadow-lg shadow-fuchsia-700/40
        hover:shadow-fuchsia-500/60 hover:shadow-xl
        transition-all duration-300 cursor-pointer select-none
        flex items-center gap-3
        ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
      `}
    >
      {/* Pulsing glow */}
      <motion.span
        className="absolute inset-0 rounded-2xl bg-fuchsia-500 blur-xl opacity-30 -z-10"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Spinning refresh icon */}
      <motion.span
        animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
        transition={isLoading ? { duration: 0.6, repeat: Infinity, ease: "linear" } : {}}
        className="text-xl"
      >
        ✨
      </motion.span>

      {isLoading ? "Loading..." : "Give me a dose"}
    </motion.button>
  )
}
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useThemeContext } from "../contexts/ThemeContext"
import affirmations from "../data/affirmations"

function getTodaysQuote() {
  const today = new Date()
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate()
  return affirmations[seed % affirmations.length]
}

export default function QuoteOfTheDay({ onSaveImage }) {
  const { isDark } = useThemeContext()
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const quote = getTodaysQuote()

  const actionColor = isDark
    ? "text-purple-400/70 hover:text-purple-300"
    : "text-sky-400/70 hover:text-sky-300"
  const dividerColor = isDark ? "text-purple-800" : "text-sky-700/50"

  function handleCopy() {
    navigator.clipboard.writeText(quote.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleShare() {
    const text = `✨ ${quote.text}\n\n— DeluluDose`
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ text, url }).catch(() => {})
    } else {
      const encoded = encodeURIComponent(`${text}\n${url}`)
      window.open(`https://wa.me/?text=${encoded}`, "_blank")
    }
  }

  return (
    <div className="max-w-xl w-full mb-4">

      {/* Collapsed banner */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs uppercase tracking-widest font-semibold flex items-center justify-between transition-colors duration-300 cursor-pointer ${
          isDark
            ? "bg-purple-900/30 border border-purple-700/30 text-purple-300 hover:bg-purple-900/50"
            : "bg-sky-900/30 border border-sky-600/30 text-sky-300 hover:bg-sky-900/50"
        }`}
      >
        <span>✦ Quote of The Day ✦</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="opacity-60"
          align="center"
        >
          ▾
        </motion.span>
      </motion.button>

      {/* Expanded content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className={`mt-2 rounded-2xl p-8 transition-colors duration-500 ${
              isDark
                ? "bg-[#1a1025] border border-purple-800/40"
                : "bg-sky-900/30 border border-sky-500/30 backdrop-blur-sm"
            }`}>

              {/* Category badge */}
              <span className={`text-xs uppercase tracking-widest font-semibold ${
                isDark ? "text-purple-400" : "text-sky-400"
              }`}>
                {quote.category}
              </span>

              {/* Quote text */}
              <p className={`mt-4 text-base font-bold leading-relaxed bg-clip-text text-transparent bg-gradient-to-r ${
                isDark
                  ? "from-purple-300 via-fuchsia-300 to-pink-300"
                  : "from-sky-300 via-cyan-300 to-blue-300"
              }`}>
                {quote.text}
              </p>

              {/* Actions */}
              <div className="mt-5 flex items-center justify-center gap-5">
                <motion.button
                  onClick={handleShare}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`text-sm transition-colors cursor-pointer flex items-center gap-1.5 ${actionColor}`}
                >
                  🔗 Share
                </motion.button>
                <span className={dividerColor}>|</span>
                <motion.button
                  onClick={handleCopy}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`text-sm transition-colors cursor-pointer ${actionColor}`}
                >
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </motion.button>
                <span className={dividerColor}>|</span>
                <motion.button
                  onClick={() => onSaveImage(quote)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`text-sm transition-colors cursor-pointer flex items-center gap-1.5 ${actionColor}`}
                >
                  🖼️ Save image
                </motion.button>
              </div>

              {/* Midnight hint */}
              <p className={`mt-4 text-xs text-center ${
                isDark ? "text-purple-500/50" : "text-sky-500/50"
              }`}>
                ✦ Refreshes At Midnight ✦
              </p>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
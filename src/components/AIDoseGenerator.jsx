import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useThemeContext } from "../contexts/ThemeContext"

const MOODS = [
  "Funny & Savage",
  "Motivational & Deep",
  "Soft & Comforting",
  "Chaotic & Unhinged",
  "Brutally Honest",
  "Dreamy & Poetic",
]

const BUTTON_LABELS = [
  "✨ Craft my dose",
  "🔮 Brew something for me",
  "💫 Make it personal",
  "⚡ Generate my vibe",
  "🫠 I need this now",
]

const RATING_OPTIONS = [
  { emoji: "😐", label: "Meh" },
  { emoji: "🙂", label: "Liked it" },
  { emoji: "😍", label: "Obsessed" },
]

const TRIGGER_LABELS = [
  "✨ Generate Your Dose with AI",
  "🔮 Craft a personal affirmation",
  "💫 Make it about you",
  "⚡ AI knows what you need",
  "🫠 Get a custom dose",
]

const RATING_RESPONSES = {
  "😐": "Noted. We'll do better next time. 💫",
  "🙂": "Glad it landed! Keep dosing. ✨",
  "😍": "Obsessed? Same. You manifested this. 🔮",
}

export default function AIDoseGenerator({ onShare, onSaveImage }) {
  const { isDark } = useThemeContext()

  const [isOpen, setIsOpen] = useState(false)
  const [keywords, setKeywords] = useState("")
  const [mood, setMood] = useState("")
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [rating, setRating] = useState(null)
  const [ratingFeedback, setRatingFeedback] = useState("")
  const [copied, setCopied] = useState(false)
  const [btnIndex, setBtnIndex] = useState(0)
  const [btnVisible, setBtnVisible] = useState(true)
  const [triggerLabel, setTriggerLabel] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTriggerLabel((prev) => (prev + 1) % TRIGGER_LABELS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  async function handleGenerate() {
    const keywordList = keywords.split(",").map((k) => k.trim()).filter(Boolean)
    if (keywordList.length === 0) { setError("Add at least one keyword 💙"); return }
    if (!mood) { setError("Pick a mood to set the vibe 🎭"); return }
    if (keywordList.length > 5) { setError("Max 5 keywords — less is more ✦"); return }

    setBtnVisible(false)
    setTimeout(() => {
      setBtnIndex((prev) => (prev + 1) % BUTTON_LABELS.length)
      setBtnVisible(true)
    }, 300)

    setIsLoading(true)
    setError("")
    setResult("")
    setRating(null)
    setRatingFeedback("")

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: keywordList, mood }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      setResult(data.quote)
    } catch (err) {
      setError(err.message || "Couldn't craft your dose. Try again! 💙")
    } finally {
      setIsLoading(false)
    }
  }

  function handleRating(emoji) {
    setRating(emoji)
    setRatingFeedback(RATING_RESPONSES[emoji])
  }

  function handleCopy() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Theme-aware classes
  const triggerClass = isDark
    ? "border-purple-700/40 bg-purple-950/30 text-purple-300/70 hover:border-purple-500/60 hover:text-purple-200"
    : "border-sky-600/40 bg-sky-900/30 text-sky-300/70 hover:border-sky-400/60 hover:text-sky-200"

  const panelClass = isDark
    ? "bg-[#1a1025] border-purple-800/40"
    : "bg-sky-900/30 border-sky-500/30 backdrop-blur-sm"

  const labelClass = isDark
    ? "text-purple-400/60"
    : "text-sky-400/60"

  const inputClass = isDark
    ? "bg-purple-950/40 border-purple-700/30 text-purple-100 placeholder-purple-600/50 focus:border-purple-500/60"
    : "bg-sky-900/40 border-sky-600/30 text-sky-100 placeholder-sky-600/50 focus:border-sky-400/60"

  const selectBg = isDark ? "bg-[#1a1025]" : "bg-[#0a1628]"

  const generateBtnClass = isDark
    ? "from-purple-600 via-fuchsia-500 to-pink-500 shadow-fuchsia-700/30"
    : "from-sky-500 via-cyan-400 to-blue-500 shadow-sky-700/30"

  const glowClass = isDark ? "bg-fuchsia-500" : "bg-sky-400"

  const resultQuoteClass = isDark
    ? "from-purple-300 via-fuchsia-300 to-pink-300"
    : "from-sky-300 via-cyan-300 to-blue-300"

  const actionClass = isDark
    ? "text-purple-400/70 hover:text-purple-300"
    : "text-sky-400/70 hover:text-sky-300"

  const dividerClass = isDark ? "text-purple-800" : "text-sky-700/50"
  const resultDivider = isDark ? "bg-purple-800/20" : "bg-sky-500/20"

  const ratingLabelClass = isDark ? "text-purple-400/50" : "text-sky-400/50"
  const ratingFeedbackClass = isDark ? "text-purple-300/70" : "text-sky-300/70"

  return (
    <div className="w-full max-w-xl mt-4">

      {/* Trigger button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full h-12 px-5 rounded-2xl border text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer relative overflow-hidden ${triggerClass}`}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={isOpen ? "close" : triggerLabel}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {isOpen ? "✕ Close AI Generator" : TRIGGER_LABELS[triggerLabel]}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Expanding panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={`mt-3 border rounded-3xl p-6 flex flex-col gap-4 transition-colors duration-500 ${panelClass}`}>

              {/* Keywords */}
              <div>
                <label className={`text-xs uppercase tracking-widest block mb-2 ${labelClass}`}>
                  Your keywords (up to 5, comma separated)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="e.g. coffee, monday, anxiety, cats"
                  maxLength={100}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${inputClass}`}
                />
              </div>

              {/* Mood dropdown */}
              <div>
                <label className={`text-xs uppercase tracking-widest block mb-2 ${labelClass}`}>
                  Pick your vibe
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors cursor-pointer ${inputClass}`}
                >
                  <option value="" disabled className={selectBg}>Select a mood...</option>
                  {MOODS.map((m) => (
                    <option key={m} value={m} className={selectBg}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-pink-400/80 text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Generate button */}
              <motion.button
                onClick={handleGenerate}
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.03 } : {}}
                whileTap={!isLoading ? { scale: 0.97 } : {}}
                className={`relative h-12 px-6 rounded-2xl font-bold text-sm text-white
                  bg-gradient-to-r shadow-lg transition-all duration-300 overflow-hidden
                  ${generateBtnClass}
                  ${isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <motion.span
                  className={`absolute inset-0 rounded-2xl blur-xl opacity-20 -z-10 ${glowClass}`}
                  animate={{ opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                {isLoading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    ✨
                  </motion.span>
                ) : (
                  <AnimatePresence mode="wait">
                    {btnVisible && (
                      <motion.span
                        key={btnIndex}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        {BUTTON_LABELS[btnIndex]}
                      </motion.span>
                    )}
                  </AnimatePresence>
                )}
              </motion.button>

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col gap-3"
                  >
                    <div className={`w-full h-px ${resultDivider}`} />

                    <p className={`text-base font-semibold text-center leading-relaxed bg-clip-text text-transparent bg-gradient-to-r ${resultQuoteClass}`}>
                      {result}
                    </p>

                    <div className="flex items-center justify-center gap-4 text-xs">
                      <motion.button onClick={() => onShare(result)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`transition-colors cursor-pointer ${actionClass}`}>
                        🔗 Share
                      </motion.button>
                      <span className={dividerClass}>|</span>
                      <motion.button onClick={handleCopy} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`transition-colors cursor-pointer ${actionClass}`}>
                        {copied ? "✅ Copied!" : "📋 Copy"}
                      </motion.button>
                      <span className={dividerClass}>|</span>
                      <motion.button onClick={() => onSaveImage(result)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`transition-colors cursor-pointer ${actionClass}`}>
                        🖼️ Save image
                      </motion.button>
                    </div>

                    {!rating && (
                      <div className="flex flex-col items-center gap-2 mt-1">
                        <p className={`text-xs uppercase tracking-widest ${ratingLabelClass}`}>
                          how did this land?
                        </p>
                        <div className="flex gap-4">
                          {RATING_OPTIONS.map(({ emoji, label }) => (
                            <motion.button
                              key={emoji}
                              onClick={() => handleRating(emoji)}
                              whileHover={{ scale: 1.3, y: -3 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-2xl cursor-pointer"
                              title={label}
                            >
                              {emoji}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    <AnimatePresence>
                      {ratingFeedback && (
                        <motion.p
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`text-xs text-center ${ratingFeedbackClass}`}
                        >
                          {ratingFeedback}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
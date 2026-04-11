import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

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
  "💜 Make it personal",
  "⚡ Generate my vibe",
  "🫠 I need this now",
]

const RATING_OPTIONS = [
  { emoji: "😐", label: "Meh" },
  { emoji: "🙂", label: "Liked it" },
  { emoji: "😍", label: "Obsessed" },
]

export default function AIDoseGenerator({ onShare, onSaveImage }) {
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

  const TRIGGER_LABELS = [
    "✨ Generate Your Dose with AI",
    "🔮 Craft a personal affirmation",
    "💜 Make it about you",
    "⚡ AI knows what you need",
    "🫠 Get a custom dose",
  ]

  const RATING_RESPONSES = {
    "😐": "Noted. We'll do better next time. 💜",
    "🙂": "Glad it landed! Keep dosing. ✨",
    "😍": "Obsessed? Same. You manifested this. 🔮",
  }

  // Rotate trigger button label every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTriggerLabel((prev) => (prev + 1) % TRIGGER_LABELS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  async function handleGenerate() {
    const keywordList = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)

    if (keywordList.length === 0) {
      setError("Add at least one keyword 💜")
      return
    }
    if (!mood) {
      setError("Pick a mood to set the vibe 🎭")
      return
    }
    if (keywordList.length > 5) {
      setError("Max 5 keywords — less is more ✦")
      return
    }

    // Rotate label on each press
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
      setError(err.message || "Couldn't craft your dose. Try again! 💜")
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

  return (
    <div className="w-full max-w-xl mt-4">

      {/* Trigger button — fixed height, no jumping */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full h-12 px-5 rounded-2xl border border-purple-700/40 bg-purple-950/30 text-purple-300/70 text-sm font-medium tracking-wide hover:border-purple-500/60 hover:text-purple-200 transition-all duration-300 cursor-pointer relative overflow-hidden"
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
            <div className="mt-3 bg-[#1a1025] border border-purple-800/40 rounded-3xl p-6 flex flex-col gap-4">

              {/* Keywords input */}
              <div>
                <label className="text-xs text-purple-400/60 uppercase tracking-widest block mb-2">
                  Your keywords (up to 5, comma separated)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="e.g. coffee, monday, anxiety, cats"
                  maxLength={100}
                  className="w-full bg-purple-950/40 border border-purple-700/30 rounded-xl px-4 py-3 text-sm text-purple-100 placeholder-purple-600/50 focus:outline-none focus:border-purple-500/60 transition-colors"
                />
              </div>

              {/* Mood dropdown */}
              <div>
                <label className="text-xs text-purple-400/60 uppercase tracking-widest block mb-2">
                  Pick your vibe
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full bg-purple-950/40 border border-purple-700/30 rounded-xl px-4 py-3 text-sm text-purple-100 focus:outline-none focus:border-purple-500/60 transition-colors cursor-pointer"
                >
                  <option value="" disabled className="bg-[#1a1025]">
                    Select a mood...
                  </option>
                  {MOODS.map((m) => (
                    <option key={m} value={m} className="bg-[#1a1025]">
                      {m}
                    </option>
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

              {/* Generate button ✅ this is the real one */}
              <motion.button
                onClick={handleGenerate}
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.03 } : {}}
                whileTap={!isLoading ? { scale: 0.97 } : {}}
                className={`relative h-12 px-6 rounded-2xl font-bold text-sm text-white
                  bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500
                  shadow-lg shadow-fuchsia-700/30 transition-all duration-300
                  overflow-hidden
                  ${isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <motion.span
                  className="absolute inset-0 rounded-2xl bg-fuchsia-500 blur-xl opacity-20 -z-10"
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
                    <div className="w-full h-px bg-purple-800/20" />

                    <p className="text-base font-semibold text-center leading-relaxed bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                      {result}
                    </p>

                    <div className="flex items-center justify-center gap-4 text-xs">
                      <motion.button
                        onClick={() => onShare(result)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-purple-400/70 hover:text-purple-300 transition-colors cursor-pointer"
                      >
                        🔗 Share
                      </motion.button>
                      <span className="text-purple-800">|</span>
                      <motion.button
                        onClick={handleCopy}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-purple-400/70 hover:text-purple-300 transition-colors cursor-pointer"
                      >
                        {copied ? "✅ Copied!" : "📋 Copy"}
                      </motion.button>
                      <span className="text-purple-800">|</span>
                      <motion.button
                        onClick={() => onSaveImage(result)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-purple-400/70 hover:text-purple-300 transition-colors cursor-pointer"
                      >
                        🖼️ Save image
                      </motion.button>
                    </div>

                    {!rating && (
                      <div className="flex flex-col items-center gap-2 mt-1">
                        <p className="text-xs text-purple-400/50 uppercase tracking-widest">
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
                          className="text-xs text-purple-300/70 text-center"
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
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useThemeContext } from "../contexts/ThemeContext"

const COIN_LABELS = ["🔥", "🥂"]

const PLACEHOLDER_SITUATIONS = [
  "I texted my ex at 2am saying 'you up?'",
  "I skipped the gym for the 5th day in a row",
  "I spent 3 hours making a playlist instead of studying",
  "I told my boss I'd finish it today",
  "I ordered Uber Eats instead of cooking the groceries I bought",
]

function getRandomPlaceholder() {
  return PLACEHOLDER_SITUATIONS[Math.floor(Math.random() * PLACEHOLDER_SITUATIONS.length)]
}

export default function RoastOrToast() {
  const { isDark } = useThemeContext()
  const [situation, setSituation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [result, setResult] = useState(null) // { type: "roast"|"toast", text: "" }
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [placeholder] = useState(getRandomPlaceholder)
  const flipIntervalRef = useRef(null)
  const [coinFace, setCoinFace] = useState("🔥")

  // Cleanup on unmount
  useEffect(() => {
    return () => clearInterval(flipIntervalRef.current)
  }, [])

  async function handleSubmit() {
    if (!situation.trim() || isLoading) return
    setIsLoading(true)
    setIsFlipping(true)
    setResult(null)
    setError("")

    // Start coin flip animation
    let i = 0
    flipIntervalRef.current = setInterval(() => {
      setCoinFace(COIN_LABELS[i % 2])
      i++
    }, 120)

    try {
      const response = await fetch("/api/roastortoast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: situation.trim() }),
      })

      const data = await response.json()
      if (!response.ok || !data.roast || !data.toast) {
        throw new Error(data.error || "Something went wrong")
      }

      // Let coin flip for at least 1.5s for drama
      await new Promise(r => setTimeout(r, 1500))

      // Land on random result
      clearInterval(flipIntervalRef.current)
      const isRoast = Math.random() < 0.5
      const type = isRoast ? "roast" : "toast"
      const text = isRoast ? data.roast : data.toast

      // Final coin land animation
      setCoinFace(isRoast ? "🔥" : "🥂")
      setIsFlipping(false)
      setResult({ type, text })

    } catch (err) {
      clearInterval(flipIntervalRef.current)
      setIsFlipping(false)
      setError(err.message || "Something went wrong. Try again!")
    } finally {
      setIsLoading(false)
    }
  }

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleShare() {
    if (!result) return
    const emoji = result.type === "roast" ? "🔥" : "🥂"
    const text = `${emoji} DeluluDose ${result.type === "roast" ? "Roasted" : "Toasted"} me:\n\n"${result.text}"\n\ndelulu-dose.vercel.app`
    if (navigator.share) {
      navigator.share({ text }).catch(() => {})
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
    }
  }

  function handleReset() {
    setResult(null)
    setSituation("")
    setError("")
  }

  const isRoast = result?.type === "roast"
  const accentDark = isRoast ? "text-orange-400" : "text-emerald-400"
  const accentLight = isRoast ? "text-orange-300" : "text-emerald-300"
  const borderDark = isRoast ? "border-orange-700/40" : "border-emerald-700/40"
  const borderLight = isRoast ? "border-orange-500/30" : "border-emerald-500/30"
  const bgDark = isRoast ? "bg-orange-900/20" : "bg-emerald-900/20"
  const bgLight = isRoast ? "bg-orange-900/20" : "bg-emerald-900/20"

  return (
    <div className="max-w-xl w-full mt-4">

      {/* Header */}
      <div className={`rounded-2xl p-6 transition-colors duration-500 ${
        isDark
          ? "bg-[#1a1025] border border-purple-800/40"
          : "bg-sky-900/30 border border-sky-500/30 backdrop-blur-sm"
      }`}>

        {/* Title */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🔥</span>
          <p className={`text-xs uppercase tracking-widest font-semibold ${
            isDark ? "text-purple-400" : "text-sky-400"
          }`}>
            roast or toast
          </p>
          <span className="text-lg">🥂</span>
        </div>
        <p className={`text-xs mb-4 ${isDark ? "text-purple-500/50" : "text-sky-500/50"}`}>
          drop your situation · the coin decides your fate
        </p>

        <AnimatePresence mode="wait">

          {/* Input state */}
          {!result && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <textarea
                value={situation}
                onChange={e => setSituation(e.target.value)}
                placeholder={placeholder}
                maxLength={200}
                rows={2}
                className={`w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-colors duration-300 mb-3 ${
                  isDark
                    ? "bg-purple-950/40 border border-purple-800/40 text-purple-100 placeholder-purple-700/50 focus:border-purple-600"
                    : "bg-sky-950/40 border border-sky-700/40 text-sky-100 placeholder-sky-700/50 focus:border-sky-500"
                }`}
              />

              {/* Coin + Button */}
              <div className="flex items-center gap-3">

                {/* Coin */}
                <motion.div
                  animate={isFlipping ? {
                    rotateY: [0, 180, 360],
                    scale: [1, 1.2, 1],
                  } : {}}
                  transition={isFlipping ? {
                    duration: 0.24,
                    repeat: Infinity,
                    ease: "linear"
                  } : {}}
                  className={`text-3xl w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0 ${
                    isDark ? "bg-purple-900/40" : "bg-sky-900/40"
                  }`}
                >
                  {isFlipping ? coinFace : "🪙"}
                </motion.div>

                {/* Submit button */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={!situation.trim() || isLoading}
                  whileHover={!isLoading && situation.trim() ? { scale: 1.02 } : {}}
                  whileTap={!isLoading && situation.trim() ? { scale: 0.97 } : {}}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors duration-300 ${
                    !situation.trim() || isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  } ${
                    isDark
                      ? "bg-purple-800 hover:bg-purple-700 text-purple-100"
                      : "bg-sky-700 hover:bg-sky-600 text-sky-100"
                  }`}
                >
                  {isLoading ? "flipping the coin..." : "flip the coin 🪙"}
                </motion.button>
              </div>

              {/* Error */}
              {error && (
                <p className="mt-2 text-xs text-red-400/80 text-center">{error}</p>
              )}
            </motion.div>
          )}

          {/* Result state */}
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Result card */}
              <div className={`rounded-xl p-4 mb-4 border ${
                isDark
                  ? `${bgDark} ${borderDark}`
                  : `${bgLight} ${borderLight}`
              }`}>

                {/* Type label */}
                <p className={`text-xs uppercase tracking-widest font-semibold mb-2 ${
                  isDark ? accentDark : accentLight
                }`}>
                  {result.type === "roast" ? "🔥 you got roasted" : "🥂 you got toasted"}
                </p>

                {/* Result text */}
                <p className={`text-base font-bold leading-relaxed bg-clip-text text-transparent bg-gradient-to-r ${
                  result.type === "roast"
                    ? "from-orange-300 via-amber-300 to-yellow-300"
                    : "from-emerald-300 via-teal-300 to-cyan-300"
                }`}>
                  {result.text}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={handleShare}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`text-sm cursor-pointer transition-colors ${
                      isDark ? "text-purple-400/70 hover:text-purple-300" : "text-sky-400/70 hover:text-sky-300"
                    }`}
                  >
                    🔗 Share
                  </motion.button>
                  <span className={isDark ? "text-purple-800" : "text-sky-700/50"}>|</span>
                  <motion.button
                    onClick={handleCopy}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`text-sm cursor-pointer transition-colors ${
                      isDark ? "text-purple-400/70 hover:text-purple-300" : "text-sky-400/70 hover:text-sky-300"
                    }`}
                  >
                    {copied ? "✅ Copied!" : "📋 Copy"}
                  </motion.button>
                </div>

                {/* Try again */}
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`text-xs cursor-pointer underline underline-offset-2 transition-colors ${
                    isDark ? "text-purple-500/60 hover:text-purple-300" : "text-sky-500/60 hover:text-sky-300"
                  }`}
                >
                  flip again ↩
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
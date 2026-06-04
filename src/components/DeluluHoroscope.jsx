import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useThemeContext } from "../contexts/ThemeContext"

const SIGNS = [
  { id: "aries",       emoji: "♈", name: "Aries",       dates: "Mar 21 – Apr 19" },
  { id: "taurus",      emoji: "♉", name: "Taurus",      dates: "Apr 20 – May 20" },
  { id: "gemini",      emoji: "♊", name: "Gemini",      dates: "May 21 – Jun 20" },
  { id: "cancer",      emoji: "♋", name: "Cancer",      dates: "Jun 21 – Jul 22" },
  { id: "leo",         emoji: "♌", name: "Leo",         dates: "Jul 23 – Aug 22" },
  { id: "virgo",       emoji: "♍", name: "Virgo",       dates: "Aug 23 – Sep 22" },
  { id: "libra",       emoji: "♎", name: "Libra",       dates: "Sep 23 – Oct 22" },
  { id: "scorpio",     emoji: "♏", name: "Scorpio",     dates: "Oct 23 – Nov 21" },
  { id: "sagittarius", emoji: "♐", name: "Sagittarius", dates: "Nov 22 – Dec 21" },
  { id: "capricorn",   emoji: "♑", name: "Capricorn",   dates: "Dec 22 – Jan 19" },
  { id: "aquarius",    emoji: "♒", name: "Aquarius",    dates: "Jan 20 – Feb 18" },
  { id: "pisces",      emoji: "♓", name: "Pisces",      dates: "Feb 19 – Mar 20" },
]

function getTodayKey() {
  const d = new Date()
  return `deluludose-horoscopes-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function loadCachedHoroscopes() {
  try {
    const saved = localStorage.getItem(getTodayKey())
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function saveCachedHoroscopes(horoscopes) {
  try {
    // Remove any old horoscope keys first
    Object.keys(localStorage)
      .filter(k => k.startsWith("deluludose-horoscopes-"))
      .forEach(k => localStorage.removeItem(k))
    localStorage.setItem(getTodayKey(), JSON.stringify(horoscopes))
  } catch {}
}

export default function DeluluHoroscope() {
  const { isDark } = useThemeContext()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSign, setSelectedSign] = useState(null)
  const [horoscopes, setHoroscopes] = useState(() => loadCachedHoroscopes())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  async function fetchHoroscopes() {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/horoscope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await response.json()
      if (!response.ok || !data.horoscopes) {
        throw new Error(data.error || "Couldn't generate horoscopes")
      }
      saveCachedHoroscopes(data.horoscopes)
      setHoroscopes(data.horoscopes)
    } catch (err) {
      setError(err.message || "Something went wrong. Try again!")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignClick(sign) {
    setSelectedSign(sign)
    if (!horoscopes) {
      await fetchHoroscopes()
    }
  }

  function handleCopy() {
    if (!selectedSign || !horoscopes?.[selectedSign.id]) return
    const sign = SIGNS.find(s => s.id === selectedSign.id)
    navigator.clipboard.writeText(
      `${sign.emoji} ${sign.name} Delulu Horoscope:\n\n"${horoscopes[selectedSign.id]}"\n\n— DeluluDose`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleShare() {
    if (!selectedSign || !horoscopes?.[selectedSign.id]) return
    const sign = SIGNS.find(s => s.id === selectedSign.id)
    const text = `${sign.emoji} ${sign.name} Delulu Horoscope:\n\n"${horoscopes[selectedSign.id]}"\n\n— DeluluDose\ndelulu-dose.vercel.app`
    if (navigator.share) {
      navigator.share({ text }).catch(() => {})
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
    }
  }

  const currentHoroscope = selectedSign && horoscopes?.[selectedSign.id]
  const actionColor = isDark
    ? "text-purple-400/70 hover:text-purple-300"
    : "text-sky-400/70 hover:text-sky-300"
  const dividerColor = isDark ? "text-purple-800" : "text-sky-700/50"

  return (
    <div className="max-w-xl w-full mt-4">

      {/* Collapsible trigger */}
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
        <span>♑ delulu horoscope · daily</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="opacity-60"
        >▾</motion.span>
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
            <div className={`mt-2 rounded-2xl p-6 transition-colors duration-500 ${
              isDark
                ? "bg-[#1a1025] border border-purple-800/40"
                : "bg-sky-900/30 border border-sky-500/30 backdrop-blur-sm"
            }`}>

              <p className={`text-xs mb-4 ${
                isDark ? "text-purple-500/50" : "text-sky-500/50"
              }`}>
                pick your sign · the stars are unhinged today
              </p>

              {/* Sign grid */}
              <div className="grid grid-cols-6 gap-2 mb-5">
                {SIGNS.map(sign => (
                  <motion.button
                    key={sign.id}
                    onClick={() => handleSignClick(sign)}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    title={`${sign.name} · ${sign.dates}`}
                    className={`flex flex-col items-center gap-1 py-2 rounded-xl text-lg cursor-pointer transition-all duration-300 ${
                      selectedSign?.id === sign.id
                        ? isDark
                          ? "bg-purple-700/60 border border-purple-500"
                          : "bg-sky-600/60 border border-sky-400"
                        : isDark
                          ? "bg-purple-900/20 border border-purple-800/30 hover:border-purple-600/50"
                          : "bg-sky-900/20 border border-sky-700/30 hover:border-sky-500/50"
                    }`}
                  >
                    <span>{sign.emoji}</span>
                    <span className={`text-[9px] uppercase tracking-wide font-semibold ${
                      selectedSign?.id === sign.id
                        ? isDark ? "text-purple-200" : "text-sky-100"
                        : isDark ? "text-purple-500/60" : "text-sky-500/60"
                    }`}>
                      {sign.name.slice(0, 3)}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Result area */}
              <AnimatePresence mode="wait">

                {/* Loading */}
                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-4"
                  >
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="inline-block text-2xl"
                    >
                      ✨
                    </motion.span>
                    <p className={`text-xs mt-2 ${
                      isDark ? "text-purple-400/50" : "text-sky-400/50"
                    }`}>
                      consulting the stars...
                    </p>
                  </motion.div>
                )}

                {/* Error */}
                {error && !isLoading && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-2"
                  >
                    <p className="text-xs text-red-400/80 mb-2">{error}</p>
                    <motion.button
                      onClick={fetchHoroscopes}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className={`text-xs underline underline-offset-2 cursor-pointer ${
                        isDark ? "text-purple-400/60 hover:text-purple-300" : "text-sky-400/60 hover:text-sky-300"
                      }`}
                    >
                      try again ↩
                    </motion.button>
                  </motion.div>
                )}

                {/* Horoscope result */}
                {currentHoroscope && !isLoading && (
                  <motion.div
                    key={selectedSign.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                  >
                    {/* Sign header */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{selectedSign.emoji}</span>
                      <div>
                        <p className={`text-xs uppercase tracking-widest font-semibold ${
                          isDark ? "text-purple-400" : "text-sky-400"
                        }`}>
                          {selectedSign.name}
                        </p>
                        <p className={`text-[10px] ${
                          isDark ? "text-purple-600/50" : "text-sky-600/50"
                        }`}>
                          {selectedSign.dates}
                        </p>
                      </div>
                    </div>

                    {/* Horoscope text */}
                    <p className={`text-base font-bold leading-relaxed bg-clip-text text-transparent bg-gradient-to-r mb-4 ${
                      isDark
                        ? "from-purple-300 via-fuchsia-300 to-pink-300"
                        : "from-sky-300 via-cyan-300 to-blue-300"
                    }`}>
                      {currentHoroscope}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <motion.button
                          onClick={handleShare}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`text-sm cursor-pointer transition-colors ${actionColor}`}
                        >
                          🔗 Share
                        </motion.button>
                        <span className={dividerColor}>|</span>
                        <motion.button
                          onClick={handleCopy}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`text-sm cursor-pointer transition-colors ${actionColor}`}
                        >
                          {copied ? "✅ Copied!" : "📋 Copy"}
                        </motion.button>
                      </div>
                      <p className={`text-[10px] ${
                        isDark ? "text-purple-600/40" : "text-sky-600/40"
                      }`}>
                        ✦ refreshes at midnight
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* No sign selected yet */}
                {!selectedSign && !isLoading && (
                  <motion.p
                    key="prompt"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`text-xs text-center py-2 ${
                      isDark ? "text-purple-600/40" : "text-sky-600/40"
                    }`}
                  >
                    ✦ tap your sign above to receive your fate
                  </motion.p>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
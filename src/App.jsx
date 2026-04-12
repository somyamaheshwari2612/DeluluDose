import AIDoseGenerator from "./components/AIDoseGenerator"
import MoodReactions from "./components/MoodReactions"
import { useMoods } from "./hooks/useMoods"
import { Analytics } from "@vercel/analytics/react"
import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import affirmations from "./data/affirmations"
import { useFavorites } from "./hooks/useFavorites"
import AffirmationCard from "./components/AffirmationCard"
import FunkyButton from "./components/FunkyButton"
import FavoritesList from "./components/FavoritesList"
import html2canvas from "html2canvas"
import QuoteImageTemplate from "./components/QuoteImageTemplate"
import StreakDisplay from "./components/StreakDisplay"
import { useStreak } from "./hooks/useStreak"
import { ThemeContext } from "./contexts/ThemeContext"
import { useTheme } from "./hooks/useTheme"
import ThemeToggle from "./components/ThemeToggle"

const RETURNING_MESSAGES = [
  "You were here last time. Ready to go deeper? ✦",
  "Welcome back. Time to explore beyond this. 💙",
  "Still you. Still here. Still growing. ❤️‍🔥",
  "Back again? The delusion continues. 😎",
  "Your doses missed you. Let's go. ✨",
  "Returning users get extra potent doses. 🔮",
]

function getDailyReturningMessage() {
  const day = new Date().getDay()
  return RETURNING_MESSAGES[day % RETURNING_MESSAGES.length]
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildInitialDeck() {
  const isFirstEver = !localStorage.getItem("deluludose-visited")
  if (isFirstEver) {
    localStorage.setItem("deluludose-visited", "true")
    return [affirmations[0], ...shuffle(affirmations.slice(1))]
  }
  return shuffle(affirmations)
}

function loadDeck() {
  try {
    const saved = localStorage.getItem("deluludose-deck")
    const pointer = parseInt(localStorage.getItem("deluludose-pointer") || "0")
    if (saved) {
      const deck = JSON.parse(saved)
      if (deck.length === affirmations.length) return { deck, pointer }
    }
  } catch {}
  const deck = buildInitialDeck()
  return { deck, pointer: 0 }
}

function saveDeck(deck, pointer) {
  localStorage.setItem("deluludose-deck", JSON.stringify(deck))
  localStorage.setItem("deluludose-pointer", pointer.toString())
}

const names = ["SM 💙", "Somya 💙", "SaMi 💙"]

function FlippingName({ isDark }) {
  const [index, setIndex] = useState(0)
  const [flipping, setFlipping] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFlipping(true)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % names.length)
        setFlipping(false)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.span
      animate={
        flipping
          ? { rotateX: 90, opacity: 0, y: -6 }
          : { rotateX: 0, opacity: 1, y: 0 }
      }
      transition={{ duration: 0.35, ease: "easeInOut" }}
      style={{ display: "inline-block", transformOrigin: "bottom center", perspective: 400 }}
      className={`bg-clip-text text-transparent font-semibold bg-gradient-to-r ${
        isDark
          ? "from-purple-400 via-fuchsia-400 to-pink-400"
          : "from-sky-400 via-cyan-300 to-blue-400"
      }`}
    >
      {names[index]}
    </motion.span>
  )
}

export default function App() {
  const { isDark, toggleTheme } = useTheme()

  const { deck: initialDeck, pointer: initialPointer } = loadDeck()
  const deckRef = useRef(initialDeck)
  const pointerRef = useRef(initialPointer)
  const templateRef = useRef(null)

  const isReturning = !!localStorage.getItem("deluludose-visited")
  const [showReturningMsg, setShowReturningMsg] = useState(isReturning)
  const [current, setCurrent] = useState(initialDeck[initialPointer] || affirmations[0])
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { recentMoods, addMood } = useMoods()
  const { streak, isNewDay } = useStreak()

  useEffect(() => {
    if (showReturningMsg) {
      const t = setTimeout(() => setShowReturningMsg(false), 4000)
      return () => clearTimeout(t)
    }
  }, [showReturningMsg])

  const handleNewAffirmation = useCallback(() => {
    if (isLoading) return
    setIsLoading(true)
    setTimeout(() => {
      let pointer = pointerRef.current + 1
      if (pointer >= deckRef.current.length) {
        deckRef.current = shuffle(affirmations)
        pointer = 0
      }
      const next = deckRef.current[pointer]
      pointerRef.current = pointer
      saveDeck(deckRef.current, pointer)
      setCurrent(next)
      setIsLoading(false)
    }, 500)
  }, [isLoading])

  function handleCopy() {
    navigator.clipboard.writeText(current.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSaveImage() {
    const canvas = await html2canvas(templateRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    })
    const link = document.createElement("a")
    link.download = "deluludose.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  async function handleShareLink() {
    const text = `✨ ${current.text}\n\n— DeluluDose`
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ text, url }) } catch {}
    } else {
      const encoded = encodeURIComponent(`${text}\n${url}`)
      window.open(`https://wa.me/?text=${encoded}`, "_blank")
    }
  }

  function handleAIShare(text) {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ text: `✨ ${text}\n\n— DeluluDose`, url }).catch(() => {})
    } else {
      const encoded = encodeURIComponent(`✨ ${text}\n\n— DeluluDose\n${url}`)
      window.open(`https://wa.me/?text=${encoded}`, "_blank")
    }
  }

  async function handleAISaveImage(text) {
    const original = current
    setCurrent({ ...current, text, category: "ai-crafted" })
    await new Promise((r) => setTimeout(r, 100))
    await handleSaveImage()
    setCurrent(original)
  }

  const actionColor = isDark
    ? "text-purple-400/70 hover:text-purple-300"
    : "text-sky-400/70 hover:text-sky-300"
  const dividerColor = isDark ? "text-purple-800" : "text-sky-700/50"

  return (
    <ThemeContext.Provider value={{ isDark }}>
      <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden relative transition-colors duration-500 ${
        isDark ? "bg-[#0d0a14]" : "bg-[#060e1f]"
      }`}>

        {/* Background glow orbs */}
        {!isDark && (
          <>
            <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-sky-500/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-cyan-400/20 blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
          </>
        )}
        {isDark && (
          <>
            <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-purple-900/30 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-fuchsia-900/20 blur-[120px] pointer-events-none" />
          </>
        )}

        <ThemeToggle onToggle={toggleTheme} />

        {/* Main Content Container with z-10 */}
        <div className="relative z-10 flex flex-col items-center w-full">
          
          {/* Title with floating icons around it */}
          <div className="relative flex items-center justify-center w-full mb-2">
            {/* Left icons */}
            <motion.span className="absolute left-[8%] text-xl opacity-30 select-none pointer-events-none"
              animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0 }}>⭐</motion.span>
            <motion.span className="absolute left-[15%] text-xl opacity-30 select-none pointer-events-none"
              animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.8 }}>💫</motion.span>
            <motion.span className="absolute left-[3%] text-xl opacity-30 select-none pointer-events-none"
              animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}>🔮</motion.span>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${
                isDark
                  ? "from-purple-400 via-fuchsia-400 to-pink-400"
                  : "from-sky-400 via-cyan-300 to-blue-400"
              }`}
            >
              DeluluDose
            </motion.h1>

            {/* Right icons */}
            <motion.span className="absolute right-[8%] text-xl opacity-30 select-none pointer-events-none"
              animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.4 }}>🌙</motion.span>
            <motion.span className="absolute right-[15%] text-xl opacity-30 select-none pointer-events-none"
              animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}>⚡</motion.span>
            <motion.span className="absolute right-[3%] text-xl opacity-30 select-none pointer-events-none"
              animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}>✨</motion.span>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`text-sm mb-4 tracking-widest uppercase ${
              isDark ? "text-purple-400/60" : "text-sky-300/70"
            }`}
          >
            your daily reality check ✦
          </motion.p>

          <StreakDisplay streak={streak} isNewDay={isNewDay} position="top" />

          <AnimatePresence>
            {showReturningMsg && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4 }}
                className={`text-xs tracking-wide italic mb-6 text-center ${
                  isDark ? "text-purple-400/50" : "text-sky-300/50"
                }`}
              >
                {getDailyReturningMessage()}
              </motion.p>
            )}
          </AnimatePresence>

          {!showReturningMsg && <div className="mb-6" />}

          <AffirmationCard
            affirmation={current}
            isFavorite={isFavorite(current.id)}
            onToggleFavorite={toggleFavorite}
          />

          <AIDoseGenerator
            onShare={handleAIShare}
            onSaveImage={handleAISaveImage}
          />

          <MoodReactions onMoodSelect={addMood} recentMoods={recentMoods} />

          <FunkyButton onClick={handleNewAffirmation} isLoading={isLoading} />

          <div className="mt-4 flex items-center gap-5">
            <motion.button
              onClick={handleShareLink}
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
              onClick={handleSaveImage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`text-sm transition-colors cursor-pointer flex items-center gap-1.5 ${actionColor}`}
            >
              🖼️ Save image
            </motion.button>
          </div>

          <QuoteImageTemplate affirmation={current} templateRef={templateRef} />

          <FavoritesList favorites={favorites} onRemove={toggleFavorite} />

          <StreakDisplay streak={streak} isNewDay={isNewDay} position="bottom" />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className={`mt-16 text-xs tracking-wide text-center ${
              isDark ? "text-purple-400/40" : "text-sky-400/40"
            }`}
          >
            Made with Delusion & Determination by{" "}
            <FlippingName isDark={isDark} />
          </motion.p>
        </div>

        <Analytics />
      </div>
    </ThemeContext.Provider>
  )
}
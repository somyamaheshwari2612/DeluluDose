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

const floatingIcons = [
  { icon: "⭐", x: "10%", delay: 0 },
  { icon: "🌙", x: "80%", delay: 0.4 },
  { icon: "💫", x: "25%", delay: 0.8 },
  { icon: "⚡", x: "65%", delay: 0.2 },
  { icon: "🔮", x: "90%", delay: 1 },
  { icon: "✦",  x: "45%", delay: 0.6 },
  { icon: "✨", x: "50%", delay: 1.2 },
]

const RETURNING_MESSAGES = [
  "You were here last time. Ready to go deeper? ✦",
  "Welcome back. Time to explore beyond this. 💜",
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

// Build initial deck — affirmations[0] locked first on first ever visit
function buildInitialDeck() {
  const isFirstEver = !localStorage.getItem("deluludose-visited")
  if (isFirstEver) {
    localStorage.setItem("deluludose-visited", "true")
    return [affirmations[0], ...shuffle(affirmations.slice(1))]
  }
  // Returning user — fully shuffle everything
  return shuffle(affirmations)
}

// Load persisted deck or build fresh one
function loadDeck() {
  try {
    const saved = localStorage.getItem("deluludose-deck")
    const pointer = parseInt(localStorage.getItem("deluludose-pointer") || "0")
    if (saved) {
      const deck = JSON.parse(saved)
      // Validate deck has same length as affirmations (in case new ones were added)
      if (deck.length === affirmations.length) {
        return { deck, pointer }
      }
    }
  } catch {}
  const deck = buildInitialDeck()
  return { deck, pointer: 0 }
}

function saveDeck(deck, pointer) {
  localStorage.setItem("deluludose-deck", JSON.stringify(deck))
  localStorage.setItem("deluludose-pointer", pointer.toString())
}

const names = ["SM 💜", "Somya 💜", "SaMi 💜"]

function FlippingName() {
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
      className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent font-semibold"
    >
      {names[index]}
    </motion.span>
  )
}

export default function App() {
  function handleAIShare(text) {
  const url = window.location.href
  if (navigator.share) {
    navigator.share({ text: `✨ ${text}\n\n— DeluluDose`, url })
      .catch(() => {})
  } else {
    const encoded = encodeURIComponent(`✨ ${text}\n\n— DeluluDose\n${url}`)
    window.open(`https://wa.me/?text=${encoded}`, "_blank")
  }
}

async function handleAISaveImage(text) {
  // Temporarily swap current for AI quote, capture, then restore
  const original = current
  setCurrent({ ...current, text, category: "ai-crafted" })
  await new Promise((r) => setTimeout(r, 100))
  await handleSaveImage()
  setCurrent(original)
}
  // Load persisted deck on mount
  const { deck: initialDeck, pointer: initialPointer } = loadDeck()

  const deckRef = useRef(initialDeck)
  const pointerRef = useRef(initialPointer)
  const templateRef = useRef(null)

  const isReturning = !!localStorage.getItem("deluludose-visited")
  const [showReturningMsg, setShowReturningMsg] = useState(isReturning)

  // Start from where we left off
  const [current, setCurrent] = useState(
    initialDeck[initialPointer] || affirmations[0]
  )
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { recentMoods, addMood } = useMoods()
  const { streak, isNewDay } = useStreak()

  // Hide returning message after 4 seconds
  useEffect(() => {
    if (showReturningMsg) {
      const t = setTimeout(() => setShowReturningMsg(false), 4000)
      return () => clearTimeout(t)
    }
  }, [])

  const handleNewAffirmation = useCallback(() => {
    if (isLoading) return
    setIsLoading(true)
    setTimeout(() => {
      let pointer = pointerRef.current + 1

      // Full cycle done — reshuffle
      if (pointer >= deckRef.current.length) {
        deckRef.current = shuffle(affirmations)
        pointer = 0
      }

      const next = deckRef.current[pointer]
      pointerRef.current = pointer

      // Persist so next session continues from here
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
      try {
        await navigator.share({ text, url })
      } catch (err) {}
    } else {
      const encoded = encodeURIComponent(`${text}\n${url}`)
      window.open(`https://wa.me/?text=${encoded}`, "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0a14] flex flex-col items-center justify-center px-4 py-12 overflow-hidden relative">

      {floatingIcons.map(({ icon, x, delay }, i) => (
        <motion.span
          key={i}
          className="absolute text-xl select-none pointer-events-none opacity-30"
          style={{ left: x, top: "10%" }}
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay }}
        >
          {icon}
        </motion.span>
      ))}

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent mb-2"
      >
        DeluluDose
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-purple-400/60 text-sm mb-4 tracking-widest uppercase"
      >
        your daily reality check ✦
      </motion.p>

      <StreakDisplay streak={streak} isNewDay={isNewDay} position="top" />

      {/* Returning user message */}
      <AnimatePresence>
        {showReturningMsg && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="text-xs text-purple-400/50 tracking-wide italic mb-6 text-center"
          >
            {getDailyReturningMessage()}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Spacer when message is gone */}
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

      {/* Action buttons row */}
      <div className="mt-4 flex items-center gap-5">
        <motion.button
          onClick={handleShareLink}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-sm text-purple-400/70 hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          🔗 Share
        </motion.button>
        <span className="text-purple-800">|</span>
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-sm text-purple-400/70 hover:text-purple-300 transition-colors cursor-pointer"
        >
          {copied ? "✅ Copied!" : "📋 Copy"}
        </motion.button>
        <span className="text-purple-800">|</span>
        <motion.button
          onClick={handleSaveImage}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-sm text-purple-400/70 hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1.5"
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
        className="mt-16 text-xs text-purple-400/40 tracking-wide text-center"
      >
        Made with Delusion & Determination by{" "}
        <FlippingName />
      </motion.p>
      <Analytics />
    </div>
  )
}
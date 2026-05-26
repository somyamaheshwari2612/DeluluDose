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
import QuoteOfTheDay from "./components/QuoteOfTheDay"
import MoodCalendar from "./components/MoodCalendar"
import RoastOrToast from "./components/RoastOrToast"
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

// Derived from affirmations — auto-updates if new categories added later
const allCategories = [...new Set(affirmations.map(a => a.category))]

function getSavedCategories() {
  try {
    // Migration key — wipes old format data once
    if (!localStorage.getItem("deluludose-cat-v2")) {
      localStorage.removeItem("deluludose-categories")
      localStorage.setItem("deluludose-cat-v2", "true")
    }
    const saved = localStorage.getItem("deluludose-categories")
    if (saved) {
      const parsed = JSON.parse(saved)
      const valid = parsed.filter(c => allCategories.includes(c))
      if (valid.length > 0) return valid
    }
  } catch {}
  return [...allCategories] // default: all included
}

function buildInitialDeck() {
  const isFirstEver = !localStorage.getItem("deluludose-visited")
  if (isFirstEver) {
    localStorage.setItem("deluludose-visited", "true")
    return [affirmations[0], ...shuffle(affirmations.slice(1))]
  }
  return shuffle(affirmations)
}

function loadDeck(categories) {
  const isAll = categories.length === 0 || categories.length === allCategories.length
  const source = isAll ? affirmations : affirmations.filter(a => categories.includes(a.category))

  try {
    const saved = localStorage.getItem("deluludose-deck")
    const pointer = parseInt(localStorage.getItem("deluludose-pointer") || "0")
    if (saved) {
      const deck = JSON.parse(saved)
      if (deck.length === source.length) return { deck, pointer }
    }
  } catch {}

  // Only buildInitialDeck when showing all — preserves first-visit fixed quote
  const deck = isAll ? buildInitialDeck() : shuffle(source)
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
  const savedCategories = getSavedCategories()
  const [selectedCategories, setSelectedCategories] = useState(savedCategories)
  const [isFilteredDeckExhausted, setIsFilteredDeckExhausted] = useState(false)
  const isFiltered = selectedCategories.length < allCategories.length

  const { deck: initialDeck, pointer: initialPointer } = loadDeck(savedCategories)
  const deckRef = useRef(initialDeck)
  const pointerRef = useRef(initialPointer)
  const templateRef = useRef(null)

  const isReturning = !!localStorage.getItem("deluludose-visited")
  const [showReturningMsg, setShowReturningMsg] = useState(isReturning)
  const [current, setCurrent] = useState(initialDeck[initialPointer] || affirmations[0])
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { recentMoods, addMood, moodHistory } = useMoods()
  const { streak, isNewDay } = useStreak()

  useEffect(() => {
    if (showReturningMsg) {
      const t = setTimeout(() => setShowReturningMsg(false), 4000)
      return () => clearTimeout(t)
    }
  }, [showReturningMsg])

  function rebuildDeckForCategories(categories) {
    const newDeck = categories.length === 0
      ? shuffle(affirmations)
      : shuffle(affirmations.filter(a => categories.includes(a.category)))
    deckRef.current = newDeck
    pointerRef.current = 0
    saveDeck(newDeck, 0)
    localStorage.setItem("deluludose-categories", JSON.stringify(categories))
  } // <--- Added missing bracket here to close rebuildDeckForCategories

 function handleCategoryToggle(category) {
  setSelectedCategories(prev => {
    if (prev.length === 1 && prev.includes(category)) return prev // min 1 always active
    const next = prev.includes(category)
      ? prev.filter(c => c !== category) // remove = exclude
      : [...prev, category]              // add back = include
    rebuildDeckForCategories(next)
    return next
  })
  setIsFilteredDeckExhausted(false)
}

  function handleGoRandom() {
  setSelectedCategories([...allCategories]) // all back = no filter
  rebuildDeckForCategories([...allCategories])
  setIsFilteredDeckExhausted(false)
}
  function handleRereadFiltered() {
    rebuildDeckForCategories(selectedCategories)
    setIsFilteredDeckExhausted(false)
  }

  const handleNewAffirmation = useCallback(() => {
    if (isLoading || isFilteredDeckExhausted) return
    setIsLoading(true)
    setTimeout(() => {
      let pointer = pointerRef.current + 1
      if (pointer >= deckRef.current.length) {
        if (isFiltered) {
          setIsFilteredDeckExhausted(true)
          setIsLoading(false)
          return
        }
        deckRef.current = shuffle(affirmations)
        pointer = 0
      }
      const next = deckRef.current[pointer]
      pointerRef.current = pointer
      saveDeck(deckRef.current, pointer)
      setCurrent(next)
      setIsLoading(false)
    }, 500)
  }, [isLoading, isFiltered, isFilteredDeckExhausted])

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

  async function handleQOTDSaveImage(quote) {
  const original = current
  setCurrent({ ...current, text: quote.text, category: quote.category })
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
          ✦ your daily reality check ✦
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

          {!showReturningMsg && <div className="mb-4" />}
          <QuoteOfTheDay onSaveImage={handleQOTDSaveImage} />

          <AffirmationCard
            affirmation={current}
            isFavorite={isFavorite(current.id)}
            onToggleFavorite={toggleFavorite}
            allCategories={allCategories}
            selectedCategories={selectedCategories}
            onToggleCategory={handleCategoryToggle}
            onGoRandom={handleGoRandom}
            isFiltered={isFiltered}
          />

          <AnimatePresence>
            {isFilteredDeckExhausted && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className={`max-w-xl w-full mt-4 rounded-2xl p-5 text-center ${
                  isDark
                    ? "bg-[#1a1025] border border-purple-800/40"
                    : "bg-sky-900/30 border border-sky-500/30"
                }`}
              >
                <p className={`text-sm font-semibold mb-3 ${
                  isDark ? "text-purple-200" : "text-sky-200"
                }`}>
                  ✦ you've seen all doses in these categories!
                </p>
                <div className="flex gap-3 justify-center">
                  <motion.button
                    onClick={handleRereadFiltered}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                      isDark
                        ? "bg-purple-800 hover:bg-purple-700 text-purple-100"
                        : "bg-sky-700 hover:bg-sky-600 text-sky-100"
                    }`}
                  >
                    🔁 Re-read these
                  </motion.button>
                  <motion.button
                    onClick={handleGoRandom}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors border ${
                      isDark
                        ? "bg-fuchsia-900/50 hover:bg-fuchsia-900 text-fuchsia-200 border-fuchsia-700/40"
                        : "bg-cyan-900/50 hover:bg-cyan-900 text-cyan-200 border-cyan-600/40"
                    }`}
                  >
                    🎲 Go random
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
          <AIDoseGenerator
            onShare={handleAIShare}
            onSaveImage={handleAISaveImage}
          />
          <RoastOrToast />
          <QuoteImageTemplate affirmation={current} templateRef={templateRef} />

          <FavoritesList favorites={favorites} onRemove={toggleFavorite} />
          <MoodCalendar moodHistory={moodHistory} />
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

        <Analytics mode="production" />
      </div>
    </ThemeContext.Provider>
  )
}
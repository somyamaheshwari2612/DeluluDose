import { useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import affirmations from "./data/affirmations"
import { useFavorites } from "./hooks/useFavorites"
import AffirmationCard from "./components/AffirmationCard"
import FunkyButton from "./components/FunkyButton"
import FavoritesList from "./components/FavoritesList"

const floatingIcons = [
  { icon: "⭐", x: "10%", delay: 0 },
  { icon: "🌙", x: "80%", delay: 0.4 },
  { icon: "💫", x: "25%", delay: 0.8 },
  { icon: "⚡", x: "65%", delay: 0.2 },
  { icon: "🔮", x: "90%", delay: 1 },
  { icon: "✦",  x: "45%", delay: 0.6 },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const [current, setCurrent] = useState(affirmations[0])
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { favorites, toggleFavorite, isFavorite } = useFavorites()

  // Shuffled deck and pointer — both live in refs
  const deckRef = useRef(shuffle(affirmations))
  const pointerRef = useRef(0)

  // Skip index 0 since that's the initial card shown
  // Find where affirmations[0] landed and start after it
  useState(() => {
    const startIdx = deckRef.current.findIndex((a) => a.id === affirmations[0].id)
    pointerRef.current = (startIdx + 1) % deckRef.current.length
  })

  const handleNewAffirmation = useCallback(() => {
    if (isLoading) return
    setIsLoading(true)

    setTimeout(() => {
      // If we've gone through the whole deck, reshuffle
      if (pointerRef.current >= deckRef.current.length) {
        deckRef.current = shuffle(affirmations)
        pointerRef.current = 0
      }

      const next = deckRef.current[pointerRef.current]
      pointerRef.current += 1
      setCurrent(next)
      setIsLoading(false)
    }, 500)
  }, [isLoading])

  function handleCopy() {
    navigator.clipboard.writeText(current.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }


  return (
    <div className="min-h-screen bg-[#0d0a14] flex flex-col items-center justify-center px-4 py-12 overflow-hidden relative">

      {/* Floating bouncing icons */}
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

      {/* App name */}
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
        className="text-purple-400/60 text-sm mb-10 tracking-widest uppercase"
      >
        your daily reality check ✦
      </motion.p>

      {/* Card */}
      <AffirmationCard
        affirmation={current}
        isFavorite={isFavorite(current.id)}
        onToggleFavorite={toggleFavorite}
      />

      {/* Copy button */}
      <motion.button
        onClick={handleCopy}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-4 text-sm text-purple-400/70 hover:text-purple-300 transition-colors cursor-pointer"
      >
        {copied ? "✅ Copied!" : "📋 Copy quote"}
      </motion.button>

      {/* Funky Button */}
      <FunkyButton onClick={handleNewAffirmation} isLoading={isLoading} />

      {/* Favorites */}
      <FavoritesList favorites={favorites} onRemove={toggleFavorite} />
       {/* Footer */}
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="mt-16 text-xs text-purple-400/40 tracking-wide text-center"
    >
      Made with Delusion & Determination by{" "}
      <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent font-semibold">
        SM
      </span>{" "}
      💜
    </motion.p>
    </div>
  )
}
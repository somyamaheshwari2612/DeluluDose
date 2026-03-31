import { useState, useEffect } from "react"

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    // Load from localStorage on first render
    const saved = localStorage.getItem("affirmation-favorites")
    return saved ? JSON.parse(saved) : []
  })

  // Sync to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem("affirmation-favorites", JSON.stringify(favorites))
  }, [favorites])

  function toggleFavorite(affirmation) {
    setFavorites((prev) => {
      const exists = prev.find((item) => item.id === affirmation.id)
      if (exists) {
        return prev.filter((item) => item.id !== affirmation.id)
      }
      return [...prev, affirmation]
    })
  }

  function isFavorite(id) {
    return favorites.some((item) => item.id === id)
  }

  return { favorites, toggleFavorite, isFavorite }
}
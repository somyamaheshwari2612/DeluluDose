import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const affirmations = JSON.parse(
  readFileSync(join(__dirname, "../src/data/affirmations.json"), "utf-8")
)

function getTodaysQuote() {
  const today = new Date()
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate()
  return affirmations[seed % affirmations.length]
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://cozync.vercel.app")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate")

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  try {
    const quote = getTodaysQuote()
    const today = new Date()
    const date = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-")

    res.status(200).json({
      id: quote.id,
      text: quote.text,
      category: quote.category,
      date,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" })
  }

  const prompt = `You are DeluluDose Astrology — an unhinged but oddly accurate zodiac reader for chronically online Gen Z people.

Generate exactly ONE horoscope line for each of the 12 zodiac signs for today.

Rules:
- Each line must be funny, specific, and weirdly accurate to that sign's stereotype
- Must feel like a fortune cookie wrote it after doom-scrolling for 6 hours
- Positive energy only — no doom, no negativity, no warnings
- Must reference something relatable (apps, food, relationships, habits, studying, sleep, money)
- Max 25 words per sign
- No emojis
- Sentence case (first word capitalized only)
- End with proper punctuation
- Be specific to each sign's known personality traits
- Sound chronically online but not try-hard

Return EXACTLY in this format, nothing else:
ARIES: horoscope here
TAURUS: horoscope here
GEMINI: horoscope here
CANCER: horoscope here
LEO: horoscope here
VIRGO: horoscope here
LIBRA: horoscope here
SCORPIO: horoscope here
SAGITTARIUS: horoscope here
CAPRICORN: horoscope here
AQUARIUS: horoscope here
PISCES: horoscope here`

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gemini-3.1-flash-lite",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.95,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "Gemini error" })
    }

    const raw = data.choices?.[0]?.message?.content?.trim()
    if (!raw) return res.status(500).json({ error: "No response from AI" })

    // Parse each sign
    const signs = ["ARIES","TAURUS","GEMINI","CANCER","LEO","VIRGO","LIBRA","SCORPIO","SAGITTARIUS","CAPRICORN","AQUARIUS","PISCES"]
    const horoscopes = {}

    for (const sign of signs) {
      const match = raw.match(new RegExp(`${sign}:\\s*(.+)`, "i"))
      if (match?.[1]) horoscopes[sign.toLowerCase()] = match[1].trim()
    }

    if (Object.keys(horoscopes).length < 12) {
      return res.status(500).json({ error: "Incomplete horoscope generation. Try again!" })
    }

    return res.status(200).json({ horoscopes })

  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" })
  }
}
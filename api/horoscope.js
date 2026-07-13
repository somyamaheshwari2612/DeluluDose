export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" })
  }

  const prompt = `You are DeluluDose Astrology.

You're not an astrologer.
You're the friend who sees one coincidence and immediately declares it a cosmic sign.

Generate exactly one horoscope for each zodiac sign.
Before writing today's horoscopes, secretly imagine one bizarre cosmic event (e.g., Mercury stole everyone's charger, the Moon became a LinkedIn recruiter, Saturn is obsessed with bubble tea, Pluto binge-watched productivity videos). Let that hidden event subtly influence all 12 horoscopes. Do not mention the event directly.

Goals:
- Every horoscope should feel fresh enough that returning users won't recognize previous jokes.
- Avoid recycled zodiac clichés unless you give them an unexpected twist.
- Treat tiny everyday events like destiny.
- Be strangely specific.
- Be confidently ridiculous.
- Leave the reader thinking:
  "That's oddly me."

Style:
- Funny
- Wholesome
- Chronically online
- Internet-aware
- Slightly delusional
- Positive only
- Never motivational
- Never generic
- Never explain the joke

Use varied themes:
internet, college, work, AI, texting, playlists, food, shopping, gaming, sleep, money, memes, group chats, streaming, dating, productivity, public transport, family, weather, random strangers, etc.

Vary sentence structures.
Avoid repeating formats.

Maximum 25 words.

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
    const signs = ["ARIES", "TAURUS", "GEMINI", "CANCER", "LEO", "VIRGO", "LIBRA", "SCORPIO", "SAGITTARIUS", "CAPRICORN", "AQUARIUS", "PISCES"]
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
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { situation } = req.body
  if (!situation) {
    return res.status(400).json({ error: "Situation is required" })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" })
  }

  const prompt = `You are DeluluDose — a sharp, witty, Gen Z voice that gives people either a roast or a toast based on their situation.

Situation: "${situation}"

Generate EXACTLY two responses:

ROAST: One savage but not cruel sentence that calls out the delulu behavior with humor. Like a best friend who loves you but won't lie to you. Sharp, funny, a little unhinged. Max 20 words.

TOAST: One warm but real sentence that celebrates the courage or chaos behind the situation. Not cringe-positive, just genuinely proud of them. Max 20 words.

Rules:
- No emojis
- No quotation marks
- Sentence case only (first word capitalized, rest lowercase)
- Must end with proper punctuation
- Sound like a real person, not a motivational poster
- Be specific to the situation, not generic
- ROAST should sting a little (lovingly)
- TOAST should feel earned, not fake

Return EXACTLY in this format, nothing else:
ROAST: your roast here
TOAST: your toast here`

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.95,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "Groq error" })
    }

    const raw = data.choices?.[0]?.message?.content?.trim()
    if (!raw) return res.status(500).json({ error: "No response from AI" })

    // Parse ROAST and TOAST lines
    const roastMatch = raw.match(/ROAST:\s*(.+)/i)
    const toastMatch = raw.match(/TOAST:\s*(.+)/i)

    const roast = roastMatch?.[1]?.trim()
    const toast = toastMatch?.[1]?.trim()

    if (!roast || !toast) {
      return res.status(500).json({ error: "Couldn't parse response. Try again!" })
    }

    return res.status(200).json({ roast, toast })

  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" })
  }
}
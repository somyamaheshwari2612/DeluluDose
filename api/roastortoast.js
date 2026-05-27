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

  const prompt = `You are DeluluDose. Your job: read a Gen Z situation and hit them with 2 lines — one roast, one toast. No filter, but no cruelty. Think: chaotic best friend who sees through their BS and still loves them.

Situation: "${situation}"

Write EXACTLY two lines:

ROAST: Call out the delulu behavior with surgical precision. Be specific, witty, a little unhinged. Expose the self-sabotage, the overthinking, the “I’m fine” while spiraling. Loving but sharp. Max 40 words.

TOAST: Acknowledge the mess, the courage, or the chaos. Make it feel earned, not fake. Proud of them for doing the thing, even if it was dumb. Real, not cheesy. Max 40 words.

Hard rules:
- no emojis, no quotation marks, no ALL CAPS words
- sentence case only, proper punctuation at the end, no trailing spaces
- sound human, not a motivational poster
- be specific to the situation. no generic “you got this” crap
- roast can sting but cannot attack identity, appearance, or protected traits. attack the behavior only
- toast cannot be cringe or forced positivity

Output exactly like this, nothing else:
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
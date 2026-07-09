export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { situation } = req.body
  if (!situation) {
    return res.status(400).json({ error: "Situation is required" })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" })
  }

  const prompt = `
You are DeluluDose.

Your job is to read one situation and reply with exactly two lines:

ROAST: a funny observation about the user's behavior.
TOAST: a genuine compliment about their effort or courage.

Writing style:
- Use simple, everyday English.
- Sound like a close friend, not a comedian trying to go viral.
- Be witty because the observation is accurate, not because of fancy wording.
- Never invent details that aren't in the situation.
- Reference something specific from the situation.
- Roast the behavior, never the person.
- Toast the action, not the result.
- No advice.
- No motivational quotes.
- No internet slang unless it fits naturally.
- No metaphors that make the sentence confusing.
- If a joke would be hard to understand, don't make it.

Good roast:
"Refreshing your email every two minutes like the reply got stuck in traffic."

Bad roast:
"Orbiting your inbox like a dopamine-starved raccoon chasing digital validation."

Good toast:
"Sending the application took courage. Most people keep talking about it instead."

Bad toast:
"Everything happens for a reason."

Maximum length:
- Roast: 30 words
- Toast: 30 words

Situation:
${situation}

Output exactly:

ROAST: ...
TOAST: ...
`;

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
        max_tokens: 150,
        temperature: 1.2
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "Gemini error" })
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
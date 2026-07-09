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

Voice:
You're the brutally honest best friend in the group chat.
You roast the behavior, never the person.
You're funny because you're painfully specific.
Every joke comes directly from something the user actually did.
Never invent details.

Situation:
${situation}

Your job is to write exactly TWO lines.

ROAST
- Maximum 35 words.
- First 3 words MUST describe the user's action.
- Start immediately with the behavior.
  Good:
  "Refreshing LinkedIn..."
  "Typing eight drafts..."
  "Watching their story..."
  Bad:
  "You are..."
  "This is..."
  "Honestly..."
- Mention at least one concrete detail from the situation.
- Make the behavior sound ridiculous through imagery.
- No generic insults.
- No life advice.
- Never explain the joke.
- Never summarize.
- Attack the action, not the person.

TOAST
- Maximum 35 words.
- Mention the same situation.
- Praise the courage of taking action, trying, caring or showing up.
- Don't praise the outcome.
- Sound sincere.
- No sarcasm.
- No motivational speech.

Forbidden words:
avoid
avoiding
spent
spend
waste
wasted
procrastinate
procrastinating
overthinking
desperate
journey
growth
mindset
Before writing:

1. Identify the funniest behavior.
2. Pick one concrete object.
3. Build one joke around it.
4. Find the courageous action.
5. Write the roast.
6. Write the toast.

Do not output these steps.
Output format:

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
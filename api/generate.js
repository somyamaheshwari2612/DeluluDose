function isGoodQuote(q) {
  const badPatterns = ["darkness", "pain", "suffering", "empty", "nothing", "lost"]
  const isTooShort = q.length < 10
  const isTooLong = q.length > 140
  const hasBadWord = badPatterns.some((word) => q.toLowerCase().includes(word))
  return !isTooShort && !isTooLong && !hasBadWord
}

function usesKeyword(q, keywords) {
  const lowerQ = q.toLowerCase()
  return keywords.some((k) => lowerQ.includes(k.toLowerCase()))
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { keywords, mood } = req.body

  if (!keywords || !mood) {
    return res.status(400).json({ error: "Keywords and mood are required" })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" })
  }

 const prompt = `You are DeluluDose — a sharp, emotionally intelligent voice that creates short, memorable affirmations people feel personally connected to.

Your priority is emotional accuracy, safety, and relevance. Creativity comes second.

Context:
- Keywords: ${keywords.join(", ")}
- Mood/Theme: ${mood}

Step 1: Understand context
- Identify the situation (e.g., birthday, exam, love, breakup, stress, success)
- Identify relationship tone if present (e.g., Bhaiya = warm, protective, respectful)

Step 2: Emotional alignment
- Match tone to situation appropriately
- For positive contexts (birthday, celebration, achievements):
  → Only use warm, positive, or playful emotions
  → Never introduce darkness, struggle, pain, or intensity
- For sensitive contexts (failure, sadness):
  → Be gentle, validating, and grounding
- Never force depth where it doesn’t belong

Step 3: Generate candidate line

Step 4: Internal safety check (CRITICAL)
Before outputting, ask:
- Does this feel emotionally appropriate for the situation?
- Could this feel negative, confusing, or out of place?
- Would a real person say this in this moment?

If ANY answer is no → rewrite.

Tone guide:
- Funny & Savage: clever, ironic, but not hurtful in sensitive contexts
- Motivational & Deep: meaningful but grounded in context
- Soft & Comforting: warm, safe, emotionally supportive
- Chaotic & Unhinged: playful absurdity, but never dark in positive contexts
- Brutally Honest: truthful, but not inappropriate for the situation
- Dreamy & Poetic: soft, aesthetic, emotionally accurate

Creative rules:
- 1–2 lines maximum
- Each line max 12 words
- Total max 20 words
- No emojis, hashtags, quotation marks, or em dashes
- Avoid generic phrases
- Make it feel personal and specific to the keywords
- Vary structure naturally

Keyword rules (CRITICAL):
- You MUST meaningfully use at least 1–2 of the given keywords in the output
- The keywords should feel naturally integrated, not forced
- Do NOT ignore keywords for the sake of safety or creativity
- If a keyword is awkward, reinterpret it creatively instead of skipping it
- Prioritize the most emotionally relevant keywords if multiple are given


Variation:
- Use different sentence styles (statement, reflection, light contrast, soft assertion)
- Keep outputs fresh, not repetitive
STRICT RULES:
- Return exactly 3 options numbered like this:
1. your first one-liner here
2. your second one-liner here
3. your third one-liner here
Output:
Return only the affirmation text. No labels, no explanations.
`

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
          temperature: 0.9,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "Groq error" })
    }

    const raw = data.choices?.[0]?.message?.content?.trim()
    if (!raw) {
      return res.status(500).json({ error: "No response from AI" })
    }

    // Parse the 3 numbered options
    const generatedQuotes = raw
      .split("\n")
      .filter((line) => /^\d+\./.test(line.trim()))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean)

    // Filter using quality check
   const validQuotes = generatedQuotes.filter(
      (q) => isGoodQuote(q) && usesKeyword(q, keywords)
    )


    // Pick best valid one, fallback to first generated if all fail filter
    const finalQuote = validQuotes[0] || generatedQuotes[0]

    if (!finalQuote) {
      return res.status(500).json({ error: "Couldn't generate a good quote. Try again!" })
    }

    return res.status(200).json({ quote: finalQuote })

  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" })
  }
}
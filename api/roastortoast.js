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

ROAST: ROAST: Call out the delulu behavior with surgical precision. Reference at least one specific detail from the situation. Use vivid, concrete images like “rehearsing in notes app” not “deleting texts”. Be witty, a little unhinged. Loving but sharp. Ban the words: avoid, spend, waste, procrastinate. Max 40 words.
Roast Rules:
- roast must show, not label. ban words like “form of”, “level of”, “new low”, “brutal”
- start with the specific action + a sharp verb: “nuked 12 drafts”, “loitered on their story”, “scrubbed baseboards”
- example: “nuked 12 drafts in notes then loitered on their story like that counts as a reply”

TOAST: Acknowledge the mess, the courage, or the chaos. Make it feel earned, not fake. Proud of them for doing the thing, even if it was dumb. Real, not cheesy. Max 40 words.
Toast Rules:
- toast must be earnest, not sarcastic. ban “i’m impressed”, “even if”, “at least”. 
- celebrate the action, not the outcome. if they posted and got ignored, toast the posting, not the result
- example: “posting a vague story took guts, most people rot in silence and you tried to be seen”
EXAMPLE:
Input: "i told myself i’d wake up at 6am for a week, hit snooze till 10am every day"
ROAST: you set an alarm like it’s a suggestion box and then negotiated with yourself into sleeping through your own plan
TOAST: wanting to change your routine means you’re not fully numb, that’s more than most people can say
Hard rules:
- never copy or rephrase the examples in the prompt. generate fresh lines specific to the input
- no emojis, no quotation marks, no ALL CAPS words
- sentence case only, proper punctuation at the end, no trailing spaces
- sound human, not a motivational poster
- be specific to the situation. no generic “you got this” crap
- roast can sting but cannot attack identity, appearance, or protected traits. attack the behavior only
- toast cannot be cringe or forced positivity
- must reference at least 1 specific detail from the situation. no generic “you’re avoiding” or “you spent hours” 
- use vivid, concrete images. “rehearsing in notes app” > “deleting texts”. “scrubbing baseboards at 2am” > “cleaning”
- ban these lazy words: avoid, spend, waste, procrastinate. make it sound like a group chat, not a therapist
- start the roast with the behavior itself, not “you’re” or “is a new level of”. jump straight in: “rehearsing 12 drafts in notes app” not “rehearsing in notes app is…”
- use verbs that sting: nuke, loiter, spiral, bait, ghost, rot, delude. not “overthinking” or “desperate”
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
        temperature: 1.0,
        presence_penalty: 0.6,  // forces model to avoid repeating safe words like “level”, “new”, “pretty”
        top_p: 0.9              // keeps it from going completely off the rails
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
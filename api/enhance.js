export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, mode } = req.body;

  let instruction = "";
  if (mode === "professional") instruction = "Rewrite this text in a professional tone:";
  if (mode === "human") instruction = "Rewrite this text to sound more natural and human:";
  if (mode === "simple") instruction = "Simplify this text:";
  if (mode === "grammar") instruction = "Fix grammar and clarity:";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You improve writing." },
          { role: "user", content: instruction + "\n\n" + text }
        ]
      })
    });

    const data = await response.json();
    res.status(200).json({ result: data.choices[0].message.content });

  } catch (err) {
    res.status(500).json({ error: "AI request failed" });
  }
}

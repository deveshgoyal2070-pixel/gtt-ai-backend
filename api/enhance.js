export default async function handler(req, res) {
  // ✅ CORS HEADERS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight request handle
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, mode } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text missing" });
    }

    let instruction = "Improve this text:";
    if (mode === "professional") instruction = "Rewrite this text in a professional tone:";
    if (mode === "human") instruction = "Rewrite this text to sound natural and human:";
    if (mode === "simple") instruction = "Simplify this text:";
    if (mode === "grammar") instruction = "Fix grammar and improve clarity:";

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: "You are a helpful writing assistant." },
            { role: "user", content: instruction + "\n\n" + text }
          ],
          temperature: 0.7
        })
      }
    );

    const data = await groqResponse.json();

    return res.status(200).json({
      result: data.choices?.[0]?.message?.content || "AI error"
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server crashed",
      details: error.message
    });
  }
}

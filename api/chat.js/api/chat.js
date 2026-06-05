export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { message, history } = req.body;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: "당신은 자비스(JARVIS) AI 비서입니다. 아이언맨의 자비스처럼 친절하고 유능하며 간결하게 3문장 이내로 한국어로 답합니다.",
      messages: [...(history || []), { role: "user", content: message }]
    })
  });
  const data = await response.json();
  res.status(200).json({ reply: data.content[0].text });
}

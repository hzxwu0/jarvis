export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const { message, history, lat, lon } = req.body;
    let weatherInfo = "";
    if (lat && lon && process.env.OPENWEATHER_API_KEY) {
      try {
        const wRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&lang=kr&units=metric`);
        const wData = await wRes.json();
        if (wData.main) {
          weatherInfo = `\n\n[현재 날씨] ${wData.weather[0].description}, 기온 ${wData.main.temp.toFixed(1)}도, 체감 ${wData.main.feels_like.toFixed(1)}도, 습도 ${wData.main.humidity}%`;
        }
      } catch(e) {}
    }
    const system = `당신은 자비스(JARVIS)라는 이름의 AI 비서입니다. 아이언맨의 자비스처럼 주인님께 친절하고 유능하며 간결하게 대답합니다. 대답은 3문장 이내로 짧고 명확하게 합니다. 한국어로 대화합니다.${weatherInfo}`;
    const cleanHistory = (history || []).filter(m => m && m.role && m.content && String(m.content).trim());
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 512, system, messages: [...cleanHistory, { role: "user", content: message }] })
    });
    const data = await response.json();
    if (!data.content || !data.content[0]) return res.status(500).json({ reply: "API 오류: " + JSON.stringify(data) });
    res.status(200).json({ reply: data.content[0].text });
  } catch(e) {
    res.status(500).json({ reply: "서버 오류: " + e.message });
  }
}

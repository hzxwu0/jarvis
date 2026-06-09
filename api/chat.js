export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { message, history, lat, lon } = req.body;

    // 날씨 정보 (현재 + 5일 예보)
    let weatherInfo = "";
    if (lat && lon && process.env.OPENWEATHER_API_KEY) {
      try {
        const [curRes, forecastRes] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&lang=kr&units=metric`),
          fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&lang=kr&units=metric&cnt=40`)
        ]);
        const cur = await curRes.json();
        const forecast = await forecastRes.json();

        if (cur.main) {
          weatherInfo = `\n\n[현재 날씨] ${cur.weather[0].description}, 기온 ${cur.main.temp.toFixed(1)}도, 체감 ${cur.main.feels_like.toFixed(1)}도, 습도 ${cur.main.humidity}%`;
        }

        if (forecast.list) {
          // 날짜별로 그룹화
          const days = {};
          forecast.list.forEach(item => {
            const date = item.dt_txt.split(' ')[0];
            if (!days[date]) days[date] = [];
            days[date].push(item);
          });

          const today = new Date().toISOString().split('T')[0];
          let forecastText = "\n\n[날씨 예보]";
          Object.keys(days).slice(0, 5).forEach(date => {
            if (date === today) return;
            const dayData = days[date];
            const temps = dayData.map(d => d.main.temp);
            const minT = Math.min(...temps).toFixed(1);
            const maxT = Math.max(...temps).toFixed(1);
            const desc = dayData[Math.floor(dayData.length/2)].weather[0].description;
            const dateObj = new Date(date);
            const dayNames = ['일','월','화','수','목','금','토'];
            const dayName = dayNames[dateObj.getDay()];
            const month = dateObj.getMonth()+1;
            const day = dateObj.getDate();
            forecastText += `\n${month}/${day}(${dayName}): ${desc}, 최저 ${minT}도 최고 ${maxT}도`;
          });
          weatherInfo += forecastText;
        }
      } catch(e) {}
    }

    const system = `당신은 자비스(JARVIS)라는 이름의 AI 비서입니다. 아이언맨의 자비스처럼 주인님께 친절하고 유능하며 간결하게 대답합니다. 대답은 3문장 이내로 짧고 명확하게 합니다. 한국어로 대화합니다.

사용자가 특정 웹사이트나 앱을 열어달라고 하면 아래 형식으로 응답하세요:
[OPEN_URL:URL주소]
예: 유튜브 열어줘 → [OPEN_URL:https://youtube.com]
예: 구글 열어줘 → [OPEN_URL:https://google.com]
예: 네이버 열어줘 → [OPEN_URL:https://naver.com]
예: 인스타그램 열어줘 → [OPEN_URL:https://instagram.com]
예: 트위터 열어줘 → [OPEN_URL:https://twitter.com]
예: 카카오톡 열어줘 → [OPEN_URL:https://www.kakaocorp.com]
예: 지메일 열어줘 → [OPEN_URL:https://gmail.com]
URL을 열 때는 반드시 [OPEN_URL:...] 형식만 사용하세요.${weatherInfo}`;

    const cleanHistory = (history || []).filter(m => m && m.role && m.content && String(m.content).trim());

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 512,
        system,
        messages: [...cleanHistory, { role: "user", content: message }]
      })
    });

    const data = await response.json();
    if (!data.content || !data.content[0]) {
      return res.status(500).json({ reply: "API 오류: " + JSON.stringify(data) });
    }
    res.status(200).json({ reply: data.content[0].text });
  } catch(e) {
    res.status(500).json({ reply: "서버 오류: " + e.message });
  }
}

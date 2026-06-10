export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { message, history, lat, lon, action } = req.body;

    // 날씨 헬퍼
    async function getWeather() {
      if (!lat || !lon || !process.env.OPENWEATHER_API_KEY) return { current: "", forecast: "" };
      try {
        const [curRes, fcRes] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&lang=kr&units=metric`),
          fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&lang=kr&units=metric&cnt=40`)
        ]);
        const cur = await curRes.json();
        const fc = await fcRes.json();
        let current = "";
        let forecast = "";
        if (cur.main) {
          current = `현재 날씨: ${cur.weather[0].description}, 기온 ${cur.main.temp.toFixed(1)}도, 체감 ${cur.main.feels_like.toFixed(1)}도, 습도 ${cur.main.humidity}%`;
        }
        if (fc.list) {
          const days = {};
          fc.list.forEach(item => {
            const date = item.dt_txt.split(' ')[0];
            if (!days[date]) days[date] = [];
            days[date].push(item);
          });
          const today = new Date().toISOString().split('T')[0];
          const dayNames = ['일','월','화','수','목','금','토'];
          forecast = "날씨 예보:";
          Object.keys(days).slice(0,5).forEach(date => {
            if (date === today) return;
            const temps = days[date].map(d => d.main.temp);
            const desc = days[date][Math.floor(days[date].length/2)].weather[0].description;
            const dateObj = new Date(date);
            forecast += `\n${(dateObj.getMonth()+1)}/${dateObj.getDate()}(${dayNames[dateObj.getDay()]}): ${desc}, 최저 ${Math.min(...temps).toFixed(1)}도 최고 ${Math.max(...temps).toFixed(1)}도`;
          });
        }
        return { current, forecast };
      } catch(e) { return { current: "", forecast: "" }; }
    }

    // 실시간 뉴스 헬퍼
    async function getNews(query = "", category = "") {
      if (!process.env.NEWSDATA_API_KEY) return [];
      try {
        let url = `https://newsdata.io/api/1/latest?apikey=${process.env.NEWSDATA_API_KEY}&language=ko&size=5`;
        if (query) url += `&q=${encodeURIComponent(query)}`;
        if (category) url += `&category=${category}`;
        const r = await fetch(url);
        const d = await r.json();
        if (d.results) {
          return d.results.map(a => `• ${a.title} (${a.source_id})`);
        }
        return [];
      } catch(e) { return []; }
    }

    // 아침 브리핑
    if (action === "briefing") {
      const now = new Date();
      const dateStr = `${now.getMonth()+1}월 ${now.getDate()}일 ${['일','월','화','수','목','금','토'][now.getDay()]}요일`;
      let briefing = `좋은 아침입니다, 주인님. ${dateStr} 브리핑을 시작하겠습니다.\n\n`;

      // 날씨
      const { current, forecast } = await getWeather();
      if (current) briefing += `🌤 ${current}\n\n`;

      // 실시간 뉴스
      const [topNews, bizNews] = await Promise.all([
        getNews("", "top"),
        getNews("경제 주식 시장")
      ]);

      if (topNews.length > 0) {
        briefing += `📰 오늘의 주요 뉴스:\n${topNews.slice(0,4).join('\n')}\n\n`;
      }
      if (bizNews.length > 0) {
        briefing += `📈 경제/시장 뉴스:\n${bizNews.slice(0,3).join('\n')}`;
      }

      return res.status(200).json({ reply: briefing });
    }

    // 일반 대화용 날씨 컨텍스트
    const { current, forecast } = await getWeather();
    const weatherInfo = (current || forecast) ? `\n\n[날씨 정보]\n${current}\n${forecast}` : "";

    const system = `당신은 자비스(JARVIS)라는 이름의 AI 비서입니다. 아이언맨의 자비스처럼 주인님께 친절하고 유능하며 간결하게 대답합니다. 대답은 3문장 이내로 짧고 명확하게 합니다. 한국어로 대화합니다.

사용자가 특정 웹사이트나 앱을 열어달라고 하면 반드시 아래 형식으로만 응답하세요:
[OPEN_URL:URL주소]
예시: 유튜브→[OPEN_URL:https://youtube.com], 구글→[OPEN_URL:https://google.com], 네이버→[OPEN_URL:https://naver.com], 인스타그램→[OPEN_URL:https://instagram.com], 트위터→[OPEN_URL:https://twitter.com], 지메일→[OPEN_URL:https://gmail.com], 넷플릭스→[OPEN_URL:https://netflix.com], 쿠팡→[OPEN_URL:https://coupang.com], 카카오맵→[OPEN_URL:https://map.kakao.com], 카카오톡→[OPEN_URL:https://web.kakao.com]${weatherInfo}`;

    const cleanHistory = (history || []).filter(m => m && m.role && m.content && String(m.content).trim());

    // 뉴스 관련 질문이면 실시간 뉴스 추가
    let extraContext = "";
    const isNewsQuery = /뉴스|소식|최신|시장|주식|경제|날씨/.test(message);
    if (isNewsQuery && process.env.NEWSDATA_API_KEY) {
      const news = await getNews(message.replace(/뉴스|알려줘|보여줘/g, "").trim());
      if (news.length > 0) {
        extraContext = `\n\n[실시간 뉴스]\n${news.join('\n')}`;
      }
    }

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
        system: system + extraContext,
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

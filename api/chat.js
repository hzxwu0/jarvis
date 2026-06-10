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
        let current = "", forecast = "";
        if (cur.main) current = `현재 날씨: ${cur.weather[0].description}, 기온 ${cur.main.temp.toFixed(1)}도, 체감 ${cur.main.feels_like.toFixed(1)}도, 습도 ${cur.main.humidity}%`;
        if (fc.list) {
          const days = {};
          fc.list.forEach(item => { const d = item.dt_txt.split(' ')[0]; if (!days[d]) days[d] = []; days[d].push(item); });
          const today = new Date().toISOString().split('T')[0];
          const dn = ['일','월','화','수','목','금','토'];
          forecast = "날씨 예보:";
          Object.keys(days).slice(0,5).forEach(date => {
            if (date === today) return;
            const temps = days[date].map(d => d.main.temp);
            const desc = days[date][Math.floor(days[date].length/2)].weather[0].description;
            const d = new Date(date);
            forecast += `\n${d.getMonth()+1}/${d.getDate()}(${dn[d.getDay()]}): ${desc}, 최저 ${Math.min(...temps).toFixed(1)}도 최고 ${Math.max(...temps).toFixed(1)}도`;
          });
        }
        return { current, forecast };
      } catch(e) { return { current: "", forecast: "" }; }
    }

    // 실시간 뉴스 헬퍼
    async function getNews(query = "") {
      if (!process.env.NEWSDATA_API_KEY) return [];
      try {
        let url = `https://newsdata.io/api/1/latest?apikey=${process.env.NEWSDATA_API_KEY}&language=ko&size=5`;
        if (query) url += `&q=${encodeURIComponent(query)}`;
        const r = await fetch(url);
        const d = await r.json();
        if (d.status === "success" && d.results) return d.results.map(a => `• ${a.title}`);
        return [];
      } catch(e) { return []; }
    }

    // 아침 브리핑
    if (action === "briefing") {
      const now = new Date();
      const dn = ['일','월','화','수','목','금','토'];
      let briefing = `좋은 아침입니다, 주인님. ${now.getMonth()+1}월 ${now.getDate()}일 ${dn[now.getDay()]}요일 브리핑입니다.\n\n`;
      const { current } = await getWeather();
      if (current) briefing += `🌤 ${current}\n\n`;
      const [topNews, bizNews] = await Promise.all([getNews(""), getNews("경제 주식")]);
      if (topNews.length > 0) briefing += `📰 주요 뉴스:\n${topNews.slice(0,4).join('\n')}\n\n`;
      if (bizNews.length > 0) briefing += `📈 경제 뉴스:\n${bizNews.slice(0,3).join('\n')}`;
      return res.status(200).json({ reply: briefing });
    }

    // 뉴스 조회
    if (action === "news") {
      const keyword = req.body.keyword || "";
      const articles = await getNews(keyword);
      if (articles.length === 0) return res.status(200).json({ reply: "현재 뉴스를 가져올 수 없어요. 잠시 후 다시 시도해주세요." });
      const title = keyword ? `'${keyword}' 관련 최신 뉴스` : "최신 뉴스";
      return res.status(200).json({ reply: `${title}:\n\n${articles.join('\n')}` });
    }

    // 날씨 컨텍스트
    const { current, forecast } = await getWeather();
    const weatherInfo = (current || forecast) ? `\n\n[날씨 정보]\n${current}\n${forecast}` : "";

    // 뉴스 컨텍스트 (뉴스 관련 질문일 때)
    let newsContext = "";
    if (/뉴스|소식|최신|시장|주식|경제|오늘 뭐/.test(message)) {
      const articles = await getNews(message.replace(/뉴스|알려줘|보여줘|있어/g, "").trim());
      if (articles.length > 0) newsContext = `\n\n[실시간 뉴스]\n${articles.join('\n')}`;
    }

    const system = `당신은 자비스(JARVIS)라는 이름의 AI 비서입니다. 아이언맨의 자비스처럼 주인님께 친절하고 유능하며 간결하게 대답합니다. 대답은 3문장 이내로 짧고 명확하게 합니다. 한국어로 대화합니다.

웹사이트나 앱을 열어달라는 요청은 반드시 이 형식으로만 응답하세요:
[OPEN_URL:URL주소]
알려진 사이트: 유튜브→https://youtube.com, 구글→https://google.com, 네이버→https://naver.com, 인스타그램→https://instagram.com, 트위터/X→https://x.com, 지메일→https://gmail.com, 넷플릭스→https://netflix.com, 쿠팡→https://coupang.com, 카카오맵→https://map.kakao.com, 카카오톡→https://web.kakao.com, 틱톡→https://tiktok.com, 페이스북→https://facebook.com, 링크드인→https://linkedin.com, 깃허브→https://github.com, 왓챠→https://watcha.com, 웨이브→https://www.wavve.com, 멜론→https://www.melon.com, 스포티파이→https://spotify.com, 당근마켓→https://www.daangn.com, 배달의민족→https://www.baemin.com
모르는 사이트는 구글 검색으로 열어주세요: [OPEN_URL:https://www.google.com/search?q=사이트명]${weatherInfo}${newsContext}`;

    const cleanHistory = (history || []).filter(m => m && m.role && m.content && String(m.content).trim());
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 512, system, messages: [...cleanHistory, { role: "user", content: message }] })
    });
    const data = await response.json();
    if (!data.content?.[0]) return res.status(500).json({ reply: "API 오류: " + JSON.stringify(data) });
    res.status(200).json({ reply: data.content[0].text });
  } catch(e) {
    res.status(500).json({ reply: "서버 오류: " + e.message });
  }
}

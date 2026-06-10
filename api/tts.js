export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "텍스트가 없습니다" });

    const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
    if (!ELEVEN_KEY) return res.status(500).json({ error: "ElevenLabs API 키가 없습니다" });

    // 한국어에 최적화된 목소리 ID (Rachel - 자연스러운 여성 목소리)
    const VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true
        }
      })
    });

    if (!r.ok) {
      const err = await r.json();
      return res.status(500).json({ error: JSON.stringify(err) });
    }

    const audioBuffer = await r.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioBuffer));
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on Vercel' });
  }

  try {
    const { images, prompt } = req.body;
    if (!images || !images.length) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const parts = [
      { text: prompt },
      ...images.map(img => ({
        inline_data: { mime_type: img.type, data: img.data }
      }))
    ];

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
      }
    );

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      const msg = geminiData?.error?.message || 'Gemini API error';
      return res.status(500).json({ error: msg });
    }

    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(500).json({ error: 'No response from Gemini' });

    return res.status(200).json({ text });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message || 'Analysis failed' });
  }
};

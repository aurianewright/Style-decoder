const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const { images, prompt } = req.body;
    if (!images || !images.length) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const parts = [
      { text: prompt },
      ...images.map(img => ({
        inlineData: { mimeType: img.type, data: img.data }
      }))
    ];

    const result = await model.generateContent(parts);
    const text = result.response.text();

    return res.status(200).json({ text });
  } catch (err) {
    console.error('Gemini error:', err);
    return res.status(500).json({ error: err.message || 'Analysis failed' });
  }
};

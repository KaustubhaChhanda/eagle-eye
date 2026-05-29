const fs = require('fs').promises;

const PROMPT = `Analyze this image and determine the most likely geographic location. Look for clues such as: landmarks, text/signage language, architectural style, vegetation, road signs, license plates, terrain, sky, cultural indicators. Respond ONLY in this exact JSON format with no extra text: { "country": "", "city": "", "region": "", "coordinates": { "lat": 0.0, "lng": 0.0 }, "confidence": "low|medium|high", "reasoning": "" }`;

async function analyzeWithGemini(filePath) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const buf = await fs.readFile(filePath);
  const b64 = buf.toString('base64');

  // Try to use the official SDK if available
  try {
    const sdk = require('@google/generative-ai');
    // The exact SDK surface may vary; attempt common patterns.
    if (sdk.TextGeneration && typeof sdk.TextGeneration === 'function') {
      const client = new sdk.TextGeneration({ apiKey });
      const input = `${PROMPT}\n\nImageBase64:${b64}`;
      const res = await client.generate({ model: 'gemini-1.5-flash', input });
      const text = (res?.output?.[0]?.content) ?? (res?.candidates?.[0]?.content) ?? res?.text ?? null;
      if (!text) throw new Error('Unexpected Gemini SDK response');
      return JSON.parse(text);
    }

    // Fallback common shape
    if (sdk.createTextClient || sdk.TextClient) {
      const ClientCtor = sdk.createTextClient || sdk.TextClient;
      const client = new ClientCtor({ apiKey });
      const input = `${PROMPT}\n\nImageBase64:${b64}`;
      const res = await client.generate({ model: 'gemini-1.5-flash', prompt: input });
      const text = res?.text || res?.output?.[0]?.content;
      if (!text) throw new Error('Unexpected Gemini SDK response');
      return JSON.parse(text);
    }

    throw new Error('Unsupported @google/generative-ai SDK surface; update geminiService.js to match your SDK');
  } catch (err) {
    // Bubble up errors to route; caller will handle partial results
    throw err;
  }
}

module.exports = { analyzeWithGemini };

const fs = require('fs').promises;
const path = require('path');
const { InferenceClient } = require('@huggingface/inference');

const PROMPT = `Analyze this image and determine the most likely geographic location. Look for clues such as: landmarks, text/signage language, architectural style, vegetation, road signs, license plates, terrain, sky, cultural indicators. Respond ONLY in this exact JSON format with no extra text: { "country": "", "city": "", "region": "", "coordinates": { "lat": 0.0, "lng": 0.0 }, "confidence": "low|medium|high", "reasoning": "" }`;

async function analyzeWithHuggingFace(filePath) {
  const token = process.env.HF_ACCESS_TOKEN;
  if (!token) {
    throw new Error('HF_ACCESS_TOKEN not set in environment variables');
  }

  const modelName = process.env.HF_MODEL || 'Qwen/Qwen2-VL-7B-Instruct';

  const client = new InferenceClient(token);
  const buf = await fs.readFile(filePath);
  const base64Image = buf.toString('base64');
  
  // Determine mimeType
  const ext = path.extname(filePath).toLowerCase();
  let mimeType = 'image/jpeg';
  if (ext === '.png') mimeType = 'image/png';
  else if (ext === '.webp') mimeType = 'image/webp';
  else if (ext === '.gif') mimeType = 'image/gif';

  // Request the Hugging Face Inference API
  const response = await client.chatCompletion({
    model: modelName,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ]
      }
    ],
    max_tokens: 500
  });

  const text = response.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Hugging Face Inference API returned an empty response');
  }

  // Clean JSON string
  let cleanedText = text.trim();
  if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '').replace(/```$/, '').trim();
  }

  try {
    return JSON.parse(cleanedText);
  } catch (parseErr) {
    console.error('Failed to parse JSON response from Hugging Face model:', cleanedText);
    throw new Error(`Invalid JSON returned from model: ${parseErr.message}`);
  }
}

module.exports = { analyzeWithHuggingFace };

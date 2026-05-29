const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const upload = require('../middleware/upload');
const { extractExif } = require('../services/exifService');
const { analyzeWithGemini } = require('../services/geminiService');
const { reconcile } = require('../services/locationMatcher');

router.post('/analyze', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });

  const filePath = req.file.path;

  // Run EXIF and Gemini in parallel; tolerate partial failures
  const exifP = extractExif(filePath).catch(err => ({ error: err }));
  const aiP = analyzeWithGemini(filePath).catch(err => ({ error: err }));

  const [exifRes, aiRes] = await Promise.all([exifP, aiP]);

  // delete temp file
  fs.unlink(filePath, (err) => {
    if (err) console.error('Failed to delete temp upload', err);
  });

  const exifData = exifRes && !exifRes.error ? exifRes : null;
  const aiData = aiRes && !aiRes.error ? aiRes : null;

  if (!exifData && !aiData) {
    const err = (exifRes && exifRes.error) || (aiRes && aiRes.error) || new Error('Unknown error');
    console.error('Both services failed', err);
    return res.status(500).json({ success: false, message: 'Failed to analyze image', error: String(err) });
  }

  const unified = reconcile(exifData, aiData);

  const response = {
    success: true,
    location: {
      country: unified.country,
      city: unified.city,
      region: unified.region,
      coordinates: unified.coordinates,
      confidence: unified.confidence,
      source: unified.source || (exifData ? 'exif' : 'ai'),
      match: unified.match
    },
    exif: exifData || null,
    ai_analysis: aiData ? { reasoning: aiData.reasoning || null, confidence: aiData.confidence || null } : null
  };

  res.json(response);
});

module.exports = router;

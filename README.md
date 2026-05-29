# Image Geolocation Backend

Simple Node.js backend that analyzes uploaded images for geographic location using EXIF GPS data and Google Gemini vision analysis.

Requirements
- Node.js 18+

Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (copy from `.env` template) and set `GEMINI_API_KEY` and `PORT`.

3. Start the server:

```bash
npm start
```

Example curl

```bash
curl -X POST http://localhost:3000/api/analyze -F "image=@/path/to/photo.jpg"
```

Notes
- The project uses `@google/generative-ai` SDK to call Gemini. Ensure your SDK usage matches the installed package version — the SDK surface can change, and you may need to adapt `src/services/geminiService.js` accordingly.

This project is not completed yet...
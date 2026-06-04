# Image Geolocation Backend

Simple Node.js backend that analyzes uploaded images for geographic location using EXIF GPS data and Hugging Face Inference API (using the Qwen2-VL vision-language model).

## Requirements
- Node.js 18+

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file and set the following environment variables:
```env
HF_ACCESS_TOKEN=your_hugging_face_access_token
PORT=3000
# Optional: HF_MODEL=Qwen/Qwen2-VL-7B-Instruct
```

3. Start the server:

```bash
# Production mode
npm start

# Development mode (with nodemon)
npm run dev
```

## Example API Request

To analyze an image:

```bash
curl -X POST http://localhost:3000/api/analyze -F "image=@/path/to/photo.jpg"
```

## Notes
- The project uses the `@huggingface/inference` SDK to call the serverless Inference API. You can change the model by setting the `HF_MODEL` environment variable.
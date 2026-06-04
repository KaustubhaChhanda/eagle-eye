const dotenv = require('dotenv');
const { analyzeWithHuggingFace } = require('./src/services/huggingFaceService');
const fs = require('fs');
const path = require('path');

dotenv.config();

const token = process.env.HF_ACCESS_TOKEN;
console.log('Hugging Face Access Token loaded:', token ? 'YES (starts with ' + token.substring(0, 5) + ')' : 'NO');

async function test() {
  if (!token) {
    console.error('ERROR: Please add HF_ACCESS_TOKEN=your_token to your .env file before running this script.');
    process.exit(1);
  }

  // Create a temporary dummy JPEG image for testing
  // (1x1 transparent pixel GIF base64 converted to buffer, saved as JPEG)
  const dummyBase64 = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const tempImagePath = path.join(__dirname, 'temp_test_image.jpg');
  fs.writeFileSync(tempImagePath, Buffer.from(dummyBase64, 'base64'));

  try {
    console.log('Sending test image to Hugging Face Inference API...');
    const result = await analyzeWithHuggingFace(tempImagePath);
    console.log('SUCCESS! Analysis Result:\n', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('ERROR during testing:', error);
  } finally {
    // clean up temp image
    if (fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
    }
  }
}

test();

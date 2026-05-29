const exifr = require('exifr');

async function extractExif(filePath) {
  try {
    const data = await exifr.parse(filePath, { gps: true });
    if (!data) return null;
    const { latitude, longitude, altitude } = data;
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return { lat: latitude, lng: longitude, altitude: altitude ?? null };
    }
    return null;
  } catch (err) {
    throw err;
  }
}

module.exports = { extractExif };

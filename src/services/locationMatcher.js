function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function reconcile(exif, ai) {
  // ai expected shape: { country, city, region, coordinates: { lat, lng }, confidence, reasoning }
  const result = {
    country: ai?.country || null,
    city: ai?.city || null,
    region: ai?.region || null,
    coordinates: ai?.coordinates || null,
    confidence: ai?.confidence || 'low',
    source: null,
    match: null
  };

  if (exif && result.coordinates) {
    // both
    const distKm = haversineDistance(exif.lat, exif.lng, result.coordinates.lat, result.coordinates.lng);
    result.source = 'both';
    result.match = distKm <= 50; // match within 50km
  } else if (exif && !result.coordinates) {
    result.source = 'exif';
    result.coordinates = { lat: exif.lat, lng: exif.lng };
    result.match = true;
    result.confidence = 'high';
  } else if (!exif && result.coordinates) {
    result.source = 'ai';
    result.match = true;
  } else {
    result.source = null;
    result.match = false;
  }

  return result;
}

module.exports = { reconcile };

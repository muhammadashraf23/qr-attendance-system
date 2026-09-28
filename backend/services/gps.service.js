/**
 * GPS Location Verification Service
 * Uses the Haversine formula to calculate distance between two coordinates.
 * Dynamically queries campus coordinates and radius from the database,
 * falling back to environment variables if not configured.
 */

const SystemSetting = require('../models/SystemSetting');
const env = require('../config/env');

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Calculate distance in metres between two GPS coordinates.
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns true if the given coordinates are within the campus GPS radius.
 * Reads campus coordinates dynamically from the database.
 * Falls back to env vars: CAMPUS_LATITUDE, CAMPUS_LONGITUDE, CAMPUS_RADIUS.
 */
async function isOnCampus(lat, lng) {
  let campusLat    = env.CAMPUS_LATITUDE  || env.OFFICE_LATITUDE;   // legacy fallback
  let campusLng    = env.CAMPUS_LONGITUDE || env.OFFICE_LONGITUDE;
  let radiusMeters = env.CAMPUS_RADIUS    || env.OFFICE_RADIUS;

  try {
    const settings = await SystemSetting.find({
      key: { $in: ['campus_lat', 'campus_lng', 'campus_radius_meters',
                   'office_lat', 'office_lng', 'gps_radius_meters'] }, // support both key names
    }).lean();

    const map = {};
    settings.forEach((s) => { map[s.key] = s.value; });

    if (map.campus_lat || map.office_lat)
      campusLat = parseFloat(map.campus_lat || map.office_lat);
    if (map.campus_lng || map.office_lng)
      campusLng = parseFloat(map.campus_lng || map.office_lng);
    if (map.campus_radius_meters || map.gps_radius_meters)
      radiusMeters = parseFloat(map.campus_radius_meters || map.gps_radius_meters);
  } catch {
    // If DB is temporarily unavailable, fall back to environment defaults
  }

  const distance = haversineDistance(lat, lng, campusLat, campusLng);
  return {
    allowed:      distance <= radiusMeters,
    distance:     Math.round(distance),
    campusRadius: radiusMeters,
  };
}

// Legacy alias so any existing code calling isWithinOffice doesn't break
const isWithinOffice = isOnCampus;

module.exports = { haversineDistance, isOnCampus, isWithinOffice };

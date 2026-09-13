/**
 * GPS Location Verification Service
 * Uses the Haversine formula to calculate distance between two coordinates.
 * Dynamically queries office coordinates and radius from the database,
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
 * Returns true if the given coordinates are within the office GPS radius.
 * Reads office coordinates dynamically from the database.
 */
async function isWithinOffice(lat, lng) {
  let officeLat = env.OFFICE_LATITUDE;
  let officeLng = env.OFFICE_LONGITUDE;
  let radiusMeters = env.OFFICE_RADIUS;

  try {
    const settings = await SystemSetting.find({
      key: { $in: ['office_lat', 'office_lng', 'gps_radius_meters'] },
    }).lean();

    const map = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    if (map.office_lat) officeLat = parseFloat(map.office_lat);
    if (map.office_lng) officeLng = parseFloat(map.office_lng);
    if (map.gps_radius_meters) radiusMeters = parseFloat(map.gps_radius_meters);
  } catch (err) {
    // If DB is temporarily unavailable, fall back to environment defaults
  }

  const distance = haversineDistance(lat, lng, officeLat, officeLng);
  return {
    allowed: distance <= radiusMeters,
    distance: Math.round(distance),
    officeRadius: radiusMeters,
  };
}

module.exports = { haversineDistance, isWithinOffice };

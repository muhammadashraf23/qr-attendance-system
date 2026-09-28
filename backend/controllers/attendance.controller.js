const { Attendance, Member, SystemSetting } = require('../models');
const { AppError }   = require('../utils/AppError');
const { isOnCampus } = require('../services/gps.service');
const env            = require('../config/env');

/* ─── helper: read DB setting ─────────────────────────────── */
async function getSetting(key) {
  const r = await SystemSetting.findOne({ key });
  return r?.value;
}

function calcLateMinutes(now, threshold = '08:30') {
  const [h, m] = threshold.split(':').map(Number);
  const threshMs = (h * 60 + m) * 60_000;
  const nowMs = (now.getHours() * 60 + now.getMinutes()) * 60_000;
  return Math.max(0, Math.floor((nowMs - threshMs) / 60_000));
}

async function isLateArrival(checkInTime) {
  const threshold = (await getSetting('late_threshold')) || '08:30';
  const [h, m] = threshold.split(':').map(Number);
  const t = new Date(checkInTime);
  return t.getHours() > h || (t.getHours() === h && t.getMinutes() > m);
}

/* ─── POST /api/attendance/clock-in ──────────────────────── */
const clockIn = async (req, res, next) => {
  try {
    const {
      member_id,
      latitude,
      longitude,
      device_id,
      method = 'qr',
      is_offline_record = false,
    } = req.body;

    if (!member_id) throw new AppError('VALIDATION_ERROR', 'member_id is required.', 400);

    // Verify member exists
    const member = await Member.findOne({ member_id, is_active: true });
    if (!member) throw new AppError('NOT_FOUND', 'Member not found or inactive.', 404);

    const today = new Date().toISOString().split('T')[0];
    const now   = new Date();

    // GPS verification (skip for offline records — verified when synced)
    let gpsVerified = false;
    if (!is_offline_record && latitude != null && longitude != null) {
      const { allowed, distance, campusRadius } = await isOnCampus(
        parseFloat(latitude),
        parseFloat(longitude)
      );
      if (!allowed)
        throw new AppError(
          'GPS_REJECTED',
          `You are ${distance}m from campus. Clock-in requires being within ${campusRadius || env.CAMPUS_RADIUS}m.`,
          403,
          { distance }
        );
      gpsVerified = true;
    }

    // Prevent duplicate clock-in
    const existing = await Attendance.findOne({ member_id, date: today });
    if (existing && existing.clock_in_time) {
      throw new AppError(
        'DUPLICATE_CHECKIN',
        `Already clocked in at ${new Date(existing.clock_in_time).toLocaleTimeString()}.`,
        409,
        { clocked_in_at: existing.clock_in_time }
      );
    }

    const lateThreshold = (await getSetting('late_threshold')) || '08:30';
    const late          = await isLateArrival(now);
    const lateMinutes   = late ? calcLateMinutes(now, lateThreshold) : 0;
    const ip            = req.ip || req.headers['x-forwarded-for'];

    const record = await Attendance.create({
      member_id,
      date: today,
      clock_in_time: now,
      clock_in_lat: latitude || null,
      clock_in_lng: longitude || null,
      gps_verified: gpsVerified,
      device_id: device_id || null,
      ip_address: ip,
      method,
      is_late: late,
      late_minutes: lateMinutes,
      is_offline_record,
      status: 'present',
    });

    return res.status(201).json({
      success: true,
      message: 'Clock-in recorded.',
      data: {
        ...record.toObject(),
        member_name: member.full_name,
        is_late: late,
        late_minutes: lateMinutes,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─── POST /api/attendance/clock-out ─────────────────────── */
const clockOut = async (req, res, next) => {
  try {
    const { member_id, latitude, longitude, device_id } = req.body;
    if (!member_id) throw new AppError('VALIDATION_ERROR', 'member_id is required.', 400);

    const today = new Date().toISOString().split('T')[0];
    const now   = new Date();

    // GPS (optional on clock-out)
    if (latitude != null && longitude != null) {
      const { allowed, distance } = await isOnCampus(parseFloat(latitude), parseFloat(longitude));
      if (!allowed)
        throw new AppError('GPS_REJECTED', `Clock-out rejected: ${distance}m from campus.`, 403, { distance });
    }

    const rec = await Attendance.findOne({ member_id, date: today });
    if (!rec) throw new AppError('NOT_CLOCKED_IN', 'No clock-in found for today.', 400);
    if (rec.clock_out_time)
      throw new AppError('ALREADY_CLOCKED_OUT', 'Already clocked out today.', 409);

    const clockInTime    = new Date(rec.clock_in_time);
    const workingMinutes = Math.floor((now.getTime() - clockInTime.getTime()) / 60_000);

    rec.clock_out_time = now;
    rec.clock_out_lat  = latitude || null;
    rec.clock_out_lng  = longitude || null;
    rec.working_minutes = workingMinutes;
    if (device_id) rec.device_id = device_id;

    await rec.save();

    return res.json({
      success: true,
      message: 'Clock-out recorded.',
      data: {
        ...rec.toObject(),
        working_hours: workingMinutes
          ? `${Math.floor(workingMinutes / 60)}h ${workingMinutes % 60}m`
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/attendance/today ──────────────────────────── */
const getTodayStatus = async (req, res, next) => {
  try {
    const { member_id } = req.user;
    const today = new Date().toISOString().split('T')[0];
    const rec   = await Attendance.findOne({ member_id, date: today });
    return res.json({ success: true, data: rec || null });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/attendance/history ────────────────────────── */
const getHistory = async (req, res, next) => {
  try {
    const { member_id } = req.user;
    const { from, to, page = 1, limit = 30 } = req.query;
    const fromDate = from || new Date(Date.now() - 30 * 86400_000).toISOString().split('T')[0];
    const toDate   = to   || new Date().toISOString().split('T')[0];
    const pageNum  = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip     = (pageNum - 1) * limitNum;

    const query = { member_id, date: { $gte: fromDate, $lte: toDate } };

    const [rows, total] = await Promise.all([
      Attendance.find(query).sort({ date: -1 }).skip(skip).limit(limitNum).lean(),
      Attendance.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: rows.map((r) => ({
        ...r,
        working_hours: r.working_minutes
          ? `${Math.floor(r.working_minutes / 60)}h ${r.working_minutes % 60}m`
          : null,
      })),
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

/* ─── POST /api/attendance/sync  (offline batch upload) ───── */
const syncOffline = async (req, res, next) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || !records.length)
      throw new AppError('VALIDATION_ERROR', 'records array required.', 400);

    const results = { synced: 0, skipped: 0, errors: [] };

    for (const r of records) {
      try {
        const existing = await Attendance.findOne({ member_id: r.member_id, date: r.date });
        if (existing) { results.skipped++; continue; }

        let wm = 0;
        if (r.clock_in_time && r.clock_out_time) {
          wm = Math.floor(
            (new Date(r.clock_out_time).getTime() - new Date(r.clock_in_time).getTime()) / 60_000
          );
        }

        await Attendance.create({
          member_id: r.member_id,
          date: r.date,
          clock_in_time:  r.clock_in_time  ? new Date(r.clock_in_time)  : null,
          clock_out_time: r.clock_out_time ? new Date(r.clock_out_time) : null,
          working_minutes: wm,
          method: r.method || 'offline_sync',
          is_offline_record: true,
          synced_at: new Date(),
          status: 'present',
        });
        results.synced++;
      } catch (e) {
        results.errors.push({ date: r.date, error: e.message });
        results.skipped++;
      }
    }

    return res.json({ success: true, results });
  } catch (err) {
    next(err);
  }
};

module.exports = { clockIn, clockOut, getTodayStatus, getHistory, syncOffline };

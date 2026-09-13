const { Attendance, Employee, SystemSetting } = require('../models');
const { AppError } = require('../utils/AppError');
const { isWithinOffice } = require('../services/gps.service');
const env = require('../config/env');

/* ─── helper: read DB setting ─────────────────────────────── */
async function getSetting(key) {
  const r = await SystemSetting.findOne({ key });
  return r?.value;
}

function calcLateMinutes(now, threshold = '09:30') {
  const [h, m] = threshold.split(':').map(Number);
  const threshMs = (h * 60 + m) * 60_000;
  const nowMs = (now.getHours() * 60 + now.getMinutes()) * 60_000;
  return Math.max(0, Math.floor((nowMs - threshMs) / 60_000));
}

async function isLateArrival(checkInTime) {
  const threshold = (await getSetting('late_threshold')) || '09:30';
  const [h, m] = threshold.split(':').map(Number);
  const t = new Date(checkInTime);
  return t.getHours() > h || (t.getHours() === h && t.getMinutes() > m);
}

/* ─── POST /api/attendance/check-in ──────────────────────── */
const checkIn = async (req, res, next) => {
  try {
    const {
      employee_id,
      latitude,
      longitude,
      device_id,
      method = 'qr',
      is_offline_record = false,
    } = req.body;

    if (!employee_id) throw new AppError('VALIDATION_ERROR', 'employee_id is required.', 400);

    // Verify employee exists
    const emp = await Employee.findOne({ employee_id, is_active: true });
    if (!emp) throw new AppError('NOT_FOUND', 'Employee not found or inactive.', 404);

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // GPS verification (skip for offline records — verified when synced)
    let gpsVerified = false;
    if (!is_offline_record && latitude != null && longitude != null) {
      const { allowed, distance, officeRadius } = await isWithinOffice(
        parseFloat(latitude),
        parseFloat(longitude)
      );
      if (!allowed)
        throw new AppError(
          'GPS_REJECTED',
          `You are ${distance}m from the office. Check-in requires being within ${officeRadius || env.OFFICE_RADIUS}m.`,
          403,
          { distance }
        );
      gpsVerified = true;
    }

    // Prevent duplicate check-in
    const existing = await Attendance.findOne({ employee_id, date: today });
    if (existing && existing.check_in_time) {
      throw new AppError(
        'DUPLICATE_CHECKIN',
        `Already checked in at ${new Date(existing.check_in_time).toLocaleTimeString()}.`,
        409,
        { checked_in_at: existing.check_in_time }
      );
    }

    const lateThreshold = (await getSetting('late_threshold')) || '09:30';
    const late = await isLateArrival(now);
    const lateMinutes = late ? calcLateMinutes(now, lateThreshold) : 0;
    const ip = req.ip || req.headers['x-forwarded-for'];

    const record = await Attendance.create({
      employee_id,
      date: today,
      check_in_time: now,
      checkin_lat: latitude || null,
      checkin_lng: longitude || null,
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
      message: 'Check-in recorded.',
      data: {
        ...record.toObject(),
        employee_name: emp.full_name,
        is_late: late,
        late_minutes: lateMinutes,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─── POST /api/attendance/check-out ─────────────────────── */
const checkOut = async (req, res, next) => {
  try {
    const { employee_id, latitude, longitude, device_id } = req.body;
    if (!employee_id) throw new AppError('VALIDATION_ERROR', 'employee_id is required.', 400);

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // GPS (optional on checkout)
    if (latitude != null && longitude != null) {
      const { allowed, distance } = await isWithinOffice(parseFloat(latitude), parseFloat(longitude));
      if (!allowed)
        throw new AppError('GPS_REJECTED', `Check-out rejected: ${distance}m from office.`, 403, {
          distance,
        });
    }

    const rec = await Attendance.findOne({ employee_id, date: today });
    if (!rec) throw new AppError('NOT_CHECKED_IN', 'No check-in found for today.', 400);
    if (rec.check_out_time)
      throw new AppError('ALREADY_CHECKED_OUT', 'Already checked out today.', 409);

    const checkInTime = new Date(rec.check_in_time);
    const workingMinutes = Math.floor((now.getTime() - checkInTime.getTime()) / 60_000);
    const overtimeMinutes = Math.max(0, workingMinutes - 480);

    rec.check_out_time = now;
    rec.checkout_lat = latitude || null;
    rec.checkout_lng = longitude || null;
    rec.working_minutes = workingMinutes;
    rec.overtime_minutes = overtimeMinutes;
    if (device_id) rec.device_id = device_id;

    await rec.save();

    return res.json({
      success: true,
      message: 'Check-out recorded.',
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
    const { employee_id } = req.user;
    const today = new Date().toISOString().split('T')[0];
    const rec = await Attendance.findOne({ employee_id, date: today });
    return res.json({ success: true, data: rec || null });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/attendance/history ────────────────────────── */
const getHistory = async (req, res, next) => {
  try {
    const { employee_id } = req.user;
    const { from, to, page = 1, limit = 30 } = req.query;
    const fromDate = from || new Date(Date.now() - 30 * 86400_000).toISOString().split('T')[0];
    const toDate = to || new Date().toISOString().split('T')[0];
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const query = {
      employee_id,
      date: { $gte: fromDate, $lte: toDate },
    };

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
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
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
        const existing = await Attendance.findOne({ employee_id: r.employee_id, date: r.date });
        if (existing) {
          results.skipped++;
          continue;
        }

        let wm = 0;
        let om = 0;
        if (r.check_in_time && r.check_out_time) {
          wm = Math.floor(
            (new Date(r.check_out_time).getTime() - new Date(r.check_in_time).getTime()) / 60_000
          );
          om = Math.max(0, wm - 480);
        }

        await Attendance.create({
          employee_id: r.employee_id,
          date: r.date,
          check_in_time: r.check_in_time ? new Date(r.check_in_time) : null,
          check_out_time: r.check_out_time ? new Date(r.check_out_time) : null,
          working_minutes: wm,
          overtime_minutes: om,
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

module.exports = { checkIn, checkOut, getTodayStatus, getHistory, syncOffline };

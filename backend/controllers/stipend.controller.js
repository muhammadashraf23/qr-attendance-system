const ExcelJS     = require('exceljs');
const PDFDocument = require('pdfkit');
const { Parser }  = require('json2csv');
const { StipendRecord, Member, Attendance, AcademicHoliday } = require('../models');
const { AppError } = require('../utils/AppError');

/* ─── POST /api/stipend/generate ────────────────────────── */
const generateStipend = async (req, res, next) => {
  try {
    const { month, year, staff_id } = req.body;
    if (!month || !year) throw new AppError('VALIDATION_ERROR', 'month and year required.', 400);

    const mNum     = parseInt(month, 10);
    const yNum     = parseInt(year, 10);
    const monthStr = String(mNum).padStart(2, '0');

    // Calculate teaching days in month (excluding weekends + academic holidays)
    const holidays = await AcademicHoliday.find({
      date: { $regex: `^${yNum}-${monthStr}` },
    }).lean();
    const holidaySet = new Set(holidays.map((h) => h.date));

    const daysInMonth = new Date(yNum, mNum, 0).getDate();
    let workingDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dt  = new Date(yNum, mNum - 1, d);
      const iso = dt.toISOString().split('T')[0];
      const dow = dt.getDay();
      if (dow !== 0 && dow !== 6 && !holidaySet.has(iso)) workingDays++;
    }
    if (workingDays === 0) workingDays = 1;

    // Only generate stipends for teachers (role: teacher / hod / lab_assistant)
    const memberFilter = { is_active: true, role: { $in: ['teacher', 'hod', 'lab_assistant'] } };
    if (staff_id) memberFilter.member_id = staff_id;

    const staffMembers = await Member.find(memberFilter).lean();
    const LATE_DEDUCTION_RATE = 0.5;

    const results = [];
    for (const m of staffMembers) {
      const atts = await Attendance.find({
        member_id: m.member_id,
        date: { $regex: `^${yNum}-${monthStr}` },
      }).lean();

      let presentDays = 0, absentDays = 0, leaveDays = 0, lateDays = 0;
      atts.forEach((a) => {
        if (a.status === 'present') presentDays++;
        else if (a.status === 'absent') absentDays++;
        else if (a.status === 'leave') leaveDays++;
        if (a.is_late) lateDays++;
      });

      const dailyRate    = (m.monthly_stipend || 0) / workingDays;
      const lateDeduction = lateDays * dailyRate * LATE_DEDUCTION_RATE;
      const absentDeduct  = absentDays * dailyRate;
      const grossStipend  = m.monthly_stipend || 0;
      const netStipend    = Math.max(0, grossStipend - lateDeduction - absentDeduct);

      const rec = await StipendRecord.findOneAndUpdate(
        { staff_id: m.member_id, month: mNum, year: yNum },
        {
          base_stipend:  grossStipend,
          working_days:  workingDays,
          present_days:  presentDays,
          absent_days:   absentDays,
          leave_days:    leaveDays,
          late_deduction: parseFloat(lateDeduction.toFixed(2)),
          gross_stipend: parseFloat(grossStipend.toFixed(2)),
          net_stipend:   parseFloat(netStipend.toFixed(2)),
          generated_by:  req.staff?.id || null,
          generated_at:  new Date(),
        },
        { upsert: true, new: true }
      );

      results.push({
        ...rec.toObject(),
        staff_name: m.full_name,
        late_days: lateDays,
      });
    }

    return res.json({
      success: true,
      message: `Stipend generated for ${results.length} staff member(s).`,
      data: { month: mNum, year: yNum, working_days: workingDays, records: results },
    });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/stipend/report ────────────────────────────── */
const getStipendReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) throw new AppError('VALIDATION_ERROR', 'month and year required.', 400);

    const mNum = parseInt(month, 10);
    const yNum = parseInt(year, 10);

    const records   = await StipendRecord.find({ month: mNum, year: yNum }).lean();
    const staffIds  = records.map((r) => r.staff_id);
    const members   = await Member.find({ member_id: { $in: staffIds } }).lean();
    const memberMap = new Map();
    members.forEach((m) => memberMap.set(m.member_id, m));

    const rows = records.map((r) => {
      const m = memberMap.get(r.staff_id) || {};
      return { ...r, full_name: m.full_name || '', department: m.department_name || '' };
    });

    rows.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/stipend/export ────────────────────────────── */
const exportStipend = async (req, res, next) => {
  try {
    const { month, year, format: fmt = 'excel' } = req.query;
    if (!month || !year) throw new AppError('VALIDATION_ERROR', 'month and year required.', 400);

    const mNum = parseInt(month, 10);
    const yNum = parseInt(year, 10);

    const records   = await StipendRecord.find({ month: mNum, year: yNum }).lean();
    const staffIds  = records.map((r) => r.staff_id);
    const members   = await Member.find({ member_id: { $in: staffIds } }).lean();
    const memberMap = new Map();
    members.forEach((m) => memberMap.set(m.member_id, m));

    const rows = records.map((r) => {
      const m = memberMap.get(r.staff_id) || {};
      return { ...r, full_name: m.full_name || '', department: m.department_name || '' };
    });
    rows.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

    const monthName = new Date(yNum, mNum - 1).toLocaleString('default', { month: 'long' });
    const filename  = `stipend-${monthName}-${yNum}`;

    const data = rows.map((r) => ({
      'Staff ID':       r.staff_id,
      Name:             r.full_name,
      Department:       r.department,
      'Base Stipend':   r.base_stipend,
      'Working Days':   r.working_days,
      'Present Days':   r.present_days,
      'Absent Days':    r.absent_days,
      'Leave Days':     r.leave_days,
      'Late Deduction': r.late_deduction,
      'Gross Stipend':  r.gross_stipend,
      'Net Stipend':    r.net_stipend,
      Status:           r.status,
    }));

    // ── CSV ───────────────────────────────────────────────────
    if (fmt === 'csv') {
      const parser = new Parser();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(parser.parse(data));
    }

    // ── PDF ───────────────────────────────────────────────────
    if (fmt === 'pdf') {
      const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
      doc.pipe(res);

      doc.fillColor('#1565C0').fontSize(18).text('Attendzo University', { align: 'center' });
      doc.fillColor('#333').fontSize(13).text(`Stipend Report — ${monthName} ${yNum}`, { align: 'center' });
      doc.moveDown();

      const total = rows.reduce((s, r) => s + (parseFloat(r.net_stipend) || 0), 0);
      doc.fontSize(11).text(
        `Total Staff: ${rows.length}   |   Total Net Stipend: ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        { align: 'center' }
      );
      doc.moveDown();

      const cols   = ['ID', 'Name', 'Dept', 'Base', 'Present', 'Absent', 'Late Ded.', 'Net Stipend'];
      const widths = [70, 120, 80, 70, 55, 55, 70, 80];
      let x = 40, y = doc.y;
      doc.fillColor('#1565C0').rect(x, y, widths.reduce((a, b) => a + b, 0), 20).fill();
      doc.fillColor('#fff').fontSize(9);
      cols.forEach((col, i) => { doc.text(col, x + 3, y + 5, { width: widths[i] - 6, align: 'left' }); x += widths[i]; });
      y += 20;

      rows.forEach((r, idx) => {
        x = 40;
        if (idx % 2 === 0) doc.fillColor('#f4f6f8').rect(40, y, widths.reduce((a, b) => a + b, 0), 18).fill();
        doc.fillColor('#333').fontSize(8);
        const vals = [
          r.staff_id, r.full_name, r.department || '',
          `₹${parseFloat(r.base_stipend || 0).toLocaleString('en-IN')}`,
          r.present_days, r.absent_days,
          `₹${parseFloat(r.late_deduction || 0).toFixed(0)}`,
          `₹${parseFloat(r.net_stipend || 0).toLocaleString('en-IN')}`,
        ];
        vals.forEach((val, i) => { doc.text(String(val), x + 3, y + 4, { width: widths[i] - 6, align: 'left' }); x += widths[i]; });
        y += 18;
        if (y > 530) { doc.addPage({ layout: 'landscape' }); y = 40; }
      });

      doc.end();
      return;
    }

    // ── Excel (default) ───────────────────────────────────────
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(`${monthName} ${yNum}`);
    ws.columns = Object.keys(data[0] || {}).map((key) => ({ header: key, key, width: 18 }));
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };
    data.forEach((row) => ws.addRow(row));

    ['Base Stipend', 'Late Deduction', 'Gross Stipend', 'Net Stipend'].forEach((col) => {
      const c = ws.getColumn(col);
      if (c) c.numFmt = '₹#,##0.00';
    });

    const lastRow = ws.lastRow ? ws.lastRow.number + 1 : 2;
    ws.addRow({ 'Staff ID': 'TOTAL', 'Net Stipend': { formula: `SUM(K2:K${lastRow - 1})` } });
    ws.getRow(lastRow).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

module.exports = { generateStipend, getStipendReport, exportStipend };

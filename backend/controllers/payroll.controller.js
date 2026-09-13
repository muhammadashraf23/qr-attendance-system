const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const { PayrollRecord, Employee, Attendance, PublicHoliday } = require('../models');
const { AppError } = require('../utils/AppError');

/* ─── POST /api/payroll/generate ────────────────────────── */
const generatePayroll = async (req, res, next) => {
  try {
    const { month, year, employee_id } = req.body;
    if (!month || !year) throw new AppError('VALIDATION_ERROR', 'month and year required.', 400);

    const mNum = parseInt(month, 10);
    const yNum = parseInt(year, 10);
    const monthStr = String(mNum).padStart(2, '0');

    // Calculate working days in month (excluding weekends + public holidays)
    const holidays = await PublicHoliday.find({
      date: { $regex: `^${yNum}-${monthStr}` },
    }).lean();
    const holidaySet = new Set(holidays.map((h) => h.date));

    const daysInMonth = new Date(yNum, mNum, 0).getDate();
    let workingDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(yNum, mNum - 1, d);
      const iso = dt.toISOString().split('T')[0];
      const dow = dt.getDay();
      if (dow !== 0 && dow !== 6 && !holidaySet.has(iso)) workingDays++;
    }

    if (workingDays === 0) workingDays = 1; // avoid divide by zero

    // Fetch employees
    const empFilter = { is_active: true };
    if (employee_id) empFilter.employee_id = employee_id;

    const emps = await Employee.find(empFilter).lean();

    const results = [];
    const LATE_DEDUCTION_RATE = 0.5; // % of daily salary per late day

    for (const emp of emps) {
      // Attendance summary for month
      const atts = await Attendance.find({
        employee_id: emp.employee_id,
        date: { $regex: `^${yNum}-${monthStr}` },
      }).lean();

      let presentDays = 0;
      let absentDays = 0;
      let leaveDays = 0;
      let lateDays = 0;
      let overtimeMin = 0;

      atts.forEach((a) => {
        if (a.status === 'present') presentDays++;
        else if (a.status === 'absent') absentDays++;
        else if (a.status === 'leave') leaveDays++;

        if (a.is_late) lateDays++;
        if (a.overtime_minutes) overtimeMin += a.overtime_minutes;
      });

      const dailyRate = (emp.base_salary || 0) / workingDays;
      const lateDeduction = lateDays * dailyRate * LATE_DEDUCTION_RATE;
      const absentDeduct = absentDays * dailyRate;
      const overtimeBonus = (overtimeMin / 60) * (dailyRate / 8) * 1.5; // 1.5x hourly rate

      const grossSalary = emp.base_salary || 0;
      const netSalary = Math.max(0, grossSalary - lateDeduction - absentDeduct + overtimeBonus);

      // Upsert payroll record
      const rec = await PayrollRecord.findOneAndUpdate(
        { employee_id: emp.employee_id, month: mNum, year: yNum },
        {
          base_salary: grossSalary,
          working_days: workingDays,
          present_days: presentDays,
          absent_days: absentDays,
          leave_days: leaveDays,
          late_deduction: parseFloat(lateDeduction.toFixed(2)),
          overtime_bonus: parseFloat(overtimeBonus.toFixed(2)),
          gross_salary: parseFloat(grossSalary.toFixed(2)),
          net_salary: parseFloat(netSalary.toFixed(2)),
          generated_by: req.admin?.id || null,
          generated_at: new Date(),
        },
        { upsert: true, new: true }
      );

      results.push({
        ...rec.toObject(),
        employee_name: emp.full_name,
        late_days: lateDays,
        overtime_hours: (overtimeMin / 60).toFixed(1),
      });
    }

    return res.json({
      success: true,
      message: `Payroll generated for ${results.length} employee(s).`,
      data: { month: mNum, year: yNum, working_days: workingDays, records: results },
    });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/payroll/report ────────────────────────────── */
const getPayrollReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) throw new AppError('VALIDATION_ERROR', 'month and year required.', 400);

    const mNum = parseInt(month, 10);
    const yNum = parseInt(year, 10);

    const records = await PayrollRecord.find({ month: mNum, year: yNum }).lean();
    const empIds = records.map((r) => r.employee_id);

    const emps = await Employee.find({ employee_id: { $in: empIds } }).lean();
    const empMap = new Map();
    emps.forEach((e) => empMap.set(e.employee_id, e));

    const rows = records.map((r) => {
      const emp = empMap.get(r.employee_id) || {};
      return {
        ...r,
        full_name: emp.full_name || '',
        department: emp.department_name || '',
      };
    });

    rows.sort((a, b) => a.full_name.localeCompare(b.full_name));

    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/payroll/export ────────────────────────────── */
const exportPayroll = async (req, res, next) => {
  try {
    const { month, year, format: fmt = 'excel' } = req.query;
    if (!month || !year) throw new AppError('VALIDATION_ERROR', 'month and year required.', 400);

    const mNum = parseInt(month, 10);
    const yNum = parseInt(year, 10);

    const records = await PayrollRecord.find({ month: mNum, year: yNum }).lean();
    const empIds = records.map((r) => r.employee_id);

    const emps = await Employee.find({ employee_id: { $in: empIds } }).lean();
    const empMap = new Map();
    emps.forEach((e) => empMap.set(e.employee_id, e));

    const rows = records.map((r) => {
      const emp = empMap.get(r.employee_id) || {};
      return {
        ...r,
        full_name: emp.full_name || '',
        department: emp.department_name || '',
      };
    });

    rows.sort((a, b) => a.full_name.localeCompare(b.full_name));

    const monthName = new Date(yNum, mNum - 1).toLocaleString('default', { month: 'long' });
    const filename = `payroll-${monthName}-${yNum}`;

    const data = rows.map((r) => ({
      'Employee ID': r.employee_id,
      Name: r.full_name,
      Department: r.department,
      'Base Salary': r.base_salary,
      'Working Days': r.working_days,
      'Present Days': r.present_days,
      'Absent Days': r.absent_days,
      'Leave Days': r.leave_days,
      'Late Deduction': r.late_deduction,
      'Overtime Bonus': r.overtime_bonus,
      'Gross Salary': r.gross_salary,
      'Net Salary': r.net_salary,
      Status: r.status,
    }));

    // ── CSV ─────────────────────────────────────────────────
    if (fmt === 'csv') {
      const parser = new Parser();
      const csv = parser.parse(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csv);
    }

    // ── PDF ─────────────────────────────────────────────────
    if (fmt === 'pdf') {
      const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
      doc.pipe(res);

      // Header
      doc.fillColor('#2E7D32').fontSize(18).text('Attendzo SaaS', { align: 'center' });
      doc
        .fillColor('#333')
        .fontSize(13)
        .text(`Payroll Report — ${monthName} ${yNum}`, { align: 'center' });
      doc.moveDown();

      // Summary row
      const total = rows.reduce((s, r) => s + (parseFloat(r.net_salary) || 0), 0);
      doc
        .fontSize(11)
        .text(
          `Total Employees: ${rows.length}   |   Total Net Payroll: ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          { align: 'center' }
        );
      doc.moveDown();

      // Table header
      const cols = [
        'ID',
        'Name',
        'Dept',
        'Base',
        'Present',
        'Absent',
        'Late Ded.',
        'OT Bonus',
        'Net Salary',
      ];
      const widths = [60, 110, 80, 65, 50, 50, 65, 65, 75];
      let x = 40;
      let y = doc.y;
      doc
        .fillColor('#2E7D32')
        .rect(
          x,
          y,
          widths.reduce((a, b) => a + b, 0),
          20
        )
        .fill();
      doc.fillColor('#fff').fontSize(9);
      cols.forEach((col, i) => {
        doc.text(col, x + 3, y + 5, { width: widths[i] - 6, align: 'left' });
        x += widths[i];
      });
      y += 20;

      // Rows
      rows.forEach((r, idx) => {
        x = 40;
        if (idx % 2 === 0)
          doc
            .fillColor('#f9f9f9')
            .rect(
              40,
              y,
              widths.reduce((a, b) => a + b, 0),
              18
            )
            .fill();
        doc.fillColor('#333').fontSize(8);
        const vals = [
          r.employee_id,
          r.full_name,
          r.department || '',
          `₹${parseFloat(r.base_salary || 0).toLocaleString('en-IN')}`,
          r.present_days,
          r.absent_days,
          `₹${parseFloat(r.late_deduction || 0).toFixed(0)}`,
          `₹${parseFloat(r.overtime_bonus || 0).toFixed(0)}`,
          `₹${parseFloat(r.net_salary || 0).toLocaleString('en-IN')}`,
        ];
        vals.forEach((val, i) => {
          doc.text(String(val), x + 3, y + 4, { width: widths[i] - 6, align: 'left' });
          x += widths[i];
        });
        y += 18;
        if (y > 530) {
          doc.addPage({ layout: 'landscape' });
          y = 40;
        }
      });

      doc.end();
      return;
    }

    // ── Excel (default) ─────────────────────────────────────
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(`${monthName} ${yNum}`);

    ws.columns = Object.keys(data[0] || {}).map((key) => ({ header: key, key, width: 18 }));
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };

    data.forEach((row) => ws.addRow(row));

    // Currency format for money columns
    ['Base Salary', 'Late Deduction', 'Overtime Bonus', 'Gross Salary', 'Net Salary'].forEach(
      (col) => {
        const c = ws.getColumn(col);
        c.numFmt = '₹#,##0.00';
      }
    );

    // Totals row
    const lastRow = ws.lastRow ? ws.lastRow.number + 1 : 2;
    ws.addRow({
      'Employee ID': 'TOTAL',
      'Net Salary': { formula: `SUM(M2:M${lastRow - 1})` },
    });
    ws.getRow(lastRow).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

module.exports = { generatePayroll, getPayrollReport, exportPayroll };

'use client';

import React from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const WEEKS = Array.from({ length: 16 }, (_, i) => `W${i + 1}`);

const HEATMAP_DATA = [
  [92, 88, 95, 90, 85, 94, 91, 89, 96, 92, 88, 93, 90, 95, 89, 92],
  [85, 90, 89, 92, 87, 89, 93, 86, 91, 94, 90, 88, 87, 91, 93, 90],
  [94, 92, 90, 93, 91, 95, 88, 92, 94, 90, 89, 91, 95, 92, 88, 94],
  [88, 86, 91, 89, 84, 90, 87, 85, 92, 89, 86, 88, 90, 87, 91, 89],
  [78, 82, 80, 85, 79, 83, 81, 84, 82, 85, 80, 83, 86, 84, 81, 85],
];

function getColor(pct: number) {
  if (pct >= 93) return 'bg-emerald-600 text-white';
  if (pct >= 88) return 'bg-emerald-500 text-white';
  if (pct >= 82) return 'bg-emerald-400 text-gray-900';
  if (pct >= 75) return 'bg-emerald-200 text-gray-900';
  return 'bg-amber-300 text-gray-900';
}

export default function AttendanceHeatmap() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Attendance Intensity Calendar</h2>
          <p className="text-xs text-gray-500">16-Week Academic Semester presence distribution &amp; compliance map</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Less</span>
          <span className="w-3.5 h-3.5 rounded-md bg-amber-300 inline-block"></span>
          <span className="w-3.5 h-3.5 rounded-md bg-emerald-200 inline-block"></span>
          <span className="w-3.5 h-3.5 rounded-md bg-emerald-400 inline-block"></span>
          <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 inline-block"></span>
          <span>More (&gt;93%)</span>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-[60px_repeat(16,1fr)] gap-2 items-center">
            <div></div>
            {WEEKS.map((w) => (
              <div key={w} className="text-[11px] font-bold text-gray-400 text-center">
                {w}
              </div>
            ))}

            {DAYS.map((day, dayIdx) => (
              <React.Fragment key={day}>
                <div className="text-xs font-semibold text-gray-600">{day}</div>
                {HEATMAP_DATA[dayIdx].map((pct, weekIdx) => (
                  <div
                    key={weekIdx}
                    className={`h-10 rounded-xl flex items-center justify-center font-bold text-[11px] transition transform hover:scale-105 shadow-xs cursor-pointer ${getColor(pct)}`}
                    title={`${day} Week ${weekIdx + 1}: ${pct}% presence`}
                  >
                    {pct}%
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildGrid(entries) {
  const trained = new Set(entries.map(e => e.date));
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Start on the Sunday 25 weeks before the current week's Sunday
  const start = new Date(today);
  start.setDate(start.getDate() - start.getDay() - 25 * 7);

  const weeks = [];
  for (let w = 0; w < 26; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const dateStr = date.toISOString().slice(0, 10);
      week.push({
        dateStr,
        trained: trained.has(dateStr),
        isToday: dateStr === todayStr,
        isFuture: date > today,
        month: date.getMonth(),
      });
    }
    weeks.push(week);
  }
  return weeks;
}

const CELL = 11;
const GAP = 3;
const COL = CELL + GAP;
const DAY_W = 18;
const DAY_LABELS = ['', 'M', '', 'W', '', 'F', ''];

export default function Heatmap({ entries }) {
  const weeks = buildGrid(entries);

  const monthLabels = weeks.map((week, wi) => {
    if (wi === 0) return null;
    const cur = week[0].month;
    const prev = weeks[wi - 1][0].month;
    return cur !== prev
      ? new Date(week[0].dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })
      : null;
  });

  return (
    <div className="overflow-x-auto pb-1">
      {/* Month labels */}
      <div className="flex mb-1" style={{ paddingLeft: DAY_W }}>
        {weeks.map((_, wi) => (
          <div key={wi} style={{ width: COL, minWidth: COL }} className="text-[9px] text-slate-500 overflow-visible whitespace-nowrap">
            {monthLabels[wi] ?? ''}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex">
        {/* Day labels */}
        <div style={{ width: DAY_W, minWidth: DAY_W }} className="flex flex-col">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              style={{ height: CELL, marginBottom: i < 6 ? GAP : 0 }}
              className="text-[9px] text-slate-600 flex items-center justify-end pr-1"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {weeks.map((week, wi) => (
          <div key={wi} style={{ marginRight: GAP }}>
            {week.map((day, di) => (
              <div
                key={day.dateStr}
                title={day.dateStr}
                style={{ width: CELL, height: CELL, marginBottom: di < 6 ? GAP : 0, borderRadius: 2 }}
                className={
                  day.isFuture
                    ? 'bg-slate-800/30'
                    : day.trained
                    ? day.isToday ? 'bg-blue-400 ring-1 ring-blue-300' : 'bg-blue-500'
                    : day.isToday
                    ? 'bg-slate-600 ring-1 ring-slate-400'
                    : 'bg-slate-700'
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

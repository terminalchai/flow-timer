import { useMemo } from 'react'
import { addDays, startOfDay, subWeeks, format, isSameDay } from 'date-fns'

const WEEKS = 13
const DAYS  = 7

function buildGrid(sessions) {
  const today = startOfDay(new Date())
  const start = subWeeks(today, WEEKS - 1)
  const grid  = []

  for (let w = 0; w < WEEKS; w++) {
    const week = []
    for (let d = 0; d < DAYS; d++) {
      const date  = addDays(start, w * 7 + d)
      const count = sessions.filter(s => s.mode === 'FOCUS' && isSameDay(new Date(s.ts), date)).length
      week.push({ date, count })
    }
    grid.push(week)
  }
  return grid
}

function cellColor(count) {
  if (count === 0) return 'rgba(255,255,255,0.05)'
  if (count === 1) return 'rgba(16,185,129,0.25)'
  if (count === 2) return 'rgba(16,185,129,0.45)'
  if (count === 3) return 'rgba(16,185,129,0.65)'
  return 'rgba(16,185,129,0.85)'
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function Heatmap({ sessions }) {
  const grid = useMemo(() => buildGrid(sessions), [sessions])
  const cell = 10, gap = 2

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-3">Focus Heatmap</h3>
      <div className="overflow-x-auto">
        <div className="flex gap-[2px]">
          {/* day labels column */}
          <div className="flex flex-col gap-[2px] mr-1">
            {DAY_LABELS.map(l => (
              <div key={l} className="text-[9px] text-white/25 leading-[10px]" style={{ height: cell }}>{l}</div>
            ))}
          </div>
          {/* grid */}
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {week.map(({ date, count }) => (
                <div key={date.toISOString()}
                  title={`${format(date, 'MMM d')} — ${count} session${count !== 1 ? 's' : ''}`}
                  style={{ width: cell, height: cell, borderRadius: 2, background: cellColor(count) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* legend */}
      <div className="flex items-center gap-1 mt-3">
        <span className="text-[9px] text-white/25 mr-1">Less</span>
        {[0,1,2,3,4].map(c => (
          <div key={c} style={{ width: 8, height: 8, borderRadius: 1.5, background: cellColor(c) }} />
        ))}
        <span className="text-[9px] text-white/25 ml-1">More</span>
      </div>
    </div>
  )
}

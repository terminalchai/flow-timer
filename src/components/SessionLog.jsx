import { Timer, Coffee, Battery } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const MODE_META = {
  FOCUS:       { icon: Timer,   label: 'Focus',       color: '#fb923c' },
  SHORT_BREAK: { icon: Coffee,  label: 'Short Break', color: '#818cf8' },
  LONG_BREAK:  { icon: Battery, label: 'Long Break',  color: '#34d399' },
}

function fmtMins(ms) {
  const m = Math.floor(ms / 60000)
  return `${m}m`
}

function timeAgo(ts) {
  try { return formatDistanceToNow(new Date(ts), { addSuffix: true }) }
  catch { return '' }
}

export default function SessionLog({ sessions }) {
  const recent = [...sessions].reverse().slice(0, 10)

  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest">Recent Sessions</h3>
      {recent.length === 0
        ? <p className="text-xs text-white/25 text-center py-3">No sessions yet. Start your first one!</p>
        : (
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {recent.map((s, i) => {
              const meta = MODE_META[s.mode] ?? MODE_META.FOCUS
              return (
                <div key={i} className="flex items-center gap-3 py-1">
                  <meta.icon size={13} style={{ color: meta.color, flexShrink: 0 }} />
                  <span className="text-sm text-white/70 flex-1">{meta.label}</span>
                  <span className="text-xs font-mono" style={{ color: meta.color }}>{fmtMins(s.duration)}</span>
                  <span className="text-xs text-white/25">{timeAgo(s.ts)}</span>
                </div>
              )
            })}
          </div>
        )
      }
    </div>
  )
}

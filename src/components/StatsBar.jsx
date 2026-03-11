import { useMemo } from 'react'
import { startOfDay, startOfWeek, isAfter } from 'date-fns'
import { Flame, Clock, Calendar, TrendingUp } from 'lucide-react'

function calcStreak(sessions) {
  const focusDays = [...new Set(
    sessions.filter(s => s.mode === 'FOCUS').map(s => startOfDay(new Date(s.ts)).toISOString())
  )].sort((a, b) => b.localeCompare(a))

  if (focusDays.length === 0) return 0

  let streak = 0
  let cursor = startOfDay(new Date())

  for (const dayStr of focusDays) {
    const day = new Date(dayStr)
    const diff = Math.round((cursor - day) / 86400000)
    if (diff > 1) break
    streak++
    cursor = day
  }
  return streak
}

export default function StatsBar({ sessions }) {
  const stats = useMemo(() => {
    const now   = new Date()
    const today = startOfDay(now)
    const week  = startOfWeek(now, { weekStartsOn: 1 })

    const todayMs = sessions.filter(s => s.mode === 'FOCUS' && isAfter(new Date(s.ts), today))
      .reduce((acc, s) => acc + s.duration, 0)
    const weekMs = sessions.filter(s => s.mode === 'FOCUS' && isAfter(new Date(s.ts), week))
      .reduce((acc, s) => acc + s.duration, 0)
    const total = sessions.filter(s => s.mode === 'FOCUS').length
    const streak = calcStreak(sessions)

    return {
      todayMin:  Math.floor(todayMs / 60000),
      weekMin:   Math.floor(weekMs  / 60000),
      total,
      streak,
    }
  }, [sessions])

  const items = [
    { icon: Clock,     label: 'Today',    value: `${stats.todayMin}m`, color: '#fb923c' },
    { icon: Calendar,  label: 'This Week', value: `${stats.weekMin}m`, color: '#818cf8' },
    { icon: TrendingUp,label: 'Sessions',  value: stats.total,          color: '#34d399' },
    { icon: Flame,     label: 'Streak',   value: `${stats.streak}d`,   color: '#f43f5e' },
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map(item => (
        <div key={item.label} className="glass rounded-xl p-3 flex flex-col items-center gap-1">
          <item.icon size={13} style={{ color: item.color }} />
          <span className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{item.value}</span>
          <span className="text-[10px] text-white/35">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

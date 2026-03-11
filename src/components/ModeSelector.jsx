import { motion } from 'framer-motion'

const MODES = [
  { key: 'FOCUS',       label: 'Focus',       color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  { key: 'SHORT_BREAK', label: 'Short Break', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  { key: 'LONG_BREAK',  label: 'Long Break',  color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
]

export default function ModeSelector({ current, onSwitch }) {
  return (
    <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
      {MODES.map(m => {
        const active = current === m.key
        return (
          <button key={m.key} onClick={() => onSwitch(m.key)}
            className="relative flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            style={{ color: active ? m.color : 'rgba(255,255,255,0.35)' }}>
            {active && (
              <motion.div layoutId="mode-pill" className="absolute inset-0 rounded-lg"
                style={{ background: m.bg }} transition={{ type: 'spring', stiffness: 340, damping: 30 }} />
            )}
            <span className="relative z-10">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}

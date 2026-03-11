import { motion } from 'framer-motion'

const R = 110
const CIRC = 2 * Math.PI * R // 691.15

const MODE_COLORS = {
  FOCUS:       { stroke: 'url(#ring-focus)',  glow: 'rgba(249,115,22,0.4)'  },
  SHORT_BREAK: { stroke: 'url(#ring-break)',  glow: 'rgba(99,102,241,0.4)'  },
  LONG_BREAK:  { stroke: 'url(#ring-long)',   glow: 'rgba(16,185,129,0.4)'  },
}

export default function TimerRing({ progress, display, label, mode, running }) {
  const offset = CIRC * (1 - progress)
  const colors = MODE_COLORS[mode] ?? MODE_COLORS.FOCUS

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: 280, height: 280 }}>
      {/* glow pulse when running */}
      {running && (
        <motion.div className="absolute inset-0 rounded-full"
          animate={{ opacity: [0.12, 0.28, 0.12], scale: [0.92, 1.04, 0.92] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: colors.glow, filter: 'blur(24px)' }} />
      )}

      <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280" overflow="visible">
        <defs>
          <linearGradient id="ring-focus" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="ring-break" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="ring-long" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>

        {/* track */}
        <circle cx="140" cy="140" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />

        {/* progress arc */}
        <motion.circle
          cx="140" cy="140" r={R}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="ring-transition"
        />
      </svg>

      {/* inner text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <motion.span
          key={display}
          initial={{ opacity: 0.6, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl font-bold text-white tabular-nums"
          style={{ fontFamily: 'var(--font-display)' }}>
          {display}
        </motion.span>
        <span className="text-xs uppercase tracking-widest font-medium text-white/35">{label}</span>
      </div>
    </div>
  )
}

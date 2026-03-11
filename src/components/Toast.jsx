import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Info } from 'lucide-react'

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [message, onClose])

  const palette = {
    success: { icon: CheckCircle2, color: '#34d399', bg: 'rgba(16,185,129,0.12)' },
    info:    { icon: Info,          color: '#fb923c', bg: 'rgba(249,115,22,0.12)'  },
  }
  const p = palette[type] ?? palette.info
  const Icon = p.icon

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          animate={{ opacity: 1, y: 0,  scale: 1     }}
          exit={{    opacity: 0, y: 30, scale: 0.94  }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
          style={{ background: 'rgba(14,14,26,0.97)', border: '1px solid rgba(255,255,255,0.1)', minWidth: 260 }}>
          <Icon size={16} style={{ color: p.color, flexShrink: 0 }} />
          <span className="text-sm text-white/90 flex-1">{message}</span>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors cursor-pointer">
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

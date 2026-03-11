import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Volume2, VolumeX, Zap } from 'lucide-react'

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className="w-10 h-5 rounded-full relative transition-colors cursor-pointer"
      style={{ background: checked ? '#f97316' : 'rgba(255,255,255,0.1)' }}>
      <motion.div animate={{ left: checked ? '22px' : '2px' }}
        className="absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow"
        style={{ position: 'absolute' }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
    </button>
  )
}

function Slider({ label, value, min, max, step = 1, onChange, unit = 'min' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-xs font-mono" style={{ color: '#fb923c' }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: '#f97316', background: `linear-gradient(to right, #f97316 ${((value-min)/(max-min))*100}%, rgba(255,255,255,0.1) 0%)` }}
      />
    </div>
  )
}

export default function SettingsModal({ open, settings, onChange, onClose }) {
  function set(key, val) { onChange({ ...settings, [key]: val }) }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 60, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[90] w-full md:max-w-md"
          >
            <div className="glass rounded-t-3xl md:rounded-3xl p-6 border border-white/8 shadow-2xl">
              {/* header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Settings</h2>
                <button onClick={onClose} className="text-white/40 hover:text-white/80 transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-5">
                {/* durations */}
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] text-white/35 uppercase tracking-widest font-semibold">Durations</p>
                  <Slider label="Focus" value={settings.focusDuration} min={1} max={90} onChange={v => set('focusDuration', v)} />
                  <Slider label="Short Break" value={settings.shortBreakDuration} min={1} max={30} onChange={v => set('shortBreakDuration', v)} />
                  <Slider label="Long Break" value={settings.longBreakDuration} min={5} max={60} onChange={v => set('longBreakDuration', v)} />
                  <Slider label="Long Break Interval" value={settings.longBreakInterval} min={2} max={8} unit=" sessions" onChange={v => set('longBreakInterval', v)} />
                </div>

                {/* toggles */}
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] text-white/35 uppercase tracking-widest font-semibold">Automation</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/80">Auto-start Breaks</p>
                      <p className="text-xs text-white/35">Break timer starts automatically</p>
                    </div>
                    <Toggle checked={settings.autoStartBreak} onChange={v => set('autoStartBreak', v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/80">Auto-start Focus</p>
                      <p className="text-xs text-white/35">Focus timer starts after break</p>
                    </div>
                    <Toggle checked={settings.autoStartFocus} onChange={v => set('autoStartFocus', v)} />
                  </div>
                </div>

                {/* sound */}
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] text-white/35 uppercase tracking-widest font-semibold">Sound</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 size={14} style={{ color: '#fb923c' }} />
                      <p className="text-sm text-white/80">Session Bell</p>
                    </div>
                    <Toggle checked={settings.soundEnabled} onChange={v => set('soundEnabled', v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap size={14} style={{ color: '#fb923c' }} />
                      <p className="text-sm text-white/80">Tick Sound</p>
                    </div>
                    <Toggle checked={settings.tickEnabled} onChange={v => set('tickEnabled', v)} />
                  </div>
                </div>
              </div>

              <button onClick={onClose}
                className="mt-6 w-full py-3 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                Save & Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

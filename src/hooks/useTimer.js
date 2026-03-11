import { useState, useEffect, useRef, useCallback } from 'react'

export const MODES = {
  FOCUS:       'FOCUS',
  SHORT_BREAK: 'SHORT_BREAK',
  LONG_BREAK:  'LONG_BREAK',
}

const MODE_LABELS = {
  [MODES.FOCUS]:       'Focus',
  [MODES.SHORT_BREAK]: 'Short Break',
  [MODES.LONG_BREAK]:  'Long Break',
}

// ─── Web Audio helpers ─────────────────────────────────────────────────────
let audioCtx = null
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  return audioCtx
}

function playTick(volume = 0.08) {
  try {
    const ctx = getAudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    osc.start(); osc.stop(ctx.currentTime + 0.04)
  } catch {}
}

function playBell(mode) {
  try {
    const ctx = getAudioCtx()
    const freqs = mode === MODES.FOCUS ? [523, 659, 784] : [784, 659, 523]
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.25)
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.25)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.6)
      osc.start(ctx.currentTime + i * 0.25)
      osc.stop(ctx.currentTime + i * 0.25 + 0.6)
    })
  } catch {}
}

// ─── Hook ─────────────────────────────────────────────────────────────────
export default function useTimer({ settings, onSessionComplete }) {
  const [mode,        setMode]        = useState(MODES.FOCUS)
  const [secondsLeft, setSecondsLeft] = useState(settings.focusDuration * 60)
  const [running,     setRunning]     = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)

  const intervalRef = useRef(null)
  const startedAtRef = useRef(null)

  const getDuration = useCallback((m = mode) => {
    if (m === MODES.FOCUS)       return settings.focusDuration * 60
    if (m === MODES.SHORT_BREAK) return settings.shortBreakDuration * 60
    return settings.longBreakDuration * 60
  }, [mode, settings])

  // reset when settings change while not running
  useEffect(() => {
    if (!running) setSecondsLeft(getDuration(mode))
  }, [settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration])

  // tick
  useEffect(() => {
    if (!running) { clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(() => {
      if (settings.tickEnabled && settings.soundEnabled) playTick()
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          handleSessionEnd()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, mode, settings])

  function handleSessionEnd() {
    if (settings.soundEnabled) playBell(mode)

    if (mode === MODES.FOCUS) {
      const newCount = sessionsCompleted + 1
      setSessionsCompleted(newCount)
      onSessionComplete?.({ mode: MODES.FOCUS, duration: settings.focusDuration * 60 * 1000, completedAt: Date.now() })

      const isLongBreak = newCount % settings.longBreakInterval === 0
      const nextMode = isLongBreak ? MODES.LONG_BREAK : MODES.SHORT_BREAK
      setMode(nextMode)
      setSecondsLeft(getDuration(nextMode))
      setRunning(settings.autoStartBreak)
    } else {
      onSessionComplete?.({ mode, duration: (mode === MODES.SHORT_BREAK ? settings.shortBreakDuration : settings.longBreakDuration) * 60 * 1000, completedAt: Date.now() })
      setMode(MODES.FOCUS)
      setSecondsLeft(getDuration(MODES.FOCUS))
      setRunning(settings.autoStartFocus)
    }
  }

  const start  = useCallback(() => { startedAtRef.current = Date.now(); setRunning(true) }, [])
  const pause  = useCallback(() => setRunning(false), [])
  const reset  = useCallback(() => { setRunning(false); setSecondsLeft(getDuration(mode)) }, [getDuration, mode])
  const skip   = useCallback(() => { setRunning(false); handleSessionEnd() }, [mode, sessionsCompleted, settings])

  const switchMode = useCallback((m) => {
    setRunning(false)
    setMode(m)
    setSecondsLeft(getDuration(m))
  }, [getDuration])

  const total    = getDuration(mode)
  const progress = total > 0 ? (total - secondsLeft) / total : 0
  const minutes  = Math.floor(secondsLeft / 60)
  const seconds  = secondsLeft % 60
  const display  = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`
  const label    = MODE_LABELS[mode]

  return {
    mode, running, secondsLeft, progress, display, label,
    sessionsCompleted, start, pause, reset, skip, switchMode,
    playBell, playTick,
  }
}

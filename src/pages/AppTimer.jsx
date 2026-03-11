import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Settings, Timer, Play, Pause, SkipForward, RotateCcw, Home } from 'lucide-react'

import { useSettings, useSessions, useTasks } from '../hooks/useStorage'
import useTimer from '../hooks/useTimer'
import TimerRing     from '../components/TimerRing'
import ModeSelector  from '../components/ModeSelector'
import TaskList      from '../components/TaskList'
import SessionLog    from '../components/SessionLog'
import Heatmap       from '../components/Heatmap'
import StatsBar      from '../components/StatsBar'
import SettingsModal from '../components/SettingsModal'
import Toast         from '../components/Toast'

// dot indicators for session progress
function SessionDots({ count, interval }) {
  const total = interval ?? 4
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="w-2 h-2 rounded-full transition-colors"
          style={{ background: i < (count % total) ? '#f97316' : 'rgba(255,255,255,0.12)' }} />
      ))}
    </div>
  )
}

export default function AppTimer() {
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const { settings, updateSettings: saveSettings } = useSettings()
  const { sessions, addSession }   = useSessions()
  const { tasks, addTask, toggleTask, deleteTask, clearDone } = useTasks()

  const handleSessionComplete = useCallback(({ mode, duration }) => {
    addSession({ mode, duration, ts: Date.now() })
    setToast({
      message: mode === 'FOCUS'
        ? `Focus session done! ${Math.round(duration / 60000)}m in the bag 🔥`
        : 'Break over — back to work!',
      type: mode === 'FOCUS' ? 'success' : 'info'
    })
  }, [addSession])

  const { mode, running, secondsLeft, progress, display, label, sessionsCompleted,
    start, pause, reset, skip, switchMode } = useTimer({ settings, onSessionComplete: handleSessionComplete })

  const modeGlow = {
    FOCUS:       '0 0 80px rgba(249,115,22,0.12)',
    SHORT_BREAK: '0 0 80px rgba(99,102,241,0.12)',
    LONG_BREAK:  '0 0 80px rgba(16,185,129,0.12)',
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#060610' }}>
      {/* ambient */}
      <div className="blob w-[500px] h-[500px] top-[-100px] left-[-100px] opacity-[0.06] pointer-events-none"
        style={{ background: mode === 'FOCUS' ? '#f97316' : mode === 'SHORT_BREAK' ? '#6366f1' : '#10b981', transition: 'background 1s' }} />
      <div className="blob w-[400px] h-[400px] bottom-[-50px] right-[-50px] opacity-[0.05] pointer-events-none"
        style={{ background: '#6366f1' }} />

      {/* nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            <Timer size={13} className="text-white" />
          </div>
          <span className="font-bold text-base text-white" style={{ fontFamily: 'var(--font-display)' }}>FlowTimer</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')}
            className="w-11 h-11 flex items-center justify-center rounded-xl glass text-white/40 hover:text-white/80 transition-colors cursor-pointer">
            <Home size={17} />
          </button>
          <button onClick={() => setSettingsOpen(true)}
            className="w-11 h-11 flex items-center justify-center rounded-xl glass text-white/40 hover:text-white/80 transition-colors cursor-pointer">
            <Settings size={17} />
          </button>
        </div>
      </nav>

      {/* main layout */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

        {/* left — timer */}
        <div className="flex flex-col items-center gap-6">
          <motion.div key={mode} initial={{ opacity: 0.8, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full glass rounded-3xl p-8 flex flex-col items-center gap-6"
            style={{ boxShadow: modeGlow[mode] }}>
            <ModeSelector current={mode} onSwitch={switchMode} />

            <TimerRing
              progress={progress}
              display={display}
              label={label}
              mode={mode}
              running={running}
            />

            {/* session dots */}
            <SessionDots count={sessionsCompleted} interval={settings.longBreakInterval} />

            {/* controls */}
            <div className="flex items-center gap-3">
              <button data-testid="timer-reset" onClick={reset}
                className="w-11 h-11 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white/80 transition-colors cursor-pointer">
                <RotateCcw size={15} />
              </button>
              <button data-testid="timer-play" onClick={running ? pause : start}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 0 30px rgba(249,115,22,0.35)' }}>
                {running ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" className="ml-0.5" />}
              </button>
              <button data-testid="timer-skip" onClick={skip}
                className="w-11 h-11 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white/80 transition-colors cursor-pointer">
                <SkipForward size={15} />
              </button>
            </div>

            {/* session count caption */}
            <p className="text-xs text-white/25">
              Session {sessionsCompleted + 1} · Long break every {settings.longBreakInterval} sessions
            </p>
          </motion.div>

          {/* stats row */}
          <div className="w-full">
            <StatsBar sessions={sessions} />
          </div>

          {/* heatmap */}
          <div className="w-full">
            <Heatmap sessions={sessions} />
          </div>
        </div>

        {/* right — tasks + log */}
        <div className="flex flex-col gap-4">
          <TaskList
            tasks={tasks}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onClearDone={clearDone}
          />
          <SessionLog sessions={sessions} />
        </div>
      </main>

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onChange={saveSettings}
        onClose={() => setSettingsOpen(false)}
      />

      <Toast
        message={toast?.message ?? null}
        type={toast?.type ?? 'info'}
        onClose={() => setToast(null)}
      />
    </div>
  )
}

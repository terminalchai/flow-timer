import { useState, useCallback } from 'react'

const KEYS = {
  settings: 'flowtimer-settings',
  sessions:  'flowtimer-sessions',
  tasks:     'flowtimer-tasks',
}

const DEFAULT_SETTINGS = {
  focusDuration:      25,
  shortBreakDuration: 5,
  longBreakDuration:  15,
  longBreakInterval:  4,
  autoStartBreak:     false,
  autoStartFocus:     false,
  soundEnabled:       true,
  tickEnabled:        false,
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

// ─── Settings ─────────────────────────────────────────────────────────────
export function useSettings() {
  const [settings, setSettingsState] = useState(() => ({
    ...DEFAULT_SETTINGS,
    ...load(KEYS.settings, {}),
  }))

  const updateSettings = useCallback((patch) => {
    setSettingsState(prev => {
      const next = { ...prev, ...patch }
      save(KEYS.settings, next)
      return next
    })
  }, [])

  return { settings, updateSettings }
}

// ─── Sessions ─────────────────────────────────────────────────────────────
export function useSessions() {
  const [sessions, setSessionsState] = useState(() => load(KEYS.sessions, []))

  const addSession = useCallback((session) => {
    setSessionsState(prev => {
      const next = [session, ...prev].slice(0, 200)
      save(KEYS.sessions, next)
      return next
    })
  }, [])

  const clearSessions = useCallback(() => {
    setSessionsState([])
    save(KEYS.sessions, [])
  }, [])

  return { sessions, addSession, clearSessions }
}

// ─── Tasks ────────────────────────────────────────────────────────────────
export function useTasks() {
  const [tasks, setTasksState] = useState(() => load(KEYS.tasks, []))

  const addTask = useCallback((text) => {
    const task = { id: Date.now().toString(), text, done: false, createdAt: Date.now() }
    setTasksState(prev => {
      const next = [task, ...prev]
      save(KEYS.tasks, next)
      return next
    })
    return task
  }, [])

  const toggleTask = useCallback((id) => {
    setTasksState(prev => {
      const next = prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
      save(KEYS.tasks, next)
      return next
    })
  }, [])

  const deleteTask = useCallback((id) => {
    setTasksState(prev => {
      const next = prev.filter(t => t.id !== id)
      save(KEYS.tasks, next)
      return next
    })
  }, [])

  const clearDone = useCallback(() => {
    setTasksState(prev => {
      const next = prev.filter(t => !t.done)
      save(KEYS.tasks, next)
      return next
    })
  }, [])

  return { tasks, addTask, toggleTask, deleteTask, clearDone }
}

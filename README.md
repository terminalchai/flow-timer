# FlowTimer

A Pomodoro-style focus timer built for developers. Track work sessions, manage tasks, and visualise productivity over time — all in the browser, no account needed.

**Live →** [flow-timer-eosin.vercel.app](https://flow-timer-eosin.vercel.app)

---

## Features

- **Focus / Short Break / Long Break** modes with configurable durations
- **Animated SVG ring** with per-mode colour theming (orange / indigo / green)
- **Task list** with add, complete, and clear-done actions  
- **Session log** — every completed session stored in `localStorage`
- **Activity heatmap** — GitHub-style grid showing daily session density
- **Stats bar** — today's focus time, current streak, total sessions, weekly hours
- **Settings modal** — edit durations, toggle auto-start, enable/disable tick & bell sounds
- **Web Audio API** — tick and bell tones, no external sound files
- **Zero backend** — everything lives in `localStorage`

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion 12 |
| Icons | Lucide React |
| Routing | React Router DOM v7 |
| Date utils | date-fns |
| Testing | Playwright (81 checks — 0 fail) |

---

## Getting Started

```bash
# Install
npm install

# Dev server  →  http://localhost:5173
npm run dev

# Production build
npm run build
```

---

## Project Structure

```
src/
├── pages/
│   ├── Landing.jsx        # Cinematic dark landing page
│   └── AppTimer.jsx       # Main app — timer + tasks + stats
├── components/
│   ├── TimerRing.jsx      # Animated SVG countdown ring
│   ├── ModeSelector.jsx   # Focus / Short Break / Long Break tabs
│   ├── TaskList.jsx       # Task management panel
│   ├── SessionLog.jsx     # Recent sessions list
│   ├── Heatmap.jsx        # Activity heatmap grid
│   ├── StatsBar.jsx       # Today / Streak / Total / Weekly stats
│   ├── SettingsModal.jsx  # Slide-up settings modal
│   └── Toast.jsx          # Notification toasts
└── hooks/
    ├── useTimer.js        # Core Pomodoro countdown logic + Web Audio
    └── useStorage.js      # localStorage hooks: settings, sessions, tasks
```

---

## Audit

Fully audited with Playwright — 81 checks across landing page, app structure, timer functionality, mode switching, task list, settings, persistence, navigation, responsive (375 / 768 / 1440px), accessibility, and UX details.

```
✅ PASS  81
⚠️  WARN   0
❌ FAIL   0
```

---

## License

MIT — [terminalchai](https://github.com/terminalchai)

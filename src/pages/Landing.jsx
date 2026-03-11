import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Timer, CheckSquare, BarChart2, Flame, Github, ArrowRight, Zap, Target, Coffee, TrendingUp, Lock, Volume2 } from 'lucide-react'

const FEATURES = [
  { icon: Timer,      title: 'Pomodoro Timer',      desc: 'Focus & break cycles with fully customisable durations. 25/5, 50/10, or whatever works for you.' },
  { icon: CheckSquare,title: 'Task Tracking',        desc: 'Build your task list before you start, tick them off in session. Stay accountable.' },
  { icon: BarChart2,  title: 'Session History',      desc: 'Every focus session logged. See your total focus time today, this week, all time.' },
  { icon: Flame,      title: 'Focus Streaks',        desc: 'GitHub-style heatmap shows your daily focus habits. Build the streak, feel the momentum.' },
  { icon: Volume2,    title: 'Ambient Sounds',        desc: 'Gentle tick and bell sounds powered by Web Audio — no files, no latency, always crisp.' },
  { icon: Lock,       title: 'Fully Private',        desc: 'Zero servers. All data lives in your browser. No account, no tracking, no noise.' },
]

const MOCK_SESSIONS = [
  { mode: 'Focus',       mins: 25, time: '2 min ago'  },
  { mode: 'Short Break', mins: 5,  time: '28 min ago' },
  { mode: 'Focus',       mins: 25, time: '33 min ago' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#060610' }}>
      {/* ambient blobs */}
      <div className="blob w-[600px] h-[600px] top-[-200px] left-[-200px] opacity-[0.07]" style={{ background: '#f97316' }} />
      <div className="blob w-[500px] h-[500px] top-[200px] right-[-150px] opacity-[0.05]" style={{ background: '#6366f1' }} />
      <div className="blob w-[400px] h-[400px] bottom-[100px] left-[30%] opacity-[0.05]" style={{ background: '#f97316' }} />

      {/* nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            <Timer size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white" style={{ fontFamily: 'var(--font-display)' }}>FlowTimer</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://github.com/terminalchai/flow-timer" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors">
            <Github size={16} /> GitHub
          </a>
          <button onClick={() => navigate('/app')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            Start Focusing <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-24 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 border"
            style={{ background: 'rgba(249,115,22,0.1)', borderColor: 'rgba(249,115,22,0.25)', color: '#fb923c' }}>
            <Zap size={11} /> Zero cost · Zero server · 100% local
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}>
            Stay in{' '}
            <span style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Flow.
            </span>
            <br />Ship more code.
          </h1>
          <p className="text-lg text-white/55 max-w-xl mx-auto mb-10 leading-relaxed">
            A minimal Pomodoro timer for developers. Track focus sessions, manage tasks, build streaks — all in your browser. No account needed.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={() => navigate('/app')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 0 30px rgba(249,115,22,0.3)' }}>
              <Timer size={16} /> Start Your Session
            </button>
            <a href="#features"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white glass transition-all cursor-pointer">
              See Features
            </a>
          </div>
        </motion.div>

        {/* mock UI preview */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-20 relative">
          <div className="glass rounded-2xl overflow-hidden border border-white/8 shadow-2xl max-w-2xl mx-auto"
            style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(249,115,22,0.08)' }}>
            {/* title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs text-white/25 font-mono">flowtimer.app</span>
            </div>
            <div className="p-8 flex flex-col items-center gap-6">
              {/* mode tabs */}
              <div className="flex gap-2">
                {['Focus', 'Short Break', 'Long Break'].map((m, i) => (
                  <div key={m} className={`px-3 py-1 rounded-lg text-xs font-medium ${i === 0 ? 'text-white' : 'text-white/30'}`}
                    style={i === 0 ? { background: 'rgba(249,115,22,0.2)', color: '#fb923c' } : {}}>
                    {m}
                  </div>
                ))}
              </div>
              {/* fake ring */}
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle cx="80" cy="80" r="68" fill="none" stroke="url(#grad)" strokeWidth="8"
                    strokeLinecap="round" strokeDasharray="427.26" strokeDashoffset="106.8" />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>18:46</span>
                  <span className="text-xs text-white/40 mt-1">Focus</span>
                </div>
              </div>
              {/* sessions */}
              <div className="flex gap-6 text-center">
                <div><div className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>3</div><div className="text-xs text-white/40">Sessions</div></div>
                <div><div className="text-lg font-bold" style={{ color: '#fb923c', fontFamily: 'var(--font-display)' }}>1h 15m</div><div className="text-xs text-white/40">Today</div></div>
                <div><div className="text-lg font-bold" style={{ color: '#34d399', fontFamily: 'var(--font-display)' }}>5🔥</div><div className="text-xs text-white/40">Streak</div></div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* features */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <p className="text-center text-xs font-semibold text-white/25 uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-center text-3xl font-bold text-white mb-12" style={{ fontFamily: 'var(--font-display)' }}>
            Everything you need to stay focused
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}
              className="glass rounded-2xl p-5 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(249,115,22,0.12)', color: '#fb923c' }}>
                <f.icon size={16} />
              </div>
              <h3 className="font-semibold text-white text-sm" style={{ fontFamily: 'var(--font-display)' }}>{f.title}</h3>
              <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass rounded-3xl p-10 text-center glow-focus border border-white/6">
          <Target size={28} className="mx-auto mb-4" style={{ color: '#fb923c' }} />
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>Ready to get in flow?</h2>
          <p className="text-white/50 text-sm mb-6">Open the timer and start your first session. No signup, just focus.</p>
          <button onClick={() => navigate('/app')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            <Timer size={15} /> Open FlowTimer
          </button>
        </motion.div>
      </section>

      {/* footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 md:px-12 py-6 text-center">
        <p className="text-xs text-white/25">
          Built by{' '}
          <a href="https://github.com/terminalchai" target="_blank" rel="noreferrer"
            className="text-white/50 hover:text-white/80 transition-colors">terminalchai</a>
          {' '}· No cookies. No tracking. No nonsense.
        </p>
      </footer>
    </div>
  )
}

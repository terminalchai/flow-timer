import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, CheckCircle2, Circle, X } from 'lucide-react'

export default function TaskList({ tasks, onAdd, onToggle, onDelete, onClearDone }) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  function submit() {
    const t = input.trim()
    if (!t) return
    onAdd(t)
    setInput('')
    inputRef.current?.focus()
  }

  const done  = tasks.filter(t => t.done)
  const pending = tasks.filter(t => !t.done)

  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-widest">Tasks</h3>
        {done.length > 0 && (
          <button onClick={onClearDone} className="text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer">
            Clear done ({done.length})
          </button>
        )}
      </div>

      {/* input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Add a task…"
          className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-orange-500/50 transition-colors"
        />
        <button onClick={submit} disabled={!input.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-30"
          style={{ background: 'rgba(249,115,22,0.2)', color: '#fb923c' }}>
          <Plus size={15} />
        </button>
      </div>

      {/* list */}
      <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-0.5">
        <AnimatePresence initial={false}>
          {[...pending, ...done].map(task => (
            <motion.div key={task.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{    opacity: 0, height: 0 }}
              className="flex items-center gap-2 group">
              <button onClick={() => onToggle(task.id)} className="flex-shrink-0 cursor-pointer text-white/25 hover:text-white/70 transition-colors">
                {task.done
                  ? <CheckCircle2 size={16} style={{ color: '#34d399' }} />
                  : <Circle size={16} />}
              </button>
              <span className={`flex-1 text-sm leading-relaxed ${task.done ? 'line-through text-white/30' : 'text-white/80'}`}>
                {task.text}
              </span>
              <button onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white/25 hover:text-red-400">
                <X size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <p className="text-xs text-white/25 text-center py-3">No tasks yet. Add one above.</p>
        )}
      </div>
    </div>
  )
}

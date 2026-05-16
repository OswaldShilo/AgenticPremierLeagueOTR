import { useState, useEffect, useRef } from 'react'
import { aiApi } from '../services/api'

const AI_BOT = 'Kickoff AI'
const REACTIONS = ['Goal!', 'Fire', 'Wow', 'GG', 'Miss', 'Yes!']

function Message({ msg }) {
  const isAI = msg.user === AI_BOT || msg.type === 'ai_event'

  if (isAI) {
    return (
      <div className="bg-blue-600 p-5 rounded-[1.5rem] shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-white/20 p-1 rounded-lg">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Kickoff AI Agent</span>
          <span className="ml-auto text-[9px] text-white/50">
            {new Date(msg.ts || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-[11px] text-white/90 leading-relaxed font-semibold">
          "{msg.message || msg.commentary}"
        </p>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <img
        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user || 'Fan'}`}
        className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 shrink-0"
        alt=""
      />
      <div className="flex-1">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-tight">{msg.user || 'Fan'}</span>
          <span className="text-[9px] text-gray-300">
            {new Date(msg.ts || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl rounded-tl-none">
          <p className="text-[11px] text-gray-600 leading-normal font-medium">{msg.message}</p>
        </div>
      </div>
    </div>
  )
}

export default function ChatRoom({ messages, onSend, fixture }) {
  const [input, setInput] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [username] = useState(`Fan${Math.floor(Math.random() * 9000) + 1000}`)
  const bottomRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, autoScroll])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    setAutoScroll(atBottom)
  }

  const send = () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    if (text.toLowerCase().startsWith('@ai ')) {
      const question = text.slice(4)
      const match_context = fixture
        ? {
            home: fixture.teams.home.name,
            away: fixture.teams.away.name,
            score: `${fixture.goals.home ?? 0}-${fixture.goals.away ?? 0}`,
            minute: fixture.fixture.status.elapsed,
          }
        : {}
      onSend(text, username)
      aiApi.ask(question, match_context)
        .then((data) => onSend(data.answer, AI_BOT))
        .catch(() => {})
    } else {
      onSend(text, username)
    }
  }

  return (
    <div className="outdrop-container flex-1 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white/40">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-800">Fan Arena</h3>
        </div>
        <div className="flex items-center gap-3">
          {!autoScroll && (
            <button
              onClick={() => { setAutoScroll(true); bottomRef.current?.scrollIntoView() }}
              className="text-[9px] font-black text-blue-600 uppercase tracking-wide"
            >↓ Latest</button>
          )}
          <span className="text-[9px] font-black text-gray-400 uppercase">
            {messages.length > 0 ? `${Math.min(messages.length, 999)} msgs` : 'Live'}
          </span>
        </div>
      </div>

      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-300 text-xs font-semibold">No messages yet.</p>
            <p className="text-gray-400 text-[10px] mt-2 font-medium">
              Be the first!<br />
              Try: <span className="text-blue-600 font-bold">@AI what's the xG?</span>
            </p>
          </div>
        )}
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-1 px-6 py-3 border-t border-gray-100">
        {REACTIONS.map((r) => (
          <button key={r} onClick={() => onSend(r, username)}
            className="text-[9px] font-black uppercase tracking-wide text-gray-400 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-all border border-gray-100 hover:border-blue-100"
          >{r}</button>
        ))}
      </div>

      <div className="p-6 border-t border-gray-100 bg-white/40">
        <div className="relative">
          <input
            className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-6 pr-14 text-xs font-semibold shadow-inner outline-none focus:ring-4 focus:ring-blue-50 transition-all text-gray-800 placeholder-gray-400"
            placeholder="Message or @AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button
            onClick={send}
            className="absolute right-2.5 top-2.5 bottom-2.5 bg-black text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

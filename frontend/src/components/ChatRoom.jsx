import { useState, useEffect, useRef } from 'react'
import { aiApi } from '../services/api'

const AI_BOT = 'Kickoff AI'
const EMOJIS = ['⚽', '🔥', '😱', '👏', '💔', '🎉']

function Message({ msg }) {
  const isAI = msg.user === AI_BOT
  const isSystem = msg.type === 'ai_event'

  return (
    <div className={`px-3 py-2 ${isSystem || isAI ? 'bg-slate-800/60 border-l-2 border-accent' : ''}`}>
      <div className="flex items-baseline gap-2">
        <span className={`text-xs font-semibold ${isAI ? 'text-accent' : 'text-slate-400'}`}>
          {isAI ? '🤖 ' : ''}{msg.user || 'Fan'}
          {isAI && <span className="ml-1 text-[10px] bg-accent/20 text-accent px-1 rounded">AI</span>}
        </span>
        <span className="text-[11px] text-slate-600">
          {new Date(msg.ts || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <p className="text-sm text-slate-200 mt-0.5 leading-snug">{msg.message || msg.commentary}</p>
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

      aiApi.ask(question, match_context)
        .then((data) => {
          onSend(`@${username}: ${text}`, username)
          // AI reply arrives via WS broadcast from server, so we just let it flow
          // For local display while WS isn't up, add it directly:
          const fakeAiMsg = {
            type: 'chat',
            user: AI_BOT,
            message: data.answer,
            ts: Date.now(),
          }
          // We push it into messages by re-using onSend workaround — the WS will also deliver
          onSend(fakeAiMsg.message, AI_BOT)
        })
        .catch(() => onSend(text, username))
    } else {
      onSend(text, username)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Chat</span>
        <span className="text-xs text-slate-600">You: {username}</span>
      </div>

      {/* Message list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto divide-y divide-slate-800/50"
      >
        {messages.length === 0 && (
          <p className="text-slate-500 text-xs px-4 py-6 text-center">
            No messages yet. Be the first to chat!<br />
            Tip: type <span className="text-accent">@AI your question</span> to ask the AI.
          </p>
        )}
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Emoji quick-react */}
      <div className="flex gap-1 px-3 py-1 border-t border-slate-800">
        {EMOJIS.map((e) => (
          <button
            key={e}
            onClick={() => onSend(e, username)}
            className="text-lg hover:scale-125 transition-transform"
          >
            {e}
          </button>
        ))}
        {!autoScroll && (
          <button
            onClick={() => { setAutoScroll(true); bottomRef.current?.scrollIntoView() }}
            className="ml-auto text-xs text-accent"
          >
            ↓ Latest
          </button>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 px-3 py-2 border-t border-slate-800">
        <input
          className="flex-1 bg-slate-800 text-sm rounded px-3 py-2 text-slate-200 placeholder-slate-500 outline-none focus:ring-1 focus:ring-accent"
          placeholder="Message… or @AI ask something"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          className="bg-accent text-slate-900 font-semibold text-sm px-3 py-2 rounded hover:opacity-90"
        >
          Send
        </button>
      </div>
    </div>
  )
}

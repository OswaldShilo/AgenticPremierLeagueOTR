import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import MatchHub from './components/MatchHub'
import VideoPlayer from './components/VideoPlayer'
import ChatRoom from './components/ChatRoom'
import { footballApi, createChatSocket } from './services/api'

const TICKER_FALLBACK = ['AI Agent Active', 'Real-time Analytics', 'Powered by Gemini', 'Google Cloud Run']

function StatsTicker({ fixtures }) {
  const items = fixtures.length > 0
    ? fixtures.flatMap((f) => [
        `${f.teams.home.name} ${f.goals.home ?? 0} - ${f.goals.away ?? 0} ${f.teams.away.name}`,
        `${f.fixture.status.elapsed ? f.fixture.status.elapsed + "'" : ''} ${f.league.name}`.trim(),
      ])
    : TICKER_FALLBACK
  const doubled = [...items, ...items]
  return (
    <footer className="outdrop-container h-12 shrink-0 flex items-center overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 bg-white px-6 flex items-center z-20 border-r border-gray-100">
        <span className="text-[10px] font-black text-black uppercase tracking-widest">Real-time Analytics</span>
      </div>
      <div className="flex items-center pl-44 w-full overflow-hidden">
        <div className="animate-marquee flex items-center gap-12 text-gray-500">
          {doubled.map((item, i) => (
            <span key={i} className="text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap">{item}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}

function KickoffApp() {
  const [fixtures, setFixtures] = useState([])
  const [selectedFixture, setSelectedFixture] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [socket, setSocket] = useState(null)
  const [activeTab, setActiveTab] = useState('match')
  const [now, setNow] = useState(new Date())
  // Goal events from the AI agent
  const [latestVideoId, setLatestVideoId] = useState(null)
  const [latestGoalEvent, setLatestGoalEvent] = useState(null)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    footballApi.getLiveFixtures()
      .then((data) => {
        const list = data.response || []
        setFixtures(list)
        if (list.length > 0) setSelectedFixture(list[0])
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedFixture) return
    const fixtureId = selectedFixture.fixture.id
    const ws = createChatSocket(fixtureId, (msg) => {
      // Append to chat
      setChatMessages((prev) => [...prev.slice(-199), { ...msg, ts: Date.now() }])
      // If it's an agent goal event with a videoId → update player
      if (msg.type === 'ai_event' && msg.event?.type === 'Goal' && msg.videoId) {
        setLatestVideoId(msg.videoId)
        setLatestGoalEvent(msg.event)
      }
    })
    setSocket(ws)
    return () => ws.close()
  }, [selectedFixture?.fixture?.id])

  const sendMessage = (text, user = 'You') => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ user, message: text }))
    } else {
      setChatMessages((prev) => [...prev.slice(-199), { type: 'chat', user, message: text, ts: Date.now() }])
    }
  }

  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="h-screen flex flex-col p-4 lg:p-6 gap-4 bg-white overflow-hidden">
      <div className="bg-animation" />

      {/* HEADER */}
      <header className="outdrop-container h-20 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-black text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 6.32 17.66M12 2a10 10 0 0 0-6.32 17.66M12 22V12M5.47 7.5l6.53 4.5M18.53 7.5 12 12"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-black flex items-center gap-2">
              KICKOFF
              <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded tracking-normal font-bold uppercase">Pro Agent</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Football • AI Powered Experience</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full status-badge shadow-[0_0_8px_#ef4444]" />
              <span className="text-xs font-black text-red-500 uppercase tracking-tighter">Live Room Active</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400">{dateStr} • {timeStr}</span>
          </div>
          <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-gray-800">Fan4166</p>
              <p className="text-[9px] font-bold text-blue-600">APL 2026</p>
            </div>
            <div className="h-12 w-12 rounded-2xl border-2 border-white shadow-md bg-gradient-to-tr from-blue-100 to-white flex items-center justify-center overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=kickoff2026" alt="User" className="w-10 h-10" />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN — Desktop 3-panel */}
      <main className="flex-1 grid grid-cols-12 gap-4 lg:gap-6 overflow-hidden min-h-0">
        <section className="hidden lg:flex col-span-3 flex-col overflow-hidden">
          <MatchHub fixtures={fixtures} selected={selectedFixture} onSelect={setSelectedFixture} />
        </section>

        <section className="hidden lg:flex col-span-6 flex-col gap-4 lg:gap-6 overflow-hidden">
          <VideoPlayer
            fixture={selectedFixture}
            goalEvent={latestGoalEvent}
            videoId={latestVideoId}
          />
          {selectedFixture && (
            <div className="outdrop-container px-8 py-6 shrink-0">
              <div className="flex justify-between items-center text-center max-w-2xl mx-auto">
                <div className="flex flex-col items-center gap-3 w-32">
                  {selectedFixture.teams.home.logo
                    ? <img src={selectedFixture.teams.home.logo} alt="" className="w-16 h-16 object-contain" />
                    : <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center shadow-sm border border-gray-100"><span className="text-xs font-black text-gray-400 uppercase tracking-tight">{selectedFixture.teams.home.name.slice(0,3)}</span></div>
                  }
                  <span className="font-black text-xs uppercase tracking-tighter text-gray-800">{selectedFixture.teams.home.name}</span>
                </div>
                <div className="flex flex-col gap-2 items-center flex-1">
                  <div className="bg-gray-50/50 px-8 py-3 rounded-[2rem] border border-gray-100">
                    <span className="text-5xl lg:text-7xl font-black text-black tabular-nums tracking-tighter">
                      {selectedFixture.goals.home ?? '–'} : {selectedFixture.goals.away ?? '–'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {selectedFixture.fixture.status.elapsed ? `${selectedFixture.fixture.status.elapsed}' Live Play` : selectedFixture.fixture.status.long || 'Pre-Match'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 w-32">
                  {selectedFixture.teams.away.logo
                    ? <img src={selectedFixture.teams.away.logo} alt="" className="w-16 h-16 object-contain" />
                    : <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center shadow-sm border border-gray-100"><span className="text-xs font-black text-gray-400 uppercase tracking-tight">{selectedFixture.teams.away.name.slice(0,3)}</span></div>
                  }
                  <span className="font-black text-xs uppercase tracking-tighter text-gray-800">{selectedFixture.teams.away.name}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="hidden lg:flex col-span-3 flex-col overflow-hidden">
          <ChatRoom messages={chatMessages} onSend={sendMessage} fixture={selectedFixture} />
        </section>

        {/* Mobile */}
        <section className="lg:hidden col-span-12 flex flex-col overflow-hidden">
          {activeTab === 'match' && <MatchHub fixtures={fixtures} selected={selectedFixture} onSelect={setSelectedFixture} />}
          {activeTab === 'video' && <VideoPlayer fixture={selectedFixture} goalEvent={latestGoalEvent} videoId={latestVideoId} />}
          {activeTab === 'chat' && <ChatRoom messages={chatMessages} onSend={sendMessage} fixture={selectedFixture} />}
        </section>
      </main>

      {/* Mobile nav */}
      <nav className="lg:hidden outdrop-container flex shrink-0">
        {[{ id: 'match', label: 'Match' }, { id: 'video', label: 'Video' }, { id: 'chat', label: 'Chat' }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`}
          >{tab.label}</button>
        ))}
      </nav>

      <StatsTicker fixtures={fixtures} />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/challenge01" element={<KickoffApp />} />
    </Routes>
  )
}

import { useState, useEffect } from 'react'
import MatchHub from './components/MatchHub'
import VideoPlayer from './components/VideoPlayer'
import ChatRoom from './components/ChatRoom'
import { footballApi, createChatSocket } from './services/api'

export default function App() {
  const [fixtures, setFixtures] = useState([])
  const [selectedFixture, setSelectedFixture] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [socket, setSocket] = useState(null)
  const [activeTab, setActiveTab] = useState('match') // mobile tabs

  // Load live fixtures on mount
  useEffect(() => {
    footballApi.getLiveFixtures()
      .then((data) => {
        const list = data.response || []
        setFixtures(list)
        if (list.length > 0) setSelectedFixture(list[0])
      })
      .catch(console.error)
  }, [])

  // Open WebSocket when a fixture is selected
  useEffect(() => {
    if (!selectedFixture) return
    const fixtureId = selectedFixture.fixture.id
    const ws = createChatSocket(fixtureId, (msg) => {
      setChatMessages((prev) => [...prev.slice(-199), msg])
    })
    setSocket(ws)
    return () => ws.close()
  }, [selectedFixture?.fixture?.id])

  const sendMessage = (text, user = 'You') => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return
    socket.send(JSON.stringify({ user, message: text }))
  }

  return (
    <div className="flex flex-col h-screen bg-surface text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-slate-800">
        <span className="text-xl font-bold tracking-tight text-accent">⚽ Kickoff</span>
        <span className="text-xs text-slate-500">Live Football · AI Powered</span>
      </header>

      {/* Desktop: 3-panel layout */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <div className="w-[35%] border-r border-slate-800 overflow-y-auto">
          <MatchHub
            fixtures={fixtures}
            selected={selectedFixture}
            onSelect={setSelectedFixture}
          />
        </div>
        <div className="w-[40%] border-r border-slate-800 overflow-y-auto">
          <VideoPlayer fixture={selectedFixture} />
        </div>
        <div className="w-[25%] flex flex-col">
          <ChatRoom
            messages={chatMessages}
            onSend={sendMessage}
            fixture={selectedFixture}
          />
        </div>
      </div>

      {/* Mobile: tab layout */}
      <div className="flex md:hidden flex-1 overflow-hidden">
        {activeTab === 'match' && (
          <div className="flex-1 overflow-y-auto">
            <MatchHub fixtures={fixtures} selected={selectedFixture} onSelect={setSelectedFixture} />
          </div>
        )}
        {activeTab === 'video' && (
          <div className="flex-1 overflow-y-auto">
            <VideoPlayer fixture={selectedFixture} />
          </div>
        )}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col">
            <ChatRoom messages={chatMessages} onSend={sendMessage} fixture={selectedFixture} />
          </div>
        )}
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden flex border-t border-slate-800 bg-card">
        {['match', 'video', 'chat'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'text-accent' : 'text-slate-500'
            }`}
          >
            {tab === 'match' ? '⚽ Match' : tab === 'video' ? '▶ Video' : '💬 Chat'}
          </button>
        ))}
      </nav>
    </div>
  )
}

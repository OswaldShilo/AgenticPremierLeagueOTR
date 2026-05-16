import { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:8000'

async function fetchVideoId(query) {
  try {
    const res = await fetch(`${API_BASE}/api/youtube/search?q=${encodeURIComponent(query)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.videoId ?? null
  } catch {
    return null
  }
}

export default function VideoPlayer({ fixture, goalEvent = null, videoId: externalVideoId = null }) {
  const [activeVideoId, setActiveVideoId] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [searching, setSearching] = useState(false)
  const [goalBanner, setGoalBanner] = useState(null)

  // Auto-load when agent broadcasts a real videoId
  useEffect(() => {
    if (!externalVideoId) return
    setActiveVideoId(externalVideoId)
    if (goalEvent?.type === 'Goal') {
      setGoalBanner({
        player: goalEvent.player?.name || 'Goal',
        minute: goalEvent.time?.elapsed,
      })
      const t = setTimeout(() => setGoalBanner(null), 6000)
      return () => clearTimeout(t)
    }
  }, [externalVideoId])

  // Reset when fixture changes
  useEffect(() => {
    setActiveVideoId(null)
    setGoalBanner(null)
  }, [fixture?.fixture?.id])

  const handleSearch = async () => {
    const q = searchInput.trim()
    if (!q) return
    setSearching(true)
    const vid = await fetchVideoId(q)
    setSearching(false)
    if (vid) { setActiveVideoId(vid); setSearchInput('') }
  }

  const embedSrc = activeVideoId
    ? `https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`
    : null

  const bgImage = fixture
    ? 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1470&auto=format&fit=crop'
    : 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=1470&auto=format&fit=crop'

  return (
    <div className="outdrop-container flex-1 relative overflow-hidden flex flex-col p-2">
      {/* Goal alert banner */}
      {goalBanner && (
        <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Goal Alert</p>
              <p className="text-sm font-black tracking-tight">
                {goalBanner.player}{goalBanner.minute ? ` — ${goalBanner.minute}'` : ''}
              </p>
            </div>
            <p className="text-[10px] text-white/70 font-semibold ml-2">Highlight loaded</p>
          </div>
        </div>
      )}

      {/* Top-left badges */}
      <div className="absolute top-6 left-6 z-30 flex gap-2">
        <span className="px-3 py-1 bg-black/60 backdrop-blur text-white text-[10px] font-black rounded-lg border border-white/20 uppercase tracking-widest">
          Live Feed
        </span>
        {activeVideoId ? (
          <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-widest animate-pulse">
            Now Playing
          </span>
        ) : (
          <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-black rounded-lg shadow-lg uppercase tracking-widest">
            AI Highlights
          </span>
        )}
      </div>

      {/* Search bar — top right */}
      <div className="absolute top-6 right-6 z-30 flex gap-2">
        <input
          className="bg-black/40 backdrop-blur border border-white/20 text-white text-xs font-semibold rounded-xl px-4 py-2 placeholder-white/50 outline-none focus:ring-2 focus:ring-white/30 w-48"
          placeholder="Search highlights…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          className="bg-white/20 backdrop-blur border border-white/20 text-white text-xs font-black px-3 py-2 rounded-xl hover:bg-white/30 transition-all uppercase tracking-wider disabled:opacity-50"
        >
          {searching ? '...' : 'Search'}
        </button>
        {activeVideoId && (
          <button
            onClick={() => setActiveVideoId(null)}
            className="bg-white/10 backdrop-blur border border-white/20 text-white text-xs font-black px-3 py-2 rounded-xl hover:bg-white/20 transition-all"
          >
            Close
          </button>
        )}
      </div>

      {/* Main video area */}
      <div className="flex-1 bg-black rounded-[1.5rem] relative overflow-hidden group">
        {embedSrc ? (
          <iframe
            key={activeVideoId}
            className="absolute inset-0 w-full h-full"
            src={embedSrc}
            title="Highlights"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url('${bgImage}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                  <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                  {fixture ? 'Waiting for goal — highlights auto-load' : 'Select a match'}
                </p>
              </div>
            </div>
            <div className="absolute bottom-8 left-8 right-8 z-20">
              <div className="space-y-1">
                {fixture ? (
                  <>
                    <h4 className="text-2xl font-black text-white tracking-tight leading-tight">
                      {fixture.teams.home.name} vs {fixture.teams.away.name}
                    </h4>
                    <p className="text-xs text-white/60 font-semibold uppercase tracking-[0.2em]">
                      {fixture.fixture.status.elapsed ? `${fixture.fixture.status.elapsed}'` : 'Pre-Match'} · Goals auto-load highlights
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="text-2xl font-black text-white tracking-tight leading-tight">Match Highlights</h4>
                    <p className="text-xs text-white/60 font-semibold uppercase tracking-[0.2em]">Select a live match to load</p>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

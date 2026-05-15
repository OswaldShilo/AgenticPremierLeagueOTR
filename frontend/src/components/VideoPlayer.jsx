import { useState, useEffect } from 'react'

function buildYouTubeQuery(fixture, event = null) {
  if (!fixture) return ''
  const home = fixture.teams.home.name
  const away = fixture.teams.away.name
  if (event?.type === 'Goal') {
    const player = event.player?.name || ''
    const min = event.time?.elapsed || ''
    return `${home} vs ${away} ${player} goal ${min} minute highlights`
  }
  return `${home} vs ${away} highlights ${new Date().getFullYear()}`
}

export default function VideoPlayer({ fixture, goalEvent = null }) {
  const [query, setQuery] = useState('')
  const [inputVal, setInputVal] = useState('')
  const [videoId, setVideoId] = useState(null)

  // Auto-update query when a goal event fires
  useEffect(() => {
    if (goalEvent) {
      setQuery(buildYouTubeQuery(fixture, goalEvent))
    }
  }, [goalEvent])

  // Default query when fixture changes
  useEffect(() => {
    if (fixture && !goalEvent) {
      setQuery(buildYouTubeQuery(fixture))
    }
  }, [fixture?.fixture?.id])

  const searchYouTube = () => {
    const q = inputVal.trim() || query
    if (!q) return
    // Open YouTube search in the embed — YouTube Data API key needed for server-side search
    // For now we open the YouTube search in the embed directly
    setVideoId(null)
    setQuery(q)
    setInputVal('')
  }

  const embedSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1`
    : query
    ? `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}`
    : null

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Video Highlights</h2>

      {/* Search bar */}
      <div className="flex gap-2">
        <input
          className="flex-1 bg-slate-800 text-sm rounded px-3 py-2 text-slate-200 placeholder-slate-500 outline-none focus:ring-1 focus:ring-accent"
          placeholder={query || 'Search highlights…'}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchYouTube()}
        />
        <button
          onClick={searchYouTube}
          className="bg-accent text-slate-900 text-sm font-semibold px-3 py-2 rounded hover:opacity-90"
        >
          Search
        </button>
      </div>

      {/* Video embed */}
      {embedSrc ? (
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full rounded-lg"
            src={embedSrc}
            title="Highlights"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-slate-800 rounded-lg text-slate-500 text-sm">
          Select a live match to load highlights
        </div>
      )}

      {query && (
        <p className="text-xs text-slate-500 truncate">Searching: {query}</p>
      )}
    </div>
  )
}

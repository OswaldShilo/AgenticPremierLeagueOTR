import { useState, useEffect } from 'react'
import { footballApi } from '../services/api'

// Event type labels used in the feed
const EVENT_LABEL = { Goal: 'G', Card: 'C', subst: 'S', Var: 'V' }
const EVENT_BG    = { Goal: 'bg-yellow-400', Card: 'bg-red-500', subst: 'bg-blue-100', Var: 'bg-purple-100' }
const EVENT_TEXT  = { Goal: 'text-yellow-900', Card: 'text-white', subst: 'text-blue-700', Var: 'text-purple-700' }

function StatusBadge({ status }) {
  const s = status?.short || ''
  const isLive = s === '1H' || s === '2H' || s === 'ET'
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${
      isLive ? 'bg-green-100 text-green-700' : s === 'HT' ? 'bg-yellow-100 text-yellow-700' : s === 'FT' ? 'bg-gray-100 text-gray-500' : 'bg-gray-50 text-gray-400'
    }`}>
      {isLive && <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />}
      {isLive ? 'Live' : s || 'Pre'}
    </span>
  )
}

function FixtureCard({ fixture, isSelected, onClick }) {
  const { home, away } = fixture.teams
  const goals = fixture.goals
  const elapsed = fixture.fixture.status.elapsed
  return (
    <button onClick={onClick} className={`w-full text-left px-5 py-4 border-b border-gray-100 transition-colors ${isSelected ? 'bg-blue-50/60' : 'hover:bg-gray-50/60'}`}>
      <div className="flex items-center justify-between mb-2">
        <StatusBadge status={fixture.fixture.status} />
        {elapsed && <span className="text-[10px] font-black text-green-600">{elapsed}'</span>}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {home.logo && <img src={home.logo} alt="" className="w-5 h-5 object-contain shrink-0" />}
          <span className="font-black text-xs text-gray-800 truncate uppercase tracking-tight">{home.name}</span>
        </div>
        <span className="text-base font-black text-black tabular-nums px-2">{goals.home ?? '–'} : {goals.away ?? '–'}</span>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="font-black text-xs text-gray-800 truncate uppercase tracking-tight text-right">{away.name}</span>
          {away.logo && <img src={away.logo} alt="" className="w-5 h-5 object-contain shrink-0" />}
        </div>
      </div>
      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{fixture.league.name}</div>
    </button>
  )
}

function EventFeed({ events }) {
  if (!events?.length) return <p className="text-gray-400 text-xs font-medium px-5 py-4">No events yet.</p>
  return (
    <div className="p-5 space-y-6">
      {[...events].reverse().map((ev, i) => (
        <div key={i} className="flex gap-4 items-start relative">
          {i < events.length - 1 && <div className="absolute left-4 top-9 bottom-[-20px] w-[2px] bg-gray-100" />}
          <div className={`w-8 h-8 rounded-full ${EVENT_BG[ev.type] || 'bg-gray-100'} ${EVENT_TEXT[ev.type] || 'text-gray-500'} border-4 border-white shadow-md flex items-center justify-center text-[10px] font-black shrink-0 z-10`}>
            {EVENT_LABEL[ev.type] || '•'}
          </div>
          <div className="flex-1 pt-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-black uppercase tracking-tight">
                {ev.type === 'Goal' ? 'GOAL' : ev.type === 'Card' ? (ev.detail?.includes('Yellow') ? 'YC' : 'RC') : 'SUB'}: {ev.player?.name?.split(' ').pop()}
              </h4>
              <span className="text-[9px] text-gray-400 font-bold">{ev.time?.elapsed}'</span>
            </div>
            {ev.assist?.name && <p className="text-[10px] text-gray-400 font-medium">Assist: {ev.assist.name}</p>}
            {ev.detail && <p className="text-[10px] text-gray-400 font-medium">{ev.detail}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

function LineupPanel({ lineups }) {
  if (!lineups?.length) return <p className="text-gray-400 text-xs font-medium px-5 py-4">Lineup not available.</p>
  return (
    <div className="p-5 space-y-5">
      {lineups.map((team) => (
        <div key={team.team.id}>
          <div className="flex items-center gap-2 mb-3">
            <img src={team.team.logo} alt="" className="w-5 h-5 object-contain" />
            <span className="font-black text-xs uppercase tracking-tight text-black">{team.team.name}</span>
            <span className="text-[10px] text-gray-400 font-bold">{team.formation}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {team.startXI.map(({ player }) => (
              <span key={player.id} className="bg-white border border-gray-100 shadow-sm text-[10px] font-bold px-2.5 py-1 rounded-xl text-gray-700">
                {player.number}. {player.name.split(' ').pop()}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function StatsPanel({ stats }) {
  if (!stats?.length || stats.length < 2) return <p className="text-gray-400 text-xs font-medium px-5 py-4">Stats not available.</p>
  return (
    <div className="p-5 space-y-4">
      {stats[0].statistics.map((s, i) => {
        const hv = parseFloat(s.value) || 0
        const av = parseFloat(stats[1].statistics[i]?.value) || 0
        const tot = hv + av
        const hp = tot > 0 ? Math.round((hv / tot) * 100) : 50
        return (
          <div key={i}>
            <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1.5">
              <span className="text-gray-800 font-black">{s.value ?? '—'}</span>
              <span className="uppercase tracking-wider">{s.type}</span>
              <span className="text-gray-800 font-black">{stats[1].statistics[i]?.value ?? '—'}</span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100">
              <div className="bg-blue-600 transition-all" style={{ width: `${hp}%` }} />
              <div className="bg-gray-300" style={{ width: `${100 - hp}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function MatchHub({ fixtures, selected, onSelect }) {
  const [tab, setTab] = useState('Events')
  const [events, setEvents] = useState([])
  const [lineups, setLineups] = useState([])
  const [stats, setStats] = useState([])

  useEffect(() => {
    if (!selected) return
    const id = selected.fixture.id
    setEvents([]); setLineups([]); setStats([])
    footballApi.getEvents(id).then((d) => setEvents(d.response || [])).catch(() => {})
    footballApi.getLineups(id).then((d) => setLineups(d.response || [])).catch(() => {})
    footballApi.getStats(id).then((d) => setStats(d.response || [])).catch(() => {})
  }, [selected?.fixture?.id])

  return (
    <div className="outdrop-container flex-1 flex flex-col overflow-hidden">
      <div className="flex border-b border-gray-100 shrink-0 bg-white/40">
        {['Events', 'Lineups', 'Stats'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>{t}</button>
        ))}
      </div>

      <div className="shrink-0 border-b border-gray-100">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] px-5 pt-4 pb-2">Live Now</p>
        {fixtures.length === 0 && <p className="text-gray-400 text-xs font-medium px-5 pb-4">No live matches right now.</p>}
        {fixtures.slice(0, 4).map((f) => (
          <FixtureCard key={f.fixture.id} fixture={f} isSelected={selected?.fixture?.id === f.fixture.id} onClick={() => onSelect(f)} />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {selected ? (
          <>
            {tab === 'Events' && <EventFeed events={events} />}
            {tab === 'Lineups' && <LineupPanel lineups={lineups} />}
            {tab === 'Stats' && <StatsPanel stats={stats} />}
          </>
        ) : (
          <p className="text-gray-400 text-xs font-medium px-5 py-4">Select a match above.</p>
        )}
      </div>
    </div>
  )
}

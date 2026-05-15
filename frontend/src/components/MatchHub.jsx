import { useState, useEffect } from 'react'
import { footballApi } from '../services/api'

function StatusBadge({ status }) {
  const short = status?.short || ''
  const color =
    short === '1H' || short === '2H' || short === 'ET'
      ? 'bg-green-500'
      : short === 'HT'
      ? 'bg-yellow-500'
      : short === 'FT'
      ? 'bg-slate-500'
      : 'bg-slate-700'
  return (
    <span className={`${color} text-white text-xs font-bold px-2 py-0.5 rounded`}>
      {short === '1H' || short === '2H' ? 'LIVE' : short || 'PRE'}
    </span>
  )
}

function FixtureCard({ fixture, isSelected, onClick }) {
  const home = fixture.teams.home
  const away = fixture.teams.away
  const goals = fixture.goals
  const elapsed = fixture.fixture.status.elapsed

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-slate-800 transition-colors ${
        isSelected ? 'bg-slate-800' : 'hover:bg-slate-900'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <StatusBadge status={fixture.fixture.status} />
        {elapsed && <span className="text-xs text-green-400">{elapsed}'</span>}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="flex-1 font-medium text-sm truncate">{home.name}</span>
        <span className="text-lg font-bold tabular-nums">
          {goals.home ?? '-'} : {goals.away ?? '-'}
        </span>
        <span className="flex-1 font-medium text-sm truncate text-right">{away.name}</span>
      </div>
      <div className="text-xs text-slate-500 mt-1">{fixture.league.name}</div>
    </button>
  )
}

function EventFeed({ events }) {
  if (!events?.length) return <p className="text-slate-500 text-sm px-4 py-2">No events yet.</p>

  const icons = { Goal: '⚽', Card: '🟨', subst: '🔄', Var: '📺' }

  return (
    <div className="divide-y divide-slate-800">
      {[...events].reverse().map((ev, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2 text-sm">
          <span className="text-slate-400 w-8 text-right">{ev.time.elapsed}'</span>
          <span>{icons[ev.type] || '•'}</span>
          <div>
            <span className="font-medium">{ev.player?.name}</span>
            {ev.assist?.name && (
              <span className="text-slate-400 ml-1 text-xs">(assist: {ev.assist.name})</span>
            )}
            <div className="text-xs text-slate-500">{ev.detail}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function LineupPitch({ lineups }) {
  if (!lineups?.length) return <p className="text-slate-500 text-sm px-4 py-2">Lineup not available.</p>

  return (
    <div className="space-y-4 px-4 py-2">
      {lineups.map((team) => (
        <div key={team.team.id}>
          <div className="flex items-center gap-2 mb-2">
            <img src={team.team.logo} alt="" className="w-5 h-5 object-contain" />
            <span className="font-semibold text-sm">{team.team.name}</span>
            <span className="text-xs text-slate-400">{team.formation}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {team.startXI.map(({ player }) => (
              <span
                key={player.id}
                className="bg-slate-800 text-xs px-2 py-1 rounded text-slate-200"
                title={`#${player.number}`}
              >
                {player.number}. {player.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function StatBar({ label, home, away }) {
  const total = (home || 0) + (away || 0)
  const homePct = total > 0 ? Math.round(((home || 0) / total) * 100) : 50

  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{home ?? '—'}</span>
        <span className="text-slate-300">{label}</span>
        <span>{away ?? '—'}</span>
      </div>
      <div className="flex h-1.5 rounded overflow-hidden bg-slate-700">
        <div className="bg-accent" style={{ width: `${homePct}%` }} />
        <div className="bg-slate-500" style={{ width: `${100 - homePct}%` }} />
      </div>
    </div>
  )
}

export default function MatchHub({ fixtures, selected, onSelect }) {
  const [tab, setTab] = useState('events')
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

  const tabs = ['events', 'lineups', 'stats']

  return (
    <div className="flex flex-col h-full">
      {/* Fixtures list */}
      <div className="border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-500 uppercase px-4 pt-3 pb-1 tracking-wider">Live Now</p>
        {fixtures.length === 0 && (
          <p className="text-slate-500 text-sm px-4 py-3">No live matches. Check back later.</p>
        )}
        {fixtures.slice(0, 5).map((f) => (
          <FixtureCard
            key={f.fixture.id}
            fixture={f}
            isSelected={selected?.fixture?.id === f.fixture.id}
            onClick={() => onSelect(f)}
          />
        ))}
      </div>

      {/* Detail tabs */}
      {selected && (
        <>
          <div className="flex border-b border-slate-800">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${
                  tab === t ? 'text-accent border-b-2 border-accent' : 'text-slate-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === 'events' && <EventFeed events={events} />}
            {tab === 'lineups' && <LineupPitch lineups={lineups} />}
            {tab === 'stats' && (
              <div className="px-4 py-3">
                {stats.length === 0 && <p className="text-slate-500 text-sm">Stats not available.</p>}
                {stats.length >= 2 &&
                  stats[0].statistics.map((s, i) => (
                    <StatBar
                      key={i}
                      label={s.type}
                      home={s.value}
                      away={stats[1].statistics[i]?.value}
                    />
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

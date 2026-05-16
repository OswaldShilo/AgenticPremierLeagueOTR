import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CHALLENGES = [
  {
    id: 1,
    label: 'Challenge 1',
    color: 'blue',
    available: true,
    route: '/challenge01',
    description:
      'Design a system that enhances how users experience live sporting events beyond passive viewing. The solution should create meaningful second-screen interactions during matches, enabling fans to engage with key moments, participate in real-time activities, and feel more connected to the game as it unfolds.',
    tagline: 'Live Match Experience',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a10 10 0 0 1 6.32 17.66M12 2a10 10 0 0 0-6.32 17.66M12 22V12M5.47 7.5l6.53 4.5M18.53 7.5 12 12"/>
      </svg>
    ),
  },
  {
    id: 2,
    label: 'Challenge 2',
    color: 'orange',
    available: false,
    route: '/challenge02',
    description:
      'Create a platform that leverages gamification to deepen fan engagement during a tournament season. The system should encourage repeat participation through mechanisms like predictions, streaks, rewards, and progression, while adapting to user behavior over time.',
    tagline: 'Season Gamification',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(null)
  const [clicking, setClicking] = useState(null)

  const handleClick = (ch) => {
    if (!ch.available) return
    setClicking(ch.id)
    setTimeout(() => navigate(ch.route), 380)
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-white">
      <div className="bg-animation" />

      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/5 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[80px] opacity-40 animate-float pointer-events-none" />
      <div
        className="absolute bottom-1/4 right-1/5 w-96 h-96 bg-orange-100 rounded-full blur-[80px] opacity-30 pointer-events-none"
        style={{ animation: 'float 4.5s ease-in-out infinite', animationDelay: '1.5s' }}
      />
      <div
        className="absolute top-2/3 left-1/2 w-64 h-64 bg-yellow-50 rounded-full blur-[60px] opacity-20 pointer-events-none"
        style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '0.8s' }}
      />

      {/* Top badge */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 animate-fade-in">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-200" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Powered by Google Cloud</span>
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Hackathon 2026</span>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-200" />
      </div>

      {/* Main */}
      <div className="flex flex-col items-center text-center px-6 gap-14 animate-slide-up">
        {/* Heading */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Season 2026</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-[-0.04em] text-black leading-none">
            Agentic<br />
            <span
              className="text-blue-600"
              style={{ WebkitTextStroke: '0px' }}
            >
              Premier League
            </span>
          </h1>
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-[0.2em]">
            Select a challenge to begin
          </p>
        </div>

        {/* Challenge Cards */}
        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-[640px]">
          {CHALLENGES.map((ch) => (
            <div key={ch.id} className="relative flex-1" style={{ zIndex: hovered === ch.id ? 10 : 1 }}>
              {/* Hover tooltip */}
              <div
                className={`
                  absolute bottom-[calc(100%+16px)] left-1/2 -translate-x-1/2 w-[280px] p-5 rounded-2xl text-left
                  pointer-events-none transition-all duration-300 ease-out
                  ${hovered === ch.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
                  ${ch.color === 'blue' ? 'bg-blue-600' : 'bg-orange-500'}
                `}
                style={{
                  boxShadow: ch.color === 'blue'
                    ? '0 24px 64px -12px rgba(37,99,235,0.45)'
                    : '0 24px 64px -12px rgba(249,115,22,0.45)',
                }}
              >
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent w-0 h-0
                  ${ch.color === 'blue' ? 'border-t-blue-600' : 'border-t-orange-500'}`}
                />
                <p className="text-[11px] text-white/95 leading-[1.7] font-semibold">{ch.description}</p>
              </div>

              {/* Card button */}
              <button
                id={`challenge-${ch.id}`}
                onMouseEnter={() => setHovered(ch.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleClick(ch)}
                disabled={!ch.available}
                className={`
                  outdrop-container w-full p-8 flex flex-col items-center gap-5
                  transition-all duration-300 ease-out select-none text-left
                  ${clicking === ch.id ? 'scale-95 opacity-50' : ''}
                  ${!ch.available
                    ? 'opacity-50 cursor-not-allowed'
                    : hovered === ch.id
                      ? ch.color === 'blue'
                        ? 'scale-[1.04] shadow-[0_24px_64px_-12px_rgba(37,99,235,0.2)] border-blue-200'
                        : 'scale-[1.04] shadow-[0_24px_64px_-12px_rgba(249,115,22,0.2)] border-orange-200'
                      : ''
                  }
                `}
              >
                {/* Icon */}
                <div
                  className={`
                    w-16 h-16 rounded-[1.25rem] flex items-center justify-center
                    border transition-all duration-300
                    ${hovered === ch.id
                      ? ch.color === 'blue'
                        ? 'bg-blue-600 border-transparent scale-110 shadow-[0_8px_24px_rgba(37,99,235,0.35)] text-white'
                        : 'bg-orange-500 border-transparent scale-110 shadow-[0_8px_24px_rgba(249,115,22,0.35)] text-white'
                      : 'bg-white border-gray-100 shadow-sm text-gray-500'
                    }
                  `}
                >
                  {ch.icon}
                </div>

                {/* Text */}
                <div className="text-center space-y-1.5">
                  <div className="text-xl font-black tracking-tighter text-black">{ch.label}</div>
                  <div className={`text-[10px] font-black uppercase tracking-[0.25em] ${
                    ch.color === 'blue' ? 'text-blue-600' : 'text-orange-500'
                  }`}>{ch.tagline}</div>
                </div>

                {/* CTA pill */}
                {ch.available ? (
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    hovered === ch.id
                      ? ch.color === 'blue'
                        ? 'bg-blue-600 text-white'
                        : 'bg-orange-500 text-white'
                      : ch.color === 'blue'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-orange-50 text-orange-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      hovered === ch.id ? 'bg-white animate-pulse' : ch.color === 'blue' ? 'bg-blue-600 animate-pulse' : 'bg-orange-500 animate-pulse'
                    }`} />
                    Enter Challenge
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    Coming Soon
                  </div>
                )}

                {!hovered && ch.available && (
                  <p className="text-[9px] text-gray-300 uppercase tracking-widest font-bold -mt-1">Hover for details</p>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 flex items-center gap-3">
        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.35em]">May 2026</span>
        <div className="w-1 h-1 bg-gray-200 rounded-full" />
        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.35em]">Agentic Premier League</span>
        <div className="w-1 h-1 bg-gray-200 rounded-full" />
        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.35em]">Google Cloud</span>
      </div>
    </div>
  )
}

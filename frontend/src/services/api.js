const BASE = '/api'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

export const footballApi = {
  getLiveFixtures: () => get('/football/live'),
  getFixture: (id) => get(`/football/fixture/${id}`),
  getEvents: (id) => get(`/football/fixture/${id}/events`),
  getLineups: (id) => get(`/football/fixture/${id}/lineups`),
  getStats: (id) => get(`/football/fixture/${id}/stats`),
}

export const aiApi = {
  ask: (question, match_context = {}) =>
    post('/ai/ask', { question, match_context }),
}

export function createChatSocket(fixtureId, onMessage) {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
  const ws = new WebSocket(`${protocol}://${location.host}/ws/chat/${fixtureId}`)
  ws.onmessage = (e) => onMessage(JSON.parse(e.data))
  return ws
}

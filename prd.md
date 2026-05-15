**KICKOFF**

Live Football. Real Engagement.

# **1\. Executive Summary**

Kickoff is an AI-powered football companion app that transforms passive match watching into an immersive, social, and data-rich second-screen experience. Built for Google Cloud's Agentic Premier League hackathon, Kickoff addresses a fundamental gap in the football fan ecosystem: fans today watch matches in isolation with static apps that show scores and little else.

Kickoff delivers live scores, real-time lineups, AI-generated event commentary, contextual highlight videos, and a live fan chat room - all in one unified interface. An AI agent monitors match state continuously, pushing meaningful content to fans the moment something happens on the pitch.

The app is deployed on Google Cloud Run, making it fully scalable, serverless, and ready for production traffic.

# **2\. Problem Statement**

## **2.1 The Gap in Football Fan Experience**

Current football apps (OneFootball, Fotmob, BBC Sport) are predominantly passive - they show information but create no engagement loop. Fans who want to interact with the match have no dedicated space to do so. Social media (Twitter/X) is fragmented, noisy, and not match-aware.

## **2.2 Pain Points**

- Fans open 3-4 different apps during a match (score app, Twitter, YouTube for replays, WhatsApp groups)
- No app connects live match context with video highlights automatically
- No AI layer to explain tactical decisions, substitutions, or VAR calls in real time
- Fan communities are scattered across generic social media with no match-awareness
- Post-match content is delayed - highlights arrive minutes after events

## **2.3 Opportunity**

The second-screen sports market is a multi-billion dollar space with minimal AI innovation. Kickoff positions itself as the AI-native fan companion that replaces the tab-switching chaos with one intelligent, contextual interface.

# **3\. Product Vision & Goals**

## **3.1 Vision Statement**

_"To be the intelligent match companion that makes every football fan feel like they have a football analyst, a highlight reel, and a stadium atmosphere - in their pocket."_

## **3.2 Success Metrics (Hackathon Demo Goals)**

- Live match data loads within 2 seconds of app open
- AI agent detects and responds to key match events within 5 seconds
- Highlight video surfaces automatically when a goal/red card is detected
- Chat room handles concurrent messages with <500ms latency
- Full app deployed and accessible via Cloud Run URL

# **4\. Target Users**

## **4.1 Primary Persona - The Social Watcher**

- Age 18-35, watches football with friends or online communities
- Already uses multiple apps simultaneously during a match
- Wants to discuss, react, and share moments in real time
- Frustrated by the delay between a goal and seeing the clip

## **4.2 Secondary Persona - The Stats Nerd**

- Wants deep context - xG, possession maps, tactical analysis
- Asks 'why' questions: why did the manager substitute at 65 minutes?
- Would use an AI co-pilot heavily for contextual explanations

# **5\. Feature Specification**

## **5.1 Feature Overview**

| **Feature**            | **Description**                                                                   | **Priority** |
| ---------------------- | --------------------------------------------------------------------------------- | ------------ |
| **Live Score Hub**     | Real-time match scores, minute-by-minute event feed (goals, cards, substitutions) | **P0**       |
| **Live Lineups**       | Starting XI display with player cards, live substitution updates as they happen   | **P0**       |
| **Match Stats Panel**  | Possession, shots on target, xG, pass accuracy, updated live                      | **P0**       |
| **AI Event Agent**     | Detects key events and pushes contextual AI commentary to the chat                | **P0**       |
| **Video Highlights**   | Auto-loads YouTube highlight clips triggered by goal/card events                  | **P1**       |
| **Fan Chat Room**      | Live match-specific chat room for fans, Firebase-powered real-time messaging      | **P1**       |
| **AI Chat Co-pilot**   | Fans can ask the AI questions about the match and get instant answers             | **P1**       |
| **Player Cards**       | Tap a player in the lineup to see their season stats and form                     | **P2**       |
| **Match Predictions**  | Pre-match AI prediction with key battles and expected line-ups                    | **P2**       |
| **Push Notifications** | Alert fans on goal, red card, or comeback when using another app                  | **P2**       |

## **5.2 Live Score Hub (P0)**

The primary entry point. Shows the currently live or upcoming match with:

- Home vs Away team badges, names, current score
- Match clock (live-updating every second)
- Chronological event feed: goals with scorer name, assists, yellow/red cards, substitutions, injury time
- Match status indicator: Pre-Match / Live / Half Time / Full Time

## **5.3 Live Lineups (P0)**

A visual pitch-view of both teams' starting XIs in their formation:

- Formation displayed (e.g. 4-3-3 vs 4-2-3-1) with players positioned on a pitch graphic
- Confirmed lineup revealed 1 hour before kickoff via API poll
- Substitutions reflected in real time - replaced player greys out, substitute highlighted
- Tap any player to see nationality, age, season goals/assists, current rating

## **5.4 AI Event Agent (P0)**

The core differentiator. A background agent that:

- Polls match event API every 10 seconds for new events
- On detecting a goal: calls Gemini to generate a 2-3 sentence contextual commentary (e.g. 'This is Salah's 8th goal in his last 6 home games - Liverpool are clinical in transition')
- Pushes AI commentary as a pinned message in the chat room
- Simultaneously triggers a YouTube search for a highlight clip of that goal
- On red card: generates tactical impact analysis ('Arsenal now play 75 minutes with 10 men - expect a defensive 5-4-0 shape')

## **5.5 Video Highlight Player (P1)**

An embedded video panel that works contextually:

- Idle state: shows the match's pre-game preview video or manager press conference
- Goal detected: automatically searches YouTube for '\[Team\] goal \[Minute\] \[Competition\]' and loads the top result
- Manual mode: fan can search for any clip (e.g. 'Mbappe skill 2025')
- Full match highlight auto-loads at full time

## **5.6 Fan Chat Room (P1)**

A live match-specific chat room powered by Firebase Realtime Database:

- Each match has its own chat room (keyed by match ID)
- Messages are real-time - sub-500ms latency
- AI agent messages appear as a pinned bot with a verified tag
- Emoji reactions on messages - quick engagement without typing
- Chat auto-scrolls to latest message; scroll-up freezes auto-scroll

## **5.7 AI Chat Co-pilot (P1)**

Fans can @mention the AI or click the bot icon to ask questions:

- '@AI Why did Arteta take off Saka?' → AI responds with formation context
- '@AI What's the xG right now?' → pulls live stat and explains it
- '@AI Who scored most in UCL this season?' → calls web search tool

Powered by Gemini via Anthropic-style API call with match state injected as context.

# **6\. UI Layout & Screen Design**

## **6.1 Three-Panel Desktop Layout**

┌─────────────────┬──────────────────┬──────────────────┐ │ MATCH HUB │ VIDEO PLAYER │ LIVE CHAT │ │ (35% width) │ (40% width) │ (25% width) │ │ │ │ │ │ Score + Clock │ YouTube embed │ Fan messages │ │ Event feed │ Auto-loads on │ AI bot messages │ │ Lineups tab │ goals/cards │ Emoji reactions │ │ Stats tab │ Manual search │ @AI queries │ └─────────────────┴──────────────────┴──────────────────┘

## **6.2 Mobile Layout**

On mobile, the three panels collapse into a tabbed bottom navigation: Match | Video | Chat. The AI event agent still pushes banner notifications within the app when a goal is detected.

# **7\. Technical Architecture**

## **7.1 System Overview**

Kickoff is a cloud-native application with three layers: a React frontend, a FastAPI backend deployed on Cloud Run, and a real-time Firebase layer for chat.

## **7.2 Component Stack**

| **Feature**            | **Description**                                                           | **Priority** |
| ---------------------- | ------------------------------------------------------------------------- | ------------ |
| **Frontend**           | React + Tailwind CSS, deployed on Firebase Hosting or Cloud Run           | **-**        |
| **Backend API**        | FastAPI (Python), containerised with Docker, deployed on Cloud Run        | **-**        |
| **Live Football Data** | API-Football (RapidAPI) - scores, lineups, events, stats                  | **-**        |
| **AI / LLM**           | Google Gemini 1.5 Flash via Vertex AI SDK for event commentary and chat   | **-**        |
| **Video Highlights**   | YouTube Data API v3 - search and embed highlights by match context        | **-**        |
| **Real-time Chat**     | Firebase Realtime Database for sub-500ms fan messaging                    | **-**        |
| **Background Agent**   | Cloud Run Job or scheduled Cloud Scheduler - polls match events every 10s | **-**        |
| **Containerisation**   | Docker + Cloud Build for CI/CD pipeline                                   | **-**        |
| **Secret Management**  | Google Secret Manager for all API keys                                    | **-**        |

## **7.3 Data Flow - Goal Detection**

- Cloud Scheduler triggers the Agent service every 10 seconds
- Agent calls API-Football for latest match events
- New goal event detected → Agent calls Gemini with match context prompt
- Gemini returns 2-sentence commentary → written to Firebase under match chat room
- Agent calls YouTube API → searches for goal clip → stores video ID in Firebase
- Frontend is subscribed to Firebase → receives both AI message and video ID instantly
- UI updates: chat shows AI message, video panel loads the YouTube embed

## **7.4 Cloud Run Deployment**

- Backend: single Cloud Run service, min-instances=1, max-instances=10
- Agent: separate Cloud Run Job triggered by Cloud Scheduler (10s cadence)
- Frontend: served from Cloud Run or Firebase Hosting (static build)
- All services use Workload Identity Federation - no hardcoded credentials

# **8\. API Integration Reference**

## **8.1 API-Football (Primary Data Source)**

- Endpoint: GET /fixtures - fetch live match by league/round
- Endpoint: GET /fixtures/events - goal, card, substitution events by fixture ID
- Endpoint: GET /fixtures/lineups - starting XI and formation by fixture ID
- Endpoint: GET /fixtures/statistics - possession, shots, xG by fixture ID
- Rate limit: 100 calls/day on free tier; 10 calls/min on pro tier

## **8.2 Google Gemini (AI Commentary)**

- Model: gemini-1.5-flash via Vertex AI
- Prompt injection: match context (teams, score, minute, event) + instruction to generate commentary
- Temperature: 0.7 for natural but factual responses
- Max tokens: 200 per event commentary

## **8.3 YouTube Data API v3**

- Endpoint: GET /search - query '\[Team A\] vs \[Team B\] goal \[player\] \[minute\] highlights'
- Type filter: video, order: relevance
- Embed: youtube.com/embed/{videoId} loaded in iframe

# **9\. Hackathon Milestones**

| **Phase**   | **Timeline** | **Deliverable**                                                                          |
| ----------- | ------------ | ---------------------------------------------------------------------------------------- |
| **Phase 0** | Hour 0-1     | Architecture design, API keys setup, Firebase project init, Cloud Run service scaffolded |
| **Phase 1** | Hour 1-3     | Live score feed working, lineup display, event feed - core match hub functional          |
| **Phase 2** | Hour 3-5     | AI agent deployed, Gemini commentary live, Firebase chat room functional                 |
| **Phase 3** | Hour 5-7     | YouTube highlight integration, video panel auto-trigger on goal events                   |
| **Phase 4** | Hour 7-8     | UI polish, mobile responsiveness, full end-to-end demo tested                            |
| **Deploy**  | Hour 8       | Cloud Run deployment, all services live, demo URL shared with judges                     |

# **10\. Risks & Mitigations**

| **Feature**                    | **Description**                                                             | **Priority** |
| ------------------------------ | --------------------------------------------------------------------------- | ------------ |
| **API-Football rate limits**   | Cache responses in Redis/Firestore; use mock data for demo if needed        | **P0**       |
| **YouTube embed restrictions** | Fallback to thumbnail + link if embed blocked; use unlisted videos          | **P1**       |
| **Gemini latency**             | Use gemini-flash (fastest model); pre-generate commentary for common events | **P1**       |
| **Firebase cold starts**       | Keepalive ping on Cloud Run; Firebase is always-on by default               | **P1**       |
| **No live match during demo**  | Pre-load a recorded match as a demo dataset; replay events in real-time     | **P0**       |

# **11\. Out of Scope (v1.0)**

- Live streaming of matches (licensing; use YouTube highlights instead)
- Fantasy football integration
- Betting odds or wagering features
- Multi-sport support (football only for hackathon)
- Native iOS/Android apps (web-first for hackathon)
- User accounts and persistent profiles

# **12\. Appendix - The Demo Narrative**

For judges, the demo follows this sequence:

1\. Open app - live match loads in <2 seconds. Score, clock, lineups visible.

2\. Point to lineup panel - 'These are the live starting XIs. We poll the API every 60 seconds for substitutions.'

3\. Trigger a goal event (via demo dataset) - show real-time: chat AI message appears, video panel loads highlight, score updates.

4\. Type a question in chat: '@AI What does this mean tactically?' - AI responds with Gemini-generated insight.

5\. Show Cloud Run dashboard - all services live, auto-scaling, zero infra management.

**Total demo time: 4-5 minutes. Tight, visual, and technically impressive.**

Kickoff - Built for Google Cloud Agentic Premier League Hackathon | May 2026
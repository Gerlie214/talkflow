# TalkFlow — Product Requirements

## Problem Statement
TalkFlow is an interactive English speaking-practice web app that helps users improve fluency, pronunciation, pacing and confidence through karaoke-style guided scripts, free speaking, and custom scripts.

Core loop: **Choose → Practice → Speak → Review → Improve → Repeat**

## Architecture
- Frontend: React 19 + React Router + Tailwind + shadcn/ui + Framer/Sonner + lucide-react
- Backend: FastAPI + Motor (MongoDB async)
- Storage: MongoDB for sessions/custom-scripts; browser localStorage for device_id, settings, recorded audio (base64)
- No auth. Each browser is a device via generated `device_id` in localStorage.

## Design system
"Acoustic Obsidian" dark studio theme
- Background `#09090B`, surface `#121214`, accent amber `#FFB067`, success sage `#A3B19B`
- Fonts: Outfit (heading), Manrope (body)
- Karaoke screen is 100vh immersive; controls in floating glassmorphism pill

## User Personas
1. Non-native English speaker preparing for interviews / presentations
2. ESL learner wanting daily conversational practice
3. Confident speaker preparing a specific speech / script

## Core Requirements (static)
- Curated topic library across 6 categories
- Karaoke-style teleprompter with previous/next/pause controls
- Timer with elapsed time
- Free speaking mode with random prompt + timer
- Custom script paste-in mode
- Browser audio recording + playback (via MediaRecorder)
- Session history + progress stats + 7-day chart
- Settings (auto-advance, session length, interval)

## Implemented (2026-02)
- ✅ Backend: `/api/topics`, `/api/topics/categories`, `/api/topics/{id}`, `/api/free-prompts`
- ✅ Backend: `/api/sessions` (create/list/delete), `/api/stats`
- ✅ Backend: `/api/custom-scripts` (create/list/get/delete)
- ✅ Seeded 23 topics across 6 categories + 10 free prompts
- ✅ Frontend: Dashboard, Library (search + category + difficulty filters), Topic Detail, Practice (karaoke), Complete, Custom Script, Free Speaking, History (with audio playback), Progress (with weekly chart), Settings
- ✅ Browser mic recording with base64 localStorage persistence
- ✅ Device-id based no-auth flow
- ✅ Studio dark theme, Outfit/Manrope fonts, glass pill controls, mask-fade teleprompter
- ✅ Verified: full E2E flow (topic → practice → play → next → finish → history) works. All backend endpoints tested via curl.

## Prioritized Backlog
### P1 (Phase 2)
- Achievements + streak badges (7/14/30/100 day milestones)
- Daily speaking challenge widget on dashboard
- Favorite topics + resume-where-you-left-off across sessions

### P2 (Phase 3 — AI)
- AI feedback (pronunciation, fluency, filler-word detection) — optional Emergent LLM key
- AI conversation mode (roleplay: interview, restaurant, workplace)
- Personalized topic recommendations based on history
- AI-generated custom topics

### P3 (Phase 4 — Full platform)
- User accounts + cloud sync (drop the device_id-only model)
- Public/shared scripts and community leaderboards
- Premium subscription

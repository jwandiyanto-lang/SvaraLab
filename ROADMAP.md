# SvaraLab Development Roadmap

## Overview
SvaraLab is an English speaking practice app for Indonesian students with 4 game modes and 4 difficulty levels.

---

## Course Structure

### 4 Difficulty Levels
| Level | Name | Timer | XP Required |
|-------|------|-------|-------------|
| 1 | Beginner | 8 sec | Free |
| 2 | Elementary | 6 sec | 500 XP |
| 3 | Intermediate | 5 sec | 1500 XP |
| 4 | Advanced | 4 sec | 3500 XP |

### 4 Game Modes
| Mode | Name | Description | Evaluation |
|------|------|-------------|------------|
| 1 | **Speak Fast** | See Indonesian -> Speak English | xAI Grok Voice |
| 2 | **Think & Answer** | Answer questions naturally | xAI Grok Voice |
| 3 | **Listen Sharp** | Audio only -> Repeat/answer | xAI Grok Voice |
| 4 | **Real Talk** | Role-play scenarios | xAI Grok Voice |

---

## Sprint Plan

### Sprint 1: Foundation ✅ COMPLETE
**Duration:** 1 week
**Goal:** Core App + Speak Fast Mode

Tasks:
- [x] Restructure app navigation (Expo Router)
- [x] Create mode selection home screen
- [x] Build level selection screen
- [x] Implement XP tracking in gameStore
- [x] Create Speak Fast mode content (250 items - exceeded target!)
- [x] Add level lock/unlock logic
- [x] Settings screen with accent/speed options
- [x] Progress tracking screen

Deliverable: Speak Fast mode fully functional ✅

---

### Sprint 2: AI Integration ✅ COMPLETE
**Duration:** 1 week
**Goal:** Think & Answer Mode with AI

Tasks:
- [x] Create grokVoice service for xAI API
- [x] Build real-time speech recognition
- [x] Create Think & Answer mode game screen
- [x] Display AI feedback to user
- [x] Create Think & Answer content (200 prompts - exceeded target!)

Deliverable: Think & Answer mode with AI evaluation ✅

---

### Sprint 3: Audio Features ✅ COMPLETE
**Duration:** 1 week
**Goal:** Listen Sharp Mode

Tasks:
- [x] Integrate xAI Grok Voice for TTS
- [x] Build Listen Sharp mode game screen
- [x] Create Listen Sharp content (70 topics)
- [x] Support accent selection (US/UK/AU)
- [x] useGrokVoice hook for speech handling

Deliverable: Listen Sharp mode working ✅

---

### Sprint 4: Situation Mode 🔄 IN PROGRESS
**Duration:** 1 week
**Goal:** Role-play scenarios

Tasks:
- [ ] Build Real Talk mode screen
- [ ] Create scenario evaluation rubric
- [ ] Add think time + speak time
- [ ] Create 60 scenarios (expanded from 30)
- [ ] Character system (6 characters with different accents)
- [ ] Placement test for level assignment

Deliverable: All 4 modes complete

---

### Sprint 5: Production
**Duration:** 1 week
**Goal:** Backend + Launch

Tasks:
- [ ] Set up backend (user authentication)
- [ ] Progress sync across devices
- [ ] Leaderboard
- [ ] Final testing
- [ ] App store submission

Deliverable: Production-ready app

---

## Content Status

### Completed Content (580 items total)
| Mode | Beginner | Elementary | Intermediate | Advanced | Total | Status |
|------|----------|------------|--------------|----------|-------|--------|
| Speak Fast | 50 | 75 | 75 | 50 | **250** | ✅ Done |
| Think & Answer | 40 | 60 | 60 | 40 | **200** | ✅ Done |
| Listen Sharp | 15 | 20 | 20 | 15 | **70** | ✅ Done |
| Real Talk | 12 | 18 | 18 | 12 | **60** | 🔄 Pending |

### Pending Content
- [ ] Real Talk scenarios (60)
- [ ] Character system (6 characters)
- [ ] Placement test (5 questions)

---

## Pricing

### Monthly Subscription
**Rp 599,000/month**

Features included:
- All 4 game modes
- All 580+ practice items
- AI-powered speech evaluation
- Progress tracking
- Multiple accent options
- Unlimited practice sessions

---

## API Costs (Monthly Estimate)

| Service | Cost per Use | Est. Monthly |
|---------|--------------|--------------|
| xAI Grok Voice | ~$0.01/min | $100 (10K uses) |
| ElevenLabs TTS | $0.18/1K chars | $22 (one-time) |

**Total Monthly API Cost:** ~$100-150 for 10K active users

---

## Tech Stack
- **Frontend:** React Native (Expo) with Expo Router
- **Speech AI:** xAI Grok Voice API (real-time WebSocket)
- **Text-to-Speech:** ElevenLabs (optional)
- **State:** Zustand + AsyncStorage
- **Backend:** TBD

---

## Success Metrics
- [ ] 1000 users in first month
- [ ] 70% completion rate for Beginner level
- [ ] 4+ star app store rating
- [ ] <3 second response time for AI evaluation

---

## XP System

### Earning XP
| Action | XP |
|--------|-----|
| Correct answer | +10-30 (by difficulty) |
| Speed bonus (first 50% of time) | +5 |
| Streak bonus | +2 per streak |
| Perfect round | +20 |
| Daily challenge | +50 |

### Level Unlocks
| Level | XP Required |
|-------|-------------|
| Beginner | 0 (Free) |
| Elementary | 500 |
| Intermediate | 1500 |
| Advanced | 3500 |

---

## App Navigation

```
Home (Mode Selection)
├── Speak Fast ⚡
│   ├── Beginner (50 items)
│   ├── Elementary (75 items)
│   ├── Intermediate (75 items)
│   └── Advanced (50 items)
├── Think & Answer 💭
│   ├── Beginner (40 items)
│   ├── Elementary (60 items)
│   ├── Intermediate (60 items)
│   └── Advanced (40 items)
├── Listen Sharp 👂
│   ├── Beginner (15 topics)
│   ├── Elementary (20 topics)
│   ├── Intermediate (20 topics)
│   └── Advanced (15 topics)
├── Real Talk 🎭
│   └── 60 scenarios across all levels
├── Speed Challenge ⚡ (bonus mode)
└── Settings ⚙️
```

---

## Character System (Planned)

| Character | Voice | Accent | Personality |
|-----------|-------|--------|-------------|
| Maya | Ara | American | Friendly teacher |
| James | Rex | British | Professional mentor |
| Sari | Eve | Australian | Energetic friend |
| Budi | Leo | American | Patient coach |
| Nina | Sal | British | Calm narrator |
| Eko | Rex | Australian | Fun uncle |

# SvaraLab Development Roadmap

## Overview
SvaraLab is an English speaking practice app for Indonesian students with 4 game modes and 4 difficulty levels.

---

## Course Structure

### 4 Difficulty Levels
| Level | Name | Timer | XP Required |
|-------|------|-------|-------------|
| 1 | Beginner | 5-7 sec | Free |
| 2 | Elementary | 4-5 sec | 500 XP |
| 3 | Intermediate | 3-4 sec | 1500 XP |
| 4 | Advanced | 2-3 sec | 3000 XP |

### 4 Game Modes
| Mode | Name | Description | Evaluation |
|------|------|-------------|------------|
| 1 | Repeat | See Indonesian → Speak English | Whisper API |
| 2 | Respond | Answer questions naturally | GPT-4 AI |
| 3 | Listen | Audio only → Repeat/answer | Whisper API |
| 4 | Situation | Role-play scenarios | GPT-4 AI |

---

## Sprint Plan

### Sprint 1: Foundation
**Duration:** 1 week
**Goal:** Repeat Mode + XP System

Tasks:
- [ ] Restructure app navigation
- [ ] Create mode selection home screen
- [ ] Build level selection screen
- [ ] Implement XP tracking in userStore
- [ ] Create Repeat mode content (80 items)
- [ ] Add level lock/unlock logic

Deliverable: Repeat mode fully functional

---

### Sprint 2: AI Integration
**Duration:** 1 week
**Goal:** Respond Mode with GPT

Tasks:
- [ ] Create gptService.ts for OpenAI API
- [ ] Build evaluation prompt system
- [ ] Create Respond mode game screen
- [ ] Display AI feedback to user
- [ ] Create Respond content (80 prompts)

Deliverable: Respond mode with AI evaluation

---

### Sprint 3: Audio Features
**Duration:** 1 week
**Goal:** Listen Mode

Tasks:
- [ ] Create audioService.ts
- [ ] Integrate ElevenLabs for TTS
- [ ] Build Listen mode game screen
- [ ] Generate audio for all content
- [ ] Support accent selection

Deliverable: Listen mode working

---

### Sprint 4: Situation Mode
**Duration:** 1 week
**Goal:** Role-play scenarios

Tasks:
- [ ] Build Situation mode screen
- [ ] Create scenario evaluation rubric
- [ ] Add think time + speak time
- [ ] Create 30 scenarios (3 categories)
- [ ] Polish UI/UX

Deliverable: All 4 modes complete

---

### Sprint 5: Production
**Duration:** 1 week
**Goal:** Backend + Launch

Tasks:
- [ ] Set up Emergent backend
- [ ] User authentication
- [ ] Progress sync
- [ ] Leaderboard
- [ ] Final testing
- [ ] App store submission

Deliverable: Production-ready app

---

## Content Requirements

### Per Mode (Total: 320 items + 30 scenarios)
| Mode | Beginner | Elementary | Intermediate | Advanced | Total |
|------|----------|------------|--------------|----------|-------|
| Repeat | 20 | 20 | 20 | 20 | 80 |
| Respond | 20 | 20 | 20 | 20 | 80 |
| Listen | 20 | 20 | 20 | 20 | 80 |
| Situation | 8 | 8 | 7 | 7 | 30 |

### Scenario Categories
- **Professional (10):** Banker, customer service, meetings, interviews
- **Daily Life (10):** Restaurant, hotel, shopping, directions
- **Social (10):** Small talk, parties, making friends

---

## API Costs (Monthly Estimate)

| Service | Cost per Use | Est. Monthly |
|---------|--------------|--------------|
| OpenAI Whisper | $0.006/min | $50 (10K uses) |
| GPT-4 Evaluation | $0.02/eval | $100 (5K uses) |
| ElevenLabs TTS | $0.18/1K chars | $22 (one-time) |

**Total Monthly:** ~$150-200 for 10K active users

---

## Tech Stack
- **Frontend:** React Native (Expo)
- **Backend:** Emergent (PostgreSQL)
- **Speech-to-Text:** OpenAI Whisper
- **AI Evaluation:** GPT-4
- **Text-to-Speech:** ElevenLabs
- **State:** Zustand + AsyncStorage

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
| Correct answer | +10 |
| Speed bonus (first 50% of time) | +5 |
| Streak bonus | +2 per streak |
| Perfect round | +20 |
| Daily challenge | +50 |

### Level Unlocks
| Level | XP Required | Cumulative |
|-------|-------------|------------|
| Beginner | 0 | 0 |
| Elementary | 500 | 500 |
| Intermediate | 1000 | 1500 |
| Advanced | 1500 | 3000 |

---

## App Navigation

```
Home (Mode Selection)
├── Repeat Mode
│   ├── Beginner (20 items)
│   ├── Elementary (20 items) 🔒
│   ├── Intermediate (20 items) 🔒
│   └── Advanced (20 items) 🔒
├── Respond Mode
│   └── (same structure)
├── Listen Mode
│   └── (same structure)
└── Situation Mode
    ├── Professional
    ├── Daily Life
    └── Social
```

---

## Data Structures

### Repeat Mode Item
```json
{
  "id": "rep-beg-001",
  "indonesian": "Selamat pagi",
  "english": "Good morning",
  "audio_url": "audio/good-morning.mp3",
  "timer_seconds": 5,
  "xp_reward": 10
}
```

### Respond Mode Item
```json
{
  "id": "res-ele-001",
  "prompt": "How are you doing today?",
  "expected_topics": ["feeling", "wellbeing"],
  "sample_answers": ["I'm good", "I'm doing well"],
  "timer_seconds": 5,
  "xp_reward": 15
}
```

### Situation Mode Item
```json
{
  "id": "sit-adv-001",
  "category": "professional",
  "role": "Bank Teller",
  "scenario": "A customer is upset...",
  "task": "Apologize professionally...",
  "evaluation_criteria": ["apologetic tone", "clear explanation"],
  "think_time": 10,
  "speak_time": 30,
  "xp_reward": 50
}
```

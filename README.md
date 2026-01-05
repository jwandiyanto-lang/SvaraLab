# SvaraLab

English speaking practice app for Indonesian students.

## Client Info

| Field | Value |
|-------|-------|
| Project | SvaraLab |
| Type | Mobile App (Expo/React Native) |
| Target | Indonesian students learning English |
| Focus | Speaking practice only |

## Tech Stack

- **Frontend:** React Native (Expo)
- **Speech Recognition:** expo-speech-recognition (dev) / OpenAI Whisper (prod)
- **Text-to-Speech:** expo-speech / ElevenLabs
- **State Management:** Zustand
- **Backend:** Emergent (PostgreSQL)

## Features

### 1. Vocabulary Mode
- Display Indonesian word
- Timer countdown (3-5 seconds based on difficulty)
- User speaks English translation
- Speech recognition verifies answer
- Visual feedback (correct/incorrect)

### 2. Speed Challenge Mode
- Gamified with lives (3 hearts)
- Streak multipliers for bonus points
- 3-second timer pressure
- Levels with increasing difficulty
- Personal best tracking

## Development

```bash
# Navigate to app directory
cd app

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

## Folder Structure

```
SvaraLab/
├── README.md           # This file
├── 1-discovery/
│   └── requirements.md # Detailed requirements
├── data/
│   └── vocabulary.json # 100 Indonesian-English word pairs
└── app/                # Expo React Native project
    ├── app/            # Screens (Expo Router)
    ├── components/     # UI components
    ├── hooks/          # Custom hooks
    └── stores/         # Zustand state
```

## Vocabulary Categories

- **Travel:** Directions, transportation, accommodation
- **Daily Life:** Shopping, food, common phrases
- **Slang:** Indonesian and English casual expressions

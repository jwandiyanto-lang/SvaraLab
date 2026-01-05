# SvaraLab

English speaking practice app for Indonesian students.

## Quick Start
```bash
cd app && npm install && npx expo start
```

## Tech Stack
- **Framework:** Expo/React Native with Expo Router
- **State:** Zustand (stores/)
- **Voice:** xAI Grok Voice Agent API (STT + LLM + TTS unified)
- **TTS Backup:** ElevenLabs (alternative voices)
- **Backend:** Emergent (PostgreSQL) - not yet implemented

## API Keys Setup

Keys are in `app/.env.local` (gitignored):
```
EXPO_PUBLIC_XAI_API_KEY=xai-...
EXPO_PUBLIC_ELEVENLABS_API_KEY=sk_...
```

Access in code: `process.env.EXPO_PUBLIC_XAI_API_KEY`

**Required APIs:**
| Service | Purpose | Cost | Get Key |
|---------|---------|------|---------|
| xAI Grok | Voice API (STT + LLM + TTS) | $0.05/min | https://console.x.ai |
| ElevenLabs | TTS (backup/alternative) | ~$0.18/1K chars | https://elevenlabs.io |

## Project Structure
```
SvaraLab/
├── app/                    # Expo project
│   ├── app/               # Screens (Expo Router)
│   │   ├── (tabs)/        # Tab navigation
│   │   ├── game/          # Game mode screens
│   │   └── course/        # Course selection
│   ├── components/        # Reusable UI
│   ├── constants/theme.ts # Design system
│   ├── hooks/             # Custom hooks
│   └── stores/            # Zustand state
├── data/                  # Content JSON files
├── ROADMAP.md            # Sprint plan & features
└── COSTING.md            # API cost estimates
```

## Game Modes
1. **Repeat** - See Indonesian, speak English (Grok Voice eval)
2. **Respond** - Answer questions naturally (Grok LLM eval)
3. **Listen** - Audio only, speak response (Grok Voice eval)
4. **Situation** - Role-play scenarios (Grok LLM eval)

## Conventions
- Use theme constants from `constants/theme.ts` (colors, spacing, typography)
- State in Zustand stores, not local state for shared data
- Expo Router file-based routing
- TypeScript for all new code
- Keep components small and focused

## Current Sprint
See ROADMAP.md for active tasks.

## Testing
```bash
npx expo start --ios      # iOS simulator
npx expo start --android  # Android emulator
```

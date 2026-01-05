import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Accent = 'us' | 'uk' | 'au';
export type GameMode = 'ucapkan' | 'jawab' | 'simak' | 'situasi';

interface Settings {
  accent: Accent;
  playbackSpeed: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  autoPlayAudio: boolean;
}

// High scores for each game mode
interface ModeHighScores {
  bestStreak: number;
  bestAccuracy: number;  // percentage 0-100
  totalPlayed: number;
  totalCorrect: number;
}

interface Stats {
  // Lifetime stats
  currentDayStreak: number;
  longestDayStreak: number;
  lastPlayedDate: string | null;

  // Per-mode high scores
  ucapkan: ModeHighScores;
  jawab: ModeHighScores;
  simak: ModeHighScores;
  situasi: ModeHighScores;
}

// Current game session state
interface GameSession {
  mode: GameMode | null;
  isPlaying: boolean;
  currentStreak: number;
  sessionCorrect: number;
  sessionTotal: number;
  currentDifficulty: number;  // 1-10
  consecutiveCorrect: number;
  consecutiveWrong: number;
}

interface GameStore {
  settings: Settings;
  stats: Stats;
  session: GameSession;

  // Settings
  updateSettings: (newSettings: Partial<Settings>) => void;

  // Session actions
  startSession: (mode: GameMode) => void;
  endSession: () => void;
  recordAnswer: (correct: boolean) => void;
  getTimerSeconds: () => number;

  // Stats getters
  getModeStats: (mode: GameMode) => ModeHighScores;
  getSessionAccuracy: () => number;

  // Day streak
  updateDayStreak: () => void;

  // Reset
  resetStats: () => void;
}

const defaultModeHighScores: ModeHighScores = {
  bestStreak: 0,
  bestAccuracy: 0,
  totalPlayed: 0,
  totalCorrect: 0,
};

const defaultSettings: Settings = {
  accent: 'us',
  playbackSpeed: 1.0,
  soundEnabled: true,
  hapticEnabled: true,
  autoPlayAudio: true,
};

const defaultStats: Stats = {
  currentDayStreak: 0,
  longestDayStreak: 0,
  lastPlayedDate: null,
  ucapkan: { ...defaultModeHighScores },
  jawab: { ...defaultModeHighScores },
  simak: { ...defaultModeHighScores },
  situasi: { ...defaultModeHighScores },
};

const defaultSession: GameSession = {
  mode: null,
  isPlaying: false,
  currentStreak: 0,
  sessionCorrect: 0,
  sessionTotal: 0,
  currentDifficulty: 5,  // Start in the middle
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      stats: defaultStats,
      session: defaultSession,

      // Settings
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // Start a new game session
      startSession: (mode) =>
        set(() => ({
          session: {
            ...defaultSession,
            mode,
            isPlaying: true,
            currentDifficulty: 5,
          },
        })),

      // End session and save high scores
      endSession: () =>
        set((state) => {
          const { session, stats } = state;
          if (!session.mode || session.sessionTotal === 0) {
            return { session: defaultSession };
          }

          const mode = session.mode;
          const modeStats = stats[mode];
          const sessionAccuracy = Math.round((session.sessionCorrect / session.sessionTotal) * 100);

          // Update mode high scores
          const newModeStats: ModeHighScores = {
            bestStreak: Math.max(modeStats.bestStreak, session.currentStreak),
            bestAccuracy: Math.max(modeStats.bestAccuracy, sessionAccuracy),
            totalPlayed: modeStats.totalPlayed + session.sessionTotal,
            totalCorrect: modeStats.totalCorrect + session.sessionCorrect,
          };

          return {
            session: defaultSession,
            stats: {
              ...stats,
              [mode]: newModeStats,
            },
          };
        }),

      // Record an answer and adjust difficulty
      recordAnswer: (correct) =>
        set((state) => {
          const { session } = state;
          let newDifficulty = session.currentDifficulty;
          let newConsecutiveCorrect = session.consecutiveCorrect;
          let newConsecutiveWrong = session.consecutiveWrong;
          let newStreak = session.currentStreak;

          if (correct) {
            newStreak = session.currentStreak + 1;
            newConsecutiveCorrect = session.consecutiveCorrect + 1;
            newConsecutiveWrong = 0;

            // Increase difficulty after 3 consecutive correct
            if (newConsecutiveCorrect >= 3) {
              newDifficulty = Math.min(10, session.currentDifficulty + 1);
              newConsecutiveCorrect = 0;
            }
          } else {
            newStreak = 0;  // Reset streak on wrong answer
            newConsecutiveWrong = session.consecutiveWrong + 1;
            newConsecutiveCorrect = 0;

            // Decrease difficulty after 2 consecutive wrong
            if (newConsecutiveWrong >= 2) {
              newDifficulty = Math.max(1, session.currentDifficulty - 1);
              newConsecutiveWrong = 0;
            }
          }

          return {
            session: {
              ...session,
              currentStreak: newStreak,
              sessionCorrect: session.sessionCorrect + (correct ? 1 : 0),
              sessionTotal: session.sessionTotal + 1,
              currentDifficulty: newDifficulty,
              consecutiveCorrect: newConsecutiveCorrect,
              consecutiveWrong: newConsecutiveWrong,
            },
          };
        }),

      // Get timer based on current difficulty (8s at level 1, 3s at level 10)
      getTimerSeconds: () => {
        const { currentDifficulty } = get().session;
        return Math.round(8 - (currentDifficulty * 0.5));  // 8, 7.5, 7, ... 3.5, 3
      },

      // Get stats for a specific mode
      getModeStats: (mode) => {
        return get().stats[mode];
      },

      // Get current session accuracy
      getSessionAccuracy: () => {
        const { sessionCorrect, sessionTotal } = get().session;
        if (sessionTotal === 0) return 0;
        return Math.round((sessionCorrect / sessionTotal) * 100);
      },

      // Update day streak (call when user plays)
      updateDayStreak: () =>
        set((state) => {
          const today = new Date().toDateString();
          const lastPlayed = state.stats.lastPlayedDate;
          const yesterday = new Date(Date.now() - 86400000).toDateString();

          let newDayStreak = state.stats.currentDayStreak;

          if (lastPlayed === today) {
            // Already played today, no change
          } else if (lastPlayed === yesterday) {
            // Consecutive day
            newDayStreak += 1;
          } else {
            // Gap in days, reset to 1
            newDayStreak = 1;
          }

          return {
            stats: {
              ...state.stats,
              currentDayStreak: newDayStreak,
              longestDayStreak: Math.max(newDayStreak, state.stats.longestDayStreak),
              lastPlayedDate: today,
            },
          };
        }),

      // Reset all stats
      resetStats: () =>
        set(() => ({
          stats: defaultStats,
        })),
    }),
    {
      name: 'svaralab-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        stats: state.stats,
      }),
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Accent = 'us' | 'uk' | 'au' | 'sg';
export type GameMode = 'ucapkan' | 'jawab' | 'simak' | 'situasi' | 'speed';
export type Level = 'beginner' | 'elementary' | 'intermediate' | 'advanced';
export type Difficulty = 'easy' | 'medium' | 'hard';

// Daily usage limits for free tier
export const FREE_DAILY_SESSIONS = 3;
export const FREE_DAILY_MINUTES = 15;

// Daily usage tracking
export interface DailyUsage {
  date: string; // YYYY-MM-DD format
  sessionsUsed: number;
  minutesUsed: number;
}

// Streak achievements
export interface StreakMilestone {
  days: number;
  achieved: boolean;
  achievedAt?: string;
}

// Word of the Day
export interface WordOfDay {
  date: string;
  indonesian: string;
  english: string;
  pronunciation?: string;
  example?: string;
  saved: boolean;
}

// User profile
export interface UserProfile {
  name: string;
  dreamDestination: Accent;
  dailyCommitment: 5 | 15 | 30 | 45; // minutes
  weeklyGoal: number; // days per week (1-7)
  avatarUrl?: string;
}

// Placement test results
export interface PlacementTestResult {
  grammarScore: number; // 0-100
  listeningScore: number; // 0-100
  speakingScore: number; // 0-100
  overallLevel: Level;
  completedAt: string;
}

// Onboarding state
export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  hasCompletedProfile: boolean;
  hasCompletedPlacementTest: boolean;
  placementTestResult: PlacementTestResult | null;
}

// XP requirements for each level
export const LEVEL_XP_REQUIREMENTS: Record<Level, number> = {
  beginner: 0,
  elementary: 500,
  intermediate: 1500,
  advanced: 3500,
};

// Timer seconds for each level
export const LEVEL_TIMERS: Record<Level, number> = {
  beginner: 8,
  elementary: 6,
  intermediate: 5,
  advanced: 4,
};

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

  // Global stats for home screen
  totalXP: number;
  wordsLearned: number;
  currentStreak: number;
  totalAnswers: number;
  correctAnswers: number;
  totalGamesPlayed: number;
  highScore: number;

  // Daily usage tracking (for free tier limits)
  dailyUsage: DailyUsage;

  // Streak milestones
  streakMilestones: StreakMilestone[];
  streakFreezeAvailable: boolean;
  lastStreakFreezeDate: string | null;

  // Word of the day
  wordOfDay: WordOfDay | null;

  // Per-mode high scores
  ucapkan: ModeHighScores;
  jawab: ModeHighScores;
  simak: ModeHighScores;
  situasi: ModeHighScores;
  speed: ModeHighScores;
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

// Speed game state
interface SpeedGameState {
  isPlaying: boolean;
  score: number;
  lives: number;
  streak: number;
  difficulty: Difficulty;
}

interface GameStore {
  settings: Settings;
  stats: Stats;
  session: GameSession;
  gameState: SpeedGameState;
  profile: UserProfile;
  onboarding: OnboardingState;

  // Profile & Onboarding
  updateProfile: (newProfile: Partial<UserProfile>) => void;
  completeProfile: () => void;
  completePlacementTest: (result: PlacementTestResult) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;

  // Settings
  updateSettings: (newSettings: Partial<Settings>) => void;

  // Session actions
  startSession: (mode: GameMode) => void;
  endSession: () => void;
  recordAnswer: (correct: boolean) => void;
  getTimerSeconds: () => number;

  // Speed game actions
  startGame: (mode: GameMode) => void;
  endGame: () => void;
  answerCorrect: (points: number) => void;
  answerIncorrect: () => void;
  updateHighScore: (score: number) => void;

  // Stats getters
  getModeStats: (mode: GameMode) => ModeHighScores;
  getSessionAccuracy: () => number;
  getNextLevelProgress: () => { percentage: number; required: number; currentLevel: Level };
  getCurrentLevel: () => Level;
  getUnlockedLevels: () => Level[];
  isLevelUnlocked: (level: Level) => boolean;

  // XP and progress
  addXP: (amount: number) => void;
  incrementWordsLearned: () => void;

  // Day streak
  updateDayStreak: () => void;

  // Daily usage limits
  canStartSession: () => { allowed: boolean; reason?: string; sessionsLeft: number; minutesLeft: number };
  recordSessionStart: () => void;
  addSessionMinutes: (minutes: number) => void;
  resetDailyUsageIfNeeded: () => void;

  // Streak features
  useStreakFreeze: () => boolean;
  checkStreakMilestones: () => StreakMilestone[];

  // Word of the day
  setWordOfDay: (word: Omit<WordOfDay, 'date' | 'saved'>) => void;
  saveWordOfDay: () => void;
  getWordOfDay: () => WordOfDay | null;

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

// Helper to get today's date as YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

const defaultDailyUsage: DailyUsage = {
  date: getTodayDate(),
  sessionsUsed: 0,
  minutesUsed: 0,
};

const defaultStreakMilestones: StreakMilestone[] = [
  { days: 7, achieved: false },
  { days: 30, achieved: false },
  { days: 100, achieved: false },
];

const defaultStats: Stats = {
  currentDayStreak: 0,
  longestDayStreak: 0,
  lastPlayedDate: null,
  totalXP: 5000, // Start with high XP for testing - all levels unlocked
  wordsLearned: 0,
  currentStreak: 0,
  totalAnswers: 0,
  correctAnswers: 0,
  totalGamesPlayed: 0,
  highScore: 0,
  dailyUsage: { ...defaultDailyUsage },
  streakMilestones: [...defaultStreakMilestones],
  streakFreezeAvailable: true,
  lastStreakFreezeDate: null,
  wordOfDay: null,
  ucapkan: { ...defaultModeHighScores },
  jawab: { ...defaultModeHighScores },
  simak: { ...defaultModeHighScores },
  situasi: { ...defaultModeHighScores },
  speed: { ...defaultModeHighScores },
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

const defaultGameState: SpeedGameState = {
  isPlaying: false,
  score: 0,
  lives: 3,
  streak: 0,
  difficulty: 'medium',
};

const defaultProfile: UserProfile = {
  name: '',
  dreamDestination: 'us',
  dailyCommitment: 15,
  weeklyGoal: 4,
};

const defaultOnboarding: OnboardingState = {
  hasCompletedOnboarding: false,
  hasCompletedProfile: false,
  hasCompletedPlacementTest: false,
  placementTestResult: null,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      stats: defaultStats,
      session: defaultSession,
      gameState: defaultGameState,
      profile: defaultProfile,
      onboarding: defaultOnboarding,

      // Profile & Onboarding
      updateProfile: (newProfile) =>
        set((state) => ({
          profile: { ...state.profile, ...newProfile },
        })),

      completeProfile: () =>
        set((state) => ({
          onboarding: { ...state.onboarding, hasCompletedProfile: true },
        })),

      completePlacementTest: (result) =>
        set((state) => {
          // Set starting XP based on placement test level
          const levelXP: Record<Level, number> = {
            beginner: 0,
            elementary: 500,
            intermediate: 1500,
            advanced: 3500,
          };
          return {
            onboarding: {
              ...state.onboarding,
              hasCompletedPlacementTest: true,
              placementTestResult: result,
            },
            stats: {
              ...state.stats,
              totalXP: levelXP[result.overallLevel],
            },
          };
        }),

      completeOnboarding: () =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            hasCompletedOnboarding: true,
          },
        })),

      skipOnboarding: () =>
        set(() => ({
          onboarding: {
            hasCompletedOnboarding: true,
            hasCompletedProfile: false,
            hasCompletedPlacementTest: false,
            placementTestResult: null,
          },
          stats: {
            ...defaultStats,
            totalXP: 0, // Start at beginner if skipped
          },
        })),

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

      // Get current level based on XP
      getCurrentLevel: () => {
        const xp = get().stats.totalXP;
        if (xp >= LEVEL_XP_REQUIREMENTS.advanced) return 'advanced';
        if (xp >= LEVEL_XP_REQUIREMENTS.intermediate) return 'intermediate';
        if (xp >= LEVEL_XP_REQUIREMENTS.elementary) return 'elementary';
        return 'beginner';
      },

      // Get progress to next level
      getNextLevelProgress: () => {
        const xp = get().stats.totalXP;
        const levels: Level[] = ['beginner', 'elementary', 'intermediate', 'advanced'];

        // Find current and next level
        let currentLevel: Level = 'beginner';
        let nextLevelXP = LEVEL_XP_REQUIREMENTS.elementary;
        let currentLevelXP = 0;

        for (let i = levels.length - 1; i >= 0; i--) {
          if (xp >= LEVEL_XP_REQUIREMENTS[levels[i]]) {
            currentLevel = levels[i];
            currentLevelXP = LEVEL_XP_REQUIREMENTS[levels[i]];
            nextLevelXP = i < levels.length - 1 ? LEVEL_XP_REQUIREMENTS[levels[i + 1]] : LEVEL_XP_REQUIREMENTS.advanced;
            break;
          }
        }

        // If already at max level
        if (currentLevel === 'advanced') {
          return { percentage: 100, required: LEVEL_XP_REQUIREMENTS.advanced, currentLevel };
        }

        const xpInCurrentLevel = xp - currentLevelXP;
        const xpNeededForNext = nextLevelXP - currentLevelXP;
        const percentage = (xpInCurrentLevel / xpNeededForNext) * 100;

        return { percentage, required: nextLevelXP, currentLevel };
      },

      // Add XP
      addXP: (amount) =>
        set((state) => ({
          stats: {
            ...state.stats,
            totalXP: state.stats.totalXP + amount,
          },
        })),

      // Increment words learned
      incrementWordsLearned: () =>
        set((state) => ({
          stats: {
            ...state.stats,
            wordsLearned: state.stats.wordsLearned + 1,
          },
        })),

      // Get list of unlocked levels
      getUnlockedLevels: () => {
        const xp = get().stats.totalXP;
        const levels: Level[] = ['beginner', 'elementary', 'intermediate', 'advanced'];
        return levels.filter(level => xp >= LEVEL_XP_REQUIREMENTS[level]);
      },

      // Check if a level is unlocked
      isLevelUnlocked: (level) => {
        const xp = get().stats.totalXP;
        return xp >= LEVEL_XP_REQUIREMENTS[level];
      },

      // Speed game: start game
      startGame: (mode) =>
        set((state) => ({
          gameState: {
            ...defaultGameState,
            isPlaying: true,
          },
          stats: {
            ...state.stats,
            totalGamesPlayed: state.stats.totalGamesPlayed + 1,
          },
        })),

      // Speed game: end game
      endGame: () =>
        set(() => ({
          gameState: defaultGameState,
        })),

      // Speed game: answer correct
      answerCorrect: (points) =>
        set((state) => ({
          gameState: {
            ...state.gameState,
            score: state.gameState.score + points,
            streak: state.gameState.streak + 1,
          },
        })),

      // Speed game: answer incorrect
      answerIncorrect: () =>
        set((state) => ({
          gameState: {
            ...state.gameState,
            lives: state.gameState.lives - 1,
            streak: 0,
          },
        })),

      // Speed game: update high score
      updateHighScore: (score) =>
        set((state) => ({
          stats: {
            ...state.stats,
            highScore: Math.max(state.stats.highScore, score),
          },
        })),

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

      // Daily usage limits - check if user can start a session
      canStartSession: () => {
        const state = get();
        const today = getTodayDate();
        const usage = state.stats.dailyUsage;

        // Reset if it's a new day
        if (usage.date !== today) {
          return {
            allowed: true,
            sessionsLeft: FREE_DAILY_SESSIONS,
            minutesLeft: FREE_DAILY_MINUTES,
          };
        }

        const sessionsLeft = FREE_DAILY_SESSIONS - usage.sessionsUsed;
        const minutesLeft = FREE_DAILY_MINUTES - usage.minutesUsed;

        if (sessionsLeft <= 0) {
          return {
            allowed: false,
            reason: 'daily_sessions',
            sessionsLeft: 0,
            minutesLeft: Math.max(0, minutesLeft),
          };
        }

        if (minutesLeft <= 0) {
          return {
            allowed: false,
            reason: 'daily_minutes',
            sessionsLeft,
            minutesLeft: 0,
          };
        }

        return {
          allowed: true,
          sessionsLeft,
          minutesLeft,
        };
      },

      // Record when a session starts
      recordSessionStart: () =>
        set((state) => {
          const today = getTodayDate();
          const currentUsage = state.stats.dailyUsage;

          // Reset if new day
          if (currentUsage.date !== today) {
            return {
              stats: {
                ...state.stats,
                dailyUsage: {
                  date: today,
                  sessionsUsed: 1,
                  minutesUsed: 0,
                },
              },
            };
          }

          return {
            stats: {
              ...state.stats,
              dailyUsage: {
                ...currentUsage,
                sessionsUsed: currentUsage.sessionsUsed + 1,
              },
            },
          };
        }),

      // Add minutes to daily usage
      addSessionMinutes: (minutes) =>
        set((state) => {
          const today = getTodayDate();
          const currentUsage = state.stats.dailyUsage;

          // Reset if new day
          if (currentUsage.date !== today) {
            return {
              stats: {
                ...state.stats,
                dailyUsage: {
                  date: today,
                  sessionsUsed: 0,
                  minutesUsed: minutes,
                },
              },
            };
          }

          return {
            stats: {
              ...state.stats,
              dailyUsage: {
                ...currentUsage,
                minutesUsed: currentUsage.minutesUsed + minutes,
              },
            },
          };
        }),

      // Reset daily usage if it's a new day
      resetDailyUsageIfNeeded: () =>
        set((state) => {
          const today = getTodayDate();
          if (state.stats.dailyUsage.date !== today) {
            return {
              stats: {
                ...state.stats,
                dailyUsage: {
                  date: today,
                  sessionsUsed: 0,
                  minutesUsed: 0,
                },
              },
            };
          }
          return state;
        }),

      // Use streak freeze to save streak
      useStreakFreeze: () => {
        const state = get();
        const today = getTodayDate();

        // Check if freeze is available
        if (!state.stats.streakFreezeAvailable) {
          return false;
        }

        // Check if already used this week
        if (state.stats.lastStreakFreezeDate) {
          const lastFreeze = new Date(state.stats.lastStreakFreezeDate);
          const now = new Date();
          const daysSinceFreeze = Math.floor((now.getTime() - lastFreeze.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceFreeze < 7) {
            return false;
          }
        }

        set((s) => ({
          stats: {
            ...s.stats,
            streakFreezeAvailable: false,
            lastStreakFreezeDate: today,
          },
        }));

        return true;
      },

      // Check and award streak milestones
      checkStreakMilestones: () => {
        const state = get();
        const streak = state.stats.currentDayStreak;
        const milestones = [...state.stats.streakMilestones];
        const today = getTodayDate();
        const newlyAchieved: StreakMilestone[] = [];

        milestones.forEach((milestone, index) => {
          if (!milestone.achieved && streak >= milestone.days) {
            milestones[index] = {
              ...milestone,
              achieved: true,
              achievedAt: today,
            };
            newlyAchieved.push(milestones[index]);
          }
        });

        if (newlyAchieved.length > 0) {
          set((s) => ({
            stats: {
              ...s.stats,
              streakMilestones: milestones,
            },
          }));
        }

        return newlyAchieved;
      },

      // Set word of the day
      setWordOfDay: (word) =>
        set((state) => {
          const today = getTodayDate();
          // Only set if we don't already have a word for today
          if (state.stats.wordOfDay?.date === today) {
            return state;
          }
          return {
            stats: {
              ...state.stats,
              wordOfDay: {
                ...word,
                date: today,
                saved: false,
              },
            },
          };
        }),

      // Save word of the day to vocabulary
      saveWordOfDay: () =>
        set((state) => {
          if (!state.stats.wordOfDay) return state;
          return {
            stats: {
              ...state.stats,
              wordOfDay: {
                ...state.stats.wordOfDay,
                saved: true,
              },
              wordsLearned: state.stats.wordsLearned + 1,
            },
          };
        }),

      // Get current word of the day
      getWordOfDay: () => {
        const state = get();
        const today = getTodayDate();
        if (state.stats.wordOfDay?.date === today) {
          return state.stats.wordOfDay;
        }
        return null;
      },

      // Reset all stats and clear persisted storage
      resetStats: () => {
        // Clear AsyncStorage for this store
        AsyncStorage.removeItem('svaralab-storage').catch(console.error);
        return set(() => ({
          stats: defaultStats,
          session: defaultSession,
          gameState: defaultGameState,
        }));
      },
    }),
    {
      name: 'svaralab-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        stats: state.stats,
        profile: state.profile,
        onboarding: state.onboarding,
      }),
    }
  )
);

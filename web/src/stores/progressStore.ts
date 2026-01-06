import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Word mastery levels
export type WordMastery = 'new' | 'learning' | 'familiar' | 'mastered';

// Individual word progress
export interface WordProgress {
  word: string;
  translation?: string;
  mastery: WordMastery;
  correctCount: number;
  totalAttempts: number;
  lastPracticed: number;
  streakCount: number;
}

// Session record
export interface SessionRecord {
  id: string;
  mode: 'speak' | 'respond' | 'listen' | 'situation' | 'reader' | 'flashDrill';
  score: number;
  accuracy: number;
  itemsCompleted: number;
  duration: number; // in seconds
  timestamp: number;
}

// Daily activity
export interface DailyActivity {
  date: string; // YYYY-MM-DD
  minutesPracticed: number;
  sessionsCompleted: number;
  wordsLearned: number;
  xpEarned: number;
}

// Progress state
interface ProgressState {
  // XP and Level
  totalXP: number;
  currentLevel: number;

  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;

  // Word tracking
  words: Record<string, WordProgress>;

  // Session history (last 100)
  sessions: SessionRecord[];

  // Daily activity (last 30 days)
  dailyActivity: Record<string, DailyActivity>;

  // Mode-specific stats
  modeStats: Record<string, {
    totalSessions: number;
    totalScore: number;
    averageAccuracy: number;
    bestScore: number;
  }>;

  // Actions
  addXP: (xp: number) => void;
  recordSession: (session: Omit<SessionRecord, 'id' | 'timestamp'>) => void;
  updateWordProgress: (word: string, correct: boolean, translation?: string) => void;
  getWordsByMastery: (mastery: WordMastery) => WordProgress[];
  getWeakWords: (limit?: number) => WordProgress[];
  getTodayActivity: () => DailyActivity;
  getWeeklyActivity: () => DailyActivity[];
  getModeAccuracy: (mode: string) => number;
  checkAndUpdateStreak: () => void;
}

// XP required per level (increases each level)
const xpPerLevel = (level: number) => 100 + (level - 1) * 50;

// Get today's date string
const getTodayDate = () => new Date().toISOString().split('T')[0];

// Calculate level from XP
const calculateLevel = (xp: number): number => {
  let level = 1;
  let remainingXP = xp;
  while (remainingXP >= xpPerLevel(level)) {
    remainingXP -= xpPerLevel(level);
    level++;
  }
  return level;
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      totalXP: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
      words: {},
      sessions: [],
      dailyActivity: {},
      modeStats: {},

      addXP: (xp: number) => {
        set((state) => {
          const newXP = state.totalXP + xp;
          const newLevel = calculateLevel(newXP);
          return {
            totalXP: newXP,
            currentLevel: newLevel,
          };
        });
      },

      recordSession: (session) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = Date.now();
        const today = getTodayDate();

        set((state) => {
          // Update sessions (keep last 100)
          const newSessions = [
            { ...session, id, timestamp },
            ...state.sessions.slice(0, 99),
          ];

          // Update daily activity
          const todayActivity = state.dailyActivity[today] || {
            date: today,
            minutesPracticed: 0,
            sessionsCompleted: 0,
            wordsLearned: 0,
            xpEarned: 0,
          };

          const updatedDailyActivity = {
            ...state.dailyActivity,
            [today]: {
              ...todayActivity,
              minutesPracticed: todayActivity.minutesPracticed + Math.round(session.duration / 60),
              sessionsCompleted: todayActivity.sessionsCompleted + 1,
              xpEarned: todayActivity.xpEarned + session.score,
            },
          };

          // Update mode stats
          const modeStats = state.modeStats[session.mode] || {
            totalSessions: 0,
            totalScore: 0,
            averageAccuracy: 0,
            bestScore: 0,
          };

          const newTotalSessions = modeStats.totalSessions + 1;
          const newTotalScore = modeStats.totalScore + session.score;
          const newAverageAccuracy =
            (modeStats.averageAccuracy * modeStats.totalSessions + session.accuracy) / newTotalSessions;

          const updatedModeStats = {
            ...state.modeStats,
            [session.mode]: {
              totalSessions: newTotalSessions,
              totalScore: newTotalScore,
              averageAccuracy: Math.round(newAverageAccuracy),
              bestScore: Math.max(modeStats.bestScore, session.score),
            },
          };

          // Add XP
          const newXP = state.totalXP + session.score;
          const newLevel = calculateLevel(newXP);

          // Update streak
          let newStreak = state.currentStreak;
          let newLongestStreak = state.longestStreak;
          const lastDate = state.lastPracticeDate;

          if (lastDate) {
            const lastDateObj = new Date(lastDate);
            const todayObj = new Date(today);
            const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              newStreak = state.currentStreak + 1;
            } else if (diffDays > 1) {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }

          newLongestStreak = Math.max(newLongestStreak, newStreak);

          return {
            sessions: newSessions,
            dailyActivity: updatedDailyActivity,
            modeStats: updatedModeStats,
            totalXP: newXP,
            currentLevel: newLevel,
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastPracticeDate: today,
          };
        });
      },

      updateWordProgress: (word: string, correct: boolean, translation?: string) => {
        const cleanWord = word.toLowerCase().trim();

        set((state) => {
          const existing = state.words[cleanWord] || {
            word: cleanWord,
            translation,
            mastery: 'new' as WordMastery,
            correctCount: 0,
            totalAttempts: 0,
            lastPracticed: 0,
            streakCount: 0,
          };

          const newCorrectCount = existing.correctCount + (correct ? 1 : 0);
          const newTotalAttempts = existing.totalAttempts + 1;
          const newStreak = correct ? existing.streakCount + 1 : 0;

          // Calculate mastery based on performance
          let newMastery: WordMastery = 'new';
          const accuracy = newTotalAttempts > 0 ? newCorrectCount / newTotalAttempts : 0;

          if (newStreak >= 5 && accuracy >= 0.9) {
            newMastery = 'mastered';
          } else if (newStreak >= 3 && accuracy >= 0.7) {
            newMastery = 'familiar';
          } else if (newTotalAttempts >= 2) {
            newMastery = 'learning';
          }

          // Update daily words learned count
          const today = getTodayDate();
          const todayActivity = state.dailyActivity[today];
          const wasPreviouslyNew = existing.mastery === 'new';
          const isNowLearning = newMastery !== 'new';

          return {
            words: {
              ...state.words,
              [cleanWord]: {
                word: cleanWord,
                translation: translation || existing.translation,
                mastery: newMastery,
                correctCount: newCorrectCount,
                totalAttempts: newTotalAttempts,
                lastPracticed: Date.now(),
                streakCount: newStreak,
              },
            },
            dailyActivity: wasPreviouslyNew && isNowLearning && todayActivity ? {
              ...state.dailyActivity,
              [today]: {
                ...todayActivity,
                wordsLearned: todayActivity.wordsLearned + 1,
              },
            } : state.dailyActivity,
          };
        });
      },

      getWordsByMastery: (mastery: WordMastery) => {
        const state = get();
        return Object.values(state.words).filter((w) => w.mastery === mastery);
      },

      getWeakWords: (limit = 10) => {
        const state = get();
        return Object.values(state.words)
          .filter((w) => w.mastery !== 'mastered' && w.totalAttempts > 0)
          .sort((a, b) => {
            const aAccuracy = a.correctCount / a.totalAttempts;
            const bAccuracy = b.correctCount / b.totalAttempts;
            return aAccuracy - bAccuracy;
          })
          .slice(0, limit);
      },

      getTodayActivity: () => {
        const state = get();
        const today = getTodayDate();
        return state.dailyActivity[today] || {
          date: today,
          minutesPracticed: 0,
          sessionsCompleted: 0,
          wordsLearned: 0,
          xpEarned: 0,
        };
      },

      getWeeklyActivity: () => {
        const state = get();
        const result: DailyActivity[] = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];

          result.push(state.dailyActivity[dateStr] || {
            date: dateStr,
            minutesPracticed: 0,
            sessionsCompleted: 0,
            wordsLearned: 0,
            xpEarned: 0,
          });
        }

        return result;
      },

      getModeAccuracy: (mode: string) => {
        const state = get();
        return state.modeStats[mode]?.averageAccuracy || 0;
      },

      checkAndUpdateStreak: () => {
        const state = get();
        const today = getTodayDate();
        const lastDate = state.lastPracticeDate;

        if (lastDate && lastDate !== today) {
          const lastDateObj = new Date(lastDate);
          const todayObj = new Date(today);
          const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays > 1) {
            set({ currentStreak: 0 });
          }
        }
      },
    }),
    {
      name: 'svaralab-progress',
    }
  )
);

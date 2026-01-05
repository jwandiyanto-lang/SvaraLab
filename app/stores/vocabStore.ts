import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import vocabularyData from '../../data/vocabulary.json';

// SRS intervals in days (SuperMemo-style)
const SRS_INTERVALS = [0, 1, 3, 7, 14, 30]; // 0 = new, then increasing intervals

export type CardLevel = 0 | 1 | 2 | 3 | 4 | 5; // 0=new, 5=mastered

export interface VocabWord {
  id: number;
  indonesian: string;
  english: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timerSeconds: number;
  category: string;
}

export interface CardProgress {
  wordId: number;
  level: CardLevel;
  nextReview: string; // ISO date string
  correctCount: number;
  incorrectCount: number;
  lastReviewed: string | null;
  easeFactor: number; // For SM-2 algorithm (2.5 is default)
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface VocabStore {
  // Card progress for each word
  cardProgress: Record<number, CardProgress>;

  // Session state
  currentSessionCards: number[];
  currentCardIndex: number;
  sessionCorrect: number;
  sessionTotal: number;

  // Filter state
  selectedCategory: string | null;

  // Getters
  getWords: () => VocabWord[];
  getCategories: () => Category[];
  getCardProgress: (wordId: number) => CardProgress;
  getDueCards: () => VocabWord[];
  getNewCards: (limit?: number) => VocabWord[];
  getMasteredCount: () => number;
  getLearningCount: () => number;
  getReviewCount: () => number;
  getCategoryStats: (categoryId: string) => { total: number; mastered: number; learning: number };

  // Actions
  initializeCardProgress: (wordId: number) => void;
  reviewCard: (wordId: number, correct: boolean) => void;
  startSession: (cards: number[]) => void;
  nextCard: () => VocabWord | null;
  endSession: () => { correct: number; total: number };
  setSelectedCategory: (categoryId: string | null) => void;
  resetProgress: () => void;
}

// Helper to get today's date as YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

// Helper to add days to a date
const addDays = (date: Date, days: number): string => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
};

// Helper to check if a card is due for review
const isDue = (nextReview: string): boolean => {
  return nextReview <= getTodayDate();
};

export const useVocabStore = create<VocabStore>()(
  persist(
    (set, get) => ({
      cardProgress: {},
      currentSessionCards: [],
      currentCardIndex: 0,
      sessionCorrect: 0,
      sessionTotal: 0,
      selectedCategory: null,

      // Get all vocabulary words
      getWords: () => vocabularyData.vocabulary as VocabWord[],

      // Get all categories
      getCategories: () => vocabularyData.categories as Category[],

      // Get progress for a specific card
      getCardProgress: (wordId) => {
        const progress = get().cardProgress[wordId];
        if (progress) return progress;

        // Return default progress for new card
        return {
          wordId,
          level: 0,
          nextReview: getTodayDate(),
          correctCount: 0,
          incorrectCount: 0,
          lastReviewed: null,
          easeFactor: 2.5,
        };
      },

      // Get cards due for review today
      getDueCards: () => {
        const words = get().getWords();
        const progress = get().cardProgress;
        const selectedCategory = get().selectedCategory;

        return words.filter((word) => {
          // Filter by category if selected
          if (selectedCategory && word.category !== selectedCategory) {
            return false;
          }

          const cardProgress = progress[word.id];
          if (!cardProgress) return false; // Only show cards that have been started

          // Card is due if it's not mastered and review date has passed
          return cardProgress.level < 5 && isDue(cardProgress.nextReview);
        });
      },

      // Get new cards that haven't been started
      getNewCards: (limit = 10) => {
        const words = get().getWords();
        const progress = get().cardProgress;
        const selectedCategory = get().selectedCategory;

        const newCards = words.filter((word) => {
          if (selectedCategory && word.category !== selectedCategory) {
            return false;
          }
          return !progress[word.id];
        });

        return newCards.slice(0, limit);
      },

      // Count mastered cards (level 5)
      getMasteredCount: () => {
        const progress = get().cardProgress;
        return Object.values(progress).filter((p) => p.level === 5).length;
      },

      // Count learning cards (level 1-4)
      getLearningCount: () => {
        const progress = get().cardProgress;
        return Object.values(progress).filter((p) => p.level > 0 && p.level < 5).length;
      },

      // Count cards due for review
      getReviewCount: () => {
        return get().getDueCards().length;
      },

      // Get stats for a specific category
      getCategoryStats: (categoryId) => {
        const words = get().getWords().filter((w) => w.category === categoryId);
        const progress = get().cardProgress;

        let mastered = 0;
        let learning = 0;

        words.forEach((word) => {
          const cardProgress = progress[word.id];
          if (cardProgress) {
            if (cardProgress.level === 5) mastered++;
            else if (cardProgress.level > 0) learning++;
          }
        });

        return { total: words.length, mastered, learning };
      },

      // Initialize progress for a new card
      initializeCardProgress: (wordId) =>
        set((state) => {
          if (state.cardProgress[wordId]) return state;

          return {
            cardProgress: {
              ...state.cardProgress,
              [wordId]: {
                wordId,
                level: 0,
                nextReview: getTodayDate(),
                correctCount: 0,
                incorrectCount: 0,
                lastReviewed: null,
                easeFactor: 2.5,
              },
            },
          };
        }),

      // Review a card (correct or incorrect)
      reviewCard: (wordId, correct) =>
        set((state) => {
          const currentProgress = state.cardProgress[wordId] || {
            wordId,
            level: 0,
            nextReview: getTodayDate(),
            correctCount: 0,
            incorrectCount: 0,
            lastReviewed: null,
            easeFactor: 2.5,
          };

          let newLevel = currentProgress.level;
          let newEaseFactor = currentProgress.easeFactor;

          if (correct) {
            // Move up one level (max 5)
            newLevel = Math.min(5, currentProgress.level + 1) as CardLevel;
            // Increase ease factor slightly
            newEaseFactor = Math.min(3.0, currentProgress.easeFactor + 0.1);
          } else {
            // Move back to level 1 (not 0, to keep it in learning)
            newLevel = Math.max(1, currentProgress.level - 1) as CardLevel;
            // Decrease ease factor
            newEaseFactor = Math.max(1.3, currentProgress.easeFactor - 0.2);
          }

          // Calculate next review date based on level and ease factor
          const baseInterval = SRS_INTERVALS[newLevel] || 30;
          const adjustedInterval = Math.round(baseInterval * newEaseFactor);
          const nextReview = addDays(new Date(), adjustedInterval);

          return {
            cardProgress: {
              ...state.cardProgress,
              [wordId]: {
                ...currentProgress,
                level: newLevel,
                nextReview,
                correctCount: currentProgress.correctCount + (correct ? 1 : 0),
                incorrectCount: currentProgress.incorrectCount + (correct ? 0 : 1),
                lastReviewed: getTodayDate(),
                easeFactor: newEaseFactor,
              },
            },
            sessionCorrect: state.sessionCorrect + (correct ? 1 : 0),
            sessionTotal: state.sessionTotal + 1,
          };
        }),

      // Start a new study session with specific cards
      startSession: (cards) =>
        set(() => ({
          currentSessionCards: cards,
          currentCardIndex: 0,
          sessionCorrect: 0,
          sessionTotal: 0,
        })),

      // Get the next card in the session
      nextCard: () => {
        const state = get();
        const { currentSessionCards, currentCardIndex } = state;

        if (currentCardIndex >= currentSessionCards.length) {
          return null;
        }

        const wordId = currentSessionCards[currentCardIndex];
        const words = state.getWords();
        const word = words.find((w) => w.id === wordId);

        if (word) {
          set({ currentCardIndex: currentCardIndex + 1 });
        }

        return word || null;
      },

      // End the current session
      endSession: () => {
        const state = get();
        const result = {
          correct: state.sessionCorrect,
          total: state.sessionTotal,
        };

        set({
          currentSessionCards: [],
          currentCardIndex: 0,
        });

        return result;
      },

      // Set the selected category filter
      setSelectedCategory: (categoryId) =>
        set({ selectedCategory: categoryId }),

      // Reset all progress
      resetProgress: () => {
        AsyncStorage.removeItem('svaralab-vocab-storage').catch(console.error);
        set({
          cardProgress: {},
          currentSessionCards: [],
          currentCardIndex: 0,
          sessionCorrect: 0,
          sessionTotal: 0,
          selectedCategory: null,
        });
      },
    }),
    {
      name: 'svaralab-vocab-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cardProgress: state.cardProgress,
        selectedCategory: state.selectedCategory,
      }),
    }
  )
);

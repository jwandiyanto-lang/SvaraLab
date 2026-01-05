import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { useVocabStore, VocabWord, CardLevel } from '../../stores/vocabStore';
import FlashCard from '../../components/FlashCard';

type StudyMode = 'browse' | 'study' | 'results';

export default function VocabScreen() {
  const [mode, setMode] = useState<StudyMode>('browse');
  const [currentWord, setCurrentWord] = useState<VocabWord | null>(null);
  const [sessionResults, setSessionResults] = useState({ correct: 0, total: 0 });

  const {
    getWords,
    getCategories,
    getDueCards,
    getNewCards,
    getMasteredCount,
    getLearningCount,
    getReviewCount,
    getCategoryStats,
    getCardProgress,
    selectedCategory,
    setSelectedCategory,
    startSession,
    reviewCard,
    initializeCardProgress,
    cardProgress,
    sessionCorrect,
    sessionTotal,
  } = useVocabStore();

  const words = getWords();
  const categories = getCategories();
  const dueCards = getDueCards();
  const newCards = getNewCards(5);
  const masteredCount = getMasteredCount();
  const learningCount = getLearningCount();
  const reviewCount = getReviewCount();

  // Get cards for study session
  const getStudyCards = useCallback(() => {
    const cards: number[] = [];

    // First add due cards (review)
    dueCards.slice(0, 10).forEach((card) => cards.push(card.id));

    // Then add new cards if we have room
    if (cards.length < 15) {
      newCards.slice(0, 15 - cards.length).forEach((card) => {
        if (!cards.includes(card.id)) {
          cards.push(card.id);
        }
      });
    }

    return cards;
  }, [dueCards, newCards]);

  const startStudySession = () => {
    const cards = getStudyCards();
    if (cards.length === 0) {
      return;
    }

    // Initialize progress for new cards
    cards.forEach((cardId) => {
      initializeCardProgress(cardId);
    });

    startSession(cards);
    const firstWord = words.find((w) => w.id === cards[0]);
    setCurrentWord(firstWord || null);
    setMode('study');
  };

  const handleCorrect = () => {
    if (currentWord) {
      reviewCard(currentWord.id, true);
      moveToNextCard();
    }
  };

  const handleIncorrect = () => {
    if (currentWord) {
      reviewCard(currentWord.id, false);
      moveToNextCard();
    }
  };

  const moveToNextCard = () => {
    const store = useVocabStore.getState();
    const { currentSessionCards, currentCardIndex } = store;

    if (currentCardIndex >= currentSessionCards.length) {
      // Session complete
      setSessionResults({
        correct: store.sessionCorrect,
        total: store.sessionTotal,
      });
      setMode('results');
      setCurrentWord(null);
    } else {
      const nextWordId = currentSessionCards[currentCardIndex];
      const nextWord = words.find((w) => w.id === nextWordId);
      setCurrentWord(nextWord || null);
    }
  };

  const finishSession = () => {
    setMode('browse');
    setCurrentWord(null);
    setSessionResults({ correct: 0, total: 0 });
  };

  // Browse Mode UI
  const renderBrowseMode = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.successBg }]}>
            <MaterialIcons name="check-circle" size={20} color={colors.success} />
          </View>
          <Text style={styles.statNumber}>{masteredCount}</Text>
          <Text style={styles.statLabel}>Mastered</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.repeatBg }]}>
            <MaterialIcons name="school" size={20} color={colors.repeat} />
          </View>
          <Text style={styles.statNumber}>{learningCount}</Text>
          <Text style={styles.statLabel}>Learning</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: colors.respondBg }]}>
            <MaterialIcons name="replay" size={20} color={colors.respond} />
          </View>
          <Text style={styles.statNumber}>{reviewCount}</Text>
          <Text style={styles.statLabel}>Due Today</Text>
        </View>
      </View>

      {/* Start Study Button */}
      <TouchableOpacity
        style={[
          styles.startButton,
          (dueCards.length === 0 && newCards.length === 0) && styles.startButtonDisabled,
        ]}
        onPress={startStudySession}
        disabled={dueCards.length === 0 && newCards.length === 0}
        activeOpacity={0.8}
      >
        <View style={styles.startButtonContent}>
          <MaterialIcons name="play-arrow" size={24} color={colors.textLight} />
          <View style={styles.startButtonText}>
            <Text style={styles.startButtonTitle}>
              {reviewCount > 0 ? `Review ${reviewCount} cards` : 'Start Learning'}
            </Text>
            <Text style={styles.startButtonSubtitle}>
              {newCards.length > 0 ? `+ ${newCards.length} new cards` : 'All caught up!'}
            </Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={colors.textLight} />
      </TouchableOpacity>

      {/* Category Filter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === null && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <MaterialIcons
              name="apps"
              size={16}
              color={selectedCategory === null ? colors.textLight : colors.textSecondary}
            />
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === null && styles.categoryChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => {
            const stats = getCategoryStats(cat.id);
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                  {cat.name}
                </Text>
                <View style={[styles.categoryBadge, isActive && styles.categoryBadgeActive]}>
                  <Text style={[styles.categoryBadgeText, isActive && styles.categoryBadgeTextActive]}>
                    {stats.mastered}/{stats.total}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Word List Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Word Library</Text>
          <Text style={styles.sectionCount}>{words.length} words</Text>
        </View>

        {words.slice(0, 10).map((word) => {
          const progress = cardProgress[word.id];
          const level: CardLevel = progress?.level ?? 0;
          return (
            <View key={word.id} style={styles.wordItem}>
              <View style={styles.wordContent}>
                <Text style={styles.wordIndonesian}>{word.indonesian}</Text>
                <Text style={styles.wordEnglish}>{word.english}</Text>
              </View>
              <View style={styles.wordMeta}>
                <View
                  style={[
                    styles.levelIndicator,
                    { backgroundColor: getLevelColor(level) },
                  ]}
                />
                <Text style={styles.wordCategory}>
                  {word.category.replace('_', ' ')}
                </Text>
              </View>
            </View>
          );
        })}

        {words.length > 10 && (
          <Text style={styles.moreText}>+ {words.length - 10} more words</Text>
        )}
      </View>
    </ScrollView>
  );

  // Study Mode UI
  const renderStudyMode = () => {
    if (!currentWord) {
      return (
        <View style={styles.emptyState}>
          <MaterialIcons name="check-circle" size={64} color={colors.success} />
          <Text style={styles.emptyTitle}>All done!</Text>
          <Text style={styles.emptySubtitle}>No more cards to review</Text>
        </View>
      );
    }

    const progress = getCardProgress(currentWord.id);

    return (
      <View style={styles.studyContainer}>
        {/* Progress bar */}
        <View style={styles.progressHeader}>
          <TouchableOpacity onPress={finishSession} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(sessionTotal / Math.max(1, useVocabStore.getState().currentSessionCards.length)) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {sessionTotal}/{useVocabStore.getState().currentSessionCards.length}
          </Text>
        </View>

        {/* Flashcard */}
        <FlashCard
          word={currentWord}
          level={progress.level}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
        />
      </View>
    );
  };

  // Results Mode UI
  const renderResultsMode = () => {
    const accuracy = sessionResults.total > 0
      ? Math.round((sessionResults.correct / sessionResults.total) * 100)
      : 0;

    return (
      <View style={styles.resultsContainer}>
        <View style={styles.resultsCard}>
          <View style={styles.resultsIcon}>
            <MaterialIcons
              name={accuracy >= 70 ? 'emoji-events' : 'trending-up'}
              size={48}
              color={accuracy >= 70 ? colors.warning : colors.respond}
            />
          </View>

          <Text style={styles.resultsTitle}>Session Complete!</Text>

          <View style={styles.resultsStats}>
            <View style={styles.resultsStat}>
              <Text style={styles.resultsStatNumber}>{sessionResults.correct}</Text>
              <Text style={styles.resultsStatLabel}>Correct</Text>
            </View>
            <View style={styles.resultsDivider} />
            <View style={styles.resultsStat}>
              <Text style={styles.resultsStatNumber}>{accuracy}%</Text>
              <Text style={styles.resultsStatLabel}>Accuracy</Text>
            </View>
            <View style={styles.resultsDivider} />
            <View style={styles.resultsStat}>
              <Text style={styles.resultsStatNumber}>{sessionResults.total}</Text>
              <Text style={styles.resultsStatLabel}>Reviewed</Text>
            </View>
          </View>

          <Text style={styles.resultsMessage}>
            {accuracy >= 90
              ? 'Outstanding! You\'re mastering these words!'
              : accuracy >= 70
              ? 'Great job! Keep practicing to improve!'
              : 'Keep going! Practice makes perfect!'}
          </Text>

          <TouchableOpacity style={styles.doneButton} onPress={finishSession}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      {mode === 'browse' && (
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Vocabulary</Text>
            <Text style={styles.headerSubtitle}>Master words with flashcards</Text>
          </View>
        </View>
      )}

      {mode === 'browse' && renderBrowseMode()}
      {mode === 'study' && renderStudyMode()}
      {mode === 'results' && renderResultsMode()}
    </SafeAreaView>
  );
}

// Helper function to get level color
function getLevelColor(level: CardLevel): string {
  const colors_map: Record<CardLevel, string> = {
    0: colors.textTertiary,
    1: colors.situation,
    2: colors.repeat,
    3: colors.listen,
    4: colors.respond,
    5: colors.success,
  };
  return colors_map[level];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statNumber: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  startButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  startButtonDisabled: {
    backgroundColor: colors.textTertiary,
  },
  startButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  startButtonText: {
    flex: 1,
  },
  startButtonTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textLight,
  },
  startButtonSubtitle: {
    fontSize: typography.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionCount: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  categoryScroll: {
    marginHorizontal: -spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  categoryChipTextActive: {
    color: colors.textLight,
  },
  categoryBadge: {
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  categoryBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  categoryBadgeText: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  categoryBadgeTextActive: {
    color: colors.textLight,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  wordContent: {
    flex: 1,
  },
  wordIndonesian: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  wordEnglish: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  wordMeta: {
    alignItems: 'flex-end',
  },
  levelIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  wordCategory: {
    fontSize: 10,
    color: colors.textTertiary,
    textTransform: 'capitalize',
  },
  moreText: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: typography.xs,
    marginTop: spacing.sm,
  },
  studyContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  closeButton: {
    padding: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontWeight: typography.medium,
    minWidth: 40,
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  resultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  resultsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    ...shadows.notion,
  },
  resultsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  resultsTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  resultsStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  resultsStat: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  resultsStatNumber: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  resultsStatLabel: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  resultsDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  resultsMessage: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    ...shadows.sm,
  },
  doneButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textLight,
  },
});

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';
import { useGameStore, WordOfDay as WordOfDayType } from '../stores/gameStore';
import vocabularyData from '../../data/vocabulary.json';

// Word pool for daily words
const WORD_POOL = vocabularyData.vocabulary.slice(0, 50);

// Get a deterministic word based on date
const getWordForDate = (dateStr: string): Omit<WordOfDayType, 'date' | 'saved'> | null => {
  if (WORD_POOL.length === 0) return null;

  // Use date string to generate a consistent index
  const dateNum = dateStr.split('-').join('');
  const index = parseInt(dateNum, 10) % WORD_POOL.length;
  const word = WORD_POOL[index];

  return {
    indonesian: word.indonesian,
    english: word.english,
    pronunciation: undefined,
    example: undefined,
  };
};

interface WordOfDayProps {
  compact?: boolean;
}

export default function WordOfDay({ compact = false }: WordOfDayProps) {
  const { stats, setWordOfDay, saveWordOfDay, getWordOfDay } = useGameStore();
  const wordOfDay = getWordOfDay();

  useEffect(() => {
    // Set word of the day if not already set
    if (!wordOfDay) {
      const today = new Date().toISOString().split('T')[0];
      const newWord = getWordForDate(today);
      if (newWord) {
        setWordOfDay(newWord);
      }
    }
  }, [wordOfDay, setWordOfDay]);

  if (!wordOfDay) {
    return null;
  }

  const handleSave = () => {
    saveWordOfDay();
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <View style={styles.compactBadge}>
            <MaterialIcons name="auto-awesome" size={12} color={colors.warning} />
            <Text style={styles.compactBadgeText}>Word of the Day</Text>
          </View>
          {!wordOfDay.saved && (
            <TouchableOpacity onPress={handleSave} style={styles.compactSaveButton}>
              <MaterialIcons name="bookmark-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          {wordOfDay.saved && (
            <MaterialIcons name="bookmark" size={18} color={colors.warning} />
          )}
        </View>
        <Text style={styles.compactIndonesian}>{wordOfDay.indonesian}</Text>
        <Text style={styles.compactEnglish}>{wordOfDay.english}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <MaterialIcons name="auto-awesome" size={14} color={colors.warning} />
          <Text style={styles.badgeText}>Word of the Day</Text>
        </View>
        {!wordOfDay.saved ? (
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <MaterialIcons name="bookmark-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.savedBadge}>
            <MaterialIcons name="bookmark" size={16} color={colors.warning} />
            <Text style={styles.savedText}>Saved</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.indonesianText}>{wordOfDay.indonesian}</Text>
        <View style={styles.divider} />
        <Text style={styles.englishText}>{wordOfDay.english}</Text>
      </View>

      {/* Footer hint */}
      <View style={styles.footer}>
        <MaterialIcons name="lightbulb-outline" size={14} color={colors.textTertiary} />
        <Text style={styles.footerText}>Learn a new word every day</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.warningBg,
    padding: spacing.lg,
    ...shadows.notion,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.warning,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  saveText: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  savedText: {
    fontSize: typography.xs,
    color: colors.warning,
    fontWeight: typography.medium,
  },
  content: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  indonesianText: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  englishText: {
    fontSize: typography.base,
    color: colors.respond,
    fontWeight: typography.medium,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: typography.xs,
    color: colors.textTertiary,
  },
  // Compact styles
  compactContainer: {
    backgroundColor: colors.warningBg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  compactBadgeText: {
    fontSize: 10,
    fontWeight: typography.semibold,
    color: colors.warning,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compactSaveButton: {
    padding: spacing.xs,
  },
  compactIndonesian: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  compactEnglish: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

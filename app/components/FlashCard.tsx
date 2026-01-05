import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';
import { VocabWord, CardLevel } from '../stores/vocabStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface FlashCardProps {
  word: VocabWord;
  level: CardLevel;
  onCorrect: () => void;
  onIncorrect: () => void;
  showButtons?: boolean;
}

const LEVEL_COLORS: Record<CardLevel, string> = {
  0: colors.textTertiary,
  1: colors.situation,
  2: colors.repeat,
  3: colors.listen,
  4: colors.respond,
  5: colors.success,
};

const LEVEL_LABELS: Record<CardLevel, string> = {
  0: 'New',
  1: 'Learning',
  2: 'Learning',
  3: 'Familiar',
  4: 'Known',
  5: 'Mastered',
};

export default function FlashCard({
  word,
  level,
  onCorrect,
  onIncorrect,
  showButtons = true,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const position = useRef(new Animated.ValueXY()).current;
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Flip animation interpolations
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  // Swipe opacity indicators
  const correctOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const incorrectOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.3 });
        if (gesture.dx > 50) {
          setSwipeDirection('right');
        } else if (gesture.dx < -50) {
          setSwipeDirection('left');
        } else {
          setSwipeDirection(null);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          // Swipe right = correct
          Animated.timing(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gesture.dy },
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onCorrect();
            resetCard();
          });
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // Swipe left = incorrect
          Animated.timing(position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gesture.dy },
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onIncorrect();
            resetCard();
          });
        } else {
          // Spring back
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true,
          }).start();
          setSwipeDirection(null);
        }
      },
    })
  ).current;

  const resetCard = () => {
    position.setValue({ x: 0, y: 0 });
    setSwipeDirection(null);
    setIsFlipped(false);
    flipAnimation.setValue(0);
  };

  const flipCard = () => {
    if (isFlipped) {
      Animated.spring(flipAnimation, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(flipAnimation, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    }
    setIsFlipped(!isFlipped);
  };

  const cardRotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const animatedCardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate: cardRotation },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Swipe indicators */}
      <Animated.View style={[styles.indicator, styles.correctIndicator, { opacity: correctOpacity }]}>
        <MaterialIcons name="check-circle" size={48} color={colors.success} />
        <Text style={[styles.indicatorText, { color: colors.success }]}>Got it!</Text>
      </Animated.View>

      <Animated.View style={[styles.indicator, styles.incorrectIndicator, { opacity: incorrectOpacity }]}>
        <MaterialIcons name="cancel" size={48} color={colors.error} />
        <Text style={[styles.indicatorText, { color: colors.error }]}>Review</Text>
      </Animated.View>

      {/* Card */}
      <Animated.View style={[styles.cardContainer, animatedCardStyle]} {...panResponder.panHandlers}>
        <TouchableOpacity activeOpacity={0.9} onPress={flipCard} style={styles.touchable}>
          {/* Front of card */}
          <Animated.View style={[styles.card, frontAnimatedStyle, swipeDirection === 'right' && styles.cardCorrect, swipeDirection === 'left' && styles.cardIncorrect]}>
            <View style={styles.levelBadge}>
              <View style={[styles.levelDot, { backgroundColor: LEVEL_COLORS[level] }]} />
              <Text style={[styles.levelText, { color: LEVEL_COLORS[level] }]}>
                {LEVEL_LABELS[level]}
              </Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.categoryLabel}>{word.category.replace('_', ' ')}</Text>
              <Text style={styles.mainText}>{word.indonesian}</Text>
              <Text style={styles.hint}>Tap to reveal translation</Text>
            </View>

            <View style={styles.swipeHint}>
              <MaterialIcons name="swipe" size={20} color={colors.textTertiary} />
              <Text style={styles.swipeHintText}>Swipe right if correct, left to review</Text>
            </View>
          </Animated.View>

          {/* Back of card */}
          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle, swipeDirection === 'right' && styles.cardCorrect, swipeDirection === 'left' && styles.cardIncorrect]}>
            <View style={styles.levelBadge}>
              <View style={[styles.levelDot, { backgroundColor: LEVEL_COLORS[level] }]} />
              <Text style={[styles.levelText, { color: LEVEL_COLORS[level] }]}>
                {LEVEL_LABELS[level]}
              </Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.categoryLabel}>{word.category.replace('_', ' ')}</Text>
              <Text style={styles.translationText}>{word.english}</Text>
              <View style={styles.divider} />
              <Text style={styles.originalText}>{word.indonesian}</Text>
            </View>

            <View style={styles.swipeHint}>
              <MaterialIcons name="swipe" size={20} color={colors.textTertiary} />
              <Text style={styles.swipeHintText}>Swipe right if correct, left to review</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Button controls */}
      {showButtons && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.incorrectButton]}
            onPress={() => {
              Animated.timing(position, {
                toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
                duration: 200,
                useNativeDriver: true,
              }).start(() => {
                onIncorrect();
                resetCard();
              });
            }}
          >
            <MaterialIcons name="close" size={28} color={colors.error} />
            <Text style={[styles.buttonText, { color: colors.error }]}>Review</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.flipButton} onPress={flipCard}>
            <MaterialIcons name="flip" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.correctButton]}
            onPress={() => {
              Animated.timing(position, {
                toValue: { x: SCREEN_WIDTH + 100, y: 0 },
                duration: 200,
                useNativeDriver: true,
              }).start(() => {
                onCorrect();
                resetCard();
              });
            }}
          >
            <MaterialIcons name="check" size={28} color={colors.success} />
            <Text style={[styles.buttonText, { color: colors.success }]}>Got it</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 40,
    alignItems: 'center',
    zIndex: 10,
  },
  correctIndicator: {
    right: 40,
  },
  incorrectIndicator: {
    left: 40,
  },
  indicatorText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    marginTop: spacing.xs,
  },
  cardContainer: {
    width: SCREEN_WIDTH - 48,
    height: 320,
  },
  touchable: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    backfaceVisibility: 'hidden',
    ...shadows.notion,
  },
  cardBack: {
    backgroundColor: colors.cardAlt,
  },
  cardCorrect: {
    borderColor: colors.success,
    borderWidth: 2,
  },
  cardIncorrect: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  levelText: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: typography.xs,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  mainText: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
  },
  hint: {
    fontSize: typography.xs,
    color: colors.textTertiary,
    marginTop: spacing.lg,
  },
  translationText: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 36,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  originalText: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  swipeHintText: {
    fontSize: typography.xs,
    color: colors.textTertiary,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  incorrectButton: {
    borderColor: colors.errorBg,
  },
  correctButton: {
    borderColor: colors.successBg,
  },
  buttonText: {
    fontSize: typography.xs,
    fontWeight: typography.medium,
    marginTop: 2,
  },
  flipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});

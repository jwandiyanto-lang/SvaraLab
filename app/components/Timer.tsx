import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, borderRadius, typography } from '../constants/theme';

interface TimerProps {
  seconds: number;
  isRunning: boolean;
  onComplete: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function Timer({ seconds, isRunning, onComplete, size = 'medium' }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [progress] = useState(new Animated.Value(1));

  const sizes = {
    small: { container: 60, text: 20, ring: 4 },
    medium: { container: 100, text: 32, ring: 6 },
    large: { container: 140, text: 48, ring: 8 },
  };

  const currentSize = sizes[size];

  useEffect(() => {
    setTimeLeft(seconds);
    progress.setValue(1);
  }, [seconds]);

  useEffect(() => {
    if (!isRunning) return;

    // Start countdown animation
    Animated.timing(progress, {
      toValue: 0,
      duration: seconds * 1000,
      useNativeDriver: false,
    }).start();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      progress.stopAnimation();
    };
  }, [isRunning, seconds]);

  // Handle completion separately to avoid setState during render
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      onComplete();
    }
  }, [timeLeft, isRunning, onComplete]);

  const getColor = useCallback(() => {
    if (timeLeft > seconds * 0.5) return colors.success; // Green
    if (timeLeft > seconds * 0.25) return colors.warning; // Yellow/Orange
    return colors.error; // Red
  }, [timeLeft, seconds]);

  const progressColor = progress.interpolate({
    inputRange: [0, 0.25, 0.5, 1],
    outputRange: [colors.error, colors.warning, colors.warning, colors.success],
  });

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [Math.PI * 2 * (currentSize.container / 2 - currentSize.ring), 0],
  });

  return (
    <View style={[styles.container, { width: currentSize.container, height: currentSize.container }]}>
      {/* Background Ring */}
      <View
        style={[
          styles.ring,
          {
            width: currentSize.container,
            height: currentSize.container,
            borderRadius: currentSize.container / 2,
            borderWidth: currentSize.ring,
            borderColor: colors.cardAlt,
          },
        ]}
      />

      {/* Progress Ring */}
      <Animated.View
        style={[
          styles.progressRing,
          {
            width: currentSize.container,
            height: currentSize.container,
            borderRadius: currentSize.container / 2,
            borderWidth: currentSize.ring,
            borderColor: progressColor,
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            transform: [
              { rotate: `${-90 + (1 - (timeLeft / seconds)) * 360}deg` },
            ],
          },
        ]}
      />

      {/* Center Content */}
      <View style={styles.centerContent}>
        <Text
          style={[
            styles.timeText,
            { fontSize: currentSize.text, color: getColor() },
          ]}
        >
          {timeLeft}
        </Text>
        {size !== 'small' && (
          <Text style={styles.secondsLabel}>sec</Text>
        )}
      </View>

      {/* Pulse Animation when low */}
      {timeLeft <= 2 && isRunning && (
        <Animated.View
          style={[
            styles.pulse,
            {
              width: currentSize.container + 20,
              height: currentSize.container + 20,
              borderRadius: (currentSize.container + 20) / 2,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
  },
  progressRing: {
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontWeight: typography.bold,
  },
  secondsLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    marginTop: -4,
  },
  pulse: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.error,
    opacity: 0.3,
  },
});

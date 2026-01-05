import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../stores/gameStore';
import { colors, borderRadius, typography, shadows } from '../constants/theme';

export type RecordingState = 'idle' | 'listening' | 'processing' | 'success' | 'error';

interface SpeechButtonProps {
  onPress: () => void;
  state: RecordingState;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function SpeechButton({
  onPress,
  state,
  disabled = false,
  size = 'large',
}: SpeechButtonProps) {
  const [pulseAnim] = useState(new Animated.Value(1));
  const { settings } = useGameStore();

  const sizes = {
    small: { button: 60, icon: 24, ring: 70 },
    medium: { button: 80, icon: 32, ring: 95 },
    large: { button: 100, icon: 40, ring: 120 },
  };

  const currentSize = sizes[size];

  useEffect(() => {
    if (state === 'listening') {
      // Pulse animation while listening
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }

    return () => {
      pulseAnim.stopAnimation();
    };
  }, [state]);

  const handlePress = async () => {
    if (disabled) return;

    if (settings.hapticEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    onPress();
  };

  const getStateConfig = () => {
    switch (state) {
      case 'idle':
        return {
          backgroundColor: colors.primary,
          icon: '🎤',
          label: 'Tap to speak',
          ringColor: colors.primary,
        };
      case 'listening':
        return {
          backgroundColor: colors.error,
          icon: '🔴',
          label: 'Listening...',
          ringColor: colors.error,
        };
      case 'processing':
        return {
          backgroundColor: colors.warning,
          icon: '⏳',
          label: 'Processing...',
          ringColor: colors.warning,
        };
      case 'success':
        return {
          backgroundColor: colors.success,
          icon: '✓',
          label: 'Correct!',
          ringColor: colors.success,
        };
      case 'error':
        return {
          backgroundColor: colors.error,
          icon: '✗',
          label: 'Try again',
          ringColor: colors.error,
        };
      default:
        return {
          backgroundColor: colors.primary,
          icon: '🎤',
          label: 'Tap to speak',
          ringColor: colors.primary,
        };
    }
  };

  const config = getStateConfig();

  return (
    <View style={styles.container}>
      {/* Pulse Ring */}
      {state === 'listening' && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: currentSize.ring,
              height: currentSize.ring,
              borderRadius: currentSize.ring / 2,
              borderColor: config.ringColor,
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.2],
                outputRange: [0.6, 0],
              }),
            },
          ]}
        />
      )}

      {/* Main Button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: currentSize.button,
            height: currentSize.button,
            borderRadius: currentSize.button / 2,
            backgroundColor: disabled ? colors.cardAlt : config.backgroundColor,
          },
        ]}
        onPress={handlePress}
        disabled={disabled || state === 'processing'}
        activeOpacity={0.8}
      >
        <Text style={[styles.icon, { fontSize: currentSize.icon }]}>
          {config.icon}
        </Text>
      </TouchableOpacity>

      {/* Label */}
      <Text style={[styles.label, { color: disabled ? colors.textMuted : colors.textPrimary }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 3,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  icon: {
    textAlign: 'center',
  },
  label: {
    marginTop: 12,
    fontSize: typography.sm,
    fontWeight: typography.semibold,
  },
});

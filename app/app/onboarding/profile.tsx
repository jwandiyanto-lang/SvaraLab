import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useGameStore, Accent } from '../../stores/gameStore';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';

const DESTINATIONS: { id: Accent; flag: string; name: string }[] = [
  { id: 'us', flag: '🇺🇸', name: 'USA' },
  { id: 'uk', flag: '🇬🇧', name: 'UK' },
  { id: 'au', flag: '🇦🇺', name: 'AUS' },
  { id: 'sg', flag: '🇸🇬', name: 'SG' },
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { profile, updateProfile, completeProfile } = useGameStore();
  const [name, setName] = useState(profile.name || '');
  const [destination, setDestination] = useState<Accent>(profile.dreamDestination || 'us');

  const handleContinue = () => {
    updateProfile({
      name: name.trim() || 'Learner',
      dreamDestination: destination,
    });
    completeProfile();
    router.push('/onboarding/placement-test');
  };

  const handleSkip = () => {
    router.push('/onboarding/placement-test');
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Profile</Text>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Name Input */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Display Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <MaterialIcons name="edit" size={18} color={colors.textSecondary} />
            </View>
          </View>

          {/* Dream Destination */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Dream Destination</Text>
            <View style={styles.destinationGrid}>
              {DESTINATIONS.map((dest) => (
                <TouchableOpacity
                  key={dest.id}
                  style={[
                    styles.destinationCard,
                    destination === dest.id && styles.destinationCardActive,
                  ]}
                  onPress={() => setDestination(dest.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.destinationFlag}>{dest.flag}</Text>
                  <Text style={[
                    styles.destinationName,
                    destination === dest.id && styles.destinationNameActive,
                  ]}>
                    {dest.name}
                  </Text>
                  {destination === dest.id && (
                    <View style={styles.checkBadge}>
                      <MaterialIcons name="check" size={10} color={colors.textLight} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Avatar Preview */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCard}>
              <View style={styles.avatarPreview}>
                <View style={styles.avatarCircle}>
                  <MaterialIcons name="person" size={48} color={colors.textSecondary} />
                </View>
                <View style={styles.aiBadge}>
                  <MaterialIcons name="auto-awesome" size={12} color={colors.respond} />
                  <Text style={styles.aiBadgeText}>AI Avatar</Text>
                </View>
              </View>
            </View>

            <View style={styles.uploadSection}>
              <Text style={styles.uploadTitle}>Create from Photo</Text>
              <Text style={styles.uploadSubtitle}>
                Upload a clear picture of yourself. Our AI engine will automatically generate your unique avatar.
              </Text>

              <TouchableOpacity style={styles.uploadButton} activeOpacity={0.7}>
                <View style={styles.uploadIconCircle}>
                  <MaterialIcons name="add-a-photo" size={24} color={colors.textPrimary} />
                </View>
                <Text style={styles.uploadButtonText}>Tap to upload photo</Text>
                <Text style={styles.uploadFormats}>Supports JPG, PNG, WEBP</Text>
              </TouchableOpacity>

              <View style={styles.tipRow}>
                <MaterialIcons name="lightbulb" size={16} color={colors.textSecondary} />
                <Text style={styles.tipText}>
                  Tip: Use a photo with good lighting and a neutral background for the best avatar result.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueText}>Save & Continue</Text>
            <MaterialIcons name="arrow-forward" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  skipButton: {
    padding: spacing.xs,
  },
  skipText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionLabel: {
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  destinationGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  destinationCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  destinationCardActive: {
    backgroundColor: colors.background,
    borderColor: colors.respond,
    ...shadows.sm,
  },
  destinationFlag: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  destinationName: {
    fontSize: 10,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  destinationNameActive: {
    color: colors.textPrimary,
  },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.respond,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  avatarSection: {
    marginBottom: spacing.xxl,
  },
  avatarCard: {
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xxl,
    ...shadows.notion,
  },
  avatarPreview: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  uploadSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    ...shadows.notion,
  },
  uploadTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  uploadSubtitle: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.cardAlt,
    marginBottom: spacing.lg,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  uploadButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  uploadFormats: {
    fontSize: typography.xs,
    color: colors.textSecondary,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.cardAlt,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipText: {
    flex: 1,
    fontSize: typography.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  continueText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textLight,
  },
});

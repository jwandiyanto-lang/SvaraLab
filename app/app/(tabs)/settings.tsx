import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';

export default function SettingsScreen() {
  const { settings, updateSettings, resetStats } = useGameStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const accents = [
    { id: 'us', name: 'US English', flag: '🇺🇸' },
    { id: 'uk', name: 'UK English', flag: '🇬🇧' },
    { id: 'au', name: 'Australian', flag: '🇦🇺' },
  ];

  const speeds = [
    { id: 0.75, name: 'Slow', label: '0.75x' },
    { id: 1.0, name: 'Normal', label: '1x' },
    { id: 1.25, name: 'Fast', label: '1.25x' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Accent Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗣️ Voice Accent</Text>
          <Text style={styles.sectionSubtitle}>Choose the accent for pronunciation examples</Text>
          <View style={styles.optionGroup}>
            {accents.map((accent) => (
              <TouchableOpacity
                key={accent.id}
                style={[
                  styles.optionCard,
                  settings.accent === accent.id && styles.optionCardActive,
                ]}
                onPress={() => updateSettings({ accent: accent.id as 'us' | 'uk' | 'au' })}
              >
                <Text style={styles.optionFlag}>{accent.flag}</Text>
                <Text style={[
                  styles.optionLabel,
                  settings.accent === accent.id && styles.optionLabelActive,
                ]}>
                  {accent.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Speed Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱️ Playback Speed</Text>
          <Text style={styles.sectionSubtitle}>Adjust how fast the audio plays</Text>
          <View style={styles.optionGroup}>
            {speeds.map((speed) => (
              <TouchableOpacity
                key={speed.id}
                style={[
                  styles.optionCard,
                  settings.playbackSpeed === speed.id && styles.optionCardActive,
                ]}
                onPress={() => updateSettings({ playbackSpeed: speed.id })}
              >
                <Text style={styles.speedLabel}>{speed.label}</Text>
                <Text style={[
                  styles.optionLabel,
                  settings.playbackSpeed === speed.id && styles.optionLabelActive,
                ]}>
                  {speed.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sound Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔊 Sound & Feedback</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Sound Effects</Text>
              <Text style={styles.toggleSubtext}>Play sounds for correct/incorrect answers</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => updateSettings({ soundEnabled: value })}
              trackColor={{ false: '#374151', true: '#6366f1' }}
              thumbColor={settings.soundEnabled ? '#fff' : '#9ca3af'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Haptic Feedback</Text>
              <Text style={styles.toggleSubtext}>Vibration on button presses</Text>
            </View>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={(value) => updateSettings({ hapticEnabled: value })}
              trackColor={{ false: '#374151', true: '#6366f1' }}
              thumbColor={settings.hapticEnabled ? '#fff' : '#9ca3af'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Auto-play Pronunciation</Text>
              <Text style={styles.toggleSubtext}>Automatically play audio for each word</Text>
            </View>
            <Switch
              value={settings.autoPlayAudio}
              onValueChange={(value) => updateSettings({ autoPlayAudio: value })}
              trackColor={{ false: '#374151', true: '#6366f1' }}
              thumbColor={settings.autoPlayAudio ? '#fff' : '#9ca3af'}
            />
          </View>
        </View>

        {/* Reset Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗑️ Data</Text>

          {!showResetConfirm ? (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => setShowResetConfirm(true)}
            >
              <Text style={styles.resetButtonText}>Reset Progress</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.confirmContainer}>
              <Text style={styles.confirmText}>Are you sure? This cannot be undone.</Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowResetConfirm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmResetButton}
                  onPress={() => {
                    resetStats();
                    setShowResetConfirm(false);
                  }}
                >
                  <Text style={styles.confirmResetText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>SvaraLab</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appTagline}>Practice speaking English with confidence</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 16,
  },
  optionGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  optionCardActive: {
    borderColor: '#6366f1',
    backgroundColor: '#312e81',
  },
  optionFlag: {
    fontSize: 28,
    marginBottom: 8,
  },
  speedLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  optionLabelActive: {
    color: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  toggleSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  resetButton: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  resetButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  confirmText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmResetButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  confirmResetText: {
    color: '#fff',
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});

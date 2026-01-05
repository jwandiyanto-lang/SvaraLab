import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../../stores/gameStore';

export default function SpeedScreen() {
  const router = useRouter();
  const { stats } = useGameStore();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>⚡</Text>
          <Text style={styles.headerTitle}>Speed Challenge</Text>
          <Text style={styles.headerSubtitle}>
            Race against the clock and test your speaking skills!
          </Text>
        </View>

        {/* High Score Card */}
        <View style={styles.highScoreCard}>
          <Text style={styles.highScoreLabel}>Your High Score</Text>
          <Text style={styles.highScoreValue}>{stats.highScore}</Text>
          <Text style={styles.highScoreSubtext}>points</Text>
        </View>

        {/* Game Rules */}
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>Game Rules</Text>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleEmoji}>❤️</Text>
            <View style={styles.ruleContent}>
              <Text style={styles.ruleLabel}>3 Lives</Text>
              <Text style={styles.ruleText}>Miss a word and lose a life</Text>
            </View>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleEmoji}>⏱️</Text>
            <View style={styles.ruleContent}>
              <Text style={styles.ruleLabel}>3 Second Timer</Text>
              <Text style={styles.ruleText}>Speak before time runs out</Text>
            </View>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleEmoji}>🔥</Text>
            <View style={styles.ruleContent}>
              <Text style={styles.ruleLabel}>Streak Bonus</Text>
              <Text style={styles.ruleText}>Chain correct answers for multipliers</Text>
            </View>
          </View>

          <View style={styles.ruleItem}>
            <Text style={styles.ruleEmoji}>⚡</Text>
            <View style={styles.ruleContent}>
              <Text style={styles.ruleLabel}>Speed Bonus</Text>
              <Text style={styles.ruleText}>Faster answers = more points</Text>
            </View>
          </View>
        </View>

        {/* Difficulty Selection */}
        <Text style={styles.sectionTitle}>Select Difficulty</Text>

        <View style={styles.difficultyContainer}>
          <TouchableOpacity
            style={[styles.difficultyCard, styles.difficultyEasy]}
            onPress={() => router.push('/speed-game?difficulty=easy')}
          >
            <Text style={styles.difficultyEmoji}>🌱</Text>
            <Text style={styles.difficultyLabel}>Easy</Text>
            <Text style={styles.difficultyTimer}>5 seconds</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.difficultyCard, styles.difficultyMedium]}
            onPress={() => router.push('/speed-game?difficulty=medium')}
          >
            <Text style={styles.difficultyEmoji}>🔥</Text>
            <Text style={styles.difficultyLabel}>Medium</Text>
            <Text style={styles.difficultyTimer}>3 seconds</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.difficultyCard, styles.difficultyHard]}
            onPress={() => router.push('/speed-game?difficulty=hard')}
          >
            <Text style={styles.difficultyEmoji}>💀</Text>
            <Text style={styles.difficultyLabel}>Hard</Text>
            <Text style={styles.difficultyTimer}>2 seconds</Text>
          </TouchableOpacity>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/speed-game')}
        >
          <Text style={styles.startButtonText}>🚀 Start Challenge</Text>
        </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  highScoreCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  highScoreLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  highScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  highScoreSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  rulesCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ruleEmoji: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
  },
  ruleContent: {
    flex: 1,
  },
  ruleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  ruleText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  difficultyCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  difficultyEasy: {
    backgroundColor: '#14532d',
    borderColor: '#22c55e',
  },
  difficultyMedium: {
    backgroundColor: '#78350f',
    borderColor: '#f59e0b',
  },
  difficultyHard: {
    backgroundColor: '#7f1d1d',
    borderColor: '#ef4444',
  },
  difficultyEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  difficultyTimer: {
    fontSize: 11,
    color: '#9ca3af',
  },
  startButton: {
    backgroundColor: '#f59e0b',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

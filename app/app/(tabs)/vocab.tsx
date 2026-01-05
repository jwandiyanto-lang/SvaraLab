import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import vocabularyData from '../../data/vocabulary.json';

type VocabItem = {
  id: number;
  indonesian: string;
  english: string;
  difficulty: string;
  timerSeconds: number;
  category: string;
};

const categories = [
  { id: 'all', name: 'All', icon: '📖' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'daily_life', name: 'Daily Life', icon: '🏠' },
  { id: 'slang', name: 'Slang', icon: '💬' },
];

export default function VocabScreen() {
  const router = useRouter();
  const vocabulary = vocabularyData.vocabulary as VocabItem[];

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return styles.difficulty_easy;
      case 'medium': return styles.difficulty_medium;
      case 'hard': return styles.difficulty_hard;
      default: return styles.difficulty_easy;
    }
  };

  const renderVocabItem = ({ item }: { item: VocabItem }) => (
    <View style={styles.vocabCard}>
      <View style={styles.vocabHeader}>
        <View style={[styles.difficultyBadge, getDifficultyStyle(item.difficulty)]}>
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
        <Text style={styles.timerText}>{item.timerSeconds}s</Text>
      </View>
      <Text style={styles.indonesianText}>{item.indonesian}</Text>
      <Text style={styles.englishText}>{item.english}</Text>
      <View style={styles.categoryTag}>
        <Text style={styles.categoryText}>
          {categories.find(c => c.id === item.category)?.icon} {item.category.replace('_', ' ')}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header Stats */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Word Library</Text>
        <Text style={styles.headerSubtitle}>{vocabulary.length} words available</Text>
      </View>

      {/* Category Filters */}
      <View style={styles.categoryContainer}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat.id} style={styles.categoryButton}>
            <Text style={styles.categoryButtonText}>{cat.icon} {cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Start Practice Button */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => router.push('/vocab-game')}
      >
        <Text style={styles.startButtonText}>🎤 Start Practice</Text>
      </TouchableOpacity>

      {/* Vocabulary List */}
      <FlatList
        data={vocabulary}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVocabItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  categoryButtonText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#22c55e',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  vocabCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  vocabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficulty_easy: {
    backgroundColor: '#166534',
  },
  difficulty_medium: {
    backgroundColor: '#b45309',
  },
  difficulty_hard: {
    backgroundColor: '#b91c1c',
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timerText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  indonesianText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  englishText: {
    fontSize: 16,
    color: '#6366f1',
    marginBottom: 12,
  },
  categoryTag: {
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#9ca3af',
    fontSize: 12,
  },
});

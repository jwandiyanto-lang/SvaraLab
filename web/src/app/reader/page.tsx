'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Volume2,
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Loader2,
  Globe,
  List,
  AlignJustify,
  BookMarked,
  Star,
} from 'lucide-react';
import { speak, VOICES } from '@/services/elevenlabs';

// Word familiarity levels (like LingQ)
type WordStatus = 'new' | 'recognized' | 'familiar' | 'learned' | 'known';

interface Word {
  text: string;
  translation?: string;
  status: WordStatus;
  index: number;
  sentenceIndex: number;
}

interface Sentence {
  text: string;
  words: Word[];
  translation?: string;
  index: number;
}

interface Story {
  title: string;
  content: string;
  sentences: Sentence[];
  country: string;
  flag: string;
}

// Cultural stories/tales from different countries
const CULTURAL_STORIES: Record<string, { title: string; content: string; country: string; flag: string }> = {
  indonesia: {
    title: 'The Legend of Malin Kundang',
    country: 'Indonesia',
    flag: '🇮🇩',
    content: `Long ago in West Sumatra, there lived a poor widow named Mande Rubayah and her son Malin Kundang. They lived in a small hut by the sea. Every day, Malin helped his mother by fishing and selling fish at the market.

One day, a big ship came to their village. The captain needed young men to work on the ship. Malin decided to sail away to find fortune. His mother was sad but she gave him her blessing.

Years passed and Malin became very rich. He married a beautiful woman from a wealthy family. One day, his ship stopped at his old village. His mother recognized him and ran to hug him.

But Malin was ashamed of his poor mother. He pushed her away and said he did not know her. His mother was heartbroken. With tears in her eyes, she cursed him to become a stone.

Suddenly, a great storm came. The waves crashed against the ship. When the storm ended, Malin Kundang had turned into stone. To this day, you can see the stone on the beach of Air Manis in Padang. People say it looks like a man kneeling in regret.`,
  },
  japan: {
    title: 'The Bamboo Cutter and the Moon Princess',
    country: 'Japan',
    flag: '🇯🇵',
    content: `Once upon a time, an old bamboo cutter found a shining bamboo stalk. Inside was a tiny baby girl no bigger than his thumb. He brought her home to his wife and they raised her as their daughter. They named her Kaguya-hime.

Kaguya-hime grew into the most beautiful woman in Japan. Many princes came to ask for her hand in marriage. But she gave each of them an impossible task. None could complete these tasks.

Even the Emperor heard of her beauty and wanted to meet her. Kaguya-hime spoke with him but refused to marry him too. She seemed sad and often looked at the moon.

One night, she told her parents the truth. She was not from Earth. She came from the Moon. Soon, people from the Moon would come to take her back home.

On the night of the full moon, a procession of heavenly beings descended. They gave Kaguya-hime a robe of feathers. When she put it on, she forgot all her earthly memories. She flew up to the moon, leaving her parents and the Emperor in tears.

The Emperor was given a letter and a small bottle of the elixir of life. But without Kaguya-hime, he did not want to live forever. He ordered his men to burn them on the highest mountain. They say that is why Mount Fuji still smokes to this day.`,
  },
  greece: {
    title: 'The Story of Echo and Narcissus',
    country: 'Greece',
    flag: '🇬🇷',
    content: `In ancient Greece, there was a beautiful nymph named Echo. She loved to talk and tell stories. But the goddess Hera punished her so that she could only repeat what others said.

One day, Echo saw a handsome young man named Narcissus. He was the most beautiful man in all of Greece. Echo fell deeply in love with him.

She followed Narcissus through the forest. When he called out, she could only repeat his words. Narcissus heard the voice and became curious. When Echo finally showed herself, she tried to embrace him.

But Narcissus pushed her away. He was too proud to love anyone. Poor Echo was heartbroken. She went to hide in caves and mountains. Slowly, her body faded away until only her voice remained.

The goddess Nemesis saw what Narcissus had done. She decided to punish him. She led him to a clear pool of water. When Narcissus looked down, he saw his own reflection.

He fell in love with his reflection. He could not stop looking at his beautiful face in the water. He stayed by the pool day and night, unable to leave. Finally, he died there by the water.

Where he had sat, a beautiful flower grew. People called it the narcissus flower. And if you go to the mountains today and call out, Echo will still answer you.`,
  },
  india: {
    title: 'The Monkey and the Crocodile',
    country: 'India',
    flag: '🇮🇳',
    content: `By the banks of a river, there lived a monkey in a big jamun tree. The tree had the sweetest fruits in the forest. Every day, the monkey would eat the delicious jamuns.

One day, a crocodile came to rest under the tree. The kind monkey threw some fruits down to him. The crocodile loved the jamuns. He came back every day and they became good friends.

The crocodile took some fruits home to his wife. She tasted them and said they were wonderful. But she was a cunning crocodile. She thought that if the fruits were so sweet, the monkey who ate them must have the sweetest heart.

She told her husband that she was sick. She said she would only get better if she ate the heart of the monkey. The crocodile was sad but he loved his wife. He made a plan.

He invited his friend the monkey to his home for dinner. The monkey could not swim so he sat on the crocodile's back. When they reached the middle of the river, the crocodile told the monkey about his wife's wish.

The clever monkey thought quickly. He said that he had left his heart in the jamun tree. He asked the crocodile to take him back so he could get it. The foolish crocodile believed him and swam back to the shore.

As soon as they reached the tree, the monkey jumped up into the branches. He told the crocodile that he would never trust him again. The crocodile lost both his friend and the sweet fruits forever.`,
  },
  korea: {
    title: 'The Sun and the Moon',
    country: 'Korea',
    flag: '🇰🇷',
    content: `Long ago, a poor mother lived with her two children, a boy and a girl. One day, she went to the village to sell rice cakes. On her way home, a tiger appeared on the mountain path.

The tiger said he would eat her unless she gave him a rice cake. She gave him one and walked on. But the tiger kept following her. Each time, she gave him another cake until they were all gone.

When she had no more cakes, the tiger ate the poor mother. Then he put on her clothes and went to her house. The children heard a knock on the door. A voice said it was their mother.

The girl looked through the crack in the door. She saw furry paws and knew it was the tiger. The children ran out the back door and climbed up a tall tree. The tiger chased them.

The girl prayed to the heavens for help. Suddenly, a rope came down from the sky. The children grabbed the rope and climbed up to the heavens. The tiger saw this and prayed for a rope too.

A rope came down, but it was old and rotten. When the tiger was halfway up, the rope broke. He fell down and died in a field of red thorns.

The boy became the sun and the girl became the moon. At first, the girl was the sun. But she was shy about people looking at her in the bright daylight. So her brother became the sun and she became the moon. That is why the sun is so bright and the moon glows softly in the night sky.`,
  },
  mexico: {
    title: 'The Legend of the Hummingbird',
    country: 'Mexico',
    flag: '🇲🇽',
    content: `The ancient Mayan people tell this story about the hummingbird. When the gods created all the animals, they gave each one a special job. But when they finished, they had some leftover pieces.

These pieces were very small and light. The gods did not want to waste them. So they put them together and created a tiny bird. It was so small that it could sit on a person's finger.

The other birds laughed at this tiny creature. It had no beautiful colors like the parrot. It had no sweet song like the nightingale. But the gods gave the hummingbird a special gift.

They made its feathers shine like jewels in the sunlight. Green, blue, red, and gold sparkled when it flew. The gods also made it the fastest flier of all birds.

But the most special gift was this. The hummingbird was the only bird that could fly backwards. It could also hover in one spot like magic. The other birds stopped laughing and watched in wonder.

The gods gave the hummingbird one more job. It became the messenger of thoughts and wishes. The Mayan people believed that when you saw a hummingbird, someone far away was thinking of you.

They also said that hummingbirds carry the hopes and dreams of people to the sun. So when you see a hummingbird, make a wish. It might just carry your wish up to the heavens.`,
  },
};

// Indonesian translations for common words
const TRANSLATIONS: Record<string, string> = {
  'the': 'itu', 'a': 'sebuah', 'an': 'sebuah', 'and': 'dan', 'but': 'tetapi',
  'or': 'atau', 'in': 'di', 'on': 'di atas', 'at': 'pada', 'to': 'ke',
  'for': 'untuk', 'of': 'dari', 'with': 'dengan', 'by': 'oleh',
  'from': 'dari', 'up': 'atas', 'about': 'tentang', 'into': 'ke dalam',
  'through': 'melalui', 'during': 'selama', 'before': 'sebelum',
  'after': 'setelah', 'above': 'di atas', 'below': 'di bawah',
  'between': 'di antara', 'under': 'di bawah', 'again': 'lagi',
  'there': 'di sana', 'when': 'ketika', 'where': 'di mana', 'why': 'mengapa',
  'how': 'bagaimana', 'all': 'semua', 'each': 'setiap', 'every': 'setiap',
  'both': 'keduanya', 'few': 'beberapa', 'more': 'lebih', 'most': 'paling',
  'other': 'lain', 'some': 'beberapa', 'such': 'seperti', 'no': 'tidak',
  'not': 'tidak', 'only': 'hanya', 'own': 'sendiri', 'same': 'sama',
  'so': 'jadi', 'than': 'daripada', 'too': 'juga', 'very': 'sangat',
  'just': 'hanya', 'also': 'juga', 'now': 'sekarang', 'here': 'di sini',
  'be': 'menjadi', 'have': 'memiliki', 'do': 'melakukan', 'say': 'berkata',
  'get': 'mendapatkan', 'make': 'membuat', 'go': 'pergi', 'know': 'tahu',
  'take': 'mengambil', 'see': 'melihat', 'come': 'datang', 'think': 'berpikir',
  'look': 'melihat', 'want': 'ingin', 'give': 'memberi', 'use': 'menggunakan',
  'find': 'menemukan', 'tell': 'memberitahu', 'ask': 'bertanya', 'work': 'bekerja',
  'seem': 'tampak', 'feel': 'merasa', 'try': 'mencoba', 'leave': 'pergi',
  'call': 'memanggil', 'keep': 'menjaga', 'let': 'membiarkan', 'begin': 'mulai',
  'help': 'membantu', 'show': 'menunjukkan', 'hear': 'mendengar', 'play': 'bermain',
  'run': 'berlari', 'move': 'bergerak', 'live': 'tinggal', 'believe': 'percaya',
  'hold': 'memegang', 'bring': 'membawa', 'happen': 'terjadi', 'write': 'menulis',
  'sit': 'duduk', 'stand': 'berdiri', 'lose': 'kehilangan', 'pay': 'membayar',
  'meet': 'bertemu', 'learn': 'belajar', 'change': 'berubah', 'lead': 'memimpin',
  'understand': 'memahami', 'watch': 'menonton', 'follow': 'mengikuti',
  'stop': 'berhenti', 'create': 'membuat', 'speak': 'berbicara', 'read': 'membaca',
  'spend': 'menghabiskan', 'grow': 'tumbuh', 'open': 'membuka', 'walk': 'berjalan',
  'win': 'menang', 'offer': 'menawarkan', 'remember': 'mengingat', 'love': 'mencintai',
  'consider': 'mempertimbangkan', 'appear': 'muncul', 'buy': 'membeli', 'wait': 'menunggu',
  'die': 'mati', 'send': 'mengirim', 'expect': 'mengharapkan', 'build': 'membangun',
  'stay': 'tinggal', 'fall': 'jatuh', 'cut': 'memotong', 'reach': 'mencapai',
  'kill': 'membunuh', 'remain': 'tetap', 'mother': 'ibu', 'father': 'ayah',
  'son': 'anak laki-laki', 'daughter': 'anak perempuan', 'boy': 'anak laki-laki',
  'girl': 'anak perempuan', 'man': 'pria', 'woman': 'wanita', 'child': 'anak',
  'children': 'anak-anak', 'wife': 'istri', 'husband': 'suami', 'family': 'keluarga',
  'friend': 'teman', 'people': 'orang-orang', 'king': 'raja', 'queen': 'ratu',
  'prince': 'pangeran', 'princess': 'putri', 'day': 'hari', 'night': 'malam',
  'time': 'waktu', 'year': 'tahun', 'way': 'cara', 'world': 'dunia',
  'life': 'hidup', 'hand': 'tangan', 'part': 'bagian', 'place': 'tempat',
  'case': 'kasus', 'week': 'minggu', 'company': 'perusahaan', 'system': 'sistem',
  'program': 'program', 'question': 'pertanyaan', 'government': 'pemerintah',
  'number': 'nomor', 'home': 'rumah', 'water': 'air', 'room': 'kamar',
  'house': 'rumah', 'money': 'uang', 'story': 'cerita', 'fact': 'fakta',
  'month': 'bulan', 'lot': 'banyak', 'right': 'benar', 'study': 'belajar',
  'book': 'buku', 'eye': 'mata', 'job': 'pekerjaan', 'word': 'kata',
  'business': 'bisnis', 'issue': 'masalah', 'side': 'sisi', 'kind': 'baik',
  'head': 'kepala', 'far': 'jauh', 'black': 'hitam', 'long': 'panjang',
  'small': 'kecil', 'little': 'kecil', 'big': 'besar', 'good': 'baik',
  'bad': 'buruk', 'new': 'baru', 'old': 'tua', 'young': 'muda',
  'beautiful': 'cantik', 'handsome': 'tampan', 'rich': 'kaya', 'poor': 'miskin',
  'happy': 'bahagia', 'sad': 'sedih', 'tree': 'pohon', 'river': 'sungai',
  'mountain': 'gunung', 'sea': 'laut', 'sun': 'matahari', 'moon': 'bulan',
  'star': 'bintang', 'sky': 'langit', 'stone': 'batu', 'fish': 'ikan',
  'bird': 'burung', 'animal': 'hewan', 'flower': 'bunga', 'heart': 'hati',
  'ship': 'kapal', 'village': 'desa', 'forest': 'hutan', 'long': 'panjang',
  'ago': 'yang lalu', 'lived': 'tinggal', 'came': 'datang', 'went': 'pergi',
  'saw': 'melihat', 'said': 'berkata', 'told': 'memberitahu', 'gave': 'memberi',
  'took': 'mengambil', 'made': 'membuat', 'found': 'menemukan', 'became': 'menjadi',
  'turned': 'berubah', 'fell': 'jatuh', 'put': 'menaruh', 'brought': 'membawa',
};

const STATUS_COLORS: Record<WordStatus, string> = {
  new: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-b-2 border-blue-400',
  recognized: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-b-2 border-yellow-400',
  familiar: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-b-2 border-amber-300',
  learned: 'bg-green-50 text-green-700 hover:bg-green-100 border-b-2 border-green-300',
  known: 'text-text-primary hover:bg-gray-100',
};

const STATUS_LABELS: Record<WordStatus, string> = {
  new: 'New',
  recognized: '2',
  familiar: '3',
  learned: '4',
  known: 'Known',
};

export default function ReaderPage() {
  const [view, setView] = useState<'select' | 'reader'>('select');
  const [story, setStory] = useState<Story | null>(null);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [wordStatuses, setWordStatuses] = useState<Record<string, WordStatus>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  // View modes: word (word-by-word) or sentence (sentence-by-sentence)
  const [viewMode, setViewMode] = useState<'word' | 'sentence'>('sentence');
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackWordIndex, setPlaybackWordIndex] = useState<number | null>(null);

  // Sidebar tabs
  const [sidebarTab, setSidebarTab] = useState<'word' | 'new' | 'saved'>('word');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const pausedAtRef = useRef<number | null>(null);

  // Get all words flattened from story
  const getAllWords = useCallback(() => {
    if (!story) return [];
    return story.sentences.flatMap(s => s.words).filter(w => {
      const clean = w.text.toLowerCase().replace(/[^a-z']/g, '');
      return clean.length > 0;
    });
  }, [story]);

  // Get all new words from the story
  const getNewWords = useCallback(() => {
    if (!story) return [];
    const seen = new Set<string>();
    return story.sentences.flatMap(s => s.words).filter(w => {
      const clean = w.text.toLowerCase().replace(/[^a-z']/g, '');
      if (!clean || seen.has(clean)) return false;
      seen.add(clean);
      const status = wordStatuses[clean] || 'new';
      return status === 'new';
    });
  }, [story, wordStatuses]);

  // Get all saved (learning) words
  const getSavedWords = useCallback(() => {
    if (!story) return [];
    const seen = new Set<string>();
    return story.sentences.flatMap(s => s.words).filter(w => {
      const clean = w.text.toLowerCase().replace(/[^a-z']/g, '');
      if (!clean || seen.has(clean)) return false;
      seen.add(clean);
      const status = wordStatuses[clean] || 'new';
      return ['recognized', 'familiar', 'learned'].includes(status);
    });
  }, [story, wordStatuses]);

  // Parse content into sentences and words
  const parseContent = useCallback((content: string, title: string, country: string, flag: string): Story => {
    const sentences: Sentence[] = [];

    // Split by sentence-ending punctuation
    const sentenceTexts = content.split(/(?<=[.!?])\s+/);

    let wordIndex = 0;
    sentenceTexts.forEach((sentenceText, sentenceIndex) => {
      if (!sentenceText.trim()) return;

      const words: Word[] = [];
      const tokens = sentenceText.split(/(\s+)/);

      tokens.forEach((token) => {
        if (token.trim()) {
          const cleanWord = token.toLowerCase().replace(/[^a-z']/g, '');
          words.push({
            text: token,
            translation: TRANSLATIONS[cleanWord],
            status: wordStatuses[cleanWord] || 'new',
            index: wordIndex++,
            sentenceIndex,
          });
        }
      });

      sentences.push({
        text: sentenceText,
        words,
        index: sentenceIndex,
      });
    });

    return { title, content, sentences, country, flag };
  }, [wordStatuses]);

  // Load a cultural story
  const loadStory = (key: string) => {
    const storyData = CULTURAL_STORIES[key];
    if (storyData) {
      const parsed = parseContent(storyData.content, storyData.title, storyData.country, storyData.flag);
      setStory(parsed);
      setView('reader');
      setCurrentSentenceIndex(0);
    }
  };

  // Load custom text
  const loadCustomText = () => {
    if (customText.trim()) {
      const parsed = parseContent(customText, customTitle || 'My Text', 'Custom', '📖');
      setStory(parsed);
      setView('reader');
      setCurrentSentenceIndex(0);
    }
  };

  // Generate story with AI
  const generateStory = async (topic: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `A short folk tale or story about ${topic}. Write it in simple English suitable for language learners. About 200 words.`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const parsed = parseContent(data.content, data.title, 'AI Generated', '🤖');
        setStory(parsed);
        setView('reader');
        setCurrentSentenceIndex(0);
      } else {
        // Fallback to random story
        const keys = Object.keys(CULTURAL_STORIES);
        loadStory(keys[Math.floor(Math.random() * keys.length)]);
      }
    } catch (error) {
      console.error('Failed to generate story:', error);
      loadStory('indonesia');
    } finally {
      setIsGenerating(false);
    }
  };

  // Update word status
  const updateWordStatus = (word: string, status: WordStatus) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z']/g, '');
    setWordStatuses((prev) => ({ ...prev, [cleanWord]: status }));

    if (story) {
      setStory({
        ...story,
        sentences: story.sentences.map(s => ({
          ...s,
          words: s.words.map((w) => {
            const clean = w.text.toLowerCase().replace(/[^a-z']/g, '');
            if (clean === cleanWord) {
              return { ...w, status };
            }
            return w;
          }),
        })),
      });
    }
  };

  // Play word pronunciation using ElevenLabs
  const playWord = async (word: string) => {
    try {
      // Get selected voice from settings
      const settings = localStorage.getItem('svaralab-settings');
      const selectedVoice = settings ? JSON.parse(settings).selectedVoice : 'matilda';
      const voiceKey = selectedVoice as keyof typeof VOICES;

      const audioUrl = await speak(word, {
        voiceId: VOICES[voiceKey] || VOICES.matilda,
        stability: 0.3,
        similarityBoost: 0.85,
        style: 0.5,
      });
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Stop all playback
  const stopPlayback = useCallback(() => {
    playbackRef.current.cancelled = true;
    setIsPlaying(false);
    setIsPaused(false);
    setPlaybackWordIndex(null);
    pausedAtRef.current = null;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
  }, []);

  // Play a single sentence (for sentence view)
  const playSingleSentence = async (text: string) => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsPlaying(true);
    playbackRef.current.cancelled = false;

    try {
      const settings = localStorage.getItem('svaralab-settings');
      const selectedVoice = settings ? JSON.parse(settings).selectedVoice : 'matilda';
      const voiceKey = selectedVoice as keyof typeof VOICES;

      const audioUrl = await speak(text, {
        voiceId: VOICES[voiceKey] || VOICES.matilda,
        stability: 0.3,
        similarityBoost: 0.85,
        style: 0.5,
      });

      if (audioUrl && !playbackRef.current.cancelled) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => {
          setIsPlaying(false);
          setPlaybackWordIndex(null);
        };
        audio.play();
      } else if (!playbackRef.current.cancelled) {
        throw new Error('No audio URL');
      }
    } catch (error) {
      if ('speechSynthesis' in window && !playbackRef.current.cancelled) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.onend = () => {
          setIsPlaying(false);
          setPlaybackWordIndex(null);
        };
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Play entire story from a specific word index
  const playFromWord = useCallback(async (startIndex: number) => {
    const allWords = getAllWords();
    if (allWords.length === 0) return;

    // If already playing, stop
    if (isPlaying && !isPaused) {
      stopPlayback();
      return;
    }

    playbackRef.current.cancelled = false;
    setIsPlaying(true);
    setIsPaused(false);

    // Group words into sentences for more natural reading
    const sentences: { text: string; startIdx: number; endIdx: number }[] = [];
    let currentSentence = '';
    let sentenceStart = 0;

    allWords.forEach((word, idx) => {
      if (idx < startIndex) {
        if (word.text.match(/[.!?]$/)) {
          currentSentence = '';
          sentenceStart = idx + 1;
        }
        return;
      }

      if (currentSentence === '') {
        sentenceStart = idx;
      }
      currentSentence += word.text + ' ';

      if (word.text.match(/[.!?]$/)) {
        sentences.push({
          text: currentSentence.trim(),
          startIdx: sentenceStart,
          endIdx: idx,
        });
        currentSentence = '';
      }
    });

    // Add remaining partial sentence
    if (currentSentence.trim()) {
      sentences.push({
        text: currentSentence.trim(),
        startIdx: sentenceStart,
        endIdx: allWords.length - 1,
      });
    }

    // Play each sentence
    for (const sentence of sentences) {
      if (playbackRef.current.cancelled) break;

      setPlaybackWordIndex(sentence.startIdx);

      try {
        const settings = localStorage.getItem('svaralab-settings');
        const selectedVoice = settings ? JSON.parse(settings).selectedVoice : 'matilda';
        const voiceKey = selectedVoice as keyof typeof VOICES;

        const audioUrl = await speak(sentence.text, {
          voiceId: VOICES[voiceKey] || VOICES.matilda,
          stability: 0.3,
          similarityBoost: 0.85,
          style: 0.5,
        });

        if (audioUrl && !playbackRef.current.cancelled) {
          await new Promise<void>((resolve) => {
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            audio.onended = () => {
              setPlaybackWordIndex(sentence.endIdx);
              resolve();
            };
            audio.onerror = () => resolve();
            audio.play().catch(() => resolve());
          });
        }
      } catch (error) {
        // Use browser TTS as fallback
        if ('speechSynthesis' in window && !playbackRef.current.cancelled) {
          await new Promise<void>((resolve) => {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(sentence.text);
            utterance.lang = 'en-US';
            utterance.rate = 0.85;
            utterance.onend = () => {
              setPlaybackWordIndex(sentence.endIdx);
              resolve();
            };
            utterance.onerror = () => resolve();
            window.speechSynthesis.speak(utterance);
          });
        }
      }
    }

    if (!playbackRef.current.cancelled) {
      setIsPlaying(false);
      setPlaybackWordIndex(null);
    }
  }, [getAllWords, isPlaying, isPaused, stopPlayback]);

  // Pause playback
  const pausePlayback = useCallback(() => {
    if (!isPlaying) return;

    const allWords = getAllWords();
    pausedAtRef.current = playbackWordIndex !== null ? playbackWordIndex : 0;

    playbackRef.current.cancelled = true;
    setIsPaused(true);
    setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();
    }
    window.speechSynthesis?.cancel();
  }, [isPlaying, playbackWordIndex, getAllWords]);

  // Resume playback
  const resumePlayback = useCallback(() => {
    if (pausedAtRef.current !== null) {
      playFromWord(pausedAtRef.current);
      pausedAtRef.current = null;
    }
  }, [playFromWord]);

  // Handle word click - start playback from that word
  const handleWordClick = useCallback((word: Word, startPlayback: boolean = false) => {
    setSelectedWord(word);
    setSidebarTab('word');

    if (startPlayback) {
      playFromWord(word.index);
    }
  }, [playFromWord]);

  // Navigate sentences
  const nextSentence = () => {
    if (story && currentSentenceIndex < story.sentences.length - 1) {
      setCurrentSentenceIndex(i => i + 1);
    }
  };

  const prevSentence = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(i => i - 1);
    }
  };

  // Navigate words
  const allWords = getAllWords();
  const currentWord = allWords[currentWordIndex];

  const nextWord = () => {
    if (currentWordIndex < allWords.length - 1) {
      setCurrentWordIndex(i => i + 1);
    }
  };

  const prevWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(i => i - 1);
    }
  };

  // Selection view
  if (view === 'select') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Story Reader</h1>
          <p className="text-text-secondary">Learn English through cultural stories and tales from around the world</p>
        </div>

        {/* Cultural Stories */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-listen-bg flex items-center justify-center">
              <Globe className="w-5 h-5 text-listen" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Cultural Tales</h2>
              <p className="text-xs text-text-tertiary">Stories from around the world</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(CULTURAL_STORIES).map(([key, story]) => (
              <button
                key={key}
                onClick={() => loadStory(key)}
                className="flex items-center gap-3 p-4 bg-background-alt rounded-xl hover:bg-border transition-colors text-left"
              >
                <span className="text-2xl">{story.flag}</span>
                <div>
                  <p className="text-sm font-medium text-text-primary line-clamp-1">{story.title}</p>
                  <p className="text-xs text-text-tertiary">{story.country}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Generate */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-respond-bg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-respond" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Generate a Story</h2>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            AI will create a short folk tale on any topic
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter a topic (e.g., 'a brave rabbit')"
              className="flex-1 px-4 py-3 bg-background-alt rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-respond"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  generateStory(e.currentTarget.value);
                }
              }}
              id="topic-input"
            />
            <button
              onClick={() => {
                const input = document.getElementById('topic-input') as HTMLInputElement;
                if (input?.value) generateStory(input.value);
              }}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-respond text-white rounded-xl font-medium hover:bg-respond/90 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Paste Your Own */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-repeat-bg flex items-center justify-center">
              <Upload className="w-5 h-5 text-repeat" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Paste Your Own</h2>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full px-4 py-3 bg-background-alt rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-repeat"
            />
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste any English text here..."
              className="w-full h-24 px-4 py-3 bg-background-alt rounded-xl text-sm text-text-primary placeholder-text-tertiary resize-none focus:outline-none focus:ring-2 focus:ring-repeat"
            />
            <button
              onClick={loadCustomText}
              disabled={!customText.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-repeat text-white rounded-xl font-medium hover:bg-repeat/90 transition-colors disabled:opacity-50"
            >
              <BookOpen className="w-4 h-4" />
              Start Reading
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reader view
  const currentSentence = story?.sentences[currentSentenceIndex];
  const newWords = getNewWords();
  const savedWords = getSavedWords();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('select')}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">{story?.flag}</span>
              <div>
                <h1 className="text-sm font-bold text-text-primary truncate max-w-xs">
                  {story?.title}
                </h1>
                <p className="text-xs text-text-tertiary">{story?.country}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              {isPlaying ? (
                <button
                  onClick={pausePlayback}
                  className="flex items-center gap-2 px-4 py-2 bg-situation text-white rounded-lg font-medium hover:bg-situation/90 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  <span className="text-sm">Pause</span>
                </button>
              ) : isPaused ? (
                <button
                  onClick={resumePlayback}
                  className="flex items-center gap-2 px-4 py-2 bg-listen text-white rounded-lg font-medium hover:bg-listen/90 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Resume</span>
                </button>
              ) : (
                <button
                  onClick={() => playFromWord(0)}
                  className="flex items-center gap-2 px-4 py-2 bg-listen text-white rounded-lg font-medium hover:bg-listen/90 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Read All</span>
                </button>
              )}
              {(isPlaying || isPaused) && (
                <button
                  onClick={stopPlayback}
                  className="p-2 bg-background-alt text-text-secondary rounded-lg hover:bg-border transition-colors"
                  title="Stop"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-background-alt rounded-lg p-1">
              <button
                onClick={() => setViewMode('word')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'word' ? 'bg-white shadow-sm text-text-primary' : 'text-text-tertiary'
                }`}
                title="Word by Word"
              >
                <AlignJustify className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('sentence')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'sentence' ? 'bg-white shadow-sm text-text-primary' : 'text-text-tertiary'
                }`}
                title="Sentence by Sentence"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Playback indicator */}
          {(isPlaying || isPaused) && (
            <div className="mb-4 p-3 bg-listen/10 border border-listen/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-listen animate-pulse' : 'bg-listen/50'}`} />
                <span className="text-sm font-medium text-listen">
                  {isPlaying ? 'Playing...' : 'Paused'}
                  <span className="text-text-tertiary ml-2">
                    Click any word to play from there
                  </span>
                </span>
              </div>
              <span className="text-xs text-text-tertiary">
                {playbackWordIndex !== null ? `Word ${playbackWordIndex + 1} of ${allWords.length}` : ''}
              </span>
            </div>
          )}

          {viewMode === 'sentence' ? (
            /* Sentence View */
            <div className="bg-card border border-border rounded-2xl p-8">
              {/* Sentence Navigation */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium text-text-tertiary">
                  Sentence {currentSentenceIndex + 1} of {story?.sentences.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevSentence}
                    disabled={currentSentenceIndex === 0}
                    className="p-2 rounded-lg bg-background-alt hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextSentence}
                    disabled={!story || currentSentenceIndex === story.sentences.length - 1}
                    className="p-2 rounded-lg bg-background-alt hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Current Sentence */}
              <div className="mb-6">
                <div className="text-xl leading-relaxed mb-4">
                  {currentSentence?.words.map((word, index) => {
                    const cleanWord = word.text.toLowerCase().replace(/[^a-z']/g, '');
                    const status = wordStatuses[cleanWord] || 'new';
                    const isCurrentlyPlaying = playbackWordIndex === word.index;

                    if (!word.text.trim()) return null;

                    return (
                      <span
                        key={index}
                        onClick={() => handleWordClick(word)}
                        onDoubleClick={() => playFromWord(word.index)}
                        className={`inline-block px-1 py-0.5 rounded cursor-pointer transition-all mr-1 mb-1 ${
                          STATUS_COLORS[status]
                        } ${selectedWord?.index === word.index ? 'ring-2 ring-respond' : ''} ${
                          isCurrentlyPlaying ? 'ring-2 ring-listen bg-listen/20 scale-105' : ''
                        }`}
                        title="Click to see details, double-click to play from here"
                      >
                        {word.text}
                      </span>
                    );
                  })}
                </div>

                {/* Play Sentence Button */}
                <button
                  onClick={() => currentSentence && playSingleSentence(currentSentence.text)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                    isPlaying
                      ? 'bg-situation text-white'
                      : 'bg-listen text-white hover:bg-listen/90'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Listen to Sentence
                    </>
                  )}
                </button>
              </div>

              {/* Progress */}
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-listen rounded-full transition-all duration-300"
                  style={{ width: `${((currentSentenceIndex + 1) / (story?.sentences.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            /* Word View - Word by Word Navigation */
            <div className="bg-card border border-border rounded-2xl p-8">
              {/* Word Navigation */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium text-text-tertiary">
                  Word {currentWordIndex + 1} of {allWords.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevWord}
                    disabled={currentWordIndex === 0}
                    className="p-2 rounded-lg bg-background-alt hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextWord}
                    disabled={currentWordIndex >= allWords.length - 1}
                    className="p-2 rounded-lg bg-background-alt hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Current Word Display */}
              {currentWord && (
                <div className="text-center mb-8">
                  <div className="mb-4">
                    <span className={`inline-block text-5xl font-bold px-6 py-4 rounded-2xl ${
                      STATUS_COLORS[wordStatuses[currentWord.text.toLowerCase().replace(/[^a-z']/g, '')] || 'new']
                    }`}>
                      {currentWord.text.replace(/[^a-z']/gi, '')}
                    </span>
                  </div>
                  {currentWord.translation && (
                    <p className="text-xl text-listen font-medium mb-4">{currentWord.translation}</p>
                  )}
                  <button
                    onClick={() => playWord(currentWord.text.replace(/[^a-z']/gi, ''))}
                    className="flex items-center gap-2 px-6 py-3 bg-listen text-white rounded-xl font-medium hover:bg-listen/90 transition-colors mx-auto"
                  >
                    <Volume2 className="w-5 h-5" />
                    Listen
                  </button>
                </div>
              )}

              {/* Context - Show surrounding words */}
              <div className="p-4 bg-background-alt rounded-xl">
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">Context</p>
                <div className="text-lg leading-relaxed">
                  {allWords.slice(Math.max(0, currentWordIndex - 5), currentWordIndex + 6).map((word, idx) => {
                    const actualIndex = Math.max(0, currentWordIndex - 5) + idx;
                    const isCurrent = actualIndex === currentWordIndex;
                    const cleanWord = word.text.toLowerCase().replace(/[^a-z']/g, '');
                    const status = wordStatuses[cleanWord] || 'new';

                    return (
                      <span
                        key={actualIndex}
                        onClick={() => {
                          setCurrentWordIndex(actualIndex);
                          handleWordClick(word);
                        }}
                        onDoubleClick={() => playFromWord(actualIndex)}
                        className={`inline-block px-1 py-0.5 rounded cursor-pointer transition-all mr-1 ${
                          isCurrent
                            ? 'bg-respond text-white scale-110 font-bold'
                            : STATUS_COLORS[status]
                        }`}
                      >
                        {word.text}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Progress */}
              <div className="mt-6 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-respond rounded-full transition-all duration-300"
                  style={{ width: `${((currentWordIndex + 1) / allWords.length) * 100}%` }}
                />
              </div>

              {/* Word Status Controls */}
              {currentWord && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-text-tertiary mr-2">Mark as:</span>
                    {[1, 2, 3, 4].map((level) => {
                      const statuses: WordStatus[] = ['new', 'recognized', 'familiar', 'learned'];
                      const status = statuses[level - 1];
                      const cleanWord = currentWord.text.toLowerCase().replace(/[^a-z']/g, '');
                      const currentStatus = wordStatuses[cleanWord] || 'new';

                      return (
                        <button
                          key={level}
                          onClick={() => updateWordStatus(currentWord.text, status)}
                          className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                            currentStatus === status
                              ? 'bg-respond text-white'
                              : 'bg-background-alt text-text-primary hover:bg-border'
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => updateWordStatus(currentWord.text, 'known')}
                      className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                        (wordStatuses[currentWord.text.toLowerCase().replace(/[^a-z']/g, '')] || 'new') === 'known'
                          ? 'bg-listen text-white'
                          : 'bg-background-alt text-text-primary hover:bg-border'
                      }`}
                    >
                      ✓
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-border bg-card sticky top-[57px] h-[calc(100vh-57px)] overflow-hidden flex flex-col">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setSidebarTab('word')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                sidebarTab === 'word'
                  ? 'text-respond border-b-2 border-respond'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Word
            </button>
            <button
              onClick={() => setSidebarTab('new')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                sidebarTab === 'new'
                  ? 'text-respond border-b-2 border-respond'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              New ({newWords.length})
            </button>
            <button
              onClick={() => setSidebarTab('saved')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                sidebarTab === 'saved'
                  ? 'text-respond border-b-2 border-respond'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Saved ({savedWords.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Word Tab */}
            {sidebarTab === 'word' && (
              <>
                {selectedWord ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => playWord(selectedWord.text.replace(/[^a-z']/gi, ''))}
                        className="p-2 rounded-lg bg-respond/10 text-respond hover:bg-respond/20 transition-colors"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setSelectedWord(null)}
                        className="p-2 rounded-lg hover:bg-background-alt transition-colors"
                      >
                        <X className="w-5 h-5 text-text-tertiary" />
                      </button>
                    </div>

                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                      {selectedWord.text.replace(/[^a-z']/gi, '')}
                    </h2>

                    {selectedWord.translation && (
                      <div className="mb-6">
                        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                          Indonesian
                        </span>
                        <p className="text-lg text-listen font-medium mt-1">
                          {selectedWord.translation}
                        </p>
                      </div>
                    )}

                    {/* Status Buttons */}
                    <div className="mb-6">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide block mb-3">
                        Mark as
                      </span>
                      <div className="grid grid-cols-5 gap-1">
                        {[1, 2, 3, 4].map((level) => {
                          const statuses: WordStatus[] = ['new', 'recognized', 'familiar', 'learned'];
                          const status = statuses[level - 1];
                          const cleanWord = selectedWord.text.toLowerCase().replace(/[^a-z']/g, '');
                          const currentStatus = wordStatuses[cleanWord] || 'new';

                          return (
                            <button
                              key={level}
                              onClick={() => updateWordStatus(selectedWord.text, status)}
                              className={`p-3 rounded-lg font-bold transition-colors ${
                                currentStatus === status
                                  ? 'bg-respond text-white'
                                  : 'bg-background-alt text-text-primary hover:bg-border'
                              }`}
                            >
                              {level}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => updateWordStatus(selectedWord.text, 'known')}
                          className={`p-3 rounded-lg transition-colors ${
                            (wordStatuses[selectedWord.text.toLowerCase().replace(/[^a-z']/g, '')] || 'new') === 'known'
                              ? 'bg-listen text-white'
                              : 'bg-background-alt text-text-primary hover:bg-border'
                          }`}
                        >
                          ✓
                        </button>
                      </div>
                      <div className="flex justify-between text-xs text-text-tertiary mt-2">
                        <span>1 = New</span>
                        <span>4 = Learned</span>
                        <span>✓ = Known</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookMarked className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                    <p className="text-sm text-text-secondary">Click on a word to see details</p>
                  </div>
                )}
              </>
            )}

            {/* New Words Tab */}
            {sidebarTab === 'new' && (
              <div className="space-y-2">
                {newWords.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                    <p className="text-sm text-text-secondary">No new words! Great job!</p>
                  </div>
                ) : (
                  newWords.slice(0, 50).map((word, idx) => {
                    const clean = word.text.replace(/[^a-z']/gi, '');
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedWord(word);
                          setSidebarTab('word');
                        }}
                        className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <span className="font-medium text-blue-800">{clean}</span>
                        {word.translation && (
                          <span className="text-sm text-blue-600">{word.translation}</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* Saved Words Tab */}
            {sidebarTab === 'saved' && (
              <div className="space-y-2">
                {savedWords.length === 0 ? (
                  <div className="text-center py-12">
                    <BookMarked className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                    <p className="text-sm text-text-secondary">No saved words yet</p>
                    <p className="text-xs text-text-tertiary mt-1">Mark words as 2, 3, or 4 to save them</p>
                  </div>
                ) : (
                  savedWords.map((word, idx) => {
                    const clean = word.text.replace(/[^a-z']/gi, '');
                    const cleanLower = clean.toLowerCase();
                    const status = wordStatuses[cleanLower] || 'new';
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedWord(word);
                          setSidebarTab('word');
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${STATUS_COLORS[status]}`}
                      >
                        <span className="font-medium">{clean}</span>
                        <span className="text-xs px-2 py-0.5 bg-white/50 rounded-full">
                          {STATUS_LABELS[status]}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

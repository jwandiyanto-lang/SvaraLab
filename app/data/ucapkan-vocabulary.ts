// Vocabulary for Svara 1: Ucapkan
// Difficulty scale: 1-10 (1 = easiest, 10 = hardest)

export interface VocabItem {
  id: string;
  indonesian: string;
  english: string;
  difficulty: number;
  category: 'greeting' | 'daily' | 'travel' | 'food' | 'slang' | 'formal' | 'expression';
}

export const VOCABULARY: VocabItem[] = [
  // ===== EASY (Difficulty 1-3) =====
  // Basic greetings and single words
  { id: 'v001', indonesian: 'Halo', english: 'Hello', difficulty: 1, category: 'greeting' },
  { id: 'v002', indonesian: 'Ya', english: 'Yes', difficulty: 1, category: 'daily' },
  { id: 'v003', indonesian: 'Tidak', english: 'No', difficulty: 1, category: 'daily' },
  { id: 'v004', indonesian: 'Terima kasih', english: 'Thank you', difficulty: 1, category: 'greeting' },
  { id: 'v005', indonesian: 'Sama-sama', english: 'You are welcome', difficulty: 2, category: 'greeting' },
  { id: 'v006', indonesian: 'Selamat pagi', english: 'Good morning', difficulty: 2, category: 'greeting' },
  { id: 'v007', indonesian: 'Selamat siang', english: 'Good afternoon', difficulty: 2, category: 'greeting' },
  { id: 'v008', indonesian: 'Selamat malam', english: 'Good evening', difficulty: 2, category: 'greeting' },
  { id: 'v009', indonesian: 'Selamat tidur', english: 'Good night', difficulty: 2, category: 'greeting' },
  { id: 'v010', indonesian: 'Sampai jumpa', english: 'Goodbye', difficulty: 2, category: 'greeting' },
  { id: 'v011', indonesian: 'Maaf', english: 'Sorry', difficulty: 1, category: 'expression' },
  { id: 'v012', indonesian: 'Permisi', english: 'Excuse me', difficulty: 2, category: 'expression' },
  { id: 'v013', indonesian: 'Tolong', english: 'Please', difficulty: 2, category: 'expression' },
  { id: 'v014', indonesian: 'Apa kabar?', english: 'How are you?', difficulty: 2, category: 'greeting' },
  { id: 'v015', indonesian: 'Baik', english: 'Good', difficulty: 1, category: 'expression' },
  { id: 'v016', indonesian: 'Saya baik', english: 'I am fine', difficulty: 3, category: 'expression' },
  { id: 'v017', indonesian: 'Nama saya...', english: 'My name is...', difficulty: 3, category: 'greeting' },

  // ===== MEDIUM-EASY (Difficulty 4-5) =====
  // Common phrases and questions
  { id: 'v018', indonesian: 'Berapa harganya?', english: 'How much is it?', difficulty: 4, category: 'daily' },
  { id: 'v019', indonesian: 'Di mana toilet?', english: 'Where is the bathroom?', difficulty: 4, category: 'travel' },
  { id: 'v020', indonesian: 'Saya tidak mengerti', english: 'I do not understand', difficulty: 4, category: 'expression' },
  { id: 'v021', indonesian: 'Bisa bantu saya?', english: 'Can you help me?', difficulty: 4, category: 'expression' },
  { id: 'v022', indonesian: 'Saya lapar', english: 'I am hungry', difficulty: 3, category: 'food' },
  { id: 'v023', indonesian: 'Saya haus', english: 'I am thirsty', difficulty: 3, category: 'food' },
  { id: 'v024', indonesian: 'Saya mau ini', english: 'I want this', difficulty: 4, category: 'daily' },
  { id: 'v025', indonesian: 'Jam berapa sekarang?', english: 'What time is it?', difficulty: 4, category: 'daily' },
  { id: 'v026', indonesian: 'Dimana stasiun?', english: 'Where is the station?', difficulty: 4, category: 'travel' },
  { id: 'v027', indonesian: 'Saya dari Indonesia', english: 'I am from Indonesia', difficulty: 4, category: 'greeting' },
  { id: 'v028', indonesian: 'Saya suka ini', english: 'I like this', difficulty: 4, category: 'expression' },
  { id: 'v029', indonesian: 'Ini enak', english: 'This is delicious', difficulty: 4, category: 'food' },
  { id: 'v030', indonesian: 'Terlalu mahal', english: 'Too expensive', difficulty: 5, category: 'daily' },
  { id: 'v031', indonesian: 'Bisa lebih murah?', english: 'Can it be cheaper?', difficulty: 5, category: 'daily' },

  // ===== MEDIUM (Difficulty 5-6) =====
  // Longer sentences and travel phrases
  { id: 'v032', indonesian: 'Bisa bicara lebih pelan?', english: 'Can you speak slower?', difficulty: 5, category: 'expression' },
  { id: 'v033', indonesian: 'Saya tidak bisa berbahasa Inggris', english: 'I cannot speak English', difficulty: 5, category: 'expression' },
  { id: 'v034', indonesian: 'Tolong ulangi', english: 'Please repeat that', difficulty: 5, category: 'expression' },
  { id: 'v035', indonesian: 'Saya sedang belajar', english: 'I am learning', difficulty: 5, category: 'expression' },
  { id: 'v036', indonesian: 'Apa artinya ini?', english: 'What does this mean?', difficulty: 5, category: 'expression' },
  { id: 'v037', indonesian: 'Saya perlu bantuan', english: 'I need help', difficulty: 5, category: 'expression' },
  { id: 'v038', indonesian: 'Kemana arah ke...?', english: 'Which way to...?', difficulty: 5, category: 'travel' },
  { id: 'v039', indonesian: 'Saya mau pesan makanan', english: 'I want to order food', difficulty: 5, category: 'food' },
  { id: 'v040', indonesian: 'Boleh minta menu?', english: 'May I have the menu?', difficulty: 6, category: 'food' },
  { id: 'v041', indonesian: 'Minta billnya', english: 'Check please', difficulty: 5, category: 'food' },

  // ===== MEDIUM-HARD (Difficulty 6-7) =====
  // Slang and casual expressions
  { id: 'v042', indonesian: 'Santai aja', english: 'Take it easy', difficulty: 6, category: 'slang' },
  { id: 'v043', indonesian: 'Gue lagi bokek', english: 'I am broke', difficulty: 6, category: 'slang' },
  { id: 'v044', indonesian: 'Asik banget', english: 'That is so cool', difficulty: 6, category: 'slang' },
  { id: 'v045', indonesian: 'Gue capek banget', english: 'I am so tired', difficulty: 6, category: 'slang' },
  { id: 'v046', indonesian: 'Kamu lagi ngapain?', english: 'What are you doing?', difficulty: 6, category: 'slang' },
  { id: 'v047', indonesian: 'Nggak masalah', english: 'No problem', difficulty: 5, category: 'slang' },
  { id: 'v048', indonesian: 'Ayo pergi', english: 'Let us go', difficulty: 5, category: 'daily' },
  { id: 'v049', indonesian: 'Tunggu sebentar', english: 'Wait a moment', difficulty: 5, category: 'daily' },
  { id: 'v050', indonesian: 'Saya setuju', english: 'I agree', difficulty: 5, category: 'expression' },
  { id: 'v051', indonesian: 'Saya tidak setuju', english: 'I disagree', difficulty: 6, category: 'expression' },
  { id: 'v052', indonesian: 'Boleh tanya?', english: 'May I ask?', difficulty: 6, category: 'formal' },

  // ===== HARD (Difficulty 7-8) =====
  // Formal and professional phrases
  { id: 'v053', indonesian: 'Senang bertemu dengan Anda', english: 'Nice to meet you', difficulty: 7, category: 'formal' },
  { id: 'v054', indonesian: 'Saya sangat menghargai bantuan Anda', english: 'I really appreciate your help', difficulty: 7, category: 'formal' },
  { id: 'v055', indonesian: 'Mohon maaf atas keterlambatan', english: 'Sorry for the delay', difficulty: 7, category: 'formal' },
  { id: 'v056', indonesian: 'Apakah ada pertanyaan?', english: 'Do you have any questions?', difficulty: 7, category: 'formal' },
  { id: 'v057', indonesian: 'Saya sedang mencari pekerjaan', english: 'I am looking for a job', difficulty: 7, category: 'formal' },
  { id: 'v058', indonesian: 'Bisakah kita jadwalkan pertemuan?', english: 'Can we schedule a meeting?', difficulty: 7, category: 'formal' },
  { id: 'v059', indonesian: 'Saya akan menghubungi Anda kembali', english: 'I will get back to you', difficulty: 7, category: 'formal' },
  { id: 'v060', indonesian: 'Terima kasih atas waktunya', english: 'Thank you for your time', difficulty: 7, category: 'formal' },
  { id: 'v061', indonesian: 'Bagaimana pendapat Anda?', english: 'What do you think?', difficulty: 7, category: 'formal' },
  { id: 'v062', indonesian: 'Saya ingin menyampaikan...', english: 'I would like to say...', difficulty: 8, category: 'formal' },

  // ===== VERY HARD (Difficulty 8-9) =====
  // Complex sentences and business language
  { id: 'v063', indonesian: 'Saya ingin menyampaikan presentasi', english: 'I would like to give a presentation', difficulty: 8, category: 'formal' },
  { id: 'v064', indonesian: 'Mari kita diskusikan strategi ini', english: 'Let us discuss this strategy', difficulty: 8, category: 'formal' },
  { id: 'v065', indonesian: 'Apakah Anda bisa menjelaskan lebih detail?', english: 'Could you explain in more detail?', difficulty: 8, category: 'formal' },
  { id: 'v066', indonesian: 'Saya pikir kita perlu mempertimbangkan', english: 'I think we need to consider', difficulty: 8, category: 'formal' },
  { id: 'v067', indonesian: 'Berdasarkan pengalaman saya', english: 'Based on my experience', difficulty: 8, category: 'formal' },
  { id: 'v068', indonesian: 'Saya ingin menyampaikan permintaan maaf', english: 'I would like to apologize', difficulty: 8, category: 'formal' },
  { id: 'v069', indonesian: 'Apakah ada kemungkinan untuk...?', english: 'Is there a possibility to...?', difficulty: 8, category: 'formal' },
  { id: 'v070', indonesian: 'Saya sangat menantikan kerja sama kita', english: 'I look forward to working with you', difficulty: 9, category: 'formal' },

  // ===== EXPERT (Difficulty 9-10) =====
  // Advanced professional communication
  { id: 'v071', indonesian: 'Dengan segala hormat, saya ingin menyampaikan', english: 'With all due respect, I would like to say', difficulty: 9, category: 'formal' },
  { id: 'v072', indonesian: 'Saya akan memastikan hal ini ditindaklanjuti', english: 'I will ensure this is followed up', difficulty: 9, category: 'formal' },
  { id: 'v073', indonesian: 'Apakah Anda bersedia untuk membahas lebih lanjut?', english: 'Would you be willing to discuss further?', difficulty: 9, category: 'formal' },
  { id: 'v074', indonesian: 'Saya menghargai kesempatan untuk berbicara dengan Anda', english: 'I appreciate the opportunity to speak with you', difficulty: 9, category: 'formal' },
  { id: 'v075', indonesian: 'Mohon dipertimbangkan dengan seksama', english: 'Please consider this carefully', difficulty: 9, category: 'formal' },
  { id: 'v076', indonesian: 'Saya yakin kita bisa menemukan solusi yang tepat', english: 'I am confident we can find the right solution', difficulty: 10, category: 'formal' },
  { id: 'v077', indonesian: 'Terima kasih telah meluangkan waktu untuk membahas hal ini', english: 'Thank you for taking the time to discuss this', difficulty: 10, category: 'formal' },
  { id: 'v078', indonesian: 'Saya berharap dapat bekerja sama dengan Anda di masa depan', english: 'I hope to work with you in the future', difficulty: 10, category: 'formal' },
];

// Helper function to get words by difficulty range
export function getWordsByDifficulty(minDiff: number, maxDiff: number): VocabItem[] {
  return VOCABULARY.filter(v => v.difficulty >= minDiff && v.difficulty <= maxDiff);
}

// Get a random word within a difficulty range
export function getRandomWord(currentDifficulty: number): VocabItem {
  // Allow words within ±2 of current difficulty
  const minDiff = Math.max(1, currentDifficulty - 2);
  const maxDiff = Math.min(10, currentDifficulty + 2);

  const eligibleWords = getWordsByDifficulty(minDiff, maxDiff);

  if (eligibleWords.length === 0) {
    // Fallback: return any word
    return VOCABULARY[Math.floor(Math.random() * VOCABULARY.length)];
  }

  return eligibleWords[Math.floor(Math.random() * eligibleWords.length)];
}

// Get total word count
export const TOTAL_WORDS = VOCABULARY.length;

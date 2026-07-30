// Minimal mock data for UI structure only — no fake user progress
export const MOCK_COURSES = [
  {
    id: '1',
    title: 'ASL Alphabet Fundamentals',
    description: 'Master the complete American Sign Language alphabet with interactive lessons and AI-powered practice.',
    category: 'alphabet',
    difficulty: 'beginner',
    duration: '2h 30m',
    lessonsCount: 12,
    image: 'https://images.unsplash.com/photo-1587613990174-2857e6e9f971?w=600&h=400&fit=crop',
  },
  {
    id: '2',
    title: 'Everyday Greetings',
    description: 'Learn essential greetings and introductions used in daily ASL conversations.',
    category: 'greetings',
    difficulty: 'beginner',
    duration: '1h 45m',
    lessonsCount: 8,
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop',
  },
  {
    id: '3',
    title: 'Numbers & Counting',
    description: 'From 1 to 100 and beyond — learn number signs, ordinals, and counting patterns.',
    category: 'alphabet',
    difficulty: 'beginner',
    duration: '1h 20m',
    lessonsCount: 6,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
  },
  {
    id: '4',
    title: 'Family & Relationships',
    description: 'Signs for family members, relationships, and describing people.',
    category: 'vocabulary',
    difficulty: 'intermediate',
    duration: '2h 10m',
    lessonsCount: 10,
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=400&fit=crop',
  },
  {
    id: '5',
    title: 'Food & Dining',
    description: 'Restaurant vocabulary, food signs, and dining etiquette in sign language.',
    category: 'vocabulary',
    difficulty: 'intermediate',
    duration: '1h 50m',
    lessonsCount: 9,
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
  },
  {
    id: '6',
    title: 'Advanced Conversation',
    description: 'Complex sentence structures, storytelling, and nuanced expression.',
    category: 'conversation',
    difficulty: 'advanced',
    duration: '3h 15m',
    lessonsCount: 15,
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop',
  },
];

export const MOCK_LESSONS = [
  { id: 'l1', title: 'A to E', duration: '10 min', order: 1 },
  { id: 'l2', title: 'F to J', duration: '12 min', order: 2 },
  { id: 'l3', title: 'K to O', duration: '11 min', order: 3 },
  { id: 'l4', title: 'P to T', duration: '13 min', order: 4 },
  { id: 'l5', title: 'U to Z', duration: '10 min', order: 5 },
];

export const MOCK_FAQS = [
  {
    question: 'What is SignSpeak?',
    answer: 'SignSpeak is an AI-powered platform that helps you learn sign language through interactive lessons, real-time practice with your camera, and personalized assessments.',
  },
  {
    question: 'Do I need a camera to practice?',
    answer: 'Yes, the practice workspace uses your device camera to provide real-time feedback on your signing. All processing is done securely in your browser.',
  },
  {
    question: 'Which sign languages are supported?',
    answer: 'We currently support ASL, BSL, Auslan, LSF, DGS, and ISL. More languages are being added regularly.',
  },
  {
    question: 'Is my camera data stored?',
    answer: 'No. Your camera feed is processed locally in your browser. No video data is sent to our servers unless you explicitly choose to share it for assessment.',
  },
  {
    question: 'Can I get certified?',
    answer: 'Yes, upon completing course assessments you can earn certificates that verify your proficiency level.',
  },
  {
    question: 'How do I reset my password?',
    answer: 'Go to the login page and click "Forgot Password." Enter your email and we will send you a secure reset link.',
  },
];

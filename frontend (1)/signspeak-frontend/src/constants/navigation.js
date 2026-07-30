export const NAV_LINKS = {
  main: [
    { name: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { name: 'Courses', path: '/courses', icon: 'BookOpen' },
    { name: 'Practice', path: '/practice', icon: 'Hand' },
    { name: 'Assessments', path: '/assessments', icon: 'ClipboardCheck' },
    { name: 'Reports', path: '/reports', icon: 'BarChart3' },
  ],
  secondary: [
    { name: 'Notifications', path: '/notifications', icon: 'Bell' },
    { name: 'Settings', path: '/settings', icon: 'Settings' },
    { name: 'Help', path: '/help', icon: 'HelpCircle' },
  ],
};

export const SIGN_LANGUAGES = [
  { value: 'asl', label: 'American Sign Language (ASL)' },
  { value: 'bsl', label: 'British Sign Language (BSL)' },
  { value: 'auslan', label: 'Auslan' },
  { value: 'lsf', label: 'Langue des Signes Française (LSF)' },
  { value: 'dgs', label: 'Deutsche Gebärdensprache (DGS)' },
  { value: 'isl', label: 'International Sign Language (ISL)' },
];

export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to sign language' },
  { value: 'elementary', label: 'Elementary', description: 'Knows basic signs' },
  { value: 'intermediate', label: 'Intermediate', description: 'Can hold simple conversations' },
  { value: 'advanced', label: 'Advanced', description: 'Fluent in most situations' },
];

export const LEARNING_GOALS = [
  { value: 'daily_conversation', label: 'Daily Conversation' },
  { value: 'professional', label: 'Professional Use' },
  { value: 'family', label: 'Family Communication' },
  { value: 'education', label: 'Education Support' },
  { value: 'certification', label: 'Get Certified' },
];

export const COURSE_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'alphabet', label: 'Alphabet & Numbers' },
  { value: 'greetings', label: 'Greetings' },
  { value: 'conversation', label: 'Conversation' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'vocabulary', label: 'Vocabulary' },
];

export const DIFFICULTY_LEVELS = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

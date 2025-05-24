import { 
  Course, 
  UserProgress, 
  Assessment, 
  Question
} from '../models/types';

// Mock course data
export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Security Fundamentals',
    description: 'Learn the basics of cybersecurity, including threat models, attack vectors, and fundamental security principles.',
    thumbnail: 'https://via.placeholder.com/400x200?text=Security+Fundamentals',
    difficulty: 'beginner',
    duration: 120,
    tags: ['fundamentals', 'cybersecurity', 'basics'],
    targetRoles: ['analyst', 'administrator', 'manager'],
    prerequisites: [],
    modules: [
      {
        id: 'module-1-1',
        title: 'Introduction to Security Concepts',
        description: 'Essential security concepts and terminology',
        lessons: [
          {
            id: 'lesson-1-1-1',
            title: 'Security Principles',
            type: 'text',
            content: {
              body: 'Security principles include confidentiality, integrity, and availability...'
            },
            duration: 15
          },
          {
            id: 'lesson-1-1-2',
            title: 'Threat Models',
            type: 'video',
            content: {
              videoUrl: 'https://example.com/videos/threat-models',
              transcript: 'In this video, we discuss different threat models...'
            },
            duration: 20
          }
        ]
      },
      {
        id: 'module-1-2',
        title: 'Common Attack Vectors',
        description: 'Understanding how attackers target systems',
        lessons: [
          {
            id: 'lesson-1-2-1',
            title: 'Phishing Attacks',
            type: 'interactive',
            content: {
              scenarios: [
                { id: 'scenario-1', title: 'Email Phishing Example', data: {} }
              ]
            },
            duration: 25
          }
        ],
        assessment: {
          id: 'assessment-1-2',
          title: 'Attack Vector Knowledge Check',
          type: 'quiz',
          questions: [
            {
              id: 'question-1',
              type: 'multiple_choice',
              text: 'Which of the following is NOT a common phishing technique?',
              options: [
                'Using urgent language',
                'Spoofing sender addresses',
                'Including official logos',
                'Sending from known contacts only'
              ],
              correctAnswer: 'Sending from known contacts only',
              points: 10
            }
          ],
          passingScore: 70
        }
      }
    ]
  },
  {
    id: 'course-2',
    title: 'SIEM Operations for Analysts',
    description: 'Master the use of SIEM tools for security monitoring, alert triage, and incident response.',
    thumbnail: 'https://via.placeholder.com/400x200?text=SIEM+Operations',
    difficulty: 'intermediate',
    duration: 180,
    tags: ['SIEM', 'monitoring', 'alerts'],
    targetRoles: ['analyst'],
    prerequisites: ['course-1'],
    modules: [
      {
        id: 'module-2-1',
        title: 'SIEM Fundamentals',
        description: 'Understanding SIEM architecture and capabilities',
        lessons: [
          {
            id: 'lesson-2-1-1',
            title: 'What is a SIEM?',
            type: 'text',
            content: {
              body: 'SIEM systems aggregate and analyze security data from multiple sources...'
            },
            duration: 15
          }
        ]
      }
    ]
  },
  {
    id: 'course-3',
    title: 'Advanced Threat Hunting',
    description: 'Learn proactive techniques to search for signs of compromise and sophisticated threats in your environment.',
    thumbnail: 'https://via.placeholder.com/400x200?text=Threat+Hunting',
    difficulty: 'advanced',
    duration: 240,
    tags: ['threat hunting', 'advanced', 'IOCs'],
    targetRoles: ['analyst'],
    prerequisites: ['course-1', 'course-2'],
    modules: [
      {
        id: 'module-3-1',
        title: 'Threat Hunting Methodology',
        description: 'Systematic approaches to searching for threats',
        lessons: [
          {
            id: 'lesson-3-1-1',
            title: 'Hypothesis-based Hunting',
            type: 'text',
            content: {
              body: 'Hypothesis-based hunting begins with a theory about potential attacker behavior...'
            },
            duration: 20
          }
        ]
      }
    ]
  },
  {
    id: 'course-4',
    title: 'Security Platform Administration',
    description: 'Learn how to efficiently administer the Logware Security Platform, manage users, and configure integrations.',
    thumbnail: 'https://via.placeholder.com/400x200?text=Platform+Administration',
    difficulty: 'intermediate',
    duration: 150,
    tags: ['administration', 'configuration', 'management'],
    targetRoles: ['administrator'],
    prerequisites: ['course-1'],
    modules: [
      {
        id: 'module-4-1',
        title: 'Platform Architecture',
        description: 'Understanding the architecture of the Logware Security Platform',
        lessons: [
          {
            id: 'lesson-4-1-1',
            title: 'Component Overview',
            type: 'interactive',
            content: {
              diagram: 'interactive-diagram-url',
              elements: []
            },
            duration: 25
          }
        ]
      }
    ]
  },
  {
    id: 'course-5',
    title: 'Security Metrics for Management',
    description: 'Understand key security metrics, reporting strategies, and how to communicate security posture to stakeholders.',
    thumbnail: 'https://via.placeholder.com/400x200?text=Security+Metrics',
    difficulty: 'intermediate',
    duration: 90,
    tags: ['metrics', 'reporting', 'management'],
    targetRoles: ['manager'],
    prerequisites: ['course-1'],
    modules: [
      {
        id: 'module-5-1',
        title: 'Key Security Metrics',
        description: 'Essential metrics for measuring security effectiveness',
        lessons: [
          {
            id: 'lesson-5-1-1',
            title: 'Measuring Security Posture',
            type: 'text',
            content: {
              body: 'Effective security metrics include coverage, efficacy, and time-to-detect...'
            },
            duration: 15
          }
        ]
      }
    ]
  }
];

// Mock user progress data
export const mockUserProgress: UserProgress[] = [
  {
    userId: 'current-user',
    courseId: 'course-1',
    startedAt: '2025-05-01T10:00:00Z',
    moduleProgress: [
      {
        moduleId: 'module-1-1',
        status: 'completed',
        lessonProgress: [
          {
            lessonId: 'lesson-1-1-1',
            status: 'completed',
            lastAccessedAt: '2025-05-01T10:30:00Z'
          },
          {
            lessonId: 'lesson-1-1-2',
            status: 'completed',
            lastAccessedAt: '2025-05-01T11:00:00Z'
          }
        ]
      },
      {
        moduleId: 'module-1-2',
        status: 'in_progress',
        lessonProgress: [
          {
            lessonId: 'lesson-1-2-1',
            status: 'in_progress',
            lastAccessedAt: '2025-05-02T09:00:00Z'
          }
        ],
        assessmentResult: {
          score: 0,
          passed: false,
          attempts: 0,
          lastAttemptAt: ''
        }
      }
    ]
  },
  {
    userId: 'current-user',
    courseId: 'course-2',
    startedAt: '2025-05-10T14:00:00Z',
    completedAt: '2025-05-15T16:30:00Z',
    moduleProgress: [
      {
        moduleId: 'module-2-1',
        status: 'completed',
        lessonProgress: [
          {
            lessonId: 'lesson-2-1-1',
            status: 'completed',
            lastAccessedAt: '2025-05-10T14:30:00Z'
          }
        ]
      }
    ],
    certificationIssued: true
  }
];

// Mock questions for assessments
export const mockQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple_choice',
    text: 'Which of the following is NOT a pillar of the CIA triad?',
    options: [
      'Confidentiality', 
      'Integrity', 
      'Authentication', 
      'Availability'
    ],
    correctAnswer: 'Authentication',
    explanation: 'The CIA triad consists of Confidentiality, Integrity, and Availability. Authentication is part of access control, not the CIA triad.',
    points: 10
  },
  {
    id: 'q2',
    type: 'true_false',
    text: 'Multi-factor authentication always requires a physical device.',
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: 'Multi-factor authentication requires multiple factors, which could include something you know (password), something you have (physical device), or something you are (biometrics). Not all MFA implementations require a physical device.',
    points: 5
  },
  {
    id: 'q3',
    type: 'fill_blank',
    text: 'The process of converting plaintext into ciphertext is called _______.',
    correctAnswer: 'encryption',
    explanation: 'Encryption is the process of converting plaintext into ciphertext to protect data confidentiality.',
    points: 8
  }
];

// Mock certifications
export const mockCertifications = [
  {
    id: 'cert-1',
    userId: 'current-user',
    courseId: 'course-2',
    title: 'SIEM Operations Specialist',
    issuedAt: '2025-05-15T16:30:00Z',
    verificationCode: 'LS-CERT-12345'
  }
];

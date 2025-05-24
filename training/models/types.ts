// Training system type definitions

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ContentType = 'video' | 'text' | 'interactive' | 'lab';
export type AssessmentType = 'quiz' | 'practical' | 'scenario';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';
export type UserRole = 'analyst' | 'administrator' | 'manager';

// Course definitions
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  difficulty: DifficultyLevel;
  duration: number; // in minutes
  tags: string[];
  targetRoles: UserRole[];
  modules: Module[];
  prerequisites: string[]; // IDs of prerequisite courses
  certificationId?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  assessment?: Assessment;
}

export interface Lesson {
  id: string;
  title: string;
  type: ContentType;
  content: any; // LessonContent based on type
  duration: number; // in minutes
  resources?: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'link' | 'file' | 'reference';
  url?: string;
  content?: string;
}

// Assessment definitions
export interface Assessment {
  id: string;
  title: string;
  type: AssessmentType;
  questions: Question[];
  passingScore: number;
  timeLimit?: number; // in minutes
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'matching' | 'fill_blank';
  text: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

// User progress tracking
export interface UserProgress {
  userId: string;
  courseId: string;
  startedAt: string;
  completedAt?: string;
  moduleProgress: ModuleProgress[];
  certificationIssued?: boolean;
}

export interface ModuleProgress {
  moduleId: string;
  status: ProgressStatus;
  lessonProgress: LessonProgress[];
  assessmentResult?: AssessmentResult;
}

export interface LessonProgress {
  lessonId: string;
  status: ProgressStatus;
  lastAccessedAt?: string;
}

export interface AssessmentResult {
  score: number;
  passed: boolean;
  attempts: number;
  lastAttemptAt: string;
  answers?: Record<string, any>;
}

// Certification
export interface Certification {
  id: string;
  userId: string;
  courseId: string;
  title: string;
  issuedAt: string;
  expiresAt?: string;
  verificationCode: string;
}

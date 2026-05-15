export interface HomeworkTask {
  id: string;
  order: number;
  title: string;
  description: string;
  type: 'code' | 'quiz' | 'project' | 'reading';
  difficulty?: 'oson' | 'orta' | 'qiyin';
  xp: number;
  questions?: QuizQuestion[];      // type === 'quiz' uchun
  starterCode?: string;             // type === 'code' uchun
  expectedOutput?: string;          // type === 'code' uchun — AI tekshiradi
  checkList?: string[];             // type === 'project' uchun
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number; // index
  explanation: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  solution?: string;
  testCases?: string[];
}

export interface ModuleProject {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  rubric: { criterion: string; points: number }[];
  totalPoints: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  duration: string;
  description: string;
  videoTitle: string;
  videoUrl: string;
  theory: string;
  codeExample: string;
  task: string;
  taskHint: string;
  difficulty?: 'oson' | 'orta' | 'qiyin';
  requirementsList?: string[];
  exercises?: Exercise[];
  homeworkTasks?: HomeworkTask[];
  completed?: boolean;
}

export interface Module {
  id: string;
  order: number;
  title: string;
  icon: string;
  color: string;
  description: string;
  totalHours: string;
  lessons: Lesson[];
  project?: ModuleProject;
}

export interface UserProgress {
  completedLessons: string[];
  completedExercises: string[];
  completedProjects: string[];
  completedHomework: string[];      // homeworkTask IDs
  homeworkScores: { [id: string]: number }; // taskId -> score (0-100)
  quizAnswers: { [questionId: string]: number }; // questionId -> chosen index
  currentLesson: string;
  startDate: string;
  xp: number;
  streak: number;
}

export interface Account {
  id: string;
  fullName: string;
  email: string;
  goal: string;
  createdAt: string;
}
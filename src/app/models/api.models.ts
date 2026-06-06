export type Role = 'ADMIN' | 'TRAINER' | 'EMPLOYEE';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  token?: string;
  jwt?: string;
  jwtToken?: string;
  access_token?: string;
  role?: Role | string;
  authority?: Role | string;
  userRole?: Role | string;
  email?: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  departmentName?: string;
  enabled?: boolean;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  trainerEmail?: string;
  modules?: CourseModule[];
}

export interface CourseModule {
  id?: number;
  moduleId?: number;
  courseModuleId?: number;
  title: string;
  description?: string;
  sequenceOrder?: number;
}

export interface Enrollment {
  id: number;
  courseId?: number;
  courseTitle: string;
  employeeId?: number;
  employeeEmail?: string;
  status: string;
  completedModules: number;
  totalModules: number;
  courseCompleted?: boolean;
  progress?: number;
  score?: number;
  passingScore?: number;
  assessmentPassed?: boolean;
}

export interface DashboardSummary {
  totalEmployees?: number;
  totalCourses?: number;
  completedCourses?: number;
  inProgressCourses?: number;
}

export interface Quiz {
  id?: number;
  title?: string;
  description?: string;
  passingScore?: number;
  courseModuleId?: number;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id?: number;
  text?: string;
  marks?: number;
  options?: QuizOption[];
}

export interface QuizOption {
  id?: number;
  text?: string;
  correct?: boolean;
}

export interface QuizSubmissionResult {
  id?: number;
  quizId?: number;
  employeeEmail?: string;
  score: number;
  passed: boolean;
  totalQuestions?: number;
  correctAnswers?: number;
}

export interface CertificateDetails {
  courseId: number;
  courseName: string;
  trainerId?: number | null;
  trainerName?: string | null;
  recipientName: string;
  completionDate: string;
}

export interface CertificateCourseOption {
  courseId: number;
  courseName: string;
}

export interface CertificateGenerationResponse {
  id?: number;
  certificateId?: number | string;
  downloadUrl?: string;
  pdfUrl?: string;
}

export type NotificationType = 'ENROLLMENT' | 'REMINDER' | 'COMPLETION' | 'CERTIFICATE';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface NotificationRequest {
  recipientEmail?: string;
  recipientEmails?: string[];
  role?: Role;
  sendToAll?: boolean;
  subject: string;
  message?: string;
  body?: string;
  type: NotificationType;
  emailEnabled: boolean;
}

export interface NotificationRecord {
  id: number;
  recipientEmail: string;
  recipientName?: string | null;
  subject: string;
  body?: string;
  message?: string;
  type: NotificationType;
  status: NotificationStatus;
  emailEnabled: boolean;
  failureReason?: string | null;
  createdAt?: string;
  sentAt?: string | null;
  readAt?: string | null;
  read: boolean;
}

export interface NotificationSummary {
  total: number;
  unread: number;
}

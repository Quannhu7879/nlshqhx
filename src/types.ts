export type ViewMode = 'landing' | 'studio' | 'repository' | 'library' | 'legal' | 'admin';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'teacher' | 'admin';
}

export interface RegisteredAccount {
  id: string;
  email: string;
  displayName: string;
  password?: string;
  role: 'teacher' | 'admin';
  createdAt: string;
  status: 'active' | 'locked';
  lastLogin?: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  grade: string;
  framework: string;
  template: string;
  status: 'Đã tích hợp NLS' | 'Chưa tích hợp NLS';
  originalHtml: string;
  integratedHtml: string;
  createdAt: number;
  dateString: string;
  userId?: string;
  authorEmail?: string;
}

export interface SubCompetency {
  code: string;
  title: string;
  tag: string;
}

export interface CompetencyDomain {
  id: string;
  code: string;
  title: string;
  icon: string;
  description: string;
  fullDescription: string;
  components: SubCompetency[];
  lessonGuide: string;
  tools: string[];
}

export interface LegalDocument {
  id: string;
  code: string;
  title: string;
  date: string;
  authority: string;
  summary: string;
  highlights: string[];
  icon: string;
  color: string;
}

export interface SystemStats {
  totalLessons: number;
  totalUsers: number;
  integratedPercentage: number;
  activeFrameworks: number;
  mostUsedTool: string;
}

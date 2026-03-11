// Types for the judging system

export type JudgingCriteria = {
  id: number;
  name: string;
  description: string | null;
  maxScore: number;
  weight: number;
  order: number;
  hackathonId: number;
  createdAt: string;
  updatedAt: string;
};

export type Judge = {
  id: number;
  adminId: number;
  hackathonId: number;
  createdAt: string;
  admin: {
    id: number;
    fullname: string;
    email: string;
    image?: string;
  };
  _count?: {
    assignments: number;
  };
};

export type Project = {
  id: number;
  name: string;
  description: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  presentationUrl: string | null;
  videoUrl: string | null;
  teamName: string;
  teamMembers: string[];
  teamLeaderEmail: string | null;
  status: ProjectStatus;
  submittedAt: string;
  updatedAt: string;
  hackathonId: number;
};

export type ProjectStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'JUDGED' | 'FINALIST' | 'WINNER';

export type JudgeAssignment = {
  id: number;
  judgeId: number;
  projectId: number;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  judge?: {
    id: number;
    admin: {
      id: number;
      fullname: string;
      email: string;
    };
  };
  project?: {
    id: number;
    name: string;
    teamName: string;
    status: string;
  };
  scores?: Score[];
};

export type Score = {
  id: number;
  judgeAssignmentId: number;
  criteriaId: number;
  score: number;
  feedback: string | null;
  criteria?: JudgingCriteria;
};

export type LeaderboardEntry = {
  rank: number;
  id: number;
  name: string;
  teamName: string;
  description: string | null;
  demoUrl: string | null;
  status: string;
  avgScore: number;
  judgeCount: number;
  individualScores: number[];
};

// Form types
export type CriteriaFormData = {
  name: string;
  description: string;
  maxScore: number;
  weight: number;
};

export type ProjectFormData = {
  name: string;
  description: string;
  repoUrl: string;
  demoUrl: string;
  presentationUrl: string;
  videoUrl: string;
  teamName: string;
  teamMembers: string[];
  teamLeaderEmail: string;
};

export type ScoreFormData = {
  criteriaId: number;
  score: number;
  feedback: string;
};
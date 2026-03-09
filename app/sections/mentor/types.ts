// Mentor types and constants

export type MentorStatus = 'ACTIVE' | 'INACTIVE';

export type MentorProps = {
  id: string;
  name: string;
  email?: string;
  image?: string;
  title?: string;
  bio?: string;
  expertise: string[];
  linkedin?: string;
  github?: string;
  status: MentorStatus;
  websiteId: string;
  createdAt: string;
};

export type MentorFormData = {
  name: string;
  email?: string;
  image?: string;
  title?: string;
  bio?: string;
  expertise: string[];
  linkedin?: string;
  github?: string;
  status: MentorStatus;
  websiteId: string;
};

// Predefined expertise areas
export const EXPERTISE_OPTIONS = [
  { value: 'ai-ml', label: 'AI/Machine Learning' },
  { value: 'web-dev', label: 'Web Development' },
  { value: 'mobile', label: 'Mobile Development' },
  { value: 'blockchain', label: 'Blockchain/Web3' },
  { value: 'cloud', label: 'Cloud/DevOps' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'ui-ux', label: 'UI/UX Design' },
  { value: 'product', label: 'Product Management' },
  { value: 'startup', label: 'Startup/Entrepreneurship' },
  { value: 'iot', label: 'IoT/Hardware' },
  { value: 'game-dev', label: 'Game Development' },
] as const;

export const EXPERTISE_LABELS: Record<string, string> = EXPERTISE_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<string, string>
);
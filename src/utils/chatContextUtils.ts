import type { UserContext } from '@/types/chat';

// Study-related keywords to validate relevance
const STUDY_KEYWORDS = [
  'learn', 'study', 'course', 'skill', 'language', 'programming', 'develop', 'project',
  'algorithm', 'code', 'javascript', 'python', 'java', 'react', 'node', 'database',
  'html', 'css', 'framework', 'library', 'tutorial', 'udemy', 'coursera', 'lecture',
  'practice', 'exercise', 'solution', 'debug', 'test', 'deploy', 'backend', 'frontend',
  'fullstack', 'roadmap', 'schedule', 'quiz', 'assessment', 'skill assessment', 'goal',
  'android', 'ios', 'webdev', 'datascience', 'ml', 'ai', 'blockchain', 'devops',
  'certification', 'bootcamp', 'training', 'mentor', 'interview', 'preparation',
  'knowledge', 'understanding', 'concept', 'pattern', 'architecture', 'design',
];

// Keywords to extract from user context
const LANGUAGE_KEYWORDS = [
  'javascript', 'python', 'java', 'typescript', 'cpp', 'csharp', 'golang', 'rust',
  'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css',
];

const JOB_COURSE_KEYWORDS = [
  'frontend', 'backend', 'fullstack', 'devops', 'datascience', 'ml', 'ai', 'blockchain',
  'android', 'ios', 'webdev', 'qa', 'security', 'devrel', 'product manager',
  'engineering manager', 'data engineer', 'data analyst', 'bi analyst', 'game development',
  'cyber security', 'cloud computing', 'aws', 'azure', 'gcp',
];

const POSITION_KEYWORDS = [
  'engineer', 'developer', 'analyst', 'manager', 'lead', 'architect', 'specialist',
  'senior', 'junior', 'intern', 'contractor', 'freelancer',
];

const SKILL_KEYWORDS = [
  'react', 'node', 'express', 'mongodb', 'postgresql', 'docker', 'kubernetes',
  'git', 'rest api', 'graphql', 'testing', 'debugging', 'version control',
  'agile', 'scrum', 'ci/cd', 'terraform', 'ansible', 'jenkins',
];

/**
 * Check if a message is study-related based on keyword matching
 */
export function isStudyRelated(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // If message is very short, ask for clarification
  if (message.trim().split(/\s+/).length < 3) {
    return false;
  }

  // Check for study-related keywords
  const hasStudyKeyword = STUDY_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );

  return hasStudyKeyword;
}

/**
 * Extract context from user message
 */
export function extractUserContext(message: string, existingContext?: UserContext): UserContext {
  const lowerMessage = message.toLowerCase();
  const context: UserContext = existingContext || {
    languages: [],
    jobCourses: [],
    positions: [],
    subjects: [],
    skills: [],
    goals: [],
  };

  // Extract languages
  LANGUAGE_KEYWORDS.forEach(keyword => {
    if (lowerMessage.includes(keyword.toLowerCase()) && 
        !context.languages.includes(keyword)) {
      context.languages.push(keyword);
    }
  });

  // Extract job courses
  JOB_COURSE_KEYWORDS.forEach(keyword => {
    if (lowerMessage.includes(keyword.toLowerCase()) && 
        !context.jobCourses.includes(keyword)) {
      context.jobCourses.push(keyword);
    }
  });

  // Extract positions
  POSITION_KEYWORDS.forEach(keyword => {
    if (lowerMessage.includes(keyword.toLowerCase()) && 
        !context.positions.includes(keyword)) {
      context.positions.push(keyword);
    }
  });

  // Extract skills
  SKILL_KEYWORDS.forEach(keyword => {
    if (lowerMessage.includes(keyword.toLowerCase()) && 
        !context.skills.includes(keyword)) {
      context.skills.push(keyword);
    }
  });

  return context;
}

/**
 * Format context summary for display
 */
export function formatContextSummary(context: UserContext): string {
  const sections = [];

  if (context.languages.length > 0) {
    sections.push(`**Languages**: ${context.languages.join(', ')}`);
  }
  if (context.jobCourses.length > 0) {
    sections.push(`**Job/Courses**: ${context.jobCourses.join(', ')}`);
  }
  if (context.positions.length > 0) {
    sections.push(`**Positions**: ${context.positions.join(', ')}`);
  }
  if (context.skills.length > 0) {
    sections.push(`**Skills**: ${context.skills.join(', ')}`);
  }
  if (context.subjects.length > 0) {
    sections.push(`**Subjects**: ${context.subjects.join(', ')}`);
  }
  if (context.goals.length > 0) {
    sections.push(`**Goals**: ${context.goals.join(', ')}`);
  }

  return sections.join('\n\n') || 'No context extracted yet';
}

/**
 * Get ground-level skills based on context
 */
export function getGroundLevelSkills(context: UserContext): string[] {
  // Map job courses to fundamental skills
  const fundamentalSkills: Record<string, string[]> = {
    'frontend': ['HTML', 'CSS', 'JavaScript', 'React', 'UI/UX Design'],
    'backend': ['Node.js', 'Express', 'Databases', 'REST APIs', 'Server Architecture'],
    'fullstack': ['Frontend Basics', 'Backend Basics', 'Databases', 'Deployment', 'Full App Development'],
    'devops': ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Infrastructure'],
    'datascience': ['Python', 'Statistics', 'Pandas', 'NumPy', 'Data Visualization'],
    'ml': ['Python', 'Math/Statistics', 'TensorFlow', 'Scikit-learn', 'Model Training'],
    'ai': ['Python', 'LLMs', 'Prompt Engineering', 'Model Fine-tuning', 'AI Ethics'],
    'blockchain': ['Cryptography', 'Smart Contracts', 'Solidity', 'Web3', 'DeFi'],
    'android': ['Java/Kotlin', 'Android SDK', 'UI Design', 'Networking', 'Database'],
    'ios': ['Swift', 'UIKit/SwiftUI', 'iOS SDK', 'Networking', 'Core Data'],
  };

  const skills: Set<string> = new Set();

  context.jobCourses.forEach(course => {
    const courseSkills = fundamentalSkills[course.toLowerCase()];
    if (courseSkills) {
      courseSkills.forEach(skill => skills.add(skill));
    }
  });

  return Array.from(skills);
}

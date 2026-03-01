/**
 * Skill Types
 * 
 * Types for the Skills/Topics feature.
 * Matches the backend Prisma schema.
 */

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type SkillEdgeType = 
  | 'SUBSKILL_OF'
  | 'PREREQUISITE'
  | 'RELATED'
  | 'ALTERNATIVE'
  | 'BUILDS_ON'
  | 'COMPLEMENTS';

export type SkillStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';

export type SelectionSource = 
  | 'USER_SELECTED'
  | 'AI_RECOMMENDED'
  | 'ROLE_REQUIRED'
  | 'GOAL_DERIVED'
  | 'PREREQUISITE';

export interface SkillCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface SkillTag {
  name: string;
  slug: string;
  color: string | null;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  difficulty: Difficulty;
  category: SkillCategory;
  tags: SkillTag[];
  isCanonical: boolean;
}

export interface SkillWithSubskills extends Skill {
  subskills: SkillWithSubskills[];
  computedDepth: number;
}

export interface SkillSearchResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  difficulty: Difficulty;
  category: { name: string; slug: string };
  tags: Array<{ name: string; slug: string }>;
  isCanonical: boolean;
}

export interface SkillSelection {
  skillId: string;
  name: string;
  includeSubskills: boolean;
  sourceType: SelectionSource;
}

export interface SelectedSkillState {
  skill: Skill;
  selectedSubskillIds: string[];  // Empty = all subskills, specific IDs = only those
  includeAllSubskills: boolean;   // True = parent selected (darker), false = specific subskills
}

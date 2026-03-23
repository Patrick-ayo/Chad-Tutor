/**
 * Engineering Manager Roadmap Seed Script
 *
 * Seeds the Engineering Manager development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/engineering-manager.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';
import { buildNodeResources } from './resources';

const prisma = new PrismaClient();

// Engineering Manager Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'engineering-manager', name: 'Engineering Manager', description: 'Complete Engineering Manager roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 0 },

  // ==== INTRODUCTION ====
  { slug: 'em-introduction', name: 'What is an Engineering Manager?', description: 'Understanding the Engineering Manager role', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
  { slug: 'em-roles', name: 'Roles', description: 'Various roles and responsibilities', difficulty: Difficulty.INTERMEDIATE, sortOrder: 2 },
  { slug: 'em-responsibilities', name: 'Responsibilities', description: 'Core responsibilities of an EM', difficulty: Difficulty.INTERMEDIATE, sortOrder: 3 },
  { slug: 'em-cross-functional', name: 'Cross-functional', description: 'Cross-functional collaboration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 4 },

  // ==== TECHNICAL LEADERSHIP ====
  { slug: 'technical-leadership', name: 'Technical Leadership', description: 'Technical leadership skills', difficulty: Difficulty.INTERMEDIATE, sortOrder: 5 },
  { slug: 'technical-strategy', name: 'Technical Strategy', description: 'Developing technical strategies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },
  { slug: 'technical-roadmapping', name: 'Technical Roadmapping', description: 'Creating technical roadmaps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 7 },
  { slug: 'build-vs-buy', name: 'Build vs Buy Evaluation', description: 'Evaluating build vs buy decisions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 8 },
  { slug: 'system-design-architecture', name: 'System Design and Architecture', description: 'System design and architectural decisions', difficulty: Difficulty.ADVANCED, sortOrder: 9 },
  { slug: 'technical-data-management', name: 'Technical Data and Management', description: 'Managing technical data', difficulty: Difficulty.INTERMEDIATE, sortOrder: 10 },
  { slug: 'technical-documentation', name: 'Technical Documentation', description: 'Technical documentation practices', difficulty: Difficulty.INTERMEDIATE, sortOrder: 11 },
  { slug: 'technical-risk-assessment', name: 'Technical Risk Assessment', description: 'Assessing technical risks', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },
  { slug: 'skills-improvement', name: 'Skills Improvement', description: 'Improving team technical skills', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },
  { slug: 'legacy-system-performance', name: 'Legacy System Maintenance', description: 'Maintaining legacy systems', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },

  // ==== PEOPLE MANAGEMENT ====
  { slug: 'people-management', name: 'People Management', description: 'Managing people and teams', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },

  // Team Development
  { slug: 'team-development', name: 'Team Development', description: 'Developing team members', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'hiring-recruitment', name: 'Hiring and Recruitment', description: 'Building and hiring teams', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },
  { slug: 'onboarding-mentoring', name: 'Onboarding and Mentoring', description: 'Onboarding new team members', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'performance-evaluations', name: 'Performance Evaluations', description: 'Evaluating performance', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'career-growth-planning', name: 'Career Growth Planning', description: 'Planning career growth', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },
  { slug: 'conflict-resolution-pm', name: 'Conflict Resolution', description: 'Resolving team conflicts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },

  // Leadership Skills
  { slug: 'leadership-skills', name: 'Leadership Skills', description: 'Core leadership competencies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },
  { slug: 'delegation', name: 'Delegation', description: 'Delegating tasks effectively', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'feedback-delivery', name: 'Feedback Delivery', description: 'Delivering effective feedback', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },
  { slug: 'team-motivation', name: 'Team Motivation', description: 'Motivating team members', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'conflict-resolution-ls', name: 'Conflict Resolution', description: 'Handling conflicts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },
  { slug: 'emotional-intelligence', name: 'Emotional Intelligence', description: 'Developing emotional intelligence', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },

  // Communication
  { slug: 'communication', name: 'Communication', description: 'Effective communication', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },
  { slug: 'one-on-ones', name: 'One on Ones', description: 'Conducting effective 1:1s', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'team-meetings', name: 'Team Meetings', description: 'Running effective team meetings', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'status-reporting', name: 'Status Reporting', description: 'Status reporting and updates', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },
  { slug: 'cross-functional-collaboration', name: 'Cross functional Collaboration', description: 'Cross-functional teamwork', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },

  // ==== EXECUTION ====
  { slug: 'execution', name: 'Execution', description: 'Project execution and delivery', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },
  { slug: 'agile-methodologies', name: 'Agile methodologies', description: 'Agile and scrum practices', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },
  { slug: 'project-tracking', name: 'Project tracking', description: 'Tracking project progress', difficulty: Difficulty.INTERMEDIATE, sortOrder: 35 },
  { slug: 'roadmap-planning', name: 'Roadmap planning', description: 'Planning product roadmaps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },
  { slug: 'scope-management', name: 'Scope Management', description: 'Managing project scope', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },
  { slug: 'timeline-estimation', name: 'Timeline Estimation', description: 'Estimating project timelines', difficulty: Difficulty.INTERMEDIATE, sortOrder: 38 },

  // ==== PROJECT MANAGEMENT ====
  { slug: 'project-management', name: 'Project Management', description: 'Project management practices', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'prepared-planning', name: 'Prepared Planning', description: 'Upfront project planning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'resource-allocation', name: 'Resource Allocation', description: 'Allocating team resources', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'sprint-planning', name: 'Sprint Planning', description: 'Sprint planning and execution', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },
  { slug: 'release-planning', name: 'Release Planning', description: 'Planning product releases', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },
  { slug: 'risk-management', name: 'Risk Management', description: 'Managing project risks', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },
  { slug: 'dependency-management', name: 'Dependency Management', description: 'Managing dependencies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },

  // Strategic Thinking
  { slug: 'strategic-thinking', name: 'Strategic Thinking', description: 'Strategic planning and thinking', difficulty: Difficulty.ADVANCED, sortOrder: 46 },
  { slug: 'product-strategy-alignment', name: 'Product strategy alignment', description: 'Aligning with product strategy', difficulty: Difficulty.ADVANCED, sortOrder: 47 },
  { slug: 'technical-strategy-alignment', name: 'Technical strategy alignment', description: 'Aligning with tech strategy', difficulty: Difficulty.ADVANCED, sortOrder: 48 },
  { slug: 'roi-analysis', name: 'ROI analysis', description: 'Analyzing return on investment', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'competitive-analysis', name: 'Competitive Analysis', description: 'Competitive market analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 50 },

  // ==== BUSINESS ACUMEN ====
  { slug: 'business-acumen', name: 'Business Acumen', description: 'Business understanding and skills', difficulty: Difficulty.ADVANCED, sortOrder: 51 },

  // Measurement
  { slug: 'measurement', name: 'Measurement', description: 'Measuring success and performance', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'kpi-definition', name: 'KPI Definition', description: 'Defining KPIs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },
  { slug: 'metrics-definition', name: 'Metrics Definition', description: 'Defining metrics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 54 },
  { slug: 'quality-metrics', name: 'Quality Metrics', description: 'Quality metrics and tracking', difficulty: Difficulty.INTERMEDIATE, sortOrder: 55 },
  { slug: 'team-health-metrics', name: 'Team Health Metrics', description: 'Team health assessment', difficulty: Difficulty.INTERMEDIATE, sortOrder: 56 },
  { slug: 'project-metrics', name: 'Project Metrics', description: 'Project performance metrics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 57 },

  // Budget and Finance
  { slug: 'budget-planning', name: 'Budget Planning', description: 'Budget planning and management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 58 },
  { slug: 'resource-forecasting', name: 'Resource Forecasting', description: 'Forecasting resource needs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 59 },
  { slug: 'cost-optimization', name: 'Cost Optimization', description: 'Optimizing costs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },
  { slug: 'revenue-tracking', name: 'Revenue Tracking', description: 'Tracking revenue impact', difficulty: Difficulty.INTERMEDIATE, sortOrder: 61 },

  // ==== CULTURE BUILDING ====
  { slug: 'culture-building', name: 'Culture Building', description: 'Building strong team culture', difficulty: Difficulty.INTERMEDIATE, sortOrder: 62 },

  // Team Culture
  { slug: 'team-culture', name: 'Team Culture', description: 'Creating team culture', difficulty: Difficulty.INTERMEDIATE, sortOrder: 63 },
  { slug: 'defining-enforcing-values', name: 'Defining and Enforcing Values', description: 'Team values and norms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 64 },
  { slug: 'psychological-safety', name: 'Psychological Safety', description: 'Creating psychological safety', difficulty: Difficulty.INTERMEDIATE, sortOrder: 65 },
  { slug: 'team-traditions-rituals', name: 'Team Traditions and Rituals', description: 'Team building activities', difficulty: Difficulty.INTERMEDIATE, sortOrder: 66 },
  { slug: 'recognition-programs', name: 'Recognition programs', description: 'Recognizing achievements', difficulty: Difficulty.INTERMEDIATE, sortOrder: 67 },
  { slug: 'bias-recognition-mitigation', name: 'Bias Recognition / Mitigation', description: 'Avoiding and mitigating bias', difficulty: Difficulty.INTERMEDIATE, sortOrder: 68 },

  // Engineering Culture
  { slug: 'engineering-culture', name: 'Engineering Culture', description: 'Engineering team culture', difficulty: Difficulty.INTERMEDIATE, sortOrder: 69 },
  { slug: 'innovation-fostering', name: 'Innovation fostering', description: 'Fostering innovation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 70 },
  { slug: 'learning-culture-development', name: 'Learning culture development', description: 'Developing learning culture', difficulty: Difficulty.INTERMEDIATE, sortOrder: 71 },
  { slug: 'knowledge-sharing-practices', name: 'Knowledge sharing practices', description: 'Knowledge sharing in teams', difficulty: Difficulty.INTERMEDIATE, sortOrder: 72 },
  { slug: 'processes-fine-tuning', name: 'Processes fine-tuning', description: 'Optimizing team processes', difficulty: Difficulty.INTERMEDIATE, sortOrder: 73 },

  // ==== COMPANY CULTURE ====
  { slug: 'company-culture', name: 'Company Culture', description: 'Organizational culture', difficulty: Difficulty.INTERMEDIATE, sortOrder: 74 },
  { slug: 'organization-structure', name: 'Organization structure', description: 'Organizational structure', difficulty: Difficulty.INTERMEDIATE, sortOrder: 75 },
  { slug: 'policy-navigation', name: 'Policy navigation', description: 'Navigating company policies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 76 },
  { slug: 'organizational-awareness', name: 'Organizational Awareness', description: 'Understanding org dynamics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 77 },

  // ==== STAKEHOLDER MANAGEMENT ====
  { slug: 'stakeholder-management', name: 'Stakeholder Management', description: 'Managing stakeholders', difficulty: Difficulty.INTERMEDIATE, sortOrder: 78 },

  // Partner Management
  { slug: 'partner-management', name: 'Partner Management', description: 'Managing external partners', difficulty: Difficulty.INTERMEDIATE, sortOrder: 79 },
  { slug: 'vendor-relationships', name: 'Vendor relationships', description: 'Building vendor relationships', difficulty: Difficulty.INTERMEDIATE, sortOrder: 80 },
  { slug: 'vendor-partnerships', name: 'Vendor partnerships', description: 'Managing vendor partnerships', difficulty: Difficulty.INTERMEDIATE, sortOrder: 81 },
  { slug: 'integration-management', name: 'Integration management', description: 'Managing integrations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 82 },
  { slug: 'api-etiquette', name: 'API etiquette', description: 'API usage and etiquette', difficulty: Difficulty.INTERMEDIATE, sortOrder: 83 },

  // Documentation
  { slug: 'documentation', name: 'Documentation', description: 'Documentation practices', difficulty: Difficulty.INTERMEDIATE, sortOrder: 84 },
  { slug: 'architecture-documentation', name: 'Architecture documentation', description: 'Documenting architecture', difficulty: Difficulty.INTERMEDIATE, sortOrder: 85 },
  { slug: 'process-documentation', name: 'Process documentation', description: 'Documenting processes', difficulty: Difficulty.INTERMEDIATE, sortOrder: 86 },
  { slug: 'process-documentation-learning', name: 'Process documentation', description: 'Learning from documentation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 87 },
  { slug: 'lessons-learned', name: 'Lessons Learned', description: 'Capturing lessons learned', difficulty: Difficulty.INTERMEDIATE, sortOrder: 88 },

  // Knowledge Management
  { slug: 'knowledge-management', name: 'Knowledge Management', description: 'Managing organizational knowledge', difficulty: Difficulty.INTERMEDIATE, sortOrder: 89 },
  { slug: 'knowledge-transfer', name: 'Knowledge Transfer', description: 'Knowledge transfer practices', difficulty: Difficulty.INTERMEDIATE, sortOrder: 90 },
  { slug: 'mentoring-programs', name: 'Mentoring Programs', description: 'Mentoring and coaching', difficulty: Difficulty.INTERMEDIATE, sortOrder: 91 },
  { slug: 'knowledge-repository', name: 'Knowledge Repository', description: 'Building knowledge repositories', difficulty: Difficulty.INTERMEDIATE, sortOrder: 92 },
  { slug: 'technical-tools', name: 'Technical Tools', description: 'Tools for knowledge management', difficulty: Difficulty.BEGINNER, sortOrder: 93 },
  { slug: 'brown-bags', name: 'Brown Bags', description: 'Knowledge sharing sessions', difficulty: Difficulty.BEGINNER, sortOrder: 94 },

  // Executive Communication
  { slug: 'executive-communication', name: 'Executive Communication', description: 'Communicating with executives', difficulty: Difficulty.ADVANCED, sortOrder: 95 },
  { slug: 'executive-alignment', name: 'Executive alignment', description: 'Aligning with executives', difficulty: Difficulty.ADVANCED, sortOrder: 96 },
  { slug: 'strategic-proposals', name: 'Strategic proposals', description: 'Making strategic proposals', difficulty: Difficulty.ADVANCED, sortOrder: 97 },
  { slug: 'budget-requests', name: 'Budget requests', description: 'Budget request pitches', difficulty: Difficulty.INTERMEDIATE, sortOrder: 98 },
  { slug: 'vision-alignment', name: 'Vision alignment', description: 'Aligning with vision', difficulty: Difficulty.ADVANCED, sortOrder: 99 },

  // ==== CUSTOMER RELATIONS ====
  { slug: 'customer-relations', name: 'Customer Relations', description: 'Managing customer relationships', difficulty: Difficulty.INTERMEDIATE, sortOrder: 100 },
  { slug: 'customer-feedback-integration', name: 'Customer feedback integration', description: 'Integrating customer feedback', difficulty: Difficulty.INTERMEDIATE, sortOrder: 101 },
  { slug: 'customer-success-alignment', name: 'Customer success alignment', description: 'Aligning with customer success', difficulty: Difficulty.INTERMEDIATE, sortOrder: 102 },
  { slug: 'feature-prioritization', name: 'Feature prioritization', description: 'Prioritizing features', difficulty: Difficulty.INTERMEDIATE, sortOrder: 103 },
  { slug: 'technical-partnerships', name: 'Technical partnerships', description: 'Technical partnership management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 104 },

  // ==== CRISIS MANAGEMENT ====
  { slug: 'crisis-management', name: 'Crisis Management', description: 'Managing crises and incidents', difficulty: Difficulty.ADVANCED, sortOrder: 105 },
  { slug: 'risk-mitigation', name: 'Risk Mitigation', description: 'Mitigating risks', difficulty: Difficulty.INTERMEDIATE, sortOrder: 106 },
  { slug: 'contingency-planning', name: 'Contingency planning', description: 'Planning for contingencies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 107 },
  { slug: 'disaster-recovery', name: 'Disaster recovery', description: 'Disaster recovery planning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 108 },
  { slug: 'incident-handling', name: 'Incident handling', description: 'Handling incidents', difficulty: Difficulty.ADVANCED, sortOrder: 109 },
  { slug: 'security-incident-handling', name: 'Security incident handling', description: 'Security incident response', difficulty: Difficulty.ADVANCED, sortOrder: 110 },
  { slug: 'production-issues-management', name: 'Production issues management', description: 'Managing production issues', difficulty: Difficulty.INTERMEDIATE, sortOrder: 111 },
  { slug: 'incident-response', name: 'Incident Response', description: 'Incident response procedures', difficulty: Difficulty.ADVANCED, sortOrder: 112 },
  { slug: 'near-misses-management', name: 'Near misses management', description: 'Managing near misses', difficulty: Difficulty.INTERMEDIATE, sortOrder: 113 },
  { slug: 'service-recovery', name: 'Service Recovery', description: 'Recovering from service issues', difficulty: Difficulty.INTERMEDIATE, sortOrder: 114 },
  { slug: 'root-cause-analysis', name: 'Root cause analysis', description: 'RCA and post-mortems', difficulty: Difficulty.ADVANCED, sortOrder: 115 },

  // ==== CHANGE MANAGEMENT ====
  { slug: 'change-management', name: 'Change Management', description: 'Managing organizational change', difficulty: Difficulty.ADVANCED, sortOrder: 116 },

  // Technical Change
  { slug: 'technical-change', name: 'Technical Change', description: 'Technical change management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 117 },
  { slug: 'legacy-system-retirement', name: 'Legacy system retirement', description: 'Retiring legacy systems', difficulty: Difficulty.INTERMEDIATE, sortOrder: 118 },
  { slug: 'technology-adoption', name: 'Technology adoption', description: 'Adopting new technologies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 119 },
  { slug: 'process-changes', name: 'Process changes', description: 'Process improvement', difficulty: Difficulty.INTERMEDIATE, sortOrder: 120 },

  // Organizational Change
  { slug: 'organizational-change', name: 'Organizational Change', description: 'Organizational restructuring', difficulty: Difficulty.ADVANCED, sortOrder: 121 },
  { slug: 'change-strategy', name: 'Change strategy', description: 'Strategic change planning', difficulty: Difficulty.ADVANCED, sortOrder: 122 },
  { slug: 'stakeholder-management-change', name: 'Stakeholder management', description: 'Change impact on stakeholders', difficulty: Difficulty.ADVANCED, sortOrder: 123 },
  { slug: 'communication-change', name: 'Communication', description: 'Change communication', difficulty: Difficulty.ADVANCED, sortOrder: 124 },
  { slug: 'resistance-management', name: 'Resistance management', description: 'Managing change resistance', difficulty: Difficulty.ADVANCED, sortOrder: 125 },

  // Team Change
  { slug: 'teaming-change', name: 'Teaming change', description: 'Team restructuring', difficulty: Difficulty.INTERMEDIATE, sortOrder: 126 },
  { slug: 'skill-transitions', name: 'Skill transitions', description: 'Managing skill transitions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 127 },
  { slug: 'role-transitions', name: 'Role transitions', description: 'Role changes and transitions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 128 },
  { slug: 'culture-evolution', name: 'Culture evolution', description: 'Evolving team culture', difficulty: Difficulty.INTERMEDIATE, sortOrder: 129 },

  // ==== KEEP LEARNING ====
  { slug: 'keep-learning-em', name: 'Keep Learning', description: 'Continuous learning for EMs', difficulty: Difficulty.BEGINNER, sortOrder: 130 },
];

const ROADMAP_EDGES_DATA = [
  // Introduction
  { source: 'em-introduction', target: 'engineering-manager', type: SkillEdgeType.PREREQUISITE },
  { source: 'em-roles', target: 'em-introduction', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'em-responsibilities', target: 'em-introduction', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'em-cross-functional', target: 'em-introduction', type: SkillEdgeType.SUBSKILL_OF },

  // Technical Leadership
  { source: 'technical-leadership', target: 'engineering-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'technical-strategy', target: 'technical-leadership', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'technical-roadmapping', target: 'technical-leadership', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'build-vs-buy', target: 'technical-leadership', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'system-design-architecture', target: 'technical-leadership', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'technical-data-management', target: 'technical-leadership', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'technical-documentation', target: 'technical-leadership', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'technical-risk-assessment', target: 'technical-leadership', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'skills-improvement', target: 'technical-leadership', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'legacy-system-performance', target: 'technical-leadership', type: SkillEdgeType.SUBSKILL_OF },

  // People Management
  { source: 'people-management', target: 'engineering-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'team-development', target: 'people-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hiring-recruitment', target: 'team-development', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'onboarding-mentoring', target: 'team-development', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'performance-evaluations', target: 'team-development', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'career-growth-planning', target: 'team-development', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'conflict-resolution-pm', target: 'team-development', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'leadership-skills', target: 'people-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'delegation', target: 'leadership-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'feedback-delivery', target: 'leadership-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'team-motivation', target: 'leadership-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'conflict-resolution-ls', target: 'leadership-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'emotional-intelligence', target: 'leadership-skills', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'communication', target: 'people-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'one-on-ones', target: 'communication', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'team-meetings', target: 'communication', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'status-reporting', target: 'communication', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cross-functional-collaboration', target: 'communication', type: SkillEdgeType.SUBSKILL_OF },

  // Execution
  { source: 'execution', target: 'engineering-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'agile-methodologies', target: 'execution', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'project-tracking', target: 'execution', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'roadmap-planning', target: 'execution', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'scope-management', target: 'execution', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'timeline-estimation', target: 'execution', type: SkillEdgeType.SUBSKILL_OF },

  // Project Management
  { source: 'project-management', target: 'engineering-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'prepared-planning', target: 'project-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'resource-allocation', target: 'project-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sprint-planning', target: 'project-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'release-planning', target: 'project-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'risk-management', target: 'project-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dependency-management', target: 'project-management', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'strategic-thinking', target: 'project-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'product-strategy-alignment', target: 'strategic-thinking', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'technical-strategy-alignment', target: 'strategic-thinking', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'roi-analysis', target: 'strategic-thinking', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'competitive-analysis', target: 'strategic-thinking', type: SkillEdgeType.SUBSKILL_OF },

  // Business Acumen
  { source: 'business-acumen', target: 'engineering-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'measurement', target: 'business-acumen', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kpi-definition', target: 'measurement', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'metrics-definition', target: 'measurement', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'quality-metrics', target: 'measurement', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'team-health-metrics', target: 'measurement', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'project-metrics', target: 'measurement', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'budget-planning', target: 'business-acumen', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'resource-forecasting', target: 'business-acumen', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cost-optimization', target: 'business-acumen', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'revenue-tracking', target: 'business-acumen', type: SkillEdgeType.SUBSKILL_OF },

  // Culture Building
  { source: 'culture-building', target: 'engineering-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'team-culture', target: 'culture-building', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'defining-enforcing-values', target: 'team-culture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'psychological-safety', target: 'team-culture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'team-traditions-rituals', target: 'team-culture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'recognition-programs', target: 'team-culture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bias-recognition-mitigation', target: 'team-culture', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'engineering-culture', target: 'culture-building', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'innovation-fostering', target: 'engineering-culture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'learning-culture-development', target: 'engineering-culture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'knowledge-sharing-practices', target: 'engineering-culture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'processes-fine-tuning', target: 'engineering-culture', type: SkillEdgeType.SUBSKILL_OF },

  // Company Culture
  { source: 'company-culture', target: 'culture-building', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'organization-structure', target: 'company-culture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'policy-navigation', target: 'company-culture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'organizational-awareness', target: 'company-culture', type: SkillEdgeType.SUBSKILL_OF },

  // Stakeholder Management
  { source: 'stakeholder-management', target: 'engineering-manager', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'partner-management', target: 'stakeholder-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vendor-relationships', target: 'partner-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vendor-partnerships', target: 'partner-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'integration-management', target: 'partner-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'api-etiquette', target: 'partner-management', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'documentation', target: 'stakeholder-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'architecture-documentation', target: 'documentation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'process-documentation', target: 'documentation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'process-documentation-learning', target: 'documentation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'lessons-learned', target: 'documentation', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'knowledge-management', target: 'stakeholder-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'knowledge-transfer', target: 'knowledge-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mentoring-programs', target: 'knowledge-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'knowledge-repository', target: 'knowledge-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'technical-tools', target: 'knowledge-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'brown-bags', target: 'knowledge-management', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'executive-communication', target: 'stakeholder-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'executive-alignment', target: 'executive-communication', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'strategic-proposals', target: 'executive-communication', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'budget-requests', target: 'executive-communication', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vision-alignment', target: 'executive-communication', type: SkillEdgeType.SUBSKILL_OF },

  // Customer Relations
  { source: 'customer-relations', target: 'engineering-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'customer-feedback-integration', target: 'customer-relations', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'customer-success-alignment', target: 'customer-relations', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'feature-prioritization', target: 'customer-relations', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'technical-partnerships', target: 'customer-relations', type: SkillEdgeType.SUBSKILL_OF },

  // Crisis Management
  { source: 'crisis-management', target: 'engineering-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'risk-mitigation', target: 'crisis-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'contingency-planning', target: 'crisis-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'disaster-recovery', target: 'crisis-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'incident-handling', target: 'crisis-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'security-incident-handling', target: 'crisis-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'production-issues-management', target: 'crisis-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'incident-response', target: 'crisis-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'near-misses-management', target: 'crisis-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'service-recovery', target: 'crisis-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'root-cause-analysis', target: 'crisis-management', type: SkillEdgeType.SUBSKILL_OF },

  // Change Management
  { source: 'change-management', target: 'engineering-manager', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'technical-change', target: 'change-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'legacy-system-retirement', target: 'technical-change', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'technology-adoption', target: 'technical-change', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'process-changes', target: 'technical-change', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'organizational-change', target: 'change-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'change-strategy', target: 'organizational-change', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'stakeholder-management-change', target: 'organizational-change', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'communication-change', target: 'organizational-change', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'resistance-management', target: 'organizational-change', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'teaming-change', target: 'change-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'skill-transitions', target: 'teaming-change', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'role-transitions', target: 'teaming-change', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'culture-evolution', target: 'teaming-change', type: SkillEdgeType.SUBSKILL_OF },

  // Keep Learning
  { source: 'keep-learning-em', target: 'engineering-manager', type: SkillEdgeType.SUBSKILL_OF },
];

interface RoadmapNode {
  slug: string;
  name: string;
  description: string;
  difficulty: any;
  sortOrder: number;
}

const ROADMAP_NODES: RoadmapNode[] = ROADMAP_NODES_DATA.map((node) => ({
  ...node,
  resources: buildNodeResources(node.name, node.slug, { sortOrder: node.sortOrder, nodeType: (node as any).type }),
})) as RoadmapNode[];

async function main() {
  console.log('Starting Engineering Manager roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'engineering-manager' },
    update: { name: 'Engineering Manager', description: 'Engineering Manager specialization' },
    create: {
      name: 'Engineering Manager',
      slug: 'engineering-manager',
      description: 'Engineering Manager specialization',
    },
  });
  console.log('✓ Category created/updated');

  // Insert all skills
  console.log(`Inserting ${ROADMAP_NODES.length} skills...`);
  for (const node of ROADMAP_NODES) {
    await prisma.skill.upsert({
      where: { slug: node.slug },
      update: {
        name: node.name,
        description: node.description,
        resources: (node as any).resources,
        difficulty: node.difficulty,
        categoryId: category.id,
      },
      create: {
        slug: node.slug,
        name: node.name,
        normalizedName: node.name.toLowerCase().replace(/\s+/g, '-'),
        description: node.description,
        resources: (node as any).resources,
        difficulty: node.difficulty,
        categoryId: category.id,
      },
    });
  }
  console.log(`✓ ${ROADMAP_NODES.length} skills inserted`);

  // Create or update roadmap
  const rootSkill = await prisma.skill.findUnique({
    where: { slug: 'engineering-manager' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'engineering-manager' },
    update: {
      name: 'Engineering Manager',
      description: 'Comprehensive Engineering Manager roadmap covering technical leadership, people management, execution, business acumen, culture building, stakeholder management, customer relations, crisis management, and change management',
      icon: '👔',
      color: '#3B82F6',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'Engineering Manager',
      slug: 'engineering-manager',
      description: 'Comprehensive Engineering Manager roadmap covering technical leadership, people management, execution, business acumen, culture building, stakeholder management, customer relations, crisis management, and change management',
      icon: '👔',
      color: '#3B82F6',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
  });
  console.log('✓ Roadmap created/updated');

  // Link all skills to this roadmap
  const allSkillSlugs = ROADMAP_NODES.map(n => n.slug);
  await prisma.skill.updateMany({
    where: { slug: { in: allSkillSlugs } },
    data: { roadmapId: roadmap.id },
  });
  console.log('✓ Skills linked to roadmap');

  // Delete old edges for clean re-seed
  const allSkills = await prisma.skill.findMany({
    where: { slug: { in: allSkillSlugs } },
    select: { id: true, slug: true },
  });
  const slugToId = new Map(allSkills.map(s => [s.slug, s.id]));
  const skillIds = allSkills.map(s => s.id);

  await prisma.skillEdge.deleteMany({
    where: {
      OR: [
        { sourceId: { in: skillIds } },
        { targetId: { in: skillIds } },
      ],
    },
  });
  console.log('✓ Old edges cleaned');

  // Insert edges
  console.log(`Inserting ${ROADMAP_EDGES_DATA.length} edges...`);
  for (const edge of ROADMAP_EDGES_DATA) {
    const sourceId = slugToId.get(edge.source);
    const targetId = slugToId.get(edge.target);

    if (sourceId && targetId) {
      await prisma.skillEdge.create({
        data: {
          sourceId,
          targetId,
          edgeType: edge.type,
          strength: 1.0,
          isStrict: false,
        },
      });
    }
  }
  console.log(`✓ ${ROADMAP_EDGES_DATA.length} edges inserted`);

  console.log('\n✓ Engineering Manager roadmap seeded successfully!');
  console.log(`  - ${ROADMAP_NODES.length} skills`);
  console.log(`  - ${ROADMAP_EDGES_DATA.length} edges`);
}

main()
  .catch((e) => {
    console.error('Error seeding roadmap:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


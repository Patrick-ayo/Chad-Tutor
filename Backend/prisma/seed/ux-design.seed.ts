/**
 * UX Design Roadmap Seed Script
 *
 * Seeds the UX Design development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/ux-design.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';
import { buildNodeResources } from './resources';

const prisma = new PrismaClient();

// UX Design Roadmap - Comprehensive Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'ux-design', name: 'UX Design', description: 'Complete UX Design roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 0 },

  // ==== FRAMEWORKS ====
  { slug: 'frameworks-ux', name: 'Frameworks', description: 'UX design frameworks and models', difficulty: Difficulty.INTERMEDIATE, sortOrder: 1 },
  { slug: 'bj-foggs-behavior-model', name: 'BJ Fogg\'s Behavior Model', description: 'Fogg\'s Behavior Model for behavior design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 2 },
  { slug: 'create-action-funnel', name: 'CREATE Action Funnel', description: 'CREATE action funnel framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 3 },
  { slug: 'spectrum-thinking-interventions', name: 'Spectrum of Thinking Interventions', description: 'Thinking intervention spectrum', difficulty: Difficulty.INTERMEDIATE, sortOrder: 4 },
  { slug: 'dual-process-theory', name: 'Dual Process Theory', description: 'Dual process cognitive theory', difficulty: Difficulty.ADVANCED, sortOrder: 5 },

  // ==== HUMAN DECISION MAKING ====
  { slug: 'human-decision-making', name: 'Human Decision Making', description: 'Understanding human decision making', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },

  // ==== SUBSCRIPTS TO LOOK FOR ====
  { slug: 'persuasive-technology', name: 'Persuasive Technology', description: 'Technology for persuasion', difficulty: Difficulty.ADVANCED, sortOrder: 7 },
  { slug: 'behavioral-science', name: 'Behavioral Science', description: 'Behavioral science principles', difficulty: Difficulty.ADVANCED, sortOrder: 8 },
  { slug: 'behavioral-economics', name: 'Behavioral Economics', description: 'Behavioral economics and user behavior', difficulty: Difficulty.ADVANCED, sortOrder: 9 },
  { slug: 'behavior-design', name: 'Behavior Design', description: 'Designing for behavior change', difficulty: Difficulty.ADVANCED, sortOrder: 10 },

  // ==== BEHAVIOR CHANGE STRATEGIES ====
  { slug: 'behavior-change-strategies', name: 'Behavior Change Strategies', description: 'Strategies for changing user behavior', difficulty: Difficulty.ADVANCED, sortOrder: 11 },
  { slug: 'defusing', name: 'Defusing', description: 'Defusing techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },
  { slug: 'making-it-happen', name: 'Making it Happen', description: 'Making behavior changes happen', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },
  { slug: 'cheating', name: 'Cheating', description: 'Cheating/shortcuts in behavior design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },

  // ==== EXISTING BEHAVIOR ====
  { slug: 'existing-behavior', name: 'Existing Behavior', description: 'Working with existing user behaviors', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },
  { slug: 'help-user-avoid-cost', name: 'Help user Avoid the Cost', description: 'Minimizing costs in user experience', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'replace-routine', name: 'Replace the Routine', description: 'Replacing existing user routines', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },
  { slug: 'use-consciousness-interface', name: 'Use Consciousness to Interface', description: 'Using conscious thought in interface design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'mindfulness-avoid-cue', name: 'Mindfulness to Avoid Acting on the Cue', description: 'Mindfulness techniques to control behavior', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'crowd-out-habit', name: 'Crowd Out Old Habit with New Behavior', description: 'Replacing old habits with new ones', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },

  // ==== NEW BEHAVIOR ====
  { slug: 'new-behavior', name: 'New Behavior', description: 'Creating new user behaviors', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'njf-eyes-model', name: 'NJF Eyes Model', description: 'Eyes model for new behavior', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },
  { slug: 'cue-routine-reward-model', name: 'Cue Routine Reward Model', description: 'Cue-routine-reward behavior model', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'create-product-backlog', name: 'Create Product Backlog', description: 'Creating product backlog for new features', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },

  // ==== USER STORIES ====
  { slug: 'user-stories-ux', name: 'User Stories', description: 'User story creation and management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'things-to-lookout', name: 'Things to lookout for', description: 'Important considerations for user stories', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },
  { slug: 'keep-short-simple', name: 'In generally, keep it short and simple', description: 'Simplicity in user story design', difficulty: Difficulty.BEGINNER, sortOrder: 27 },
  { slug: 'make-easy-understand-complete', name: 'Make it easy to understand and complete', description: 'Clarity and completion in design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },
  { slug: 'make-progress-visible', name: 'Make progress visible to user', description: 'Progress indicators and visibility', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'progress-meaningful-reward', name: 'Make progress meaningful to reward user', description: 'Reward systems and progress feedback', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'completion-clearly-visible', name: 'Make successful completion clearly visible', description: 'Clear completion states and feedback', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },

  // ==== DELIVERABLES ====
  { slug: 'deliverables-ux', name: 'Deliverables', description: 'UX design deliverables and artifacts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },
  { slug: 'customer-experience-map', name: 'Customer Experience Map by Mel Edwards', description: 'Customer experience mapping', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },
  { slug: 'simple-flowchart', name: 'Simple Flowchart', description: 'Simple flowchart creation', difficulty: Difficulty.BEGINNER, sortOrder: 34 },
  { slug: 'epc-model', name: 'Event-driven Process Chain Model (EPC)', description: 'EPC for process modeling', difficulty: Difficulty.ADVANCED, sortOrder: 35 },
  { slug: 'bpmn-model', name: 'Business Process Model & Notation (BPMN)', description: 'BPMN for business process design', difficulty: Difficulty.ADVANCED, sortOrder: 36 },

  // ==== GETTING USERS ATTENTION ====
  { slug: 'getting-users-attention', name: 'Getting Users Attention', description: 'Techniques to capture user attention', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },
  { slug: 'tell-user-action-ask', name: 'Tell User what the Action is and ask for it', description: 'Clear action statements', difficulty: Difficulty.BEGINNER, sortOrder: 38 },
  { slug: 'clear-page-distractions', name: 'Clear the Page of Distractions', description: 'Minimizing distractions in design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'color-where-to-act', name: 'Make it Color, Where to Act', description: 'Color use for action indication', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'positive-incentive-reaction', name: 'Getting Positive Incentive Reaction', description: 'Creating positive incentive design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'ui-professional-beautiful', name: 'Make UI Professional and Beautiful', description: 'Professional and aesthetic UI design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },
  { slug: 'deploy-authority', name: 'Deploy Strong Authority on Subject', description: 'Establishing authority in design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },
  { slug: 'authentic-personal', name: 'Be Authentic and Personal', description: 'Authenticity and personalization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },
  { slug: 'deploy-social-proof', name: 'Deploy Social Proof', description: 'Using social proof in design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },

  // ==== COPING WITH LOSSES ====
  { slug: 'coping-losses', name: 'Coping with Losses', description: 'Handling loss aversion in design', difficulty: Difficulty.ADVANCED, sortOrder: 46 },
  { slug: 'favorable-conscientious-evaluation', name: 'Get a favorable Conscientious Evaluation', description: 'Creating favorable evaluations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 47 },
  { slug: 'prime-user-relevant-associations', name: 'Prime User-Relevant Associations', description: 'Priming relevant associations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  { slug: 'avoid-direct-payments', name: 'Avoid Direct Payments', description: 'Payment design strategies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'avoid-choice-overload', name: 'Avoid Choice Overload', description: 'Reducing choice complexity', difficulty: Difficulty.INTERMEDIATE, sortOrder: 50 },
  { slug: 'avoid-cognitive-overload', name: 'Avoid Cognitive Overload', description: 'Cognitive load management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 51 },
  { slug: 'leverage-loss-aversion', name: 'Leverage Loss Aversion', description: 'Using loss aversion strategically', difficulty: Difficulty.ADVANCED, sortOrder: 52 },
  { slug: 'use-peer-comparisons', name: 'Use Peer Comparisons', description: 'Social comparison strategies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },
  { slug: 'use-competition', name: 'Use Competition', description: 'Competitive elements in design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 54 },

  // ==== GETTING URGENCY TO ACT NOW ====
  { slug: 'getting-urgency-act', name: 'Getting Urgency to Act Now', description: 'Creating sense of urgency', difficulty: Difficulty.INTERMEDIATE, sortOrder: 55 },
  { slug: 'frame-text-avoid-temporal-myopia', name: 'Frame Text to Avoid Temporal Myopia', description: 'Time framing strategies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 56 },
  { slug: 'remind-prior-commitment', name: 'Remind of Prior Commitment to Act', description: 'Commitment reminders', difficulty: Difficulty.INTERMEDIATE, sortOrder: 57 },
  { slug: 'make-commitment-friends', name: 'Make Commitment to Friends', description: 'Social commitment design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 58 },
  { slug: 'make-reward-scarce', name: 'Make Reward Scarce', description: 'Scarcity in reward design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 59 },

  // ==== CONCEPTUAL DESIGN ====
  { slug: 'conceptual-design', name: 'Conceptual Design', description: 'Conceptual design phase', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },
  { slug: 'figma', name: 'Figma', description: 'Figma design tool', difficulty: Difficulty.BEGINNER, sortOrder: 61 },
  { slug: 'adobe-xd', name: 'Adobe XD', description: 'Adobe XD design tool', difficulty: Difficulty.BEGINNER, sortOrder: 62 },
  { slug: 'sketch', name: 'Sketch', description: 'Sketch design tool', difficulty: Difficulty.BEGINNER, sortOrder: 63 },
  { slug: 'balsamiq', name: 'Balsamiq', description: 'Balsamiq wireframing tool', difficulty: Difficulty.BEGINNER, sortOrder: 64 },
  { slug: 'wireframing', name: 'Wireframing', description: 'Wireframing techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 65 },
  { slug: 'good-layout-rules', name: 'Good Layout Rules', description: 'Layout design principles', difficulty: Difficulty.INTERMEDIATE, sortOrder: 66 },

  // ==== UNDERSTANDING THE PRODUCT ====
  { slug: 'understanding-product', name: 'Understanding the Product', description: 'Product understanding for design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 67 },
  { slug: 'business-model', name: 'Business Model', description: 'Business model understanding', difficulty: Difficulty.INTERMEDIATE, sortOrder: 68 },
  { slug: 'existing-business-model', name: 'Existing Business Model', description: 'Understanding existing models', difficulty: Difficulty.INTERMEDIATE, sortOrder: 69 },
  { slug: 'business-model-canvas', name: 'Business Model Canvas', description: 'BMC framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 70 },
  { slug: 'lean-canvas', name: 'Lean Canvas', description: 'Lean canvas methodology', difficulty: Difficulty.INTERMEDIATE, sortOrder: 71 },
  { slug: 'new-business-model', name: 'New Business Model', description: 'Creating new business models', difficulty: Difficulty.ADVANCED, sortOrder: 72 },
  { slug: 'business-model-inceptor', name: 'Business Model Inceptor', description: 'Business model ideation', difficulty: Difficulty.ADVANCED, sortOrder: 73 },
  { slug: 'competitor-analysis', name: 'Competitor Analysis', description: 'Analyzing competitors', difficulty: Difficulty.INTERMEDIATE, sortOrder: 74 },
  { slug: 'five-forces-model', name: 'Five Forces Model', description: 'Porter\'s Five Forces analysis', difficulty: Difficulty.ADVANCED, sortOrder: 75 },
  { slug: 'swot-analysis', name: 'SWOT Analysis', description: 'SWOT analysis framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 76 },

  // ==== PROTOTYPING ====
  { slug: 'prototyping-ux', name: 'Prototyping', description: 'Prototyping techniques and tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 77 },
  { slug: 'when-attention-fleeting-scarce', name: 'When attention is fleeting and scarce', description: 'Designing for attention scarcity', difficulty: Difficulty.INTERMEDIATE, sortOrder: 78 },
  { slug: 'call-to-action-proto', name: 'Call to Action', description: 'CTA design in prototypes', difficulty: Difficulty.INTERMEDIATE, sortOrder: 79 },
  { slug: 'how-to-tips', name: 'How-To-Tips', description: 'How-to content and tips', difficulty: Difficulty.BEGINNER, sortOrder: 80 },
  { slug: 'status-reports', name: 'Status Reports', description: 'Status and progress reporting', difficulty: Difficulty.BEGINNER, sortOrder: 81 },
  { slug: 'reminders-planning-prompt', name: 'Reminders & Planning Prompt', description: 'Reminders and planning features', difficulty: Difficulty.INTERMEDIATE, sortOrder: 82 },

  // ==== UX PATTERNS ====
  { slug: 'ux-patterns', name: 'UX Patterns', description: 'Common UX design patterns', difficulty: Difficulty.INTERMEDIATE, sortOrder: 83 },
  { slug: 'behavior-change-games', name: 'Behavior Change Games', description: 'Gamification for behavior change', difficulty: Difficulty.INTERMEDIATE, sortOrder: 84 },
  { slug: 'decision-making-support', name: 'Decision Making Support', description: 'Supporting user decisions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 85 },
  { slug: 'gamification', name: 'Gamification', description: 'Gamification elements and mechanics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 86 },
  { slug: 'goal-trackers', name: 'Goal Trackers', description: 'Goal tracking features', difficulty: Difficulty.BEGINNER, sortOrder: 87 },
  { slug: 'reminders-pattern', name: 'Reminders', description: 'Reminder patterns and design', difficulty: Difficulty.BEGINNER, sortOrder: 88 },
  { slug: 'social-sharing', name: 'Social Sharing', description: 'Social sharing features', difficulty: Difficulty.INTERMEDIATE, sortOrder: 89 },
  { slug: 'tutorials-pattern', name: 'Tutorials', description: 'Tutorial and onboarding patterns', difficulty: Difficulty.BEGINNER, sortOrder: 90 },
  { slug: 'planners-pattern', name: 'Planners', description: 'Planning and scheduling patterns', difficulty: Difficulty.INTERMEDIATE, sortOrder: 91 },

  // ==== MEASURING THE IMPACT ====
  { slug: 'measuring-impact', name: 'Measuring the Impact', description: 'Measuring UX design impact', difficulty: Difficulty.ADVANCED, sortOrder: 92 },
  { slug: 'testing-measuring', name: 'Testing', description: 'Testing methodologies', difficulty: Difficulty.ADVANCED, sortOrder: 93 },
  { slug: 'multivariate-testing', name: 'Multivariate Testing', description: 'Multivariate A/B testing', difficulty: Difficulty.ADVANCED, sortOrder: 94 },
  { slug: 'incremental-ab-testing', name: 'Incremental A/B Testing', description: 'Incremental A/B testing approaches', difficulty: Difficulty.ADVANCED, sortOrder: 95 },

  // ==== MAKE SURE USERS CAN DO IT EASILY ====
  { slug: 'make-sure-users-easily', name: 'Make sure Users can do it Easily', description: 'Ease and simplicity in UX', difficulty: Difficulty.INTERMEDIATE, sortOrder: 96 },
  { slug: 'elicit-implementation-intentions', name: 'Elicit Implementation Intentions', description: 'Implementation intention design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 97 },
  { slug: 'default-everything', name: 'Default Everything', description: 'Smart defaults in design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 98 },
  { slug: 'lessen-burden-action-info', name: 'Lessen the Burden of Action / Info', description: 'Reducing action burden', difficulty: Difficulty.INTERMEDIATE, sortOrder: 99 },
  { slug: 'deploy-peer-comparisons-pattern', name: 'Deploy Peer Comparisons', description: 'Peer comparison patterns', difficulty: Difficulty.INTERMEDIATE, sortOrder: 100 },
];

const ROADMAP_EDGES_DATA = [
  // Frameworks
  { source: 'frameworks-ux', target: 'ux-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bj-foggs-behavior-model', target: 'frameworks-ux', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'create-action-funnel', target: 'frameworks-ux', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'spectrum-thinking-interventions', target: 'frameworks-ux', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dual-process-theory', target: 'frameworks-ux', type: SkillEdgeType.SUBSKILL_OF },

  // Human Decision Making
  { source: 'human-decision-making', target: 'ux-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'persuasive-technology', target: 'human-decision-making', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'behavioral-science', target: 'human-decision-making', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'behavioral-economics', target: 'human-decision-making', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'behavior-design', target: 'human-decision-making', type: SkillEdgeType.SUBSKILL_OF },

  // Behavior Change Strategies
  { source: 'behavior-change-strategies', target: 'human-decision-making', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'defusing', target: 'behavior-change-strategies', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'making-it-happen', target: 'behavior-change-strategies', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cheating', target: 'behavior-change-strategies', type: SkillEdgeType.SUBSKILL_OF },

  // Existing Behavior
  { source: 'existing-behavior', target: 'behavior-change-strategies', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'help-user-avoid-cost', target: 'existing-behavior', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'replace-routine', target: 'existing-behavior', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'use-consciousness-interface', target: 'existing-behavior', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mindfulness-avoid-cue', target: 'existing-behavior', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'crowd-out-habit', target: 'existing-behavior', type: SkillEdgeType.SUBSKILL_OF },

  // New Behavior
  { source: 'new-behavior', target: 'behavior-change-strategies', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'njf-eyes-model', target: 'new-behavior', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cue-routine-reward-model', target: 'new-behavior', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'create-product-backlog', target: 'new-behavior', type: SkillEdgeType.SUBSKILL_OF },

  // User Stories
  { source: 'user-stories-ux', target: 'ux-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'things-to-lookout', target: 'user-stories-ux', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'keep-short-simple', target: 'user-stories-ux', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'make-easy-understand-complete', target: 'user-stories-ux', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'make-progress-visible', target: 'user-stories-ux', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'progress-meaningful-reward', target: 'user-stories-ux', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'completion-clearly-visible', target: 'user-stories-ux', type: SkillEdgeType.SUBSKILL_OF },

  // Deliverables
  { source: 'deliverables-ux', target: 'ux-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'customer-experience-map', target: 'deliverables-ux', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'simple-flowchart', target: 'deliverables-ux', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'epc-model', target: 'deliverables-ux', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bpmn-model', target: 'deliverables-ux', type: SkillEdgeType.SUBSKILL_OF },

  // Getting Users Attention
  { source: 'getting-users-attention', target: 'ux-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tell-user-action-ask', target: 'getting-users-attention', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'clear-page-distractions', target: 'getting-users-attention', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'color-where-to-act', target: 'getting-users-attention', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'positive-incentive-reaction', target: 'getting-users-attention', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ui-professional-beautiful', target: 'getting-users-attention', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'deploy-authority', target: 'getting-users-attention', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'authentic-personal', target: 'getting-users-attention', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'deploy-social-proof', target: 'getting-users-attention', type: SkillEdgeType.SUBSKILL_OF },

  // Coping with Losses
  { source: 'coping-losses', target: 'ux-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'favorable-conscientious-evaluation', target: 'coping-losses', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'prime-user-relevant-associations', target: 'coping-losses', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'avoid-direct-payments', target: 'coping-losses', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'avoid-choice-overload', target: 'coping-losses', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'avoid-cognitive-overload', target: 'coping-losses', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'leverage-loss-aversion', target: 'coping-losses', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'use-peer-comparisons', target: 'coping-losses', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'use-competition', target: 'coping-losses', type: SkillEdgeType.SUBSKILL_OF },

  // Getting Urgency to Act Now
  { source: 'getting-urgency-act', target: 'ux-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'frame-text-avoid-temporal-myopia', target: 'getting-urgency-act', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'remind-prior-commitment', target: 'getting-urgency-act', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'make-commitment-friends', target: 'getting-urgency-act', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'make-reward-scarce', target: 'getting-urgency-act', type: SkillEdgeType.SUBSKILL_OF },

  // Conceptual Design
  { source: 'conceptual-design', target: 'ux-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'figma', target: 'conceptual-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'adobe-xd', target: 'conceptual-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sketch', target: 'conceptual-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'balsamiq', target: 'conceptual-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'wireframing', target: 'conceptual-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'good-layout-rules', target: 'conceptual-design', type: SkillEdgeType.SUBSKILL_OF },

  // Understanding the Product
  { source: 'understanding-product', target: 'ux-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'business-model', target: 'understanding-product', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'existing-business-model', target: 'business-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'business-model-canvas', target: 'business-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'lean-canvas', target: 'business-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'new-business-model', target: 'business-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'business-model-inceptor', target: 'new-business-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'competitor-analysis', target: 'understanding-product', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'five-forces-model', target: 'competitor-analysis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'swot-analysis', target: 'competitor-analysis', type: SkillEdgeType.SUBSKILL_OF },

  // Prototyping
  { source: 'prototyping-ux', target: 'ux-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'when-attention-fleeting-scarce', target: 'prototyping-ux', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'call-to-action-proto', target: 'when-attention-fleeting-scarce', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'how-to-tips', target: 'when-attention-fleeting-scarce', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'status-reports', target: 'when-attention-fleeting-scarce', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'reminders-planning-prompt', target: 'when-attention-fleeting-scarce', type: SkillEdgeType.SUBSKILL_OF },

  // UX Patterns
  { source: 'ux-patterns', target: 'prototyping-ux', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'behavior-change-games', target: 'ux-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'decision-making-support', target: 'ux-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gamification', target: 'ux-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'goal-trackers', target: 'ux-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'reminders-pattern', target: 'ux-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'social-sharing', target: 'ux-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tutorials-pattern', target: 'ux-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'planners-pattern', target: 'ux-patterns', type: SkillEdgeType.SUBSKILL_OF },

  // Measuring the Impact
  { source: 'measuring-impact', target: 'ux-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'testing-measuring', target: 'measuring-impact', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'multivariate-testing', target: 'testing-measuring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'incremental-ab-testing', target: 'testing-measuring', type: SkillEdgeType.SUBSKILL_OF },

  // Make sure Users can do it Easily
  { source: 'make-sure-users-easily', target: 'ux-design', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'elicit-implementation-intentions', target: 'make-sure-users-easily', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'default-everything', target: 'make-sure-users-easily', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'lessen-burden-action-info', target: 'make-sure-users-easily', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'deploy-peer-comparisons-pattern', target: 'make-sure-users-easily', type: SkillEdgeType.SUBSKILL_OF },
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
  console.log('Starting UX Design roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'ux-design-cat' },
    update: { name: 'UX Design', description: 'UX Design specialization' },
    create: {
      name: 'UX Design',
      slug: 'ux-design-cat',
      description: 'UX Design specialization',
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
    where: { slug: 'ux-design' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'ux-design-cat' },
    update: {
      name: 'UX Design',
      description: 'Comprehensive UX Design roadmap covering behavioral design frameworks, human decision making, behavior change strategies, user attention and conversion, loss aversion, urgency tactics, conceptual design, prototyping, UX patterns, user testing, and design tools',
      icon: '🎨',
      color: '#EC4899',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'UX Design',
      slug: 'ux-design-cat',
      description: 'Comprehensive UX Design roadmap covering behavioral design frameworks, human decision making, behavior change strategies, user attention and conversion, loss aversion, urgency tactics, conceptual design, prototyping, UX patterns, user testing, and design tools',
      icon: '🎨',
      color: '#EC4899',
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

  console.log('\n✓ UX Design roadmap seeded successfully!');
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


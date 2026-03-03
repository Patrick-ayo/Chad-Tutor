/**
 * DevRel Roadmap Seed Script
 *
 * Seeds the Developer Relations development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/devrel.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// DevRel Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'devrel', name: 'DevRel', description: 'Complete Developer Relations roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 0 },

  // ==== HISTORY AND EVOLUTION ====
  { slug: 'history-evolution', name: 'History and Evolution', description: 'History of Developer Relations', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
  { slug: 'importance-devrel', name: 'Importance of DevRel', description: 'Why Developer Relations matters', difficulty: Difficulty.BEGINNER, sortOrder: 2 },

  // ==== WHAT IS A DEVREL ====
  { slug: 'what-is-devrel', name: 'What is a DevRel?', description: 'Developer Relations role definition', difficulty: Difficulty.BEGINNER, sortOrder: 3 },
  { slug: 'developer-experience', name: 'Developer Experience', description: 'Developer experience concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 4 },
  { slug: 'developer-journey', name: 'Developer Journey', description: 'Understanding developer journey', difficulty: Difficulty.INTERMEDIATE, sortOrder: 5 },
  { slug: 'developer-marketing', name: 'Developer Marketing', description: 'Marketing to developers', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },

  // ==== KEY CONCEPTS ====
  { slug: 'key-concepts-devrel', name: 'Key Concepts', description: 'Core DevRel concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 7 },
  { slug: 'leadership', name: 'Leadership', description: 'Leadership in DevRel', difficulty: Difficulty.INTERMEDIATE, sortOrder: 8 },
  { slug: 'mentorship', name: 'Mentorship', description: 'Mentoring developers', difficulty: Difficulty.INTERMEDIATE, sortOrder: 9 },
  { slug: 'python-devrel', name: 'Python', description: 'Python programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 10 },
  { slug: 'basic-programming-devrel', name: 'Basic Programming Skills', description: 'Programming fundamentals', difficulty: Difficulty.BEGINNER, sortOrder: 11 },

  // ==== TECHNICAL SKILLS ====
  { slug: 'technical-skills-devrel', name: 'Technical Skills', description: 'Technical competencies for DevRel', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },
  { slug: 'dba-skills', name: 'DBA', description: 'Database administration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },
  { slug: 'apis-integrations', name: 'APIs/Integrations', description: 'Working with APIs and integrations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },
  { slug: 'vr-code', name: 'VR Code', description: 'Version control and code basics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },
  { slug: 'managing-dimensions', name: 'Managing Dimensions', description: 'Dimensional data management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'tickets-pull-requests', name: 'Tickets & Pull Requests', description: 'Issue tracking and PRs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },
  { slug: 'labeling-closures', name: 'Labeling and Closures', description: 'Code organization and closures', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'milestones-releases', name: 'Milestones & Releases', description: 'Release management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'public-blogging', name: 'Public Blogging', description: 'Writing for public audience', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },
  { slug: 'git-github', name: 'Git / GitHub', description: 'Git version control and GitHub', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'version-control-devrel', name: 'Version Control', description: 'Version control systems', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },

  // ==== COMMUNICATION SKILLS ====
  { slug: 'communication-skills', name: 'Communication Skills', description: 'Essential communication skills', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'public-speaking', name: 'Public Speaking', description: 'Speaking publicly', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },
  { slug: 'writing-skills', name: 'Writing Skills', description: 'Technical writing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'presentation-techniques', name: 'Presentation Techniques', description: 'Presentation best practices', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },
  { slug: 'rules-of-thumb', name: 'Rules of Thumb', description: 'Communication principles', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },
  { slug: 'storytelling', name: 'Storytelling', description: 'Storytelling techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },
  { slug: 'data-visualizing', name: 'Data Visualizing', description: 'Data visualization skills', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'engaging-audience', name: 'Engaging Audience', description: 'Audience engagement techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'the-hook', name: 'The Hook', description: 'Catching attention techniques', difficulty: Difficulty.BEGINNER, sortOrder: 31 },
  { slug: 'complied-principle', name: 'Complied Principle', description: 'Communication principles', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },
  { slug: 'repetition-reinforcement', name: 'Repetition & Reinforcement', description: 'Message reinforcement', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },
  { slug: 'handling-qa', name: 'Handling Q&A', description: 'Managing questions and answers', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },
  { slug: 'active-listening', name: 'Active Listening', description: 'Listening skills', difficulty: Difficulty.BEGINNER, sortOrder: 35 },
  { slug: 'anticipate-questions', name: 'Anticipate Questions', description: 'Predicting audience questions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },
  { slug: 'be-concise', name: 'Be Concise', description: 'Clear and concise communication', difficulty: Difficulty.BEGINNER, sortOrder: 37 },
  { slug: 'managing-difficult-questions', name: 'Managing Difficult Questions', description: 'Handling tough questions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 38 },

  // ==== COMMUNITY ENGAGEMENT ====
  { slug: 'community-engagement', name: 'Community Engagement', description: 'Engaging with communities', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'online-communities', name: 'Online Communities', description: 'Virtual community participation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'event-participation', name: 'Event Participation', description: 'Participating in events', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'blog-posts', name: 'Blog Posts', description: 'Writing blog content', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },

  // ==== SOCIAL MEDIA ====
  { slug: 'social-media-devrel', name: 'Social Media', description: 'Social media strategies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },

  // ==== TECHNICAL DOCUMENTATION ====
  { slug: 'technical-documentation', name: 'Technical Documentation', description: 'Writing technical docs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },

  // ==== APIS & SDKS ====
  { slug: 'apis-sdks', name: 'APIs & SDKs', description: 'API and SDK development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },
  { slug: 'understanding-apis', name: 'Understanding APIs', description: 'API fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'building-sdks', name: 'Building SDKs', description: 'SDK development', difficulty: Difficulty.ADVANCED, sortOrder: 47 },
  { slug: 'writing-documentation-api', name: 'Writing Documentation', description: 'API documentation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  { slug: 'api-design', name: 'API Design', description: 'Designing good APIs', difficulty: Difficulty.ADVANCED, sortOrder: 49 },

  // ==== COMMUNITY BUILDING ====
  { slug: 'community-building', name: 'Community Building', description: 'Building developer communities', difficulty: Difficulty.ADVANCED, sortOrder: 50 },
  { slug: 'building-community', name: 'Building a Community', description: 'Creating community', difficulty: Difficulty.ADVANCED, sortOrder: 51 },
  { slug: 'feedback-collection', name: 'Feedback Collection', description: 'Gathering feedback', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'surveys', name: 'Surveys', description: 'Survey creation and analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },
  { slug: 'community-communication', name: 'Community Communication', description: 'Community messaging', difficulty: Difficulty.INTERMEDIATE, sortOrder: 54 },
  { slug: 'community-execution', name: 'Execution', description: 'Implementing community plans', difficulty: Difficulty.INTERMEDIATE, sortOrder: 55 },
  { slug: 'community-promotion', name: 'Promotion', description: 'Promoting community activities', difficulty: Difficulty.INTERMEDIATE, sortOrder: 56 },
  { slug: 'community-planning', name: 'Planning', description: 'Community event planning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 57 },
  { slug: 'event-management', name: 'Event Management', description: 'Managing developer events', difficulty: Difficulty.INTERMEDIATE, sortOrder: 58 },

  // ==== VIDEO PRODUCTION ====
  { slug: 'video-production', name: 'Video Production', description: 'Creating videos', difficulty: Difficulty.INTERMEDIATE, sortOrder: 59 },
  { slug: 'animations-graphics', name: 'Animations & Graphics', description: 'Video animations and graphics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },
  { slug: 'editing', name: 'Editing', description: 'Video editing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 61 },
  { slug: 'recording', name: 'Recording', description: 'Recording video content', difficulty: Difficulty.BEGINNER, sortOrder: 62 },
  { slug: 'technical-setup-video', name: 'Technical Setup', description: 'Video equipment setup', difficulty: Difficulty.INTERMEDIATE, sortOrder: 63 },
  { slug: 'audio-video', name: 'Audio', description: 'Audio production', difficulty: Difficulty.INTERMEDIATE, sortOrder: 64 },
  { slug: 'animations-graphics-video', name: 'Animations & Graphics', description: 'Advanced animations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 65 },
  { slug: 'video-tool-selection', name: 'Video Tool Selection', description: 'Choosing video tools', difficulty: Difficulty.BEGINNER, sortOrder: 66 },
  { slug: 'twitch-youtube', name: 'Twitch / YouTube', description: 'Streaming platforms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 67 },
  { slug: 'live-streaming', name: 'Live Streaming', description: 'Live streaming content', difficulty: Difficulty.INTERMEDIATE, sortOrder: 68 },

  // ==== CONTENT CREATION ====
  { slug: 'content-creation', name: 'Content Creation', description: 'Creating developer content', difficulty: Difficulty.INTERMEDIATE, sortOrder: 69 },
  { slug: 'tutorials', name: 'Tutorials', description: 'Writing tutorials', difficulty: Difficulty.INTERMEDIATE, sortOrder: 70 },
  { slug: 'api-references', name: 'API References', description: 'API reference documentation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 71 },
  { slug: 'blogs', name: 'Blogs', description: 'Blog content creation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 72 },
  { slug: 'user-guides', name: 'User Guides', description: 'Writing user guides', difficulty: Difficulty.INTERMEDIATE, sortOrder: 73 },
  { slug: 'code-samples', name: 'Code Samples', description: 'Creating code examples', difficulty: Difficulty.INTERMEDIATE, sortOrder: 74 },
  { slug: 'example-apps', name: 'Example Apps', description: 'Building example applications', difficulty: Difficulty.INTERMEDIATE, sortOrder: 75 },
  { slug: 'use-case-builder', name: 'Use Case Builder', description: 'Creating use case documentation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 76 },

  // ==== DEVELOPER ONBOARDING ====
  { slug: 'developer-onboarding', name: 'Developer Onboarding', description: 'Onboarding new developers', difficulty: Difficulty.INTERMEDIATE, sortOrder: 77 },
  { slug: 'onboarding-documentation', name: 'Documentation', description: 'Onboarding documentation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 78 },
  { slug: 'onboarding-social-media', name: 'Social Media', description: 'Onboarding via social media', difficulty: Difficulty.INTERMEDIATE, sortOrder: 79 },
  { slug: 'example-project-onboarding', name: 'Example Projects', description: 'Example projects for learning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 80 },
  { slug: 'consistent-posting', name: 'Consistent Posting', description: 'Regular content publishing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 81 },
  { slug: 'content-strategy', name: 'Content Strategy', description: 'Strategic content planning', difficulty: Difficulty.ADVANCED, sortOrder: 82 },
  { slug: 'analytics-optimization', name: 'Analysis and Optimization', description: 'Content analysis and optimization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 83 },
  { slug: 'tracking-engagement', name: 'Tracking Engagement', description: 'Measuring engagement metrics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 84 },
  { slug: 'data-driven-shift', name: 'Data-Driven Strategy Shift', description: 'Using data to adjust strategy', difficulty: Difficulty.ADVANCED, sortOrder: 85 },
  { slug: 'platform-analytics', name: 'Platform Specific Analytics', description: 'Platform analytics tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 86 },
  { slug: 'social-analytics', name: 'Social Media Analytics', description: 'Social media metrics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 87 },
  { slug: 'google-analytics', name: 'Google Analytics', description: 'Web analytics with Google Analytics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 88 },

  // ==== SUPPORT ====
  { slug: 'support-devrel', name: 'Support', description: 'Developer support', difficulty: Difficulty.INTERMEDIATE, sortOrder: 89 },
  { slug: 'issue-tracking', name: 'Issue Tracking', description: 'Issue tracking systems', difficulty: Difficulty.INTERMEDIATE, sortOrder: 90 },
  { slug: 'faqs', name: 'FAQs', description: 'Frequently asked questions', difficulty: Difficulty.BEGINNER, sortOrder: 91 },
  { slug: 'office-hours', name: 'Office Hours', description: 'Holding office hours', difficulty: Difficulty.INTERMEDIATE, sortOrder: 92 },
  { slug: 'webinars', name: 'Webinars', description: 'Hosting webinars', difficulty: Difficulty.INTERMEDIATE, sortOrder: 93 },
  { slug: 'live-support', name: 'Live Support', description: 'Live developer support', difficulty: Difficulty.INTERMEDIATE, sortOrder: 94 },

  // ==== REPORTING ====
  { slug: 'reporting-devrel', name: 'Reporting', description: 'DevRel reporting and metrics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 95 },
  { slug: 'regular-reports', name: 'Regular Reports', description: 'Regular reporting cadence', difficulty: Difficulty.INTERMEDIATE, sortOrder: 96 },
  { slug: 'regular-data', name: 'Regular Data', description: 'Data collection and tracking', difficulty: Difficulty.INTERMEDIATE, sortOrder: 97 },
  { slug: 'insights-recommendations', name: 'Insights & Recommendations', description: 'Data insights and recommendations', difficulty: Difficulty.ADVANCED, sortOrder: 98 },
  { slug: 'headline-metrics', name: 'Headline', description: 'Key headline metrics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 99 },

  // ==== METRICS & ANALYTICS ====
  { slug: 'metrics-analytics', name: 'Metrics & Analytics', description: 'DevRel metrics and analysis', difficulty: Difficulty.ADVANCED, sortOrder: 100 },
  { slug: 'key-metrics', name: 'Key Metrics', description: 'Important DevRel metrics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 101 },

  // ==== CAREER DEVELOPMENT ====
  { slug: 'career-development', name: 'Career Development', description: 'Growing your DevRel career', difficulty: Difficulty.INTERMEDIATE, sortOrder: 102 },
  { slug: 'thought-leadership', name: 'Thought Leadership', description: 'Building thought leadership', difficulty: Difficulty.ADVANCED, sortOrder: 103 },
  { slug: 'publishing', name: 'Publishing', description: 'Publishing content and ideas', difficulty: Difficulty.INTERMEDIATE, sortOrder: 104 },
  { slug: 'media-appearances', name: 'Media Appearances', description: 'Appearing in media', difficulty: Difficulty.INTERMEDIATE, sortOrder: 105 },
  { slug: 'conference-speaking', name: 'Conference Speaking', description: 'Speaking at conferences', difficulty: Difficulty.INTERMEDIATE, sortOrder: 106 },

  // ==== KEY RESPONSIBILITIES ====
  { slug: 'key-responsibilities', name: 'Key Responsibilities', description: 'Core DevRel responsibilities', difficulty: Difficulty.INTERMEDIATE, sortOrder: 107 },
  { slug: 'advocacy', name: 'Advocacy', description: 'Developer advocacy', difficulty: Difficulty.INTERMEDIATE, sortOrder: 108 },
  { slug: 'education', name: 'Education', description: 'Educating developers', difficulty: Difficulty.INTERMEDIATE, sortOrder: 109 },
  { slug: 'constant-creation', name: 'Content Creation', description: 'Creating content constantly', difficulty: Difficulty.INTERMEDIATE, sortOrder: 110 },
  { slug: 'feedback-loop', name: 'Feedback Loop', description: 'Feedback mechanisms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 111 },

  // ==== KEEP LEARNING ====
  { slug: 'keep-learning-devrel', name: 'Keep Learning', description: 'Continuous learning in DevRel', difficulty: Difficulty.BEGINNER, sortOrder: 112 },
];

const ROADMAP_EDGES_DATA = [
  // History and Evolution
  { source: 'history-evolution', target: 'devrel', type: SkillEdgeType.PREREQUISITE },
  { source: 'importance-devrel', target: 'devrel', type: SkillEdgeType.PREREQUISITE },

  // What is DevRel
  { source: 'what-is-devrel', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'developer-experience', target: 'what-is-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'developer-journey', target: 'what-is-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'developer-marketing', target: 'what-is-devrel', type: SkillEdgeType.SUBSKILL_OF },

  // Key Concepts
  { source: 'key-concepts-devrel', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'leadership', target: 'key-concepts-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mentorship', target: 'key-concepts-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'python-devrel', target: 'key-concepts-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'basic-programming-devrel', target: 'key-concepts-devrel', type: SkillEdgeType.SUBSKILL_OF },

  // Technical Skills
  { source: 'technical-skills-devrel', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dba-skills', target: 'technical-skills-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'apis-integrations', target: 'technical-skills-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vr-code', target: 'technical-skills-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'managing-dimensions', target: 'technical-skills-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tickets-pull-requests', target: 'technical-skills-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'labeling-closures', target: 'technical-skills-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'milestones-releases', target: 'technical-skills-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'public-blogging', target: 'technical-skills-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'git-github', target: 'technical-skills-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'version-control-devrel', target: 'technical-skills-devrel', type: SkillEdgeType.SUBSKILL_OF },

  // Communication Skills
  { source: 'communication-skills', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'public-speaking', target: 'communication-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'writing-skills', target: 'communication-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'presentation-techniques', target: 'communication-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rules-of-thumb', target: 'communication-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'storytelling', target: 'communication-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-visualizing', target: 'communication-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'engaging-audience', target: 'communication-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'the-hook', target: 'engaging-audience', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'complied-principle', target: 'communication-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'repetition-reinforcement', target: 'communication-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'handling-qa', target: 'communication-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'active-listening', target: 'communication-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'anticipate-questions', target: 'handling-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'be-concise', target: 'communication-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'managing-difficult-questions', target: 'handling-qa', type: SkillEdgeType.SUBSKILL_OF },

  // Community Engagement
  { source: 'community-engagement', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'online-communities', target: 'community-engagement', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'event-participation', target: 'community-engagement', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'blog-posts', target: 'community-engagement', type: SkillEdgeType.SUBSKILL_OF },

  // Social Media
  { source: 'social-media-devrel', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },

  // Technical Documentation
  { source: 'technical-documentation', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },

  // APIs & SDKs
  { source: 'apis-sdks', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'understanding-apis', target: 'apis-sdks', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'building-sdks', target: 'apis-sdks', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'writing-documentation-api', target: 'apis-sdks', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'api-design', target: 'apis-sdks', type: SkillEdgeType.SUBSKILL_OF },

  // Community Building
  { source: 'community-building', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'building-community', target: 'community-building', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'feedback-collection', target: 'building-community', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'surveys', target: 'feedback-collection', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'community-communication', target: 'building-community', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'community-execution', target: 'building-community', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'community-promotion', target: 'building-community', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'community-planning', target: 'building-community', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'event-management', target: 'community-planning', type: SkillEdgeType.SUBSKILL_OF },

  // Video Production
  { source: 'video-production', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'animations-graphics', target: 'video-production', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'editing', target: 'video-production', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'recording', target: 'video-production', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'technical-setup-video', target: 'video-production', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'audio-video', target: 'video-production', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'animations-graphics-video', target: 'video-production', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'video-tool-selection', target: 'video-production', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'twitch-youtube', target: 'video-production', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'live-streaming', target: 'video-production', type: SkillEdgeType.SUBSKILL_OF },

  // Content Creation
  { source: 'content-creation', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tutorials', target: 'content-creation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'api-references', target: 'content-creation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'blogs', target: 'content-creation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'user-guides', target: 'content-creation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'code-samples', target: 'content-creation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'example-apps', target: 'content-creation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'use-case-builder', target: 'content-creation', type: SkillEdgeType.SUBSKILL_OF },

  // Developer Onboarding
  { source: 'developer-onboarding', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'onboarding-documentation', target: 'developer-onboarding', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'onboarding-social-media', target: 'developer-onboarding', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'example-project-onboarding', target: 'developer-onboarding', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'consistent-posting', target: 'developer-onboarding', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'content-strategy', target: 'developer-onboarding', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'analytics-optimization', target: 'developer-onboarding', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tracking-engagement', target: 'analytics-optimization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-driven-shift', target: 'analytics-optimization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'platform-analytics', target: 'analytics-optimization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'social-analytics', target: 'analytics-optimization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'google-analytics', target: 'analytics-optimization', type: SkillEdgeType.SUBSKILL_OF },

  // Support
  { source: 'support-devrel', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'issue-tracking', target: 'support-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'faqs', target: 'support-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'office-hours', target: 'support-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'webinars', target: 'support-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'live-support', target: 'support-devrel', type: SkillEdgeType.SUBSKILL_OF },

  // Reporting
  { source: 'reporting-devrel', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'regular-reports', target: 'reporting-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'regular-data', target: 'reporting-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'insights-recommendations', target: 'reporting-devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'headline-metrics', target: 'reporting-devrel', type: SkillEdgeType.SUBSKILL_OF },

  // Metrics & Analytics
  { source: 'metrics-analytics', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'key-metrics', target: 'metrics-analytics', type: SkillEdgeType.SUBSKILL_OF },

  // Career Development
  { source: 'career-development', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'thought-leadership', target: 'career-development', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'publishing', target: 'career-development', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'media-appearances', target: 'career-development', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'conference-speaking', target: 'career-development', type: SkillEdgeType.SUBSKILL_OF },

  // Key Responsibilities
  { source: 'key-responsibilities', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'advocacy', target: 'key-responsibilities', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'education', target: 'key-responsibilities', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'constant-creation', target: 'key-responsibilities', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'feedback-loop', target: 'key-responsibilities', type: SkillEdgeType.SUBSKILL_OF },

  // Keep Learning
  { source: 'keep-learning-devrel', target: 'devrel', type: SkillEdgeType.SUBSKILL_OF },
];

interface RoadmapNode {
  slug: string;
  name: string;
  description: string;
  difficulty: any;
  sortOrder: number;
}

const ROADMAP_NODES: RoadmapNode[] = ROADMAP_NODES_DATA as RoadmapNode[];

async function main() {
  console.log('Starting DevRel roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'devrel' },
    update: { name: 'DevRel', description: 'Developer Relations specialization' },
    create: {
      name: 'DevRel',
      slug: 'devrel',
      description: 'Developer Relations specialization',
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
        difficulty: node.difficulty,
        categoryId: category.id,
      },
      create: {
        slug: node.slug,
        name: node.name,
        normalizedName: node.name.toLowerCase().replace(/\s+/g, '-'),
        description: node.description,
        difficulty: node.difficulty,
        categoryId: category.id,
      },
    });
  }
  console.log(`✓ ${ROADMAP_NODES.length} skills inserted`);

  // Create or update roadmap
  const rootSkill = await prisma.skill.findUnique({
    where: { slug: 'devrel' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'devrel' },
    update: {
      name: 'DevRel',
      description: 'Comprehensive Developer Relations roadmap covering communication skills, technical knowledge, community building, content creation, API documentation, analytics, and developer advocacy',
      icon: '👥',
      color: '#F59E0B',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'DevRel',
      slug: 'devrel',
      description: 'Comprehensive Developer Relations roadmap covering communication skills, technical knowledge, community building, content creation, API documentation, analytics, and developer advocacy',
      icon: '👥',
      color: '#F59E0B',
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

  console.log('\n✓ DevRel roadmap seeded successfully!');
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

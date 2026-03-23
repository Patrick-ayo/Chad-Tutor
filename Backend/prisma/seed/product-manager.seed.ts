/**
 * Product Manager Roadmap Seed Script
 *
 * Seeds the Product Manager development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/product-manager.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';
import { buildNodeResources } from './resources';

const prisma = new PrismaClient();

// Product Manager Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'product-manager', name: 'Product Manager', description: 'Complete Product Manager roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 0 },

  // ==== PRODUCT ROADMAP ====
  { slug: 'product-roadmap', name: 'Product Roadmap', description: 'Creating product roadmaps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 1 },
  { slug: 'design-thinking', name: 'Design Thinking', description: 'Design thinking methodology', difficulty: Difficulty.INTERMEDIATE, sortOrder: 2 },
  { slug: 'ideation', name: 'Ideation', description: 'Idea generation techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 3 },
  { slug: 'user-research-basic', name: 'User Research', description: 'User research methods', difficulty: Difficulty.INTERMEDIATE, sortOrder: 4 },
  { slug: 'scheduling', name: 'Scheduling', description: 'Project scheduling', difficulty: Difficulty.INTERMEDIATE, sortOrder: 5 },
  { slug: 'drafting', name: 'Drafting', description: 'Creating product drafts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },

  // ==== WHAT IS PRODUCT MANAGEMENT ====
  { slug: 'what-is-product-management', name: 'What is Product Management', description: 'PM fundamentals', difficulty: Difficulty.BEGINNER, sortOrder: 7 },
  { slug: 'product', name: 'Product', description: 'Understanding products', difficulty: Difficulty.INTERMEDIATE, sortOrder: 8 },
  { slug: 'cost', name: 'Cost', description: 'Understanding costs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 9 },

  // ==== FIELD TRAPPING ====
  { slug: 'field-trapping', name: 'Field Trapping', description: 'Field trapping techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 10 },
  { slug: 'field-mapping', name: 'Field Mapping', description: 'Mapping field requirements', difficulty: Difficulty.INTERMEDIATE, sortOrder: 11 },
  { slug: 'field-planning', name: 'Field Planning', description: 'Field strategy planning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },
  { slug: 'market-sizing', name: 'Market Sizing', description: 'Estimating market size', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },
  { slug: 'sample-plan', name: 'Sample Plan', description: 'Creating sample plans', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },

  // ==== SIZING & MARKET RESEARCH ====
  { slug: 'sizing-market-research', name: 'Sizing & Market Research', description: 'Market research and sizing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },
  { slug: 'global-options', name: 'Global Options', description: 'Global market options', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'domestic-prices', name: 'Domestic Prices', description: 'Domestic pricing strategies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },
  { slug: 'import-export', name: 'Import/Export', description: 'Import/export considerations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'market-segments', name: 'Market Segments', description: 'Market segmentation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },

  // ==== TOOLS ====
  { slug: 'tools-pm', name: 'Tools', description: 'PM tools and software', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },
  { slug: 'product-bundling', name: 'Product Bundling', description: 'Product bundling strategies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'dual-channel-strategy', name: 'Dual Channel Strategy', description: 'Multi-channel strategies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },
  { slug: 'channel-optimizations', name: 'Channel Optimizations', description: 'Optimizing channels', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },

  // ==== MARKET GENERATION ====
  { slug: 'market-generation', name: 'Market Generation', description: 'Generating market opportunities', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },
  { slug: 'product-identification', name: 'Product Identification', description: 'Identifying products', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'market-identification', name: 'Market Identification', description: 'Identifying markets', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },
  { slug: 'customer-discovery', name: 'Customer Discovery', description: 'Discovering customers', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },

  // ==== SOCIAL RESEARCH ====
  { slug: 'social-research', name: 'Social Research', description: 'Social and market research', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },
  { slug: 'market-analysis', name: 'Market Analysis', description: 'Analyzing markets', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'user-analysis', name: 'User Analysis', description: 'Analyzing user behavior', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'competitor-analysis', name: 'Competitor Analysis', description: 'Analyzing competitors', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },
  { slug: 'trend-analysis', name: 'Trend Analysis', description: 'Analyzing market trends', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },

  // ==== PRODUCT STRATEGY ====
  { slug: 'product-strategy', name: 'Product Strategy', description: 'Developing product strategy', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },
  { slug: 'market-user-research', name: 'Market/User Research', description: 'Combined market and user research', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },
  { slug: 'strategy-pm', name: 'Strategy', description: 'Strategic planning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 35 },
  { slug: 'product-positioning', name: 'Product Positioning', description: 'Positioning products', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },
  { slug: 'brand-strategy', name: 'Brand Strategy', description: 'Brand development strategy', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },
  { slug: 'go-to-market', name: 'Go-to-Market', description: 'GTM strategy', difficulty: Difficulty.INTERMEDIATE, sortOrder: 38 },

  // ==== SALES & SUPPORT ====
  { slug: 'sales-support', name: 'Sales & Support', description: 'Sales and customer support', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'product-details', name: 'Product Details', description: 'Detailed product information', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'building-value', name: 'Building Value', description: 'Value proposition creation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'customer-communications', name: 'Customer Communications', description: 'Customer communication strategies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },
  { slug: 'support-protocols', name: 'Support Protocols', description: 'Customer support procedures', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },

  // ==== DATA ANALYTICS ====
  { slug: 'data-analytics-pm', name: 'Data Analytics', description: 'Analytics for product decisions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },
  { slug: 'ab-testing', name: 'A/B Testing', description: 'A/B testing methodology', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },
  { slug: 'marketing-analytics', name: 'Marketing Analytics', description: 'Marketing data analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'product-metrics', name: 'Product Metrics', description: 'Key product metrics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 47 },
  { slug: 'user-research-analytics', name: 'User Research Analytics', description: 'Analyzing user research data', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },

  // ==== DEVELOPMENT AND LAUNCH ====
  { slug: 'development-launch', name: 'Development and Launch', description: 'Product development and launch', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'agile-framework', name: 'Agile Framework', description: 'Agile development methodology', difficulty: Difficulty.INTERMEDIATE, sortOrder: 50 },
  { slug: 'sprint-planning', name: 'Sprint Planning', description: 'Sprint planning and execution', difficulty: Difficulty.INTERMEDIATE, sortOrder: 51 },
  { slug: 'beta-testing', name: 'Beta Testing', description: 'Beta product testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'launch-planning', name: 'Launch Planning', description: 'Product launch planning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },

  // ==== PRODUCT TESTING ====
  { slug: 'product-testing', name: 'Product Testing', description: 'Testing products', difficulty: Difficulty.INTERMEDIATE, sortOrder: 54 },
  { slug: 'alpha-product', name: 'Alpha Product', description: 'Alpha testing phase', difficulty: Difficulty.INTERMEDIATE, sortOrder: 55 },
  { slug: 'beta-product', name: 'Beta Product', description: 'Beta testing phase', difficulty: Difficulty.INTERMEDIATE, sortOrder: 56 },
  { slug: 'market-testing', name: 'Market Testing', description: 'Testing in market', difficulty: Difficulty.INTERMEDIATE, sortOrder: 57 },
  { slug: 'usability-testing', name: 'Usability Testing', description: 'User usability testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 58 },

  // ==== INTERNATIONALIZATION ====
  { slug: 'internationalization', name: 'Internationalization', description: 'Going international', difficulty: Difficulty.INTERMEDIATE, sortOrder: 59 },
  { slug: 'localization-adaptation', name: 'Localization & Adaptation', description: 'Localizing products', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },
  { slug: 'regulatory-compliance', name: 'Regulatory Compliance', description: 'Compliance requirements', difficulty: Difficulty.INTERMEDIATE, sortOrder: 61 },
  { slug: 'cultural-adaptation', name: 'Cultural Adaptation', description: 'Cultural considerations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 62 },

  // ==== SUBSCRIPTION MANAGEMENT ====
  { slug: 'subscription-management', name: 'Subscription Management', description: 'Managing subscriptions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 63 },
  { slug: 'billing', name: 'Billing', description: 'Billing systems and strategies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 64 },
  { slug: 'retention', name: 'Retention', description: 'Customer retention strategies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 65 },
  { slug: 'churn-analysis', name: 'Churn Analysis', description: 'Analyzing customer churn', difficulty: Difficulty.INTERMEDIATE, sortOrder: 66 },
  { slug: 'reports-reporting', name: 'Reports & Reporting', description: 'Subscription reporting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 67 },

  // ==== PRODUCT MANAGEMENT TOOLS ====
  { slug: 'pm-tools', name: 'Product Management Tools', description: 'PM software and tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 68 },
  { slug: 'product-boards', name: 'Product Boards', description: 'Using product boards', difficulty: Difficulty.INTERMEDIATE, sortOrder: 69 },
  { slug: 'kanban', name: 'Kanban', description: 'Kanban methodology', difficulty: Difficulty.INTERMEDIATE, sortOrder: 70 },
  { slug: 'jira', name: 'Jira', description: 'Jira project management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 71 },
  { slug: 'monday', name: 'Monday', description: 'Monday.com project management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 72 },
  { slug: 'asana', name: 'Asana', description: 'Asana project management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 73 },
  { slug: 'trello', name: 'Trello', description: 'Trello task management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 74 },

  // ==== RISK MANAGEMENT ====
  { slug: 'risk-management-pm', name: 'Risk Management', description: 'Managing product risks', difficulty: Difficulty.INTERMEDIATE, sortOrder: 75 },
  { slug: 'risk-identification-techniques', name: 'Risk Identification Techniques', description: 'Identifying risks', difficulty: Difficulty.INTERMEDIATE, sortOrder: 76 },
  { slug: 'risk-mitigation', name: 'Risk Mitigation', description: 'Mitigating identified risks', difficulty: Difficulty.INTERMEDIATE, sortOrder: 77 },
  { slug: 'continuous-risk-monitoring', name: 'Continuous Risk Monitoring', description: 'Ongoing risk monitoring', difficulty: Difficulty.INTERMEDIATE, sortOrder: 78 },

  // ==== ADVANCED TOPICS ====
  { slug: 'advanced-topics-pm', name: 'Advanced Topics', description: 'Advanced PM topics', difficulty: Difficulty.ADVANCED, sortOrder: 79 },
  { slug: 'strategy-analysis', name: 'Strategy Analysis', description: 'Advanced strategy analysis', difficulty: Difficulty.ADVANCED, sortOrder: 80 },
  { slug: 'competitive-analysis-advanced', name: 'Competitive Analysis', description: 'Advanced competitive analysis', difficulty: Difficulty.ADVANCED, sortOrder: 81 },
  { slug: 'market-leadership', name: 'Market/Competitive Analysis', description: 'Market and competitive positioning', difficulty: Difficulty.ADVANCED, sortOrder: 82 },
  { slug: 'building-leading-tactics', name: 'Building and Leading Tactics', description: 'Leadership and execution tactics', difficulty: Difficulty.ADVANCED, sortOrder: 83 },
  { slug: 'influencing-authority', name: 'Influencing Without Authority', description: 'Leadership without direct authority', difficulty: Difficulty.ADVANCED, sortOrder: 84 },

  // ==== KEEP LEARNING ====
  { slug: 'keep-learning-pm', name: 'Keep learning', description: 'Continue learning product management', difficulty: Difficulty.BEGINNER, sortOrder: 85 },
];

const ROADMAP_EDGES_DATA = [
  // Product Roadmap
  { source: 'product-roadmap', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'design-thinking', target: 'product-roadmap', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ideation', target: 'product-roadmap', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'user-research-basic', target: 'product-roadmap', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'scheduling', target: 'product-roadmap', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'drafting', target: 'product-roadmap', type: SkillEdgeType.SUBSKILL_OF },

  // What is Product Management
  { source: 'what-is-product-management', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'product', target: 'what-is-product-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cost', target: 'what-is-product-management', type: SkillEdgeType.SUBSKILL_OF },

  // Field Trapping
  { source: 'field-trapping', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'field-mapping', target: 'field-trapping', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'field-planning', target: 'field-trapping', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'market-sizing', target: 'field-trapping', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sample-plan', target: 'field-trapping', type: SkillEdgeType.SUBSKILL_OF },

  // Sizing & Market Research
  { source: 'sizing-market-research', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'global-options', target: 'sizing-market-research', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'domestic-prices', target: 'sizing-market-research', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'import-export', target: 'sizing-market-research', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'market-segments', target: 'sizing-market-research', type: SkillEdgeType.SUBSKILL_OF },

  // Tools
  { source: 'tools-pm', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'product-bundling', target: 'tools-pm', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dual-channel-strategy', target: 'tools-pm', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'channel-optimizations', target: 'tools-pm', type: SkillEdgeType.SUBSKILL_OF },

  // Market Generation
  { source: 'market-generation', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'product-identification', target: 'market-generation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'market-identification', target: 'market-generation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'customer-discovery', target: 'market-generation', type: SkillEdgeType.SUBSKILL_OF },

  // Social Research
  { source: 'social-research', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'market-analysis', target: 'social-research', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'user-analysis', target: 'social-research', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'competitor-analysis', target: 'social-research', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'trend-analysis', target: 'social-research', type: SkillEdgeType.SUBSKILL_OF },

  // Product Strategy
  { source: 'product-strategy', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'market-user-research', target: 'product-strategy', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'strategy-pm', target: 'product-strategy', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'product-positioning', target: 'product-strategy', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'brand-strategy', target: 'product-strategy', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'go-to-market', target: 'product-strategy', type: SkillEdgeType.SUBSKILL_OF },

  // Sales & Support
  { source: 'sales-support', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'product-details', target: 'sales-support', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'building-value', target: 'sales-support', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'customer-communications', target: 'sales-support', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'support-protocols', target: 'sales-support', type: SkillEdgeType.SUBSKILL_OF },

  // Data Analytics
  { source: 'data-analytics-pm', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ab-testing', target: 'data-analytics-pm', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'marketing-analytics', target: 'data-analytics-pm', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'product-metrics', target: 'data-analytics-pm', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'user-research-analytics', target: 'data-analytics-pm', type: SkillEdgeType.SUBSKILL_OF },

  // Development and Launch
  { source: 'development-launch', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'agile-framework', target: 'development-launch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sprint-planning', target: 'development-launch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'beta-testing', target: 'development-launch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'launch-planning', target: 'development-launch', type: SkillEdgeType.SUBSKILL_OF },

  // Product Testing
  { source: 'product-testing', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'alpha-product', target: 'product-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'beta-product', target: 'product-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'market-testing', target: 'product-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'usability-testing', target: 'product-testing', type: SkillEdgeType.SUBSKILL_OF },

  // Internationalization
  { source: 'internationalization', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'localization-adaptation', target: 'internationalization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'regulatory-compliance', target: 'internationalization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cultural-adaptation', target: 'internationalization', type: SkillEdgeType.SUBSKILL_OF },

  // Subscription Management
  { source: 'subscription-management', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'billing', target: 'subscription-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'retention', target: 'subscription-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'churn-analysis', target: 'subscription-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'reports-reporting', target: 'subscription-management', type: SkillEdgeType.SUBSKILL_OF },

  // PM Tools
  { source: 'pm-tools', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'product-boards', target: 'pm-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kanban', target: 'pm-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'jira', target: 'pm-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'monday', target: 'pm-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'asana', target: 'pm-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'trello', target: 'pm-tools', type: SkillEdgeType.SUBSKILL_OF },

  // Risk Management
  { source: 'risk-management-pm', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'risk-identification-techniques', target: 'risk-management-pm', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'risk-mitigation', target: 'risk-management-pm', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'continuous-risk-monitoring', target: 'risk-management-pm', type: SkillEdgeType.SUBSKILL_OF },

  // Advanced Topics
  { source: 'advanced-topics-pm', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'strategy-analysis', target: 'advanced-topics-pm', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'competitive-analysis-advanced', target: 'advanced-topics-pm', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'market-leadership', target: 'advanced-topics-pm', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'building-leading-tactics', target: 'advanced-topics-pm', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'influencing-authority', target: 'advanced-topics-pm', type: SkillEdgeType.SUBSKILL_OF },

  // Keep Learning
  { source: 'keep-learning-pm', target: 'product-manager', type: SkillEdgeType.SUBSKILL_OF },

  // Cross-dependencies
  { source: 'product-strategy', target: 'social-research', type: SkillEdgeType.PREREQUISITE },
  { source: 'go-to-market', target: 'market-generation', type: SkillEdgeType.BUILDS_ON },
  { source: 'development-launch', target: 'product-strategy', type: SkillEdgeType.BUILDS_ON },
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
  resources: buildNodeResources(node.name, node.slug),
})) as RoadmapNode[];

async function main() {
  console.log('Starting Product Manager roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'product-manager' },
    update: { name: 'Product Manager', description: 'Product Manager specialization' },
    create: {
      name: 'Product Manager',
      slug: 'product-manager',
      description: 'Product Manager specialization',
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
      } as any,
      create: {
        slug: node.slug,
        name: node.name,
        normalizedName: node.name.toLowerCase().replace(/\s+/g, '-'),
        description: node.description,
        resources: (node as any).resources,
        difficulty: node.difficulty,
        categoryId: category.id,
      } as any,
    });
  }
  console.log(`✓ ${ROADMAP_NODES.length} skills inserted`);

  // Create or update roadmap
  const rootSkill = await prisma.skill.findUnique({
    where: { slug: 'product-manager' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'product-manager' },
    update: {
      name: 'Product Manager',
      description: 'Comprehensive Product Manager roadmap covering product roadmapping, market research, product strategy, data analytics, development and launch, testing, subscription management, risk management, and advanced PM topics',
      icon: '📦',
      color: '#8B5CF6',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'Product Manager',
      slug: 'product-manager',
      description: 'Comprehensive Product Manager roadmap covering product roadmapping, market research, product strategy, data analytics, development and launch, testing, subscription management, risk management, and advanced PM topics',
      icon: '📦',
      color: '#8B5CF6',
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

  console.log('\n✓ Product Manager roadmap seeded successfully!');
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

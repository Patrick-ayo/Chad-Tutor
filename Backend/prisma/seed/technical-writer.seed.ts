/**
 * Technical Writer Roadmap Seed Script
 *
 * Seeds the Technical Writer development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/technical-writer.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';
import { buildNodeResources } from './resources';

const prisma = new PrismaClient();

// Technical Writer Roadmap - Comprehensive Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'technical-writer', name: 'Technical Writer', description: 'Complete Technical Writer roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 0 },

  // ==== INTRODUCTION ====
  { slug: 'introduction-tw', name: 'Introduction', description: 'Technical writing introduction', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
  { slug: 'who-is-technical-writer', name: 'Who is a Technical Writer?', description: 'Role and responsibilities of technical writers', difficulty: Difficulty.BEGINNER, sortOrder: 2 },
  { slug: 'what-is-technical-writing', name: 'What is Technical Writing?', description: 'Definition and scope of technical writing', difficulty: Difficulty.BEGINNER, sortOrder: 3 },
  { slug: 'role-of-technical-writers-in-orgs', name: 'Role of Technical Writers in Organizations', description: 'Organizational role and impact', difficulty: Difficulty.INTERMEDIATE, sortOrder: 4, width: 180, height: 60 },
  { slug: 'forms-of-technical-writing', name: 'Forms of Technical Writing', description: 'Different types and forms of technical writing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 5 },
  { slug: 'growth-as-technical-writer', name: 'Growth as a Technical Writer', description: 'Career growth and advancement', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },

  // ==== REQUIRED SKILLS ====
  { slug: 'required-skills-tw', name: 'Required Skills', description: 'Core skills for technical writers', difficulty: Difficulty.INTERMEDIATE, sortOrder: 7 },
  { slug: 'technology-expertise', name: 'Technology Expertise', description: 'Technical knowledge and expertise', difficulty: Difficulty.ADVANCED, sortOrder: 8 },
  { slug: 'language-proficiency', name: 'Language Proficiency', description: 'Language and writing proficiency', difficulty: Difficulty.INTERMEDIATE, sortOrder: 9 },
  { slug: 'written-communication-proficiency', name: 'Written Communication Proficiency', description: 'Professional communication skills', difficulty: Difficulty.INTERMEDIATE, sortOrder: 10, width: 180, height: 60 },

  // ==== STORY TELLING ====
  { slug: 'story-telling', name: 'Story Telling', description: 'Narrative and storytelling techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 11 },
  { slug: 'subtle-selling', name: 'Subtle Selling', description: 'Persuasive writing without being aggressive', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },
  { slug: 'content-structure', name: 'Content Structure', description: 'Organizing and structuring content', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },
  { slug: 'call-to-actions', name: 'Call to Actions', description: 'Creating effective CTAs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },
  { slug: 'references', name: 'References', description: 'Citation and reference management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },
  { slug: 'crafting-great-titles', name: 'Crafting Great Titles', description: 'Title creation and optimization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'content-objectives-intent', name: 'Content Objectives & Intent', description: 'Setting content goals and purpose', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },
  { slug: 'user-persona', name: 'User Persona', description: 'Understanding and creating user personas', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'writing-style-guides', name: 'Writing Style Guides', description: 'Style guides and standards', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },

  // ==== TOOLING ====
  { slug: 'tooling-tw', name: 'Tooling', description: 'Tools for technical writing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },
  { slug: 'research-tools', name: 'Research Tools', description: 'Research and information gathering tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'blogging-platforms', name: 'Blogging Platforms', description: 'Blogging platforms and CMS', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },
  { slug: 'publishing-tools', name: 'Publishing Tools', description: 'Content publishing and management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'seo-tools', name: 'SEO Tools', description: 'SEO and optimization tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },
  { slug: 'plagiarism-checker', name: 'Plagiarism Checker', description: 'Plagiarism detection tools', difficulty: Difficulty.BEGINNER, sortOrder: 25 },
  { slug: 'editing-tools', name: 'Editing Tools', description: 'Content editing and proofreading tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },
  { slug: 'git-version-control', name: 'Git / Version Control', description: 'Version control systems', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },
  { slug: 'markdown', name: 'Markdown', description: 'Markdown markup language', difficulty: Difficulty.BEGINNER, sortOrder: 28 },

  // ==== BEST PRACTICES ====
  { slug: 'best-practices-tw', name: 'Best Practices', description: 'Technical writing best practices', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'content-research', name: 'Content Research', description: 'Research methodologies for content', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'topic-score', name: 'Topic Score', description: 'Topic viability and scoring', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },
  { slug: 'keyword-volume', name: 'Keyword Volume', description: 'Keyword research and volume analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },
  { slug: 'communities-forums', name: 'Communities & Forums', description: 'Community engagement and forums', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },
  { slug: 'search-trends', name: 'Search Trends', description: 'Tracking and analyzing search trends', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },
  { slug: 'support-request-evaluation', name: 'Support Request Evaluation', description: 'Evaluating support requests for content', difficulty: Difficulty.INTERMEDIATE, sortOrder: 35 },

  // ==== TYPES OF TECHNICAL CONTENT ====
  { slug: 'types-of-technical-content', name: 'Types of Technical Content', description: 'Different types of technical content', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },
  { slug: 'help-content', name: 'Help Content', description: 'Help documentation and FAQs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },
  { slug: 'developer-docs', name: 'Developer Docs', description: 'Developer documentation', difficulty: Difficulty.ADVANCED, sortOrder: 38 },
  { slug: 'api-reference', name: 'API Reference', description: 'API reference documentation', difficulty: Difficulty.ADVANCED, sortOrder: 39 },
  { slug: 'troubleshooting', name: 'Troubleshooting', description: 'Troubleshooting guides', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'user-goals', name: 'User Goals', description: 'Understanding user goals and needs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'docs-generation-tools', name: 'Docs Generation Tools', description: 'Automated documentation generation', difficulty: Difficulty.ADVANCED, sortOrder: 42 },
  { slug: 'developer-support', name: 'Developer Support', description: 'Developer support documentation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },
  { slug: 'developer-journey', name: 'Developer Journey', description: 'Understanding developer journey', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },
  { slug: 'api-definitions', name: 'API Definitions', description: 'API specification and definitions', difficulty: Difficulty.ADVANCED, sortOrder: 45 },
  { slug: 'platform-support', name: 'Platform Support', description: 'Multi-platform support documentation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'docs-structure', name: 'Docs Structure', description: 'Documentation structure and organization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 47 },

  // ==== TECHNICAL CONTENT MARKETING ====
  { slug: 'technical-content-marketing', name: 'Technical Content Marketing', description: 'Marketing technical content', difficulty: Difficulty.ADVANCED, sortOrder: 48 },
  { slug: 'icp-buyer-persona', name: 'ICP & Buyer Persona', description: 'Ideal customer profile and personas', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'buyer-journey-funnel', name: 'Buyer Journey & Content Funnel', description: 'Buyer journey mapping and content funnel', difficulty: Difficulty.ADVANCED, sortOrder: 50 },
  { slug: 'short-tail-keywords', name: 'Short-tail Keywords', description: 'Short-tail keyword optimization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 51 },
  { slug: 'long-tail-keywords', name: 'Long-Tail Keywords', description: 'Long-tail keyword targeting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'backlinking', name: 'Backlinking', description: 'Backlink strategy and acquisition', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },
  { slug: 'seo-keywords', name: 'SEO Keywords', description: 'SEO keyword optimization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 54 },
  { slug: 'content-seo', name: 'Content SEO', description: 'SEO optimization for content', difficulty: Difficulty.ADVANCED, sortOrder: 55 },
  { slug: 'top-funnel-content', name: 'Top-funnel Content', description: 'Awareness stage content', difficulty: Difficulty.INTERMEDIATE, sortOrder: 56 },
  { slug: 'mid-funnel-content', name: 'Mid-funnel Content', description: 'Consideration stage content', difficulty: Difficulty.INTERMEDIATE, sortOrder: 57 },
  { slug: 'bottom-funnel-content', name: 'Bottom-funnel Content', description: 'Decision stage content', difficulty: Difficulty.INTERMEDIATE, sortOrder: 58 },
  { slug: 'pillar-content', name: 'Pillar Content', description: 'Pillar page and topic clusters', difficulty: Difficulty.ADVANCED, sortOrder: 59 },
  { slug: 'awareness-blog-posts', name: 'Awareness Blog Posts', description: 'Blog posts for awareness stage', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },
  { slug: 'research-reports', name: 'Research Reports', description: 'Creating research reports', difficulty: Difficulty.ADVANCED, sortOrder: 61 },
  { slug: 'comparative-posts', name: 'Comparative Posts', description: 'Comparison content', difficulty: Difficulty.INTERMEDIATE, sortOrder: 62 },
  { slug: 'tutorials', name: 'Tutorials', description: 'Step-by-step tutorials', difficulty: Difficulty.INTERMEDIATE, sortOrder: 63 },

  // ==== GATED CONTENT ====
  { slug: 'generic-gated-content', name: 'Generic Gated Content', description: 'Gated content strategies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 64 },
  { slug: 'white-papers', name: 'White-papers', description: 'Technical white papers', difficulty: Difficulty.ADVANCED, sortOrder: 65 },
  { slug: 'ebook', name: 'eBook', description: 'eBook content creation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 66 },

  // ==== CONTENT ANALYSIS ====
  { slug: 'content-analysis', name: 'Content Analysis', description: 'Analyzing content performance', difficulty: Difficulty.INTERMEDIATE, sortOrder: 67 },
  { slug: 'content-optimization', name: 'Content Optimization', description: 'Optimizing content for performance', difficulty: Difficulty.ADVANCED, sortOrder: 68 },
  { slug: 'link-shorteners-tracking', name: 'Link Shorteners / Tracking', description: 'Link tracking and management', difficulty: Difficulty.BEGINNER, sortOrder: 69 },
  { slug: 'platform-tracking-metrics', name: 'Platform Tracking and Metrics', description: 'Analytics and tracking platforms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 70 },
  { slug: 'conversion-tracking', name: 'Conversion Tracking', description: 'Conversion tracking and measurement', difficulty: Difficulty.INTERMEDIATE, sortOrder: 71 },
  { slug: 'content-aging-timelines', name: 'Content Aging & Timelines', description: 'Content lifecycle and freshness', difficulty: Difficulty.INTERMEDIATE, sortOrder: 72 },
  { slug: 'content-distribution', name: 'Content Distribution', description: 'Distributing content across channels', difficulty: Difficulty.ADVANCED, sortOrder: 73 },
  { slug: 'canonical-link', name: 'Canonical Link', description: 'Canonical URL management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 74 },
  { slug: 'opengraph-data', name: 'OpenGraph Data', description: 'OpenGraph meta tags', difficulty: Difficulty.INTERMEDIATE, sortOrder: 75 },
  { slug: 'content-distribution-channels', name: 'Content Distribution Channels', description: 'Distribution channel management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 76 },
  { slug: 'content-distribution-amplification', name: 'Content Distribution Amplification Strategies', description: 'Content amplification strategies', difficulty: Difficulty.ADVANCED, sortOrder: 77 },

  // ==== BOTTOM FUNNEL CONTENT ====
  { slug: 'release-notes-announcements', name: 'Release Notes / Product Announcements', description: 'Release notes and product updates', difficulty: Difficulty.INTERMEDIATE, sortOrder: 78 },
  { slug: 'customer-case-studies', name: 'Customer Case-Studies', description: 'Case study creation and storytelling', difficulty: Difficulty.ADVANCED, sortOrder: 79 },
  { slug: 'technical-website-copy', name: 'Technical Website Copy', description: 'Website copywriting for tech products', difficulty: Difficulty.INTERMEDIATE, sortOrder: 80 },
  { slug: 'frequently-asked-questions', name: 'Frequently Asked Questions', description: 'FAQ documentation', difficulty: Difficulty.BEGINNER, sortOrder: 81 },

  // ==== KEEP LEARNING ====
  { slug: 'keep-learning-tw', name: 'Keep Learning', description: 'Continue learning technical writing', difficulty: Difficulty.BEGINNER, sortOrder: 82 },
];

const ROADMAP_EDGES_DATA = [
  // Introduction
  { source: 'introduction-tw', target: 'technical-writer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'who-is-technical-writer', target: 'introduction-tw', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'what-is-technical-writing', target: 'introduction-tw', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'role-of-technical-writers-in-orgs', target: 'introduction-tw', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'forms-of-technical-writing', target: 'introduction-tw', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'growth-as-technical-writer', target: 'introduction-tw', type: SkillEdgeType.SUBSKILL_OF },

  // Required Skills
  { source: 'required-skills-tw', target: 'introduction-tw', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'technology-expertise', target: 'required-skills-tw', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'language-proficiency', target: 'required-skills-tw', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'written-communication-proficiency', target: 'required-skills-tw', type: SkillEdgeType.SUBSKILL_OF },

  // Story Telling
  { source: 'story-telling', target: 'required-skills-tw', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'subtle-selling', target: 'story-telling', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'content-structure', target: 'story-telling', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'call-to-actions', target: 'story-telling', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'references', target: 'story-telling', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'crafting-great-titles', target: 'story-telling', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'content-objectives-intent', target: 'story-telling', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'user-persona', target: 'story-telling', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'writing-style-guides', target: 'story-telling', type: SkillEdgeType.SUBSKILL_OF },

  // Tooling
  { source: 'tooling-tw', target: 'technical-writer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'research-tools', target: 'tooling-tw', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'blogging-platforms', target: 'tooling-tw', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'publishing-tools', target: 'tooling-tw', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'seo-tools', target: 'tooling-tw', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'plagiarism-checker', target: 'tooling-tw', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'editing-tools', target: 'tooling-tw', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'git-version-control', target: 'tooling-tw', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'markdown', target: 'tooling-tw', type: SkillEdgeType.SUBSKILL_OF },

  // Best Practices
  { source: 'best-practices-tw', target: 'technical-writer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'content-research', target: 'best-practices-tw', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'topic-score', target: 'content-research', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'keyword-volume', target: 'content-research', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'communities-forums', target: 'content-research', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'search-trends', target: 'content-research', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'support-request-evaluation', target: 'content-research', type: SkillEdgeType.SUBSKILL_OF },

  // Types of Technical Content
  { source: 'types-of-technical-content', target: 'technical-writer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'help-content', target: 'types-of-technical-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'developer-docs', target: 'types-of-technical-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'api-reference', target: 'types-of-technical-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'troubleshooting', target: 'types-of-technical-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'user-goals', target: 'types-of-technical-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'docs-generation-tools', target: 'types-of-technical-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'developer-support', target: 'types-of-technical-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'developer-journey', target: 'types-of-technical-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'api-definitions', target: 'types-of-technical-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'platform-support', target: 'types-of-technical-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'docs-structure', target: 'types-of-technical-content', type: SkillEdgeType.SUBSKILL_OF },

  // Technical Content Marketing
  { source: 'technical-content-marketing', target: 'technical-writer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'icp-buyer-persona', target: 'technical-content-marketing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'buyer-journey-funnel', target: 'technical-content-marketing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'short-tail-keywords', target: 'technical-content-marketing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'long-tail-keywords', target: 'technical-content-marketing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'backlinking', target: 'technical-content-marketing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'seo-keywords', target: 'technical-content-marketing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'content-seo', target: 'technical-content-marketing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'top-funnel-content', target: 'buyer-journey-funnel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mid-funnel-content', target: 'buyer-journey-funnel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bottom-funnel-content', target: 'buyer-journey-funnel', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pillar-content', target: 'content-seo', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'awareness-blog-posts', target: 'top-funnel-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'research-reports', target: 'top-funnel-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'comparative-posts', target: 'mid-funnel-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tutorials', target: 'mid-funnel-content', type: SkillEdgeType.SUBSKILL_OF },

  // Gated Content
  { source: 'generic-gated-content', target: 'types-of-technical-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'white-papers', target: 'generic-gated-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ebook', target: 'generic-gated-content', type: SkillEdgeType.SUBSKILL_OF },

  // Content Analysis
  { source: 'content-analysis', target: 'technical-writer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'content-optimization', target: 'content-analysis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'link-shorteners-tracking', target: 'content-analysis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'platform-tracking-metrics', target: 'content-analysis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'conversion-tracking', target: 'content-analysis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'content-aging-timelines', target: 'content-analysis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'content-distribution', target: 'content-analysis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'canonical-link', target: 'content-distribution', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'opengraph-data', target: 'content-distribution', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'content-distribution-channels', target: 'content-distribution', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'content-distribution-amplification', target: 'content-distribution', type: SkillEdgeType.SUBSKILL_OF },

  // Bottom Funnel Content
  { source: 'release-notes-announcements', target: 'bottom-funnel-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'customer-case-studies', target: 'bottom-funnel-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'technical-website-copy', target: 'bottom-funnel-content', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'frequently-asked-questions', target: 'bottom-funnel-content', type: SkillEdgeType.SUBSKILL_OF },

  // Keep Learning
  { source: 'keep-learning-tw', target: 'technical-writer', type: SkillEdgeType.SUBSKILL_OF },
];

const TECHNICAL_WRITER_INFO_BLOCKS = [
  {
    text: 'Start with fundamentals and avoid skipping writing basics.',
    position: { x: 80, y: 450 },
    width: 250,
    type: 'recommendation' as const,
  },
  {
    text: 'Practice documentation workflows before advanced tooling.',
    position: { x: 780, y: 480 },
    width: 260,
    type: 'tip' as const,
  },
  {
    text: 'Build a portfolio with real documentation samples and revisions.',
    position: { x: 80, y: 850 },
    width: 250,
    type: 'info' as const,
  },
  {
    text: 'Use SEO and analytics to keep technical content discoverable.',
    position: { x: 780, y: 850 },
    width: 260,
    type: 'warning' as const,
  },
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
  resources: buildNodeResources(node.name, node.slug, {
    sortOrder: node.sortOrder,
    nodeType: (node as any).type,
    infoBlocks: node.sortOrder === 0 ? TECHNICAL_WRITER_INFO_BLOCKS : undefined,
  }),
})) as RoadmapNode[];

async function main() {
  console.log('Starting Technical Writer roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'technical-writer-cat' },
    update: { name: 'Technical Writer', description: 'Technical Writer specialization' },
    create: {
      name: 'Technical Writer',
      slug: 'technical-writer-cat',
      description: 'Technical Writer specialization',
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
    where: { slug: 'technical-writer' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'technical-writer-cat' },
    update: {
      name: 'Technical Writer',
      description: 'Comprehensive Technical Writer roadmap covering documentation, content creation, SEO, content marketing, developer docs, API reference, technical copywriting, and content distribution strategies',
      icon: '📝',
      color: '#F59E0B',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'Technical Writer',
      slug: 'technical-writer-cat',
      description: 'Comprehensive Technical Writer roadmap covering documentation, content creation, SEO, content marketing, developer docs, API reference, technical copywriting, and content distribution strategies',
      icon: '📝',
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

  console.log('\n✓ Technical Writer roadmap seeded successfully!');
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


/**
 * Front-end Roadmap Seed Script
 *
 * Seeds the Front-end development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/frontend.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// Front-end Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'frontend', name: 'Front-end', description: 'Complete Front-end development roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 0 },

  // ==== BASICS ====
  { slug: 'learn-basics-frontend', name: 'Learn the basics', description: 'Frontend fundamentals', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
  { slug: 'writing-semantic-html', name: 'Writing Semantic HTML', description: 'Semantic HTML5', difficulty: Difficulty.BEGINNER, sortOrder: 2 },
  { slug: 'forms-validations', name: 'Forms and Validations', description: 'HTML forms and validation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 3 },
  { slug: 'accessibility-frontend', name: 'Accessibility', description: 'Web accessibility (a11y)', difficulty: Difficulty.INTERMEDIATE, sortOrder: 4 },
  { slug: 'seo-basics', name: 'SEO Basics', description: 'Search engine optimization basics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 5 },

  // ==== INTERNET ====
  { slug: 'internet-frontend', name: 'Internet', description: 'Internet fundamentals', difficulty: Difficulty.BEGINNER, sortOrder: 6 },
  { slug: 'how-internet-works', name: 'How does the internet work?', description: 'Internet basics', difficulty: Difficulty.BEGINNER, sortOrder: 7 },
  { slug: 'what-http', name: 'What is HTTP?', description: 'HTTP protocol', difficulty: Difficulty.BEGINNER, sortOrder: 8 },
  { slug: 'domain-name', name: 'What is Domain Name?', description: 'Domain names and DNS', difficulty: Difficulty.BEGINNER, sortOrder: 9 },
  { slug: 'hosting-frontend', name: 'What is hosting?', description: 'Web hosting basics', difficulty: Difficulty.BEGINNER, sortOrder: 10 },
  { slug: 'dns-how-works', name: 'DNS and how it works?', description: 'DNS resolution', difficulty: Difficulty.INTERMEDIATE, sortOrder: 11 },
  { slug: 'browsers-how-work', name: 'Browsers and how they work?', description: 'Browser mechanics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },

  // ==== HTML ====
  { slug: 'html-frontend', name: 'HTML', description: 'HTML markup language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },

  // ==== CSS ====
  { slug: 'css-frontend', name: 'CSS', description: 'CSS styling', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },
  { slug: 'learn-basics-css', name: 'Learn the Basics', description: 'CSS fundamentals', difficulty: Difficulty.BEGINNER, sortOrder: 15 },
  { slug: 'making-layouts', name: 'Making Layouts', description: 'CSS layouts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'responsive-design', name: 'Responsive Design', description: 'Mobile-first responsive design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },
  { slug: 'tailwind', name: 'Tailwind', description: 'Tailwind CSS framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'bem', name: 'BEM', description: 'Block Element Modifier methodology', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'css-architecture', name: 'CSS Architecture', description: 'CSS organization and patterns', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },
  { slug: 'css-preprocessors', name: 'CSS Preprocessors', description: 'Sass, PostCSS, and other preprocessors', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'sass-postcss', name: 'Sass', description: 'Sass CSS preprocessor', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },

  // ==== JAVASCRIPT ====
  { slug: 'javascript-frontend', name: 'JavaScript', description: 'JavaScript programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'learn-basics-js', name: 'Learn the Basics', description: 'JavaScript fundamentals', difficulty: Difficulty.BEGINNER, sortOrder: 24 },
  { slug: 'dom-manipulation', name: 'Learn DOM Manipulation', description: 'DOM API and manipulation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'fetch-api', name: 'Fetch API / Ajax (XHR)', description: 'Making HTTP requests', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },

  // ==== PACKAGE MANAGERS ====
  { slug: 'package-managers', name: 'Package Managers', description: 'NPM, Yarn, PNPM', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },
  { slug: 'npm-frontend', name: 'npm', description: 'Node Package Manager', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },
  { slug: 'yarn', name: 'yarn', description: 'Yarn package manager', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'pnpm', name: 'pnpm', description: 'PNPM package manager', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },

  // ==== VERSION CONTROL ====
  { slug: 'vcs-frontend', name: 'Version Control Systems', description: 'Git and related tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },
  { slug: 'git-frontend', name: 'Git', description: 'Git version control', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },
  { slug: 'github', name: 'GitHub', description: 'GitHub platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },
  { slug: 'gitlab', name: 'GitLab', description: 'GitLab platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },
  { slug: 'bitbucket', name: 'Bitbucket', description: 'Bitbucket platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 35 },

  // ==== PICK A FRAMEWORK ====
  { slug: 'pick-framework', name: 'Pick a Framework', description: 'Frontend frameworks', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },
  { slug: 'react-frontend', name: 'React', description: 'React library', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },
  { slug: 'angular', name: 'Angular', description: 'Angular framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 38 },
  { slug: 'vue', name: 'Vue', description: 'Vue framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'svelte', name: 'Svelte', description: 'Svelte framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'solid-js', name: 'Solid.JS', description: 'Solid.JS framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'qwik', name: 'Qwik', description: 'Qwik framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },

  // ==== BUILD TOOLS ====
  { slug: 'build-tools', name: 'Build Tools', description: 'Webpack, Vite, and other build tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },
  { slug: 'webpack', name: 'Webpack', description: 'Webpack bundler', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },
  { slug: 'vite', name: 'Vite', description: 'Vite build tool', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },
  { slug: 'parcel', name: 'Parcel', description: 'Parcel bundler', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'rollup', name: 'Rollup', description: 'Rollup module bundler', difficulty: Difficulty.INTERMEDIATE, sortOrder: 47 },
  { slug: 'webpack-parcel', name: 'Webpack / Parcel', description: 'Popular bundlers', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },

  // ==== TESTING ====
  { slug: 'testing-frontend', name: 'Testing', description: 'Frontend testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'unit-testing', name: 'Unit Testing', description: 'Unit tests', difficulty: Difficulty.INTERMEDIATE, sortOrder: 50 },
  { slug: 'playwright', name: 'Playwright', description: 'Playwright E2E testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 51 },
  { slug: 'cypress', name: 'Cypress', description: 'Cypress E2E testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'jest-frontend', name: 'Jest', description: 'Jest testing framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },
  { slug: 'next-js', name: 'Next.js', description: 'Next.js framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 54 },
  { slug: 'react-testing', name: 'React Testing Library', description: 'React testing library', difficulty: Difficulty.INTERMEDIATE, sortOrder: 55 },

  // ==== WEB SECURITY BASICS ====
  { slug: 'web-security', name: 'Web Security Basics', description: 'Web security fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 56 },
  { slug: 'cors', name: 'CORS', description: 'Cross-Origin Resource Sharing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 57 },
  { slug: 'https', name: 'HTTPS', description: 'HTTPS and SSL/TLS', difficulty: Difficulty.INTERMEDIATE, sortOrder: 58 },
  { slug: 'content-security-policy', name: 'Content Security Policy', description: 'CSP headers', difficulty: Difficulty.INTERMEDIATE, sortOrder: 59 },
  { slug: 'owasp-security-risks', name: 'OWASP Security Risks', description: 'OWASP top vulnerabilities', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },

  // ==== WEB COMPONENTS ====
  { slug: 'web-components', name: 'Web Components', description: 'Custom web components', difficulty: Difficulty.INTERMEDIATE, sortOrder: 61 },
  { slug: 'html-templates', name: 'HTML Templates', description: 'HTML template element', difficulty: Difficulty.INTERMEDIATE, sortOrder: 62 },
  { slug: 'custom-elements', name: 'Custom Elements', description: 'Custom HTML elements', difficulty: Difficulty.INTERMEDIATE, sortOrder: 63 },
  { slug: 'shadow-dom', name: 'Shadow DOM', description: 'Shadow DOM API', difficulty: Difficulty.INTERMEDIATE, sortOrder: 64 },
  { slug: 'pwa-pattern', name: 'PWA Pattern', description: 'Progressive Web App patterns', difficulty: Difficulty.INTERMEDIATE, sortOrder: 65 },

  // ==== TYPE CHECKERS ====
  { slug: 'type-checkers', name: 'Type Checkers', description: 'TypeScript and Flow', difficulty: Difficulty.INTERMEDIATE, sortOrder: 66 },
  { slug: 'typescript-frontend', name: 'TypeScript', description: 'TypeScript programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 67 },

  // ==== APIs ====
  { slug: 'apis-frontend', name: 'APIs', description: 'API types and consumption', difficulty: Difficulty.INTERMEDIATE, sortOrder: 68 },
  { slug: 'rest', name: 'REST', description: 'REST API design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 69 },
  { slug: 'graphql-frontend', name: 'GraphQL', description: 'GraphQL query language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 70 },

  // ==== MOBILE APPS ====
  { slug: 'mobile-apps', name: 'Mobile Apps', description: 'Mobile app development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 71 },
  { slug: 'react-native', name: 'React Native', description: 'React Native framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 72 },
  { slug: 'nativescript', name: 'NativeScript', description: 'NativeScript framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 73 },
  { slug: 'flutter', name: 'Flutter', description: 'Flutter framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 74 },
  { slug: 'ionic', name: 'Ionic', description: 'Ionic framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 75 },

  // ==== PERFORMANCE BEST PRACTICES ====
  { slug: 'performance-best-practices', name: 'Performance Best Practices', description: 'Web performance optimization', difficulty: Difficulty.ADVANCED, sortOrder: 76 },
  { slug: 'storage', name: 'Storage', description: 'Browser storage options', difficulty: Difficulty.INTERMEDIATE, sortOrder: 77 },
  { slug: 'web-sockets', name: 'Web Sockets', description: 'WebSocket protocol', difficulty: Difficulty.INTERMEDIATE, sortOrder: 78 },
  { slug: 'server-sent-events', name: 'Server Sent Events', description: 'SSE for real-time updates', difficulty: Difficulty.INTERMEDIATE, sortOrder: 79 },
  { slug: 'service-workers', name: 'Service Workers', description: 'Service Workers for offline support', difficulty: Difficulty.INTERMEDIATE, sortOrder: 80 },
  { slug: 'location', name: 'Location', description: 'Geolocation API', difficulty: Difficulty.BEGINNER, sortOrder: 81 },
  { slug: 'notification', name: 'Notification', description: 'Web Notifications API', difficulty: Difficulty.INTERMEDIATE, sortOrder: 82 },
  { slug: 'device-orientation', name: 'Device Orientation', description: 'Device orientation API', difficulty: Difficulty.INTERMEDIATE, sortOrder: 83 },
  { slug: 'payments', name: 'Payments', description: 'Payment integration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 84 },
  { slug: 'credentials', name: 'Credentials', description: 'Credential Management API', difficulty: Difficulty.INTERMEDIATE, sortOrder: 85 },

  // ==== BROWSER APIS ====
  { slug: 'browser-apis', name: 'Browser APIs', description: 'Various browser APIs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 86 },

  // ==== CONTINUE LEARNING ====
  { slug: 'keep-learning-frontend', name: 'Continue Learning ...', description: 'Continued learning paths', difficulty: Difficulty.BEGINNER, sortOrder: 87 },
  { slug: 'typescript-path', name: 'TypeScript', description: 'Advanced TypeScript', difficulty: Difficulty.INTERMEDIATE, sortOrder: 88 },
  { slug: 'nodejs-path', name: 'Node.js', description: 'Node.js backend', difficulty: Difficulty.INTERMEDIATE, sortOrder: 89 },
  { slug: 'fullstack-path', name: 'Full Stack', description: 'Full stack development', difficulty: Difficulty.ADVANCED, sortOrder: 90 },
];

const ROADMAP_EDGES_DATA = [
  // Basics
  { source: 'learn-basics-frontend', target: 'frontend', type: SkillEdgeType.PREREQUISITE },
  { source: 'writing-semantic-html', target: 'learn-basics-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'forms-validations', target: 'learn-basics-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'accessibility-frontend', target: 'learn-basics-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'seo-basics', target: 'learn-basics-frontend', type: SkillEdgeType.SUBSKILL_OF },

  // Internet
  { source: 'internet-frontend', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'how-internet-works', target: 'internet-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'what-http', target: 'internet-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'domain-name', target: 'internet-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hosting-frontend', target: 'internet-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dns-how-works', target: 'internet-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'browsers-how-work', target: 'internet-frontend', type: SkillEdgeType.SUBSKILL_OF },

  // HTML
  { source: 'html-frontend', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'html-frontend', target: 'learn-basics-frontend', type: SkillEdgeType.BUILDS_ON },

  // CSS
  { source: 'css-frontend', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'learn-basics-css', target: 'css-frontend', type: SkillEdgeType.PREREQUISITE },
  { source: 'making-layouts', target: 'css-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'responsive-design', target: 'css-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tailwind', target: 'css-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bem', target: 'css-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'css-architecture', target: 'css-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'css-preprocessors', target: 'css-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sass-postcss', target: 'css-preprocessors', type: SkillEdgeType.SUBSKILL_OF },

  // JavaScript
  { source: 'javascript-frontend', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'learn-basics-js', target: 'javascript-frontend', type: SkillEdgeType.PREREQUISITE },
  { source: 'dom-manipulation', target: 'javascript-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fetch-api', target: 'javascript-frontend', type: SkillEdgeType.SUBSKILL_OF },

  // Package Managers
  { source: 'package-managers', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'npm-frontend', target: 'package-managers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'yarn', target: 'package-managers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pnpm', target: 'package-managers', type: SkillEdgeType.SUBSKILL_OF },

  // Version Control
  { source: 'vcs-frontend', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'git-frontend', target: 'vcs-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'github', target: 'vcs-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gitlab', target: 'vcs-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bitbucket', target: 'vcs-frontend', type: SkillEdgeType.SUBSKILL_OF },

  // Frameworks
  { source: 'pick-framework', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'react-frontend', target: 'pick-framework', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'angular', target: 'pick-framework', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vue', target: 'pick-framework', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'svelte', target: 'pick-framework', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'solid-js', target: 'pick-framework', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'qwik', target: 'pick-framework', type: SkillEdgeType.SUBSKILL_OF },

  // Build Tools
  { source: 'build-tools', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'webpack', target: 'build-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vite', target: 'build-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'parcel', target: 'build-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rollup', target: 'build-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'webpack-parcel', target: 'build-tools', type: SkillEdgeType.SUBSKILL_OF },

  // Testing
  { source: 'testing-frontend', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'unit-testing', target: 'testing-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'playwright', target: 'testing-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cypress', target: 'testing-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'jest-frontend', target: 'testing-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'next-js', target: 'testing-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'react-testing', target: 'testing-frontend', type: SkillEdgeType.SUBSKILL_OF },

  // Web Security
  { source: 'web-security', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cors', target: 'web-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'https', target: 'web-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'content-security-policy', target: 'web-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'owasp-security-risks', target: 'web-security', type: SkillEdgeType.SUBSKILL_OF },

  // Web Components
  { source: 'web-components', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'html-templates', target: 'web-components', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'custom-elements', target: 'web-components', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'shadow-dom', target: 'web-components', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pwa-pattern', target: 'web-components', type: SkillEdgeType.SUBSKILL_OF },

  // Type Checkers
  { source: 'type-checkers', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'typescript-frontend', target: 'type-checkers', type: SkillEdgeType.SUBSKILL_OF },

  // APIs
  { source: 'apis-frontend', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rest', target: 'apis-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'graphql-frontend', target: 'apis-frontend', type: SkillEdgeType.SUBSKILL_OF },

  // Mobile Apps
  { source: 'mobile-apps', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'react-native', target: 'mobile-apps', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nativescript', target: 'mobile-apps', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'flutter', target: 'mobile-apps', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ionic', target: 'mobile-apps', type: SkillEdgeType.SUBSKILL_OF },

  // Performance Best Practices
  { source: 'performance-best-practices', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'storage', target: 'performance-best-practices', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'web-sockets', target: 'performance-best-practices', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'server-sent-events', target: 'performance-best-practices', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'service-workers', target: 'performance-best-practices', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'location', target: 'performance-best-practices', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'notification', target: 'performance-best-practices', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'device-orientation', target: 'performance-best-practices', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'payments', target: 'performance-best-practices', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'credentials', target: 'performance-best-practices', type: SkillEdgeType.SUBSKILL_OF },

  // Browser APIs
  { source: 'browser-apis', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },

  // Keep Learning
  { source: 'keep-learning-frontend', target: 'frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'typescript-path', target: 'keep-learning-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nodejs-path', target: 'keep-learning-frontend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fullstack-path', target: 'keep-learning-frontend', type: SkillEdgeType.SUBSKILL_OF },
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
  console.log('Starting Front-end roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'frontend' },
    update: { name: 'Front-end', description: 'Front-end web development specialization' },
    create: {
      name: 'Front-end',
      slug: 'frontend',
      description: 'Front-end web development specialization',
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
    where: { slug: 'frontend' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'frontend' },
    update: {
      name: 'Front-end',
      description: 'Comprehensive front-end development roadmap covering HTML, CSS, JavaScript, frameworks, build tools, testing, performance optimization, and web APIs',
      icon: '🎨',
      color: '#F97316',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'Front-end',
      slug: 'frontend',
      description: 'Comprehensive front-end development roadmap covering HTML, CSS, JavaScript, frameworks, build tools, testing, performance optimization, and web APIs',
      icon: '🎨',
      color: '#F97316',
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

  console.log('\n✓ Front-end roadmap seeded successfully!');
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

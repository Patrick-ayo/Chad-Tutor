/**
 * Full Stack Roadmap Seed Script
 *
 * Seeds the Full Stack development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/fullstack.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';
import { buildNodeResources } from './resources';

const prisma = new PrismaClient();

// Full Stack Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'fullstack', name: 'Full Stack', description: 'Complete Full Stack development roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 0 },

  // ==== FRONTEND TRACK ====
  { slug: 'fs-html', name: 'HTML', description: 'HyperText Markup Language', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
  { slug: 'fs-css', name: 'CSS', description: 'Cascading Style Sheets', difficulty: Difficulty.BEGINNER, sortOrder: 2 },
  { slug: 'fs-javascript', name: 'JavaScript', description: 'JavaScript programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 3 },

  // Checkpoints - Frontend
  { slug: 'cp-static-webpages', name: 'Checkpoint - Static Webpages', description: 'Build static HTML/CSS webpages', difficulty: Difficulty.BEGINNER, sortOrder: 4 },
  { slug: 'cp-interactivity', name: 'Checkpoint - Interactivity', description: 'Add JavaScript interactivity', difficulty: Difficulty.INTERMEDIATE, sortOrder: 5 },
  { slug: 'cp-collaborative-work', name: 'Checkpoint - Collaborative Work', description: 'Work with version control', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },
  { slug: 'cp-external-packages', name: 'Checkpoint - External Packages', description: 'Use external npm packages', difficulty: Difficulty.INTERMEDIATE, sortOrder: 7 },

  // Frontend Libraries
  { slug: 'fs-react', name: 'React', description: 'React UI library', difficulty: Difficulty.INTERMEDIATE, sortOrder: 8 },
  { slug: 'fs-tailwind', name: 'Tailwind CSS', description: 'Utility-first CSS framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 9 },

  // Version Control
  { slug: 'fs-git', name: 'Git', description: 'Git version control', difficulty: Difficulty.INTERMEDIATE, sortOrder: 10 },
  { slug: 'fs-github', name: 'GitHub', description: 'GitHub platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 11 },

  // Package Manager
  { slug: 'fs-npm', name: 'npm', description: 'Node Package Manager', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },

  // Frontend Apps Checkpoint
  { slug: 'cp-frontend-apps', name: 'Checkpoint - Frontend Apps', description: 'Build complete frontend applications', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },

  // ==== BACKEND TRACK ====
  { slug: 'fs-nodejs', name: 'Node.js', description: 'Node.js runtime', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },

  // Backend Checkpoints
  { slug: 'cp-cli-apps', name: 'Checkpoint - CLI Apps', description: 'Build CLI applications', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },
  { slug: 'cp-simple-crud', name: 'Checkpoint - Simple CRUD Apps', description: 'Build CRUD applications', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },

  // Databases
  { slug: 'fs-postgresql', name: 'PostgreSQL', description: 'PostgreSQL database', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },
  { slug: 'fs-redis', name: 'Redis', description: 'Redis cache and data store', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },

  // Backend Concepts
  { slug: 'fs-jwt-auth', name: 'JWT Auth', description: 'JWT authentication', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'fs-rest-apis', name: 'REST APIs', description: 'RESTful API design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },

  // Complete App Checkpoint
  { slug: 'cp-complete-app', name: 'Checkpoint - Complete App', description: 'Build a complete application', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },

  // AWS Services
  { slug: 'fs-route53', name: 'Route53', description: 'AWS Route53 DNS', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },
  { slug: 'fs-ses', name: 'SES', description: 'AWS Simple Email Service', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'fs-ec2', name: 'EC2', description: 'AWS Elastic Compute Cloud', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },
  { slug: 'fs-vpc', name: 'VPC', description: 'AWS Virtual Private Cloud', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'fs-s3', name: 'S3', description: 'AWS Simple Storage Service', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },

  // Basic AWS
  { slug: 'fs-basic-aws', name: 'Basic AWS Services', description: 'Foundational AWS services', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },

  // ==== DEVOPS TRACK ====
  { slug: 'fs-linux', name: 'Linux Basics', description: 'Linux fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },

  // Deployment
  { slug: 'cp-deployment', name: 'Checkpoint - Deployment', description: 'Deploy applications', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'fs-monit', name: 'Monit', description: 'System monitoring tool', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },

  // CI/CD
  { slug: 'cp-ci-cd', name: 'Checkpoint - CI / CD', description: 'Implement CI/CD pipelines', difficulty: Difficulty.ADVANCED, sortOrder: 31 },
  { slug: 'fs-github-actions', name: 'GitHub Actions', description: 'GitHub Actions CI/CD', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },

  // Infrastructure & Automation
  { slug: 'cp-automation', name: 'Checkpoint - Automation', description: 'Automate infrastructure', difficulty: Difficulty.ADVANCED, sortOrder: 33 },
  { slug: 'fs-ansible', name: 'Ansible', description: 'Ansible automation tool', difficulty: Difficulty.ADVANCED, sortOrder: 34 },
  { slug: 'fs-terraform', name: 'Terraform', description: 'Terraform IaC tool', difficulty: Difficulty.ADVANCED, sortOrder: 35 },

  // Monitoring
  { slug: 'cp-monitoring', name: 'Checkpoint - Monitoring', description: 'Monitor applications and infrastructure', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },

  // Infrastructure Checkpoint
  { slug: 'cp-infrastructure', name: 'Checkpoint - Infrastructure', description: 'Build complete infrastructure', difficulty: Difficulty.ADVANCED, sortOrder: 37 },

  // ==== CONTINUE LEARNING ====
  { slug: 'fs-continue-frontend', name: 'Frontend', description: 'Continue learning frontend', difficulty: Difficulty.INTERMEDIATE, sortOrder: 38 },
  { slug: 'fs-continue-backend', name: 'Backend', description: 'Continue learning backend', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'fs-continue-devops', name: 'DevOps', description: 'Continue learning DevOps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'fs-continue-aws', name: 'AWS', description: 'Continue learning AWS', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
];

const ROADMAP_EDGES_DATA = [
  // Frontend Track
  { source: 'fs-html', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-css', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-javascript', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },

  // First Checkpoint
  { source: 'cp-static-webpages', target: 'fs-html', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-static-webpages', target: 'fs-css', type: SkillEdgeType.BUILDS_ON },

  // Second Checkpoint
  { source: 'cp-interactivity', target: 'fs-javascript', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-interactivity', target: 'cp-static-webpages', type: SkillEdgeType.BUILDS_ON },

  // Version Control
  { source: 'fs-git', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-github', target: 'fs-git', type: SkillEdgeType.SUBSKILL_OF },

  // Third Checkpoint - Collaborative
  { source: 'cp-collaborative-work', target: 'fs-github', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-collaborative-work', target: 'cp-interactivity', type: SkillEdgeType.BUILDS_ON },

  // Package Manager
  { source: 'fs-npm', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },

  // Fourth Checkpoint - External Packages
  { source: 'cp-external-packages', target: 'fs-npm', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-external-packages', target: 'cp-collaborative-work', type: SkillEdgeType.BUILDS_ON },

  // React and Tailwind
  { source: 'fs-react', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-react', target: 'fs-javascript', type: SkillEdgeType.BUILDS_ON },
  { source: 'fs-tailwind', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-tailwind', target: 'fs-css', type: SkillEdgeType.BUILDS_ON },

  // Frontend Apps
  { source: 'cp-frontend-apps', target: 'fs-react', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-frontend-apps', target: 'fs-tailwind', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-frontend-apps', target: 'cp-external-packages', type: SkillEdgeType.BUILDS_ON },

  // ==== BACKEND TRACK ====
  { source: 'fs-nodejs', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-nodejs', target: 'fs-javascript', type: SkillEdgeType.BUILDS_ON },

  // CLI Apps Checkpoint
  { source: 'cp-cli-apps', target: 'fs-nodejs', type: SkillEdgeType.BUILDS_ON },

  // Databases
  { source: 'fs-postgresql', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-redis', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },

  // CRUD Checkpoint
  { source: 'cp-simple-crud', target: 'fs-nodejs', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-simple-crud', target: 'fs-postgresql', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-simple-crud', target: 'cp-cli-apps', type: SkillEdgeType.BUILDS_ON },

  // Authentication
  { source: 'fs-jwt-auth', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },

  // REST APIs
  { source: 'fs-rest-apis', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-rest-apis', target: 'fs-nodejs', type: SkillEdgeType.BUILDS_ON },
  { source: 'fs-rest-apis', target: 'fs-jwt-auth', type: SkillEdgeType.BUILDS_ON },

  // Complete App Checkpoint
  { source: 'cp-complete-app', target: 'fs-rest-apis', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-complete-app', target: 'fs-redis', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-complete-app', target: 'cp-simple-crud', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-complete-app', target: 'cp-frontend-apps', type: SkillEdgeType.BUILDS_ON },

  // AWS Services
  { source: 'fs-route53', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-ses', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-ec2', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-vpc', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-s3', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-basic-aws', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },

  // ==== DEVOPS TRACK ====
  { source: 'fs-linux', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },

  // Deployment
  { source: 'cp-deployment', target: 'fs-ec2', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-deployment', target: 'fs-linux', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-deployment', target: 'cp-complete-app', type: SkillEdgeType.BUILDS_ON },

  // Monitoring
  { source: 'fs-monit', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cp-monitoring', target: 'fs-monit', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-monitoring', target: 'cp-deployment', type: SkillEdgeType.BUILDS_ON },

  // CI/CD
  { source: 'fs-github-actions', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-github-actions', target: 'fs-github', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-ci-cd', target: 'fs-github-actions', type: SkillEdgeType.BUILDS_ON },

  // Automation & Infrastructure
  { source: 'fs-ansible', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-terraform', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'cp-automation', target: 'fs-ansible', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-automation', target: 'fs-terraform', type: SkillEdgeType.BUILDS_ON },

  { source: 'cp-infrastructure', target: 'cp-ci-cd', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-infrastructure', target: 'cp-automation', type: SkillEdgeType.BUILDS_ON },
  { source: 'cp-infrastructure', target: 'cp-monitoring', type: SkillEdgeType.BUILDS_ON },

  // ==== CONTINUE LEARNING ====
  { source: 'fs-continue-frontend', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-continue-backend', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-continue-devops', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fs-continue-aws', target: 'fullstack', type: SkillEdgeType.SUBSKILL_OF },
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
  console.log('Starting Full Stack roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'fullstack' },
    update: { name: 'Full Stack', description: 'Full Stack web development specialization' },
    create: {
      name: 'Full Stack',
      slug: 'fullstack',
      description: 'Full Stack web development specialization',
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
    where: { slug: 'fullstack' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'fullstack' },
    update: {
      name: 'Full Stack',
      description: 'Comprehensive Full Stack development roadmap combining frontend (HTML/CSS/JavaScript/React), backend (Node.js/PostgreSQL/APIs), and DevOps (AWS/Linux/CI-CD) with practical checkpoints',
      icon: '🚀',
      color: '#0EA5E9',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'Full Stack',
      slug: 'fullstack',
      description: 'Comprehensive Full Stack development roadmap combining frontend (HTML/CSS/JavaScript/React), backend (Node.js/PostgreSQL/APIs), and DevOps (AWS/Linux/CI-CD) with practical checkpoints',
      icon: '🚀',
      color: '#0EA5E9',
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

  console.log('\n✓ Full Stack roadmap seeded successfully!');
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

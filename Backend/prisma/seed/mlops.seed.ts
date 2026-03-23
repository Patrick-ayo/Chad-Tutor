/**
 * MLOps Roadmap Seed Script
 *
 * Seeds the MLOps development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/mlops.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';
import { buildNodeResources } from './resources';

const prisma = new PrismaClient();

// MLOps Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'mlops', name: 'MLOps', description: 'Complete MLOps roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 0 },

  // ==== PROGRAMMING FUNDAMENTALS ====
  { slug: 'programming-fundamentals-mlops', name: 'Programming Fundamentals', description: 'Programming languages for MLOps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 1 },
  { slug: 'python-mlops', name: 'Python', description: 'Python programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 2 },
  { slug: 'go-mlops', name: 'Go', description: 'Go programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 3 },
  { slug: 'bash-mlops', name: 'Bash', description: 'Bash shell scripting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 4 },

  // ==== VERSION CONTROL SYSTEMS ====
  { slug: 'version-control-systems', name: 'Version Control Systems', description: 'VCS for MLOps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 5 },
  { slug: 'git-mlops', name: 'Git', description: 'Git version control', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },
  { slug: 'github-mlops', name: 'GitHub', description: 'GitHub hosting platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 7 },

  // ==== CLOUD COMPUTING ====
  { slug: 'cloud-computing-mlops', name: 'Cloud Computing', description: 'Cloud platforms for MLOps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 8 },
  { slug: 'aws-azure-gcp', name: 'AWS / Azure / GCP', description: 'Major cloud providers', difficulty: Difficulty.INTERMEDIATE, sortOrder: 9 },
  { slug: 'cloud-native-ml-services', name: 'Cloud-native ML Services', description: 'Cloud ML services and platforms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 10 },

  // ==== CONTAINERIZATION ====
  { slug: 'containerization', name: 'Containerization', description: 'Container technologies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 11 },
  { slug: 'docker-mlops', name: 'Docker', description: 'Docker containerization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },
  { slug: 'kubernetes-mlops', name: 'Kubernetes', description: 'Kubernetes orchestration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },

  // ==== MACHINE LEARNING FUNDAMENTALS ====
  { slug: 'ml-fundamentals-mlops', name: 'Machine Learning Fundamentals', description: 'ML concepts for MLOps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },

  // ==== DATA ENGINEERING FUNDAMENTALS ====
  { slug: 'data-engineering-fundamentals-mlops', name: 'Data Engineering Fundamentals', description: 'Data engineering for MLOps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },
  { slug: 'data-pipelines-mlops', name: 'Data Pipelines', description: 'Building data pipelines', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'data-lakes-warehouses', name: 'Data Lakes & Warehouses', description: 'Data storage systems', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },
  { slug: 'data-ingestion-architecture', name: 'Data Ingestion Architecture', description: 'Data ingestion patterns', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'spark-mlops', name: 'Spark', description: 'Apache Spark for data processing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'kafka-mlops', name: 'Kafka', description: 'Apache Kafka streaming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },
  { slug: 'flink-mlops', name: 'Flink', description: 'Apache Flink stream processing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },

  // ==== AIRFLOW (DATA PIPELINES COMPONENT) ====
  { slug: 'airflow-mlops', name: 'Airflow', description: 'Apache Airflow orchestration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },

  // ==== MLOps PRINCIPLES ====
  { slug: 'mlops-principles', name: 'MLOps Principles', description: 'Core MLOps principles', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },

  // ==== MLOps COMPONENTS ====
  { slug: 'mlops-components', name: 'MLOps Components', description: 'Key MLOps components', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },

  // Version Control (MLOps Components)
  { slug: 'version-control-mlops-component', name: 'Version Control', description: 'Model version control', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },

  // CI/CD
  { slug: 'ci-cd-mlops', name: 'CI/CD', description: 'Continuous Integration/Deployment', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },

  // Orchestration
  { slug: 'orchestration-mlops', name: 'Orchestration', description: 'Workflow orchestration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },

  // Experiment Tracking & Model Registry
  { slug: 'experiment-tracking-model-registry', name: 'Experiment Tracking & Model Registry', description: 'Tracking experiments and model versions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },

  // Data Lineage & Feature Stores
  { slug: 'data-lineage-feature-stores', name: 'Data Lineage & Feature Stores', description: 'Data tracking and feature management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },

  // Model Training & Serving
  { slug: 'model-training-serving', name: 'Model Training & Serving', description: 'Training and deploying models', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },

  // Monitoring & Observability
  { slug: 'monitoring-observability', name: 'Monitoring & Observability', description: 'System monitoring and debugging', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },

  // ==== INFRASTRUCTURE AS CODE ====
  { slug: 'infrastructure-as-code-mlops', name: 'Infrastructure as Code', description: 'IaC for MLOps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },

  // ==== RELATED ROADMAPS / LEARNING PATHS ====
  { slug: 'ai-data-scientist-link', name: 'AI & Data Scientist', description: 'Related roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },
  { slug: 'devops-link', name: 'DevOps Roadmap', description: 'Related roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },
  { slug: 'backend-link', name: 'Backend Roadmap', description: 'Related roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 35 },
  { slug: 'python-link', name: 'Python Roadmap', description: 'Related roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },
  { slug: 'go-link', name: 'Go Roadmap', description: 'Related roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },

  // ==== KEEP LEARNING ====
  { slug: 'keep-learning-mlops', name: 'Keep learning', description: 'Continue learning MLOps', difficulty: Difficulty.BEGINNER, sortOrder: 38 },
];

const ROADMAP_EDGES_DATA = [
  // Programming Fundamentals
  { source: 'programming-fundamentals-mlops', target: 'mlops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'python-mlops', target: 'programming-fundamentals-mlops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'go-mlops', target: 'programming-fundamentals-mlops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bash-mlops', target: 'programming-fundamentals-mlops', type: SkillEdgeType.SUBSKILL_OF },

  // Version Control Systems
  { source: 'version-control-systems', target: 'mlops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'git-mlops', target: 'version-control-systems', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'github-mlops', target: 'version-control-systems', type: SkillEdgeType.SUBSKILL_OF },

  // Cloud Computing
  { source: 'cloud-computing-mlops', target: 'mlops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'aws-azure-gcp', target: 'cloud-computing-mlops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cloud-native-ml-services', target: 'cloud-computing-mlops', type: SkillEdgeType.SUBSKILL_OF },

  // Containerization
  { source: 'containerization', target: 'mlops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'docker-mlops', target: 'containerization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kubernetes-mlops', target: 'containerization', type: SkillEdgeType.SUBSKILL_OF },

  // ML Fundamentals
  { source: 'ml-fundamentals-mlops', target: 'mlops', type: SkillEdgeType.SUBSKILL_OF },

  // Data Engineering Fundamentals
  { source: 'data-engineering-fundamentals-mlops', target: 'mlops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-pipelines-mlops', target: 'data-engineering-fundamentals-mlops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-lakes-warehouses', target: 'data-engineering-fundamentals-mlops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-ingestion-architecture', target: 'data-engineering-fundamentals-mlops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'spark-mlops', target: 'data-engineering-fundamentals-mlops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kafka-mlops', target: 'data-engineering-fundamentals-mlops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'flink-mlops', target: 'data-engineering-fundamentals-mlops', type: SkillEdgeType.SUBSKILL_OF },

  // Airflow
  { source: 'airflow-mlops', target: 'data-pipelines-mlops', type: SkillEdgeType.SUBSKILL_OF },

  // MLOps Principles
  { source: 'mlops-principles', target: 'mlops', type: SkillEdgeType.SUBSKILL_OF },

  // MLOps Components
  { source: 'mlops-components', target: 'mlops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'version-control-mlops-component', target: 'mlops-components', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ci-cd-mlops', target: 'mlops-components', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'orchestration-mlops', target: 'mlops-components', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'experiment-tracking-model-registry', target: 'mlops-components', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-lineage-feature-stores', target: 'mlops-components', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'model-training-serving', target: 'mlops-components', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'monitoring-observability', target: 'mlops-components', type: SkillEdgeType.SUBSKILL_OF },

  // Infrastructure as Code
  { source: 'infrastructure-as-code-mlops', target: 'mlops', type: SkillEdgeType.SUBSKILL_OF },

  // Related Roadmaps
  { source: 'ai-data-scientist-link', target: 'mlops', type: SkillEdgeType.RELATED },
  { source: 'devops-link', target: 'mlops', type: SkillEdgeType.RELATED },
  { source: 'backend-link', target: 'mlops', type: SkillEdgeType.RELATED },
  { source: 'python-link', target: 'mlops', type: SkillEdgeType.RELATED },
  { source: 'go-link', target: 'mlops', type: SkillEdgeType.RELATED },

  // Keep Learning
  { source: 'keep-learning-mlops', target: 'mlops', type: SkillEdgeType.SUBSKILL_OF },

  // Cross-dependencies
  { source: 'docker-mlops', target: 'cloud-computing-mlops', type: SkillEdgeType.PREREQUISITE },
  { source: 'orchestration-mlops', target: 'containerization', type: SkillEdgeType.PREREQUISITE },
  { source: 'data-pipelines-mlops', target: 'programming-fundamentals-mlops', type: SkillEdgeType.PREREQUISITE },
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
  console.log('Starting MLOps roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'mlops' },
    update: { name: 'MLOps', description: 'MLOps specialization' },
    create: {
      name: 'MLOps',
      slug: 'mlops',
      description: 'MLOps specialization',
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
    where: { slug: 'mlops' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'mlops' },
    update: {
      name: 'MLOps',
      description: 'Comprehensive MLOps roadmap covering programming fundamentals, version control, cloud computing, containerization, machine learning fundamentals, data engineering, MLOps principles and components, and infrastructure as code',
      icon: '🚀',
      color: '#3B82F6',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'MLOps',
      slug: 'mlops',
      description: 'Comprehensive MLOps roadmap covering programming fundamentals, version control, cloud computing, containerization, machine learning fundamentals, data engineering, MLOps principles and components, and infrastructure as code',
      icon: '🚀',
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

  console.log('\n✓ MLOps roadmap seeded successfully!');
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

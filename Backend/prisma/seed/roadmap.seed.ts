/**
 * Roadmap Seed Script
 *
 * Seeds the complete PostgreSQL DBA roadmap from roadmap.sh into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/roadmap.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// PostgreSQL DBA Roadmap - Complete Structure from roadmap.sh
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'postgresql-dba', name: 'PostgreSQL DBA', description: 'Step by step guide to becoming a modern PostgreSQL DB Administrator', difficulty: Difficulty.BEGINNER, sortOrder: 0 },
  
  // Section 1: PostgreSQL Introduction
  { slug: 'postgresql-introduction', name: 'PostgreSQL Introduction', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
  { slug: 'what-are-relational-databases', name: 'What are Relational Databases?', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 2 },
  { slug: 'rdbms-benefits-limitations', name: 'RDBMS Benefits and Limitations', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 3 },
  { slug: 'postgresql-vs-other-rdbms', name: 'PostgreSQL vs Other RDBMS', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 4 },
  { slug: 'postgresql-vs-nosql', name: 'PostgreSQL vs NoSQL Databases', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 5 },
  
  // Section 2: Basic RDBMS Concepts
  { slug: 'basic-rdbms-concepts', name: 'Basic RDBMS Concepts', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 6 },
  
  // Object Model branch
  { slug: 'object-model', name: 'Object Model', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 7 },
  { slug: 'queries', name: 'Queries', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 8 },
  { slug: 'data-types', name: 'Data Types', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 9 },
  { slug: 'rows', name: 'Rows', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 10 },
  { slug: 'columns', name: 'Columns', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 11 },
  { slug: 'tables', name: 'Tables', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 12 },
  { slug: 'schemas', name: 'Schemas', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 13 },
  { slug: 'databases', name: 'Databases', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 14 },
  
  // Relational Model branch
  { slug: 'relational-model', name: 'Relational Model', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 15 },
  { slug: 'domains', name: 'Domains', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 16 },
  { slug: 'attributes', name: 'Attributes', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 17 },
  { slug: 'tuples', name: 'Tuples', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 18 },
  { slug: 'relations', name: 'Relations', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 19 },
  { slug: 'constraints', name: 'Constraints', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 20 },
  { slug: 'null-values', name: 'NULL', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 21 },
  
  // Section 3: High Level Database Concepts
  { slug: 'high-level-database-concepts', name: 'High Level Database Concepts', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },
  { slug: 'acid', name: 'ACID', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'mvcc', name: 'MVCC', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },
  { slug: 'transactions', name: 'Transactions', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'write-ahead-log', name: 'Write-ahead Log', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },
  { slug: 'query-processing', name: 'Query Processing', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },
  
  // Section 4: Installation and Setup
  { slug: 'installation-setup', name: 'Installation and Setup', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 28 },
  { slug: 'using-docker', name: 'Using Docker', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 29 },
  { slug: 'package-managers', name: 'Package Managers', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 30 },
  { slug: 'connect-using-psql', name: 'Connect using psql', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 31 },
  { slug: 'deployment-in-cloud', name: 'Deployment in Cloud', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },
  { slug: 'managing-postgres', name: 'Managing Postgres', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },
  { slug: 'using-systemd', name: 'Using systemd', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },
  { slug: 'using-pg-ctl', name: 'Using pg_ctl', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 35 },
  { slug: 'using-pg-ctlcluster', name: 'Using pg_ctlcluster', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },
  
  // Section 5: Learn SQL
  { slug: 'learn-sql', name: 'Learn SQL', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 37 },
  
  // DDL Queries branch
  { slug: 'ddl-queries', name: 'DDL Queries', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 38 },
  { slug: 'ddl-for-schemas', name: 'For Schemas', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 39 },
  { slug: 'ddl-for-tables', name: 'For Tables', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 40 },
  { slug: 'ddl-data-types', name: 'Data Types', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 41 },
  
  // DML Queries branch
  { slug: 'dml-queries', name: 'DML Queries', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 42 },
  { slug: 'querying-data', name: 'Querying Data', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 43 },
  { slug: 'filtering-data', name: 'Filtering Data', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 44 },
  { slug: 'modifying-data', name: 'Modifying Data', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 45 },
  { slug: 'joining-tables', name: 'Joining Tables', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 46 },
  
  // Other SQL topics
  { slug: 'import-export-copy', name: 'Import / Export Using COPY', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 47 },
  { slug: 'sql-transactions', name: 'Transactions', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  { slug: 'subqueries', name: 'Subqueries', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'grouping', name: 'Grouping', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 50 },
  { slug: 'cte', name: 'CTE', description: 'Common Table Expressions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 51 },
  { slug: 'lateral-join', name: 'Lateral Join', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 52 },
  { slug: 'set-operations', name: 'Set Operations', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },
  
  // Section 6: Advanced Topics
  { slug: 'advanced-topics', name: 'Advanced Topics', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 54 },
  
  // Configuring branch
  { slug: 'configuring', name: 'Configuring', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 55 },
  { slug: 'resource-usage', name: 'Resource Usage', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 56 },
  { slug: 'wal-config', name: 'Write-ahead Log', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 57 },
  { slug: 'vacuums', name: 'Vacuums', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 58 },
  { slug: 'replication', name: 'Replication', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 59 },
  { slug: 'query-planner', name: 'Query Planner', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 60 },
  { slug: 'checkpoints-background-writer', name: 'Checkpoints / Background Writer', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 61 },
  { slug: 'reporting', name: 'Reporting', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 62 },
  { slug: 'logging-statistics', name: 'Logging & Statistics', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 63 },
  { slug: 'adding-extra-extensions', name: 'Adding Extra Extensions', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 64 },
  
  // postgres.conf
  { slug: 'postgres-conf', name: 'Following postgres.conf configuration', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 65 },
  
  // Security branch
  { slug: 'security', name: 'Security', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 66 },
  { slug: 'object-privileges', name: 'Object Privileges', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 67 },
  { slug: 'grant-revoke', name: 'Grant / Revoke', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 68 },
  { slug: 'row-level-security', name: 'Row Level Security', description: '', difficulty: Difficulty.EXPERT, sortOrder: 69 },
  { slug: 'ssl-encryption', name: 'SSL / Encryption', description: '', difficulty: Difficulty.EXPERT, sortOrder: 70 },
  
  // Fine-grained Tuning
  { slug: 'fine-grained-tuning', name: 'Fine-grained Tuning', description: '', difficulty: Difficulty.EXPERT, sortOrder: 71 },
  
  // Section 7: Troubleshooting
  { slug: 'troubleshooting', name: 'Troubleshooting Techniques', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 72 },
  { slug: 'pg-stat-views', name: 'pg_stat Views', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 73 },
  { slug: 'analyze-explain', name: 'ANALYZE / EXPLAIN', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 74 },
  { slug: 'pg-stat-statements', name: 'pg_stat_statements', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 75 },
  { slug: 'logs-profiling', name: 'Logs / Profiling', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 76 },
  
  // Section 8: Backup and Recovery
  { slug: 'backup-recovery', name: 'Backup and Recovery', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 77 },
  { slug: 'pg-dump', name: 'pg_dump', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 78 },
  { slug: 'pg-restore', name: 'pg_restore', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 79 },
  { slug: 'backup-strategies', name: 'Backup Strategies', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 80 },
  { slug: 'point-in-time-recovery', name: 'Point-in-Time Recovery', description: '', difficulty: Difficulty.EXPERT, sortOrder: 81 },
];

// PostgreSQL DBA Roadmap Edges (parent-child relationships)
// Format: { source: 'child-slug', target: 'parent-slug', ... }
const ROADMAP_EDGES = [
  // Top-level sections -> Root
  { source: 'postgresql-introduction', target: 'postgresql-dba', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'basic-rdbms-concepts', target: 'postgresql-dba', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'high-level-database-concepts', target: 'postgresql-dba', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'installation-setup', target: 'postgresql-dba', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'learn-sql', target: 'postgresql-dba', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'advanced-topics', target: 'postgresql-dba', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'troubleshooting', target: 'postgresql-dba', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'backup-recovery', target: 'postgresql-dba', type: SkillEdgeType.SUBSKILL_OF },
  
  // PostgreSQL Introduction children
  { source: 'what-are-relational-databases', target: 'postgresql-introduction', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rdbms-benefits-limitations', target: 'postgresql-introduction', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'postgresql-vs-other-rdbms', target: 'postgresql-introduction', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'postgresql-vs-nosql', target: 'postgresql-introduction', type: SkillEdgeType.SUBSKILL_OF },
  
  // Basic RDBMS Concepts children
  { source: 'object-model', target: 'basic-rdbms-concepts', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'relational-model', target: 'basic-rdbms-concepts', type: SkillEdgeType.SUBSKILL_OF },
  
  // Object Model children
  { source: 'queries', target: 'object-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-types', target: 'object-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rows', target: 'object-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'columns', target: 'object-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tables', target: 'object-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'schemas', target: 'object-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'databases', target: 'object-model', type: SkillEdgeType.SUBSKILL_OF },
  
  // Relational Model children
  { source: 'domains', target: 'relational-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'attributes', target: 'relational-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tuples', target: 'relational-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'relations', target: 'relational-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'constraints', target: 'relational-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'null-values', target: 'relational-model', type: SkillEdgeType.SUBSKILL_OF },
  
  // High Level Database Concepts children
  { source: 'acid', target: 'high-level-database-concepts', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mvcc', target: 'high-level-database-concepts', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'transactions', target: 'high-level-database-concepts', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'write-ahead-log', target: 'high-level-database-concepts', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'query-processing', target: 'high-level-database-concepts', type: SkillEdgeType.SUBSKILL_OF },
  
  // Installation and Setup children
  { source: 'using-docker', target: 'installation-setup', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'package-managers', target: 'installation-setup', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'connect-using-psql', target: 'installation-setup', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'deployment-in-cloud', target: 'installation-setup', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'managing-postgres', target: 'installation-setup', type: SkillEdgeType.SUBSKILL_OF },
  
  // Managing Postgres children
  { source: 'using-systemd', target: 'managing-postgres', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'using-pg-ctl', target: 'managing-postgres', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'using-pg-ctlcluster', target: 'managing-postgres', type: SkillEdgeType.SUBSKILL_OF },
  
  // Learn SQL children
  { source: 'ddl-queries', target: 'learn-sql', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dml-queries', target: 'learn-sql', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'import-export-copy', target: 'learn-sql', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sql-transactions', target: 'learn-sql', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'subqueries', target: 'learn-sql', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'grouping', target: 'learn-sql', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cte', target: 'learn-sql', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'lateral-join', target: 'learn-sql', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'set-operations', target: 'learn-sql', type: SkillEdgeType.SUBSKILL_OF },
  
  // DDL Queries children
  { source: 'ddl-for-schemas', target: 'ddl-queries', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ddl-for-tables', target: 'ddl-queries', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ddl-data-types', target: 'ddl-queries', type: SkillEdgeType.SUBSKILL_OF },
  
  // DML Queries children
  { source: 'querying-data', target: 'dml-queries', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'filtering-data', target: 'dml-queries', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'modifying-data', target: 'dml-queries', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'joining-tables', target: 'dml-queries', type: SkillEdgeType.SUBSKILL_OF },
  
  // Advanced Topics children
  { source: 'configuring', target: 'advanced-topics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'postgres-conf', target: 'advanced-topics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'security', target: 'advanced-topics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fine-grained-tuning', target: 'advanced-topics', type: SkillEdgeType.SUBSKILL_OF },
  
  // Configuring children
  { source: 'resource-usage', target: 'configuring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'wal-config', target: 'configuring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vacuums', target: 'configuring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'replication', target: 'configuring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'query-planner', target: 'configuring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'checkpoints-background-writer', target: 'configuring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'reporting', target: 'configuring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'logging-statistics', target: 'configuring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'adding-extra-extensions', target: 'configuring', type: SkillEdgeType.SUBSKILL_OF },
  
  // Security children
  { source: 'object-privileges', target: 'security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'grant-revoke', target: 'security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'row-level-security', target: 'security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ssl-encryption', target: 'security', type: SkillEdgeType.SUBSKILL_OF },
  
  // Troubleshooting children
  { source: 'pg-stat-views', target: 'troubleshooting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'analyze-explain', target: 'troubleshooting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pg-stat-statements', target: 'troubleshooting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'logs-profiling', target: 'troubleshooting', type: SkillEdgeType.SUBSKILL_OF },
  
  // Backup and Recovery children
  { source: 'pg-dump', target: 'backup-recovery', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pg-restore', target: 'backup-recovery', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'backup-strategies', target: 'backup-recovery', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'point-in-time-recovery', target: 'backup-recovery', type: SkillEdgeType.SUBSKILL_OF },
];

async function main() {
  console.log('Starting PostgreSQL DBA roadmap seed...');
  
  // Upsert the 'Data & Databases' category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'data' },
    update: {},
    create: {
      name: 'Data & Databases',
      slug: 'data',
      description: 'Data structures, algorithms, and databases',
      icon: '📊',
      color: '#8B5CF6',
      sortOrder: 3,
    },
  });
  console.log('✓ Category created/updated');

  // Build nodes with categoryId
  const ROADMAP_NODES = ROADMAP_NODES_DATA.map(node => ({
    ...node,
    categoryId: category.id,
    normalizedName: node.name.toLowerCase(),
  }));

  // Insert all nodes (skills)
  console.log(`Inserting ${ROADMAP_NODES.length} skills...`);
  for (const node of ROADMAP_NODES) {
    await prisma.skill.upsert({
      where: { slug: node.slug },
      update: {
        name: node.name,
        description: node.description,
        categoryId: node.categoryId,
        difficulty: node.difficulty,
        normalizedName: node.normalizedName,
        sortOrder: node.sortOrder,
      },
      create: {
        slug: node.slug,
        name: node.name,
        description: node.description,
        categoryId: node.categoryId,
        difficulty: node.difficulty,
        normalizedName: node.normalizedName,
        sortOrder: node.sortOrder,
        isCanonical: true,
        isPublished: true,
      },
    });
  }
  console.log(`✓ ${ROADMAP_NODES.length} skills inserted`);

  // Get the root skill
  const rootSkill = await prisma.skill.findUnique({ where: { slug: 'postgresql-dba' } });

  // Create or update the PostgreSQL DBA Roadmap
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'postgresql-dba' },
    update: {
      name: 'PostgreSQL DBA',
      description: 'Step by step guide to becoming a modern PostgreSQL DB Administrator in 2026',
      icon: '🐘',
      color: '#336791',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'PostgreSQL DBA',
      slug: 'postgresql-dba',
      description: 'Step by step guide to becoming a modern PostgreSQL DB Administrator in 2026',
      icon: '🐘',
      color: '#336791',
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
  console.log(`Inserting ${ROADMAP_EDGES.length} edges...`);
  for (const edge of ROADMAP_EDGES) {
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
    } else {
      console.warn(`⚠ Skipped edge: ${edge.source} -> ${edge.target} (not found)`);
    }
  }
  console.log(`✓ ${ROADMAP_EDGES.length} edges inserted`);

  console.log('\n✓ PostgreSQL DBA roadmap seeded successfully!');
  console.log(`  - ${ROADMAP_NODES.length} skills`);
  console.log(`  - ${ROADMAP_EDGES.length} edges`);
}

main()
  .catch((e) => {
    console.error('Error seeding roadmap:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * BI Analyst Roadmap Seed Script
 *
 * Seeds the BI Analyst development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/bi-analyst.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';
import { buildNodeResources } from './resources';

const prisma = new PrismaClient();

// BI Analyst Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'bi-analyst', name: 'BI Analyst', description: 'Complete Business Intelligence Analyst roadmap', difficulty: Difficulty.BEGINNER, sortOrder: 0 },

  // ==== BUSINESS FUNDAMENTALS ====
  { slug: 'business-fundamentals', name: 'Business Fundamentals', description: 'Core business concepts and metrics', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
  { slug: 'analysis', name: 'Analysis', description: 'Business analysis methodology', difficulty: Difficulty.BEGINNER, sortOrder: 2 },
  { slug: 'dashboards', name: 'Dashboards', description: 'Dashboard design and development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 3 },
  { slug: 'reports', name: 'Reports', description: 'Report creation and design', difficulty: Difficulty.BEGINNER, sortOrder: 4 },
  { slug: 'processes', name: 'Processes', description: 'Business process understanding', difficulty: Difficulty.BEGINNER, sortOrder: 5 },
  
  { slug: 'key-metrics', name: 'Key Metrics', description: 'KPI and metric selection', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },
  { slug: 'business-metrics', name: 'Business Metrics', description: 'Business-specific metrics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 7 },
  { slug: 'financial-metrics', name: 'Financial Metrics', description: 'Financial KPIs and metrics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 8 },
  { slug: 'operational-metrics', name: 'Operational Metrics', description: 'Operational performance metrics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 9 },

  { slug: 'data-quality', name: 'Data Quality', description: 'Data quality management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 10 },
  { slug: 'data-quality-frameworks', name: 'Data Quality Frameworks', description: 'Quality assessment frameworks', difficulty: Difficulty.INTERMEDIATE, sortOrder: 11 },
  { slug: 'quality-assurance', name: 'Quality Assurance', description: 'QA processes and testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },
  { slug: 'data-reconciliation', name: 'Data Reconciliation', description: 'Data reconciliation methods', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },

  // ==== STATISTICS BASICS ====
  { slug: 'statistics-basics', name: 'Statistics Basics', description: 'Statistical foundations for BI', difficulty: Difficulty.BEGINNER, sortOrder: 14 },
  { slug: 'descriptive-statistics', name: 'Descriptive Statistics', description: 'Descriptive statistical analysis', difficulty: Difficulty.BEGINNER, sortOrder: 15 },
  { slug: 'diagnostic-analysis', name: 'Diagnostic Analysis', description: 'Diagnostic analysis techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'inferential-analysis', name: 'Inferential Analysis', description: 'Inferential statistical methods', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },
  { slug: 'predictive-analysis', name: 'Predictive Analysis', description: 'Predictive modeling and forecasting', difficulty: Difficulty.ADVANCED, sortOrder: 18 },
  { slug: 'correlation-analysis', name: 'Correlation Analysis', description: 'Correlation and regression analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'diagnostic-statistics', name: 'Diagnostic Statistics', description: 'Diagnostic statistical techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },

  // ==== BI TECHNICAL SKILLS ====
  { slug: 'bi-technical-skills', name: 'BI Technical Skills', description: 'Technical skills for BI professionals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'statistical-thinking', name: 'Statistical Thinking', description: 'Statistical thinking and reasoning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },
  { slug: 'statistical-testing', name: 'Statistical Testing', description: 'Hypothesis testing and validation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'forecasting', name: 'Forecasting', description: 'Time series and forecasting techniques', difficulty: Difficulty.ADVANCED, sortOrder: 24 },

  // ==== SQL PROGRAMMING ====
  { slug: 'sql-programming', name: 'SQL Programming', description: 'SQL fundamentals and advanced queries', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'basic-sql', name: 'Basic SQL', description: 'SQL SELECT, WHERE, JOIN basics', difficulty: Difficulty.BEGINNER, sortOrder: 26 },
  
  { slug: 'intermediate-sql', name: 'Intermediate SQL', description: 'Intermediate SQL queries', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },
  { slug: 'joins', name: 'Joins', description: 'SQL JOINs and relationships', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },
  { slug: 'sql-joins-types', name: 'Types of Joins', description: 'INNER, LEFT, RIGHT, FULL OUTER joins', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'multiple-joins', name: 'Multiple Joins', description: 'Complex multi-table joins', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },

  { slug: 'advanced-sql', name: 'Advanced SQL', description: 'Advanced SQL techniques', difficulty: Difficulty.ADVANCED, sortOrder: 31 },
  { slug: 'cte-window-functions', name: 'CTEs & Window Functions', description: 'Common Table Expressions and Window Functions', difficulty: Difficulty.ADVANCED, sortOrder: 32 },
  { slug: 'stored-procedures', name: 'Stored Procedures', description: 'Stored procedures and functions', difficulty: Difficulty.ADVANCED, sortOrder: 33 },
  { slug: 'optimization', name: 'Optimization', description: 'Query optimization and performance tuning', difficulty: Difficulty.ADVANCED, sortOrder: 34 },

  // ==== VISUALIZATION DATA ====
  { slug: 'visualization-data', name: 'Visualization Data', description: 'Data visualization principles and tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 35 },
  
  { slug: 'visualization-fundamentals', name: 'Visualization Fundamentals', description: 'Core visualization principles', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },
  { slug: 'visualization-best-practices', name: 'Best Practices', description: 'Visualization best practices', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },
  { slug: 'data-storytelling', name: 'Data Storytelling', description: 'Communicating insights through data', difficulty: Difficulty.INTERMEDIATE, sortOrder: 38 },

  { slug: 'popular-tools', name: 'Popular Tools', description: 'Popular visualization tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'tableau', name: 'Tableau', description: 'Tableau data visualization platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'power-bi', name: 'Power BI', description: 'Microsoft Power BI platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'looker', name: 'Looker', description: 'Google Looker platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },
  { slug: 'qlik', name: 'Qlik', description: 'Qlik analytics platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },

  { slug: 'open-source-tools', name: 'Open Source Tools', description: 'Open source visualization tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },
  { slug: 'matplotlib', name: 'Matplotlib', description: 'Python Matplotlib library', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },
  { slug: 'plotly', name: 'Plotly', description: 'Plotly interactive visualizations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'ggplot2', name: 'ggplot2', description: 'R ggplot2 visualization package', difficulty: Difficulty.INTERMEDIATE, sortOrder: 47 },

  // ==== BI TOOLS ====
  { slug: 'bi-tools', name: 'BI Tools', description: 'Business Intelligence platforms and tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  { slug: 'ibm-cognos', name: 'IBM Cognos', description: 'IBM Cognos Analytics platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'microstrategy', name: 'MicroStrategy', description: 'MicroStrategy analytics platform', difficulty: Difficulty.ADVANCED, sortOrder: 50 },
  { slug: 'sap-businessobjects', name: 'SAP BusinessObjects', description: 'SAP BusinessObjects BI platform', difficulty: Difficulty.ADVANCED, sortOrder: 51 },
  { slug: 'sisense', name: 'Sisense', description: 'Sisense analytics platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'domo', name: 'Domo', description: 'Domo business intelligence platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },

  // ==== CLOUD COMPUTING ====
  { slug: 'cloud-computing', name: 'Cloud Computing', description: 'Cloud-based BI and analytics services', difficulty: Difficulty.INTERMEDIATE, sortOrder: 54 },
  { slug: 'cloud-providers', name: 'Cloud Providers', description: 'Cloud service providers', difficulty: Difficulty.INTERMEDIATE, sortOrder: 55 },
  { slug: 'aws', name: 'AWS', description: 'Amazon Web Services', difficulty: Difficulty.INTERMEDIATE, sortOrder: 56 },
  { slug: 'azure', name: 'Azure', description: 'Microsoft Azure cloud', difficulty: Difficulty.INTERMEDIATE, sortOrder: 57 },
  { slug: 'gcp', name: 'GCP', description: 'Google Cloud Platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 58 },
  { slug: 'programming-languages', name: 'Programming Languages', description: 'Languages for BI development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 59 },
  { slug: 'python-bi', name: 'Python', description: 'Python for BI and analytics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },
  { slug: 'r-language', name: 'R', description: 'R for statistical analysis and visualization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 61 },

  // ==== BUSINESS APPLICATIONS ====
  { slug: 'business-applications', name: 'Business Applications', description: 'Business application systems and integration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 62 },
  { slug: 'basic-crm', name: 'Basic CRM', description: 'CRM systems fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 63 },
  { slug: 'managing-optimization', name: 'Managing & Optimization', description: 'Business optimization techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 64 },
  { slug: 'financial-performance', name: 'Financial Performance', description: 'Financial performance analytics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 65 },
  { slug: 'process-improvement', name: 'Process Improvement', description: 'Business process optimization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 66 },
  { slug: 'inventory-management', name: 'Inventory Management', description: 'Inventory and supply chain analytics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 67 },
  { slug: 'supply-chain-analytics', name: 'Supply Chain Analytics', description: 'End-to-end supply chain insights', difficulty: Difficulty.INTERMEDIATE, sortOrder: 68 },

  // ==== BI TECHNIQUES ====
  { slug: 'bi-techniques', name: 'BI Techniques', description: 'Advanced BI implementation techniques', difficulty: Difficulty.ADVANCED, sortOrder: 69 },
  { slug: 'data-warehouse-design', name: 'Data Warehouse Design', description: 'Data warehouse architecture and design', difficulty: Difficulty.ADVANCED, sortOrder: 70 },
  { slug: 'etl-processes', name: 'ETL Processes', description: 'Extract, Transform, Load operations', difficulty: Difficulty.ADVANCED, sortOrder: 71 },
  { slug: 'data-modeling', name: 'Data Modeling', description: 'Dimensional and ER data modeling', difficulty: Difficulty.ADVANCED, sortOrder: 72 },
  { slug: 'agile-methodologies', name: 'Agile Methodologies', description: 'Agile project management for BI', difficulty: Difficulty.INTERMEDIATE, sortOrder: 73 },

  // ==== PROFESSIONAL EXCELLENCE ====
  { slug: 'professional-excellence', name: 'Professional Excellence', description: 'Soft skills and professional development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 74 },
  { slug: 'communication-skills', name: 'Communication Skills', description: 'Effective communication for BI professionals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 75 },
  { slug: 'presentation-skills', name: 'Presentation Skills', description: 'Presenting insights to stakeholders', difficulty: Difficulty.INTERMEDIATE, sortOrder: 76 },
  { slug: 'critical-thinking', name: 'Critical Thinking', description: 'Analytical and critical thinking', difficulty: Difficulty.INTERMEDIATE, sortOrder: 77 },
  { slug: 'business-acumen', name: 'Business Acumen', description: 'Understanding business operations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 78 },
  { slug: 'change-management', name: 'Change Management', description: 'Managing organizational change', difficulty: Difficulty.INTERMEDIATE, sortOrder: 79 },
  { slug: 'strategic-thinking', name: 'Strategic Thinking', description: 'Strategic planning and alignment', difficulty: Difficulty.ADVANCED, sortOrder: 80 },

  // ==== DATA GOVERNANCE & ETHICS ====
  { slug: 'data-governance-ethics', name: 'Data Governance & Ethics', description: 'Data governance and ethical considerations', difficulty: Difficulty.ADVANCED, sortOrder: 81 },
  { slug: 'data-governance', name: 'Data Governance', description: 'Data governance frameworks and policies', difficulty: Difficulty.ADVANCED, sortOrder: 82 },
  { slug: 'data-privacy', name: 'Data Privacy', description: 'GDPR, privacy regulations compliance', difficulty: Difficulty.ADVANCED, sortOrder: 83 },
  { slug: 'data-security', name: 'Data Security', description: 'Data security best practices', difficulty: Difficulty.ADVANCED, sortOrder: 84 },
  { slug: 'ethics-ai', name: 'Ethics & AI', description: 'Ethical considerations in AI/ML', difficulty: Difficulty.ADVANCED, sortOrder: 85 },

  // ==== DATA ARCHITECTURE ====
  { slug: 'data-architecture', name: 'Data Architecture', description: 'Data architecture patterns and design', difficulty: Difficulty.ADVANCED, sortOrder: 86 },
  { slug: 'olap', name: 'OLAP', description: 'Online Analytical Processing', difficulty: Difficulty.ADVANCED, sortOrder: 87 },
  { slug: 'oltp', name: 'OLTP', description: 'Online Transaction Processing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 88 },
  { slug: 'data-lake', name: 'Data Lake', description: 'Data lake architecture', difficulty: Difficulty.ADVANCED, sortOrder: 89 },
  { slug: 'data-mart', name: 'Data Mart', description: 'Data mart design', difficulty: Difficulty.ADVANCED, sortOrder: 90 },
  { slug: 'cloud-data-warehouse', name: 'Cloud Data Warehouse', description: 'Snowflake, BigQuery, Redshift', difficulty: Difficulty.ADVANCED, sortOrder: 91 },

  // ==== CAREER DEVELOPMENT ====
  { slug: 'career-development', name: 'Career Development', description: 'Career paths and growth opportunities', difficulty: Difficulty.INTERMEDIATE, sortOrder: 92 },
  { slug: 'junior-analyst', name: 'Junior Analyst', description: 'Entry-level BI analyst role', difficulty: Difficulty.BEGINNER, sortOrder: 93 },
  { slug: 'senior-analyst', name: 'Senior Analyst', description: 'Senior BI analyst responsibilities', difficulty: Difficulty.ADVANCED, sortOrder: 94 },
  { slug: 'architect', name: 'Architect', description: 'BI solution architect role', difficulty: Difficulty.EXPERT, sortOrder: 95 },
];

const ROADMAP_EDGES_DATA = [
  // Business Fundamentals
  { source: 'business-fundamentals', target: 'bi-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'analysis', target: 'business-fundamentals', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dashboards', target: 'business-fundamentals', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'reports', target: 'business-fundamentals', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'processes', target: 'business-fundamentals', type: SkillEdgeType.SUBSKILL_OF },
  
  { source: 'key-metrics', target: 'business-fundamentals', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'business-metrics', target: 'key-metrics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'financial-metrics', target: 'key-metrics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'operational-metrics', target: 'key-metrics', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'data-quality', target: 'business-fundamentals', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-quality-frameworks', target: 'data-quality', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'quality-assurance', target: 'data-quality', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-reconciliation', target: 'data-quality', type: SkillEdgeType.SUBSKILL_OF },

  // Statistics Basics
  { source: 'statistics-basics', target: 'bi-analyst', type: SkillEdgeType.PREREQUISITE },
  { source: 'descriptive-statistics', target: 'statistics-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'diagnostic-analysis', target: 'statistics-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'inferential-analysis', target: 'statistics-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'predictive-analysis', target: 'statistics-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'correlation-analysis', target: 'statistics-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'diagnostic-statistics', target: 'statistics-basics', type: SkillEdgeType.SUBSKILL_OF },

  // BI Technical Skills
  { source: 'bi-technical-skills', target: 'bi-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'statistical-thinking', target: 'bi-technical-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'statistical-testing', target: 'bi-technical-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'forecasting', target: 'bi-technical-skills', type: SkillEdgeType.SUBSKILL_OF },

  // SQL Programming
  { source: 'sql-programming', target: 'bi-analyst', type: SkillEdgeType.PREREQUISITE },
  { source: 'basic-sql', target: 'sql-programming', type: SkillEdgeType.SUBSKILL_OF },
  
  { source: 'intermediate-sql', target: 'sql-programming', type: SkillEdgeType.BUILDS_ON },
  { source: 'joins', target: 'intermediate-sql', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sql-joins-types', target: 'joins', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'multiple-joins', target: 'joins', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'advanced-sql', target: 'intermediate-sql', type: SkillEdgeType.BUILDS_ON },
  { source: 'cte-window-functions', target: 'advanced-sql', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'stored-procedures', target: 'advanced-sql', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'optimization', target: 'advanced-sql', type: SkillEdgeType.SUBSKILL_OF },

  // Visualization Data
  { source: 'visualization-data', target: 'bi-analyst', type: SkillEdgeType.SUBSKILL_OF },
  
  { source: 'visualization-fundamentals', target: 'visualization-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'visualization-best-practices', target: 'visualization-fundamentals', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-storytelling', target: 'visualization-fundamentals', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'popular-tools', target: 'visualization-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tableau', target: 'popular-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'power-bi', target: 'popular-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'looker', target: 'popular-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'qlik', target: 'popular-tools', type: SkillEdgeType.SUBSKILL_OF },

  { source: 'open-source-tools', target: 'visualization-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'matplotlib', target: 'open-source-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'plotly', target: 'open-source-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ggplot2', target: 'open-source-tools', type: SkillEdgeType.SUBSKILL_OF },

  // BI Tools
  { source: 'bi-tools', target: 'bi-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ibm-cognos', target: 'bi-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'microstrategy', target: 'bi-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sap-businessobjects', target: 'bi-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sisense', target: 'bi-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'domo', target: 'bi-tools', type: SkillEdgeType.SUBSKILL_OF },

  // Cloud Computing
  { source: 'cloud-computing', target: 'bi-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cloud-providers', target: 'cloud-computing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'aws', target: 'cloud-providers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'azure', target: 'cloud-providers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gcp', target: 'cloud-providers', type: SkillEdgeType.SUBSKILL_OF },
  
  { source: 'programming-languages', target: 'cloud-computing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'python-bi', target: 'programming-languages', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'r-language', target: 'programming-languages', type: SkillEdgeType.SUBSKILL_OF },

  // Business Applications
  { source: 'business-applications', target: 'bi-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'basic-crm', target: 'business-applications', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'managing-optimization', target: 'business-applications', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'financial-performance', target: 'managing-optimization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'process-improvement', target: 'managing-optimization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'inventory-management', target: 'business-applications', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'supply-chain-analytics', target: 'inventory-management', type: SkillEdgeType.SUBSKILL_OF },

  // BI Techniques
  { source: 'bi-techniques', target: 'bi-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-warehouse-design', target: 'bi-techniques', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'etl-processes', target: 'bi-techniques', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-modeling', target: 'bi-techniques', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'agile-methodologies', target: 'bi-techniques', type: SkillEdgeType.SUBSKILL_OF },

  // Professional Excellence
  { source: 'professional-excellence', target: 'bi-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'communication-skills', target: 'professional-excellence', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'presentation-skills', target: 'professional-excellence', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'critical-thinking', target: 'professional-excellence', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'business-acumen', target: 'professional-excellence', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'change-management', target: 'professional-excellence', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'strategic-thinking', target: 'professional-excellence', type: SkillEdgeType.SUBSKILL_OF },

  // Data Governance & Ethics
  { source: 'data-governance-ethics', target: 'bi-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-governance', target: 'data-governance-ethics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-privacy', target: 'data-governance-ethics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-security', target: 'data-governance-ethics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ethics-ai', target: 'data-governance-ethics', type: SkillEdgeType.SUBSKILL_OF },

  // Data Architecture
  { source: 'data-architecture', target: 'bi-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'olap', target: 'data-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'oltp', target: 'data-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-lake', target: 'data-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-mart', target: 'data-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cloud-data-warehouse', target: 'data-architecture', type: SkillEdgeType.SUBSKILL_OF },

  // Career Development
  { source: 'career-development', target: 'bi-analyst', type: SkillEdgeType.RELATED },
  { source: 'junior-analyst', target: 'career-development', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'senior-analyst', target: 'career-development', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'architect', target: 'career-development', type: SkillEdgeType.SUBSKILL_OF },

  // Cross-domain dependencies
  { source: 'statistical-thinking', target: 'statistics-basics', type: SkillEdgeType.BUILDS_ON },
  { source: 'data-modeling', target: 'sql-programming', type: SkillEdgeType.BUILDS_ON },
  { source: 'dashboards', target: 'visualization-data', type: SkillEdgeType.BUILDS_ON },
  { source: 'reports', target: 'visualization-data', type: SkillEdgeType.BUILDS_ON },
];

async function main() {
  console.log('Starting BI Analyst roadmap seed...');
  
  // Upsert the 'Data Science' category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'data-science' },
    update: {},
    create: {
      name: 'Data Science',
      slug: 'data-science',
      description: 'Data Science and Business Intelligence learning paths',
      icon: '📊',
      color: '#FF914D',
      sortOrder: 5,
    },
  });
  console.log('✓ Category created/updated');

  // Build nodes with categoryId
  const ROADMAP_NODES = ROADMAP_NODES_DATA.map(node => ({
    ...node,
    categoryId: category.id,
    normalizedName: node.name.toLowerCase(),
    resources: buildNodeResources(node.name, node.slug),
  }));

  // Insert all nodes (skills)
  console.log(`Inserting ${ROADMAP_NODES.length} skills...`);
  for (const node of ROADMAP_NODES) {
    await prisma.skill.upsert({
      where: { slug: node.slug },
      update: {
        name: node.name,
        description: node.description,
        resources: (node as any).resources,
        categoryId: node.categoryId,
        difficulty: node.difficulty,
        normalizedName: node.normalizedName,
        sortOrder: node.sortOrder,
      },
      create: {
        slug: node.slug,
        name: node.name,
        description: node.description,
        resources: (node as any).resources,
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
  const rootSkill = await prisma.skill.findUnique({ where: { slug: 'bi-analyst' } });

  // Create or update the BI Analyst Roadmap
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'bi-analyst' },
    update: {
      name: 'BI Analyst',
      description: 'Complete Business Intelligence Analyst roadmap covering statistics, SQL, data visualization, BI tools, cloud platforms, data architecture, and professional development',
      icon: '📊',
      color: '#FF914D',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'BI Analyst',
      slug: 'bi-analyst',
      description: 'Complete Business Intelligence Analyst roadmap covering statistics, SQL, data visualization, BI tools, cloud platforms, data architecture, and professional development',
      icon: '📊',
      color: '#FF914D',
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
    } else {
      console.warn(`⚠ Skipped edge: ${edge.source} -> ${edge.target} (not found)`);
    }
  }
  console.log(`✓ ${ROADMAP_EDGES_DATA.length} edges inserted`);

  console.log('\n✓ BI Analyst roadmap seeded successfully!');
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

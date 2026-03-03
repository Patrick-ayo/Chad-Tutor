/**
 * AI and Data Scientist Roadmap Seed Script
 *
 * Seeds the AI and Data Scientist roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/ai-data-scientist.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// AI and Data Scientist Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'ai-data-scientist', name: 'AI and Data Scientist', description: 'A comprehensive roadmap for becoming an AI and Data Scientist', difficulty: Difficulty.BEGINNER, sortOrder: 0 },
  
  // Stage 1: Mathematics
  { slug: 'mathematics', name: 'Mathematics', description: 'Foundation course covering linear algebra, calculus, and mathematical analysis', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
  { slug: 'linear-algebra-calculus-analysis', name: 'Linear Algebra, Calculus, Mathematical Analysis', description: 'Core mathematical concepts', difficulty: Difficulty.BEGINNER, sortOrder: 2 },
  { slug: 'math-for-ml', name: 'Mathematics for Machine Learning', description: 'Coursera course on mathematics for ML', difficulty: Difficulty.BEGINNER, sortOrder: 3 },
  { slug: 'differential-calculus', name: 'Differential Calculus', description: 'Differential calculus concepts', difficulty: Difficulty.BEGINNER, sortOrder: 4 },
  { slug: 'coursera-algebra-calculus', name: 'Coursera: Algebra and Differential Calculus', description: 'Coursera course on algebra and differential calculus', difficulty: Difficulty.BEGINNER, sortOrder: 5 },

  // Stage 2: Statistics
  { slug: 'statistics', name: 'Statistics', description: 'Statistical foundations and testing methodologies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },
  { slug: 'stats-clt', name: 'Statistics, CLT', description: 'Central limit theorem and statistical concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 7 },
  { slug: 'intro-to-stats', name: 'Coursera Introduction to Statistics', description: 'Coursera introduction to statistics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 8 },
  { slug: 'hypothesis-testing', name: 'Hypothesis Testing', description: 'Hypothesis testing methodologies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 9 },
  { slug: 'coursera-hypothesis-testing', name: 'Coursera: Hypothesis Testing', description: 'Coursera course on hypothesis testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 10 },
  { slug: 'probability-sampling', name: 'Probability and Sampling', description: 'Probability and sampling techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 11 },
  { slug: 'coursera-probability-stats', name: 'Coursera: Probability and Statistics', description: 'Coursera course on probability and statistics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },
  { slug: 'ab-testing', name: 'AB Testing', description: 'A/B testing methodologies', difficulty: Difficulty.ADVANCED, sortOrder: 13 },
  { slug: 'guide-statistical-tests', name: 'Practitioner\'s Guide to Statistical Tests', description: 'Article on statistical testing practices', difficulty: Difficulty.ADVANCED, sortOrder: 14 },
  { slug: 'experiment-design', name: 'Experiment Design Article', description: 'Article on experiment design', difficulty: Difficulty.ADVANCED, sortOrder: 15 },
  { slug: 'increasing-test-sensitivity', name: 'Increasing Test Sensitivity', description: 'Techniques to increase test sensitivity', difficulty: Difficulty.ADVANCED, sortOrder: 16 },
  { slug: 'minimum-detectable-effect', name: 'Minimum Detectable Effect', description: 'Article on minimum detectable effect', difficulty: Difficulty.ADVANCED, sortOrder: 17 },
  { slug: 'paper-improving-sensitivity', name: 'Paper: Improving Test Sensitivity', description: 'Academic paper on improving test sensitivity', difficulty: Difficulty.ADVANCED, sortOrder: 18 },
  { slug: 'paper-cuped', name: 'Paper: Improving Sensitivity (CUPED)', description: 'Academic paper on CUPED methodology', difficulty: Difficulty.ADVANCED, sortOrder: 19 },
  { slug: 'cuped-booking', name: 'CUPED at Booking.com', description: 'Article on CUPED implementation at Booking.com', difficulty: Difficulty.ADVANCED, sortOrder: 20 },
  { slug: 'doordash-cupac', name: 'Doordash: CUPAC', description: 'Article on CUPAC implementation at Doordash', difficulty: Difficulty.ADVANCED, sortOrder: 21 },
  { slug: 'netflix-stratification', name: 'Netflix Stratification', description: 'Paper on Netflix stratification technique', difficulty: Difficulty.ADVANCED, sortOrder: 22 },
  { slug: 'ratio-metrics', name: 'Ratio Metrics', description: 'Understanding ratio metrics', difficulty: Difficulty.ADVANCED, sortOrder: 23 },
  { slug: 'delta-method-metrics', name: 'Microsoft: Delta Method in Metric Analytics', description: 'Paper on delta method for metric analytics', difficulty: Difficulty.ADVANCED, sortOrder: 24 },
  { slug: 'paper-ratio-metrics', name: 'Paper: Ratio Metrics', description: 'Academic paper on ratio metrics', difficulty: Difficulty.ADVANCED, sortOrder: 25 },

  // Stage 3: Econometrics
  { slug: 'econometrics', name: 'Econometrics', description: 'Economic and time series analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },
  { slug: 'econ-prerequisites', name: 'Pre-requisites of Econometrics', description: 'Prerequisite knowledge for econometrics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },
  { slug: 'fundamentals-econometrics', name: 'Fundamentals of Econometrics', description: 'Book on fundamentals of econometrics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },
  { slug: 'regression-timeseries', name: 'Regression, Timeseries, Fitting Distributions', description: 'Advanced econometric techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'intro-econometrics', name: 'Intro to Econometrics', description: 'Book introduction to econometrics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'coursera-econometrics', name: 'Coursera: Econometrics', description: 'Coursera course on econometrics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },
  { slug: 'kaggle-time-series', name: 'Kaggle: Learn Time Series', description: 'Kaggle course on time series', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },
  { slug: 'kaggle-time-series-basics', name: 'Kaggle: Time Series Basics', description: 'Kaggle tutorial on time series basics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },
  { slug: 'arima-time-series', name: 'ARIMA model for Time Series', description: 'Tutorial on ARIMA models', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },
  { slug: 'time-series-models', name: 'Time Series Models', description: 'Tutorial on various time series models', difficulty: Difficulty.INTERMEDIATE, sortOrder: 35 },
  { slug: 'forecasting-task', name: 'Forecasting Task with Solution', description: 'OpenSource project on forecasting with solution', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },
  { slug: 'coursera-linear-regression', name: 'Coursera: Linear Regression', description: 'Coursera course on linear regression', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },

  // Stage 4: Coding
  { slug: 'coding', name: 'Coding', description: 'Programming fundamentals and data structures', difficulty: Difficulty.BEGINNER, sortOrder: 38 },
  { slug: 'python-programming', name: 'Learn Python Programming Language', description: 'Python programming fundamentals', difficulty: Difficulty.BEGINNER, sortOrder: 39 },
  { slug: 'kaggle-python', name: 'Learn Python: Kaggle', description: 'Kaggle course on Python programming', difficulty: Difficulty.BEGINNER, sortOrder: 40 },
  { slug: 'google-python-class', name: 'Google\'s Python Class', description: 'Google\'s free Python class', difficulty: Difficulty.BEGINNER, sortOrder: 41 },
  { slug: 'dsa-python', name: 'Data Structures and Algorithm (Python)', description: 'Data structures and algorithms using Python', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },
  { slug: 'algorithmic-exercises', name: 'Algorithmic Exercises', description: 'Algorithmic exercises with tutorials and challenges', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },
  { slug: 'leetcode-study', name: 'Study Plans - Leetcode', description: 'Leetcode study plans for algorithms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },
  { slug: 'algorithms-spec', name: 'Algorithms Specialization', description: 'Specialization course on algorithms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },
  { slug: 'sql', name: 'Learn SQL', description: 'SQL fundamentals', difficulty: Difficulty.BEGINNER, sortOrder: 46 },
  { slug: 'sql-tutorial', name: 'SQL Tutorial', description: 'Tutorial for SQL', difficulty: Difficulty.BEGINNER, sortOrder: 47 },

  // Stage 5: Exploratory Data Analysis
  { slug: 'eda', name: 'Exploratory Data Analysis', description: 'Data analysis and visualization techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  { slug: 'eda-data-understanding', name: 'Data understanding, Data Analysis and Visualization', description: 'Core concepts of data analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'eda-python-pandas', name: 'Exploratory Data Analysis with Python and Pandas', description: 'Coursera course on EDA with Python and Pandas', difficulty: Difficulty.INTERMEDIATE, sortOrder: 50 },
  { slug: 'eda-ml', name: 'Exploratory Data Analysis for Machine Learning', description: 'Coursera course on EDA for ML', difficulty: Difficulty.INTERMEDIATE, sortOrder: 51 },
  { slug: 'eda-seaborn', name: 'Exploratory Data Analysis with Seaborn', description: 'Coursera course on EDA with Seaborn', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },

  // Stage 6: Machine Learning
  { slug: 'machine-learning', name: 'Machine Learning', description: 'Machine learning algorithms and techniques', difficulty: Difficulty.ADVANCED, sortOrder: 53 },
  { slug: 'ml-classics', name: 'Classic ML (Sup, Unsup), Advanced ML (Ensembles, NNs)', description: 'Machine learning fundamentals', difficulty: Difficulty.ADVANCED, sortOrder: 54 },
  { slug: 'open-ml-course', name: 'Open Machine Learning Course - Open Data Science', description: 'Open source ML course', difficulty: Difficulty.ADVANCED, sortOrder: 55 },
  { slug: 'coursera-ml-spec', name: 'Machine Learning Specialization', description: 'Specialization course on machine learning', difficulty: Difficulty.ADVANCED, sortOrder: 56 },
  { slug: 'pattern-recognition-bishop', name: 'Pattern Recognition & ML by Christopher m. Bishop', description: 'eBook on pattern recognition and ML', difficulty: Difficulty.ADVANCED, sortOrder: 57 },
  { slug: 'ml-github-notes', name: 'Github repository with notes & code from the eBook above', description: 'Github repository with implementation notes', difficulty: Difficulty.ADVANCED, sortOrder: 58 },

  // Stage 7: Deep Learning
  { slug: 'deep-learning', name: 'Deep Learning', description: 'Deep learning fundamentals and advanced topics', difficulty: Difficulty.ADVANCED, sortOrder: 59 },
  { slug: 'dl-architectures', name: 'Fully Connected, CNN, RNN, LSTM, Transformers, TL', description: 'Deep learning architectures', difficulty: Difficulty.ADVANCED, sortOrder: 60 },
  { slug: 'deeplearning-spec', name: 'Deep Learning Specialization', description: 'Coursera deep learning specialization', difficulty: Difficulty.ADVANCED, sortOrder: 61 },
  { slug: 'deeplearning-book', name: 'Deep Learning Book', description: 'eBook on deep learning', difficulty: Difficulty.ADVANCED, sortOrder: 62 },
  { slug: 'attention-paper', name: 'Attention is all you need', description: 'Seminal paper on attention mechanisms', difficulty: Difficulty.EXPERT, sortOrder: 63 },
  { slug: 'illustrated-transformer', name: 'The Illustrated Transformer', description: 'Article explaining transformers visually', difficulty: Difficulty.ADVANCED, sortOrder: 64 },

  // Stage 8: MLOps
  { slug: 'mlops', name: 'MLOps', description: 'Machine learning operations and deployment', difficulty: Difficulty.ADVANCED, sortOrder: 65 },
  { slug: 'mlops-deployment', name: 'Deployment Models, CI/CD', description: 'Model deployment and CI/CD concepts', difficulty: Difficulty.ADVANCED, sortOrder: 66 },
  { slug: 'mlops-spec', name: 'MLOps Specialization', description: 'Coursera MLOps specialization', difficulty: Difficulty.ADVANCED, sortOrder: 67 },
];

const ROADMAP_EDGES_DATA = [
  // Root to main stages
  { source: 'mathematics', target: 'ai-data-scientist', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'statistics', target: 'ai-data-scientist', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'econometrics', target: 'ai-data-scientist', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'coding', target: 'ai-data-scientist', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'eda', target: 'ai-data-scientist', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'machine-learning', target: 'ai-data-scientist', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'deep-learning', target: 'ai-data-scientist', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mlops', target: 'ai-data-scientist', type: SkillEdgeType.SUBSKILL_OF },

  // Mathematics
  { source: 'linear-algebra-calculus-analysis', target: 'mathematics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'math-for-ml', target: 'linear-algebra-calculus-analysis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'differential-calculus', target: 'linear-algebra-calculus-analysis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'coursera-algebra-calculus', target: 'differential-calculus', type: SkillEdgeType.SUBSKILL_OF },

  // Statistics dependencies
  { source: 'stats-clt', target: 'statistics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'intro-to-stats', target: 'stats-clt', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hypothesis-testing', target: 'stats-clt', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'coursera-hypothesis-testing', target: 'hypothesis-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'probability-sampling', target: 'stats-clt', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'coursera-probability-stats', target: 'probability-sampling', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ab-testing', target: 'stats-clt', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'guide-statistical-tests', target: 'ab-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'experiment-design', target: 'ab-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'increasing-test-sensitivity', target: 'ab-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'minimum-detectable-effect', target: 'increasing-test-sensitivity', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'paper-improving-sensitivity', target: 'increasing-test-sensitivity', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'paper-cuped', target: 'increasing-test-sensitivity', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cuped-booking', target: 'paper-cuped', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'doordash-cupac', target: 'paper-cuped', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'netflix-stratification', target: 'stats-clt', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ratio-metrics', target: 'stats-clt', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'delta-method-metrics', target: 'ratio-metrics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'paper-ratio-metrics', target: 'ratio-metrics', type: SkillEdgeType.SUBSKILL_OF },

  // Econometrics
  { source: 'econ-prerequisites', target: 'econometrics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fundamentals-econometrics', target: 'econ-prerequisites', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'regression-timeseries', target: 'econ-prerequisites', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'intro-econometrics', target: 'regression-timeseries', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'coursera-econometrics', target: 'econ-prerequisites', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kaggle-time-series', target: 'regression-timeseries', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kaggle-time-series-basics', target: 'kaggle-time-series', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'arima-time-series', target: 'kaggle-time-series', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'time-series-models', target: 'arima-time-series', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'forecasting-task', target: 'time-series-models', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'coursera-linear-regression', target: 'regression-timeseries', type: SkillEdgeType.SUBSKILL_OF },

  // Coding
  { source: 'python-programming', target: 'coding', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kaggle-python', target: 'python-programming', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'google-python-class', target: 'python-programming', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dsa-python', target: 'python-programming', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'algorithmic-exercises', target: 'dsa-python', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'leetcode-study', target: 'algorithmic-exercises', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'algorithms-spec', target: 'dsa-python', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sql', target: 'coding', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sql-tutorial', target: 'sql', type: SkillEdgeType.SUBSKILL_OF },

  // EDA
  { source: 'eda-data-understanding', target: 'eda', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'eda-python-pandas', target: 'eda-data-understanding', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'eda-ml', target: 'eda-data-understanding', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'eda-seaborn', target: 'eda-data-understanding', type: SkillEdgeType.SUBSKILL_OF },

  // Machine Learning
  { source: 'ml-classics', target: 'machine-learning', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'open-ml-course', target: 'ml-classics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'coursera-ml-spec', target: 'ml-classics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pattern-recognition-bishop', target: 'ml-classics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ml-github-notes', target: 'pattern-recognition-bishop', type: SkillEdgeType.SUBSKILL_OF },

  // Deep Learning
  { source: 'dl-architectures', target: 'deep-learning', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'deeplearning-spec', target: 'dl-architectures', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'deeplearning-book', target: 'dl-architectures', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'attention-paper', target: 'dl-architectures', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'illustrated-transformer', target: 'attention-paper', type: SkillEdgeType.SUBSKILL_OF },

  // MLOps
  { source: 'mlops-deployment', target: 'mlops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mlops-spec', target: 'mlops-deployment', type: SkillEdgeType.SUBSKILL_OF },

  // Cross-stage prerequisites
  { source: 'statistics', target: 'mathematics', type: SkillEdgeType.PREREQUISITE },
  { source: 'eda', target: 'statistics', type: SkillEdgeType.PREREQUISITE },
  { source: 'machine-learning', target: 'eda', type: SkillEdgeType.PREREQUISITE },
  { source: 'machine-learning', target: 'coding', type: SkillEdgeType.PREREQUISITE },
  { source: 'deep-learning', target: 'machine-learning', type: SkillEdgeType.PREREQUISITE },
  { source: 'deep-learning', target: 'coding', type: SkillEdgeType.PREREQUISITE },
  { source: 'mlops', target: 'machine-learning', type: SkillEdgeType.BUILDS_ON },
  { source: 'mlops', target: 'deep-learning', type: SkillEdgeType.BUILDS_ON },
];

async function main() {
  console.log('Starting AI and Data Scientist roadmap seed...');
  
  // Upsert the 'AI & Data Science' category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'ai-data-science' },
    update: {},
    create: {
      name: 'AI & Data Science',
      slug: 'ai-data-science',
      description: 'Artificial Intelligence and Data Science learning paths',
      icon: '🤖',
      color: '#10B981',
      sortOrder: 4,
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
  const rootSkill = await prisma.skill.findUnique({ where: { slug: 'ai-data-scientist' } });

  // Create or update the AI and Data Scientist Roadmap
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'ai-data-scientist' },
    update: {
      name: 'AI and Data Scientist',
      description: 'A comprehensive roadmap for becoming an AI and Data Scientist, covering mathematics, statistics, econometrics, coding, EDA, machine learning, deep learning, and MLOps',
      icon: '🤖',
      color: '#10B981',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'AI and Data Scientist',
      slug: 'ai-data-scientist',
      description: 'A comprehensive roadmap for becoming an AI and Data Scientist, covering mathematics, statistics, econometrics, coding, EDA, machine learning, deep learning, and MLOps',
      icon: '🤖',
      color: '#10B981',
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

  console.log('\n✓ AI and Data Scientist roadmap seeded successfully!');
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

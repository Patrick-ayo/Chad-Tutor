/**
 * Data Analyst Roadmap Seed Script
 *
 * Seeds the Data Analyst development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/data-analyst.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// Data Analyst Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'data-analyst', name: 'Data Analyst', description: 'Complete Data Analyst roadmap', difficulty: Difficulty.BEGINNER, sortOrder: 0 },

  // ==== INTRODUCTION ====
  { slug: 'introduction-data-analyst', name: 'Introduction', description: 'Introduction to Data Analytics', difficulty: Difficulty.BEGINNER, sortOrder: 1 },

  // ==== BUILDING A STRONG FOUNDATION ====
  { slug: 'strong-foundation', name: 'Building a Strong Foundation', description: 'Foundation skills for data analysis', difficulty: Difficulty.BEGINNER, sortOrder: 2 },
  { slug: 'excel-analysis-reporting', name: 'Analysis / Reporting with Excel', description: 'Excel for data analysis and reporting', difficulty: Difficulty.BEGINNER, sortOrder: 3 },
  { slug: 'excel-if', name: 'IF', description: 'IF function in Excel', difficulty: Difficulty.BEGINNER, sortOrder: 4 },
  { slug: 'excel-dateif', name: 'DATEIF', description: 'DATEIF function in Excel', difficulty: Difficulty.BEGINNER, sortOrder: 5 },
  { slug: 'excel-vlookup-hlookup', name: 'VLOOKUP / HLOOKUP', description: 'Lookup functions in Excel', difficulty: Difficulty.BEGINNER, sortOrder: 6 },
  { slug: 'excel-replace-substitute', name: 'REPLACE / SUBSTITUTE', description: 'Text replacement functions in Excel', difficulty: Difficulty.BEGINNER, sortOrder: 7 },
  { slug: 'excel-upper-lower-proper', name: 'UPPER / LOWER / PROPER', description: 'Text case functions in Excel', difficulty: Difficulty.BEGINNER, sortOrder: 8 },
  { slug: 'excel-concat-trim', name: 'CONCAT / TRIM', description: 'Text concatenation and trimming in Excel', difficulty: Difficulty.BEGINNER, sortOrder: 9 },
  { slug: 'excel-average-count', name: 'AVERAGE / COUNT', description: 'Aggregate functions in Excel', difficulty: Difficulty.BEGINNER, sortOrder: 10 },
  { slug: 'excel-sum-min-max', name: 'SUM / MIN / MAX', description: 'Mathematical functions in Excel', difficulty: Difficulty.BEGINNER, sortOrder: 11 },
  { slug: 'excel-common-functions', name: 'Learn Common Functions', description: 'Common Excel functions for analysis', difficulty: Difficulty.BEGINNER, sortOrder: 12 },

  // ==== KEY CONCEPTS OF DATA ====
  { slug: 'key-concepts-data', name: 'Key Concepts of Data', description: 'Fundamental data concepts', difficulty: Difficulty.BEGINNER, sortOrder: 13 },
  { slug: 'data-collection', name: 'Collection', description: 'Data collection methods', difficulty: Difficulty.BEGINNER, sortOrder: 14 },
  { slug: 'data-cleanup', name: 'Cleanup', description: 'Data cleaning and validation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },
  { slug: 'data-exploration', name: 'Exploration', description: 'Exploratory data analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'data-visualization-concept', name: 'Visualization', description: 'Data visualization concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },
  { slug: 'statistical-analysis-concept', name: 'Statistical Analysis', description: 'Statistical analysis fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'machine-learning-concept', name: 'Machine Learning', description: 'Machine learning fundamentals', difficulty: Difficulty.ADVANCED, sortOrder: 19 },

  // ==== LEARN SQL ====
  { slug: 'learn-sql', name: 'Learn SQL', description: 'SQL for data analysis', difficulty: Difficulty.BEGINNER, sortOrder: 20 },

  // ==== CHARTING & PIVOT TABLES ====
  { slug: 'charting', name: 'Charting', description: 'Creating charts for data visualization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'pivot-tables', name: 'Pivot Tables', description: 'Pivot tables for data analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },

  // ==== PROGRAMMING LANGUAGES ====
  { slug: 'programming-languages-analyst', name: 'Learn a Programming Language', description: 'Programming for data analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'python-analyst', name: 'Python', description: 'Python for data analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },
  { slug: 'r-programming', name: 'R', description: 'R programming for statistics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'pandas-library', name: 'Pandas', description: 'Pandas data manipulation library', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },
  { slug: 'data-manipulation-libraries', name: 'Data Manipulation Libraries', description: 'Libraries for data manipulation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },
  { slug: 'dplyr', name: 'Dplyr', description: 'Dplyr data manipulation library', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },
  { slug: 'data-visualization-libraries', name: 'Data Visualization Libraries', description: 'Libraries for data visualization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'matplotlib', name: 'Matplotlib', description: 'Matplotlib visualization library', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'ggplot2', name: 'ggplot2', description: 'ggplot2 visualization library for R', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },
  { slug: 'gain-programming-skills', name: 'Gain Programming Skills', description: 'Programming skills for data analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },

  // ==== DATA COLLECTION METHODS ====
  { slug: 'databases', name: 'Databases', description: 'Working with databases', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },
  { slug: 'csv-files', name: 'CSV Files', description: 'Working with CSV files', difficulty: Difficulty.BEGINNER, sortOrder: 34 },
  { slug: 'apis', name: 'APIs', description: 'Accessing data via APIs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 35 },
  { slug: 'web-scraping', name: 'Web Scraping', description: 'Web scraping techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },
  { slug: 'mastering-data-handling', name: 'Mastering Data Handling', description: 'Advanced data handling techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },

  // ==== STATISTICAL CONCEPTS ====
  { slug: 'dispersion', name: 'Dispersion', description: 'Data dispersion measures', difficulty: Difficulty.INTERMEDIATE, sortOrder: 38 },
  { slug: 'statistical-range', name: 'Range', description: 'Range in statistics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'variance', name: 'Variance', description: 'Variance in statistics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'standard-deviation', name: 'Standard Deviation', description: 'Standard deviation measure', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'central-tendency', name: 'Central Tendency', description: 'Measures of central tendency', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },
  { slug: 'mean', name: 'Mean', description: 'Mean calculation', difficulty: Difficulty.BEGINNER, sortOrder: 43 },
  { slug: 'median', name: 'Median', description: 'Median calculation', difficulty: Difficulty.BEGINNER, sortOrder: 44 },
  { slug: 'mode', name: 'Mode', description: 'Mode in statistics', difficulty: Difficulty.BEGINNER, sortOrder: 45 },
  { slug: 'average', name: 'Average', description: 'Average calculation', difficulty: Difficulty.BEGINNER, sortOrder: 46 },
  { slug: 'kurtosis', name: 'Kurtosis', description: 'Kurtosis measure', difficulty: Difficulty.ADVANCED, sortOrder: 47 },
  { slug: 'distribution-space', name: 'Distribution Space', description: 'Data distribution analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  { slug: 'generating-statistics', name: 'Generating Statistics', description: 'Creating statistical summaries', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'visualizing-distributions', name: 'Visualizing Distributions', description: 'Visualizing data distributions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 50 },
  { slug: 'hypothesis-testing', name: 'Hypothesis Testing', description: 'Statistical hypothesis testing', difficulty: Difficulty.ADVANCED, sortOrder: 51 },
  { slug: 'correlation-analysis', name: 'Correlation Analysis', description: 'Analyzing correlations between variables', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'regression', name: 'Regression', description: 'Regression analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },
  { slug: 'learn-different-techniques', name: 'Learn Different Techniques', description: 'Statistical techniques for analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 54 },

  // ==== DATA CLEANUP ====
  { slug: 'handling-missing-data', name: 'Handling Missing Data', description: 'Techniques for handling missing values', difficulty: Difficulty.INTERMEDIATE, sortOrder: 55 },
  { slug: 'removing-duplicates', name: 'Removing Duplicates', description: 'Removing duplicate records', difficulty: Difficulty.INTERMEDIATE, sortOrder: 56 },
  { slug: 'finding-outliers', name: 'Finding Outliers', description: 'Identifying outliers in data', difficulty: Difficulty.INTERMEDIATE, sortOrder: 57 },
  { slug: 'data-transformation', name: 'Data Transformation', description: 'Transforming data formats', difficulty: Difficulty.INTERMEDIATE, sortOrder: 58 },
  { slug: 'libraries-for-cleanup', name: 'Using Libraries for Cleanup', description: 'Libraries for data cleaning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 59 },

  // ==== ANALYSIS TECHNIQUES ====
  { slug: 'data-analysis-techniques', name: 'Data Analysis Techniques', description: 'Techniques for analyzing data', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },
  { slug: 'descriptive-analysis', name: 'Descriptive Analysis', description: 'Descriptive statistics and analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 61 },
  { slug: 'diagnostic-analysis', name: 'Diagnostic Analytics', description: 'Diagnostic data analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 62 },
  { slug: 'predictive-analysis', name: 'Predictive Analytics', description: 'Predictive data analysis', difficulty: Difficulty.ADVANCED, sortOrder: 63 },
  { slug: 'prescriptive-analysis', name: 'Prescriptive Analytics', description: 'Prescriptive data analysis', difficulty: Difficulty.ADVANCED, sortOrder: 64 },

  // ==== DATA VISUALIZATION ====
  { slug: 'data-visualization', name: 'Data Visualization', description: 'Creating visualizations from data', difficulty: Difficulty.INTERMEDIATE, sortOrder: 65 },
  { slug: 'visualization-tools', name: 'Tools', description: 'Visualization tools and platforms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 66 },
  { slug: 'tableau', name: 'Tableau', description: 'Tableau for data visualization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 67 },
  { slug: 'power-bi', name: 'Power BI', description: 'Microsoft Power BI for analytics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 68 },
  { slug: 'seaborn', name: 'Seaborn', description: 'Seaborn visualization library', difficulty: Difficulty.INTERMEDIATE, sortOrder: 69 },
  { slug: 'visualization-charting', name: 'Charting', description: 'Creating various chart types', difficulty: Difficulty.INTERMEDIATE, sortOrder: 70 },
  { slug: 'bar-charts', name: 'Bar Charts', description: 'Creating bar charts', difficulty: Difficulty.BEGINNER, sortOrder: 71 },
  { slug: 'histograms', name: 'Histograms', description: 'Creating histograms', difficulty: Difficulty.BEGINNER, sortOrder: 72 },
  { slug: 'line-charts', name: 'Line Chart', description: 'Creating line charts', difficulty: Difficulty.BEGINNER, sortOrder: 73 },
  { slug: 'stacked-charts', name: 'Stacked Charts', description: 'Creating stacked charts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 74 },
  { slug: 'scatter-plots', name: 'Scatter Plot', description: 'Creating scatter plots', difficulty: Difficulty.BEGINNER, sortOrder: 75 },
  { slug: 'heatmaps', name: 'Heatmap', description: 'Creating heatmaps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 76 },
  { slug: 'funnel-charts', name: 'Funnel Charts', description: 'Creating funnel charts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 77 },
  { slug: 'pie-charts', name: 'Pie Charts', description: 'Creating pie charts', difficulty: Difficulty.BEGINNER, sortOrder: 78 },

  // ==== MACHINE LEARNING ====
  { slug: 'machine-learning-analyst', name: 'Machine Learning', description: 'Machine learning for analysts', difficulty: Difficulty.ADVANCED, sortOrder: 79 },
  { slug: 'model-evaluation', name: 'Model Evaluation Techniques', description: 'Evaluating ML models', difficulty: Difficulty.ADVANCED, sortOrder: 80 },
  { slug: 'popular-ml-algorithms', name: 'Popular ML Algorithms', description: 'Common ML algorithms', difficulty: Difficulty.ADVANCED, sortOrder: 81 },
  { slug: 'decision-trees', name: 'Decision Trees', description: 'Decision tree algorithms', difficulty: Difficulty.ADVANCED, sortOrder: 82 },
  { slug: 'naive-bayes', name: 'Naive Bayes', description: 'Naive Bayes classifier', difficulty: Difficulty.ADVANCED, sortOrder: 83 },
  { slug: 'k-nearest-neighbors', name: 'KNN', description: 'K-Nearest Neighbors algorithm', difficulty: Difficulty.ADVANCED, sortOrder: 84 },
  { slug: 'k-means-clustering', name: 'K-Means Clustering', description: 'K-Means clustering algorithm', difficulty: Difficulty.ADVANCED, sortOrder: 85 },
  { slug: 'logistic-regression', name: 'Logistic Regression', description: 'Logistic regression algorithm', difficulty: Difficulty.ADVANCED, sortOrder: 86 },
  { slug: 'learn-ml-basics', name: 'Learn the Basics', description: 'ML basics and fundamentals', difficulty: Difficulty.ADVANCED, sortOrder: 87 },
  { slug: 'cnns', name: 'CNNs', description: 'Convolutional Neural Networks', difficulty: Difficulty.ADVANCED, sortOrder: 88 },
  { slug: 'rnns', name: 'RNN', description: 'Recurrent Neural Networks', difficulty: Difficulty.ADVANCED, sortOrder: 89 },
  { slug: 'neural-networks', name: 'Neural Networks', description: 'Neural network fundamentals', difficulty: Difficulty.ADVANCED, sortOrder: 90 },

  // ==== DEEP LEARNING (Optional) ====
  { slug: 'deep-learning-optional', name: 'Deep Learning (Optional)', description: 'Deep learning techniques for analysts', difficulty: Difficulty.ADVANCED, sortOrder: 91 },
  { slug: 'deep-learning-frameworks', name: 'Frameworks', description: 'Deep learning frameworks', difficulty: Difficulty.ADVANCED, sortOrder: 92 },
  { slug: 'tensorflow', name: 'Tensorflow', description: 'TensorFlow framework', difficulty: Difficulty.ADVANCED, sortOrder: 93 },
  { slug: 'pytorch', name: 'PyTorch', description: 'PyTorch framework', difficulty: Difficulty.ADVANCED, sortOrder: 94 },
  { slug: 'practice-training-models', name: 'Practice Training Models', description: 'Training deep learning models', difficulty: Difficulty.ADVANCED, sortOrder: 95 },
  { slug: 'image-recognition', name: 'Image Recognition', description: 'Image recognition with deep learning', difficulty: Difficulty.ADVANCED, sortOrder: 96 },
  { slug: 'nlp', name: 'Natural Language Processing', description: 'NLP techniques', difficulty: Difficulty.ADVANCED, sortOrder: 97 },

  // ==== BIG DATA TECHNOLOGIES ====
  { slug: 'big-data-technologies', name: 'Big Data Technologies', description: 'Big data tools and technologies', difficulty: Difficulty.ADVANCED, sortOrder: 98 },
  { slug: 'big-data-concepts', name: 'Big Data Concepts', description: 'Big data concepts and principles', difficulty: Difficulty.ADVANCED, sortOrder: 99 },
  { slug: 'data-storage-solutions', name: 'Data Storage Solutions', description: 'Storage solutions for big data', difficulty: Difficulty.ADVANCED, sortOrder: 100 },
  { slug: 'data-processing-framework', name: 'Data Processing Framework', description: 'Frameworks for data processing', difficulty: Difficulty.ADVANCED, sortOrder: 101 },
  { slug: 'hadoop', name: 'Hadoop', description: 'Hadoop framework for big data', difficulty: Difficulty.ADVANCED, sortOrder: 102 },
  { slug: 'spark', name: 'Spark', description: 'Apache Spark for big data processing', difficulty: Difficulty.ADVANCED, sortOrder: 103 },
  { slug: 'data-processing-techniques', name: 'Data Processing Techniques', description: 'Techniques for processing large datasets', difficulty: Difficulty.ADVANCED, sortOrder: 104 },
  { slug: 'parallel-processing', name: 'Parallel Processing', description: 'Parallel data processing', difficulty: Difficulty.ADVANCED, sortOrder: 105 },
  { slug: 'mpi', name: 'MPI', description: 'Message Passing Interface', difficulty: Difficulty.ADVANCED, sortOrder: 106 },
  { slug: 'mapreduce', name: 'MapReduce', description: 'MapReduce programming model', difficulty: Difficulty.ADVANCED, sortOrder: 107 },

  // ==== KEEP LEARNING ====
  { slug: 'keep-learning-analyst', name: 'Keep Learning', description: 'Continuous learning resources', difficulty: Difficulty.BEGINNER, sortOrder: 108 },
  { slug: 'ai-data-scientist-track', name: 'AI and Data Scientist Roadmap', description: 'Advanced data science path', difficulty: Difficulty.ADVANCED, sortOrder: 109 },
];

const ROADMAP_EDGES_DATA = [
  // Introduction
  { source: 'introduction-data-analyst', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },

  // Building Strong Foundation
  { source: 'strong-foundation', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'excel-analysis-reporting', target: 'strong-foundation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'excel-if', target: 'excel-analysis-reporting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'excel-dateif', target: 'excel-analysis-reporting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'excel-vlookup-hlookup', target: 'excel-analysis-reporting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'excel-replace-substitute', target: 'excel-analysis-reporting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'excel-upper-lower-proper', target: 'excel-analysis-reporting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'excel-concat-trim', target: 'excel-analysis-reporting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'excel-average-count', target: 'excel-analysis-reporting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'excel-sum-min-max', target: 'excel-analysis-reporting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'excel-common-functions', target: 'excel-analysis-reporting', type: SkillEdgeType.SUBSKILL_OF },

  // Key Concepts
  { source: 'key-concepts-data', target: 'data-analyst', type: SkillEdgeType.PREREQUISITE },
  { source: 'data-collection', target: 'key-concepts-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-cleanup', target: 'key-concepts-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-exploration', target: 'key-concepts-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-visualization-concept', target: 'key-concepts-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'statistical-analysis-concept', target: 'key-concepts-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'machine-learning-concept', target: 'key-concepts-data', type: SkillEdgeType.SUBSKILL_OF },

  // SQL
  { source: 'learn-sql', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'learn-sql', target: 'strong-foundation', type: SkillEdgeType.BUILDS_ON },

  // Charting and Pivot
  { source: 'charting', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pivot-tables', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },

  // Programming Languages
  { source: 'programming-languages-analyst', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'python-analyst', target: 'programming-languages-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'r-programming', target: 'programming-languages-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-manipulation-libraries', target: 'programming-languages-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pandas-library', target: 'data-manipulation-libraries', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dplyr', target: 'data-manipulation-libraries', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-visualization-libraries', target: 'programming-languages-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'matplotlib', target: 'data-visualization-libraries', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ggplot2', target: 'data-visualization-libraries', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gain-programming-skills', target: 'programming-languages-analyst', type: SkillEdgeType.BUILDS_ON },

  // Data Collection
  { source: 'databases', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'csv-files', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'apis', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'web-scraping', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mastering-data-handling', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },

  // Statistical Concepts
  { source: 'dispersion', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'statistical-range', target: 'dispersion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'variance', target: 'dispersion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'standard-deviation', target: 'dispersion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'central-tendency', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mean', target: 'central-tendency', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'median', target: 'central-tendency', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mode', target: 'central-tendency', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'average', target: 'central-tendency', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kurtosis', target: 'central-tendency', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'distribution-space', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'generating-statistics', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'visualizing-distributions', target: 'generating-statistics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hypothesis-testing', target: 'generating-statistics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'correlation-analysis', target: 'generating-statistics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'regression', target: 'generating-statistics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'learn-different-techniques', target: 'generating-statistics', type: SkillEdgeType.BUILDS_ON },

  // Data Cleanup
  { source: 'handling-missing-data', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'removing-duplicates', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'finding-outliers', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-transformation', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'libraries-for-cleanup', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },

  // Analysis Techniques
  { source: 'data-analysis-techniques', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'descriptive-analysis', target: 'data-analysis-techniques', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'diagnostic-analysis', target: 'data-analysis-techniques', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'predictive-analysis', target: 'data-analysis-techniques', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'prescriptive-analysis', target: 'data-analysis-techniques', type: SkillEdgeType.SUBSKILL_OF },

  // Data Visualization
  { source: 'data-visualization', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'visualization-tools', target: 'data-visualization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tableau', target: 'visualization-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'power-bi', target: 'visualization-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'seaborn', target: 'visualization-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'visualization-charting', target: 'data-visualization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bar-charts', target: 'visualization-charting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'histograms', target: 'visualization-charting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'line-charts', target: 'visualization-charting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'stacked-charts', target: 'visualization-charting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'scatter-plots', target: 'visualization-charting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'heatmaps', target: 'visualization-charting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'funnel-charts', target: 'visualization-charting', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pie-charts', target: 'visualization-charting', type: SkillEdgeType.SUBSKILL_OF },

  // Machine Learning
  { source: 'machine-learning-analyst', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'model-evaluation', target: 'machine-learning-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'popular-ml-algorithms', target: 'machine-learning-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'decision-trees', target: 'popular-ml-algorithms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'naive-bayes', target: 'popular-ml-algorithms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'k-nearest-neighbors', target: 'popular-ml-algorithms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'k-means-clustering', target: 'popular-ml-algorithms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'logistic-regression', target: 'popular-ml-algorithms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'learn-ml-basics', target: 'machine-learning-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cnns', target: 'learn-ml-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rnns', target: 'learn-ml-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'neural-networks', target: 'learn-ml-basics', type: SkillEdgeType.SUBSKILL_OF },

  // Deep Learning
  { source: 'deep-learning-optional', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'deep-learning-frameworks', target: 'deep-learning-optional', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tensorflow', target: 'deep-learning-frameworks', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pytorch', target: 'deep-learning-frameworks', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'practice-training-models', target: 'deep-learning-optional', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'image-recognition', target: 'practice-training-models', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nlp', target: 'practice-training-models', type: SkillEdgeType.SUBSKILL_OF },

  // Big Data
  { source: 'big-data-technologies', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'big-data-concepts', target: 'big-data-technologies', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-storage-solutions', target: 'big-data-technologies', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-processing-framework', target: 'big-data-technologies', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hadoop', target: 'data-processing-framework', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'spark', target: 'data-processing-framework', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-processing-techniques', target: 'big-data-technologies', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'parallel-processing', target: 'data-processing-techniques', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mpi', target: 'data-processing-techniques', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mapreduce', target: 'data-processing-techniques', type: SkillEdgeType.SUBSKILL_OF },

  // Keep Learning
  { source: 'keep-learning-analyst', target: 'data-analyst', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ai-data-scientist-track', target: 'keep-learning-analyst', type: SkillEdgeType.RELATED },
];

// Organize nodes data
interface RoadmapNode {
  slug: string;
  name: string;
  description: string;
  difficulty: any;
  sortOrder: number;
}

interface RoadmapEdge {
  source: string;
  target: string;
  type: any;
}

const ROADMAP_NODES: RoadmapNode[] = ROADMAP_NODES_DATA as RoadmapNode[];

async function main() {
  console.log('Starting Data Analyst roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'data-analyst' },
    update: { name: 'Data Analyst', description: 'Data Analyst specialization' },
    create: {
      name: 'Data Analyst',
      slug: 'data-analyst',
      description: 'Data Analyst specialization',
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
    where: { slug: 'data-analyst' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'data-analyst' },
    update: {
      name: 'Data Analyst',
      description: 'Complete Data Analyst roadmap covering Excel, SQL, Python, statistics, data visualization, machine learning, and big data technologies',
      icon: '📊',
      color: '#8B5CF6',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'Data Analyst',
      slug: 'data-analyst',
      description: 'Complete Data Analyst roadmap covering Excel, SQL, Python, statistics, data visualization, machine learning, and big data technologies',
      icon: '📊',
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

  console.log('\n✓ Data Analyst roadmap seeded successfully!');
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

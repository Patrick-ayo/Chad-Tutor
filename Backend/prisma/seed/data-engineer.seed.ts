/**
 * Data Engineer Roadmap Seed Script
 *
 * Seeds the Data Engineer development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/data-engineer.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';
import { buildNodeResources } from './resources';

const prisma = new PrismaClient();

// Data Engineer Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'data-engineer', name: 'Data Engineer', description: 'Complete Data Engineer roadmap', difficulty: Difficulty.BEGINNER, sortOrder: 0 },

  // ==== PRE-REQUISITES ====
  { slug: 'pre-requisites-de', name: 'Pre-requisites', description: 'Pre-requisites for data engineering', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
  { slug: 'sql-basics', name: 'SQL Mastering', description: 'SQL fundamentals and advanced queries', difficulty: Difficulty.BEGINNER, sortOrder: 2 },

  // ==== PYTHON IS RECOMMENDED ====
  { slug: 'python-recommended', name: 'Python is Recommended', description: 'Python programming for data engineering', difficulty: Difficulty.BEGINNER, sortOrder: 3 },
  { slug: 'python-basics-de', name: 'Python Basics', description: 'Python fundamentals', difficulty: Difficulty.BEGINNER, sortOrder: 4 },
  { slug: 'python-intermediate-de', name: 'Python Intermediate', description: 'Intermediate Python concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 5 },
  { slug: 'python-advanced-de', name: 'Python Advanced', description: 'Advanced Python programming', difficulty: Difficulty.ADVANCED, sortOrder: 6 },
  { slug: 'python-data-structures', name: 'Data Structures', description: 'Data structures in Python', difficulty: Difficulty.INTERMEDIATE, sortOrder: 7 },

  // ==== LEARN THE BASICS ====
  { slug: 'learn-basics-de', name: 'Learn the Basics', description: 'Fundamentals of data engineering', difficulty: Difficulty.BEGINNER, sortOrder: 8 },
  { slug: 'data-engineering-basics', name: 'Data Engineering Basics', description: 'Data engineering fundamentals', difficulty: Difficulty.BEGINNER, sortOrder: 9 },
  { slug: 'data-structures-algorithms', name: 'Data Structures and Algorithms', description: 'DSA fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 10 },
  { slug: 'linux-basics', name: 'Linux Basics', description: 'Linux command line and fundamentals', difficulty: Difficulty.BEGINNER, sortOrder: 11 },
  { slug: 'system-design', name: 'System Design', description: 'Designing scalable systems', difficulty: Difficulty.ADVANCED, sortOrder: 12 },

  // ==== DATA TRANSFORMATION ====
  { slug: 'data-transformation', name: 'Data Transformation', description: 'Transforming and processing data', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },
  { slug: 'data-normalization', name: 'Data Normalization', description: 'Normalizing data structures', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },
  { slug: 'order-sorting', name: 'Ordering/Sorting', description: 'Data ordering and sorting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },
  { slug: 'cad-patterns', name: 'CAD Patterns', description: 'Common access data patterns', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'indexing-data-retrieval', name: 'Indexing for Data Retrieval', description: 'Database indexing techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },

  // ==== DATA STORAGE ====
  { slug: 'data-storage', name: 'Data Storage', description: 'Storage solutions for data', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'sql-databases', name: 'SQL', description: 'SQL databases and concepts', difficulty: Difficulty.BEGINNER, sortOrder: 19 },
  { slug: 'nosql-databases', name: 'NoSQL', description: 'NoSQL databases and concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },
  { slug: 'mongodb', name: 'MongoDB', description: 'MongoDB NoSQL database', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'elasticsearch', name: 'Elasticsearch', description: 'Elasticsearch search engine', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },
  { slug: 'cassandra', name: 'Cassandra', description: 'Apache Cassandra database', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },

  // ==== DATA PROCESSING ====
  { slug: 'data-processing', name: 'Data Processing', description: 'Processing large datasets', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },
  { slug: 'data-cleansing', name: 'Data Cleansing', description: 'Cleaning and validating data', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'data-warehousing', name: 'Data Warehousing', description: 'Data warehouse concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },
  { slug: 'etl-patterns', name: 'ETL Patterns', description: 'Extract, Transform, Load patterns', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },

  // ==== DATA VISUALIZATION ====
  { slug: 'data-visualization-de', name: 'Data Visualization', description: 'Visualizing data insights', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },
  { slug: 'tableau-de', name: 'Tableau', description: 'Tableau for data visualization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'power-bi-de', name: 'Power BI', description: 'Microsoft Power BI for analytics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'grafana', name: 'Grafana', description: 'Grafana for metrics visualization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },
  { slug: 'kibana', name: 'Kibana', description: 'Kibana for log visualization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },

  // ==== DATA INGESTION ====
  { slug: 'data-ingestion', name: 'Data Ingestion', description: 'Ingesting data from various sources', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },
  { slug: 'sources-of-data', name: 'Sources of Data', description: 'Different data sources', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },
  { slug: 'file-transfer', name: 'File Transfer', description: 'File transfer protocols', difficulty: Difficulty.INTERMEDIATE, sortOrder: 35 },
  { slug: 'ftp', name: 'FTP', description: 'File Transfer Protocol', difficulty: Difficulty.BEGINNER, sortOrder: 36 },
  { slug: 'sftp', name: 'SFTP', description: 'SSH File Transfer Protocol', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },
  { slug: 'https-transfer', name: 'HTTPS', description: 'HTTPS data transfer', difficulty: Difficulty.BEGINNER, sortOrder: 38 },
  { slug: 'api-ingestion', name: 'API', description: 'API-based data ingestion', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'messaging-queueing', name: 'Messaging/Queueing', description: 'Message queues for data ingestion', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'kafka', name: 'Kafka', description: 'Apache Kafka messaging system', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'rabbitmq', name: 'RabbitMQ', description: 'RabbitMQ message broker', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },
  { slug: 'kinesis', name: 'Amazon Kinesis', description: 'AWS Kinesis streaming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },
  { slug: 'aws-sqs', name: 'AWS SQS', description: 'Amazon Simple Queue Service', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },

  // ==== QUERY ENGINES ====
  { slug: 'query-engines', name: 'Query Engines', description: 'Big data query processing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },
  { slug: 'apache-spark', name: 'Spark', description: 'Apache Spark for big data', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'presto', name: 'Presto', description: 'Presto distributed SQL query engine', difficulty: Difficulty.ADVANCED, sortOrder: 47 },
  { slug: 'apache-hive', name: 'Hive', description: 'Apache Hive data warehouse', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  { slug: 'pig-language', name: 'Pig', description: 'Apache Pig for big data', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },

  // ==== CLOUD COMPUTING ====
  { slug: 'cloud-computing-de', name: 'Cloud Computing', description: 'Cloud platforms for data engineering', difficulty: Difficulty.INTERMEDIATE, sortOrder: 50 },
  { slug: 'what-is-cloud-computing', name: 'What is Cloud Computing', description: 'Cloud computing concepts', difficulty: Difficulty.BEGINNER, sortOrder: 51 },
  { slug: 'cloud-services', name: 'Cloud Services', description: 'Essential cloud services', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'saas', name: 'SaaS', description: 'Software as a Service', difficulty: Difficulty.BEGINNER, sortOrder: 53 },
  { slug: 'paas', name: 'PaaS', description: 'Platform as a Service', difficulty: Difficulty.BEGINNER, sortOrder: 54 },
  { slug: 'iaas', name: 'IaaS', description: 'Infrastructure as a Service', difficulty: Difficulty.BEGINNER, sortOrder: 55 },
  { slug: 'aws-cloud', name: 'AWS', description: 'Amazon Web Services', difficulty: Difficulty.INTERMEDIATE, sortOrder: 56 },
  { slug: 'gcp-cloud', name: 'GCP', description: 'Google Cloud Platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 57 },
  { slug: 'azure-cloud', name: 'Azure', description: 'Microsoft Azure', difficulty: Difficulty.INTERMEDIATE, sortOrder: 58 },
  { slug: 'ibm-cloud', name: 'IBM Cloud', description: 'IBM Cloud platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 59 },

  // ==== ORCHESTRATION ====
  { slug: 'orchestration-tools', name: 'Orchestration Tools', description: 'Workflow orchestration tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },
  { slug: 'airflow', name: 'Apache Airflow', description: 'Apache Airflow workflow orchestration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 61 },
  { slug: 'dagster', name: 'Dagster', description: 'Dagster data orchestration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 62 },
  { slug: 'prefect', name: 'Prefect', description: 'Prefect workflow orchestration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 63 },
  { slug: 'luigi', name: 'Luigi', description: 'Spotify Luigi for workflows', difficulty: Difficulty.INTERMEDIATE, sortOrder: 64 },

  // ==== INFRASTRUCTURE AS CODE ====
  { slug: 'infrastructure-as-code-de', name: 'Infrastructure as Code', description: 'IaC tools and practices', difficulty: Difficulty.ADVANCED, sortOrder: 65 },
  { slug: 'docker-iac', name: 'Docker', description: 'Docker containerization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 66 },
  { slug: 'kubernetes', name: 'Kubernetes', description: 'Kubernetes container orchestration', difficulty: Difficulty.ADVANCED, sortOrder: 67 },
  { slug: 'terraform', name: 'Terraform', description: 'Terraform infrastructure automation', difficulty: Difficulty.ADVANCED, sortOrder: 68 },
  { slug: 'ansible', name: 'Ansible', description: 'Ansible configuration management', difficulty: Difficulty.ADVANCED, sortOrder: 69 },
  { slug: 'chef', name: 'Chef', description: 'Chef infrastructure automation', difficulty: Difficulty.ADVANCED, sortOrder: 70 },

  // ==== TESTING ====
  { slug: 'testing-de', name: 'Testing', description: 'Data engineering testing practices', difficulty: Difficulty.INTERMEDIATE, sortOrder: 71 },
  { slug: 'unit-testing', name: 'Unit Testing', description: 'Unit testing data pipelines', difficulty: Difficulty.INTERMEDIATE, sortOrder: 72 },
  { slug: 'integration-testing', name: 'Integration Testing', description: 'Integration testing for data systems', difficulty: Difficulty.INTERMEDIATE, sortOrder: 73 },
  { slug: 'end-to-end-testing', name: 'End to End Testing', description: 'E2E testing of data pipelines', difficulty: Difficulty.INTERMEDIATE, sortOrder: 74 },
  { slug: 'regression-testing', name: 'Regression Testing', description: 'Regression testing data quality', difficulty: Difficulty.INTERMEDIATE, sortOrder: 75 },

  // ==== DATA SERIALIZATION ====
  { slug: 'data-serialization', name: 'Data Serialization', description: 'Data serialization formats', difficulty: Difficulty.INTERMEDIATE, sortOrder: 76 },
  { slug: 'json-format', name: 'JSON', description: 'JSON data format', difficulty: Difficulty.BEGINNER, sortOrder: 77 },
  { slug: 'avro-format', name: 'Avro', description: 'Apache Avro serialization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 78 },
  { slug: 'protobuf-format', name: 'Protobuf', description: 'Protocol Buffers serialization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 79 },
  { slug: 'xml-format', name: 'XML', description: 'XML data format', difficulty: Difficulty.BEGINNER, sortOrder: 80 },
  { slug: 'csv-format', name: 'CSV', description: 'CSV data format', difficulty: Difficulty.BEGINNER, sortOrder: 81 },
  { slug: 'parquet-format', name: 'Parquet', description: 'Apache Parquet columnar format', difficulty: Difficulty.INTERMEDIATE, sortOrder: 82 },

  // ==== MONITORING & LOGGING ====
  { slug: 'monitoring-logging', name: 'Monitoring & Logging', description: 'System monitoring and log management', difficulty: Difficulty.ADVANCED, sortOrder: 83 },
  { slug: 'data-governance', name: 'Data Governance', description: 'Data governance and quality', difficulty: Difficulty.ADVANCED, sortOrder: 84 },
  { slug: 'data-lineage', name: 'Data Lineage', description: 'Tracking data lineage', difficulty: Difficulty.ADVANCED, sortOrder: 85 },
  { slug: 'data-quality-checks', name: 'Data Quality Checks', description: 'Data quality validation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 86 },
  { slug: 'alerting-systems', name: 'Alerting Systems', description: 'Setting up data alerts', difficulty: Difficulty.ADVANCED, sortOrder: 87 },
  { slug: 'logging-frameworks', name: 'Logging Frameworks', description: 'Log aggregation and analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 88 },
  { slug: 'elk-stack', name: 'ELK Stack', description: 'Elasticsearch-Logstash-Kibana stack', difficulty: Difficulty.ADVANCED, sortOrder: 89 },
  { slug: 'splunk', name: 'Splunk', description: 'Splunk log analysis platform', difficulty: Difficulty.ADVANCED, sortOrder: 90 },
  { slug: 'prometheus', name: 'Prometheus', description: 'Prometheus monitoring system', difficulty: Difficulty.ADVANCED, sortOrder: 91 },

  // ==== SECURITY ====
  { slug: 'security-de', name: 'Security', description: 'Data engineering security', difficulty: Difficulty.ADVANCED, sortOrder: 92 },
  { slug: 'https-tls-security', name: 'HTTPS / TLS / Encryption', description: 'Secure data transmission', difficulty: Difficulty.INTERMEDIATE, sortOrder: 93 },
  { slug: 'encryption', name: 'Encryption', description: 'Data encryption at rest and in transit', difficulty: Difficulty.ADVANCED, sortOrder: 94 },
  { slug: 'authentication-authorization', name: 'Authentication & Authorization', description: 'Access control mechanisms', difficulty: Difficulty.ADVANCED, sortOrder: 95 },

  // ==== PRIVACY ====
  { slug: 'privacy-de', name: 'Privacy', description: 'Data privacy and compliance', difficulty: Difficulty.ADVANCED, sortOrder: 96 },
  { slug: 'gdpr-compliance', name: 'GDPR', description: 'GDPR compliance', difficulty: Difficulty.ADVANCED, sortOrder: 97 },
  { slug: 'pii-handling', name: 'PII Handling', description: 'Personally Identifiable Information handling', difficulty: Difficulty.ADVANCED, sortOrder: 98 },

  // ==== MACHINE LEARNING ====
  { slug: 'machine-learning-de', name: 'Machine Learning', description: 'ML pipelines and integration', difficulty: Difficulty.ADVANCED, sortOrder: 99 },
  { slug: 'ml-models', name: 'ML Models', description: 'Building ML models', difficulty: Difficulty.ADVANCED, sortOrder: 100 },
  { slug: 'model-training', name: 'Model Training', description: 'Training machine learning models', difficulty: Difficulty.ADVANCED, sortOrder: 101 },
  { slug: 'model-deployment', name: 'Model Deployment', description: 'Deploying ML models', difficulty: Difficulty.ADVANCED, sortOrder: 102 },

  // ==== ADVANCED TOPICS ====
  { slug: 'advanced-tools', name: 'Advanced/Specialized Tools', description: 'Specialized data engineering tools', difficulty: Difficulty.ADVANCED, sortOrder: 103 },
  { slug: 'dbt', name: 'dbt', description: 'Data Build Tool for transformations', difficulty: Difficulty.ADVANCED, sortOrder: 104 },
  { slug: 'lakehouse-platforms', name: 'Lakehouse Platforms', description: 'Lakehouse data architectures', difficulty: Difficulty.ADVANCED, sortOrder: 105 },
  { slug: 'delta-lake', name: 'Delta Lake', description: 'Delta Lake ACID transactions', difficulty: Difficulty.ADVANCED, sortOrder: 106 },
  { slug: 'iceberg', name: 'Apache Iceberg', description: 'Apache Iceberg table format', difficulty: Difficulty.ADVANCED, sortOrder: 107 },

  // ==== KEEP LEARNING ====
  { slug: 'keep-learning-de', name: 'Keep Learning', description: 'Continuous learning in data engineering', difficulty: Difficulty.BEGINNER, sortOrder: 108 },
  { slug: 'related-roadmaps-de', name: 'Related Roadmaps', description: 'Related technical roadmaps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 109 },
];

const ROADMAP_EDGES_DATA = [
  // Pre-requisites
  { source: 'pre-requisites-de', target: 'data-engineer', type: SkillEdgeType.PREREQUISITE },
  { source: 'sql-basics', target: 'pre-requisites-de', type: SkillEdgeType.SUBSKILL_OF },

  // Python
  { source: 'python-recommended', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'python-basics-de', target: 'python-recommended', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'python-intermediate-de', target: 'python-basics-de', type: SkillEdgeType.BUILDS_ON },
  { source: 'python-advanced-de', target: 'python-intermediate-de', type: SkillEdgeType.BUILDS_ON },
  { source: 'python-data-structures', target: 'python-basics-de', type: SkillEdgeType.PREREQUISITE },

  // Basics
  { source: 'learn-basics-de', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-engineering-basics', target: 'learn-basics-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-structures-algorithms', target: 'learn-basics-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'linux-basics', target: 'learn-basics-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'system-design', target: 'learn-basics-de', type: SkillEdgeType.SUBSKILL_OF },

  // Data Transformation
  { source: 'data-transformation', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-normalization', target: 'data-transformation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'order-sorting', target: 'data-transformation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cad-patterns', target: 'data-transformation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'indexing-data-retrieval', target: 'data-transformation', type: SkillEdgeType.SUBSKILL_OF },

  // Data Storage
  { source: 'data-storage', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sql-databases', target: 'data-storage', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nosql-databases', target: 'data-storage', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mongodb', target: 'nosql-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'elasticsearch', target: 'nosql-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cassandra', target: 'nosql-databases', type: SkillEdgeType.SUBSKILL_OF },

  // Data Processing
  { source: 'data-processing', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-cleansing', target: 'data-processing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-warehousing', target: 'data-processing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'etl-patterns', target: 'data-processing', type: SkillEdgeType.SUBSKILL_OF },

  // Data Visualization
  { source: 'data-visualization-de', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tableau-de', target: 'data-visualization-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'power-bi-de', target: 'data-visualization-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'grafana', target: 'data-visualization-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kibana', target: 'data-visualization-de', type: SkillEdgeType.SUBSKILL_OF },

  // Data Ingestion
  { source: 'data-ingestion', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sources-of-data', target: 'data-ingestion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'file-transfer', target: 'data-ingestion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ftp', target: 'file-transfer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sftp', target: 'file-transfer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'https-transfer', target: 'file-transfer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'api-ingestion', target: 'data-ingestion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'messaging-queueing', target: 'data-ingestion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kafka', target: 'messaging-queueing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rabbitmq', target: 'messaging-queueing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kinesis', target: 'messaging-queueing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'aws-sqs', target: 'messaging-queueing', type: SkillEdgeType.SUBSKILL_OF },

  // Query Engines
  { source: 'query-engines', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'apache-spark', target: 'query-engines', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'presto', target: 'query-engines', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'apache-hive', target: 'query-engines', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pig-language', target: 'query-engines', type: SkillEdgeType.SUBSKILL_OF },

  // Cloud Computing
  { source: 'cloud-computing-de', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'what-is-cloud-computing', target: 'cloud-computing-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cloud-services', target: 'cloud-computing-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'saas', target: 'cloud-services', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'paas', target: 'cloud-services', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'iaas', target: 'cloud-services', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'aws-cloud', target: 'cloud-computing-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gcp-cloud', target: 'cloud-computing-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'azure-cloud', target: 'cloud-computing-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ibm-cloud', target: 'cloud-computing-de', type: SkillEdgeType.SUBSKILL_OF },

  // Orchestration
  { source: 'orchestration-tools', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'airflow', target: 'orchestration-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dagster', target: 'orchestration-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'prefect', target: 'orchestration-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'luigi', target: 'orchestration-tools', type: SkillEdgeType.SUBSKILL_OF },

  // Infrastructure as Code
  { source: 'infrastructure-as-code-de', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'docker-iac', target: 'infrastructure-as-code-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kubernetes', target: 'infrastructure-as-code-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'terraform', target: 'infrastructure-as-code-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ansible', target: 'infrastructure-as-code-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'chef', target: 'infrastructure-as-code-de', type: SkillEdgeType.SUBSKILL_OF },

  // Testing
  { source: 'testing-de', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'unit-testing', target: 'testing-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'integration-testing', target: 'testing-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'end-to-end-testing', target: 'testing-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'regression-testing', target: 'testing-de', type: SkillEdgeType.SUBSKILL_OF },

  // Data Serialization
  { source: 'data-serialization', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'json-format', target: 'data-serialization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'avro-format', target: 'data-serialization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'protobuf-format', target: 'data-serialization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'xml-format', target: 'data-serialization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'csv-format', target: 'data-serialization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'parquet-format', target: 'data-serialization', type: SkillEdgeType.SUBSKILL_OF },

  // Monitoring & Logging
  { source: 'monitoring-logging', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-governance', target: 'monitoring-logging', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-lineage', target: 'monitoring-logging', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-quality-checks', target: 'monitoring-logging', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'alerting-systems', target: 'monitoring-logging', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'logging-frameworks', target: 'monitoring-logging', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'elk-stack', target: 'logging-frameworks', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'splunk', target: 'logging-frameworks', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'prometheus', target: 'alerting-systems', type: SkillEdgeType.SUBSKILL_OF },

  // Security
  { source: 'security-de', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'https-tls-security', target: 'security-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'encryption', target: 'security-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'authentication-authorization', target: 'security-de', type: SkillEdgeType.SUBSKILL_OF },

  // Privacy
  { source: 'privacy-de', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gdpr-compliance', target: 'privacy-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pii-handling', target: 'privacy-de', type: SkillEdgeType.SUBSKILL_OF },

  // Machine Learning
  { source: 'machine-learning-de', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ml-models', target: 'machine-learning-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'model-training', target: 'machine-learning-de', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'model-deployment', target: 'machine-learning-de', type: SkillEdgeType.SUBSKILL_OF },

  // Advanced Tools
  { source: 'advanced-tools', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dbt', target: 'advanced-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'lakehouse-platforms', target: 'advanced-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'delta-lake', target: 'lakehouse-platforms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'iceberg', target: 'lakehouse-platforms', type: SkillEdgeType.SUBSKILL_OF },

  // Keep Learning
  { source: 'keep-learning-de', target: 'data-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'related-roadmaps-de', target: 'keep-learning-de', type: SkillEdgeType.RELATED },
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
  console.log('Starting Data Engineer roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'data-engineer' },
    update: { name: 'Data Engineer', description: 'Data Engineer specialization' },
    create: {
      name: 'Data Engineer',
      slug: 'data-engineer',
      description: 'Data Engineer specialization',
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
    where: { slug: 'data-engineer' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'data-engineer' },
    update: {
      name: 'Data Engineer',
      description: 'Comprehensive Data Engineer roadmap covering SQL, Python, data storage, processing, cloud platforms, orchestration, security, and advanced technologies',
      icon: '⚙️',
      color: '#EC4899',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'Data Engineer',
      slug: 'data-engineer',
      description: 'Comprehensive Data Engineer roadmap covering SQL, Python, data storage, processing, cloud platforms, orchestration, security, and advanced technologies',
      icon: '⚙️',
      color: '#EC4899',
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

  console.log('\n✓ Data Engineer roadmap seeded successfully!');
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

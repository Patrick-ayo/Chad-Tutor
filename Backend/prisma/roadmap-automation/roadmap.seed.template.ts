/**
 * Roadmap Seed Template
 *
 * Usage:
 *   npx ts-node prisma/roadmap-automation/[roadmap-name].seed.ts
 *
 * Steps:
 * 1. Fill ROADMAP_NODES_DATA and ROADMAP_EDGES with extracted roadmap data
 * 2. Run the script to seed the database
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Fill these arrays with your roadmap data
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'backend', name: 'Backend', description: 'Step by step guide to becoming a modern Backend Developer', difficulty: Difficulty.BEGINNER, sortOrder: 0 },

  // Internet
  { slug: 'internet', name: 'Internet', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
  { slug: 'how-does-the-internet-work', name: 'How does the Internet work?', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 2 },
  { slug: 'what-is-http', name: 'What is HTTP?', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 3 },
  { slug: 'what-is-domain-name', name: 'What is Domain Name?', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 4 },
  { slug: 'what-is-hosting', name: 'What is hosting?', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 5 },
  { slug: 'dns-and-how-it-works', name: 'DNS and how it works?', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 6 },
  { slug: 'browsers-and-how-they-work', name: 'Browsers and how they work?', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 7 },

  // Pick a Language
  { slug: 'pick-a-language', name: 'Pick a Language', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 8 },
  { slug: 'javascript', name: 'JavaScript', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 9 },
  { slug: 'python', name: 'Python', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 10 },
  { slug: 'java', name: 'Java', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 11 },
  { slug: 'php', name: 'PHP', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 12 },
  { slug: 'go', name: 'Go', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 13 },
  { slug: 'rust', name: 'Rust', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 14 },
  { slug: 'csharp', name: 'C#', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 15 },
  { slug: 'ruby', name: 'Ruby', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 16 },

  // Version Control Systems
  { slug: 'version-control-systems', name: 'Version Control Systems', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 17 },
  { slug: 'git', name: 'Git', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 18 },
  { slug: 'repo-hosting-services', name: 'Repo Hosting Services', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 19 },
  { slug: 'github', name: 'GitHub', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 20 },
  { slug: 'gitlab', name: 'GitLab', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 21 },
  { slug: 'bitbucket', name: 'Bitbucket', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 22 },

  // Relational Databases
  { slug: 'relational-databases', name: 'Relational Databases', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 23 },
  { slug: 'postgresql', name: 'PostgreSQL', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 24 },
  { slug: 'mysql', name: 'MySQL', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 25 },
  { slug: 'mariadb', name: 'MariaDB', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 26 },
  { slug: 'mssql', name: 'MS SQL', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 27 },
  { slug: 'oracle', name: 'Oracle', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 28 },
  { slug: 'sqlite', name: 'SQLite', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 29 },

  // Caching
  { slug: 'caching', name: 'Caching', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'redis', name: 'Redis', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },
  { slug: 'memcached', name: 'Memcached', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },
  { slug: 'server-side', name: 'Server Side', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },
  { slug: 'cdn', name: 'CDN', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },
  { slug: 'client-side', name: 'Client Side', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 35 },

  // Learn about APIs
  { slug: 'learn-about-apis', name: 'Learn about APIs', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 36 },
  { slug: 'hateoas', name: 'HATEOAS', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },
  { slug: 'open-api-specs', name: 'Open API Specs', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 38 },
  { slug: 'rest', name: 'REST', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 39 },
  { slug: 'json-apis', name: 'JSON APIs', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 40 },
  { slug: 'soap', name: 'SOAP', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'grpc', name: 'gRPC', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },
  { slug: 'graphql', name: 'GraphQL', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },
  { slug: 'authentication', name: 'Authentication', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },
  { slug: 'jwt', name: 'JWT', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },
  { slug: 'oauth', name: 'OAuth', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'basic-authentication', name: 'Basic Authentication', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 47 },
  { slug: 'token-authentication', name: 'Token Authentication', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  { slug: 'cookie-based-auth', name: 'Cookie Based Auth', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'openid', name: 'OpenID', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 50 },
  { slug: 'saml', name: 'SAML', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 51 },

  // Web Security
  { slug: 'web-security', name: 'Web Security', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'hashing-algorithms', name: 'Hashing Algorithms', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },
  { slug: 'md5', name: 'MD5', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 54 },
  { slug: 'sha', name: 'SHA', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 55 },
  { slug: 'scrypt', name: 'scrypt', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 56 },
  { slug: 'bcrypt', name: 'bcrypt', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 57 },
  { slug: 'https', name: 'HTTPS', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 58 },
  { slug: 'owasp-risks', name: 'OWASP Risks', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 59 },
  { slug: 'cors', name: 'CORS', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },
  { slug: 'ssl-tls', name: 'SSL/TLS', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 61 },
  { slug: 'csp', name: 'CSP', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 62 },
  { slug: 'server-security', name: 'Server Security', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 63 },
  { slug: 'api-security-best-practices', name: 'API Security Best Practices', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 64 },

  // Testing
  { slug: 'testing', name: 'Testing', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 65 },
  { slug: 'integration-testing', name: 'Integration Testing', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 66 },
  { slug: 'unit-testing', name: 'Unit Testing', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 67 },
  { slug: 'functional-testing', name: 'Functional Testing', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 68 },

  // CI/CD
  { slug: 'ci-cd', name: 'CI/CD', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 69 },

  // More about Databases
  { slug: 'more-about-databases', name: 'More about Databases', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 70 },
  { slug: 'orms', name: 'ORMs', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 71 },
  { slug: 'acid', name: 'ACID', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 72 },
  { slug: 'transactions', name: 'Transactions', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 73 },
  { slug: 'n-plus-1-problem', name: 'N+1 Problem', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 74 },
  { slug: 'normalization', name: 'Normalization', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 75 },
  { slug: 'failure-modes', name: 'Failure Modes', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 76 },
  { slug: 'profiling-performance', name: 'Profiling Performance', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 77 },
  { slug: 'migrations', name: 'Migrations', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 78 },

  // Scaling Databases
  { slug: 'scaling-databases', name: 'Scaling Databases', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 79 },
  { slug: 'database-indexes', name: 'Database Indexes', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 80 },
  { slug: 'data-replication', name: 'Data Replication', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 81 },
  { slug: 'sharding-strategies', name: 'Sharding Strategies', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 82 },
  { slug: 'cap-theorem', name: 'CAP Theorem', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 83 },

  // Software Design & Architecture
  { slug: 'software-design-architecture', name: 'Software Design & Architecture', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 84 },
  { slug: 'design-development-principles', name: 'Design and Development Principles', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 85 },
  { slug: 'gof-design-patterns', name: 'GOF Design Patterns', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 86 },
  { slug: 'domain-driven-design', name: 'Domain Driven Design', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 87 },
  { slug: 'test-driven-development', name: 'Test Driven Development', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 88 },
  { slug: 'cqrs', name: 'CQRS', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 89 },
  { slug: 'event-sourcing', name: 'Event Sourcing', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 90 },
  { slug: 'architectural-patterns', name: 'Architectural Patterns', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 91 },
  { slug: 'monolithic-apps', name: 'Monolithic Apps', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 92 },
  { slug: 'microservices', name: 'Microservices', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 93 },
  { slug: 'soa', name: 'SOA', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 94 },
  { slug: 'serverless', name: 'Serverless', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 95 },
  { slug: 'service-mesh', name: 'Service Mesh', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 96 },
  { slug: 'twelve-factor-apps', name: 'Twelve Factor Apps', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 97 },

  // Containerization vs Virtualization
  { slug: 'containerization-virtualization', name: 'Containerization vs Virtualization', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 98 },
  { slug: 'docker', name: 'Docker', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 99 },
  { slug: 'lxc', name: 'LXC', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 100 },
  { slug: 'kubernetes', name: 'Kubernetes', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 101 },

  // Web Servers
  { slug: 'web-servers', name: 'Web Servers', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 102 },
  { slug: 'nginx', name: 'Nginx', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 103 },
  { slug: 'apache', name: 'Apache', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 104 },
  { slug: 'caddy', name: 'Caddy', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 105 },
  { slug: 'ms-iis', name: 'MS IIS', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 106 },

  // Search Engines
  { slug: 'search-engines', name: 'Search Engines', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 107 },
  { slug: 'elasticsearch', name: 'Elasticsearch', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 108 },
  { slug: 'solr', name: 'Solr', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 109 },

  // Message Brokers
  { slug: 'message-brokers', name: 'Message Brokers', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 110 },
  { slug: 'rabbitmq', name: 'RabbitMQ', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 111 },
  { slug: 'kafka', name: 'Kafka', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 112 },

  // Real-Time Data
  { slug: 'real-time-data', name: 'Real-Time Data', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 113 },
  { slug: 'server-sent-events', name: 'Server Sent Events', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 114 },
  { slug: 'websockets', name: 'WebSockets', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 115 },
  { slug: 'long-polling', name: 'Long Polling', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 116 },
  { slug: 'short-polling', name: 'Short Polling', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 117 },

  // NoSQL Databases
  { slug: 'nosql-databases', name: 'NoSQL Databases', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 118 },
  { slug: 'document-dbs', name: 'Document DBs', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 119 },
  { slug: 'mongodb', name: 'MongoDB', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 120 },
  { slug: 'couchdb', name: 'CouchDB', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 121 },
  { slug: 'key-value', name: 'Key-Value', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 122 },
  { slug: 'dynamodb', name: 'DynamoDB', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 123 },
  { slug: 'realtime', name: 'Realtime', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 124 },
  { slug: 'firebase', name: 'Firebase', description: '', difficulty: Difficulty.BEGINNER, sortOrder: 125 },
  { slug: 'rethinkdb', name: 'RethinkDB', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 126 },
  { slug: 'time-series', name: 'Time Series', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 127 },
  { slug: 'influxdb', name: 'InfluxDB', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 128 },
  { slug: 'timescale', name: 'TimeScale', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 129 },
  { slug: 'column-dbs', name: 'Column DBs', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 130 },
  { slug: 'cassandra', name: 'Cassandra', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 131 },
  { slug: 'hbase', name: 'HBase', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 132 },
  { slug: 'graph-dbs', name: 'Graph DBs', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 133 },
  { slug: 'neo4j', name: 'Neo4j', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 134 },
  { slug: 'aws-neptune', name: 'AWS Neptune', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 135 },

  // Building for Scale
  { slug: 'building-for-scale', name: 'Building for Scale', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 136 },
  { slug: 'graceful-degradation', name: 'Graceful Degradation', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 137 },
  { slug: 'throttling', name: 'Throttling', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 138 },
  { slug: 'backpressure', name: 'Backpressure', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 139 },
  { slug: 'loadshifting', name: 'Loadshifting', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 140 },
  { slug: 'circuit-breaker', name: 'Circuit Breaker', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 141 },
  { slug: 'mitigation-strategies', name: 'Mitigation Strategies', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 142 },
  { slug: 'migration-strategies', name: 'Migration Strategies', description: '', difficulty: Difficulty.ADVANCED, sortOrder: 143 },
  { slug: 'types-of-scaling', name: 'Types of Scaling', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 144 },

  // Basic Infrastructure Knowledge
  { slug: 'basic-infrastructure-knowledge', name: 'Basic Infrastructure Knowledge', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 145 },

  // Observability
  { slug: 'observability', name: 'Observability', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 146 },
  { slug: 'difference-usage', name: 'Difference & Usage', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 147 },
  { slug: 'instrumentation', name: 'Instrumentation', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 148 },
  { slug: 'monitoring', name: 'Monitoring', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 149 },
  { slug: 'telemetry', name: 'Telemetry', description: '', difficulty: Difficulty.INTERMEDIATE, sortOrder: 150 },
];

const ROADMAP_EDGES = [
  // Internet -> Backend
  { source: 'internet', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'how-does-the-internet-work', target: 'internet', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'what-is-http', target: 'internet', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'what-is-domain-name', target: 'internet', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'what-is-hosting', target: 'internet', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dns-and-how-it-works', target: 'internet', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'browsers-and-how-they-work', target: 'internet', type: SkillEdgeType.SUBSKILL_OF },

  // Pick a Language -> Backend
  { source: 'pick-a-language', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'javascript', target: 'pick-a-language', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'python', target: 'pick-a-language', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'java', target: 'pick-a-language', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'php', target: 'pick-a-language', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'go', target: 'pick-a-language', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rust', target: 'pick-a-language', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'csharp', target: 'pick-a-language', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ruby', target: 'pick-a-language', type: SkillEdgeType.SUBSKILL_OF },

  // Version Control Systems -> Backend
  { source: 'version-control-systems', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'git', target: 'version-control-systems', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'repo-hosting-services', target: 'version-control-systems', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'github', target: 'repo-hosting-services', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gitlab', target: 'repo-hosting-services', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bitbucket', target: 'repo-hosting-services', type: SkillEdgeType.SUBSKILL_OF },

  // Relational Databases -> Backend
  { source: 'relational-databases', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'postgresql', target: 'relational-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mysql', target: 'relational-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mariadb', target: 'relational-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mssql', target: 'relational-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'oracle', target: 'relational-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sqlite', target: 'relational-databases', type: SkillEdgeType.SUBSKILL_OF },

  // Caching -> Backend
  { source: 'caching', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'redis', target: 'caching', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'memcached', target: 'caching', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'server-side', target: 'caching', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cdn', target: 'caching', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'client-side', target: 'caching', type: SkillEdgeType.SUBSKILL_OF },

  // Learn about APIs -> Backend
  { source: 'learn-about-apis', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hateoas', target: 'learn-about-apis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'open-api-specs', target: 'learn-about-apis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rest', target: 'learn-about-apis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'json-apis', target: 'learn-about-apis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'soap', target: 'learn-about-apis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'grpc', target: 'learn-about-apis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'graphql', target: 'learn-about-apis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'authentication', target: 'learn-about-apis', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'jwt', target: 'authentication', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'oauth', target: 'authentication', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'basic-authentication', target: 'authentication', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'token-authentication', target: 'authentication', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cookie-based-auth', target: 'authentication', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'openid', target: 'authentication', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'saml', target: 'authentication', type: SkillEdgeType.SUBSKILL_OF },

  // Web Security -> Backend
  { source: 'web-security', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hashing-algorithms', target: 'web-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'md5', target: 'hashing-algorithms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sha', target: 'hashing-algorithms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'scrypt', target: 'hashing-algorithms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bcrypt', target: 'hashing-algorithms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'https', target: 'web-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'owasp-risks', target: 'web-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cors', target: 'web-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ssl-tls', target: 'web-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'csp', target: 'web-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'server-security', target: 'web-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'api-security-best-practices', target: 'web-security', type: SkillEdgeType.SUBSKILL_OF },

  // Testing -> Backend
  { source: 'testing', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'integration-testing', target: 'testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'unit-testing', target: 'testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'functional-testing', target: 'testing', type: SkillEdgeType.SUBSKILL_OF },

  // CI/CD -> Backend
  { source: 'ci-cd', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },

  // More about Databases -> Backend
  { source: 'more-about-databases', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'orms', target: 'more-about-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'acid', target: 'more-about-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'transactions', target: 'more-about-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'n-plus-1-problem', target: 'more-about-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'normalization', target: 'more-about-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'failure-modes', target: 'more-about-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'profiling-performance', target: 'more-about-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'migrations', target: 'more-about-databases', type: SkillEdgeType.SUBSKILL_OF },

  // Scaling Databases -> Backend
  { source: 'scaling-databases', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'database-indexes', target: 'scaling-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-replication', target: 'scaling-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sharding-strategies', target: 'scaling-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cap-theorem', target: 'scaling-databases', type: SkillEdgeType.SUBSKILL_OF },

  // Software Design & Architecture -> Backend
  { source: 'software-design-architecture', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'design-development-principles', target: 'software-design-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gof-design-patterns', target: 'design-development-principles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'domain-driven-design', target: 'design-development-principles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'test-driven-development', target: 'design-development-principles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cqrs', target: 'design-development-principles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'event-sourcing', target: 'design-development-principles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'architectural-patterns', target: 'software-design-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'monolithic-apps', target: 'architectural-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'microservices', target: 'architectural-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'soa', target: 'architectural-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'serverless', target: 'architectural-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'service-mesh', target: 'architectural-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'twelve-factor-apps', target: 'architectural-patterns', type: SkillEdgeType.SUBSKILL_OF },

  // Containerization vs Virtualization -> Backend
  { source: 'containerization-virtualization', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'docker', target: 'containerization-virtualization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'lxc', target: 'docker', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kubernetes', target: 'containerization-virtualization', type: SkillEdgeType.SUBSKILL_OF },

  // Web Servers -> Backend
  { source: 'web-servers', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nginx', target: 'web-servers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'apache', target: 'web-servers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'caddy', target: 'web-servers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ms-iis', target: 'web-servers', type: SkillEdgeType.SUBSKILL_OF },

  // Search Engines -> Backend
  { source: 'search-engines', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'elasticsearch', target: 'search-engines', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'solr', target: 'search-engines', type: SkillEdgeType.SUBSKILL_OF },

  // Message Brokers -> Backend
  { source: 'message-brokers', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rabbitmq', target: 'message-brokers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kafka', target: 'message-brokers', type: SkillEdgeType.SUBSKILL_OF },

  // Real-Time Data -> Backend
  { source: 'real-time-data', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'server-sent-events', target: 'real-time-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'websockets', target: 'real-time-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'long-polling', target: 'real-time-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'short-polling', target: 'real-time-data', type: SkillEdgeType.SUBSKILL_OF },

  // NoSQL Databases -> Backend
  { source: 'nosql-databases', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'document-dbs', target: 'nosql-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mongodb', target: 'document-dbs', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'couchdb', target: 'document-dbs', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'key-value', target: 'nosql-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'redis', target: 'key-value', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dynamodb', target: 'key-value', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'realtime', target: 'nosql-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'firebase', target: 'realtime', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rethinkdb', target: 'realtime', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'time-series', target: 'nosql-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'influxdb', target: 'time-series', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'timescale', target: 'time-series', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'column-dbs', target: 'nosql-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cassandra', target: 'column-dbs', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hbase', target: 'column-dbs', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'graph-dbs', target: 'nosql-databases', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'neo4j', target: 'graph-dbs', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'aws-neptune', target: 'graph-dbs', type: SkillEdgeType.SUBSKILL_OF },

  // Building for Scale -> Backend
  { source: 'building-for-scale', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'graceful-degradation', target: 'building-for-scale', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'throttling', target: 'building-for-scale', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'backpressure', target: 'building-for-scale', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'loadshifting', target: 'building-for-scale', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'circuit-breaker', target: 'building-for-scale', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mitigation-strategies', target: 'building-for-scale', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'migration-strategies', target: 'building-for-scale', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'types-of-scaling', target: 'building-for-scale', type: SkillEdgeType.SUBSKILL_OF },

  // Basic Infrastructure Knowledge -> Backend
  { source: 'basic-infrastructure-knowledge', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },

  // Observability -> Backend
  { source: 'observability', target: 'backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'difference-usage', target: 'observability', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'instrumentation', target: 'observability', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'monitoring', target: 'observability', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'telemetry', target: 'observability', type: SkillEdgeType.SUBSKILL_OF },
];

async function main() {
  // Upsert the category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'backend-dev' },
    update: {},
    create: {
      name: 'Backend Development',
      slug: 'backend-dev',
      description: 'Backend development skills and technologies',
      icon: '⚙️',
      color: '#6366F1',
      sortOrder: 1,
    },
  });

  // Build nodes with categoryId
  const ROADMAP_NODES = ROADMAP_NODES_DATA.map(node => ({
    ...node,
    categoryId: category.id,
    normalizedName: node.name.toLowerCase(),
  }));

  // Insert all nodes (skills)
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

  // Get the root skill
  const rootSkill = await prisma.skill.findUnique({ where: { slug: 'backend' } });

  // Create or update the Roadmap
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'backend' },
    update: {
      name: 'Backend Developer',
      description: 'Step by step guide to becoming a modern Backend Developer in 2026',
      icon: '⚙️',
      color: '#6366F1',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'Backend Developer',
      slug: 'backend',
      description: 'Step by step guide to becoming a modern Backend Developer in 2026',
      icon: '⚙️',
      color: '#6366F1',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
  });

  // Link all skills to this roadmap
  const allSkillSlugs = ROADMAP_NODES.map(n => n.slug);
  await prisma.skill.updateMany({
    where: { slug: { in: allSkillSlugs } },
    data: { roadmapId: roadmap.id },
  });

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

  // Insert edges
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
    }
  }

  console.log('Roadmap seeded!');
}

main()
  .catch((e) => {
    console.error('Error seeding roadmap:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

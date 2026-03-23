/**
 * Backend Developer Roadmap Seed Script (Server-Side)
 *
 * Seeds the Backend Developer development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/backend-developer.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';
import { buildNodeResources } from './resources';

const prisma = new PrismaClient();

// Backend Developer Roadmap - Complete Server-Side Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'backend-developer', name: 'Backend Developer', description: 'Complete Backend Developer roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 0 },

  // ==== SERVER-SIDE DEVELOPMENT ====
  { slug: 'server-side-dev', name: 'Server-Side Development', description: 'Server-side fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 1 },

  // ==== TRANSPORT CONTROL PROTOCOL (TCP) ====
  { slug: 'tcp', name: 'TCP', description: 'TCP protocol fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 2 },
  { slug: 'checksum-tcp', name: 'Checksum', description: 'TCP checksum', difficulty: Difficulty.INTERMEDIATE, sortOrder: 3 },
  { slug: 'segment-structure', name: 'Segment Structure', description: 'TCP segment structure', difficulty: Difficulty.INTERMEDIATE, sortOrder: 4 },
  { slug: 'operations-tcp', name: 'Operations', description: 'TCP operations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 5 },
  { slug: 'mss-tcp', name: 'Max Segment Size', description: 'Maximum segment size', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },
  { slug: 'window-scaling', name: 'Window Scaling', description: 'TCP window scaling', difficulty: Difficulty.INTERMEDIATE, sortOrder: 7 },
  { slug: 'connection-tcp', name: 'Connection', description: 'TCP connection concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 8 },
  { slug: 'resource-usage', name: 'Resource Usage', description: 'TCP resource management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 9 },
  { slug: 'max-segment-scaling', name: 'Max Segment Scaling', description: 'Segment scaling optimization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 10 },

  // ==== USER DATAGRAM PROTOCOL (UDP) ====
  { slug: 'udp', name: 'UDP', description: 'UDP protocol fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 11 },
  { slug: 'reliability-udp', name: 'Reliability', description: 'UDP reliability concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },
  { slug: 'congestion-control-udp', name: 'Congestion Control', description: 'UDP congestion handling', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },
  { slug: 'checksum-udp', name: 'Checksum', description: 'UDP checksum', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },
  { slug: 'pocket-structure', name: 'Pocket Structure', description: 'UDP packet structure', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },

  // ==== TCP VS UDP ====
  { slug: 'tcp-vs-udp', name: 'TCP vs UDP', description: 'TCP vs UDP comparison', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },

  // ==== DENIAL OF SERVICE ====
  { slug: 'denial-of-service', name: 'Denial of Service', description: 'DoS protection', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },
  { slug: 'connection-hijacking', name: 'Connection Hijacking', description: 'Connection hijacking prevention', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },

  // ==== VULNERABILITY & SECURITY ====
  { slug: 'vulnerability-backend', name: 'Vulnerability', description: 'Vulnerability concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },

  // ==== PROGRAMMING LANGUAGES ====
  { slug: 'programming-languages-backend', name: 'Programming Languages', description: 'Backend programming languages', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },
  { slug: 'java-backend', name: 'Java', description: 'Java programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'csharp-backend', name: 'C#', description: 'C# programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },
  { slug: 'cpp-backend', name: 'C/C++', description: 'C and C++ languages', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'erlang', name: 'Erlang', description: 'Erlang programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },
  { slug: 'go-backend', name: 'Go', description: 'Go programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'javascript-backend', name: 'JavaScript', description: 'JavaScript for backend', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },

  // ==== SOCKET PROGRAMMING ====
  { slug: 'socket-programming', name: 'Socket Programming', description: 'Network socket programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },

  // ==== API ====
  { slug: 'api-backend', name: 'API', description: 'API design and development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },
  { slug: 'bsd-socket', name: 'BSD Socket', description: 'BSD socket API', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'winsock', name: 'Winsock', description: 'Windows Socket API', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },

  // ==== SERIALIZATION ====
  { slug: 'serialization-backend', name: 'Serialization', description: 'Data serialization formats', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },
  { slug: 'json-backend', name: 'JSON', description: 'JSON format', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },
  { slug: 'toml-backend', name: 'TOML', description: 'TOML format', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },
  { slug: 'xml-backend', name: 'XML', description: 'XML format', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },
  { slug: 'yaml-backend', name: 'YAML', description: 'YAML format', difficulty: Difficulty.INTERMEDIATE, sortOrder: 35 },
  { slug: 'protobuf', name: 'Protocol Buffers', description: 'Protocol Buffers serialization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },

  // ==== PROGRAMMING TECHNIQUES ====
  { slug: 'programming-techniques-backend', name: 'Programming Techniques', description: 'Backend programming techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },
  { slug: 'design-patterns-backend', name: 'Design Patterns', description: 'Software design patterns', difficulty: Difficulty.INTERMEDIATE, sortOrder: 38 },
  { slug: 'tdd-backend', name: 'TDD', description: 'Test-Driven Development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'dependency-injection', name: 'Dependency Injection', description: 'Dependency injection pattern', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'dump-analysis', name: 'Dump Analysis', description: 'Memory dump analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'functional-programming', name: 'Functional Programming', description: 'Functional programming paradigm', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },

  // ==== DATABASE ====
  { slug: 'database-backend', name: 'Database', description: 'Database systems and management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },
  
  // SQL Databases
  { slug: 'sql-backend', name: 'SQL', description: 'SQL databases', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },
  { slug: 'mysql-backend', name: 'MySQL', description: 'MySQL database', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },
  { slug: 'postgresql-backend', name: 'PostgreSQL', description: 'PostgreSQL database', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'cassandra-backend', name: 'Cassandra', description: 'Cassandra database', difficulty: Difficulty.INTERMEDIATE, sortOrder: 47 },
  { slug: 'ms-sql-backend', name: 'MS SQL', description: 'Microsoft SQL Server', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  
  // NoSQL Databases
  { slug: 'nosql-backend', name: 'NoSQL', description: 'NoSQL databases', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'mongodb-backend', name: 'MongoDB', description: 'MongoDB database', difficulty: Difficulty.INTERMEDIATE, sortOrder: 50 },
  { slug: 'redis-backend', name: 'Redis', description: 'Redis cache database', difficulty: Difficulty.INTERMEDIATE, sortOrder: 51 },
  { slug: 'couchbase', name: 'Couchbase', description: 'Couchbase database', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'rdbms-backend', name: 'RDBMS', description: 'Relational database management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },
  
  // Database Concepts
  { slug: 'orm-backend', name: 'ORM', description: 'Object-Relational Mapping', difficulty: Difficulty.INTERMEDIATE, sortOrder: 54 },
  { slug: 'dml-backend', name: 'DML', description: 'Data Manipulation Language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 55 },

  // ==== CIPHER ====
  { slug: 'cipher-backend', name: 'Cipher', description: 'Encryption and ciphers', difficulty: Difficulty.ADVANCED, sortOrder: 56 },

  // ==== RPC / REST ====
  { slug: 'rpc-rest', name: 'RPC / REST', description: 'RPC and REST protocols', difficulty: Difficulty.INTERMEDIATE, sortOrder: 57 },

  // ==== MESSAGE QUEUES ====
  { slug: 'message-queues', name: 'Message Queues', description: 'Message queue systems', difficulty: Difficulty.INTERMEDIATE, sortOrder: 58 },

  // ==== MULTITHREADING ====
  { slug: 'multithreading', name: 'Multithreading', description: 'Multi-threaded programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 59 },
  { slug: 'thread-local-storage', name: 'Thread Local Storage', description: 'Thread-local storage concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },
  { slug: 'windows-threading', name: 'Windows', description: 'Windows threading', difficulty: Difficulty.INTERMEDIATE, sortOrder: 61 },
  { slug: 'pthread-backend', name: 'pThread', description: 'POSIX threads', difficulty: Difficulty.INTERMEDIATE, sortOrder: 62 },

  // ==== CONCURRENCY ====
  { slug: 'concurrency-backend', name: 'Concurrency', description: 'Concurrent programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 63 },
  { slug: 'synchronization', name: 'Synchronization', description: 'Thread synchronization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 64 },
  { slug: 'condition-variable', name: 'Condition Variable', description: 'Condition variables', difficulty: Difficulty.INTERMEDIATE, sortOrder: 65 },
  { slug: 'spinlock', name: 'Spinlock', description: 'Spinlock synchronization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 66 },

  // ==== ASYNCHRONOUS PATTERNS ====
  { slug: 'async-patterns', name: 'Asynchronous', description: 'Async programming patterns', difficulty: Difficulty.INTERMEDIATE, sortOrder: 67 },
  { slug: 'reactive-model', name: 'Reactive Model', description: 'Reactive programming model', difficulty: Difficulty.INTERMEDIATE, sortOrder: 68 },
  { slug: 'reactive-approach', name: 'Reactive Approach', description: 'Reactive system approach', difficulty: Difficulty.INTERMEDIATE, sortOrder: 69 },

  // ==== ACTOR MODEL & THREADING ====
  { slug: 'actor-model', name: 'Actor Model', description: 'Actor model concurrency', difficulty: Difficulty.INTERMEDIATE, sortOrder: 70 },
  { slug: 'akka-framework', name: 'Akka (Scala)', description: 'Akka actor framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 71 },
  { slug: 'akka-java', name: 'Akka (Java)', description: 'Akka for Java', difficulty: Difficulty.INTERMEDIATE, sortOrder: 72 },
  { slug: 'asknet-csharp', name: 'AskNet (C#)', description: 'AskNet for C#', difficulty: Difficulty.INTERMEDIATE, sortOrder: 73 },
  { slug: 'akka-net', name: 'Akka.NET', description: 'Akka.NET framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 74 },
  { slug: 'mailbox', name: 'Mailbox', description: 'Actor mailbox', difficulty: Difficulty.INTERMEDIATE, sortOrder: 75 },
  { slug: 'inproc', name: 'Inproc', description: 'In-process communication', difficulty: Difficulty.INTERMEDIATE, sortOrder: 76 },
  { slug: 'in-uping', name: 'In-Uping', description: 'In-process communication protocol', difficulty: Difficulty.INTERMEDIATE, sortOrder: 77 },
  { slug: 'kqueue', name: 'kqueue', description: 'kqueue event notification', difficulty: Difficulty.INTERMEDIATE, sortOrder: 78 },
  { slug: 'select', name: 'select', description: 'select() system call', difficulty: Difficulty.INTERMEDIATE, sortOrder: 79 },
  { slug: 'iocpl', name: 'IOCPL', description: 'I/O Completion Ports', difficulty: Difficulty.INTERMEDIATE, sortOrder: 80 },
  { slug: 'registered-io', name: 'Registered I/O', description: 'Ring-based I/O', difficulty: Difficulty.INTERMEDIATE, sortOrder: 81 },

  // ==== ADVANCED CONCURRENCY ====
  { slug: 'future-promise', name: 'Future & Promises', description: 'Futures and promises', difficulty: Difficulty.INTERMEDIATE, sortOrder: 82 },
  { slug: 'mutex-backend', name: 'Mutex', description: 'Mutual exclusion locks', difficulty: Difficulty.INTERMEDIATE, sortOrder: 83 },
  { slug: 'semaphore-backend', name: 'Semaphore', description: 'Semaphore synchronization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 84 },

  // ==== CONTAINERIZATION ====
  { slug: 'containerization-backend', name: 'Containerization', description: 'Container technologies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 85 },
  { slug: 'docker-backend', name: 'Docker', description: 'Docker containerization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 86 },
  { slug: 'docker-compose', name: 'Docker Compose', description: 'Docker Compose orchestration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 87 },
  { slug: 'kubernetes-backend', name: 'Kubernetes', description: 'Kubernetes orchestration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 88 },

  // ==== DATA CLUSTERING ====
  { slug: 'data-clustering', name: 'Data Clustering', description: 'Data clustering and distribution', difficulty: Difficulty.INTERMEDIATE, sortOrder: 89 },
  { slug: 'apache-spark', name: 'Apache Spark', description: 'Apache Spark distributed computing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 90 },

  // ==== CLOUD & AI ====
  { slug: 'cloud-backend', name: 'Cloud', description: 'Cloud platforms and services', difficulty: Difficulty.INTERMEDIATE, sortOrder: 91 },
  { slug: 'serverless', name: 'Serverless', description: 'Serverless architecture', difficulty: Difficulty.INTERMEDIATE, sortOrder: 92 },
  { slug: 'azure-backend', name: 'Azure', description: 'Microsoft Azure', difficulty: Difficulty.INTERMEDIATE, sortOrder: 93 },
  { slug: 'gcp-backend', name: 'GCP', description: 'Google Cloud Platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 94 },
  { slug: 'aws-backend', name: 'AWS', description: 'Amazon Web Services', difficulty: Difficulty.INTERMEDIATE, sortOrder: 95 },

  // ==== AI & MACHINE LEARNING ====
  { slug: 'ai-backend', name: 'AI', description: 'Artificial Intelligence', difficulty: Difficulty.INTERMEDIATE, sortOrder: 96 },
  { slug: 'deep-learning-backend', name: 'Deep Learning', description: 'Deep learning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 97 },
  { slug: 'tensorflow-backend', name: 'TensorFlow', description: 'TensorFlow framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 98 },
  { slug: 'pytorch-backend', name: 'PyTorch', description: 'PyTorch framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 99 },

  // ==== KEEP LEARNING ====
  { slug: 'keep-learning-backend', name: 'Keep learning', description: 'Continue learning backend development', difficulty: Difficulty.BEGINNER, sortOrder: 100 },
];

const ROADMAP_EDGES_DATA = [
  // Server-Side Development
  { source: 'server-side-dev', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },

  // TCP
  { source: 'tcp', target: 'server-side-dev', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'checksum-tcp', target: 'tcp', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'segment-structure', target: 'tcp', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'operations-tcp', target: 'tcp', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mss-tcp', target: 'tcp', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'window-scaling', target: 'tcp', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'connection-tcp', target: 'tcp', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'resource-usage', target: 'tcp', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'max-segment-scaling', target: 'tcp', type: SkillEdgeType.SUBSKILL_OF },

  // UDP
  { source: 'udp', target: 'server-side-dev', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'reliability-udp', target: 'udp', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'congestion-control-udp', target: 'udp', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'checksum-udp', target: 'udp', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pocket-structure', target: 'udp', type: SkillEdgeType.SUBSKILL_OF },

  // TCP vs UDP
  { source: 'tcp-vs-udp', target: 'server-side-dev', type: SkillEdgeType.SUBSKILL_OF },

  // DoS
  { source: 'denial-of-service', target: 'server-side-dev', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'connection-hijacking', target: 'denial-of-service', type: SkillEdgeType.SUBSKILL_OF },

  // Vulnerability
  { source: 'vulnerability-backend', target: 'server-side-dev', type: SkillEdgeType.SUBSKILL_OF },

  // Programming Languages
  { source: 'programming-languages-backend', target: 'backend-developer', type: SkillEdgeType.PREREQUISITE },
  { source: 'java-backend', target: 'programming-languages-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'csharp-backend', target: 'programming-languages-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cpp-backend', target: 'programming-languages-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'erlang', target: 'programming-languages-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'go-backend', target: 'programming-languages-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'javascript-backend', target: 'programming-languages-backend', type: SkillEdgeType.SUBSKILL_OF },

  // Socket Programming
  { source: 'socket-programming', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },

  // API
  { source: 'api-backend', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bsd-socket', target: 'socket-programming', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'winsock', target: 'socket-programming', type: SkillEdgeType.SUBSKILL_OF },

  // Serialization
  { source: 'serialization-backend', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'json-backend', target: 'serialization-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'toml-backend', target: 'serialization-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'xml-backend', target: 'serialization-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'yaml-backend', target: 'serialization-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'protobuf', target: 'serialization-backend', type: SkillEdgeType.SUBSKILL_OF },

  // Programming Techniques
  { source: 'programming-techniques-backend', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'design-patterns-backend', target: 'programming-techniques-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tdd-backend', target: 'programming-techniques-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dependency-injection', target: 'programming-techniques-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dump-analysis', target: 'programming-techniques-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'functional-programming', target: 'programming-techniques-backend', type: SkillEdgeType.SUBSKILL_OF },

  // Database
  { source: 'database-backend', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sql-backend', target: 'database-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mysql-backend', target: 'sql-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'postgresql-backend', target: 'sql-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cassandra-backend', target: 'sql-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ms-sql-backend', target: 'sql-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nosql-backend', target: 'database-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mongodb-backend', target: 'nosql-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'redis-backend', target: 'nosql-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'couchbase', target: 'nosql-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rdbms-backend', target: 'database-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'orm-backend', target: 'database-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dml-backend', target: 'database-backend', type: SkillEdgeType.SUBSKILL_OF },

  // Cipher
  { source: 'cipher-backend', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },

  // RPC / REST
  { source: 'rpc-rest', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },

  // Message Queues
  { source: 'message-queues', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },

  // Multithreading
  { source: 'multithreading', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'thread-local-storage', target: 'multithreading', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'windows-threading', target: 'multithreading', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pthread-backend', target: 'multithreading', type: SkillEdgeType.SUBSKILL_OF },

  // Concurrency
  { source: 'concurrency-backend', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'synchronization', target: 'concurrency-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'condition-variable', target: 'synchronization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'spinlock', target: 'synchronization', type: SkillEdgeType.SUBSKILL_OF },

  // Async Patterns
  { source: 'async-patterns', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'reactive-model', target: 'async-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'reactive-approach', target: 'async-patterns', type: SkillEdgeType.SUBSKILL_OF },

  // Actor Model
  { source: 'actor-model', target: 'concurrency-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'akka-framework', target: 'actor-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'akka-java', target: 'actor-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'asknet-csharp', target: 'actor-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'akka-net', target: 'actor-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mailbox', target: 'actor-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'inproc', target: 'actor-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'in-uping', target: 'actor-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kqueue', target: 'actor-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'select', target: 'actor-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'iocpl', target: 'actor-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'registered-io', target: 'actor-model', type: SkillEdgeType.SUBSKILL_OF },

  // Advanced Concurrency
  { source: 'future-promise', target: 'async-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mutex-backend', target: 'synchronization', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'semaphore-backend', target: 'synchronization', type: SkillEdgeType.SUBSKILL_OF },

  // Containerization
  { source: 'containerization-backend', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'docker-backend', target: 'containerization-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'docker-compose', target: 'docker-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kubernetes-backend', target: 'containerization-backend', type: SkillEdgeType.SUBSKILL_OF },

  // Data Clustering
  { source: 'data-clustering', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'apache-spark', target: 'data-clustering', type: SkillEdgeType.SUBSKILL_OF },

  // Cloud
  { source: 'cloud-backend', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'serverless', target: 'cloud-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'azure-backend', target: 'cloud-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gcp-backend', target: 'cloud-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'aws-backend', target: 'cloud-backend', type: SkillEdgeType.SUBSKILL_OF },

  // AI
  { source: 'ai-backend', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'deep-learning-backend', target: 'ai-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tensorflow-backend', target: 'deep-learning-backend', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pytorch-backend', target: 'deep-learning-backend', type: SkillEdgeType.SUBSKILL_OF },

  // Keep Learning
  { source: 'keep-learning-backend', target: 'backend-developer', type: SkillEdgeType.SUBSKILL_OF },
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
  console.log('Starting Backend Developer roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'backend-developer-server' },
    update: { name: 'Backend Developer', description: 'Backend Developer specialization' },
    create: {
      name: 'Backend Developer',
      slug: 'backend-developer-server',
      description: 'Backend Developer specialization',
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
    where: { slug: 'backend-developer' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'backend-server-developer' },
    update: {
      name: 'Backend Server Developer',
      description: 'Comprehensive Backend Server Developer roadmap covering networking protocols, programming languages, socket programming, databases, serialization, concurrency patterns, containerization, cloud platforms, and AI/ML integration',
      icon: '⚙️',
      color: '#EF4444',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'Backend Server Developer',
      slug: 'backend-server-developer',
      description: 'Comprehensive Backend Server Developer roadmap covering networking protocols, programming languages, socket programming, databases, serialization, concurrency patterns, containerization, cloud platforms, and AI/ML integration',
      icon: '⚙️',
      color: '#EF4444',
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

  console.log('\n✓ Backend Developer roadmap seeded successfully!');
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

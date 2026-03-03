/**
 * Software Architect Roadmap Seed Script
 *
 * Seeds the Software Architect development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/software-architect.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// Software Architect Roadmap - Comprehensive Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'software-architect', name: 'Software Architect', description: 'Complete Software Architect roadmap', difficulty: Difficulty.ADVANCED, sortOrder: 0 },

  // ==== UNDERSTAND THE BASICS ====
  { slug: 'understand-basics-arch', name: 'Understand the Basics', description: 'Software architecture fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 1 },
  { slug: 'what-is-software-architecture', name: 'What is Software Architecture', description: 'Software architecture concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 2 },
  { slug: 'what-is-software-architect', name: 'What is a Software Architect', description: 'Role and responsibilities of a software architect', difficulty: Difficulty.ADVANCED, sortOrder: 3 },
  { slug: 'levels-of-architecture', name: 'Levels of Architecture', description: 'Different levels of architectural design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 4 },
  { slug: 'application-architecture', name: 'Application Architecture', description: 'Application-level architecture design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 5 },
  { slug: 'solution-architecture', name: 'Solution Architecture', description: 'Solution architecture design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },
  { slug: 'enterprise-architecture', name: 'Enterprise Architecture', description: 'Enterprise-wide architecture', difficulty: Difficulty.ADVANCED, sortOrder: 7 },

  // ==== RESPONSIBILITIES ====
  { slug: 'responsibilities-arch', name: 'Responsibilities', description: 'Architect responsibilities', difficulty: Difficulty.INTERMEDIATE, sortOrder: 8 },
  { slug: 'tech-decisions', name: 'Tech Decisions', description: 'Technical decision making', difficulty: Difficulty.INTERMEDIATE, sortOrder: 9 },
  { slug: 'design-architecture-decisions', name: 'Design & Architecture Decisions', description: 'Design architecture decisions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 10 },
  { slug: 'requirements-elicitation', name: 'Requirements Elicitation', description: 'Gathering and articulating requirements', difficulty: Difficulty.INTERMEDIATE, sortOrder: 11 },
  { slug: 'documentation-arch', name: 'Documentation', description: 'Architecture documentation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },
  { slug: 'enforcing-standards', name: 'Enforcing Standards', description: 'Enforcing coding and architecture standards', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },
  { slug: 'collaborate-with-others', name: 'Collaborate with Others', description: 'Cross-team and cross-functional collaboration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },
  { slug: 'consult-coach-developers', name: 'Consult & Coach Developers', description: 'Developer mentoring and coaching', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },

  // ==== PROGRAMMING LANGUAGES ====
  { slug: 'programming-languages-arch', name: 'Programming Languages', description: 'Programming languages for architects', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'java-arch', name: 'Java', description: 'Java programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },
  { slug: 'kotlin-arch', name: 'Kotlin', description: 'Kotlin programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'scala-arch', name: 'Scala', description: 'Scala programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'python-arch', name: 'Python', description: 'Python programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },
  { slug: 'ruby-arch', name: 'Ruby', description: 'Ruby programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'go-arch', name: 'Go', description: 'Go programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },
  { slug: 'javascript-arch', name: 'JavaScript', description: 'JavaScript programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'typescript-arch', name: 'TypeScript', description: 'TypeScript programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },
  { slug: 'dotnet-framework', name: '.NET Framework Based', description: '.NET Framework and C#', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },

  // ==== PATTERNS & DESIGN PRINCIPLES ====
  { slug: 'patterns-design-principles', name: 'Patterns & Design Principles', description: 'Software design patterns and principles', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },
  { slug: 'mvc-arch', name: 'MVC', description: 'Model-View-Controller pattern', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },
  { slug: 'mvp-arch', name: 'MVP', description: 'Model-View-Presenter pattern', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },
  { slug: 'mvvm-arch', name: 'MVVM', description: 'Model-View-ViewModel pattern', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'cqrs-arch', name: 'CQRS', description: 'Command Query Responsibility Segregation', difficulty: Difficulty.ADVANCED, sortOrder: 30 },
  { slug: 'eventual-consistency', name: 'Eventual Consistency', description: 'Eventual consistency pattern', difficulty: Difficulty.ADVANCED, sortOrder: 31 },
  { slug: 'oop-arch', name: 'OOP', description: 'Object-Oriented Programming principles', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },
  { slug: 'actors-pattern', name: 'Actors', description: 'Actor model pattern', difficulty: Difficulty.ADVANCED, sortOrder: 33 },
  { slug: 'acid-theorem', name: 'ACID', description: 'ACID transaction properties', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },
  { slug: 'cap-theorem', name: 'CAP Theorem', description: 'CAP theorem for distributed systems', difficulty: Difficulty.ADVANCED, sortOrder: 35 },
  { slug: 'solid-principles', name: 'SOLID', description: 'SOLID design principles', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },
  { slug: 'tdd-arch', name: 'TDD', description: 'Test-Driven Development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },
  { slug: 'ddd-arch', name: 'DDD', description: 'Domain-Driven Design', difficulty: Difficulty.ADVANCED, sortOrder: 38 },

  // ==== TECHNICAL SKILLS ====
  { slug: 'technical-skills', name: 'Technical Skills', description: 'Technical architect skills', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'design-and-architecture', name: 'Design & Architecture', description: 'Design and architecture expertise', difficulty: Difficulty.ADVANCED, sortOrder: 40 },
  { slug: 'decision-making', name: 'Decision Making', description: 'Architectural decision making', difficulty: Difficulty.ADVANCED, sortOrder: 41 },
  { slug: 'simplifying-things', name: 'Simplifying Things', description: 'Simplification and reducing complexity', difficulty: Difficulty.ADVANCED, sortOrder: 42 },
  { slug: 'how-to-code', name: 'How to Code', description: 'Coding expertise', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },

  // ==== IMPORTANT SKILLS TO LEARN ====
  { slug: 'important-skills-to-learn', name: 'Important Skills to Learn', description: 'Important soft and technical skills', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },
  { slug: 'documentation-skill', name: 'Documentation', description: 'Technical documentation skills', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },
  { slug: 'communication-arch', name: 'Communication', description: 'Communication and presentation skills', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'estimate-and-evaluate', name: 'Estimate and Evaluate', description: 'Estimation and evaluation skills', difficulty: Difficulty.INTERMEDIATE, sortOrder: 47 },
  { slug: 'balance-arch', name: 'Balance', description: 'Balancing trade-offs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  { slug: 'consult-and-coach', name: 'Consult & Coach', description: 'Consulting and coaching abilities', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'marketing-skills', name: 'Marketing Skills', description: 'Marketing and influence skills', difficulty: Difficulty.INTERMEDIATE, sortOrder: 50 },
  { slug: 'hosting-algorithms', name: 'Hosting Algorithms', description: 'Hosting infrastructure algorithms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 51 },

  // ==== TOOLS ====
  { slug: 'tools-arch', name: 'Tools', description: 'Architecture tools and software', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'git-arch', name: 'Git', description: 'Git version control', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },
  { slug: 'github-arch', name: 'GitHub', description: 'GitHub platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 54 },
  { slug: 'slack-arch', name: 'Slack', description: 'Slack communication', difficulty: Difficulty.INTERMEDIATE, sortOrder: 55 },
  { slug: 'trello-arch', name: 'Trello', description: 'Trello project management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 56 },
  { slug: 'atlassian-tools', name: 'Atlassian Tools', description: 'Atlassian suite (Jira, Confluence)', difficulty: Difficulty.INTERMEDIATE, sortOrder: 57 },

  // ==== ARCHITECTURE STYLES ====
  { slug: 'architecture-styles', name: 'Architecture', description: 'Architecture styles and patterns', difficulty: Difficulty.ADVANCED, sortOrder: 58 },
  { slug: 'microservices-arch', name: 'Microservices', description: 'Microservices architecture', difficulty: Difficulty.ADVANCED, sortOrder: 59 },
  { slug: 'serverless-arch', name: 'Serverless', description: 'Serverless architecture', difficulty: Difficulty.ADVANCED, sortOrder: 60 },
  { slug: 'client-server-arch', name: 'Client / Server', description: 'Client-server architecture', difficulty: Difficulty.INTERMEDIATE, sortOrder: 61 },
  { slug: 'layered-arch', name: 'Layered', description: 'Layered architecture pattern', difficulty: Difficulty.INTERMEDIATE, sortOrder: 62 },
  { slug: 'distributed-systems', name: 'Distributed Systems', description: 'Distributed systems design', difficulty: Difficulty.ADVANCED, sortOrder: 63 },
  { slug: 'service-oriented', name: 'Service Oriented', description: 'Service-oriented architecture (SOA)', difficulty: Difficulty.ADVANCED, sortOrder: 64 },
  { slug: 'web-mobile-arch', name: 'Web, Mobile', description: 'Web and mobile architectures', difficulty: Difficulty.INTERMEDIATE, sortOrder: 65 },

  // ==== SECURITY ====
  { slug: 'security-arch', name: 'Security', description: 'Architecture security considerations', difficulty: Difficulty.ADVANCED, sortOrder: 66 },
  { slug: 'pki-arch', name: 'PKI', description: 'Public Key Infrastructure', difficulty: Difficulty.ADVANCED, sortOrder: 67 },
  { slug: 'owasp-arch', name: 'OWASP', description: 'OWASP security standards', difficulty: Difficulty.ADVANCED, sortOrder: 68 },
  { slug: 'auth-strategies', name: 'Auth Strategies', description: 'Authentication strategies', difficulty: Difficulty.ADVANCED, sortOrder: 69 },

  // ==== WORKING WITH DATA ====
  { slug: 'working-with-data', name: 'Working with Data', description: 'Data architecture and systems', difficulty: Difficulty.ADVANCED, sortOrder: 70 },
  { slug: 'hadoop-arch', name: 'Hadoop', description: 'Hadoop distributed computing', difficulty: Difficulty.ADVANCED, sortOrder: 71 },
  { slug: 'spark-arch', name: 'Spark', description: 'Apache Spark', difficulty: Difficulty.ADVANCED, sortOrder: 72 },
  { slug: 'mapreduce-arch', name: 'MapReduce', description: 'MapReduce framework', difficulty: Difficulty.ADVANCED, sortOrder: 73 },
  { slug: 'etl-arch', name: 'ETL', description: 'Extract Transform Load processes', difficulty: Difficulty.ADVANCED, sortOrder: 74 },
  { slug: 'datawarehouses', name: 'Datawarehouses', description: 'Data warehouse architecture', difficulty: Difficulty.ADVANCED, sortOrder: 75 },
  { slug: 'sql-databases-arch', name: 'SQL Databases', description: 'SQL database design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 76 },
  { slug: 'nosql-databases-arch', name: 'NoSQL Databases', description: 'NoSQL database design', difficulty: Difficulty.ADVANCED, sortOrder: 77 },
  { slug: 'analytics-arch', name: 'Analytics', description: 'Analytics architecture', difficulty: Difficulty.ADVANCED, sortOrder: 78 },
  { slug: 'datawarehouse-principles', name: 'Datawarehouse Principles', description: 'Data warehouse principles', difficulty: Difficulty.ADVANCED, sortOrder: 79 },

  // ==== FRAMEWORKS ====
  { slug: 'frameworks-arch', name: 'Frameworks', description: 'Architecture frameworks', difficulty: Difficulty.ADVANCED, sortOrder: 80 },
  { slug: 'babok', name: 'BABOK', description: 'Business Analysis Book of Knowledge', difficulty: Difficulty.ADVANCED, sortOrder: 81 },
  { slug: 'iaf-framework', name: 'IAF', description: 'Integrated Architecture Framework', difficulty: Difficulty.ADVANCED, sortOrder: 82 },
  { slug: 'uml-arch', name: 'UML', description: 'Unified Modeling Language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 83 },
  { slug: 'togaf', name: 'TOGAF', description: 'The Open Group Architecture Framework', difficulty: Difficulty.ADVANCED, sortOrder: 84 },

  // ==== APIs & INTEGRATIONS ====
  { slug: 'apis-integrations', name: 'APIs & Integrations', description: 'API and integration architecture', difficulty: Difficulty.INTERMEDIATE, sortOrder: 85 },
  { slug: 'grpc-arch', name: 'gRPC', description: 'gRPC framework', difficulty: Difficulty.ADVANCED, sortOrder: 86 },
  { slug: 'esb-arch', name: 'ESB', description: 'Enterprise Service Bus', difficulty: Difficulty.ADVANCED, sortOrder: 87 },
  { slug: 'soap-arch', name: 'SOAP', description: 'SOAP protocol', difficulty: Difficulty.INTERMEDIATE, sortOrder: 88 },
  { slug: 'rest-arch', name: 'REST', description: 'RESTful API design', difficulty: Difficulty.INTERMEDIATE, sortOrder: 89 },
  { slug: 'graphql-arch', name: 'GraphQL', description: 'GraphQL query language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 90 },
  { slug: 'bpm-arch', name: 'BPM', description: 'Business Process Management', difficulty: Difficulty.ADVANCED, sortOrder: 91 },
  { slug: 'bpel-arch', name: 'BPEL', description: 'Business Process Execution Language', difficulty: Difficulty.ADVANCED, sortOrder: 92 },
  { slug: 'messaging-queues-arch', name: 'Messaging Queues', description: 'Message queue systems', difficulty: Difficulty.INTERMEDIATE, sortOrder: 93 },

  // ==== NETWORKS ====
  { slug: 'networks-arch', name: 'Networks', description: 'Network architecture', difficulty: Difficulty.INTERMEDIATE, sortOrder: 94 },
  { slug: 'osi-model', name: 'OSI', description: 'OSI network model', difficulty: Difficulty.INTERMEDIATE, sortOrder: 95 },
  { slug: 'tcpip-model', name: 'TCP/IP Model', description: 'TCP/IP network model', difficulty: Difficulty.INTERMEDIATE, sortOrder: 96 },
  { slug: 'http-https', name: 'HTTP / HTTPS', description: 'HTTP and HTTPS protocols', difficulty: Difficulty.INTERMEDIATE, sortOrder: 97 },
  { slug: 'proxies-arch', name: 'Proxies', description: 'Proxy servers and patterns', difficulty: Difficulty.INTERMEDIATE, sortOrder: 98 },
  { slug: 'firewalls', name: 'Firewalls', description: 'Firewall architecture', difficulty: Difficulty.INTERMEDIATE, sortOrder: 99 },

  // ==== OPERATIONS KNOWLEDGE ====
  { slug: 'operations-knowledge', name: 'Operations Knowledge', description: 'Operations and infrastructure', difficulty: Difficulty.INTERMEDIATE, sortOrder: 100 },
  { slug: 'infrastructure-as-code', name: 'Infrastructure as Code', description: 'Infrastructure as Code practices', difficulty: Difficulty.ADVANCED, sortOrder: 101 },
  { slug: 'cloud-providers-arch', name: 'Cloud Providers', description: 'Cloud service providers', difficulty: Difficulty.ADVANCED, sortOrder: 102 },
  { slug: 'serverless-concepts', name: 'Serverless Concepts', description: 'Serverless computing concepts', difficulty: Difficulty.ADVANCED, sortOrder: 103 },
  { slug: 'linux-unix', name: 'Linux / Unix', description: 'Linux and Unix systems', difficulty: Difficulty.INTERMEDIATE, sortOrder: 104 },
  { slug: 'service-mesh', name: 'Service Mesh', description: 'Service mesh architecture', difficulty: Difficulty.ADVANCED, sortOrder: 105 },
  { slug: 'ci-cd-arch', name: 'CI / CD', description: 'Continuous Integration and Deployment', difficulty: Difficulty.ADVANCED, sortOrder: 106 },
  { slug: 'containers-arch', name: 'Containers', description: 'Container technology (Docker, Kubernetes)', difficulty: Difficulty.ADVANCED, sortOrder: 107 },
  { slug: 'cloud-design-patterns', name: 'Cloud Design Patterns', description: 'Cloud-native design patterns', difficulty: Difficulty.ADVANCED, sortOrder: 108 },

  // ==== ENTERPRISE SOFTWARE ====
  { slug: 'enterprise-software', name: 'Enterprise Software', description: 'Enterprise software systems', difficulty: Difficulty.ADVANCED, sortOrder: 109 },
  { slug: 'ms-dynamics', name: 'MS Dynamics', description: 'Microsoft Dynamics ERP', difficulty: Difficulty.ADVANCED, sortOrder: 110 },
  { slug: 'sap-erp', name: 'SAP ERP', description: 'SAP Enterprise Resource Planning', difficulty: Difficulty.ADVANCED, sortOrder: 111 },
  { slug: 'sap-hana', name: 'SAP HANA', description: 'SAP HANA in-memory database', difficulty: Difficulty.ADVANCED, sortOrder: 112 },
  { slug: 'business-objects', name: 'Business Objects', description: 'SAP Business Objects BI', difficulty: Difficulty.ADVANCED, sortOrder: 113 },
  { slug: 'emc-dms', name: 'EMC DMS', description: 'EMC Data Management System', difficulty: Difficulty.ADVANCED, sortOrder: 114 },
  { slug: 'ibm-bpm', name: 'IBM BPM', description: 'IBM Business Process Management', difficulty: Difficulty.ADVANCED, sortOrder: 115 },
  { slug: 'salesforce-arch', name: 'Salesforce', description: 'Salesforce CRM platform', difficulty: Difficulty.ADVANCED, sortOrder: 116 },
];

const ROADMAP_EDGES_DATA = [
  // Understand the Basics
  { source: 'understand-basics-arch', target: 'software-architect', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'what-is-software-architecture', target: 'understand-basics-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'what-is-software-architect', target: 'understand-basics-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'levels-of-architecture', target: 'understand-basics-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'application-architecture', target: 'levels-of-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'solution-architecture', target: 'levels-of-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'enterprise-architecture', target: 'levels-of-architecture', type: SkillEdgeType.SUBSKILL_OF },

  // Responsibilities
  { source: 'responsibilities-arch', target: 'software-architect', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tech-decisions', target: 'responsibilities-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'design-architecture-decisions', target: 'responsibilities-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'requirements-elicitation', target: 'responsibilities-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'documentation-arch', target: 'responsibilities-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'enforcing-standards', target: 'responsibilities-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'collaborate-with-others', target: 'responsibilities-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'consult-coach-developers', target: 'responsibilities-arch', type: SkillEdgeType.SUBSKILL_OF },

  // Programming Languages
  { source: 'programming-languages-arch', target: 'understand-basics-arch', type: SkillEdgeType.PREREQUISITE },
  { source: 'java-arch', target: 'programming-languages-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kotlin-arch', target: 'programming-languages-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'scala-arch', target: 'programming-languages-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'python-arch', target: 'programming-languages-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ruby-arch', target: 'programming-languages-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'go-arch', target: 'programming-languages-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'javascript-arch', target: 'programming-languages-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'typescript-arch', target: 'programming-languages-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dotnet-framework', target: 'programming-languages-arch', type: SkillEdgeType.SUBSKILL_OF },

  // Patterns & Design Principles
  { source: 'patterns-design-principles', target: 'software-architect', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mvc-arch', target: 'patterns-design-principles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mvp-arch', target: 'patterns-design-principles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mvvm-arch', target: 'patterns-design-principles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cqrs-arch', target: 'patterns-design-principles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'eventual-consistency', target: 'cqrs-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'oop-arch', target: 'patterns-design-principles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'actors-pattern', target: 'patterns-design-principles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'acid-theorem', target: 'patterns-design-principles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cap-theorem', target: 'patterns-design-principles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'solid-principles', target: 'patterns-design-principles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tdd-arch', target: 'patterns-design-principles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ddd-arch', target: 'patterns-design-principles', type: SkillEdgeType.SUBSKILL_OF },

  // Technical Skills
  { source: 'technical-skills', target: 'software-architect', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'design-and-architecture', target: 'technical-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'decision-making', target: 'technical-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'simplifying-things', target: 'technical-skills', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'how-to-code', target: 'technical-skills', type: SkillEdgeType.SUBSKILL_OF },

  // Important Skills to Learn
  { source: 'important-skills-to-learn', target: 'software-architect', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'documentation-skill', target: 'important-skills-to-learn', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'communication-arch', target: 'important-skills-to-learn', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'estimate-and-evaluate', target: 'important-skills-to-learn', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'balance-arch', target: 'important-skills-to-learn', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'consult-and-coach', target: 'important-skills-to-learn', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'marketing-skills', target: 'important-skills-to-learn', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hosting-algorithms', target: 'important-skills-to-learn', type: SkillEdgeType.SUBSKILL_OF },

  // Tools
  { source: 'tools-arch', target: 'software-architect', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'git-arch', target: 'tools-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'github-arch', target: 'tools-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'slack-arch', target: 'tools-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'trello-arch', target: 'tools-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'atlassian-tools', target: 'tools-arch', type: SkillEdgeType.SUBSKILL_OF },

  // Architecture Styles
  { source: 'architecture-styles', target: 'software-architect', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'microservices-arch', target: 'architecture-styles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'serverless-arch', target: 'architecture-styles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'client-server-arch', target: 'architecture-styles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'layered-arch', target: 'architecture-styles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'distributed-systems', target: 'architecture-styles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'service-oriented', target: 'architecture-styles', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'web-mobile-arch', target: 'architecture-styles', type: SkillEdgeType.SUBSKILL_OF },

  // Security
  { source: 'security-arch', target: 'software-architect', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pki-arch', target: 'security-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'owasp-arch', target: 'security-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'auth-strategies', target: 'security-arch', type: SkillEdgeType.SUBSKILL_OF },

  // Working with Data
  { source: 'working-with-data', target: 'software-architect', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hadoop-arch', target: 'working-with-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'spark-arch', target: 'working-with-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mapreduce-arch', target: 'working-with-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'etl-arch', target: 'working-with-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'datawarehouses', target: 'working-with-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sql-databases-arch', target: 'working-with-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nosql-databases-arch', target: 'working-with-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'analytics-arch', target: 'working-with-data', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'datawarehouse-principles', target: 'working-with-data', type: SkillEdgeType.SUBSKILL_OF },

  // Frameworks
  { source: 'frameworks-arch', target: 'software-architect', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'babok', target: 'frameworks-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'iaf-framework', target: 'frameworks-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'uml-arch', target: 'frameworks-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'togaf', target: 'frameworks-arch', type: SkillEdgeType.SUBSKILL_OF },

  // APIs & Integrations
  { source: 'apis-integrations', target: 'software-architect', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'grpc-arch', target: 'apis-integrations', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'esb-arch', target: 'apis-integrations', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'soap-arch', target: 'apis-integrations', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rest-arch', target: 'apis-integrations', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'graphql-arch', target: 'apis-integrations', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bpm-arch', target: 'apis-integrations', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bpel-arch', target: 'apis-integrations', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'messaging-queues-arch', target: 'apis-integrations', type: SkillEdgeType.SUBSKILL_OF },

  // Networks
  { source: 'networks-arch', target: 'software-architect', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'osi-model', target: 'networks-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tcpip-model', target: 'networks-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'http-https', target: 'networks-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'proxies-arch', target: 'networks-arch', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'firewalls', target: 'networks-arch', type: SkillEdgeType.SUBSKILL_OF },

  // Operations Knowledge
  { source: 'operations-knowledge', target: 'software-architect', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'infrastructure-as-code', target: 'operations-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cloud-providers-arch', target: 'operations-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'serverless-concepts', target: 'operations-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'linux-unix', target: 'operations-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'service-mesh', target: 'operations-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ci-cd-arch', target: 'operations-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'containers-arch', target: 'operations-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cloud-design-patterns', target: 'operations-knowledge', type: SkillEdgeType.SUBSKILL_OF },

  // Enterprise Software
  { source: 'enterprise-software', target: 'software-architect', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ms-dynamics', target: 'enterprise-software', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sap-erp', target: 'enterprise-software', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sap-hana', target: 'enterprise-software', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'business-objects', target: 'enterprise-software', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'emc-dms', target: 'enterprise-software', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ibm-bpm', target: 'enterprise-software', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'salesforce-arch', target: 'enterprise-software', type: SkillEdgeType.SUBSKILL_OF },
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
  console.log('Starting Software Architect roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'software-architect-design' },
    update: { name: 'Software Architect', description: 'Software Architect specialization' },
    create: {
      name: 'Software Architect',
      slug: 'software-architect-design',
      description: 'Software Architect specialization',
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
    where: { slug: 'software-architect' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'software-architect-design' },
    update: {
      name: 'Software Architect',
      description: 'Comprehensive Software Architect roadmap covering architecture fundamentals, design patterns, technical leadership, enterprise systems, distributed architecture, security, data systems, and cloud-native technologies',
      icon: '🏛️',
      color: '#8B5CF6',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'Software Architect',
      slug: 'software-architect-design',
      description: 'Comprehensive Software Architect roadmap covering architecture fundamentals, design patterns, technical leadership, enterprise systems, distributed architecture, security, data systems, and cloud-native technologies',
      icon: '🏛️',
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

  console.log('\n✓ Software Architect roadmap seeded successfully!');
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

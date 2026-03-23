/**
 * DevSecOps Roadmap Seed Script
 *
 * Seeds the DevSecOps development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/devsecops.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';
import { buildNodeResources } from './resources';

const prisma = new PrismaClient();

// DevSecOps Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'devsecops', name: 'DevSecOps', description: 'Complete DevSecOps roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 0 },

  // ==== INTRODUCTION ====
  { slug: 'devsecops-introduction', name: 'Introduction', description: 'Introduction to DevSecOps', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
  { slug: 'devsecops-vs-devops', name: 'DevSecOps vs DevOps', description: 'Difference between DevSecOps and DevOps', difficulty: Difficulty.BEGINNER, sortOrder: 2 },

  // ==== PROGRAMMING LANGUAGES ====
  { slug: 'programming-languages-devsecops', name: 'Learn a Programming Language', description: 'Programming language fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 3 },
  { slug: 'ruby-devsecops', name: 'Ruby', description: 'Ruby programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 4 },
  { slug: 'python-devsecops', name: 'Python', description: 'Python programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 5 },
  { slug: 'rust-devsecops', name: 'Rust', description: 'Rust programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },
  { slug: 'go-devsecops', name: 'Go', description: 'Go programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 7 },
  { slug: 'javascript-nodejs', name: 'JavaScript / Node.js', description: 'JavaScript and Node.js', difficulty: Difficulty.INTERMEDIATE, sortOrder: 8 },

  // ==== FOUNDATIONS ====
  { slug: 'learn-foundations', name: 'Learn the Foundations', description: 'Security foundations and concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 9 },
  { slug: 'cia-triad', name: 'CIA Triad', description: 'Confidentiality, Integrity, Availability', difficulty: Difficulty.BEGINNER, sortOrder: 10 },
  { slug: 'authentication', name: 'Authentication', description: 'User authentication methods', difficulty: Difficulty.INTERMEDIATE, sortOrder: 11 },
  { slug: 'authorization', name: 'Authorization', description: 'Access control and authorization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },
  { slug: 'owasp-top-10', name: 'OWASP Top 10', description: 'OWASP Top 10 vulnerabilities', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },
  { slug: 'encryption', name: 'Encryption', description: 'Encryption fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },

  // ==== ENCRYPTION TYPES ====
  { slug: 'symmetric-encryption', name: 'Symmetric', description: 'Symmetric encryption', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },
  { slug: 'asymmetric-encryption', name: 'Asymmetric', description: 'Asymmetric encryption', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },

  // ==== SCRIPTING KNOWLEDGE ====
  { slug: 'scripting-knowledge', name: 'Scripting Knowledge', description: 'Scripting fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },

  // ==== NETWORKING BASICS ====
  { slug: 'networking-basics', name: 'Networking Basics', description: 'Network fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'firewalls', name: 'Firewalls', description: 'Firewall concepts and configuration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'vlans', name: 'VLANs', description: 'Virtual LAN concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },
  { slug: 'acls', name: 'ACLs', description: 'Access Control Lists', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'network-segmentation', name: 'Network Segmentation', description: 'Network segmentation strategies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },
  { slug: 'dns', name: 'DNS', description: 'Domain Name System', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'http', name: 'HTTP', description: 'HyperText Transfer Protocol', difficulty: Difficulty.BEGINNER, sortOrder: 24 },
  { slug: 'tls', name: 'TLS', description: 'Transport Layer Security', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'siem', name: 'SIEM', description: 'Security Information and Event Management', difficulty: Difficulty.ADVANCED, sortOrder: 26 },
  { slug: 'alert-types', name: 'Alert Types', description: 'Security alert classification', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },
  { slug: 'log-analysis', name: 'Log Analysis', description: 'Security log analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },

  // ==== MONITORING ====
  { slug: 'monitoring-devsecops', name: 'Monitoring', description: 'Security monitoring', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'stride', name: 'STRIDE', description: 'STRIDE threat modeling methodology', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'pasta', name: 'PASTA', description: 'PASTA threat modeling methodology', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },
  { slug: 'threat-modeling-workflows', name: 'Threat Modeling Workflows', description: 'Threat modeling processes', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },
  { slug: 'attack-surface-mapping', name: 'Attack Surface Mapping', description: 'Identifying attack surfaces', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },

  // ==== THREAT MODELING ====
  { slug: 'threat-modeling', name: 'Threat Modeling', description: 'Threat modeling techniques', difficulty: Difficulty.ADVANCED, sortOrder: 34 },

  // ==== CLOUD SECURITY ====
  { slug: 'cloud-security', name: 'Cloud Security', description: 'Cloud security best practices', difficulty: Difficulty.ADVANCED, sortOrder: 35 },

  // ==== CONTAINER SECURITY ====
  { slug: 'container-security', name: 'Container Security', description: 'Container and orchestration security', difficulty: Difficulty.ADVANCED, sortOrder: 36 },
  { slug: 'docker', name: 'Docker', description: 'Docker container security', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },
  { slug: 'kubernetes', name: 'Kubernetes', description: 'Kubernetes security', difficulty: Difficulty.ADVANCED, sortOrder: 38 },
  { slug: 'image-scanning', name: 'Image Scanning', description: 'Container image vulnerability scanning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },

  // ==== DEVSECOPS TOOLS ====
  { slug: 'devsecops-tools', name: 'DevSecOps Tools', description: 'Security testing tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'burp-suite', name: 'Burp Suite', description: 'Web application security testing tool', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'nmap-basics', name: 'Nmap basics', description: 'Network scanning fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },
  { slug: 'wireshark-basics', name: 'Wireshark basics', description: 'Network packet analysis', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },

  // ==== SECURE CODING ====
  { slug: 'secure-coding', name: 'Secure Coding', description: 'Secure coding practices', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },

  // ==== VULNERABILITY SCANNING ====
  { slug: 'vulnerability-scanning-tools', name: 'Vulnerability Scanning Tools', description: 'Vulnerability scanning and assessment', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },
  { slug: 'nessus', name: 'Nessus', description: 'Nessus vulnerability scanner', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'nmap', name: 'Nmap', description: 'Nmap network mapping tool', difficulty: Difficulty.INTERMEDIATE, sortOrder: 47 },
  { slug: 'openvas', name: 'OpenVAS', description: 'OpenVAS vulnerability scanner', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  { slug: 'qualys', name: 'Qualys', description: 'Qualys security scanning platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },

  // ==== IDENTITY BASICS ====
  { slug: 'identity-basics', name: 'Identity Basics', description: 'Identity and access management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 50 },
  { slug: 'iam', name: 'IAM', description: 'Identity and Access Management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 51 },
  { slug: 'least-privilege', name: 'Least Privilege', description: 'Principle of least privilege', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'role-based-access', name: 'Role Based Access', description: 'Role-based access control', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },

  // ==== SECURE ARCHITECTURE ====
  { slug: 'secure-architecture', name: 'Secure Architecture', description: 'Secure system architecture design', difficulty: Difficulty.ADVANCED, sortOrder: 54 },
  { slug: 'defense-in-depth', name: 'Defense in Depth Concepts', description: 'Defense in depth strategy', difficulty: Difficulty.ADVANCED, sortOrder: 55 },
  { slug: 'zero-trust', name: 'Zero Trust Concepts', description: 'Zero trust security model', difficulty: Difficulty.ADVANCED, sortOrder: 56 },
  { slug: 'secure-api-design', name: 'Secure API Design', description: 'API security design principles', difficulty: Difficulty.ADVANCED, sortOrder: 57 },
  { slug: 'multi-region-security', name: 'Multi Region Security Planning', description: 'Multi-region security strategy', difficulty: Difficulty.ADVANCED, sortOrder: 58 },
  { slug: 'large-scale-identity', name: 'Large Scale Identity Strategy', description: 'Identity management at scale', difficulty: Difficulty.ADVANCED, sortOrder: 59 },
  { slug: 'ids', name: 'IDS', description: 'Intrusion Detection Systems', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },
  { slug: 'ips', name: 'IPS', description: 'Intrusion Prevention Systems', difficulty: Difficulty.INTERMEDIATE, sortOrder: 61 },
  { slug: 'ddos-mitigation', name: 'DDoS Mitigation Strategy', description: 'DDoS attack mitigation', difficulty: Difficulty.ADVANCED, sortOrder: 62 },
  { slug: 'network-zoning', name: 'Secure Network Zoning', description: 'Network security zoning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 63 },
  { slug: 'supply-chain-security', name: 'Supply Chain Security', description: 'Supply chain security management', difficulty: Difficulty.ADVANCED, sortOrder: 64 },
  { slug: 'sbom', name: 'SBOM', description: 'Software Bill of Materials', difficulty: Difficulty.INTERMEDIATE, sortOrder: 65 },
  { slug: 'build-pipeline-hardening', name: 'Build Pipeline Hardening', description: 'Securing CI/CD pipelines', difficulty: Difficulty.ADVANCED, sortOrder: 66 },
  { slug: 'dependency-risk', name: 'Dependency Risk Management', description: 'Managing dependency vulnerabilities', difficulty: Difficulty.INTERMEDIATE, sortOrder: 67 },

  // ==== INCIDENT RESPONSE ====
  { slug: 'incident-response', name: 'Incident Response', description: 'Security incident response', difficulty: Difficulty.ADVANCED, sortOrder: 68 },
  { slug: 'soar-concepts', name: 'SOAR Concepts', description: 'Security Orchestration, Automation and Response', difficulty: Difficulty.ADVANCED, sortOrder: 69 },
  { slug: 'automated-patching', name: 'Automated Patching', description: 'Automated vulnerability patching', difficulty: Difficulty.ADVANCED, sortOrder: 70 },
  { slug: 'automating-security', name: 'Automating Security', description: 'Security automation strategies', difficulty: Difficulty.ADVANCED, sortOrder: 71 },

  // ==== IR LIFECYCLE ====
  { slug: 'ir-lifecycle', name: 'IR Lifecycle', description: 'Incident response lifecycle', difficulty: Difficulty.ADVANCED, sortOrder: 72 },
  { slug: 'forensics', name: 'Forensics', description: 'Digital forensics and investigations', difficulty: Difficulty.ADVANCED, sortOrder: 73 },
  { slug: 'containment', name: 'Containment', description: 'Incident containment strategies', difficulty: Difficulty.ADVANCED, sortOrder: 74 },
  { slug: 'root-cause-analysis', name: 'Root Cause Analysis', description: 'RCA and post-incident analysis', difficulty: Difficulty.ADVANCED, sortOrder: 75 },

  // ==== EDR STRATEGY ====
  { slug: 'edr-strategy', name: 'EDR Strategy', description: 'Endpoint Detection and Response strategy', difficulty: Difficulty.ADVANCED, sortOrder: 76 },
  { slug: 'soar-automation', name: 'SOAR Automation', description: 'SOAR platform automation', difficulty: Difficulty.ADVANCED, sortOrder: 77 },
  { slug: 'endpoint-detection', name: 'Endpoint Detection', description: 'Endpoint threat detection', difficulty: Difficulty.ADVANCED, sortOrder: 78 },
  { slug: 'response-strategy', name: 'Response Strategy', description: 'Automated response strategies', difficulty: Difficulty.ADVANCED, sortOrder: 79 },

  // ==== ADVANCED CRYPTOGRAPHY ====
  { slug: 'sha-256', name: 'SHA 256', description: 'SHA-256 hashing algorithm', difficulty: Difficulty.INTERMEDIATE, sortOrder: 80 },
  { slug: 'bcrypt', name: 'Bcrypt', description: 'Bcrypt password hashing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 81 },
  { slug: 'cryptographic-hashing', name: 'Cryptographic Hashing', description: 'Cryptographic hash functions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 82 },
  { slug: 'pki-design', name: 'PKI Design and Failover', description: 'Public Key Infrastructure design', difficulty: Difficulty.ADVANCED, sortOrder: 83 },
  { slug: 'certificate-lifecycle', name: 'Certificate Lifecycle', description: 'SSL/TLS certificate management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 84 },
  { slug: 'advanced-crypto', name: 'Advanced Crypto', description: 'Advanced cryptography concepts', difficulty: Difficulty.ADVANCED, sortOrder: 85 },

  // ==== ENTERPRISE OPERATIONS ====
  { slug: 'enterprise-operations', name: 'Enterprise Operations', description: 'Enterprise security operations', difficulty: Difficulty.ADVANCED, sortOrder: 86 },

  // ==== GOVERNANCE ====
  { slug: 'governance', name: 'Governance', description: 'Security governance and compliance', difficulty: Difficulty.ADVANCED, sortOrder: 87 },
  { slug: 'soc-2', name: 'SOC 2', description: 'SOC 2 compliance standards', difficulty: Difficulty.INTERMEDIATE, sortOrder: 88 },
  { slug: 'iso-27001', name: 'ISO 27001', description: 'ISO 27001 information security standard', difficulty: Difficulty.INTERMEDIATE, sortOrder: 89 },
  { slug: 'nist', name: 'NIST', description: 'NIST cybersecurity framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 90 },
  { slug: 'cybersecurity-frameworks', name: 'Cybersecurity Frameworks', description: 'Various cybersecurity frameworks', difficulty: Difficulty.INTERMEDIATE, sortOrder: 91 },

  // ==== KEEP LEARNING ====
  { slug: 'keep-learning-devsecops', name: 'Keep Learning', description: 'Continuous learning in DevSecOps', difficulty: Difficulty.BEGINNER, sortOrder: 92 },
];

const ROADMAP_EDGES_DATA = [
  // Introduction
  { source: 'devsecops-introduction', target: 'devsecops', type: SkillEdgeType.PREREQUISITE },
  { source: 'devsecops-vs-devops', target: 'devsecops-introduction', type: SkillEdgeType.SUBSKILL_OF },

  // Programming Languages
  { source: 'programming-languages-devsecops', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ruby-devsecops', target: 'programming-languages-devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'python-devsecops', target: 'programming-languages-devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rust-devsecops', target: 'programming-languages-devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'go-devsecops', target: 'programming-languages-devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'javascript-nodejs', target: 'programming-languages-devsecops', type: SkillEdgeType.SUBSKILL_OF },

  // Foundations
  { source: 'learn-foundations', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cia-triad', target: 'learn-foundations', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'authentication', target: 'learn-foundations', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'authorization', target: 'learn-foundations', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'owasp-top-10', target: 'learn-foundations', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'encryption', target: 'learn-foundations', type: SkillEdgeType.SUBSKILL_OF },

  // Encryption Types
  { source: 'symmetric-encryption', target: 'encryption', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'asymmetric-encryption', target: 'encryption', type: SkillEdgeType.SUBSKILL_OF },

  // Scripting Knowledge
  { source: 'scripting-knowledge', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },

  // Networking Basics
  { source: 'networking-basics', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'firewalls', target: 'networking-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vlans', target: 'networking-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'acls', target: 'networking-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'network-segmentation', target: 'networking-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dns', target: 'networking-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'http', target: 'networking-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tls', target: 'networking-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'siem', target: 'networking-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'alert-types', target: 'networking-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'log-analysis', target: 'networking-basics', type: SkillEdgeType.SUBSKILL_OF },

  // Monitoring
  { source: 'monitoring-devsecops', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'stride', target: 'monitoring-devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pasta', target: 'monitoring-devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'threat-modeling-workflows', target: 'monitoring-devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'attack-surface-mapping', target: 'monitoring-devsecops', type: SkillEdgeType.SUBSKILL_OF },

  // Threat Modeling
  { source: 'threat-modeling', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'threat-modeling', target: 'monitoring-devsecops', type: SkillEdgeType.BUILDS_ON },

  // Cloud Security
  { source: 'cloud-security', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },

  // Container Security
  { source: 'container-security', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'docker', target: 'container-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kubernetes', target: 'container-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'image-scanning', target: 'container-security', type: SkillEdgeType.SUBSKILL_OF },

  // DevSecOps Tools
  { source: 'devsecops-tools', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'burp-suite', target: 'devsecops-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nmap-basics', target: 'devsecops-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'wireshark-basics', target: 'devsecops-tools', type: SkillEdgeType.SUBSKILL_OF },

  // Secure Coding
  { source: 'secure-coding', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'secure-coding', target: 'learn-foundations', type: SkillEdgeType.BUILDS_ON },

  // Vulnerability Scanning
  { source: 'vulnerability-scanning-tools', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nessus', target: 'vulnerability-scanning-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nmap', target: 'vulnerability-scanning-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'openvas', target: 'vulnerability-scanning-tools', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'qualys', target: 'vulnerability-scanning-tools', type: SkillEdgeType.SUBSKILL_OF },

  // Identity Basics
  { source: 'identity-basics', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'iam', target: 'identity-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'least-privilege', target: 'identity-basics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'role-based-access', target: 'identity-basics', type: SkillEdgeType.SUBSKILL_OF },

  // Secure Architecture
  { source: 'secure-architecture', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'defense-in-depth', target: 'secure-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'zero-trust', target: 'secure-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'secure-api-design', target: 'secure-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'multi-region-security', target: 'secure-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'large-scale-identity', target: 'secure-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ids', target: 'secure-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ips', target: 'secure-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ddos-mitigation', target: 'secure-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'network-zoning', target: 'secure-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'supply-chain-security', target: 'secure-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sbom', target: 'supply-chain-security', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'build-pipeline-hardening', target: 'secure-architecture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dependency-risk', target: 'secure-architecture', type: SkillEdgeType.SUBSKILL_OF },

  // Incident Response
  { source: 'incident-response', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'soar-concepts', target: 'incident-response', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'automated-patching', target: 'incident-response', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'automating-security', target: 'incident-response', type: SkillEdgeType.SUBSKILL_OF },

  // IR Lifecycle
  { source: 'ir-lifecycle', target: 'incident-response', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'forensics', target: 'ir-lifecycle', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'containment', target: 'ir-lifecycle', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'root-cause-analysis', target: 'ir-lifecycle', type: SkillEdgeType.SUBSKILL_OF },

  // EDR Strategy
  { source: 'edr-strategy', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'soar-automation', target: 'edr-strategy', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'endpoint-detection', target: 'edr-strategy', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'response-strategy', target: 'edr-strategy', type: SkillEdgeType.SUBSKILL_OF },

  // Advanced Cryptography
  { source: 'sha-256', target: 'encryption', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bcrypt', target: 'encryption', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cryptographic-hashing', target: 'encryption', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pki-design', target: 'encryption', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'certificate-lifecycle', target: 'encryption', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'advanced-crypto', target: 'encryption', type: SkillEdgeType.SUBSKILL_OF },

  // Enterprise Operations
  { source: 'enterprise-operations', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },

  // Governance
  { source: 'governance', target: 'enterprise-operations', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'soc-2', target: 'governance', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'iso-27001', target: 'governance', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nist', target: 'governance', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cybersecurity-frameworks', target: 'governance', type: SkillEdgeType.SUBSKILL_OF },

  // Keep Learning
  { source: 'keep-learning-devsecops', target: 'devsecops', type: SkillEdgeType.SUBSKILL_OF },
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
  resources: buildNodeResources(node.name, node.slug, { sortOrder: node.sortOrder, nodeType: (node as any).type }),
})) as RoadmapNode[];

async function main() {
  console.log('Starting DevSecOps roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'devsecops' },
    update: { name: 'DevSecOps', description: 'DevSecOps specialization' },
    create: {
      name: 'DevSecOps',
      slug: 'devsecops',
      description: 'DevSecOps specialization',
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
    where: { slug: 'devsecops' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'devsecops' },
    update: {
      name: 'DevSecOps',
      description: 'Comprehensive DevSecOps roadmap covering security foundations, networking, threat modeling, secure coding, container security, incident response, compliance, and security automation',
      icon: '🔐',
      color: '#8B5CF6',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'DevSecOps',
      slug: 'devsecops',
      description: 'Comprehensive DevSecOps roadmap covering security foundations, networking, threat modeling, secure coding, container security, incident response, compliance, and security automation',
      icon: '🔐',
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

  console.log('\n✓ DevSecOps roadmap seeded successfully!');
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


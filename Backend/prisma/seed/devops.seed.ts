/**
 * DevOps Roadmap Seed Script
 *
 * Seeds the DevOps development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/devops.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// DevOps Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'devops', name: 'DevOps', description: 'Complete DevOps roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 0 },

  // ==== LEARN A PROGRAMMING LANGUAGE ====
  { slug: 'learn-programming-language-devops', name: 'Learn a Programming Language', description: 'Programming for DevOps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 1 },
  { slug: 'python-devops', name: 'Python', description: 'Python for automation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 2 },
  { slug: 'ruby-devops', name: 'Ruby', description: 'Ruby programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 3 },
  { slug: 'go-devops', name: 'Go', description: 'Go programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 4 },
  { slug: 'rust-devops', name: 'Rust', description: 'Rust programming', difficulty: Difficulty.ADVANCED, sortOrder: 5 },
  { slug: 'javascript-nodejs', name: 'JavaScript / Node.js', description: 'JavaScript for DevOps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },

  // ==== OPERATING SYSTEM ====
  { slug: 'operating-system', name: 'Operating System', description: 'OS fundamentals for DevOps', difficulty: Difficulty.BEGINNER, sortOrder: 7 },
  { slug: 'windows-os', name: 'Windows', description: 'Windows operating system', difficulty: Difficulty.BEGINNER, sortOrder: 8 },
  { slug: 'unix-variants', name: 'Unix Variants', description: 'Unix operating system basics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 9 },
  { slug: 'freebsd', name: 'FreeBSD', description: 'FreeBSD operating system', difficulty: Difficulty.INTERMEDIATE, sortOrder: 10 },
  { slug: 'ubuntu-debian', name: 'Ubuntu / Debian', description: 'Debian-based Linux distributions', difficulty: Difficulty.BEGINNER, sortOrder: 11 },
  { slug: 'suse-linux', name: 'SUSE Linux', description: 'SUSE Linux Enterprise', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },
  { slug: 'rhel-derivatives', name: 'RHEL / Derivatives', description: 'Red Hat Enterprise Linux', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },

  // ==== TERMINAL KNOWLEDGE ====
  { slug: 'terminal-knowledge', name: 'Terminal Knowledge', description: 'Command line and terminal skills', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },
  { slug: 'bash-shell', name: 'Bash', description: 'Bash scripting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },
  { slug: 'powershell-shell', name: 'PowerShell', description: 'PowerShell scripting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'vim-nano-emacs', name: 'Vim / Nano / Emacs', description: 'Text editors', difficulty: Difficulty.BEGINNER, sortOrder: 17 },

  // ==== VERSION CONTROL SYSTEMS ====
  { slug: 'version-control-systems', name: 'Version Control Systems', description: 'VCS for code management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'git-vcs', name: 'Git', description: 'Git version control', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'github-hosting', name: 'GitHub', description: 'GitHub platform', difficulty: Difficulty.BEGINNER, sortOrder: 20 },
  { slug: 'gitlab-hosting', name: 'GitLab', description: 'GitLab platform', difficulty: Difficulty.BEGINNER, sortOrder: 21 },
  { slug: 'bitbucket-hosting', name: 'Bitbucket', description: 'Bitbucket platform', difficulty: Difficulty.BEGINNER, sortOrder: 22 },

  // ==== NETWORKING & PROTOCOLS ====
  { slug: 'networking-protocols', name: 'Networking & Protocols', description: 'networking basics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'ftp-sftp', name: 'FTP / SFTP', description: 'File transfer protocols', difficulty: Difficulty.BEGINNER, sortOrder: 24 },
  { slug: 'dns-protocol', name: 'DNS', description: 'Domain Name System', difficulty: Difficulty.BEGINNER, sortOrder: 25 },
  { slug: 'http-https', name: 'HTTP / HTTPS', description: 'Web protocols', difficulty: Difficulty.BEGINNER, sortOrder: 26 },
  { slug: 'ssl-tls', name: 'SSL / TLS', description: 'Secure communication protocols', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },
  { slug: 'osi-model', name: 'OSI Model', description: 'Open Systems Interconnection model', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },
  { slug: 'smtp-protocol', name: 'SMTP', description: 'Simple Mail Transfer Protocol', difficulty: Difficulty.BEGINNER, sortOrder: 29 },
  { slug: 'dmarc-protocol', name: 'DMARC', description: 'Domain-based Message Authentication', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'spf-protocol', name: 'SPF', description: 'Sender Policy Framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },
  { slug: 'dkim-protocol', name: 'DKIM', description: 'DomainKeys Identified Mail', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },
  { slug: 'pop3-protocol', name: 'POP3', description: 'Post Office Protocol 3', difficulty: Difficulty.BEGINNER, sortOrder: 33 },
  { slug: 'domain-keys', name: 'Domain Keys', description: 'Domain key protocols', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },
  { slug: 'email-protocols', name: 'Email Protocols', description: 'Email communication protocols', difficulty: Difficulty.BEGINNER, sortOrder: 35 },
  { slug: 'white-grey-listing', name: 'White / Grey Listing', description: 'Email filtering techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },

  // ==== CLOUD PROVIDERS ====
  { slug: 'cloud-providers', name: 'Cloud Providers', description: 'Cloud infrastructure platforms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },
  { slug: 'aws-cloud-devops', name: 'AWS', description: 'Amazon Web Services', difficulty: Difficulty.INTERMEDIATE, sortOrder: 38 },
  { slug: 'azure-cloud-devops', name: 'Azure', description: 'Microsoft Azure', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'google-cloud-devops', name: 'Google Cloud', description: 'Google Cloud Platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'digital-ocean', name: 'Digital Ocean', description: 'DigitalOcean cloud platform', difficulty: Difficulty.BEGINNER, sortOrder: 41 },
  { slug: 'alibaba-cloud', name: 'Alibaba Cloud', description: 'Alibaba Cloud services', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },
  { slug: 'hetzner-cloud', name: 'Hetzner', description: 'Hetzner Cloud services', difficulty: Difficulty.BEGINNER, sortOrder: 43 },
  { slug: 'heroku-platform', name: 'Heroku', description: 'Heroku platform as a service', difficulty: Difficulty.BEGINNER, sortOrder: 44 },

  // ==== SERVERLESS ====
  { slug: 'serverless', name: 'Serverless', description: 'Serverless computing', difficulty: Difficulty.ADVANCED, sortOrder: 45 },
  { slug: 'aws-lambda', name: 'AWS Lambda', description: 'AWS Lambda serverless functions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'cloudflare-workers', name: 'Cloudflare', description: 'Cloudflare Workers', difficulty: Difficulty.INTERMEDIATE, sortOrder: 47 },
  { slug: 'azure-functions', name: 'Azure Functions', description: 'Azure serverless functions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  { slug: 'vercel-platform', name: 'Vercel', description: 'Vercel deployment platform', difficulty: Difficulty.BEGINNER, sortOrder: 49 },
  { slug: 'netlify-platform', name: 'Netlify', description: 'Netlify deployment platform', difficulty: Difficulty.BEGINNER, sortOrder: 50 },
  { slug: 'gcp-functions', name: 'GCP Functions', description: 'Google Cloud Functions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 51 },

  // ==== CONTAINERS ====
  { slug: 'containers', name: 'Containers', description: 'Container technologies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'docker-container', name: 'Docker', description: 'Docker containerization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },
  { slug: 'lxc-container', name: 'LXC', description: 'Linux Containers', difficulty: Difficulty.INTERMEDIATE, sortOrder: 54 },

  // ==== SCRIPTING ====
  { slug: 'scripting-devops', name: 'Scripting', description: 'Shell scripting and automation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 55 },
  { slug: 'process-monitoring', name: 'Process Monitoring', description: 'Monitoring system processes', difficulty: Difficulty.INTERMEDIATE, sortOrder: 56 },
  { slug: 'performance-monitoring', name: 'Performance Monitoring', description: 'Monitoring system performance', difficulty: Difficulty.INTERMEDIATE, sortOrder: 57 },
  { slug: 'networking-tools', name: 'Networking Tools', description: 'Network debugging tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 58 },
  { slug: 'text-manipulation', name: 'Text Manipulation', description: 'Text processing tools', difficulty: Difficulty.BEGINNER, sortOrder: 59 },
  { slug: 'forward-proxy', name: 'Forward Proxy', description: 'Forward proxy systems', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },
  { slug: 'reverse-proxy', name: 'Reverse Proxy', description: 'Reverse proxy systems', difficulty: Difficulty.INTERMEDIATE, sortOrder: 61 },
  { slug: 'caching-server', name: 'Caching Server', description: 'Cache management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 62 },
  { slug: 'load-balancer', name: 'Load Balancer', description: 'Load balancing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 63 },

  // ==== WEB SERVERS ====
  { slug: 'web-servers', name: 'Web Servers', description: 'Web server technologies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 64 },
  { slug: 'nginx-server', name: 'Nginx', description: 'Nginx web server', difficulty: Difficulty.INTERMEDIATE, sortOrder: 65 },
  { slug: 'caddy-server', name: 'Caddy', description: 'Caddy web server', difficulty: Difficulty.BEGINNER, sortOrder: 66 },
  { slug: 'tomcat-server', name: 'Tomcat', description: 'Apache Tomcat', difficulty: Difficulty.INTERMEDIATE, sortOrder: 67 },
  { slug: 'apache-httpd', name: 'Apache', description: 'Apache HTTP Server', difficulty: Difficulty.INTERMEDIATE, sortOrder: 68 },
  { slug: 'iis-server', name: 'IIS', description: 'Internet Information Services', difficulty: Difficulty.INTERMEDIATE, sortOrder: 69 },

  // ==== INFRASTRUCTURE AS CODE / CONFIG MANAGEMENT ====
  { slug: 'iac-config-management', name: 'Infrastructure as Code / Configuration Management', description: 'IaC and configuration tools', difficulty: Difficulty.ADVANCED, sortOrder: 70 },
  { slug: 'ansible-tool', name: 'Ansible', description: 'Ansible configuration management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 71 },
  { slug: 'chef-tool', name: 'Chef', description: 'Chef infrastructure automation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 72 },
  { slug: 'puppet-tool', name: 'Puppet', description: 'Puppet configuration management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 73 },
  { slug: 'terraform-tool', name: 'Terraform', description: 'Terraform IaC tool', difficulty: Difficulty.ADVANCED, sortOrder: 74 },
  { slug: 'aws-cdk', name: 'AWS CDK', description: 'AWS Cloud Development Kit', difficulty: Difficulty.INTERMEDIATE, sortOrder: 75 },
  { slug: 'cloudformation-tool', name: 'CloudFormation', description: 'AWS CloudFormation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 76 },
  { slug: 'pulumi-tool', name: 'Pulumi', description: 'Pulumi infrastructure as code', difficulty: Difficulty.INTERMEDIATE, sortOrder: 77 },

  // ==== CONTAINER ORCHESTRATION ====
  { slug: 'container-orchestration', name: 'Container Orchestration', description: 'Orchestrating containers', difficulty: Difficulty.ADVANCED, sortOrder: 78 },
  { slug: 'kubernetes-orch', name: 'Kubernetes', description: 'Kubernetes orchestration', difficulty: Difficulty.ADVANCED, sortOrder: 79 },
  { slug: 'docker-swarm', name: 'Docker Swarm', description: 'Docker native orchestration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 80 },
  { slug: 'eks-ecs-aks', name: 'EKS / ECS / AKS', description: 'Cloud-managed Kubernetes', difficulty: Difficulty.ADVANCED, sortOrder: 81 },
  { slug: 'aws-ecs-fargate', name: 'AWS ECS / Fargate', description: 'AWS container services', difficulty: Difficulty.INTERMEDIATE, sortOrder: 82 },
  { slug: 'docker-swarm-adv', name: 'Docker Swarm', description: 'Advanced Docker Swarm', difficulty: Difficulty.ADVANCED, sortOrder: 83 },
  { slug: 'kubernetes-adv', name: 'Kubernetes', description: 'Advanced Kubernetes', difficulty: Difficulty.ADVANCED, sortOrder: 84 },

  // ==== LOGGING & MONITORING ====
  { slug: 'logging-management', name: 'Logs Management', description: 'Log aggregation and analysis', difficulty: Difficulty.ADVANCED, sortOrder: 85 },
  { slug: 'papertrail-logs', name: 'Papertrail', description: 'Papertrail log management', difficulty: Difficulty.BEGINNER, sortOrder: 86 },
  { slug: 'splunk-logs', name: 'Splunk', description: 'Splunk log analysis', difficulty: Difficulty.ADVANCED, sortOrder: 87 },
  { slug: 'loki-logs', name: 'Loki', description: 'Grafana Loki logs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 88 },
  { slug: 'elastic-stack', name: 'Elastic Stack', description: 'Elasticsearch, Kibana, Beats', difficulty: Difficulty.ADVANCED, sortOrder: 89 },
  { slug: 'prometheus-monitoring', name: 'Prometheus', description: 'Prometheus monitoring', difficulty: Difficulty.INTERMEDIATE, sortOrder: 90 },
  { slug: 'onfiona-monitoring', name: 'Onfiona', description: 'Monitoring and alerting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 91 },
  { slug: 'datadog-monitoring', name: 'Datadog', description: 'Datadog monitoring platform', difficulty: Difficulty.ADVANCED, sortOrder: 92 },
  { slug: 'zabbix-monitoring', name: 'Zabbix', description: 'Zabbix monitoring', difficulty: Difficulty.INTERMEDIATE, sortOrder: 93 },

  // ==== CLOUD DESIGN PATTERNS ====
  { slug: 'cloud-design-patterns', name: 'Cloud Design Patterns', description: 'Architectural patterns for cloud', difficulty: Difficulty.ADVANCED, sortOrder: 94 },
  { slug: 'availability-patterns', name: 'Availability', description: 'High availability patterns', difficulty: Difficulty.ADVANCED, sortOrder: 95 },
  { slug: 'data-management-patterns', name: 'Data Management', description: 'Data management patterns', difficulty: Difficulty.ADVANCED, sortOrder: 96 },
  { slug: 'design-implementation', name: 'Design and Implementation', description: 'Design patterns and practices', difficulty: Difficulty.ADVANCED, sortOrder: 97 },
  { slug: 'management-monitoring-patterns', name: 'Management and Monitoring', description: 'Management patterns', difficulty: Difficulty.ADVANCED, sortOrder: 98 },

  // ==== INFRASTRUCTURE MONITORING ====
  { slug: 'infrastructure-monitoring', name: 'Infrastructure Monitoring', description: 'Monitoring infrastructure', difficulty: Difficulty.ADVANCED, sortOrder: 99 },
  { slug: 'teamcity-ci', name: 'TeamCity', description: 'JetBrains TeamCity CI', difficulty: Difficulty.INTERMEDIATE, sortOrder: 100 },
  { slug: 'jenkins-ci', name: 'Jenkins', description: 'Jenkins CI/CD server', difficulty: Difficulty.INTERMEDIATE, sortOrder: 101 },
  { slug: 'github-actions-ci', name: 'GitHub Actions', description: 'GitHub CI/CD Actions', difficulty: Difficulty.BEGINNER, sortOrder: 102 },
  { slug: 'gitlab-ci', name: 'GitLab CI', description: 'GitLab CI/CD', difficulty: Difficulty.INTERMEDIATE, sortOrder: 103 },
  { slug: 'circle-ci', name: 'CircleCI', description: 'CircleCI platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 104 },
  { slug: 'travis-ci', name: 'Travis CI', description: 'Travis CI platform', difficulty: Difficulty.BEGINNER, sortOrder: 105 },

  // ==== APPLICATION MONITORING ====
  { slug: 'application-monitoring', name: 'Application Monitoring', description: 'Monitoring applications', difficulty: Difficulty.ADVANCED, sortOrder: 106 },
  { slug: 'jaeger-monitoring', name: 'Jaeger', description: 'Jaeger distributed tracing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 107 },
  { slug: 'new-relic-monitoring', name: 'New Relic', description: 'New Relic monitoring', difficulty: Difficulty.INTERMEDIATE, sortOrder: 108 },
  { slug: 'datadog-apm', name: 'Datadog APM', description: 'Datadog Application Performance', difficulty: Difficulty.ADVANCED, sortOrder: 109 },
  { slug: 'prometheus-adv', name: 'Prometheus', description: 'Advanced Prometheus', difficulty: Difficulty.ADVANCED, sortOrder: 110 },
  { slug: 'opentelemetry', name: 'OpenTelemetry', description: 'OpenTelemetry observability', difficulty: Difficulty.ADVANCED, sortOrder: 111 },

  // ==== SECRET MANAGEMENT ====
  { slug: 'secret-management', name: 'Secret Management', description: 'Managing secrets and credentials', difficulty: Difficulty.ADVANCED, sortOrder: 112 },
  { slug: 'vault-secrets', name: 'Vault', description: 'HashiCorp Vault', difficulty: Difficulty.ADVANCED, sortOrder: 113 },
  { slug: 'soups-secrets', name: 'SOPs', description: 'Sealed Secrets', difficulty: Difficulty.INTERMEDIATE, sortOrder: 114 },
  { slug: 'cloud-specific-tools', name: 'Cloud Specific Tools', description: 'Cloud provider secret tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 115 },

  // ==== GITOPS ====
  { slug: 'gitops', name: 'GitOps', description: 'GitOps principles and tools', difficulty: Difficulty.ADVANCED, sortOrder: 116 },
  { slug: 'argocd-gitops', name: 'ArgoCD', description: 'ArgoCD GitOps', difficulty: Difficulty.ADVANCED, sortOrder: 117 },
  { slug: 'fluxcd-gitops', name: 'FluxCD', description: 'FluxCD GitOps', difficulty: Difficulty.ADVANCED, sortOrder: 118 },

  // ==== SERVICE MESH ====
  { slug: 'service-mesh', name: 'Service Mesh', description: 'Service mesh architectures', difficulty: Difficulty.ADVANCED, sortOrder: 119 },
  { slug: 'istio-mesh', name: 'Istio', description: 'Istio service mesh', difficulty: Difficulty.ADVANCED, sortOrder: 120 },
  { slug: 'linkerd-mesh', name: 'Linkerd', description: 'Linkerd service mesh', difficulty: Difficulty.ADVANCED, sortOrder: 121 },
  { slug: 'envoy-mesh', name: 'Envoy', description: 'Envoy proxy', difficulty: Difficulty.ADVANCED, sortOrder: 122 },

  // ==== CI/CD TOOLS ====
  { slug: 'cicd-tools', name: 'CI / CD Tools', description: 'Continuous integration and deployment', difficulty: Difficulty.ADVANCED, sortOrder: 123 },
  { slug: 'provisioning', name: 'Provisioning', description: 'Infrastructure provisioning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 124 },

  // ==== ARTIFACT MANAGEMENT ====
  { slug: 'artifact-management', name: 'Artifact Management', description: 'Managing build artifacts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 125 },
  { slug: 'nexus-artifacts', name: 'Nexus', description: 'Sonatype Nexus repository', difficulty: Difficulty.INTERMEDIATE, sortOrder: 126 },
  { slug: 'argocd-artifacts', name: 'ArgoCD', description: 'ArgoCD artifact management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 127 },
];

const ROADMAP_EDGES_DATA = [
  // Programming Languages
  { source: 'learn-programming-language-devops', target: 'devops', type: SkillEdgeType.PREREQUISITE },
  { source: 'python-devops', target: 'learn-programming-language-devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ruby-devops', target: 'learn-programming-language-devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'go-devops', target: 'learn-programming-language-devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rust-devops', target: 'learn-programming-language-devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'javascript-nodejs', target: 'learn-programming-language-devops', type: SkillEdgeType.SUBSKILL_OF },

  // Operating System
  { source: 'operating-system', target: 'devops', type: SkillEdgeType.PREREQUISITE },
  { source: 'windows-os', target: 'operating-system', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'unix-variants', target: 'operating-system', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'freebsd', target: 'unix-variants', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ubuntu-debian', target: 'unix-variants', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'suse-linux', target: 'unix-variants', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rhel-derivatives', target: 'unix-variants', type: SkillEdgeType.SUBSKILL_OF },

  // Terminal Knowledge
  { source: 'terminal-knowledge', target: 'devops', type: SkillEdgeType.PREREQUISITE },
  { source: 'bash-shell', target: 'terminal-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'powershell-shell', target: 'terminal-knowledge', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vim-nano-emacs', target: 'terminal-knowledge', type: SkillEdgeType.SUBSKILL_OF },

  // Version Control
  { source: 'version-control-systems', target: 'devops', type: SkillEdgeType.PREREQUISITE },
  { source: 'git-vcs', target: 'version-control-systems', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'github-hosting', target: 'version-control-systems', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gitlab-hosting', target: 'version-control-systems', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bitbucket-hosting', target: 'version-control-systems', type: SkillEdgeType.SUBSKILL_OF },

  // Networking & Protocols
  { source: 'networking-protocols', target: 'devops', type: SkillEdgeType.PREREQUISITE },
  { source: 'ftp-sftp', target: 'networking-protocols', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dns-protocol', target: 'networking-protocols', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'http-https', target: 'networking-protocols', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ssl-tls', target: 'networking-protocols', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'osi-model', target: 'networking-protocols', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'smtp-protocol', target: 'networking-protocols', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dmarc-protocol', target: 'smtp-protocol', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'spf-protocol', target: 'smtp-protocol', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dkim-protocol', target: 'smtp-protocol', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pop3-protocol', target: 'networking-protocols', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'domain-keys', target: 'networking-protocols', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'email-protocols', target: 'networking-protocols', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'white-grey-listing', target: 'networking-protocols', type: SkillEdgeType.SUBSKILL_OF },

  // Cloud Providers
  { source: 'cloud-providers', target: 'devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'aws-cloud-devops', target: 'cloud-providers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'azure-cloud-devops', target: 'cloud-providers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'google-cloud-devops', target: 'cloud-providers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'digital-ocean', target: 'cloud-providers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'alibaba-cloud', target: 'cloud-providers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hetzner-cloud', target: 'cloud-providers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'heroku-platform', target: 'cloud-providers', type: SkillEdgeType.SUBSKILL_OF },

  // Serverless
  { source: 'serverless', target: 'devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'aws-lambda', target: 'serverless', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cloudflare-workers', target: 'serverless', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'azure-functions', target: 'serverless', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vercel-platform', target: 'serverless', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'netlify-platform', target: 'serverless', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gcp-functions', target: 'serverless', type: SkillEdgeType.SUBSKILL_OF },

  // Containers
  { source: 'containers', target: 'devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'docker-container', target: 'containers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'lxc-container', target: 'containers', type: SkillEdgeType.SUBSKILL_OF },

  // Scripting
  { source: 'scripting-devops', target: 'devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'process-monitoring', target: 'scripting-devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'performance-monitoring', target: 'scripting-devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'networking-tools', target: 'scripting-devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'text-manipulation', target: 'scripting-devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'forward-proxy', target: 'scripting-devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'reverse-proxy', target: 'scripting-devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'caching-server', target: 'scripting-devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'load-balancer', target: 'scripting-devops', type: SkillEdgeType.SUBSKILL_OF },

  // Web Servers
  { source: 'web-servers', target: 'devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nginx-server', target: 'web-servers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'caddy-server', target: 'web-servers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tomcat-server', target: 'web-servers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'apache-httpd', target: 'web-servers', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'iis-server', target: 'web-servers', type: SkillEdgeType.SUBSKILL_OF },

  // Infrastructure as Code
  { source: 'iac-config-management', target: 'devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ansible-tool', target: 'iac-config-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'chef-tool', target: 'iac-config-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'puppet-tool', target: 'iac-config-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'terraform-tool', target: 'iac-config-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'aws-cdk', target: 'iac-config-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cloudformation-tool', target: 'iac-config-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pulumi-tool', target: 'iac-config-management', type: SkillEdgeType.SUBSKILL_OF },

  // Container Orchestration
  { source: 'container-orchestration', target: 'devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kubernetes-orch', target: 'container-orchestration', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'docker-swarm', target: 'container-orchestration', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'eks-ecs-aks', target: 'container-orchestration', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'aws-ecs-fargate', target: 'container-orchestration', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'docker-swarm-adv', target: 'container-orchestration', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kubernetes-adv', target: 'container-orchestration', type: SkillEdgeType.SUBSKILL_OF },

  // Logging
  { source: 'logging-management', target: 'devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'papertrail-logs', target: 'logging-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'splunk-logs', target: 'logging-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'loki-logs', target: 'logging-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'elastic-stack', target: 'logging-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'prometheus-monitoring', target: 'logging-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'onfiona-monitoring', target: 'logging-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'datadog-monitoring', target: 'logging-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'zabbix-monitoring', target: 'logging-management', type: SkillEdgeType.SUBSKILL_OF },

  // Cloud Design Patterns
  { source: 'cloud-design-patterns', target: 'devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'availability-patterns', target: 'cloud-design-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-management-patterns', target: 'cloud-design-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'design-implementation', target: 'cloud-design-patterns', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'management-monitoring-patterns', target: 'cloud-design-patterns', type: SkillEdgeType.SUBSKILL_OF },

  // Infrastructure Monitoring
  { source: 'infrastructure-monitoring', target: 'devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'teamcity-ci', target: 'infrastructure-monitoring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'jenkins-ci', target: 'infrastructure-monitoring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'github-actions-ci', target: 'infrastructure-monitoring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gitlab-ci', target: 'infrastructure-monitoring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'circle-ci', target: 'infrastructure-monitoring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'travis-ci', target: 'infrastructure-monitoring', type: SkillEdgeType.SUBSKILL_OF },

  // Application Monitoring
  { source: 'application-monitoring', target: 'devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'jaeger-monitoring', target: 'application-monitoring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'new-relic-monitoring', target: 'application-monitoring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'datadog-apm', target: 'application-monitoring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'prometheus-adv', target: 'application-monitoring', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'opentelemetry', target: 'application-monitoring', type: SkillEdgeType.SUBSKILL_OF },

  // Secret Management
  { source: 'secret-management', target: 'devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vault-secrets', target: 'secret-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'soups-secrets', target: 'secret-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cloud-specific-tools', target: 'secret-management', type: SkillEdgeType.SUBSKILL_OF },

  // GitOps
  { source: 'gitops', target: 'devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'argocd-gitops', target: 'gitops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fluxcd-gitops', target: 'gitops', type: SkillEdgeType.SUBSKILL_OF },

  // Service Mesh
  { source: 'service-mesh', target: 'devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'istio-mesh', target: 'service-mesh', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'linkerd-mesh', target: 'service-mesh', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'envoy-mesh', target: 'service-mesh', type: SkillEdgeType.SUBSKILL_OF },

  // CI/CD Tools
  { source: 'cicd-tools', target: 'devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'provisioning', target: 'cicd-tools', type: SkillEdgeType.SUBSKILL_OF },

  // Artifact Management
  { source: 'artifact-management', target: 'devops', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nexus-artifacts', target: 'artifact-management', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'argocd-artifacts', target: 'artifact-management', type: SkillEdgeType.SUBSKILL_OF },
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
  console.log('Starting DevOps roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'devops' },
    update: { name: 'DevOps', description: 'DevOps specialization' },
    create: {
      name: 'DevOps',
      slug: 'devops',
      description: 'DevOps specialization',
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
    where: { slug: 'devops' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'devops' },
    update: {
      name: 'DevOps',
      description: 'Comprehensive DevOps roadmap covering programming languages, operating systems, version control, cloud platforms, containers, orchestration, CI/CD, monitoring, security, and modern DevOps practices',
      icon: '⚙️',
      color: '#1F2937',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'DevOps',
      slug: 'devops',
      description: 'Comprehensive DevOps roadmap covering programming languages, operating systems, version control, cloud platforms, containers, orchestration, CI/CD, monitoring, security, and modern DevOps practices',
      icon: '⚙️',
      color: '#1F2937',
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

  console.log('\n✓ DevOps roadmap seeded successfully!');
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

/**
 * QA Engineer Roadmap Seed Script
 *
 * Seeds the QA Engineer development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/qa-engineer.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';
import { buildNodeResources } from './resources';

const prisma = new PrismaClient();

// QA Engineer Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'qa-engineer', name: 'QA Engineer', description: 'Complete QA Engineer roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 0 },

  // ==== LEARN THE FUNDAMENTALS ====
  { slug: 'learn-fundamentals-qa', name: 'Learn the Fundamentals', description: 'QA fundamentals', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
  { slug: 'what-is-qa', name: 'What is Quality Assurance?', description: 'QA concepts', difficulty: Difficulty.BEGINNER, sortOrder: 2 },
  { slug: 'qa-mindset', name: 'QA Mindset', description: 'QA thinking and approach', difficulty: Difficulty.INTERMEDIATE, sortOrder: 3 },
  { slug: 'testing-approaches', name: 'Testing Approaches', description: 'Different testing approaches', difficulty: Difficulty.INTERMEDIATE, sortOrder: 4 },

  // ==== TEST ORACLES ====
  { slug: 'test-oracles', name: 'Test Oracles', description: 'Test oracle concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 5 },
  { slug: 'test-prioritization', name: 'Test Prioritization', description: 'Prioritizing tests', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },

  // ==== SDLC DELIVERY MODEL ====
  { slug: 'sdlc-delivery-model', name: 'SDLC Delivery Model', description: 'Software development lifecycle models', difficulty: Difficulty.INTERMEDIATE, sortOrder: 7 },
  { slug: 'v-model', name: 'V Model', description: 'V-shaped development model', difficulty: Difficulty.INTERMEDIATE, sortOrder: 8 },
  { slug: 'waterfall', name: 'Waterfall', description: 'Waterfall development model', difficulty: Difficulty.INTERMEDIATE, sortOrder: 9 },
  { slug: 'agile-model-qa', name: 'Agile Model', description: 'Agile development approach', difficulty: Difficulty.INTERMEDIATE, sortOrder: 10 },
  { slug: 'kanban-qa', name: 'Kanban', description: 'Kanban methodology', difficulty: Difficulty.INTERMEDIATE, sortOrder: 11 },
  { slug: 'scrum-qa', name: 'Scrum', description: 'Scrum methodology', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },
  { slug: 'xp', name: 'XP', description: 'Extreme Programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },
  { slug: 'safe-qa', name: 'SAFe', description: 'Scaled Agile Framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },
  { slug: 'tdd-qa', name: 'TDD', description: 'Test Driven Development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },

  // ==== MANUAL TESTING ====
  { slug: 'manual-testing-qa', name: 'Manual Testing', description: 'Manual QA testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'test-cases-scenarios', name: 'Test Cases and Scenarios', description: 'Creating test cases', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },
  { slug: 'compatibility-qa', name: 'Compatibility', description: 'Compatibility testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'verification-validation', name: 'Verification and Validation', description: 'V&V concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'test-planning-qa', name: 'Test Planning', description: 'Planning test strategy', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },

  // ==== TESTING TECHNIQUES ====
  { slug: 'testing-techniques-qa', name: 'Testing Techniques', description: 'Various testing techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },

  // Functional Testing
  { slug: 'functional-testing-qa', name: 'Functional Testing', description: 'Functional testing methods', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },
  { slug: 'uat-qa', name: 'UAT', description: 'User Acceptance Testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },

  // Non-Functional Testing
  { slug: 'non-functional-testing-qa', name: 'Non-Functional Testing', description: 'Non-functional testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },
  { slug: 'exploratory-testing', name: 'Exploratory Testing', description: 'Exploratory testing approach', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'load-testing-qa', name: 'Load Testing', description: 'Load testing methods', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },
  { slug: 'sanity-testing', name: 'Sanity Testing', description: 'Sanity testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },
  { slug: 'performance-testing-qa', name: 'Performance Testing', description: 'Performance testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },
  { slug: 'regression-testing', name: 'Regression Testing', description: 'Regression testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'stress-testing', name: 'Stress Testing', description: 'Stress testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'smoke-testing', name: 'Smoke Testing', description: 'Smoke testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },
  { slug: 'security-testing-qa', name: 'Security Testing', description: 'Security testing methods', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },
  { slug: 'unit-testing-qa', name: 'Unit Testing', description: 'Unit testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },
  { slug: 'accessibility-testing-qa', name: 'Accessibility Testing', description: 'Accessibility testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },
  { slug: 'integration-testing', name: 'Integration Testing', description: 'Integration testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 35 },

  // ==== AUTOMATED TESTING ====
  { slug: 'automated-testing-qa', name: 'Automated Testing', description: 'Test automation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },

  // Backend Automation
  { slug: 'backend-automation-qa', name: 'Backend Automation', description: 'Backend test automation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },
  { slug: 'karate-framework', name: 'Karate Framework', description: 'Karate testing framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 38 },
  { slug: 'cypress-qa-backend', name: 'Cypress', description: 'Cypress testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'playwright-qa-backend', name: 'Playwright', description: 'Playwright testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'sass-ui-qa', name: 'SaaS UI', description: 'SaaS UI testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'postman-newman', name: 'Postman / Newman', description: 'Postman API testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },
  { slug: 'rest-assured', name: 'REST Assured', description: 'REST Assured framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },

  // Frontend Automation
  { slug: 'frontend-automation-qa', name: 'Frontend Automation', description: 'Frontend test automation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },
  { slug: 'basic-intro-qa', name: 'Basic Introduction', description: 'Frontend automation basics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },
  { slug: 'automation-frameworks-qa', name: 'Automation Frameworks', description: 'Testing frameworks', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'browser-dev-tools', name: 'Browser / Dev Tools', description: 'Browser developer tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 47 },
  { slug: 'html-css-javascript-qa', name: 'HTML, CSS, JavaScript', description: 'Web fundamentals for testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  { slug: 'ajax-qa', name: 'Ajax', description: 'Ajax testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'caching-qa', name: 'Caching', description: 'Cache testing concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 50 },
  { slug: 'swas-pwas-jamstack', name: 'SWAs, PWAs, JAMStack', description: 'Modern web app architectures', difficulty: Difficulty.INTERMEDIATE, sortOrder: 51 },
  { slug: 'csr-vs-ssr', name: 'CSR vs SSR', description: 'Client vs Server rendering', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'responsive-adaptive-qa', name: 'Responsive vs Adaptive', description: 'Responsive design testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },
  { slug: 'webdriverio-qa', name: 'WebdriverIO', description: 'WebdriverIO framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 54 },
  { slug: 'playwright-qa-frontend', name: 'Playwright', description: 'Playwright framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 55 },
  { slug: 'jasmine-qa', name: 'Jasmine', description: 'Jasmine testing framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 56 },
  { slug: 'qa-wolf-qa', name: 'QA Wolf', description: 'QA Wolf automation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 57 },
  { slug: 'robot-qa', name: 'Robot', description: 'Robot Framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 58 },
  { slug: 'selenium-qa', name: 'Selenium', description: 'Selenium WebDriver', difficulty: Difficulty.INTERMEDIATE, sortOrder: 59 },
  { slug: 'cypress-qa-frontend', name: 'Cypress', description: 'Cypress framework', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },
  { slug: 'jest-qa', name: 'Jest', description: 'Jest testing library', difficulty: Difficulty.INTERMEDIATE, sortOrder: 61 },
  { slug: 'nightwatch-qa', name: 'Nightwatch', description: 'Nightwatch testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 62 },
  { slug: 'puppeteer-qa', name: 'Puppeteer', description: 'Puppeteer automation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 63 },

  // Browser Addons
  { slug: 'browser-addons-qa', name: 'Browser Addons', description: 'Browser testing addons', difficulty: Difficulty.INTERMEDIATE, sortOrder: 64 },
  { slug: 'selenium-ide', name: 'Selenium IDE', description: 'Selenium IDE addon', difficulty: Difficulty.INTERMEDIATE, sortOrder: 65 },
  { slug: 'ghost-inspector', name: 'Ghost Inspector', description: 'Ghost Inspector tool', difficulty: Difficulty.INTERMEDIATE, sortOrder: 66 },
  { slug: 'bug-magnet', name: 'Bug Magnet', description: 'Bug Magnet addon', difficulty: Difficulty.INTERMEDIATE, sortOrder: 67 },

  // ==== LOAD & PERFORMANCE TESTING ====
  { slug: 'load-performance-testing', name: 'Load & Performance Testing', description: 'Performance testing tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 68 },
  { slug: 'lighthouse-qa', name: 'Lighthouse', description: 'Lighthouse performance tool', difficulty: Difficulty.INTERMEDIATE, sortOrder: 69 },
  { slug: 'locust-qa', name: 'Locust', description: 'Locust load testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 70 },
  { slug: 'webpage-test', name: 'Webpage Test', description: 'WebPageTest tool', difficulty: Difficulty.INTERMEDIATE, sortOrder: 71 },
  { slug: 'gatling-qa', name: 'Gatling', description: 'Gatling load testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 72 },
  { slug: 'k6-qa', name: 'K6', description: 'K6 performance testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 73 },
  { slug: 'artillery-qa', name: 'Artillery', description: 'Artillery load testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 74 },
  { slug: 'vegeta-qa', name: 'Vegeta', description: 'Vegeta HTTP load testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 75 },
  { slug: 'jmeter-qa', name: 'JMeter', description: 'Apache JMeter', difficulty: Difficulty.INTERMEDIATE, sortOrder: 76 },
  { slug: 'new-relic-qa', name: 'New Relic', description: 'New Relic monitoring', difficulty: Difficulty.INTERMEDIATE, sortOrder: 77 },
  { slug: 'runscope-qa', name: 'RunScope', description: 'RunScope testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 78 },
  { slug: 'kibana-qa', name: 'Kibana', description: 'Kibana visualization', difficulty: Difficulty.INTERMEDIATE, sortOrder: 79 },
  { slug: 'datadog-qa', name: 'Datadog', description: 'Datadog monitoring', difficulty: Difficulty.INTERMEDIATE, sortOrder: 80 },
  { slug: 'pagerduty-qa', name: 'Pager Duty', description: 'Pager Duty alerting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 81 },
  { slug: 'grafana-qa', name: 'Grafana', description: 'Grafana dashboards', difficulty: Difficulty.INTERMEDIATE, sortOrder: 82 },
  { slug: 'sentry-qa', name: 'Sentry', description: 'Sentry error tracking', difficulty: Difficulty.INTERMEDIATE, sortOrder: 83 },

  // ==== SECURITY TESTING ====
  { slug: 'security-testing-advanced', name: 'Security Testing', description: 'Security testing methods', difficulty: Difficulty.INTERMEDIATE, sortOrder: 84 },
  { slug: 'authentication-authorization', name: 'Authentication / Authorization', description: 'Auth testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 85 },
  { slug: 'secrets-management', name: 'Secrets Management', description: 'Secrets management testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 86 },
  { slug: 'vulnerability-scanning', name: 'Vulnerability Scanning', description: 'Vulnerability assessment', difficulty: Difficulty.INTERMEDIATE, sortOrder: 87 },
  { slug: 'owasp-10', name: 'OWASP 10', description: 'OWASP Top 10', difficulty: Difficulty.INTERMEDIATE, sortOrder: 88 },
  { slug: 'attack-vectors', name: 'Attack Vectors', description: 'Security attack testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 89 },

  // ==== MONITORING & LOGS ====
  { slug: 'monitoring-logs', name: 'Monitoring & Logs', description: 'System monitoring and logging', difficulty: Difficulty.INTERMEDIATE, sortOrder: 90 },

  // ==== VERSION CONTROL SYSTEM ====
  { slug: 'version-control-qa', name: 'Version Control System', description: 'Version control for QA', difficulty: Difficulty.INTERMEDIATE, sortOrder: 91 },
  { slug: 'git-qa', name: 'Git', description: 'Git version control', difficulty: Difficulty.INTERMEDIATE, sortOrder: 92 },

  // ==== REPO HOSTING SERVICES ====
  { slug: 'repo-hosting-services', name: 'Repo Hosting Services', description: 'Git hosting platforms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 93 },
  { slug: 'github-qa', name: 'GitHub', description: 'GitHub platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 94 },
  { slug: 'bitbucket-qa', name: 'Bitbucket', description: 'Bitbucket platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 95 },
  { slug: 'gitlab-qa', name: 'GitLab', description: 'GitLab platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 96 },

  // ==== CI/CD ====
  { slug: 'ci-cd-qa', name: 'CI/CD', description: 'Continuous Integration/Deployment', difficulty: Difficulty.INTERMEDIATE, sortOrder: 97 },
  { slug: 'teamcity-qa', name: 'TeamCity', description: 'TeamCity CI/CD', difficulty: Difficulty.INTERMEDIATE, sortOrder: 98 },
  { slug: 'azure-devops-qa', name: 'Azure DevOps Services', description: 'Azure DevOps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 99 },
  { slug: 'jenkins-qa', name: 'Jenkins', description: 'Jenkins CI/CD', difficulty: Difficulty.INTERMEDIATE, sortOrder: 100 },
  { slug: 'drone-qa', name: 'Drone', description: 'Drone CI/CD', difficulty: Difficulty.INTERMEDIATE, sortOrder: 101 },
  { slug: 'gitlab-ci-qa', name: 'GitLab CI', description: 'GitLab CI/CD', difficulty: Difficulty.INTERMEDIATE, sortOrder: 102 },
  { slug: 'bamboo-qa', name: 'Bamboo', description: 'Bamboo CI/CD', difficulty: Difficulty.INTERMEDIATE, sortOrder: 103 },
  { slug: 'circle-ci-qa', name: 'Circle CI', description: 'Circle CI', difficulty: Difficulty.INTERMEDIATE, sortOrder: 104 },
  { slug: 'travis-ci-qa', name: 'Travis CI', description: 'Travis CI', difficulty: Difficulty.INTERMEDIATE, sortOrder: 105 },

  // ==== HEADLESS TESTING ====
  { slug: 'headless-testing-qa', name: 'Headless Testing', description: 'Headless browser testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 106 },
  { slug: 'puppeteer-qa-headless', name: 'Puppeteer', description: 'Puppeteer headless', difficulty: Difficulty.INTERMEDIATE, sortOrder: 107 },
  { slug: 'zombie-js', name: 'Zombie.js', description: 'Zombie.js headless', difficulty: Difficulty.INTERMEDIATE, sortOrder: 108 },
  { slug: 'playwright-qa-headless', name: 'Playwright', description: 'Playwright headless', difficulty: Difficulty.INTERMEDIATE, sortOrder: 109 },
  { slug: 'cypress-qa-headless', name: 'Cypress', description: 'Cypress headless', difficulty: Difficulty.INTERMEDIATE, sortOrder: 110 },
  { slug: 'headless-chrome', name: 'Headless Chrome', description: 'Chrome headless mode', difficulty: Difficulty.INTERMEDIATE, sortOrder: 111 },
  { slug: 'headless-firefox', name: 'Headless Firefox', description: 'Firefox headless mode', difficulty: Difficulty.INTERMEDIATE, sortOrder: 112 },
  { slug: 'html-unit', name: 'HTML Unit', description: 'HtmlUnit testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 113 },

  // ==== PROJECT MANAGEMENT ====
  { slug: 'project-management-qa', name: 'Project Management', description: 'PM tools for QA', difficulty: Difficulty.INTERMEDIATE, sortOrder: 114 },
  { slug: 'atlassian-qa', name: 'Atlassian', description: 'Atlassian tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 115 },
  { slug: 'assemble-qa', name: 'Assemble', description: 'Assemble tool', difficulty: Difficulty.INTERMEDIATE, sortOrder: 116 },
  { slug: 'qtest-qa', name: 'qTest', description: 'qTest tool', difficulty: Difficulty.INTERMEDIATE, sortOrder: 117 },
  { slug: 'testpad-qa', name: 'TestPad', description: 'TestPad tool', difficulty: Difficulty.INTERMEDIATE, sortOrder: 118 },
  { slug: 'youtrack-qa', name: 'YouTrack', description: 'YouTrack issue tracker', difficulty: Difficulty.INTERMEDIATE, sortOrder: 119 },
  { slug: 'trello-qa', name: 'Trello', description: 'Trello project management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 120 },
  { slug: 'testlink-qa', name: 'TestLink', description: 'TestLink tool', difficulty: Difficulty.INTERMEDIATE, sortOrder: 121 },
  { slug: 'zephyr-qa', name: 'Zephyr', description: 'Zephyr testing tool', difficulty: Difficulty.INTERMEDIATE, sortOrder: 122 },

  // ==== MANAGE YOUR TESTING ====
  { slug: 'manage-testing-qa', name: 'Manage your Testing', description: 'Testing management', difficulty: Difficulty.INTERMEDIATE, sortOrder: 123 },

  // ==== EMAIL TESTING ====
  { slug: 'email-testing', name: 'Email Testing', description: 'Email testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 124 },
  { slug: 'mailinator-qa', name: 'Mailinator', description: 'Mailinator service', difficulty: Difficulty.INTERMEDIATE, sortOrder: 125 },
  { slug: 'gmail-tester', name: 'Gmail Tester', description: 'Gmail testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 126 },

  // ==== REPORTING ====
  { slug: 'reporting-qa', name: 'Reporting', description: 'Test reporting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 127 },
  { slug: 'testrail-qa', name: 'TestRail', description: 'TestRail tool', difficulty: Difficulty.INTERMEDIATE, sortOrder: 128 },
  { slug: 'allure-qa', name: 'Allure', description: 'Allure reporting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 129 },
  { slug: 'junit-qa', name: 'jUnit', description: 'jUnit testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 130 },

  // ==== KEEP LEARNING ====
  { slug: 'keep-learning-qa', name: 'Keep Learning', description: 'Continue learning QA', difficulty: Difficulty.BEGINNER, sortOrder: 131 },
];

const ROADMAP_EDGES_DATA = [
  // Learn the Fundamentals
  { source: 'learn-fundamentals-qa', target: 'qa-engineer', type: SkillEdgeType.PREREQUISITE },
  { source: 'what-is-qa', target: 'learn-fundamentals-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'qa-mindset', target: 'learn-fundamentals-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'testing-approaches', target: 'learn-fundamentals-qa', type: SkillEdgeType.SUBSKILL_OF },

  // Test Oracles
  { source: 'test-oracles', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'test-prioritization', target: 'test-oracles', type: SkillEdgeType.SUBSKILL_OF },

  // SDLC Delivery Model
  { source: 'sdlc-delivery-model', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'v-model', target: 'sdlc-delivery-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'waterfall', target: 'sdlc-delivery-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'agile-model-qa', target: 'sdlc-delivery-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kanban-qa', target: 'sdlc-delivery-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'scrum-qa', target: 'sdlc-delivery-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'xp', target: 'sdlc-delivery-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'safe-qa', target: 'sdlc-delivery-model', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tdd-qa', target: 'sdlc-delivery-model', type: SkillEdgeType.SUBSKILL_OF },

  // Manual Testing
  { source: 'manual-testing-qa', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'test-cases-scenarios', target: 'manual-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'compatibility-qa', target: 'manual-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'verification-validation', target: 'manual-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'test-planning-qa', target: 'manual-testing-qa', type: SkillEdgeType.SUBSKILL_OF },

  // Testing Techniques
  { source: 'testing-techniques-qa', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'functional-testing-qa', target: 'testing-techniques-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'uat-qa', target: 'functional-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'non-functional-testing-qa', target: 'testing-techniques-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'exploratory-testing', target: 'non-functional-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'load-testing-qa', target: 'non-functional-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sanity-testing', target: 'non-functional-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'performance-testing-qa', target: 'non-functional-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'regression-testing', target: 'non-functional-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'stress-testing', target: 'non-functional-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'smoke-testing', target: 'non-functional-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'security-testing-qa', target: 'non-functional-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'unit-testing-qa', target: 'non-functional-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'accessibility-testing-qa', target: 'non-functional-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'integration-testing', target: 'non-functional-testing-qa', type: SkillEdgeType.SUBSKILL_OF },

  // Automated Testing
  { source: 'automated-testing-qa', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },

  // Backend Automation
  { source: 'backend-automation-qa', target: 'automated-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'karate-framework', target: 'backend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cypress-qa-backend', target: 'backend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'playwright-qa-backend', target: 'backend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sass-ui-qa', target: 'backend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'postman-newman', target: 'backend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rest-assured', target: 'backend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },

  // Frontend Automation
  { source: 'frontend-automation-qa', target: 'automated-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'basic-intro-qa', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'automation-frameworks-qa', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'browser-dev-tools', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'html-css-javascript-qa', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ajax-qa', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'caching-qa', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'swas-pwas-jamstack', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'csr-vs-ssr', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'responsive-adaptive-qa', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'webdriverio-qa', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'playwright-qa-frontend', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'jasmine-qa', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'qa-wolf-qa', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'robot-qa', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'selenium-qa', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cypress-qa-frontend', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'jest-qa', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'nightwatch-qa', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'puppeteer-qa', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },

  // Browser Addons
  { source: 'browser-addons-qa', target: 'frontend-automation-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'selenium-ide', target: 'browser-addons-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ghost-inspector', target: 'browser-addons-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bug-magnet', target: 'browser-addons-qa', type: SkillEdgeType.SUBSKILL_OF },

  // Load & Performance Testing
  { source: 'load-performance-testing', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'lighthouse-qa', target: 'load-performance-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'locust-qa', target: 'load-performance-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'webpage-test', target: 'load-performance-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gatling-qa', target: 'load-performance-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'k6-qa', target: 'load-performance-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'artillery-qa', target: 'load-performance-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vegeta-qa', target: 'load-performance-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'jmeter-qa', target: 'load-performance-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'new-relic-qa', target: 'load-performance-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'runscope-qa', target: 'load-performance-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'kibana-qa', target: 'load-performance-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'datadog-qa', target: 'load-performance-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pagerduty-qa', target: 'load-performance-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'grafana-qa', target: 'load-performance-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sentry-qa', target: 'load-performance-testing', type: SkillEdgeType.SUBSKILL_OF },

  // Security Testing
  { source: 'security-testing-advanced', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'authentication-authorization', target: 'security-testing-advanced', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'secrets-management', target: 'security-testing-advanced', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vulnerability-scanning', target: 'security-testing-advanced', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'owasp-10', target: 'security-testing-advanced', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'attack-vectors', target: 'security-testing-advanced', type: SkillEdgeType.SUBSKILL_OF },

  // Monitoring & Logs
  { source: 'monitoring-logs', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },

  // Version Control
  { source: 'version-control-qa', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'git-qa', target: 'version-control-qa', type: SkillEdgeType.SUBSKILL_OF },

  // Repo Hosting Services
  { source: 'repo-hosting-services', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'github-qa', target: 'repo-hosting-services', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bitbucket-qa', target: 'repo-hosting-services', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gitlab-qa', target: 'repo-hosting-services', type: SkillEdgeType.SUBSKILL_OF },

  // CI/CD
  { source: 'ci-cd-qa', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'teamcity-qa', target: 'ci-cd-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'azure-devops-qa', target: 'ci-cd-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'jenkins-qa', target: 'ci-cd-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'drone-qa', target: 'ci-cd-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gitlab-ci-qa', target: 'ci-cd-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bamboo-qa', target: 'ci-cd-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'circle-ci-qa', target: 'ci-cd-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'travis-ci-qa', target: 'ci-cd-qa', type: SkillEdgeType.SUBSKILL_OF },

  // Headless Testing
  { source: 'headless-testing-qa', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'puppeteer-qa-headless', target: 'headless-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'zombie-js', target: 'headless-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'playwright-qa-headless', target: 'headless-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cypress-qa-headless', target: 'headless-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'headless-chrome', target: 'headless-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'headless-firefox', target: 'headless-testing-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'html-unit', target: 'headless-testing-qa', type: SkillEdgeType.SUBSKILL_OF },

  // Project Management
  { source: 'project-management-qa', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'atlassian-qa', target: 'project-management-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'assemble-qa', target: 'project-management-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'qtest-qa', target: 'project-management-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'testpad-qa', target: 'project-management-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'youtrack-qa', target: 'project-management-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'trello-qa', target: 'project-management-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'testlink-qa', target: 'project-management-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'zephyr-qa', target: 'project-management-qa', type: SkillEdgeType.SUBSKILL_OF },

  // Manage Your Testing
  { source: 'manage-testing-qa', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },

  // Email Testing
  { source: 'email-testing', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mailinator-qa', target: 'email-testing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gmail-tester', target: 'email-testing', type: SkillEdgeType.SUBSKILL_OF },

  // Reporting
  { source: 'reporting-qa', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'testrail-qa', target: 'reporting-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'allure-qa', target: 'reporting-qa', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'junit-qa', target: 'reporting-qa', type: SkillEdgeType.SUBSKILL_OF },

  // Keep Learning
  { source: 'keep-learning-qa', target: 'qa-engineer', type: SkillEdgeType.SUBSKILL_OF },
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
  console.log('Starting QA Engineer roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'qa-engineer' },
    update: { name: 'QA Engineer', description: 'QA Engineer specialization' },
    create: {
      name: 'QA Engineer',
      slug: 'qa-engineer',
      description: 'QA Engineer specialization',
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
    where: { slug: 'qa-engineer' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'qa-engineer' },
    update: {
      name: 'QA Engineer',
      description: 'Comprehensive QA Engineer roadmap covering testing fundamentals, SDLC models, manual and automated testing, performance testing, security testing, CI/CD, and comprehensive testing tools and frameworks',
      icon: '🧪',
      color: '#10B981',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'QA Engineer',
      slug: 'qa-engineer',
      description: 'Comprehensive QA Engineer roadmap covering testing fundamentals, SDLC models, manual and automated testing, performance testing, security testing, CI/CD, and comprehensive testing tools and frameworks',
      icon: '🧪',
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
    }
  }
  console.log(`✓ ${ROADMAP_EDGES_DATA.length} edges inserted`);

  console.log('\n✓ QA Engineer roadmap seeded successfully!');
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


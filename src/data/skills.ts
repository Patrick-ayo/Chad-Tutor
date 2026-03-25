export interface SkillCatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export const skills: SkillCatalogItem[] = [
  {
    id: "skill-html-css",
    name: "HTML & CSS",
    description: "Build clean, responsive page layouts and reusable UI styles.",
    category: "Web Development",
    difficulty: "Beginner",
  },
  {
    id: "skill-javascript",
    name: "JavaScript",
    description: "Use core JS concepts for dynamic interfaces and application logic.",
    category: "Programming",
    difficulty: "Beginner",
  },
  {
    id: "skill-typescript",
    name: "TypeScript",
    description: "Add type safety and stronger tooling to JavaScript projects.",
    category: "Programming",
    difficulty: "Intermediate",
  },
  {
    id: "skill-react",
    name: "React",
    description: "Create component-driven frontends with modern state patterns.",
    category: "Web Development",
    difficulty: "Intermediate",
  },
  {
    id: "skill-node",
    name: "Node.js",
    description: "Develop backend APIs and services using JavaScript runtime tools.",
    category: "Backend",
    difficulty: "Intermediate",
  },
  {
    id: "skill-express",
    name: "Express",
    description: "Build RESTful services, middleware chains, and API routes.",
    category: "Backend",
    difficulty: "Intermediate",
  },
  {
    id: "skill-sql",
    name: "SQL",
    description: "Query, model, and optimize relational database workflows.",
    category: "Data",
    difficulty: "Beginner",
  },
  {
    id: "skill-postgresql",
    name: "PostgreSQL",
    description: "Design schemas, indexes, and transactions for production apps.",
    category: "Data",
    difficulty: "Intermediate",
  },
  {
    id: "skill-python",
    name: "Python",
    description: "Write clean scripts, data pipelines, and backend services.",
    category: "Programming",
    difficulty: "Beginner",
  },
  {
    id: "skill-dsa",
    name: "Data Structures & Algorithms",
    description: "Improve problem solving and coding interview performance.",
    category: "Computer Science",
    difficulty: "Advanced",
  },
  {
    id: "skill-system-design",
    name: "System Design",
    description: "Design scalable, fault-tolerant services and distributed systems.",
    category: "Computer Science",
    difficulty: "Advanced",
  },
  {
    id: "skill-docker",
    name: "Docker",
    description: "Containerize applications for consistent local and cloud deployment.",
    category: "DevOps",
    difficulty: "Intermediate",
  },
  {
    id: "skill-kubernetes",
    name: "Kubernetes",
    description: "Orchestrate containers with scaling, rollout, and service discovery.",
    category: "DevOps",
    difficulty: "Advanced",
  },
  {
    id: "skill-aws",
    name: "AWS Fundamentals",
    description: "Use core cloud services for compute, storage, and networking.",
    category: "Cloud",
    difficulty: "Intermediate",
  },
  {
    id: "skill-git",
    name: "Git & Collaboration",
    description: "Work with branching strategies, pull requests, and code review flow.",
    category: "Workflow",
    difficulty: "Beginner",
  },
  {
    id: "skill-testing",
    name: "Testing",
    description: "Write unit and integration tests for reliable, maintainable code.",
    category: "Quality",
    difficulty: "Intermediate",
  },
  {
    id: "skill-ml",
    name: "Machine Learning Basics",
    description: "Understand model training, evaluation, and practical ML workflows.",
    category: "AI/ML",
    difficulty: "Advanced",
  },
  {
    id: "skill-prompting",
    name: "Prompt Engineering",
    description: "Design robust prompts and evaluation loops for LLM applications.",
    category: "AI/ML",
    difficulty: "Intermediate",
  },
];

export const skillCategories = [
  "Web Development",
  "Programming",
  "Backend",
  "Data",
  "Computer Science",
  "DevOps",
  "Cloud",
  "Workflow",
  "Quality",
  "AI/ML",
];

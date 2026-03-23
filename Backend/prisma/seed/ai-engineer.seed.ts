/**
 * AI Engineer Roadmap Seed Script
 *
 * Seeds the AI Engineer roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/ai-engineer.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';
import { buildNodeResources } from './resources';

const prisma = new PrismaClient();

// AI Engineer Roadmap - Complete Structure from roadmap.sh
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'ai-engineer', name: 'AI Engineer', description: 'A comprehensive roadmap to becoming an AI Engineer', difficulty: Difficulty.INTERMEDIATE, sortOrder: 0 },
  
  // Prerequisites Section
  { slug: 'ai-eng-prerequisites', name: 'Pre-requisites (One of these)', description: 'Foundational knowledge required', difficulty: Difficulty.BEGINNER, sortOrder: 1 },
  { slug: 'ai-eng-frontend', name: 'Frontend', description: 'Frontend development skills', difficulty: Difficulty.BEGINNER, sortOrder: 2 },
  { slug: 'ai-eng-backend', name: 'Backend', description: 'Backend development skills', difficulty: Difficulty.BEGINNER, sortOrder: 3 },
  { slug: 'ai-eng-full-stack', name: 'Full-Stack', description: 'Full-stack development skills', difficulty: Difficulty.INTERMEDIATE, sortOrder: 4 },

  // Scombro Note
  { slug: 'scombro-offer', name: 'Scombro 50% off Roadmap Users', description: 'Special offer for roadmap users', difficulty: Difficulty.BEGINNER, sortOrder: 5 },

  // Related Roadmaps
  { slug: 'related-roadmaps', name: 'Related Roadmaps', description: 'Other learning roadmaps', difficulty: Difficulty.BEGINNER, sortOrder: 6 },
  { slug: 'data-analyst-roadmap', name: 'Data Analyst Roadmap', description: 'Data analyst learning path', difficulty: Difficulty.BEGINNER, sortOrder: 7 },
  { slug: 'prompt-engineering-roadmap', name: 'Prompt Engineering Roadmap', description: 'Prompt engineering learning path', difficulty: Difficulty.BEGINNER, sortOrder: 8 },
  { slug: 'data-scientist-roadmap', name: 'Data Scientist Roadmap', description: 'Data scientist learning path', difficulty: Difficulty.BEGINNER, sortOrder: 9 },

  // Introduction Section
  { slug: 'ai-eng-introduction', name: 'Introduction', description: 'Introduction to AI Engineering', difficulty: Difficulty.BEGINNER, sortOrder: 10 },
  { slug: 'what-is-ai-engineer', name: 'What is an AI Engineer?', description: 'Understanding AI Engineer roles and responsibilities', difficulty: Difficulty.BEGINNER, sortOrder: 11 },
  { slug: 'ai-engineer-ml-engineering', name: 'AI Engineer in ML Engineering', description: 'AI Engineer role in machine learning context', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },
  { slug: 'ai-vs-ail-llms', name: 'AI vs AIL LLMs', description: 'Comparison of different AI approaches', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },
  { slug: 'inference', name: 'Inference', description: 'Model inference and deployment', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },
  { slug: 'training', name: 'Training', description: 'Model training fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },
  { slug: 'embeddings-intro', name: 'Embeddings', description: 'Understanding embeddings', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'vector-databases-intro', name: 'Vector Databases', description: 'Vector databases for embeddings', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },

  // Pre-trained Models Section
  { slug: 'using-pretrained-models', name: 'Using Pre-trained Models', description: 'How to use pre-trained models', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'benefits-pretrained', name: 'Benefits of Pre-trained Models', description: 'Advantages of using pre-trained models', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'limitations-considerations', name: 'Limitations and Considerations', description: 'Limitations of pre-trained models', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },
  
  // OpenAI Models subsection
  { slug: 'openai-models', name: 'OpenAI Models', description: 'OpenAI pre-trained models', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'open-ai-platform', name: 'Open AI Platform', description: 'OpenAI platform overview', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },
  { slug: 'capabilities-content-length', name: 'Capabilities / Content Length', description: 'Model capabilities and context length', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'cut-off-dates-knowledge', name: 'Cut off Dates / Knowledge', description: 'Model knowledge cutoff dates', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },
  
  // Popular AI Models
  { slug: 'popular-ai-models', name: 'Popular AI Models', description: 'Popular AI models overview', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'anthropic-gemini', name: 'Anthropic Gemini', description: 'Anthropic and Google Gemini models', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },
  { slug: 'grok-gemini-azure-aws', name: 'Grok, Gemini, Azure AI, AWS Supermeter', description: 'Various AI models and platforms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },
  
  // Hugging Face Models
  { slug: 'hugging-face-models', name: 'Hugging Face Models', description: 'Hugging Face model hub', difficulty: Difficulty.INTERMEDIATE, sortOrder: 28 },
  { slug: 'replicate', name: 'Replicate', description: 'Replicate model hosting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },

  // OpenAI API Section
  { slug: 'openai-api', name: 'OpenAI API', description: 'OpenAI API usage and integration', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'chat-completions-api', name: 'Chat Completions API', description: 'Chat completions endpoint', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },
  { slug: 'writing-prompts', name: 'Writing Prompts', description: 'How to write effective prompts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },
  { slug: 'few-shot-prompting', name: 'Few-shot Prompting', description: 'Few-shot prompting technique', difficulty: Difficulty.INTERMEDIATE, sortOrder: 33 },
  { slug: 'token-counting', name: 'Token Counting', description: 'Understanding token counting', difficulty: Difficulty.BEGINNER, sortOrder: 34 },
  { slug: 'pricing-considerations', name: 'Pricing Considerations', description: 'API pricing and cost optimization', difficulty: Difficulty.BEGINNER, sortOrder: 35 },
  { slug: 'managing-tokens', name: 'Managing Tokens', description: 'Token management strategies', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },
  { slug: 'openai-playground', name: 'Open AI Playground', description: 'OpenAI Playground testing tool', difficulty: Difficulty.BEGINNER, sortOrder: 37 },

  // Prompt Engineering
  { slug: 'prompt-engineering', name: 'Prompt Engineering', description: 'Art of crafting effective prompts', difficulty: Difficulty.ADVANCED, sortOrder: 38 },
  { slug: 'prompt-engineering-routing', name: 'Prompt Engineering Roadmap', description: 'Complete prompt engineering roadmap', difficulty: Difficulty.ADVANCED, sortOrder: 39 },

  // Open Source Models Section
  { slug: 'opensource-ai', name: 'OpenSource AI', description: 'Open source AI models and tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'open-closed-source-models', name: 'Open vs Closed Source Models', description: 'Comparison of open vs closed source models', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },
  { slug: 'popular-opensource-models', name: 'Popular Open Source Models', description: 'Popular open source models', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },
  { slug: 'hugging-face', name: 'Hugging Face', description: 'Hugging Face platform', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },
  { slug: 'finding-opensource-models', name: 'Finding Open Source Models', description: 'How to find open source models', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },
  { slug: 'hugging-face-hub', name: 'Hugging Face Hub', description: 'Hugging Face model hub', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },
  { slug: 'using-opensource-models', name: 'Using Open Source Models', description: 'How to use open source models', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'hugging-face-sdk', name: 'Hugging Face SDKs', description: 'Hugging Face software development kits', difficulty: Difficulty.INTERMEDIATE, sortOrder: 47 },
  { slug: 'transformers', name: 'Transformers', description: 'Hugging Face Transformers library', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  { slug: 'ollama', name: 'Ollama', description: 'Ollama local model runner', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'ollama-models', name: 'Ollama Models', description: 'Models available in Ollama', difficulty: Difficulty.INTERMEDIATE, sortOrder: 50 },
  { slug: 'ollama-sdk', name: 'Ollama SDK', description: 'Ollama SDK and API', difficulty: Difficulty.INTERMEDIATE, sortOrder: 51 },

  // AI Safety and Ethics Section
  { slug: 'ai-safety-ethics', name: 'AI Safety and Ethics', description: 'Ethics and safety considerations in AI', difficulty: Difficulty.ADVANCED, sortOrder: 52 },
  { slug: 'security-privacy', name: 'Security and Privacy', description: 'Security and privacy in AI systems', difficulty: Difficulty.ADVANCED, sortOrder: 53 },
  { slug: 'bias-fairness', name: 'Bias and Fairness', description: 'Addressing bias and fairness', difficulty: Difficulty.ADVANCED, sortOrder: 54 },
  { slug: 'understanding-ai-safety', name: 'Understanding AI Safety Issues', description: 'AI safety considerations', difficulty: Difficulty.ADVANCED, sortOrder: 55 },
  { slug: 'openai-moderation-api', name: 'OpenAI Moderation API', description: 'Content moderation with OpenAI', difficulty: Difficulty.ADVANCED, sortOrder: 56 },
  { slug: 'adding-extra-guidelines', name: 'Adding extra Guidelines', description: 'Setting custom guidelines', difficulty: Difficulty.ADVANCED, sortOrder: 57 },
  { slug: 'conducting-adversarial-testing', name: 'Conducting adversarial testing', description: 'Testing model robustness', difficulty: Difficulty.ADVANCED, sortOrder: 58 },
  { slug: 'robust-prompt-engineering', name: 'Robust prompt engineering', description: 'Robust prompt design', difficulty: Difficulty.ADVANCED, sortOrder: 59 },
  { slug: 'know-your-customers', name: 'Know your Customers / Usecases', description: 'Understanding customer needs', difficulty: Difficulty.ADVANCED, sortOrder: 60 },
  { slug: 'compliance-policies', name: 'Compliance policies and best practices', description: 'Compliance considerations', difficulty: Difficulty.ADVANCED, sortOrder: 61 },
  { slug: 'safety-best-practices', name: 'Safety Best Practices', description: 'Best practices for safe AI', difficulty: Difficulty.ADVANCED, sortOrder: 62 },

  // Embeddings & Vector Databases
  { slug: 'embeddings-vectors', name: 'Embeddings & Vector Databases', description: 'Embeddings and vector databases', difficulty: Difficulty.ADVANCED, sortOrder: 63 },
  { slug: 'what-are-embeddings', name: 'What are Embeddings', description: 'Understanding embeddings', difficulty: Difficulty.ADVANCED, sortOrder: 64 },
  { slug: 'semantic-search', name: 'Semantic Search', description: 'Semantic search with embeddings', difficulty: Difficulty.ADVANCED, sortOrder: 65 },
  { slug: 'text-clustering', name: 'Text Clustering', description: 'Clustering with embeddings', difficulty: Difficulty.ADVANCED, sortOrder: 66 },
  { slug: 'recommendation-systems', name: 'Recommendation Systems', description: 'Recommendation systems using embeddings', difficulty: Difficulty.ADVANCED, sortOrder: 67 },
  { slug: 'anomaly-detection', name: 'Anomaly Detection', description: 'Anomaly detection with embeddings', difficulty: Difficulty.ADVANCED, sortOrder: 68 },
  { slug: 'use-cases-embeddings', name: 'Use Cases for Embeddings', description: 'Use cases for embeddings', difficulty: Difficulty.ADVANCED, sortOrder: 69 },

  // RAG & Implementation
  { slug: 'rag-implementation', name: 'RAG & Implementation', description: 'Retrieval-Augmented Generation implementation', difficulty: Difficulty.ADVANCED, sortOrder: 70 },
  { slug: 'rag-usecases', name: 'RAG Usecases', description: 'Use cases for RAG', difficulty: Difficulty.ADVANCED, sortOrder: 71 },
  { slug: 'rag-vs-finetuning', name: 'RAG vs Fine-tuning', description: 'Comparison of RAG vs fine-tuning', difficulty: Difficulty.ADVANCED, sortOrder: 72 },
  { slug: 'implementing-rag', name: 'Implementing RAG', description: 'How to implement RAG', difficulty: Difficulty.ADVANCED, sortOrder: 73 },
  { slug: 'chunking', name: 'Chunking', description: 'Text chunking strategies', difficulty: Difficulty.ADVANCED, sortOrder: 74 },
  { slug: 'embeddings-rag', name: 'Embeddings', description: 'Embeddings in RAG', difficulty: Difficulty.ADVANCED, sortOrder: 75 },
  { slug: 'vector-database-rag', name: 'Vector Database', description: 'Vector database in RAG', difficulty: Difficulty.ADVANCED, sortOrder: 76 },
  { slug: 'retrieval-process', name: 'Retrieval Process', description: 'Retrieval in RAG', difficulty: Difficulty.ADVANCED, sortOrder: 77 },
  { slug: 'generation-rag', name: 'Generation', description: 'Generation in RAG', difficulty: Difficulty.ADVANCED, sortOrder: 78 },
  { slug: 'evaluation-rag', name: 'Evaluation', description: 'Evaluating RAG systems', difficulty: Difficulty.ADVANCED, sortOrder: 79 },

  // Fine-tuning
  { slug: 'finetuning-models', name: 'Fine-tuning', description: 'Fine-tuning pre-trained models', difficulty: Difficulty.ADVANCED, sortOrder: 80 },
  { slug: 'finetuning-injection-attacks', name: 'Prompt Injection Attacks', description: 'Preventing prompt injection attacks', difficulty: Difficulty.ADVANCED, sortOrder: 81 },

  // LLMs with RAG
  { slug: 'using-llms', name: 'Using LLMs', description: 'Using large language models', difficulty: Difficulty.ADVANCED, sortOrder: 82 },
  { slug: 'langchain', name: 'Langchain', description: 'Langchain framework', difficulty: Difficulty.ADVANCED, sortOrder: 83 },
  { slug: 'llama-index', name: 'Llama Index', description: 'Llama Index framework', difficulty: Difficulty.ADVANCED, sortOrder: 84 },

  // AI Agents
  { slug: 'ai-agents', name: 'AI Agents', description: 'Building AI agents', difficulty: Difficulty.EXPERT, sortOrder: 85 },
  { slug: 'agent-usecases', name: 'Agent Usecases', description: 'Use cases for AI agents', difficulty: Difficulty.EXPERT, sortOrder: 86 },
  { slug: 'naive-prompting', name: 'Naive Prompting', description: 'Naive prompting approach for agents', difficulty: Difficulty.EXPERT, sortOrder: 87 },
  { slug: 'building-ai-agents', name: 'Building AI Agents', description: 'How to build AI agents', difficulty: Difficulty.EXPERT, sortOrder: 88 },
  { slug: 'openai-functions', name: 'OpenAI Functions / Tools', description: 'Using OpenAI functions', difficulty: Difficulty.EXPERT, sortOrder: 89 },
  { slug: 'openai-assistant-api', name: 'OpenAI Assistant API', description: 'OpenAI Assistant API', difficulty: Difficulty.EXPERT, sortOrder: 90 },

  // Multimedia AI
  { slug: 'multimedia-ai', name: 'Multimedia AI', description: 'Multimodal AI systems', difficulty: Difficulty.EXPERT, sortOrder: 91 },
  { slug: 'openai-vision-api', name: 'OpenAI Vision API', description: 'OpenAI vision capabilities', difficulty: Difficulty.EXPERT, sortOrder: 92 },
  { slug: 'dall-e-api', name: 'DALL-E API', description: 'DALL-E image generation API', difficulty: Difficulty.EXPERT, sortOrder: 93 },
  { slug: 'whisper-api', name: 'Whisper API', description: 'Whisper speech-to-text API', difficulty: Difficulty.EXPERT, sortOrder: 94 },
  { slug: 'hugging-face-multimodal', name: 'Hugging Face Models', description: 'Multimodal models from Hugging Face', difficulty: Difficulty.EXPERT, sortOrder: 95 },
  { slug: 'llama-models-multimedia', name: 'LLaMA Models for Multimedia Apps', description: 'LLaMA models for multimedia', difficulty: Difficulty.EXPERT, sortOrder: 96 },
  { slug: 'implementing-multimedia-ai', name: 'Implementing Multimedia AI', description: 'How to implement multimedia AI', difficulty: Difficulty.EXPERT, sortOrder: 97 },
  { slug: 'multimodal-models', name: 'Multimodal Models', description: 'Understanding multimodal models', difficulty: Difficulty.EXPERT, sortOrder: 98 },

  // AI Code Editors (with more sub-items)
  { slug: 'ai-code-editors', name: 'AI Code Editors', description: 'AI-powered code editing tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 99 },
  { slug: 'code-completion-tools', name: 'Code Completion Tools', description: 'Code completion tools', difficulty: Difficulty.INTERMEDIATE, sortOrder: 100 },
  { slug: 'code-completion-trials', name: 'Code Completion Trials', description: 'Testing code completion', difficulty: Difficulty.INTERMEDIATE, sortOrder: 101 },

  // Development Tools
  { slug: 'development-tools', name: 'Development Tools', description: 'Tools for AI development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 102 },

  // Continue Learning Section
  { slug: 'continue-learning', name: 'Continue Learning', description: 'Path to continue learning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 103 },
  { slug: 'ai-data-scientist-track', name: 'AI and Data Scientist', description: 'Continue with AI and Data Science track', difficulty: Difficulty.INTERMEDIATE, sortOrder: 104 },
  { slug: 'prompt-engineering-track', name: 'Prompt Engineering', description: 'Continue with Prompt Engineering track', difficulty: Difficulty.INTERMEDIATE, sortOrder: 105 },
];

const ROADMAP_EDGES_DATA = [
  // Prerequisites
  { source: 'ai-eng-prerequisites', target: 'ai-engineer', type: SkillEdgeType.PREREQUISITE },
  { source: 'ai-eng-frontend', target: 'ai-eng-prerequisites', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ai-eng-backend', target: 'ai-eng-prerequisites', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ai-eng-full-stack', target: 'ai-eng-prerequisites', type: SkillEdgeType.SUBSKILL_OF },

  // Scombro offer
  { source: 'scombro-offer', target: 'ai-engineer', type: SkillEdgeType.RELATED },

  // Related Roadmaps
  { source: 'related-roadmaps', target: 'ai-engineer', type: SkillEdgeType.RELATED },
  { source: 'data-analyst-roadmap', target: 'related-roadmaps', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'prompt-engineering-roadmap', target: 'related-roadmaps', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'data-scientist-roadmap', target: 'related-roadmaps', type: SkillEdgeType.SUBSKILL_OF },

  // Introduction path
  { source: 'ai-eng-introduction', target: 'ai-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'what-is-ai-engineer', target: 'ai-eng-introduction', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ai-engineer-ml-engineering', target: 'ai-eng-introduction', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ai-vs-ail-llms', target: 'ai-eng-introduction', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'inference', target: 'ai-eng-introduction', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'training', target: 'ai-eng-introduction', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'embeddings-intro', target: 'ai-eng-introduction', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vector-databases-intro', target: 'ai-eng-introduction', type: SkillEdgeType.SUBSKILL_OF },

  // Using Pre-trained Models
  { source: 'using-pretrained-models', target: 'ai-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'benefits-pretrained', target: 'using-pretrained-models', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'limitations-considerations', target: 'using-pretrained-models', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'openai-models', target: 'using-pretrained-models', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'popular-ai-models', target: 'using-pretrained-models', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hugging-face-models', target: 'using-pretrained-models', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'replicate', target: 'using-pretrained-models', type: SkillEdgeType.SUBSKILL_OF },

  // OpenAI Models
  { source: 'open-ai-platform', target: 'openai-models', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'capabilities-content-length', target: 'open-ai-platform', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cut-off-dates-knowledge', target: 'open-ai-platform', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'anthropic-gemini', target: 'popular-ai-models', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'grok-gemini-azure-aws', target: 'popular-ai-models', type: SkillEdgeType.SUBSKILL_OF },

  // OpenAI API
  { source: 'openai-api', target: 'ai-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'chat-completions-api', target: 'openai-api', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'writing-prompts', target: 'chat-completions-api', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'few-shot-prompting', target: 'chat-completions-api', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'token-counting', target: 'chat-completions-api', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'pricing-considerations', target: 'chat-completions-api', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'managing-tokens', target: 'chat-completions-api', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'openai-playground', target: 'chat-completions-api', type: SkillEdgeType.SUBSKILL_OF },

  // Prompt Engineering
  { source: 'prompt-engineering', target: 'ai-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'prompt-engineering-routing', target: 'prompt-engineering', type: SkillEdgeType.SUBSKILL_OF },

  // Open Source AI
  { source: 'opensource-ai', target: 'ai-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'open-closed-source-models', target: 'opensource-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'popular-opensource-models', target: 'opensource-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hugging-face', target: 'popular-opensource-models', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'finding-opensource-models', target: 'popular-opensource-models', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hugging-face-hub', target: 'finding-opensource-models', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'using-opensource-models', target: 'popular-opensource-models', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hugging-face-sdk', target: 'using-opensource-models', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'transformers', target: 'hugging-face-sdk', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ollama', target: 'popular-opensource-models', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ollama-models', target: 'ollama', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ollama-sdk', target: 'ollama', type: SkillEdgeType.SUBSKILL_OF },

  // AI Safety and Ethics
  { source: 'ai-safety-ethics', target: 'ai-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'security-privacy', target: 'ai-safety-ethics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bias-fairness', target: 'ai-safety-ethics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'understanding-ai-safety', target: 'security-privacy', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'openai-moderation-api', target: 'understanding-ai-safety', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'adding-extra-guidelines', target: 'understanding-ai-safety', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'conducting-adversarial-testing', target: 'understanding-ai-safety', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'robust-prompt-engineering', target: 'understanding-ai-safety', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'know-your-customers', target: 'understanding-ai-safety', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'compliance-policies', target: 'understanding-ai-safety', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'safety-best-practices', target: 'understanding-ai-safety', type: SkillEdgeType.SUBSKILL_OF },

  // Embeddings & Vector Databases
  { source: 'embeddings-vectors', target: 'ai-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'what-are-embeddings', target: 'embeddings-vectors', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'semantic-search', target: 'what-are-embeddings', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'text-clustering', target: 'what-are-embeddings', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'recommendation-systems', target: 'what-are-embeddings', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'anomaly-detection', target: 'what-are-embeddings', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'use-cases-embeddings', target: 'what-are-embeddings', type: SkillEdgeType.SUBSKILL_OF },

  // RAG & Implementation
  { source: 'rag-implementation', target: 'ai-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rag-usecases', target: 'rag-implementation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rag-vs-finetuning', target: 'rag-implementation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'implementing-rag', target: 'rag-implementation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'chunking', target: 'implementing-rag', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'embeddings-rag', target: 'implementing-rag', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vector-database-rag', target: 'implementing-rag', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'retrieval-process', target: 'implementing-rag', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'generation-rag', target: 'implementing-rag', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'evaluation-rag', target: 'implementing-rag', type: SkillEdgeType.SUBSKILL_OF },

  // Fine-tuning
  { source: 'finetuning-models', target: 'ai-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'finetuning-injection-attacks', target: 'finetuning-models', type: SkillEdgeType.SUBSKILL_OF },

  // Using LLMs
  { source: 'using-llms', target: 'ai-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'langchain', target: 'using-llms', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'llama-index', target: 'using-llms', type: SkillEdgeType.SUBSKILL_OF },

  // AI Agents
  { source: 'ai-agents', target: 'ai-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'agent-usecases', target: 'ai-agents', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'naive-prompting', target: 'ai-agents', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'building-ai-agents', target: 'ai-agents', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'openai-functions', target: 'building-ai-agents', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'openai-assistant-api', target: 'building-ai-agents', type: SkillEdgeType.SUBSKILL_OF },

  // Multimedia AI
  { source: 'multimedia-ai', target: 'ai-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'openai-vision-api', target: 'multimedia-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dall-e-api', target: 'multimedia-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'whisper-api', target: 'multimedia-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hugging-face-multimodal', target: 'multimedia-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'llama-models-multimedia', target: 'multimedia-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'implementing-multimedia-ai', target: 'multimedia-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'multimodal-models', target: 'implementing-multimedia-ai', type: SkillEdgeType.SUBSKILL_OF },

  // AI Code Editors
  { source: 'ai-code-editors', target: 'ai-engineer', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'code-completion-tools', target: 'ai-code-editors', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'code-completion-trials', target: 'code-completion-tools', type: SkillEdgeType.SUBSKILL_OF },

  // Development Tools
  { source: 'development-tools', target: 'ai-engineer', type: SkillEdgeType.SUBSKILL_OF },

  // Continue Learning
  { source: 'continue-learning', target: 'ai-engineer', type: SkillEdgeType.RELATED },
  { source: 'ai-data-scientist-track', target: 'continue-learning', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'prompt-engineering-track', target: 'continue-learning', type: SkillEdgeType.SUBSKILL_OF },

  // Cross-dependencies and prerequisites
  { source: 'openai-api', target: 'using-pretrained-models', type: SkillEdgeType.PREREQUISITE },
  { source: 'embeddings-vectors', target: 'using-pretrained-models', type: SkillEdgeType.PREREQUISITE },
  { source: 'rag-implementation', target: 'embeddings-vectors', type: SkillEdgeType.BUILDS_ON },
  { source: 'ai-agents', target: 'using-llms', type: SkillEdgeType.BUILDS_ON },
  { source: 'prompt-engineering', target: 'openai-api', type: SkillEdgeType.RELATED },
];

async function main() {
  console.log('Starting AI Engineer roadmap seed...');
  
  // Upsert the 'AI & Engineering' category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'ai-engineering' },
    update: {},
    create: {
      name: 'AI & Engineering',
      slug: 'ai-engineering',
      description: 'AI engineering and prompt engineering learning paths',
      icon: '⚙️',
      color: '#F59E0B',
      sortOrder: 5,
    },
  });
  console.log('✓ Category created/updated');

  // Build nodes with categoryId
  const ROADMAP_NODES = ROADMAP_NODES_DATA.map(node => ({
    ...node,
    categoryId: category.id,
    normalizedName: node.name.toLowerCase(),
    resources: buildNodeResources(node.name, node.slug),
  }));

  // Insert all nodes (skills)
  console.log(`Inserting ${ROADMAP_NODES.length} skills...`);
  for (const node of ROADMAP_NODES) {
    await prisma.skill.upsert({
      where: { slug: node.slug },
      update: {
        name: node.name,
        description: node.description,
        resources: (node as any).resources,
        categoryId: node.categoryId,
        difficulty: node.difficulty,
        normalizedName: node.normalizedName,
        sortOrder: node.sortOrder,
      },
      create: {
        slug: node.slug,
        name: node.name,
        description: node.description,
        resources: (node as any).resources,
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
  const rootSkill = await prisma.skill.findUnique({ where: { slug: 'ai-engineer' } });

  // Create or update the AI Engineer Roadmap
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'ai-engineer' },
    update: {
      name: 'AI Engineer',
      description: 'A comprehensive roadmap to becoming an AI Engineer, covering pre-requisites, pre-trained models, OpenAI APIs, prompt engineering, open source models, RAG, fine-tuning, AI agents, and multimedia AI',
      icon: '⚙️',
      color: '#F59E0B',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'AI Engineer',
      slug: 'ai-engineer',
      description: 'A comprehensive roadmap to becoming an AI Engineer, covering pre-requisites, pre-trained models, OpenAI APIs, prompt engineering, open source models, RAG, fine-tuning, AI agents, and multimedia AI',
      icon: '⚙️',
      color: '#F59E0B',
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

  console.log('\n✓ AI Engineer roadmap seeded successfully!');
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

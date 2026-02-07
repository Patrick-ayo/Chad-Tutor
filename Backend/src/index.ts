import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import config from './config';
import { connectDatabase, disconnectDatabase } from './db';
import { cacheService } from './services';
import { registerAllJobs } from './jobs';
import { userRoutes, settingsRoutes, examRoutes, goalsRoutes, universityRoutes } from './routes';
import { errorHandler, notFoundHandler } from './middleware';
import { HipolabsProvider } from './external/providers/HipolabsProvider';

const app = express();

// Trust proxy for production environments
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (before auth)
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Test university search endpoint (no auth required)
app.get('/test/universities', async (req, res) => {
  try {
    const query = req.query.q as string || 'stanford';
    const provider = new HipolabsProvider();
    const results = await provider.search(query);
    
    res.json({
      success: true,
      query,
      provider: 'hipolabs',
      results: results.slice(0, 3), // Limit to 3 for testing
      timestamp: new Date().toISOString(),
      note: 'This is a test endpoint - use /api/universities/search for production'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Exam API routes (no auth required for university search)
app.get('/api/exam/universities', async (req, res) => {
  try {
    const search = req.query.search as string;
    
    // Add debug headers to help troubleshoot frontend issues
    res.header('X-Debug-Search', search || 'empty');
    res.header('X-Debug-Timestamp', new Date().toISOString());
    
    // Handle empty or missing search gracefully
    if (!search || typeof search !== 'string' || search.trim().length === 0) {
      return res.json({
        universities: [],
        meta: {
          cacheHit: false,
          latencyMs: 0,
          message: 'Empty search query - provide a search term to get results',
          debug: 'no-search-term'
        },
      });
    }
    
    console.log(`[DEBUG] University search for: "${search}"`);
    
    const provider = new HipolabsProvider();
    const results = await provider.search(search.trim());
    
    console.log(`[DEBUG] Found ${results.length} universities for "${search}"`);
    
    // Map to the format the frontend expects: { id, name, type }
    const universities = results.slice(0, 20).map(uni => ({
      id: uni.domain || uni.name.toLowerCase().replace(/\s+/g, '-'),
      name: uni.name,
      type: uni.country || 'University'
    }));
    
    res.json({
      universities,
      meta: {
        cacheHit: false,
        latencyMs: Date.now(),
        searchTerm: search.trim(),
        resultCount: results.length
      },
    });
  } catch (error) {
    console.error('University search error:', error);
    res.status(500).json({
      error: 'Search Failed',
      message: 'Failed to search universities',
      debug: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Additional exam API routes for robustness
app.get('/api/exam/courses', async (req, res) => {
  const universityId = req.query.university as string;
  
  // Mock courses based on university
  const coursesByUniversity: { [key: string]: any[] } = {
    'mu.ac.in': [
      { id: 'btech-cs', name: 'B.Tech Computer Science', duration: '4 years', totalSemesters: 8 },
      { id: 'bcom', name: 'Bachelor of Commerce', duration: '3 years', totalSemesters: 6 },
      { id: 'mba', name: 'Master of Business Administration', duration: '2 years', totalSemesters: 4 }
    ],
    'stanford.edu': [
      { id: 'cs-ms', name: 'MS Computer Science', duration: '2 years', totalSemesters: 4 },
      { id: 'cs-bs', name: 'BS Computer Science', duration: '4 years', totalSemesters: 8 },
      { id: 'ee-bs', name: 'BS Electrical Engineering', duration: '4 years', totalSemesters: 8 }
    ],
    'mit.edu': [
      { id: 'cs-6', name: 'Course 6 (EECS)', duration: '4 years', totalSemesters: 8 },
      { id: 'meng', name: 'Master of Engineering', duration: '1 year', totalSemesters: 2 },
      { id: 'phd-cs', name: 'PhD Computer Science', duration: '5-7 years', totalSemesters: 10 }
    ]
  };
  
  const courses = coursesByUniversity[universityId] || [
    { id: 'general-1', name: 'Bachelor of Science', duration: '3 years', totalSemesters: 6 },
    { id: 'general-2', name: 'Bachelor of Arts', duration: '3 years', totalSemesters: 6 },
    { id: 'general-3', name: 'Master\'s Program', duration: '2 years', totalSemesters: 4 }
  ];
  
  res.json({
    courses,
    meta: { message: `Courses for university: ${universityId}`, universityId }
  });
});

app.get('/api/exam/semesters', async (req, res) => {
  const universityId = req.query.university as string;
  const courseId = req.query.course as string;
  
  // Mock semesters based on course
  const semestersByCourse: { [key: string]: any[] } = {
    'btech-cs': [
      { id: 'sem-1', name: 'Semester 1', number: 1 },
      { id: 'sem-2', name: 'Semester 2', number: 2 },
      { id: 'sem-3', name: 'Semester 3', number: 3 },
      { id: 'sem-4', name: 'Semester 4', number: 4 },
      { id: 'sem-5', name: 'Semester 5', number: 5 },
      { id: 'sem-6', name: 'Semester 6', number: 6 },
      { id: 'sem-7', name: 'Semester 7', number: 7 },
      { id: 'sem-8', name: 'Semester 8', number: 8 }
    ],
    'cs-ms': [
      { id: 'fall-1', name: 'Fall Year 1', number: 1 },
      { id: 'spring-1', name: 'Spring Year 1', number: 2 },
      { id: 'fall-2', name: 'Fall Year 2', number: 3 },
      { id: 'spring-2', name: 'Spring Year 2', number: 4 }
    ],
    'cs-bs': [
      { id: 'fresh-fall', name: 'Freshman Fall', number: 1 },
      { id: 'fresh-spring', name: 'Freshman Spring', number: 2 },
      { id: 'soph-fall', name: 'Sophomore Fall', number: 3 },
      { id: 'soph-spring', name: 'Sophomore Spring', number: 4 },
      { id: 'junior-fall', name: 'Junior Fall', number: 5 },
      { id: 'junior-spring', name: 'Junior Spring', number: 6 },
      { id: 'senior-fall', name: 'Senior Fall', number: 7 },
      { id: 'senior-spring', name: 'Senior Spring', number: 8 }
    ]
  };
  
  const semesters = semestersByCourse[courseId] || [
    { id: 'semester-1', name: 'Semester 1', number: 1 },
    { id: 'semester-2', name: 'Semester 2', number: 2 },
    { id: 'semester-3', name: 'Semester 3', number: 3 },
    { id: 'semester-4', name: 'Semester 4', number: 4 }
  ];
  
  res.json({
    semesters,
    meta: { message: `Semesters for course: ${courseId}`, universityId, courseId }
  });
});

app.get('/api/exam/subjects', async (req, res) => {
  const universityId = req.query.university as string;
  const courseId = req.query.course as string;
  const semesterId = req.query.semester as string;
  
  // Mock subjects based on semester and course
  const subjectsBySemester: { [key: string]: any[] } = {
    'sem-1': [
      { id: 'math-1', name: 'Engineering Mathematics I', code: 'MATH101', credits: 4, marks: 100 },
      { id: 'physics-1', name: 'Engineering Physics I', code: 'PHY101', credits: 3, marks: 100 },
      { id: 'chem-1', name: 'Engineering Chemistry', code: 'CHEM101', credits: 3, marks: 100 },
      { id: 'prog-1', name: 'Programming Fundamentals', code: 'CS101', credits: 4, marks: 100 }
    ],
    'sem-2': [
      { id: 'math-2', name: 'Engineering Mathematics II', code: 'MATH102', credits: 4, marks: 100 },
      { id: 'physics-2', name: 'Engineering Physics II', code: 'PHY102', credits: 3, marks: 100 },
      { id: 'ds-1', name: 'Data Structures', code: 'CS201', credits: 4, marks: 100 },
      { id: 'digital-1', name: 'Digital Electronics', code: 'ECE101', credits: 3, marks: 100 }
    ],
    'fall-1': [
      { id: 'algorithms', name: 'Design and Analysis of Algorithms', code: 'CS161', credits: 3, marks: 100 },
      { id: 'systems', name: 'Computer Systems', code: 'CS107', credits: 3, marks: 100 },
      { id: 'ml-intro', name: 'Introduction to Machine Learning', code: 'CS229', credits: 3, marks: 100 }
    ],
    'spring-1': [
      { id: 'databases', name: 'Database Systems', code: 'CS245', credits: 3, marks: 100 },
      { id: 'networks', name: 'Computer Networks', code: 'CS144', credits: 3, marks: 100 },
      { id: 'ai-intro', name: 'Artificial Intelligence', code: 'CS221', credits: 3, marks: 100 }
    ]
  };
  
  const subjects = subjectsBySemester[semesterId] || [
    { id: 'sub-1', name: 'Core Subject 1', code: 'CORE101', credits: 3, marks: 100 },
    { id: 'sub-2', name: 'Core Subject 2', code: 'CORE102', credits: 3, marks: 100 },
    { id: 'sub-3', name: 'Elective 1', code: 'ELEC101', credits: 3, marks: 100 }
  ];
  
  res.json({
    subjects,
    meta: { message: `Subjects for ${semesterId}`, universityId, courseId, semesterId }
  });
});

// Get topics for selected subjects
app.get('/api/exam/topics', async (req, res) => {
  const subjectIds = req.query.subjects as string; // Comma-separated subject IDs
  
  if (!subjectIds) {
    return res.json({
      topics: [],
      meta: { message: 'No subjects provided', error: 'subjects parameter required' }
    });
  }
  
  const selectedSubjects = subjectIds.split(',').map(id => id.trim());
  
  // Mock topics organized by subject and module, with subtopics
  const topicsBySubject: { [key: string]: any[] } = {
    'math-1': [
      // Module 1: Calculus
      { id: 'calc-limits', name: 'Limits and Continuity', subjectId: 'math-1', module: 'Calculus', difficulty: 'medium', estimatedHours: 8, subtopics: [
        { id: 'calc-limits-1', name: 'Definition of a Limit', estimatedHours: 1.5 },
        { id: 'calc-limits-2', name: 'One-sided Limits', estimatedHours: 1 },
        { id: 'calc-limits-3', name: 'Squeeze Theorem', estimatedHours: 1.5 },
        { id: 'calc-limits-4', name: 'Continuity & Discontinuity Types', estimatedHours: 2 },
        { id: 'calc-limits-5', name: 'Limits at Infinity', estimatedHours: 2 }
      ]},
      { id: 'calc-derivatives', name: 'Derivatives', subjectId: 'math-1', module: 'Calculus', difficulty: 'hard', estimatedHours: 10, subtopics: [
        { id: 'calc-deriv-1', name: 'First Principles of Differentiation', estimatedHours: 2 },
        { id: 'calc-deriv-2', name: 'Power, Product & Quotient Rules', estimatedHours: 2 },
        { id: 'calc-deriv-3', name: 'Chain Rule', estimatedHours: 2 },
        { id: 'calc-deriv-4', name: 'Implicit Differentiation', estimatedHours: 2 },
        { id: 'calc-deriv-5', name: 'Applications of Derivatives (Maxima & Minima)', estimatedHours: 2 }
      ]},
      { id: 'calc-integrals', name: 'Integration', subjectId: 'math-1', module: 'Calculus', difficulty: 'hard', estimatedHours: 12, subtopics: [
        { id: 'calc-int-1', name: 'Indefinite Integrals', estimatedHours: 2 },
        { id: 'calc-int-2', name: 'Definite Integrals & Fundamental Theorem', estimatedHours: 2 },
        { id: 'calc-int-3', name: 'Integration by Substitution', estimatedHours: 2 },
        { id: 'calc-int-4', name: 'Integration by Parts', estimatedHours: 2 },
        { id: 'calc-int-5', name: 'Partial Fractions', estimatedHours: 2 },
        { id: 'calc-int-6', name: 'Applications of Integration (Area, Volume)', estimatedHours: 2 }
      ]},
      // Module 2: Linear Algebra
      { id: 'matrices', name: 'Matrices and Determinants', subjectId: 'math-1', module: 'Linear Algebra', difficulty: 'medium', estimatedHours: 6, subtopics: [
        { id: 'mat-1', name: 'Types of Matrices', estimatedHours: 1 },
        { id: 'mat-2', name: 'Matrix Operations (Add, Multiply, Transpose)', estimatedHours: 1.5 },
        { id: 'mat-3', name: 'Determinant Evaluation', estimatedHours: 1.5 },
        { id: 'mat-4', name: 'Inverse of a Matrix', estimatedHours: 1 },
        { id: 'mat-5', name: 'Cramer\'s Rule', estimatedHours: 1 }
      ]},
      { id: 'vectors', name: 'Vector Spaces', subjectId: 'math-1', module: 'Linear Algebra', difficulty: 'easy', estimatedHours: 4, subtopics: [
        { id: 'vec-1', name: 'Vector Operations & Properties', estimatedHours: 1 },
        { id: 'vec-2', name: 'Linear Independence', estimatedHours: 1 },
        { id: 'vec-3', name: 'Basis and Dimension', estimatedHours: 1 },
        { id: 'vec-4', name: 'Subspaces', estimatedHours: 1 }
      ]},
      // Module 3: Differential Equations
      { id: 'ode', name: 'Ordinary Differential Equations', subjectId: 'math-1', module: 'Differential Equations', difficulty: 'hard', estimatedHours: 10, subtopics: [
        { id: 'ode-1', name: 'First Order ODE (Separable)', estimatedHours: 2 },
        { id: 'ode-2', name: 'Exact Equations & Integrating Factors', estimatedHours: 2 },
        { id: 'ode-3', name: 'Linear First Order ODE', estimatedHours: 2 },
        { id: 'ode-4', name: 'Second Order Homogeneous ODE', estimatedHours: 2 },
        { id: 'ode-5', name: 'Non-Homogeneous ODE (Undetermined Coefficients)', estimatedHours: 2 }
      ]}
    ],
    'prog-1': [
      // Module 1: Programming Basics
      { id: 'variables', name: 'Variables and Data Types', subjectId: 'prog-1', module: 'Programming Basics', difficulty: 'easy', estimatedHours: 4, subtopics: [
        { id: 'var-1', name: 'Primitive Data Types (int, float, char, bool)', estimatedHours: 1 },
        { id: 'var-2', name: 'Variable Declaration & Initialization', estimatedHours: 1 },
        { id: 'var-3', name: 'Type Casting & Conversion', estimatedHours: 1 },
        { id: 'var-4', name: 'Constants & Enumerations', estimatedHours: 1 }
      ]},
      { id: 'control-flow', name: 'Control Flow Statements', subjectId: 'prog-1', module: 'Programming Basics', difficulty: 'easy', estimatedHours: 6, subtopics: [
        { id: 'cf-1', name: 'If / Else / Else-if', estimatedHours: 1 },
        { id: 'cf-2', name: 'Switch-Case', estimatedHours: 1 },
        { id: 'cf-3', name: 'For Loops', estimatedHours: 1 },
        { id: 'cf-4', name: 'While & Do-While Loops', estimatedHours: 1 },
        { id: 'cf-5', name: 'Break, Continue & Nested Loops', estimatedHours: 2 }
      ]},
      { id: 'functions', name: 'Functions and Procedures', subjectId: 'prog-1', module: 'Programming Basics', difficulty: 'medium', estimatedHours: 8, subtopics: [
        { id: 'fn-1', name: 'Function Definition & Calling', estimatedHours: 1.5 },
        { id: 'fn-2', name: 'Parameters & Arguments', estimatedHours: 1.5 },
        { id: 'fn-3', name: 'Return Values', estimatedHours: 1 },
        { id: 'fn-4', name: 'Recursion', estimatedHours: 2 },
        { id: 'fn-5', name: 'Scope and Lifetime of Variables', estimatedHours: 2 }
      ]},
      // Module 2: Object-Oriented Programming
      { id: 'classes', name: 'Classes and Objects', subjectId: 'prog-1', module: 'Object-Oriented Programming', difficulty: 'medium', estimatedHours: 10, subtopics: [
        { id: 'cls-1', name: 'Defining Classes', estimatedHours: 2 },
        { id: 'cls-2', name: 'Constructors & Destructors', estimatedHours: 2 },
        { id: 'cls-3', name: 'Access Modifiers (public, private, protected)', estimatedHours: 2 },
        { id: 'cls-4', name: 'this Keyword', estimatedHours: 1 },
        { id: 'cls-5', name: 'Static Members', estimatedHours: 1.5 },
        { id: 'cls-6', name: 'Object Instantiation & Memory', estimatedHours: 1.5 }
      ]},
      { id: 'inheritance', name: 'Inheritance', subjectId: 'prog-1', module: 'Object-Oriented Programming', difficulty: 'hard', estimatedHours: 8, subtopics: [
        { id: 'inh-1', name: 'Single Inheritance', estimatedHours: 2 },
        { id: 'inh-2', name: 'Multi-level Inheritance', estimatedHours: 2 },
        { id: 'inh-3', name: 'Method Overriding', estimatedHours: 2 },
        { id: 'inh-4', name: 'Abstract Classes', estimatedHours: 2 }
      ]},
      { id: 'polymorphism', name: 'Polymorphism', subjectId: 'prog-1', module: 'Object-Oriented Programming', difficulty: 'hard', estimatedHours: 6, subtopics: [
        { id: 'poly-1', name: 'Compile-time Polymorphism (Overloading)', estimatedHours: 2 },
        { id: 'poly-2', name: 'Runtime Polymorphism (Virtual Functions)', estimatedHours: 2 },
        { id: 'poly-3', name: 'Interfaces', estimatedHours: 2 }
      ]},
      // Module 3: File Handling & Debugging
      { id: 'file-io', name: 'File Input/Output', subjectId: 'prog-1', module: 'File Handling & Debugging', difficulty: 'medium', estimatedHours: 5, subtopics: [
        { id: 'fio-1', name: 'Reading from Files', estimatedHours: 1.5 },
        { id: 'fio-2', name: 'Writing to Files', estimatedHours: 1.5 },
        { id: 'fio-3', name: 'File Modes & Error Handling', estimatedHours: 2 }
      ]},
      { id: 'debugging', name: 'Debugging Techniques', subjectId: 'prog-1', module: 'File Handling & Debugging', difficulty: 'easy', estimatedHours: 4, subtopics: [
        { id: 'dbg-1', name: 'Using Breakpoints', estimatedHours: 1 },
        { id: 'dbg-2', name: 'Step-through Debugging', estimatedHours: 1 },
        { id: 'dbg-3', name: 'Print/Log Debugging', estimatedHours: 1 },
        { id: 'dbg-4', name: 'Common Runtime Errors', estimatedHours: 1 }
      ]}
    ],
    'ds-1': [
      // Module 1: Array and Linked Lists
      { id: 'arrays', name: 'Arrays and Dynamic Arrays', subjectId: 'ds-1', module: 'Arrays and Linked Lists', difficulty: 'easy', estimatedHours: 6, subtopics: [
        { id: 'arr-1', name: '1D and 2D Arrays', estimatedHours: 1.5 },
        { id: 'arr-2', name: 'Array Traversal & Manipulation', estimatedHours: 1.5 },
        { id: 'arr-3', name: 'Dynamic Arrays (Resizing)', estimatedHours: 1.5 },
        { id: 'arr-4', name: 'Time Complexity of Array Operations', estimatedHours: 1.5 }
      ]},
      { id: 'linked-lists', name: 'Linked Lists', subjectId: 'ds-1', module: 'Arrays and Linked Lists', difficulty: 'medium', estimatedHours: 8, subtopics: [
        { id: 'll-1', name: 'Singly Linked List', estimatedHours: 2 },
        { id: 'll-2', name: 'Doubly Linked List', estimatedHours: 2 },
        { id: 'll-3', name: 'Circular Linked List', estimatedHours: 2 },
        { id: 'll-4', name: 'Linked List vs Array Comparison', estimatedHours: 2 }
      ]},
      // Module 2: Stacks and Queues
      { id: 'stacks', name: 'Stack Implementation and Applications', subjectId: 'ds-1', module: 'Stacks and Queues', difficulty: 'medium', estimatedHours: 6, subtopics: [
        { id: 'stk-1', name: 'Stack using Array', estimatedHours: 1.5 },
        { id: 'stk-2', name: 'Stack using Linked List', estimatedHours: 1.5 },
        { id: 'stk-3', name: 'Infix to Postfix Conversion', estimatedHours: 1.5 },
        { id: 'stk-4', name: 'Balanced Parentheses Problem', estimatedHours: 1.5 }
      ]},
      { id: 'queues', name: 'Queue Implementation and Applications', subjectId: 'ds-1', module: 'Stacks and Queues', difficulty: 'medium', estimatedHours: 6, subtopics: [
        { id: 'q-1', name: 'Linear Queue', estimatedHours: 1.5 },
        { id: 'q-2', name: 'Circular Queue', estimatedHours: 1.5 },
        { id: 'q-3', name: 'Priority Queue', estimatedHours: 1.5 },
        { id: 'q-4', name: 'Deque (Double-ended Queue)', estimatedHours: 1.5 }
      ]},
      // Module 3: Trees and Graphs
      { id: 'binary-trees', name: 'Binary Trees', subjectId: 'ds-1', module: 'Trees and Graphs', difficulty: 'hard', estimatedHours: 10, subtopics: [
        { id: 'bt-1', name: 'Tree Terminology (root, leaf, height, depth)', estimatedHours: 1 },
        { id: 'bt-2', name: 'Binary Tree Traversals (Inorder, Preorder, Postorder)', estimatedHours: 3 },
        { id: 'bt-3', name: 'Binary Search Tree (BST)', estimatedHours: 3 },
        { id: 'bt-4', name: 'AVL Trees (Balanced BST)', estimatedHours: 3 }
      ]},
      { id: 'graphs', name: 'Graph Representation and Traversal', subjectId: 'ds-1', module: 'Trees and Graphs', difficulty: 'hard', estimatedHours: 12, subtopics: [
        { id: 'gr-1', name: 'Adjacency Matrix & Adjacency List', estimatedHours: 2 },
        { id: 'gr-2', name: 'Breadth-First Search (BFS)', estimatedHours: 3 },
        { id: 'gr-3', name: 'Depth-First Search (DFS)', estimatedHours: 3 },
        { id: 'gr-4', name: 'Connected Components', estimatedHours: 2 },
        { id: 'gr-5', name: 'Topological Sort', estimatedHours: 2 }
      ]}
    ],
    'algorithms': [
      // Module 1: Sorting and Searching
      { id: 'sorting', name: 'Sorting Algorithms', subjectId: 'algorithms', module: 'Sorting and Searching', difficulty: 'medium', estimatedHours: 10, subtopics: [
        { id: 'sort-1', name: 'Bubble Sort', estimatedHours: 1.5 },
        { id: 'sort-2', name: 'Selection Sort', estimatedHours: 1.5 },
        { id: 'sort-3', name: 'Insertion Sort', estimatedHours: 1.5 },
        { id: 'sort-4', name: 'Merge Sort', estimatedHours: 2 },
        { id: 'sort-5', name: 'Quick Sort', estimatedHours: 2 },
        { id: 'sort-6', name: 'Time Complexity Comparison', estimatedHours: 1.5 }
      ]},
      { id: 'searching', name: 'Searching Algorithms', subjectId: 'algorithms', module: 'Sorting and Searching', difficulty: 'easy', estimatedHours: 6, subtopics: [
        { id: 'srch-1', name: 'Linear Search', estimatedHours: 1 },
        { id: 'srch-2', name: 'Binary Search', estimatedHours: 2 },
        { id: 'srch-3', name: 'Hashing & Hash Tables', estimatedHours: 3 }
      ]},
      // Module 2: Dynamic Programming
      { id: 'dp-intro', name: 'Introduction to DP', subjectId: 'algorithms', module: 'Dynamic Programming', difficulty: 'hard', estimatedHours: 12, subtopics: [
        { id: 'dp-1', name: 'Memoization vs Tabulation', estimatedHours: 2 },
        { id: 'dp-2', name: 'Fibonacci & Climbing Stairs', estimatedHours: 2 },
        { id: 'dp-3', name: '0/1 Knapsack Problem', estimatedHours: 3 },
        { id: 'dp-4', name: 'Longest Common Subsequence', estimatedHours: 3 },
        { id: 'dp-5', name: 'Coin Change Problem', estimatedHours: 2 }
      ]},
      { id: 'dp-optimization', name: 'DP Optimization Techniques', subjectId: 'algorithms', module: 'Dynamic Programming', difficulty: 'hard', estimatedHours: 15, subtopics: [
        { id: 'dpo-1', name: 'Space Optimization in DP', estimatedHours: 3 },
        { id: 'dpo-2', name: 'Matrix Chain Multiplication', estimatedHours: 4 },
        { id: 'dpo-3', name: 'DP on Trees', estimatedHours: 4 },
        { id: 'dpo-4', name: 'Bitmask DP', estimatedHours: 4 }
      ]},
      // Module 3: Graph Algorithms
      { id: 'shortest-path', name: 'Shortest Path Algorithms', subjectId: 'algorithms', module: 'Graph Algorithms', difficulty: 'hard', estimatedHours: 12, subtopics: [
        { id: 'sp-1', name: 'Dijkstra\'s Algorithm', estimatedHours: 3 },
        { id: 'sp-2', name: 'Bellman-Ford Algorithm', estimatedHours: 3 },
        { id: 'sp-3', name: 'Floyd-Warshall Algorithm', estimatedHours: 3 },
        { id: 'sp-4', name: 'A* Search Algorithm', estimatedHours: 3 }
      ]},
      { id: 'mst', name: 'Minimum Spanning Trees', subjectId: 'algorithms', module: 'Graph Algorithms', difficulty: 'medium', estimatedHours: 8, subtopics: [
        { id: 'mst-1', name: 'Kruskal\'s Algorithm', estimatedHours: 3 },
        { id: 'mst-2', name: 'Prim\'s Algorithm', estimatedHours: 3 },
        { id: 'mst-3', name: 'Union-Find (Disjoint Set)', estimatedHours: 2 }
      ]}
    ],
    'databases': [
      // Module 1: SQL Fundamentals
      { id: 'sql-basics', name: 'SQL Basic Queries', subjectId: 'databases', module: 'SQL Fundamentals', difficulty: 'easy', estimatedHours: 8, subtopics: [
        { id: 'sql-1', name: 'SELECT, FROM, WHERE', estimatedHours: 2 },
        { id: 'sql-2', name: 'ORDER BY & LIMIT', estimatedHours: 1 },
        { id: 'sql-3', name: 'GROUP BY & HAVING', estimatedHours: 2 },
        { id: 'sql-4', name: 'Aggregate Functions (COUNT, SUM, AVG, MAX, MIN)', estimatedHours: 2 },
        { id: 'sql-5', name: 'INSERT, UPDATE, DELETE', estimatedHours: 1 }
      ]},
      { id: 'sql-joins', name: 'Joins and Subqueries', subjectId: 'databases', module: 'SQL Fundamentals', difficulty: 'medium', estimatedHours: 10, subtopics: [
        { id: 'join-1', name: 'INNER JOIN', estimatedHours: 2 },
        { id: 'join-2', name: 'LEFT / RIGHT / FULL OUTER JOIN', estimatedHours: 2 },
        { id: 'join-3', name: 'CROSS JOIN & Self Join', estimatedHours: 2 },
        { id: 'join-4', name: 'Correlated Subqueries', estimatedHours: 2 },
        { id: 'join-5', name: 'EXISTS & IN', estimatedHours: 2 }
      ]},
      // Module 2: Database Design
      { id: 'er-model', name: 'ER Modeling', subjectId: 'databases', module: 'Database Design', difficulty: 'medium', estimatedHours: 8, subtopics: [
        { id: 'er-1', name: 'Entities, Attributes & Relationships', estimatedHours: 2 },
        { id: 'er-2', name: 'Cardinality (1:1, 1:N, M:N)', estimatedHours: 2 },
        { id: 'er-3', name: 'Weak Entities & Participation', estimatedHours: 2 },
        { id: 'er-4', name: 'ER to Relational Schema Mapping', estimatedHours: 2 }
      ]},
      { id: 'normalization', name: 'Normalization', subjectId: 'databases', module: 'Database Design', difficulty: 'hard', estimatedHours: 12, subtopics: [
        { id: 'norm-1', name: '1NF — First Normal Form', estimatedHours: 2 },
        { id: 'norm-2', name: '2NF — Second Normal Form', estimatedHours: 2 },
        { id: 'norm-3', name: '3NF — Third Normal Form', estimatedHours: 2 },
        { id: 'norm-4', name: 'BCNF — Boyce-Codd Normal Form', estimatedHours: 3 },
        { id: 'norm-5', name: 'Functional Dependencies', estimatedHours: 3 }
      ]},
      // Module 3: Transactions
      { id: 'acid', name: 'ACID Properties', subjectId: 'databases', module: 'Transactions', difficulty: 'medium', estimatedHours: 6, subtopics: [
        { id: 'acid-1', name: 'Atomicity', estimatedHours: 1.5 },
        { id: 'acid-2', name: 'Consistency', estimatedHours: 1.5 },
        { id: 'acid-3', name: 'Isolation Levels', estimatedHours: 1.5 },
        { id: 'acid-4', name: 'Durability & Logging', estimatedHours: 1.5 }
      ]},
      { id: 'concurrency', name: 'Concurrency Control', subjectId: 'databases', module: 'Transactions', difficulty: 'hard', estimatedHours: 10, subtopics: [
        { id: 'cc-1', name: 'Lock-based Protocols', estimatedHours: 2.5 },
        { id: 'cc-2', name: 'Two-Phase Locking (2PL)', estimatedHours: 2.5 },
        { id: 'cc-3', name: 'Deadlock Detection & Prevention', estimatedHours: 2.5 },
        { id: 'cc-4', name: 'Timestamp-based Protocols', estimatedHours: 2.5 }
      ]}
    ]
  };
  
  // Collect all topics for the selected subjects
  let allTopics: any[] = [];
  selectedSubjects.forEach(subjectId => {
    const subjectTopics = topicsBySubject[subjectId] || [
      { id: `${subjectId}-topic-1`, name: 'General Topic 1', subjectId, module: 'Introduction', difficulty: 'easy', estimatedHours: 4 },
      { id: `${subjectId}-topic-2`, name: 'General Topic 2', subjectId, module: 'Advanced', difficulty: 'medium', estimatedHours: 6 }
    ];
    allTopics = allTopics.concat(subjectTopics);
  });
  
  res.json({
    topics: allTopics,
    meta: { 
      message: `Topics for subjects: ${selectedSubjects.join(', ')}`, 
      selectedSubjects,
      totalTopics: allTopics.length
    }
  });
});

// YouTube API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Validate YouTube API key is set
if (!YOUTUBE_API_KEY) {
  console.error('ERROR: YOUTUBE_API_KEY environment variable is not set. Video search will not work.');
}

// Video search cache (in-memory for now, can be moved to DB)
const videoCache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
const VIDEO_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

function getCacheKey(topics: string[], preferences: any, examContext: any): string {
  // Include exam context in cache key so different courses/semesters get different results
  const contextKey = examContext 
    ? `${examContext.level || ''}-${examContext.semester || ''}-${examContext.course || ''}`
    : '';
  return `${topics.sort().join(',')}-${preferences?.sourceType || 'mixed'}-${preferences?.sortBy || 'relevance'}-${preferences?.includeOneShot || false}-${contextKey}`;
}

// Helper to parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// Helper to format duration
function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// YouTube video search endpoint
app.post('/api/videos/search', async (req, res) => {
  try {
    const { topics, preferences, examContext } = req.body;
    
    if (!topics || topics.length === 0) {
      return res.status(400).json({
        error: 'No topics provided',
        message: 'Please provide at least one topic to search for videos'
      });
    }

    const cacheKey = getCacheKey(topics.map((t: any) => t.id), preferences, examContext);
    
    // Check cache
    const cached = videoCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`[YouTube] Cache hit for: ${cacheKey}`);
      return res.json({
        ...cached.data,
        meta: { ...cached.data.meta, cacheHit: true }
      });
    }

    // Flatten topics and subtopics into searchable items
    interface SearchItem {
      id: string;
      name: string;
      parentTopicId: string;
      parentTopicName: string;
      module?: string;
      isSubtopic: boolean;
    }
    
    const searchItems: SearchItem[] = [];
    
    for (const topic of topics) {
      // If topic has subtopics, search for each subtopic
      if (topic.subtopics && topic.subtopics.length > 0) {
        for (const subtopic of topic.subtopics) {
          searchItems.push({
            id: subtopic.id,
            name: subtopic.name,
            parentTopicId: topic.id,
            parentTopicName: topic.name,
            module: topic.module,
            isSubtopic: true
          });
        }
      } else {
        // No subtopics, search for the topic itself
        searchItems.push({
          id: topic.id,
          name: topic.name,
          parentTopicId: topic.id,
          parentTopicName: topic.name,
          module: topic.module,
          isSubtopic: false
        });
      }
    }

    console.log(`[YouTube] Searching videos for ${searchItems.length} items (from ${topics.length} topics)`);

    // Determine sort order for YouTube API
    const orderMap: { [key: string]: string } = {
      'relevance': 'relevance',
      'views': 'viewCount',
      'rating': 'rating',
      'date': 'date'
    };
    const order = orderMap[preferences?.sortBy] || 'relevance';
    
    // How many videos to fetch per item
    const videosPerItem = preferences?.includeOneShot ? 3 : 5;

    // Build search queries for each item
    const allVideos: any[] = [];
    const errors: string[] = [];

    for (const item of searchItems) {
      try {
        // Build highly specific search query to avoid irrelevant results
        const queryParts: string[] = [];
        
        // 1. Add level context (engineering, bsc, etc.) - most important for filtering
        if (examContext?.level) {
          queryParts.push(examContext.level);
        } else if (examContext?.course) {
          // Use course name if no level detected
          queryParts.push(examContext.course);
        }
        
        // 2. Add semester context if available (helps distinguish M1 vs M3)
        if (examContext?.semester) {
          // Clean semester name - extract just the number or name
          const semesterName = examContext.semester;
          if (semesterName.toLowerCase().includes('1') || semesterName.toLowerCase().includes('first')) {
            queryParts.push('first year');
          } else if (semesterName.toLowerCase().includes('2') || semesterName.toLowerCase().includes('second')) {
            queryParts.push('second year');
          } else if (semesterName.toLowerCase().includes('3') || semesterName.toLowerCase().includes('third')) {
            queryParts.push('third year');
          } else if (semesterName.toLowerCase().includes('4') || semesterName.toLowerCase().includes('fourth')) {
            queryParts.push('fourth year');
          }
        }
        
        // 3. Add subject name for context (use first subject if multiple)
        if (examContext?.subjects && examContext.subjects.length > 0) {
          queryParts.push(examContext.subjects[0]);
        }
        
        // 4. Add the main topic/subtopic being searched
        if (item.isSubtopic) {
          // For subtopics, include parent topic for context
          queryParts.push(`${item.parentTopicName} ${item.name}`);
        } else {
          queryParts.push(item.name);
        }
        
        // 5. Add lecture/tutorial keywords based on preferences
        if (preferences?.includeOneShot) {
          queryParts.push('one shot lecture complete');
        } else {
          queryParts.push('lecture tutorial');
        }
        
        // 6. Add negative keywords to exclude irrelevant content
        // These will be used in the query to improve relevance
        const negativeKeywords: string[] = [];
        if (examContext?.level === 'engineering') {
          negativeKeywords.push('-board exam', '-class 10', '-class 12', '-CBSE', '-ICSE');
        }
        
        // Build final search query
        let searchQuery = queryParts.join(' ');
        
        console.log(`[YouTube] Built query: "${searchQuery}" (level: ${examContext?.level}, semester: ${examContext?.semester})`)
        
        // For single playlist mode, search for playlists
        const searchType = preferences?.sourceType === 'single-playlist' ? 'playlist' : 'video';

        // Search YouTube
        const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`);
        searchUrl.searchParams.set('part', 'snippet');
        searchUrl.searchParams.set('q', searchQuery);
        searchUrl.searchParams.set('type', searchType);
        searchUrl.searchParams.set('maxResults', videosPerItem.toString());
        searchUrl.searchParams.set('order', order);
        
        // Video duration filter (only for video type)
        if (searchType === 'video') {
          if (preferences?.includeOneShot) {
            searchUrl.searchParams.set('videoDuration', 'long');
          } else {
            searchUrl.searchParams.set('videoDuration', 'medium');
          }
        }
        
        searchUrl.searchParams.set('relevanceLanguage', preferences?.preferredLanguage || 'en');
        searchUrl.searchParams.set('key', YOUTUBE_API_KEY);

        console.log(`[YouTube] Searching: "${searchQuery}" (${searchType})`);
        
        const searchResponse = await fetch(searchUrl.toString());
        const searchData = await searchResponse.json() as {
          error?: { message: string };
          items?: Array<{
            id: { videoId?: string; playlistId?: string };
            snippet: {
              title: string;
              channelTitle: string;
              channelId: string;
              publishedAt?: string;
              thumbnails?: {
                medium?: { url: string };
                default?: { url: string };
              };
            };
          }>;
        };

        if (searchData.error) {
          console.error(`[YouTube] Search error for "${item.name}":`, searchData.error.message);
          errors.push(`Search failed for ${item.name}: ${searchData.error.message}`);
          continue;
        }

        if (!searchData.items || searchData.items.length === 0) {
          console.log(`[YouTube] No results for: "${item.name}"`);
          continue;
        }

        // For videos, get detailed stats
        if (searchType === 'video') {
          const videoIds = searchData.items.map((item) => item.id.videoId).filter(Boolean).join(',');
          const detailsUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
          detailsUrl.searchParams.set('part', 'contentDetails,statistics');
          detailsUrl.searchParams.set('id', videoIds);
          detailsUrl.searchParams.set('key', YOUTUBE_API_KEY);

          const detailsResponse = await fetch(detailsUrl.toString());
          const detailsData = await detailsResponse.json() as {
            items?: Array<{
              id: string;
              contentDetails?: { duration: string };
              statistics?: { viewCount?: string; likeCount?: string };
            }>;
          };

          const detailsMap = new Map();
          if (detailsData.items) {
            detailsData.items.forEach((detailItem) => {
              detailsMap.set(detailItem.id, {
                duration: detailItem.contentDetails?.duration,
                viewCount: parseInt(detailItem.statistics?.viewCount || '0', 10),
                likeCount: parseInt(detailItem.statistics?.likeCount || '0', 10)
              });
            });
          }

          // Map results to our format
          for (const videoItem of searchData.items) {
            const videoId = videoItem.id.videoId;
            if (!videoId) continue;
            
            const details = detailsMap.get(videoId) || {};
            const durationSeconds = parseDuration(details.duration || 'PT0S');
            
            allVideos.push({
              id: videoId,
              title: videoItem.snippet.title,
              channelName: videoItem.snippet.channelTitle,
              channelId: videoItem.snippet.channelId,
              thumbnail: videoItem.snippet.thumbnails?.medium?.url || videoItem.snippet.thumbnails?.default?.url,
              duration: formatDuration(durationSeconds),
              durationSeconds,
              viewCount: details.viewCount || 0,
              likeCount: details.likeCount || 0,
              publishedAt: videoItem.snippet.publishedAt,
              topicId: item.parentTopicId,
              topicName: item.parentTopicName,
              subtopicId: item.isSubtopic ? item.id : undefined,
              subtopicName: item.isSubtopic ? item.name : undefined,
              module: item.module,
              isOneShot: durationSeconds > 3600,
            });
          }
        } else {
          // Playlist results - fetch playlist items to get video details
          for (const playlistItem of searchData.items) {
            const playlistId = playlistItem.id.playlistId;
            if (!playlistId) continue;
            
            // Fetch first few videos from the playlist
            const playlistItemsUrl = new URL(`${YOUTUBE_API_BASE}/playlistItems`);
            playlistItemsUrl.searchParams.set('part', 'snippet');
            playlistItemsUrl.searchParams.set('playlistId', playlistId);
            playlistItemsUrl.searchParams.set('maxResults', '10');
            playlistItemsUrl.searchParams.set('key', YOUTUBE_API_KEY);
            
            const playlistResponse = await fetch(playlistItemsUrl.toString());
            const playlistData = await playlistResponse.json() as {
              items?: Array<{
                snippet: {
                  title: string;
                  channelTitle: string;
                  channelId: string;
                  publishedAt?: string;
                  thumbnails?: { medium?: { url: string }; default?: { url: string } };
                  resourceId?: { videoId?: string };
                };
              }>;
            };
            
            if (playlistData.items) {
              const videoIds = playlistData.items
                .map(pi => pi.snippet.resourceId?.videoId)
                .filter(Boolean)
                .join(',');
              
              // Get video details
              const detailsUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
              detailsUrl.searchParams.set('part', 'contentDetails,statistics');
              detailsUrl.searchParams.set('id', videoIds);
              detailsUrl.searchParams.set('key', YOUTUBE_API_KEY);
              
              const detailsResponse = await fetch(detailsUrl.toString());
              const detailsData = await detailsResponse.json() as {
                items?: Array<{
                  id: string;
                  contentDetails?: { duration: string };
                  statistics?: { viewCount?: string; likeCount?: string };
                }>;
              };
              
              const detailsMap = new Map();
              if (detailsData.items) {
                detailsData.items.forEach((d) => {
                  detailsMap.set(d.id, {
                    duration: d.contentDetails?.duration,
                    viewCount: parseInt(d.statistics?.viewCount || '0', 10),
                    likeCount: parseInt(d.statistics?.likeCount || '0', 10)
                  });
                });
              }
              
              for (const pi of playlistData.items) {
                const videoId = pi.snippet.resourceId?.videoId;
                if (!videoId) continue;
                
                const details = detailsMap.get(videoId) || {};
                const durationSeconds = parseDuration(details.duration || 'PT0S');
                
                allVideos.push({
                  id: videoId,
                  title: pi.snippet.title,
                  channelName: pi.snippet.channelTitle,
                  channelId: pi.snippet.channelId,
                  thumbnail: pi.snippet.thumbnails?.medium?.url || pi.snippet.thumbnails?.default?.url,
                  duration: formatDuration(durationSeconds),
                  durationSeconds,
                  viewCount: details.viewCount || 0,
                  likeCount: details.likeCount || 0,
                  publishedAt: pi.snippet.publishedAt,
                  topicId: item.parentTopicId,
                  topicName: item.parentTopicName,
                  subtopicId: item.isSubtopic ? item.id : undefined,
                  subtopicName: item.isSubtopic ? item.name : undefined,
                  module: item.module,
                  playlistId,
                  playlistTitle: playlistItem.snippet.title,
                  isOneShot: durationSeconds > 3600,
                });
              }
            }
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (itemError) {
        console.error(`[YouTube] Error fetching for ${item.name}:`, itemError);
        errors.push(`Error for ${item.name}: ${itemError instanceof Error ? itemError.message : 'Unknown error'}`);
      }
    }

    // Remove duplicate videos (same video from different searches)
    const uniqueVideos = allVideos.filter((video, index, self) =>
      index === self.findIndex((v) => v.id === video.id)
    );

    // Sort final results based on preference
    if (preferences?.sortBy === 'views') {
      uniqueVideos.sort((a, b) => b.viewCount - a.viewCount);
    } else if (preferences?.sortBy === 'date') {
      uniqueVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    // Calculate total study time
    const totalDurationSeconds = uniqueVideos.reduce((sum, v) => sum + v.durationSeconds, 0);
    const totalHours = Math.round(totalDurationSeconds / 3600 * 10) / 10;

    // If single-playlist mode, group by playlists
    let playlists: any[] | undefined = undefined;
    if (preferences?.sourceType === 'single-playlist') {
      const playlistMap = new Map<string, any>();
      
      for (const video of uniqueVideos) {
        if (!video.playlistId) continue;
        
        if (!playlistMap.has(video.playlistId)) {
          playlistMap.set(video.playlistId, {
            id: video.playlistId,
            title: video.playlistTitle || 'Untitled Playlist',
            channelName: video.channelName,
            channelId: video.channelId,
            topicId: video.topicId,
            topicName: video.topicName,
            subtopicId: video.subtopicId,
            subtopicName: video.subtopicName,
            videoCount: 0,
            totalDuration: 0,
            totalDurationFormatted: '',
            videos: []
          });
        }
        
        const playlist = playlistMap.get(video.playlistId);
        playlist.videos.push(video);
        playlist.videoCount++;
        playlist.totalDuration += video.durationSeconds;
      }
      
      // Format durations and convert to array
      playlists = Array.from(playlistMap.values()).map(p => ({
        ...p,
        totalDurationFormatted: formatDuration(p.totalDuration)
      }));
    }

    const result = {
      videos: uniqueVideos,
      playlists, // Only populated in single-playlist mode
      meta: {
        cacheHit: false,
        totalVideos: uniqueVideos.length,
        totalPlaylists: playlists?.length || 0,
        totalDurationSeconds,
        totalHours,
        topicsSearched: topics.length,
        subtopicsSearched: searchItems.filter(s => s.isSubtopic).length,
        errors: errors.length > 0 ? errors : undefined,
        preferences
      }
    };

    // Cache the result
    videoCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
      ttl: VIDEO_CACHE_TTL
    });

    res.json(result);
  } catch (error) {
    console.error('[YouTube] Search error:', error);
    res.status(500).json({
      error: 'Video search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get cached video searches (for showing to other users with same filters)
app.get('/api/videos/cached', async (req, res) => {
  const { topicIds, sourceType, sortBy, includeOneShot, level, semester, course } = req.query;
  
  if (!topicIds) {
    return res.json({ videos: [], meta: { cacheHit: false, message: 'No topics provided' } });
  }

  const topics = (topicIds as string).split(',').sort();
  const examContext = { level, semester, course };
  const cacheKey = getCacheKey(topics, { sourceType, sortBy, includeOneShot: includeOneShot === 'true' }, examContext);
  
  const cached = videoCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return res.json({
      ...cached.data,
      meta: { ...cached.data.meta, cacheHit: true }
    });
  }

  res.json({ videos: [], meta: { cacheHit: false, message: 'No cached results found' } });
});

// Additional university search endpoint (alternative format)
app.get('/api/exam/universities/search', async (req, res) => {
  try {
    const search = req.query.q as string || req.query.search as string;
    
    // Add debug headers
    res.header('X-Debug-Search', search || 'empty');
    res.header('X-Debug-Timestamp', new Date().toISOString());
    
    // Handle empty or missing search gracefully
    if (!search || typeof search !== 'string' || search.trim().length === 0) {
      return res.json({
        universities: [],
        meta: {
          cacheHit: false,
          latencyMs: 0,
          message: 'Empty search query - provide a search term to get results',
          debug: 'no-search-term'
        },
      });
    }
    
    console.log(`[DEBUG] University search (alt endpoint) for: "${search}"`);
    
    const provider = new HipolabsProvider();
    const results = await provider.search(search.trim());
    
    console.log(`[DEBUG] Found ${results.length} universities for "${search}"`);
    
    res.json({
      universities: results.slice(0, 20),
      meta: {
        cacheHit: false,
        latencyMs: Date.now(),
        searchTerm: search.trim(),
        resultCount: results.length
      },
    });
  } catch (error) {
    console.error('University search error:', error);
    res.status(500).json({
      error: 'Search Failed',
      message: 'Failed to search universities',
      debug: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test endpoint to verify frontend connectivity
app.get('/test/connectivity', (req, res) => {
  res.json({
    message: 'Backend is reachable from frontend',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']
  });
});

// Simple university suggestions endpoint for easier frontend integration
app.get('/api/universities/suggest', async (req, res) => {
  try {
    const q = req.query.q as string;
    
    // Add debug headers
    res.header('X-Debug-Query', q || 'empty');
    res.header('X-Debug-Timestamp', new Date().toISOString());
    
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.json({
        suggestions: [],
        query: '',
        count: 0
      });
    }
    
    console.log(`[DEBUG] University suggestions for: "${q}"`);
    
    const provider = new HipolabsProvider();
    const results = await provider.search(q.trim());
    
    // Simplified response format for autocomplete
    const suggestions = results.slice(0, 10).map(uni => ({
      id: uni.domain || uni.name.toLowerCase().replace(/\s+/g, '-'),
      name: uni.name,
      country: uni.country,
      domain: uni.domain
    }));
    
    console.log(`[DEBUG] Returning ${suggestions.length} suggestions for "${q}"`);
    
    res.json({
      suggestions,
      query: q.trim(),
      count: suggestions.length
    });
  } catch (error) {
    console.error('University suggestions error:', error);
    res.status(500).json({
      suggestions: [],
      query: '',
      count: 0,
      error: 'Failed to fetch suggestions'
    });
  }
});

// Clerk authentication middleware
// This makes req.auth available on all routes
app.use(clerkMiddleware());

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/universities', universityRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to PostgreSQL
    await connectDatabase();
    console.log('✓ PostgreSQL connected');

    // Initialize Redis (optional)
    if (config.redisUrl) {
      await cacheService.initializeRedis();
      console.log('✓ Redis connected');
    } else {
      console.log('○ Redis not configured (using L2 cache only)');
    }

    // Register background jobs (stubs)
    registerAllJobs();
    console.log('✓ Background jobs registered');

    // Start Express server
    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║           Chad-Tutor Backend Started              ║
╠═══════════════════════════════════════════════════╣
║  Environment: ${config.nodeEnv.padEnd(35)}║
║  Port: ${config.port.toString().padEnd(42)}║
║  Database: PostgreSQL                             ║
║  Cache: ${config.redisUrl ? 'Redis + PostgreSQL' : 'PostgreSQL (L2 only)'}${''.padEnd(config.redisUrl ? 21 : 12)}║
║  Frontend: ${config.frontendUrl.padEnd(38)}║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down gracefully...`);
  
  try {
    await cacheService.closeRedis();
    await disconnectDatabase();
    console.log('✓ All connections closed');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

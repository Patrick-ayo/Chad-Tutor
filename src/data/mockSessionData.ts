import type { 
  VideoMetadata, 
  ConceptTags, 
  ExampleProblem, 
  Bookmark, 
  UserNote 
} from '@/types/session';

// Mock Video Data
export const mockVideoData: VideoMetadata = {
  videoId: 'dQw4w9WgXcQ',
  title: 'Understanding Binary Search Trees',
  duration: 1680,
  chapters: [
    { title: 'Introduction to BSTs', startTime: 0, endTime: 180 },
    { title: 'Tree Structure Properties', startTime: 180, endTime: 420 },
    { title: 'Insert Operations', startTime: 420, endTime: 720 },
    { title: 'Search Operations', startTime: 720, endTime: 960 },
    { title: 'Delete Operations', startTime: 960, endTime: 1320 },
    { title: 'Time Complexity Analysis', startTime: 1320, endTime: 1680 }
  ],
  keyTakeaways: [
    'BST maintains sorted order',
    'Average O(log n) operations',
    'Self-balancing prevents degradation',
    'In-order traversal gives sorted sequence'
  ],
  transcript: 'Welcome to this comprehensive guide on Binary Search Trees...'
};

// Mock Concept Tags
export const mockConceptTags: ConceptTags = {
  topic: 'Binary Search Trees',
  category: 'Data Structures',
  concepts: [
    'Tree Properties',
    'Node Structure',
    'Recursive Operations',
    'Binary Search Property',
    'Tree Traversal',
    'Time Complexity'
  ],
  complexity: 'O(log n)',
  prerequisites: ['Binary Trees', 'Recursion', 'Big O Notation']
};

// Mock Structured Notes Content
export const mockNotesContent = `
<div class="concept-notes">
  <h2>Binary Search Tree Fundamentals</h2>
  
  <h3>Core Properties</h3>
  <ul>
    <li><strong>Left Subtree Rule:</strong> All nodes in the left subtree have values less than the parent</li>
    <li><strong>Right Subtree Rule:</strong> All nodes in the right subtree have values greater than the parent</li>
    <li><strong>Recursive Structure:</strong> Every subtree is also a valid BST</li>
  </ul>
  
  <h3>Key Operations</h3>
  <div class="operation-grid">
    <div class="operation">
      <h4>Insert</h4>
      <p>Compare with current node, go left if smaller, right if larger. Insert at empty position.</p>
      <code>insert(value) { /* recursive implementation */ }</code>
    </div>
    
    <div class="operation">
      <h4>Search</h4>
      <p>Compare with current node, eliminate half of the search space each step.</p>
      <code>search(value) { /* O(log n) average case */ }</code>
    </div>
    
    <div class="operation">
      <h4>Delete</h4>
      <p>Three cases: leaf node, one child, two children (find inorder successor).</p>
      <code>delete(value) { /* handle all cases */ }</code>
    </div>
  </div>
  
  <h3>Time Complexity Analysis</h3>
  <table>
    <tr><th>Operation</th><th>Average Case</th><th>Worst Case</th></tr>
    <tr><td>Insert</td><td>O(log n)</td><td>O(n)</td></tr>
    <tr><td>Search</td><td>O(log n)</td><td>O(n)</td></tr>
    <tr><td>Delete</td><td>O(log n)</td><td>O(n)</td></tr>
  </table>
  
  <div class="important-note">
    <h4>Warning: Degenerate Case</h4>
    <p>When insertions happen in sorted order, the BST becomes a linked list, degrading performance to O(n). This is why self-balancing trees (AVL, Red-Black) are often preferred.</p>
  </div>
</div>
`;

// Mock Example Problems
export const mockExampleProblems: ExampleProblem[] = [
  {
    id: 'bst-insert-1',
    title: 'Insert into BST',
    difficulty: 'easy',
    description: 'Given a binary search tree and a value, insert the value into the BST and return the root.',
    codeTemplate: `class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function insertIntoBST(root, val) {
  // Your code here
}`,
    stepByStepSolution: [
      {
        step: 1,
        title: 'Handle Base Case',
        explanation: 'If the tree is empty (root is null), create a new node with the given value.',
        code: `if (!root) {
  return new TreeNode(val);
}`
      },
      {
        step: 2,
        title: 'Compare Values',
        explanation: 'Compare the value to insert with the current node value to decide direction.',
        code: `if (val < root.val) {
  // Go left
} else {
  // Go right  
}`
      },
      {
        step: 3,
        title: 'Recursive Insert',
        explanation: 'Recursively insert into the appropriate subtree.',
        code: `if (val < root.val) {
  root.left = insertIntoBST(root.left, val);
} else {
  root.right = insertIntoBST(root.right, val);
}`
      },
      {
        step: 4,
        title: 'Return Root',
        explanation: 'Return the root node to maintain the tree structure.',
        code: `return root;`
      }
    ],
    fullSolution: `function insertIntoBST(root, val) {
  if (!root) {
    return new TreeNode(val);
  }
  
  if (val < root.val) {
    root.left = insertIntoBST(root.left, val);
  } else {
    root.right = insertIntoBST(root.right, val);
  }
  
  return root;
}`,
    timeComplexity: 'O(log n) average, O(n) worst case',
    spaceComplexity: 'O(log n) average due to recursion stack',
    isBookmarked: false,
    hasNarration: true
  },
  {
    id: 'bst-search-1',
    title: 'Search in BST',
    difficulty: 'easy',
    description: 'Given a binary search tree and a target value, return the node containing the target value, or null if not found.',
    codeTemplate: `function searchBST(root, val) {
  // Your code here
}`,
    stepByStepSolution: [
      {
        step: 1,
        title: 'Handle Base Cases',
        explanation: 'Check if we have reached a null node (value not found) or found the target.',
        code: `if (!root || root.val === val) {
  return root;
}`
      },
      {
        step: 2,
        title: 'Choose Search Direction',
        explanation: 'Use BST property to eliminate half the search space.',
        code: `if (val < root.val) {
  return searchBST(root.left, val);
} else {
  return searchBST(root.right, val);
}`
      }
    ],
    fullSolution: `function searchBST(root, val) {
  if (!root || root.val === val) {
    return root;
  }
  
  if (val < root.val) {
    return searchBST(root.left, val);
  } else {
    return searchBST(root.right, val);
  }
}`,
    timeComplexity: 'O(log n) average, O(n) worst case',
    spaceComplexity: 'O(log n) average due to recursion stack',
    isBookmarked: true,
    hasNarration: false
  },
  {
    id: 'bst-validate-1',
    title: 'Validate Binary Search Tree',
    difficulty: 'medium',
    description: 'Given the root of a binary tree, determine if it is a valid binary search tree.',
    codeTemplate: `function isValidBST(root) {
  // Your code here
}`,
    stepByStepSolution: [
      {
        step: 1,
        title: 'Define Helper Function',
        explanation: 'Create a helper function that tracks min and max bounds for valid values.',
        code: `function validate(node, min, max) {
  // Helper logic here
}`
      },
      {
        step: 2,
        title: 'Base Case',
        explanation: 'Empty trees are valid BSTs.',
        code: `if (!node) return true;`
      },
      {
        step: 3,
        title: 'Check Bounds',
        explanation: 'Ensure current node value is within the allowed range.',
        code: `if (node.val <= min || node.val >= max) {
  return false;
}`
      },
      {
        step: 4,
        title: 'Recursive Validation',
        explanation: 'Validate both subtrees with updated bounds.',
        code: `return validate(node.left, min, node.val) && 
       validate(node.right, node.val, max);`
      }
    ],
    fullSolution: `function isValidBST(root) {
  function validate(node, min, max) {
    if (!node) return true;
    
    if (node.val <= min || node.val >= max) {
      return false;
    }
    
    return validate(node.left, min, node.val) && 
           validate(node.right, node.val, max);
  }
  
  return validate(root, -Infinity, Infinity);
}`,
    timeComplexity: 'O(n) - visit each node once',
    spaceComplexity: 'O(n) - recursion stack in worst case',
    isBookmarked: false,
    hasNarration: true
  }
];

// Mock Practice Questions
export const mockPracticeQuestions = [
  {
    id: 'bst-q1',
    question: 'What is the main property that distinguishes a Binary Search Tree from a regular Binary Tree?',
    options: [
      'BSTs can only have two children per node',
      'BSTs maintain a specific ordering: left subtree < root < right subtree',
      'BSTs are always perfectly balanced',
      'BSTs can only store integer values'
    ],
    correctAnswer: 1,
    explanation: 'The key property of a BST is the ordering constraint: for any node, all values in the left subtree are smaller, and all values in the right subtree are larger.',
    hint: 'Think about what makes searching efficient in a BST.'
  },
  {
    id: 'bst-q2',
    question: 'What is the average time complexity for search operations in a balanced BST?',
    options: [
      'O(1)',
      'O(log n)',
      'O(n)',
      'O(n log n)'
    ],
    correctAnswer: 1,
    explanation: 'In a balanced BST, we eliminate roughly half the remaining nodes at each step, leading to O(log n) average time complexity for search, insert, and delete operations.',
    hint: 'Consider how many nodes you eliminate at each comparison.'
  },
  {
    id: 'bst-q3',
    question: 'When deleting a node with two children from a BST, which strategy is commonly used?',
    options: [
      'Replace with the leftmost node in the left subtree',
      'Replace with the rightmost node in the right subtree',
      'Replace with either the inorder predecessor or inorder successor',
      'Remove the entire subtree'
    ],
    correctAnswer: 2,
    explanation: 'When deleting a node with two children, we replace it with either its inorder predecessor (rightmost node in left subtree) or inorder successor (leftmost node in right subtree) to maintain the BST property.',
    hint: 'The replacement must maintain the BST ordering property.'
  }
];

// Mock Test Questions
export const mockTestQuestions = [
  {
    id: 'test-bst-1',
    question: 'Which traversal of a BST visits nodes in sorted order?',
    options: [
      'Pre-order traversal',
      'In-order traversal',
      'Post-order traversal',
      'Level-order traversal'
    ],
    correctAnswer: 1,
    explanation: 'In-order traversal visits left subtree, then root, then right subtree. Due to the BST property, this produces nodes in sorted ascending order.'
  },
  {
    id: 'test-bst-2',
    question: 'What happens to BST performance when elements are inserted in sorted order?',
    options: [
      'Performance improves to O(1)',
      'Performance remains O(log n)',
      'Performance degrades to O(n)',
      'The tree becomes automatically balanced'
    ],
    correctAnswer: 2,
    explanation: 'Inserting in sorted order creates a degenerate tree (essentially a linked list), causing all operations to become O(n).'
  },
  {
    id: 'test-bst-3',
    question: 'In a BST with n nodes, what is the maximum height in the worst case?',
    options: [
      'log n',
      'n/2',
      'n-1',
      'n'
    ],
    correctAnswer: 2,
    explanation: 'In the worst case (degenerate tree), the height is n-1, where each node has only one child.'
  },
  {
    id: 'test-bst-4',
    question: 'Which of these operations cannot be efficiently performed on a standard BST?',
    options: [
      'Finding the minimum element',
      'Finding the maximum element',
      'Finding the kth smallest element',
      'Finding all elements within a range'
    ],
    correctAnswer: 2,
    explanation: 'Finding the kth smallest element requires O(n) time in a standard BST. An augmented BST with size information can do it in O(log n).'
  },
  {
    id: 'test-bst-5',
    question: 'What is the space complexity of the recursive BST search algorithm?',
    options: [
      'O(1)',
      'O(log n) average case',
      'O(n) worst case',
      'Both B and C are correct'
    ],
    correctAnswer: 3,
    explanation: 'The recursive search uses O(log n) space on average for the call stack, but O(n) in the worst case (degenerate tree).'
  }
];

// Mock AI Summary Data
export const mockAISummary = {
  topic: 'Binary Search Trees',
  summary: 'Binary Search Trees (BSTs) are hierarchical data structures that maintain elements in sorted order, enabling efficient search, insertion, and deletion operations. The fundamental property is that for any node, all values in the left subtree are smaller and all values in the right subtree are larger. This ordering allows us to eliminate half of the search space at each step, achieving O(log n) average time complexity for basic operations. However, BSTs can degrade to O(n) performance when elements are inserted in sorted order, creating an unbalanced tree that resembles a linked list.',
  keyInsights: [
    'BSTs leverage the binary search principle, eliminating half the search space at each comparison, making them much faster than linear search for large datasets.',
    'The tree structure automatically maintains sorted order, making in-order traversal produce elements in ascending sequence without additional sorting.',
    'Deletion with two children requires careful handling using inorder successor/predecessor to preserve the BST property while maintaining tree connectivity.',
    'Self-balancing variants like AVL and Red-Black trees solve the degenerate case problem by maintaining logarithmic height through rotations.'
  ],
  analogies: [
    'Think of a BST like a phone book where you open to the middle, compare the name you are looking for, then eliminate half the remaining pages and repeat.',
    'It is similar to the "20 Questions" game where each question eliminates roughly half of the remaining possibilities.',
    'Like a decision tree where each node represents a yes/no question, and the path to your answer gets shorter with each decision.'
  ]
};

// Mock Bookmarks - matching the Bookmark type from session.ts
export const mockBookmarks: Bookmark[] = [
  {
    id: 'bookmark-1',
    type: 'video-timestamp',
    content: 'Clear explanation of how insertion maintains the BST property by comparing values and choosing the correct subtree.',
    topicRef: 'bst-insert',
    sourceVideoRef: 'dQw4w9WgXcQ',
    timestamp: 420,
    createdAt: '2024-01-15T10:30:00Z',
    tags: ['insertion', 'algorithm', 'tutorial']
  },
  {
    id: 'bookmark-2',
    type: 'note',
    content: 'Important concept about how BSTs degrade to O(n) when elements are inserted in sorted order, resembling a linked list.',
    topicRef: 'bst-complexity',
    createdAt: '2024-01-15T11:15:00Z',
    tags: ['complexity', 'performance', 'worst-case']
  },
  {
    id: 'bookmark-3',
    type: 'example',
    content: 'Step-by-step solution for the most complex delete case, using inorder successor replacement.',
    topicRef: 'bst-delete',
    createdAt: '2024-01-15T14:20:00Z',
    tags: ['deletion', 'algorithm', 'complex-case']
  },
  {
    id: 'bookmark-4',
    type: 'note',
    content: 'Interactive tool for visualizing BST operations and understanding tree transformations.',
    topicRef: 'bst-visualization',
    createdAt: '2024-01-15T16:45:00Z',
    tags: ['visualization', 'interactive', 'tool']
  }
];

// Mock User Notes - matching the UserNote type from session.ts
export const mockUserNotes: UserNote[] = [
  {
    id: 'note-1',
    content: `Remember the three main properties:
1. Left subtree values < parent value
2. Right subtree values > parent value  
3. Both subtrees are also BSTs (recursive property)

This is what enables the efficient O(log n) search!`,
    createdAt: '2024-01-15T09:15:00Z',
    lastModified: '2024-01-15T09:15:00Z'
  },
  {
    id: 'note-2',
    content: `Three cases for BST deletion:

Case 1: Leaf node - Simply remove the node

Case 2: One child - Replace node with its child

Case 3: Two children - Find inorder successor (leftmost in right subtree), replace node value with successor value, delete the successor node

Most complex but maintains BST property!`,
    createdAt: '2024-01-15T13:30:00Z',
    lastModified: '2024-01-15T15:45:00Z'
  },
  {
    id: 'note-3',
    content: `When to Use BSTs vs Other Structures:

Use BSTs when you need:
- Fast searches (O(log n) vs O(n) for arrays)
- Maintain sorted order automatically
- Dynamic insertions/deletions
- Range queries

Avoid BSTs when:
- Data comes pre-sorted (use AVL/Red-Black instead)
- Need constant-time access (use hash tables)
- Memory is very constrained (arrays might be better)

Rule of thumb: BSTs shine when you have mixed read/write workloads with sorted data needs.`,
    createdAt: '2024-01-15T17:20:00Z',
    lastModified: '2024-01-15T17:30:00Z'
  }
];

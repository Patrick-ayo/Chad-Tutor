import type { SessionTask, TaskContent, Question } from "@/types/session";

// Mock session data for different task types

export const mockSessionTasks: Record<string, SessionTask> = {
  "task-1": {
    id: "task-1",
    name: "Array Operations & Time Complexity",
    goalName: "Master DSA for FAANG Interviews",
    topicName: "Arrays & Strings",
    estimatedMinutes: 45,
    difficulty: "medium",
    scheduleReason: "Scheduled for today - prerequisite for linked lists",
  },
  "task-2": {
    id: "task-2",
    name: "Two Pointer Technique",
    goalName: "Master DSA for FAANG Interviews",
    topicName: "Arrays & Strings",
    estimatedMinutes: 30,
    difficulty: "easy",
  },
  "task-3": {
    id: "task-3",
    name: "Binary Search Variations",
    goalName: "Master DSA for FAANG Interviews",
    topicName: "Searching Algorithms",
    estimatedMinutes: 60,
    difficulty: "hard",
    scheduleReason: "Revision due - last practiced 7 days ago",
  },
};

export const mockTaskContent: Record<string, TaskContent[]> = {
  "task-1": [
    {
      id: "content-1",
      type: "text",
      title: "Concept Overview",
      content: `
        <h2>Understanding Arrays</h2>
        <p>An <strong>array</strong> is a fundamental data structure that stores elements in contiguous memory locations. This property gives arrays their key characteristics:</p>
        
        <h3>Key Properties</h3>
        <ul>
          <li><strong>Random Access:</strong> Access any element in O(1) time using its index</li>
          <li><strong>Fixed Size:</strong> Traditional arrays have fixed size (dynamic arrays like Python lists or Java ArrayList handle this)</li>
          <li><strong>Homogeneous:</strong> All elements are of the same type</li>
        </ul>

        <h3>Time Complexity of Common Operations</h3>
        <table style="width:100%; border-collapse: collapse;">
          <tr style="background: #f3f4f6;">
            <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Operation</th>
            <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Time Complexity</th>
            <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Why?</th>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">Access by Index</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">O(1)</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">Direct memory address calculation</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">Search (unsorted)</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">O(n)</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">Must check each element</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">Insert at End</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">O(1) amortized</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">Direct placement (resizing occasionally)</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">Insert at Beginning</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">O(n)</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">Must shift all elements</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">Delete by Index</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">O(n)</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">Must shift elements to fill gap</td>
          </tr>
        </table>

        <h3>When to Use Arrays</h3>
        <p>Arrays are ideal when:</p>
        <ul>
          <li>You need fast access to elements by position</li>
          <li>The size is known or changes infrequently</li>
          <li>Memory efficiency is important</li>
          <li>You need to iterate over all elements frequently</li>
        </ul>

        <h3>Common Patterns</h3>
        <p>These patterns appear frequently in array problems:</p>
        <ol>
          <li><strong>Two Pointers:</strong> Using two indices to traverse the array</li>
          <li><strong>Sliding Window:</strong> Maintaining a window of elements</li>
          <li><strong>Prefix Sum:</strong> Precomputing cumulative sums</li>
          <li><strong>In-place Modification:</strong> Modifying array without extra space</li>
        </ol>
      `,
      isRequired: true,
    },
    {
      id: "content-2",
      type: "link",
      title: "Interactive Visualizer",
      content: "https://visualgo.net/en/array",
      isRequired: false,
    },
  ],
  "task-2": [
    {
      id: "content-3",
      type: "text",
      title: "Two Pointer Basics",
      content: `
        <h2>Two Pointer Technique</h2>
        <p>The <strong>two pointer technique</strong> is a common pattern for solving array problems efficiently. Instead of using nested loops (O(n²)), we use two pointers that move through the array strategically.</p>

        <h3>Types of Two Pointer Approaches</h3>
        
        <h4>1. Opposite Direction (Converging)</h4>
        <p>Pointers start at opposite ends and move toward each other:</p>
        <pre style="background: #f3f4f6; padding: 12px; border-radius: 6px; overflow-x: auto;">
left = 0
right = len(arr) - 1
while left < right:
    # Process elements at left and right
    # Move pointers based on condition
        </pre>
        <p><em>Example problems:</em> Two Sum (sorted), Container With Most Water, Valid Palindrome</p>

        <h4>2. Same Direction (Fast/Slow)</h4>
        <p>Both pointers start at the same end, moving at different speeds:</p>
        <pre style="background: #f3f4f6; padding: 12px; border-radius: 6px; overflow-x: auto;">
slow = 0
for fast in range(len(arr)):
    if condition:
        arr[slow] = arr[fast]
        slow += 1
        </pre>
        <p><em>Example problems:</em> Remove Duplicates, Move Zeroes, Cycle Detection</p>

        <h3>Key Insight</h3>
        <p>The power of two pointers comes from reducing the search space with each step. When the array is sorted, we can make informed decisions about which pointer to move.</p>
      `,
      isRequired: true,
    },
  ],
  "task-3": [
    {
      id: "content-4",
      type: "text",
      title: "Binary Search Deep Dive",
      content: `
        <h2>Binary Search and Its Variations</h2>
        <p>Binary search is more than just finding an element—it's about efficiently narrowing down a search space. Understanding the variations is crucial for interviews.</p>

        <h3>The Core Template</h3>
        <pre style="background: #f3f4f6; padding: 12px; border-radius: 6px; overflow-x: auto;">
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2  # Prevents overflow
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1  # Not found
        </pre>

        <h3>Important Variations</h3>
        
        <h4>Find First Occurrence</h4>
        <p>When duplicates exist and you need the leftmost match:</p>
        <pre style="background: #f3f4f6; padding: 12px; border-radius: 6px; overflow-x: auto;">
def find_first(arr, target):
    left, right = 0, len(arr) - 1
    result = -1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            result = mid
            right = mid - 1  # Keep searching left
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return result
        </pre>

        <h4>Find Last Occurrence</h4>
        <p>Similar, but search right after finding:</p>
        <pre style="background: #f3f4f6; padding: 12px; border-radius: 6px; overflow-x: auto;">
# Same as above, but:
# result = mid
# left = mid + 1  # Keep searching right
        </pre>

        <h4>Search in Rotated Sorted Array</h4>
        <p>Key insight: One half is always sorted. Determine which half and decide accordingly.</p>
      `,
      isRequired: true,
    },
    {
      id: "content-5",
      type: "video",
      title: "Visual Walkthrough",
      content: "https://www.youtube.com/embed/GU7DpgHINWQ",
      duration: 612,
      isRequired: false,
    },
  ],
};

export const mockQuestions: Record<string, Question[]> = {
  "task-1": [
    {
      id: "q1",
      type: "mcq",
      question: "What is the time complexity of accessing an element by index in an array?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      correctAnswer: 0,
      explanation: "Arrays provide O(1) access because the memory address can be calculated directly using the base address and index.",
      difficulty: "easy",
      points: 10,
    },
    {
      id: "q2",
      type: "mcq",
      question: "Why is inserting at the beginning of an array O(n)?",
      options: [
        "We need to find the insertion point",
        "We need to shift all existing elements",
        "We need to resize the array",
        "We need to sort the array after insertion",
      ],
      correctAnswer: 1,
      explanation: "When inserting at index 0, every existing element must shift one position to the right to make room.",
      difficulty: "medium",
      points: 15,
    },
    {
      id: "q3",
      type: "short-answer",
      question: "In Big O notation, what is the amortized time complexity of appending to a dynamic array?",
      correctAnswer: "O(1)",
      explanation: "While occasional resizing is O(n), the amortized cost over many operations is O(1) because resizing happens exponentially less frequently.",
      difficulty: "medium",
      points: 15,
    },
    {
      id: "q4",
      type: "mcq",
      question: "Which operation is NOT efficient (not O(1)) for arrays?",
      options: [
        "Reading element at index i",
        "Writing element at index i",
        "Inserting element at the middle",
        "Getting the length",
      ],
      correctAnswer: 2,
      explanation: "Inserting at the middle requires shifting approximately n/2 elements, making it O(n).",
      difficulty: "easy",
      points: 10,
    },
    {
      id: "q5",
      type: "explain",
      question: "Explain why arrays have better cache performance than linked lists.",
      correctAnswer: "contiguous memory locality",
      explanation: "Arrays store elements in contiguous memory locations. When the CPU fetches one element, adjacent elements are also loaded into the cache (spatial locality). Linked lists have nodes scattered in memory, causing more cache misses.",
      difficulty: "hard",
      points: 25,
    },
  ],
  "task-2": [
    {
      id: "q6",
      type: "mcq",
      question: "In the two-pointer technique for a sorted array, when looking for a pair that sums to a target, if the current sum is too small, which pointer should you move?",
      options: [
        "Move the left pointer right",
        "Move the right pointer left",
        "Move both pointers",
        "Reset both pointers",
      ],
      correctAnswer: 0,
      explanation: "If the sum is too small, we need a larger sum. Moving the left pointer right gives us a larger value in a sorted array.",
      difficulty: "easy",
      points: 10,
    },
    {
      id: "q7",
      type: "mcq",
      question: "The 'Remove Duplicates from Sorted Array' problem uses which type of two-pointer approach?",
      options: [
        "Opposite direction (converging)",
        "Same direction (fast/slow)",
        "Binary search pointers",
        "Circular pointers",
      ],
      correctAnswer: 1,
      explanation: "We use a slow pointer to track the position for unique elements and a fast pointer to scan through the array.",
      difficulty: "medium",
      points: 15,
    },
    {
      id: "q8",
      type: "short-answer",
      question: "What is the time complexity of the two-pointer approach for the Two Sum problem on a sorted array?",
      correctAnswer: "O(n)",
      explanation: "Each pointer moves at most n times, and we process each element at most once, giving O(n) time.",
      difficulty: "easy",
      points: 10,
    },
  ],
  "task-3": [
    {
      id: "q9",
      type: "mcq",
      question: "Why do we use 'mid = left + (right - left) // 2' instead of 'mid = (left + right) // 2'?",
      options: [
        "It's faster to compute",
        "It prevents integer overflow",
        "It gives more accurate results",
        "It's required for floating-point arrays",
      ],
      correctAnswer: 1,
      explanation: "When left and right are very large integers, their sum could overflow. The subtraction-based formula prevents this.",
      difficulty: "medium",
      points: 15,
    },
    {
      id: "q10",
      type: "mcq",
      question: "In 'Search in Rotated Sorted Array', what's the key insight?",
      options: [
        "The array can be binary searched as-is",
        "One half of the array is always sorted",
        "The rotation point must be found first",
        "Two binary searches are always needed",
      ],
      correctAnswer: 1,
      explanation: "At any point, at least one half of the array around mid is sorted. We determine which half and check if target is in that range.",
      difficulty: "hard",
      points: 20,
    },
    {
      id: "q11",
      type: "short-answer",
      question: "What should binary search return when finding the first occurrence if the element is not found?",
      correctAnswer: "-1",
      explanation: "By convention, -1 indicates 'not found' since it's not a valid index.",
      difficulty: "easy",
      points: 10,
    },
    {
      id: "q12",
      type: "explain",
      question: "Explain how to modify binary search to find the insertion point (where an element should be inserted to maintain sorted order).",
      correctAnswer: "return left after loop",
      explanation: "When the while loop ends without finding the target, 'left' points to where the element should be inserted. This is because left represents the first position where all elements to its left are smaller than target.",
      difficulty: "hard",
      points: 25,
    },
  ],
};

// AI Coach responses (simulated)
export const mockAIResponses: Record<string, Record<string, string>> = {
  "re-explain": {
    default: "Let me explain this differently. Think of it step by step:\n\n1. First, consider what the problem is really asking\n2. Break down the input into smaller parts\n3. Consider what patterns you've seen before\n\nDoes looking at it this way help clarify things?",
    array: "Think of an array like a row of lockers at school. Each locker has a number (index), and you can go directly to any locker if you know its number. That's why access is O(1) - you don't need to check other lockers first.",
    complexity: "Time complexity is like asking 'how much longer will this take if I double the input size?'\n\n- O(1): Same time regardless of size\n- O(n): Doubles when input doubles\n- O(n²): Quadruples when input doubles",
  },
  "simpler-analogy": {
    default: "Here's a real-world analogy:\n\nImagine you're looking for a word in a dictionary. You don't read every word from the start - you open to the middle, see if your word comes before or after, and repeat. That's binary search!\n\nThis is exactly what makes it O(log n) instead of O(n).",
    array: "An array is like an egg carton - each egg has its own numbered slot, and you can grab any egg directly by its position. A linked list is like a treasure hunt where each clue leads to the next one.",
  },
  "guiding-question": {
    default: "Before I give you more hints, let me ask you this:\n\n- What information do you have available?\n- What are you trying to find or achieve?\n- Have you seen a similar pattern before?\n\nTry thinking through these questions first.",
    complexity: "Ask yourself: If I double the size of my input, what happens to the number of operations?\n\n- Does it stay the same?\n- Does it double?\n- Does it more than double?\n\nThis will tell you the complexity class.",
  },
  "break-down": {
    default: "Let's break this into smaller steps:\n\n**Step 1:** Understand the input format\n**Step 2:** Identify what output is expected\n**Step 3:** Think of the simplest case (n=1 or n=2)\n**Step 4:** Look for patterns as n grows\n**Step 5:** Generalize into an algorithm\n\nWhich step would you like to focus on?",
    binary: "Binary search has three key decisions:\n\n1. **Initialize:** Set left=0, right=length-1\n2. **Check mid:** Is it what we want?\n3. **Narrow:** If too small, go right. If too big, go left.\n\nRepeat until found or left > right.",
  },
};

// Helper function to get AI response
export function getAIResponse(type: string, _context: string): Promise<string> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const typeResponses = mockAIResponses[type] || mockAIResponses["re-explain"];
      // In real implementation, we'd analyze context to pick the best response
      resolve(typeResponses.default || "Let me help you think through this...");
    }, 1000);
  });
}

/* ==========================================================================
   data.js — the DSA problem sheet
   DSA_SEED below is the default list. On first load it's copied into
   localStorage ("dsa_problems"), which then becomes the source of truth
   so the admin can add / edit / delete problems and users see the changes.
   ========================================================================== */

const DSA_SEED = [
  // ---- Arrays ----
  { id: "arr1", topic: "Arrays", name: "Two Sum", difficulty: "Easy", link: "https://leetcode.com/problems/two-sum/" },
  { id: "arr2", topic: "Arrays", name: "Best Time to Buy and Sell Stock", difficulty: "Easy", link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
  { id: "arr3", topic: "Arrays", name: "Maximum Subarray (Kadane's)", difficulty: "Medium", link: "https://leetcode.com/problems/maximum-subarray/" },
  { id: "arr4", topic: "Arrays", name: "Product of Array Except Self", difficulty: "Medium", link: "https://leetcode.com/problems/product-of-array-except-self/" },
  { id: "arr5", topic: "Arrays", name: "Trapping Rain Water", difficulty: "Hard", link: "https://leetcode.com/problems/trapping-rain-water/" },

  // ---- Strings ----
  { id: "str1", topic: "Strings", name: "Valid Anagram", difficulty: "Easy", link: "https://leetcode.com/problems/valid-anagram/" },
  { id: "str2", topic: "Strings", name: "Longest Substring Without Repeating Characters", difficulty: "Medium", link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
  { id: "str3", topic: "Strings", name: "Group Anagrams", difficulty: "Medium", link: "https://leetcode.com/problems/group-anagrams/" },
  { id: "str4", topic: "Strings", name: "Minimum Window Substring", difficulty: "Hard", link: "https://leetcode.com/problems/minimum-window-substring/" },

  // ---- Linked List ----
  { id: "ll1", topic: "Linked List", name: "Reverse Linked List", difficulty: "Easy", link: "https://leetcode.com/problems/reverse-linked-list/" },
  { id: "ll2", topic: "Linked List", name: "Merge Two Sorted Lists", difficulty: "Easy", link: "https://leetcode.com/problems/merge-two-sorted-lists/" },
  { id: "ll3", topic: "Linked List", name: "Linked List Cycle", difficulty: "Easy", link: "https://leetcode.com/problems/linked-list-cycle/" },
  { id: "ll4", topic: "Linked List", name: "LRU Cache", difficulty: "Medium", link: "https://leetcode.com/problems/lru-cache/" },

  // ---- Stacks & Queues ----
  { id: "stk1", topic: "Stacks & Queues", name: "Valid Parentheses", difficulty: "Easy", link: "https://leetcode.com/problems/valid-parentheses/" },
  { id: "stk2", topic: "Stacks & Queues", name: "Min Stack", difficulty: "Medium", link: "https://leetcode.com/problems/min-stack/" },
  { id: "stk3", topic: "Stacks & Queues", name: "Daily Temperatures", difficulty: "Medium", link: "https://leetcode.com/problems/daily-temperatures/" },

  // ---- Trees ----
  { id: "tree1", topic: "Trees", name: "Maximum Depth of Binary Tree", difficulty: "Easy", link: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
  { id: "tree2", topic: "Trees", name: "Invert Binary Tree", difficulty: "Easy", link: "https://leetcode.com/problems/invert-binary-tree/" },
  { id: "tree3", topic: "Trees", name: "Validate Binary Search Tree", difficulty: "Medium", link: "https://leetcode.com/problems/validate-binary-search-tree/" },
  { id: "tree4", topic: "Trees", name: "Binary Tree Level Order Traversal", difficulty: "Medium", link: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
  { id: "tree5", topic: "Trees", name: "Serialize and Deserialize Binary Tree", difficulty: "Hard", link: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" },

  // ---- Graphs ----
  { id: "grf1", topic: "Graphs", name: "Number of Islands", difficulty: "Medium", link: "https://leetcode.com/problems/number-of-islands/" },
  { id: "grf2", topic: "Graphs", name: "Clone Graph", difficulty: "Medium", link: "https://leetcode.com/problems/clone-graph/" },
  { id: "grf3", topic: "Graphs", name: "Course Schedule", difficulty: "Medium", link: "https://leetcode.com/problems/course-schedule/" },
  { id: "grf4", topic: "Graphs", name: "Word Ladder", difficulty: "Hard", link: "https://leetcode.com/problems/word-ladder/" },

  // ---- Dynamic Programming ----
  { id: "dp1", topic: "Dynamic Programming", name: "Climbing Stairs", difficulty: "Easy", link: "https://leetcode.com/problems/climbing-stairs/" },
  { id: "dp2", topic: "Dynamic Programming", name: "House Robber", difficulty: "Medium", link: "https://leetcode.com/problems/house-robber/" },
  { id: "dp3", topic: "Dynamic Programming", name: "Coin Change", difficulty: "Medium", link: "https://leetcode.com/problems/coin-change/" },
  { id: "dp4", topic: "Dynamic Programming", name: "Longest Increasing Subsequence", difficulty: "Medium", link: "https://leetcode.com/problems/longest-increasing-subsequence/" },
  { id: "dp5", topic: "Dynamic Programming", name: "Edit Distance", difficulty: "Hard", link: "https://leetcode.com/problems/edit-distance/" },
];

/* ---------- Shared problem store (localStorage-backed) ---------- */
const PROBLEMS_KEY = "dsa_problems";

/* Returns the current problem list, seeding from DSA_SEED on first run. */
function getProblems() {
  const stored = localStorage.getItem(PROBLEMS_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { /* fall through to seed */ }
  }
  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(DSA_SEED));
  return DSA_SEED.slice();
}

function saveProblems(list) {
  localStorage.setItem(PROBLEMS_KEY, JSON.stringify(list));
}

/* Admin credentials (preset account — always available). */
const ADMIN_EMAIL = "sakthivelmaribe@gmail.com";
const ADMIN_PASSWORD = "A1S2D3S4.sakthi";

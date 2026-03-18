# DSA Interview Notes
# Target: Mid-size Product | MNC Service (TCS/Infosys/Wipro) | Startups
# Level: Junior (1-3 yr) | 2 yr MERN Experience
# Language: JavaScript
# ============================================================
# ONLY TOPICS THAT ARE ACTUALLY ASKED — NOTHING EXTRA
# ============================================================


## ✅ TOPIC 1 — ARRAYS (Most Asked Everywhere)
# ─────────────────────────────────────────────

# Must solve these problems:
# - Two Sum                          ← asked in every company
# - Best Time to Buy and Sell Stock  ← asked in every company
# - Maximum Subarray (Kadane)        ← asked in every company
# - Move Zeroes
# - Rotate Array
# - Find Duplicate in Array
# - Intersection of Two Arrays
# - Missing Number

# Kadane's Algorithm (Max Subarray)
function maxSubArray(nums) {
    let maxSum = nums[0], current = nums[0];
    for (let i = 1; i < nums.length; i++) {
        current = Math.max(nums[i], current + nums[i]);
        maxSum = Math.max(maxSum, current);
    }
    return maxSum;
}

# Two Sum (HashMap approach — O(n))
function twoSum(nums, target) {
    const map = {};
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map[diff] !== undefined) return [map[diff], i];
        map[nums[i]] = i;
    }
}


## ✅ TOPIC 2 — STRINGS (Very Common in MNC + Startups)
# ─────────────────────────────────────────────────────

# Must solve these problems:
# - Reverse a String / Reverse Words
# - Valid Palindrome
# - Valid Anagram
# - Longest Substring Without Repeating Characters  ← sliding window
# - First Non-Repeating Character
# - Count and Say
# - Roman to Integer
# - Longest Common Prefix

# Valid Anagram
function isAnagram(s, t) {
    if (s.length !== t.length) return false;
    const map = {};
    for (let c of s) map[c] = (map[c] || 0) + 1;
    for (let c of t) {
        if (!map[c]) return false;
        map[c]--;
    }
    return true;
}

# Longest Substring Without Repeating Characters
function lengthOfLongestSubstring(s) {
    const map = {};
    let left = 0, max = 0;
    for (let right = 0; right < s.length; right++) {
        if (map[s[right]] !== undefined && map[s[right]] >= left) {
            left = map[s[right]] + 1;
        }
        map[s[right]] = right;
        max = Math.max(max, right - left + 1);
    }
    return max;
}


## ✅ TOPIC 3 — TWO POINTERS (Mid-size + Startups ask this)
# ──────────────────────────────────────────────────────────

# Must solve these problems:
# - Container With Most Water
# - 3Sum
# - Remove Duplicates from Sorted Array
# - Trapping Rain Water          ← asked at mid-size and startups
# - Squares of Sorted Array

# Two Pointer Template
function twoPointerTemplate(arr) {
    let left = 0, right = arr.length - 1;
    while (left < right) {
        # check condition
        if (/* move left */) left++;
        else right--;
    }
}

# Trapping Rain Water
function trap(height) {
    let left = 0, right = height.length - 1;
    let leftMax = 0, rightMax = 0, water = 0;
    while (left < right) {
        if (height[left] < height[right]) {
            height[left] >= leftMax ? leftMax = height[left] : water += leftMax - height[left];
            left++;
        } else {
            height[right] >= rightMax ? rightMax = height[right] : water += rightMax - height[right];
            right--;
        }
    }
    return water;
}


## ✅ TOPIC 4 — LINKED LIST (Asked in Every Company)
# ───────────────────────────────────────────────────

# Must solve these problems:
# - Reverse Linked List              ← asked everywhere, know both ways
# - Detect Cycle (Floyd's)           ← asked everywhere
# - Find Middle of Linked List
# - Merge Two Sorted Lists
# - Remove Nth Node from End
# - Palindrome Linked List

# Reverse Linked List (iterative)
function reverseList(head) {
    let prev = null, curr = head;
    while (curr) {
        let next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}

# Detect Cycle — Floyd's Algorithm
function hasCycle(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) return true;
    }
    return false;
}

# Find Middle
function findMiddle(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow; // slow is the middle
}


## ✅ TOPIC 5 — STACK & QUEUE (MNC Service asks this a lot)
# ──────────────────────────────────────────────────────────

# Must solve these problems:
# - Valid Parentheses               ← asked in literally every company
# - Implement Stack using Queue
# - Implement Queue using Stack
# - Next Greater Element
# - Daily Temperatures
# - Min Stack

# Valid Parentheses
function isValid(s) {
    const stack = [], map = { ')': '(', '}': '{', ']': '[' };
    for (let c of s) {
        if ('({['.includes(c)) stack.push(c);
        else if (stack.pop() !== map[c]) return false;
    }
    return stack.length === 0;
}

# Next Greater Element
function nextGreaterElement(nums) {
    const result = new Array(nums.length).fill(-1);
    const stack = [];
    for (let i = 0; i < nums.length; i++) {
        while (stack.length && nums[i] > nums[stack[stack.length - 1]]) {
            result[stack.pop()] = nums[i];
        }
        stack.push(i);
    }
    return result;
}


## ✅ TOPIC 6 — BINARY SEARCH (Mid-size + Startups love this)
# ─────────────────────────────────────────────────────────────

# Must solve these problems:
# - Classic Binary Search
# - Search in Rotated Sorted Array  ← asked a lot
# - Find First and Last Position
# - Find Minimum in Rotated Array
# - Search a 2D Matrix

# Binary Search Template
function binarySearch(arr, target) {
    let lo = 0, hi = arr.length - 1;
    while (lo <= hi) {
        let mid = Math.floor((lo + hi) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

# Search in Rotated Sorted Array
function searchRotated(nums, target) {
    let lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        let mid = Math.floor((lo + hi) / 2);
        if (nums[mid] === target) return mid;
        if (nums[lo] <= nums[mid]) {  # left half sorted
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {                       # right half sorted
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}


## ✅ TOPIC 7 — BINARY TREE (Asked Everywhere)
# ─────────────────────────────────────────────

# Must solve these problems:
# - Inorder / Preorder / Postorder Traversal  ← know iterative too
# - Level Order Traversal (BFS)               ← very common
# - Maximum Depth of Binary Tree
# - Diameter of Binary Tree
# - Same Tree / Symmetric Tree
# - Path Sum
# - Invert Binary Tree
# - Lowest Common Ancestor (LCA)              ← asked at mid-size + startups

# Level Order BFS
function levelOrder(root) {
    if (!root) return [];
    const result = [], queue = [root];
    while (queue.length) {
        const level = [], size = queue.length;
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        result.push(level);
    }
    return result;
}

# Max Depth
function maxDepth(root) {
    if (!root) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

# LCA (Lowest Common Ancestor)
function lowestCommonAncestor(root, p, q) {
    if (!root || root === p || root === q) return root;
    const left = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);
    return left && right ? root : left || right;
}


## ✅ TOPIC 8 — BST (Binary Search Tree)
# ────────────────────────────────────────

# Must solve these problems:
# - Validate BST                ← very common
# - Kth Smallest in BST
# - Insert / Search / Delete in BST

# Validate BST
function isValidBST(root, min = -Infinity, max = Infinity) {
    if (!root) return true;
    if (root.val <= min || root.val >= max) return false;
    return isValidBST(root.left, min, root.val) &&
           isValidBST(root.right, root.val, max);
}


## ✅ TOPIC 9 — GRAPHS (Mid-size + Startups ask this)
# ─────────────────────────────────────────────────────

# NOTE: MNC service-based (TCS/Infosys) rarely ask graphs deeply.
# Mid-size and startups do ask these:

# Must solve these problems:
# - Number of Islands             ← most asked graph problem
# - Clone Graph
# - Course Schedule (has cycle?)  ← topological sort
# - Number of Connected Components
# - Flood Fill

# Number of Islands (DFS)
function numIslands(grid) {
    let count = 0;
    function dfs(r, c) {
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] === '0') return;
        grid[r][c] = '0';
        dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);
    }
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[0].length; c++) {
            if (grid[r][c] === '1') { dfs(r, c); count++; }
        }
    }
    return count;
}

# Course Schedule (Cycle Detection)
function canFinish(numCourses, prerequisites) {
    const adj = Array.from({length: numCourses}, () => []);
    for (let [a, b] of prerequisites) adj[b].push(a);
    const visited = new Array(numCourses).fill(0); // 0=unvisited 1=visiting 2=done
    function dfs(node) {
        if (visited[node] === 1) return false; // cycle
        if (visited[node] === 2) return true;
        visited[node] = 1;
        for (let nei of adj[node]) if (!dfs(nei)) return false;
        visited[node] = 2;
        return true;
    }
    for (let i = 0; i < numCourses; i++) if (!dfs(i)) return false;
    return true;
}


## ✅ TOPIC 10 — DYNAMIC PROGRAMMING (Important for Mid-size + Startups)
# ────────────────────────────────────────────────────────────────────────

# NOTE: MNC service-based rarely go deep on DP.
# Mid-size and startups ask 1D DP often. 2D DP is bonus.

# Must solve (1D DP):
# - Climbing Stairs
# - House Robber
# - Coin Change              ← very commonly asked
# - Longest Increasing Subsequence (LIS)
# - Jump Game

# Good to know (2D DP):
# - Unique Paths
# - Longest Common Subsequence (LCS)

# Climbing Stairs
function climbStairs(n) {
    if (n <= 2) return n;
    let a = 1, b = 2;
    for (let i = 3; i <= n; i++) [a, b] = [b, a + b];
    return b;
}

# Coin Change
function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (let i = 1; i <= amount; i++) {
        for (let coin of coins) {
            if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
        }
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
}

# House Robber
function rob(nums) {
    let prev = 0, curr = 0;
    for (let num of nums) [prev, curr] = [curr, Math.max(curr, prev + num)];
    return curr;
}


## ✅ TOPIC 11 — RECURSION (MNC Service asks this constantly)
# ─────────────────────────────────────────────────────────────

# MNC service companies (TCS, Infosys, Wipro) LOVE recursion questions.
# This is where they filter most candidates.

# Must solve:
# - Factorial
# - Fibonacci (with memoization)
# - Power(x, n)
# - Reverse a String using recursion
# - Tower of Hanoi (understand, rarely code fully)
# - Flatten Nested Array
# - Generate all Subsets
# - Generate all Permutations

# Fibonacci with memoization
function fib(n, memo = {}) {
    if (n <= 1) return n;
    if (memo[n]) return memo[n];
    return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
}

# Flatten Nested Array (relevant to JS/MERN)
function flatten(arr) {
    return arr.reduce((acc, val) =>
        Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);
}

# Generate Subsets
function subsets(nums) {
    const result = [[]];
    for (let num of nums) {
        const newSubsets = result.map(sub => [...sub, num]);
        result.push(...newSubsets);
    }
    return result;
}


## ✅ TOPIC 12 — SORTING (MNC Service asks theory + code)
# ──────────────────────────────────────────────────────────

# Must know by hand:
# - Bubble Sort     ← MNC service asks to write this
# - Selection Sort  ← MNC service asks to write this
# - Insertion Sort  ← MNC service asks to write this
# - Merge Sort      ← asked at mid-size + startups
# - Quick Sort      ← asked at mid-size + startups

# Bubble Sort
function bubbleSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j+1]) [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
        }
    }
    return arr;
}

# Merge Sort
function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
}
function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) result.push(left[i++]);
        else result.push(right[j++]);
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
}

# Quick Sort
function quickSort(arr, lo = 0, hi = arr.length - 1) {
    if (lo < hi) {
        const p = partition(arr, lo, hi);
        quickSort(arr, lo, p - 1);
        quickSort(arr, p + 1, hi);
    }
    return arr;
}
function partition(arr, lo, hi) {
    const pivot = arr[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
        if (arr[j] <= pivot) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; }
    }
    [arr[i+1], arr[hi]] = [arr[hi], arr[i+1]];
    return i + 1;
}

# Time Complexities — must memorize
# ┌─────────────────┬──────────┬──────────┬──────────┐
# │ Algorithm       │ Best     │ Average  │ Worst    │
# ├─────────────────┼──────────┼──────────┼──────────┤
# │ Bubble Sort     │ O(n)     │ O(n²)    │ O(n²)    │
# │ Selection Sort  │ O(n²)    │ O(n²)    │ O(n²)    │
# │ Insertion Sort  │ O(n)     │ O(n²)    │ O(n²)    │
# │ Merge Sort      │ O(nlogn) │ O(nlogn) │ O(nlogn) │
# │ Quick Sort      │ O(nlogn) │ O(nlogn) │ O(n²)    │
# └─────────────────┴──────────┴──────────┴──────────┘


## ❌ SKIP THESE — Not Asked at This Level
# ─────────────────────────────────────────

# - Segment Trees
# - Fenwick Tree / BIT
# - Dijkstra / Bellman-Ford
# - Red-Black Trees / AVL Trees
# - Suffix Arrays / Suffix Trees
# - Complex Trie problems
# - Hard DP (Bitmask DP, Digit DP)
# - Heavy graph algorithms
# - Math / Number Theory problems


## 📋 COMPANY-WISE WHAT THEY ASK
# ─────────────────────────────────

# TCS / Infosys / Wipro / Capgemini (MNC Service):
# → Arrays, Strings, Sorting (write by hand), Recursion, Stack/Queue
# → Basic Linked List (reverse, cycle)
# → Binary Tree basics
# → Time complexity questions
# → NO deep graph or DP questions

# Mid-size Product Companies (50–500 people):
# → Everything above PLUS
# → Two Pointers, Sliding Window, Binary Search
# → Graph BFS/DFS (Number of Islands, Course Schedule)
# → 1D DP (Coin Change, House Robber, LIS)
# → LRU Cache (common for backend/MERN roles)

# Startups:
# → Same as mid-size but faster pace
# → More focus on problem-solving approach than perfect code
# → May ask JS-specific questions mixed with DSA


## ⚡ QUICK TIPS FOR INTERVIEWS
# ──────────────────────────────

# 1. Always say the approach BEFORE writing code
# 2. Say time and space complexity at the end
# 3. Write clean code — variable names matter at mid-size
# 4. Use Map/Set in JS — not plain objects — for O(1) lookups
# 5. For MNC service: they check if you can write sorting from scratch
# 6. For mid-size/startups: they check if you explain your thought process
# 7. Edge cases to always mention: empty array, single element, duplicates, negative numbers

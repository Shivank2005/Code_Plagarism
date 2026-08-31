import os
import random

output_dir = "leetcode_test_dataset"
os.makedirs(output_dir, exist_ok=True)

# ---------------------------------------------------------
# Cluster 1: Longest Substring Without Repeating Characters
# ---------------------------------------------------------
cluster1_base = """
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        char_set = set()
        left = 0
        max_len = 0
        for right in range(len(s)):
            while s[right] in char_set:
                char_set.remove(s[left])
                left += 1
            char_set.add(s[right])
            max_len = max(max_len, right - left + 1)
        return max_len
"""

# ---------------------------------------------------------
# Cluster 2: Container With Most Water
# ---------------------------------------------------------
cluster2_base = """
class Solution:
    def maxArea(self, height: list[int]) -> int:
        left = 0
        right = len(height) - 1
        max_water = 0
        while left < right:
            width = right - left
            current_height = min(height[left], height[right])
            max_water = max(max_water, width * current_height)
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        return max_water
"""

# ---------------------------------------------------------
# Cluster 3: 3Sum
# ---------------------------------------------------------
cluster3_base = """
class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        nums.sort()
        res = []
        for i in range(len(nums) - 2):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            l, r = i + 1, len(nums) - 1
            while l < r:
                s = nums[i] + nums[l] + nums[r]
                if s < 0:
                    l += 1
                elif s > 0:
                    r -= 1
                else:
                    res.append([nums[i], nums[l], nums[r]])
                    while l < r and nums[l] == nums[l + 1]:
                        l += 1
                    while l < r and nums[r] == nums[r - 1]:
                        r -= 1
                    l += 1
                    r -= 1
        return res
"""

# ---------------------------------------------------------
# Noise: 10 different Medium problems
# ---------------------------------------------------------
noise_bases = [
    # Coin Change
    "class Solution:\n    def coinChange(self, coins, amount):\n        dp = [amount + 1] * (amount + 1)\n        dp[0] = 0\n        for c in coins:\n            for i in range(c, amount + 1):\n                dp[i] = min(dp[i], dp[i - c] + 1)\n        return dp[amount] if dp[amount] != amount + 1 else -1",
    # Number of Islands
    "class Solution:\n    def numIslands(self, grid):\n        if not grid: return 0\n        def dfs(i, j):\n            if i<0 or j<0 or i>=len(grid) or j>=len(grid[0]) or grid[i][j]=='0': return\n            grid[i][j] = '0'\n            dfs(i+1,j); dfs(i-1,j); dfs(i,j+1); dfs(i,j-1)\n        cnt = 0\n        for i in range(len(grid)):\n            for j in range(len(grid[0])):\n                if grid[i][j]=='1':\n                    dfs(i,j)\n                    cnt+=1\n        return cnt",
    # Word Break
    "class Solution:\n    def wordBreak(self, s, wordDict):\n        dp = [False] * (len(s) + 1)\n        dp[0] = True\n        for i in range(1, len(s) + 1):\n            for w in wordDict:\n                if dp[i - len(w)] and s[i - len(w):i] == w:\n                    dp[i] = True\n        return dp[-1]",
    # Jump Game
    "class Solution:\n    def canJump(self, nums):\n        m = 0\n        for i, n in enumerate(nums):\n            if i > m: return False\n            m = max(m, i + n)\n        return True",
    # Merge Intervals
    "class Solution:\n    def merge(self, intervals):\n        intervals.sort(key=lambda x: x[0])\n        res = []\n        for i in intervals:\n            if not res or res[-1][1] < i[0]:\n                res.append(i)\n            else:\n                res[-1][1] = max(res[-1][1], i[1])\n        return res",
    # Unique Paths
    "class Solution:\n    def uniquePaths(self, m, n):\n        dp = [[1]*n for _ in range(m)]\n        for i in range(1, m):\n            for j in range(1, n):\n                dp[i][j] = dp[i-1][j] + dp[i][j-1]\n        return dp[-1][-1]",
    # Search a 2D Matrix
    "class Solution:\n    def searchMatrix(self, matrix, target):\n        if not matrix: return False\n        m, n = len(matrix), len(matrix[0])\n        l, r = 0, m*n-1\n        while l <= r:\n            mid = (l+r)//2\n            num = matrix[mid//n][mid%n]\n            if num == target: return True\n            elif num < target: l = mid + 1\n            else: r = mid - 1\n        return False",
    # Sort Colors
    "class Solution:\n    def sortColors(self, nums):\n        p0, p2, i = 0, len(nums)-1, 0\n        while i <= p2:\n            if nums[i] == 0:\n                nums[i], nums[p0] = nums[p0], nums[i]\n                p0 += 1; i += 1\n            elif nums[i] == 2:\n                nums[i], nums[p2] = nums[p2], nums[i]\n                p2 -= 1\n            else:\n                i += 1",
    # Word Search
    "class Solution:\n    def exist(self, board, word):\n        def dfs(i, j, k):\n            if not (0<=i<len(board) and 0<=j<len(board[0])) or board[i][j] != word[k]: return False\n            if k == len(word)-1: return True\n            tmp, board[i][j] = board[i][j], '/'\n            res = dfs(i+1,j,k+1) or dfs(i-1,j,k+1) or dfs(i,j+1,k+1) or dfs(i,j-1,k+1)\n            board[i][j] = tmp\n            return res\n        for i in range(len(board)):\n            for j in range(len(board[0])):\n                if dfs(i,j,0): return True\n        return False",
    # House Robber
    "class Solution:\n    def rob(self, nums):\n        p1, p2 = 0, 0\n        for n in nums:\n            p1, p2 = max(p1, p2 + n), p1\n        return p1"
]

def obfuscate(code):
    """Applies random variable renaming and spacing to simulate slightly different student submissions."""
    renames = {
        "max_len": random.choice(["maximum_length", "ans", "res", "maxLength"]),
        "char_set": random.choice(["chars", "seen", "visited_chars"]),
        "left": random.choice(["l", "start", "left_ptr"]),
        "right": random.choice(["r", "end", "right_ptr"]),
        "max_water": random.choice(["res", "maxArea", "ans", "water"]),
        "current_height": random.choice(["h", "min_h", "curr_h"]),
        "width": random.choice(["w", "dist"]),
        "nums": random.choice(["arr", "A", "numbers"]),
        "res": random.choice(["ans", "result", "ret"]),
    }
    
    for k, v in renames.items():
        if random.random() > 0.3:
            code = code.replace(k, v)
            
    lines = code.split("\\n")
    new_lines = []
    for line in lines:
        if line.strip() and random.random() > 0.8:
            new_lines.append(" " * (len(line) - len(line.lstrip())) + "# " + random.choice(["todo check", "optimized", "added logic", "O(N) approach", "fast path"]))
        new_lines.append(line)
        if random.random() > 0.9:
            new_lines.append("")
            
    return "\\n".join(new_lines)

file_counter = 1

# Generate Cluster 1: 15 copies
for i in range(15):
    code = obfuscate(cluster1_base)
    with open(os.path.join(output_dir, f"student_{file_counter:02d}_clusterA.py"), "w") as f:
        f.write(code)
    file_counter += 1

# Generate Cluster 2: 15 copies
for i in range(15):
    code = obfuscate(cluster2_base)
    with open(os.path.join(output_dir, f"student_{file_counter:02d}_clusterB.py"), "w") as f:
        f.write(code)
    file_counter += 1

# Generate Cluster 3: 10 copies
for i in range(10):
    code = obfuscate(cluster3_base)
    with open(os.path.join(output_dir, f"student_{file_counter:02d}_clusterC.py"), "w") as f:
        f.write(code)
    file_counter += 1

# Generate Noise: 10 different problems
for i, noise in enumerate(noise_bases):
    code = obfuscate(noise)
    with open(os.path.join(output_dir, f"student_{file_counter:02d}_noise_{i}.py"), "w") as f:
        f.write(code)
    file_counter += 1

print(f"Successfully generated {file_counter - 1} test files in '{output_dir}/'")

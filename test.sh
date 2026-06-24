#!/bin/bash
# test.sh — Example API calls to test the Interview Prep API
# 
# Usage: bash test.sh (after running npm start)
# Note: Replace BASE_URL with your Render/Railway URL when deployed

BASE_URL="http://localhost:3000"

echo "🎓 Interview Prep API — Test Examples"
echo "======================================="
echo ""

# 1. Get all problems
echo "1️⃣ Get all problems (first 5):"
curl -s "$BASE_URL/problems?limit=5" | jq '.problems[] | {id, title, difficulty}'
echo ""

# 2. Get a random problem
echo "2️⃣ Get a random problem:"
curl -s "$BASE_URL/problems/random" | jq '{problem: .problem | {id, title}, testCases: .testCases | length}'
echo ""

# 3. Filter by difficulty
echo "3️⃣ Get all Easy problems:"
curl -s "$BASE_URL/problems?difficulty=Easy&limit=3" | jq '.problems[] | {title, difficulty}'
echo ""

# 4. Get specific problem with test cases
echo "4️⃣ Get specific problem (first from db):"
PROBLEM_ID=$(curl -s "$BASE_URL/problems?limit=1" | jq -r '.problems[0].id')
echo "Problem ID: $PROBLEM_ID"
curl -s "$BASE_URL/problems/$PROBLEM_ID" | jq '{problem: .problem | {title, description}, testCases: .testCases}'
echo ""

# 5. Submit code to a problem
echo "5️⃣ Submit code to a problem:"
curl -s -X POST "$BASE_URL/problems/$PROBLEM_ID/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "return function() { return 42; }"
  }' | jq '{submissionId, passed, testsPassed, testsTotal}'
echo ""

# 6. View submissions
echo "6️⃣ View all submissions (last 5):"
curl -s "$BASE_URL/submissions?limit=5" | jq '.submissions[] | {id, problem_id, passed, created_at}'
echo ""

# 7. Create a new problem (example)
echo "7️⃣ Create a new problem:"
curl -s -X POST "$BASE_URL/problems" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sum of Array",
    "description": "Return the sum of all numbers in an array",
    "difficulty": "Easy",
    "topic": "Array",
    "example": "Input: [1,2,3]\nOutput: 6",
    "testCases": [
      { "input": "[1,2,3]", "expected_output": "6" },
      { "input": "[10,20,30]", "expected_output": "60" }
    ]
  }' | jq '{id, message}'
echo ""

echo "✅ Tests complete!"
echo ""
echo "💡 Next steps:"
echo "  - Try the curl commands above individually"
echo "  - Modify the code in each submit to test pass/fail"
echo "  - Create your own problems"
echo "  - Deploy to Render/Railway and share the URL"

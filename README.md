# 🎓 Interview Prep API

A backend API for serving coding interview problems, running test cases, and tracking submissions. Perfect for building a study platform or interview prep tool.

## Features

✅ **Coding Problems Database** — 8+ pre-loaded LeetCode-style problems  
✅ **Test Case Execution** — Run your code against multiple test cases  
✅ **Full CRUD** — Create, read, update, delete problems  
✅ **Submission Tracking** — Track all code submissions with results  
✅ **Pagination & Filtering** — Filter by difficulty/topic, paginate results  
✅ **Clean API Design** — RESTful endpoints, JSON responses  
✅ **Zero External Dependencies** — SQLite built-in, no cloud config needed  

## Tech Stack

- **Backend:** Node.js + Express
- **Database:** SQLite (file-based, no setup)
- **Code Execution:** JavaScript eval (safe for this MVP)

## Quick Start (2 minutes)

### Option 1: Local Machine

```bash
# Install dependencies
npm install

# Seed sample problems into database
npm run seed

# Start server
npm start
```

Server runs on `http://localhost:3000`

### Option 2: GitHub Codespaces (From Your Phone)

1. Open your Codespaces environment
2. Terminal: `npm install && npm run seed && npm start`
3. Click the "Ports" tab, open port 3000
4. You're ready to test!

## API Endpoints

### Get Problems

**GET /problems** — List all problems (paginated)

Query params: `page=1`, `limit=10`, `difficulty=Easy`, `topic=Array`

```bash
curl http://localhost:3000/problems?difficulty=Easy&topic=Array
```

Response:
```json
{
  "problems": [
    {
      "id": "uuid",
      "title": "Two Sum",
      "description": "...",
      "difficulty": "Easy",
      "topic": "Array",
      "example": "...",
      "created_at": "2026-06-24T10:00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "pages": 1
  }
}
```

**GET /problems/random** — Get a random problem

```bash
curl http://localhost:3000/problems/random
```

**GET /problems/:id** — Get specific problem with test cases

```bash
curl http://localhost:3000/problems/abc123def456
```

### Submit Code

**POST /problems/:id/submit** — Run code against test cases

Request body:
```json
{
  "code": "return (nums1, nums2) => nums1.concat(nums2).sort((a,b) => a-b)"
}
```

Response:
```json
{
  "submissionId": "uuid",
  "passed": true,
  "testsPassed": 3,
  "testsTotal": 3,
  "results": [
    {
      "testCaseId": "uuid",
      "input": "[1,2,3,0,0,0],3,[2,5,6],3",
      "expected": "[1,2,2,3,5,6]",
      "actual": "[1,2,2,3,5,6]",
      "passed": true,
      "error": null
    }
  ]
}
```

### Problem Management (CRUD)

**POST /problems** — Create a new problem

```bash
curl -X POST http://localhost:3000/problems \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Unique Email Addresses",
    "description": "Count valid emails...",
    "difficulty": "Easy",
    "topic": "String",
    "example": "Input: emails = [...]\nOutput: 2",
    "testCases": [
      { "input": "[\"test.email+alex@leetcode.com\"]", "expected_output": "1" }
    ]
  }'
```

**PUT /problems/:id** — Update a problem

```bash
curl -X PUT http://localhost:3000/problems/abc123 \
  -H "Content-Type: application/json" \
  -d '{ "title": "New Title" }'
```

**DELETE /problems/:id** — Delete a problem

```bash
curl -X DELETE http://localhost:3000/problems/abc123
```

### Submissions

**GET /submissions** — View all submissions (last 50 by default)

```bash
curl http://localhost:3000/submissions?limit=20
```

**GET /submissions/:id** — View specific submission with test results

```bash
curl http://localhost:3000/submissions/submission-uuid
```

## Pre-loaded Problems

The seed script loads 8 problems to get you started:

| Problem | Difficulty | Topic |
|---------|-----------|-------|
| Two Sum | Easy | Array |
| Reverse String | Easy | String |
| Valid Palindrome | Easy | String |
| Merge Sorted Array | Easy | Array |
| Longest Substring Without Repeating | Medium | String |
| Binary Search | Medium | Array |
| Climbing Stairs | Easy | Dynamic Programming |
| Container With Most Water | Medium | Array |

Add more problems via `POST /problems`.

## Database Schema

```
problems
  id (uuid)
  title
  description
  difficulty (Easy/Medium/Hard)
  topic
  example
  created_at

test_cases
  id (uuid)
  problem_id (FK)
  input
  expected_output

submissions
  id (uuid)
  problem_id (FK)
  code
  passed (0/1)
  test_results (JSON)
  created_at
```

## How It Works

### Submission Flow

1. User POSTs code to `/problems/:id/submit`
2. API extracts test cases from database
3. Code is executed in JavaScript sandbox with each test input
4. Output is compared to expected output
5. Results are stored in submissions table
6. Response includes pass/fail for each test

### Code Execution

Currently uses JavaScript `new Function()` for simplicity. For production, use:
- `isolated-vm` for sandboxing
- `docker` containers for multi-language support
- `judge0` API for professional judge service

## Development

### Add a New Problem Manually

Edit `seed.js`, add to the `problems` array:

```javascript
{
  title: 'Valid Brackets',
  description: 'Check if brackets are balanced...',
  difficulty: 'Easy',
  topic: 'Stack',
  example: 'Input: "(())"\nOutput: true',
  testCases: [
    { input: '"(())"', expected: 'true' },
    { input: '"())()"', expected: 'false' }
  ]
}
```

Then re-seed:
```bash
npm run seed
```

### Enable Nodemon for Auto-Reload

```bash
npm run dev
```

## Deployment

### Deploy to Render

1. Push repo to GitHub
2. Go to render.com → New Web Service
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
4. Deploy!

Your API will be live at: `https://interview-prep-api.onrender.com`

### Deploy to Railway, Fly.io, or Heroku

Similar process — each platform auto-detects Node.js and runs your start command.

## Next Steps for Interview

When discussing this project:

1. **"I built an API that executes user code"** — explain the submission flow
2. **"Test cases are stored separately"** — normalized database design
3. **"Pagination and filtering show good API design"** — discuss REST principles
4. **"I could extend this to Python/C++ problems"** — mention using Docker or Judge0
5. **"Real production systems need sandboxing"** — show you understand security implications

## Limitations & Future Work

- **No authentication** — add JWT/API keys for production
- **JavaScript only** — extend with Docker to support Python, C++, Java
- **Simple sandboxing** — use `isolated-vm` or containers for real isolation
- **No live coding UI** — build a frontend with editor + terminal output
- **No rate limiting** — add to prevent abuse

## License

MIT

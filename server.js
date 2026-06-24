/**
 * server.js — Coding Interview Prep API
 * 
 * Serves coding problems with test cases, runs submissions, tracks progress.
 * 
 * Run with: node server.js
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── Database Setup ──────────────────────────────────────────

const db = new sqlite3.Database('./problems.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('✅ Connected to SQLite database');
});

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS problems (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty TEXT CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
      topic TEXT,
      example TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS test_cases (
      id TEXT PRIMARY KEY,
      problem_id TEXT NOT NULL,
      input TEXT NOT NULL,
      expected_output TEXT NOT NULL,
      FOREIGN KEY(problem_id) REFERENCES problems(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      problem_id TEXT NOT NULL,
      code TEXT NOT NULL,
      passed INTEGER DEFAULT 0,
      test_results TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(problem_id) REFERENCES problems(id)
    )
  `);
});

// ── Helper Functions ───────────────────────────────────────

const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Simple code executor (evaluates JavaScript)
// For production, use a sandboxed environment like isolated-vm
const executeCode = (code, testInput) => {
  try {
    // Create a function that accepts input and returns output
    // User code should export a function or return a value
    const fn = new Function('input', code);
    const result = fn(testInput);
    return { output: String(result), error: null };
  } catch (err) {
    return { output: null, error: err.message };
  }
};

// ── API Routes ──────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /problems — List all problems (paginated, filtered)
app.get('/problems', async (req, res) => {
  try {
    const { page = 1, limit = 10, difficulty, topic } = req.query;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM problems WHERE 1=1';
    const params = [];

    if (difficulty) {
      sql += ' AND difficulty = ?';
      params.push(difficulty);
    }
    if (topic) {
      sql += ' AND topic = ?';
      params.push(topic);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const problems = await allAsync(sql, params);
    const count = await getAsync('SELECT COUNT(*) as count FROM problems');

    res.json({
      problems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count.count,
        pages: Math.ceil(count.count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /problems/random — Get a random problem
app.get('/problems/random', async (req, res) => {
  try {
    const problem = await getAsync(
      'SELECT * FROM problems ORDER BY RANDOM() LIMIT 1'
    );

    if (!problem) {
      return res.status(404).json({ error: 'No problems available' });
    }

    const testCases = await allAsync(
      'SELECT id, input, expected_output FROM test_cases WHERE problem_id = ?',
      [problem.id]
    );

    res.json({ problem, testCases });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /problems/:id — Get specific problem with test cases
app.get('/problems/:id', async (req, res) => {
  try {
    const problem = await getAsync('SELECT * FROM problems WHERE id = ?', [req.params.id]);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const testCases = await allAsync(
      'SELECT id, input, expected_output FROM test_cases WHERE problem_id = ?',
      [problem.id]
    );

    res.json({ problem, testCases });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /problems — Create new problem
app.post('/problems', async (req, res) => {
  try {
    const { title, description, difficulty, topic, example, testCases } = req.body;

    if (!title || !description || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const problemId = uuidv4();

    await runAsync(
      'INSERT INTO problems (id, title, description, difficulty, topic, example) VALUES (?, ?, ?, ?, ?, ?)',
      [problemId, title, description, difficulty, topic, example]
    );

    // Insert test cases
    if (Array.isArray(testCases)) {
      for (const tc of testCases) {
        const tcId = uuidv4();
        await runAsync(
          'INSERT INTO test_cases (id, problem_id, input, expected_output) VALUES (?, ?, ?, ?)',
          [tcId, problemId, tc.input, tc.expected_output]
        );
      }
    }

    res.status(201).json({ id: problemId, message: 'Problem created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /problems/:id — Update problem
app.put('/problems/:id', async (req, res) => {
  try {
    const { title, description, difficulty, topic, example } = req.body;

    await runAsync(
      'UPDATE problems SET title = ?, description = ?, difficulty = ?, topic = ?, example = ? WHERE id = ?',
      [title, description, difficulty, topic, example, req.params.id]
    );

    res.json({ message: 'Problem updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /problems/:id — Delete problem
app.delete('/problems/:id', async (req, res) => {
  try {
    await runAsync('DELETE FROM problems WHERE id = ?', [req.params.id]);
    res.json({ message: 'Problem deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /problems/:id/submit — Submit code and run tests
app.post('/problems/:id/submit', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Get test cases
    const testCases = await allAsync(
      'SELECT * FROM test_cases WHERE problem_id = ?',
      [req.params.id]
    );

    if (testCases.length === 0) {
      return res.status(404).json({ error: 'No test cases found' });
    }

    // Run code against each test case
    const results = [];
    let allPassed = true;

    for (const tc of testCases) {
      const { output, error } = executeCode(code, tc.input);
      const passed = output === tc.expected_output && !error;

      if (!passed) allPassed = false;

      results.push({
        testCaseId: tc.id,
        input: tc.input,
        expected: tc.expected_output,
        actual: output,
        passed,
        error
      });
    }

    // Save submission
    const submissionId = uuidv4();
    await runAsync(
      'INSERT INTO submissions (id, problem_id, code, passed, test_results) VALUES (?, ?, ?, ?, ?)',
      [submissionId, req.params.id, code, allPassed ? 1 : 0, JSON.stringify(results)]
    );

    res.json({
      submissionId,
      passed: allPassed,
      testsPassed: results.filter(r => r.passed).length,
      testsTotal: results.length,
      results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /submissions — View all submissions
app.get('/submissions', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const submissions = await allAsync(
      'SELECT id, problem_id, passed, created_at FROM submissions ORDER BY created_at DESC LIMIT ?',
      [limit]
    );

    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /submissions/:id — View specific submission
app.get('/submissions/:id', async (req, res) => {
  try {
    const submission = await getAsync('SELECT * FROM submissions WHERE id = ?', [req.params.id]);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json({
      submission: {
        ...submission,
        test_results: JSON.parse(submission.test_results)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start Server ────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🎓 Interview Prep API running on http://localhost:${PORT}`);
  console.log(`📚 Database: problems.db`);
  console.log(`📖 Visit http://localhost:${PORT}/problems to see all problems`);
});

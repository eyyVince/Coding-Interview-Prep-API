# Quick Start from Your Phone (GitHub Codespaces)

This API was designed to be built on your phone using GitHub Codespaces.

## Step 1: Open Codespaces

1. Go to your GitHub repo (or fork this one)
2. Click **Code** → **Codespaces** → **Create codespace on main**
3. Wait for the web VS Code editor to load (works great on mobile!)

## Step 2: Install & Run

In the Codespaces terminal:

```bash
npm install
npm run seed
npm start
```

You'll see:
```
🎓 Interview Prep API running on http://localhost:3000
📚 Database: problems.db
📖 Visit http://localhost:3000/problems to see all problems
```

## Step 3: Test the API

Click the **Ports** tab in Codespaces, then open port 3000 in a browser.

Visit these URLs to test:

- `http://localhost:3000/problems` — see all problems
- `http://localhost:3000/problems/random` — random problem
- `http://localhost:3000/health` — API status

## Step 4: Make Changes on Your Phone

Everything is keyboard-friendly in Codespaces on mobile:

**Add a new problem:**

Edit `seed.js`, find the `problems` array, add a new object:

```javascript
{
  title: 'Your Problem Title',
  description: 'Description here...',
  difficulty: 'Easy',
  topic: 'String',
  example: '...',
  testCases: [
    { input: 'test1', expected: 'result1' }
  ]
}
```

Then re-seed:
```bash
npm run seed
```

**Modify the API:**

Edit `server.js` to add new endpoints, change behavior, etc. Changes auto-save in Codespaces.

If you used `npm run dev` earlier, the server auto-reloads. Otherwise:
1. Stop the server (`Ctrl+C`)
2. Run `npm start` again

## Step 5: Deploy (Optional)

Once you're happy with your API, deploy it live:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Interview prep API"
   git push
   ```

2. **Deploy to Render:**
   - Go to render.com → New Web Service
   - Connect your GitHub repo
   - Set:
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
   - Deploy!
   - You'll get a live URL like `https://interview-prep-api.onrender.com`

3. **Share the URL:**
   - Send it to friends who want to practice
   - Put it on your portfolio/resume
   - Mention it in job interviews!

## Interview Talking Points

When discussing this API during interviews:

**"I built this entirely from my phone using GitHub Codespaces"**
- Shows flexibility and resourcefulness
- Modern development workflow
- Works anywhere

**"The API design is clean and RESTful"**
- Standard CRUD operations
- Pagination and filtering
- Structured error responses

**"Test execution is a core feature"**
- Demonstrates understanding of how coding judges work
- Shows you can handle user input safely (with caveats)
- Fun talking point about sandbox security

**"It's simple but complete"**
- No external dependencies beyond npm
- SQLite for persistence
- Deployable to any Node.js host

## Troubleshooting

**"npm install fails"**
- Codespaces has Node.js pre-installed
- Try: `npm cache clean --force && npm install`

**"Port 3000 won't open"**
- In Codespaces, click the **Ports** tab
- Right-click port 3000, make it "Public"
- Then the preview link will work

**"Changes aren't being saved"**
- Codespaces auto-saves, but check that files show modified indicator
- Try: `Ctrl+S` to manually save
- Or push to GitHub: `git add . && git commit -m "Save" && git push`

**"npm start keeps failing"**
- Make sure you ran `npm run seed` first
- Check that previous process isn't still running (kill on port 3000)

## Next Steps

- Add more problems to `seed.js`
- Add authentication to `/problems POST/PUT/DELETE` (JWT)
- Support multiple programming languages (Python, C++, etc.)
- Build a frontend with code editor + test runner
- Add user accounts and progress tracking

Have fun building! 🎓

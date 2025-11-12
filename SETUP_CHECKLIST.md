# Setup Checklist for New Installation

Use this checklist when setting up the project for the first time.

## Pre-Installation

- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git repository cloned
- [ ] Terminal/Command line access

## Installation Steps

### 1. Install Dependencies
```bash
cd match4action_api
npm install
```
- [ ] Dependencies installed successfully (no errors)
- [ ] `node_modules` folder created

### 2. Create `.env` File
- [ ] Created `.env` file in root directory
- [ ] Copied template from README.md or created manually

### 3. Configure Environment Variables

**Required Variables:**
- [ ] `NODE_ENV=development`
- [ ] `PORT=3003` (or another port if 3003 is in use)
- [ ] `MONGO_LOCAL=` (MongoDB connection string)
- [ ] `COOKIE_KEY=` (random 32+ character string)
- [ ] `ACCESS_TOKEN_PRIVATE_KEY=` (random string)
- [ ] `REFRESH_TOKEN_PRIVATE_KEY=` (random string)

**Optional but Recommended:**
- [ ] `GOOGLE_CLIENT_ID=` (if using Google OAuth)
- [ ] `GOOGLE_CLIENT_SECRET=` (if using Google OAuth)
- [ ] `CLIENT_BASE_URL=http://localhost:3000`

### 4. Set Up MongoDB

**Choose one option:**

**Option A: Local MongoDB**
- [ ] MongoDB installed on Mac
- [ ] MongoDB service running (`brew services list | grep mongodb`)
- [ ] Test connection: `mongosh` or `mongo`
- [ ] `MONGO_LOCAL` set in `.env`

**Option B: MongoDB Atlas (Cloud)**
- [ ] MongoDB Atlas account created
- [ ] Cluster created
- [ ] Database user created
- [ ] Network access configured (IP whitelist)
- [ ] Connection string obtained
- [ ] `MONGO_PROD` set in `.env`
- [ ] `NODE_ENV=production` set in `.env`

### 5. Generate Secure Keys

Run these commands and add to `.env`:
```bash
# Cookie key (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Token keys (64+ characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
- [ ] `COOKIE_KEY` generated and added
- [ ] `ACCESS_TOKEN_PRIVATE_KEY` generated and added
- [ ] `REFRESH_TOKEN_PRIVATE_KEY` generated and added

### 6. Verify Configuration

**Check `.env` file:**
- [ ] No empty values for required variables
- [ ] No typos in variable names
- [ ] MongoDB connection string is valid
- [ ] All strings are properly quoted (if needed)

**Test MongoDB Connection:**
```bash
# Create test file: test-mongo.js
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_LOCAL || process.env.MONGO_PROD).then(() => { console.log('✅ Connected'); process.exit(0); }).catch(e => { console.error('❌ Failed:', e.message); process.exit(1); });"
```
- [ ] MongoDB connection test passes

### 7. Run the Application

```bash
npm run dev
```

**Expected Output:**
- [ ] No error messages
- [ ] "Connected to MongoDB" message appears
- [ ] "App listening on port: 3003" message appears
- [ ] Server stays running (doesn't crash)

### 8. Verify Server is Running

- [ ] Open browser: http://localhost:3003/api-doc
- [ ] Swagger API documentation page loads
- [ ] Can see list of API endpoints

## Common Issues Checklist

If the app crashes, verify:

- [ ] `.env` file exists in root directory
- [ ] `.env` file has all required variables
- [ ] MongoDB is running (if using local)
- [ ] MongoDB connection string is correct
- [ ] Port 3003 is not already in use
- [ ] Node.js version is 18 or higher
- [ ] All npm packages installed (`npm install` completed)
- [ ] No TypeScript compilation errors
- [ ] Environment variables have no extra spaces or quotes

## Quick Diagnostic Commands

```bash
# Check Node version
node --version

# Check if port is in use
lsof -ti:3003

# Check MongoDB (local)
brew services list | grep mongodb

# Test MongoDB connection
mongosh

# Check if .env exists
ls -la | grep .env

# View environment variables (be careful with secrets!)
cat .env

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Success Criteria

✅ App starts without errors
✅ "Connected to MongoDB" message appears
✅ Server listens on configured port
✅ API documentation accessible at `/api-doc`
✅ No crash or exit after startup

## Next Steps After Setup

- [ ] Review API documentation at http://localhost:3003/api-doc
- [ ] Test a simple endpoint (e.g., GET /initiatives)
- [ ] Run tests: `npm test`
- [ ] Seed database if needed (see `populate_database.py` or `SeedIkigaiQuestions.ts`)

---

**Need Help?** See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions.


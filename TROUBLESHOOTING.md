# Troubleshooting Guide - Match4Action API

## Common Issues and Solutions

### Issue: App Crashes on Startup

#### 1. Missing `.env` File

**Error Message:**
```
.env file not found.
No mongo connection string. Set MONGO_LOCAL environment variable.
```

**Solution:**
1. Create a `.env` file in the root directory (copy from `.env.example`)
2. Fill in all required environment variables
3. See `.env.example` for the list of required variables

**Quick Fix:**
```bash
cp .env.example .env
# Then edit .env with your values
```

---

#### 2. MongoDB Connection Issues

**Error Messages:**
- `MongooseError: connect ECONNREFUSED`
- `MongoServerError: Authentication failed`
- `No mongo connection string. Set MONGO_LOCAL environment variable.`

**Solutions:**

**Option A: Use Local MongoDB**
1. Install MongoDB on Mac:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```
2. Verify MongoDB is running:
   ```bash
   mongosh
   ```
3. Set in `.env`:
   ```env
   MONGO_LOCAL=mongodb://localhost:27017/match4action
   ```

**Option B: Use MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and database user
3. Get connection string and set in `.env`:
   ```env
   MONGO_LOCAL=mongodb+srv://username:password@cluster.mongodb.net/match4action?retryWrites=true&w=majority
   ```

**Verify Connection:**
```bash
# Test MongoDB connection
mongosh "your-connection-string"
```

---

#### 3. Missing Required Environment Variables

**Error Messages:**
- `Cannot read property 'X' of undefined`
- App crashes when accessing certain routes

**Required Variables:**
- `MONGO_LOCAL` or `MONGO_PROD` (depending on NODE_ENV)
- `COOKIE_KEY` (minimum 32 characters)
- `GOOGLE_CLIENT_ID` (if using Google OAuth)
- `GOOGLE_CLIENT_SECRET` (if using Google OAuth)
- `ACCESS_TOKEN_PRIVATE_KEY`
- `REFRESH_TOKEN_PRIVATE_KEY`

**Solution:**
1. Check `.env` file exists and has all variables
2. Generate secure random keys:
   ```bash
   # Generate random cookie key
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Generate random token keys
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

---

#### 4. TypeScript Compilation Errors

**Error Messages:**
- `Cannot find module 'X'`
- `Type error: ...`
- `ts-node` not found

**Solutions:**

**Install Dependencies:**
```bash
npm install
```

**Check Node Version:**
```bash
node --version  # Should be v18 or higher
```

**Clear and Reinstall:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Run with TypeScript:**
```bash
# Development (uses ts-node via nodemon)
npm run dev

# Production (requires build first)
npm run build
npm start
```

---

#### 5. Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3003
```

**Solution:**

**Find and Kill Process:**
```bash
# Find process using port 3003
lsof -ti:3003

# Kill the process
kill -9 $(lsof -ti:3003)
```

**Or Change Port:**
```env
PORT=3004
```

---

#### 6. Missing Dependencies

**Error Messages:**
- `Cannot find module 'express'`
- `Module not found: Error: Can't resolve 'X'`

**Solution:**
```bash
# Install all dependencies
npm install

# If issues persist, clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

#### 7. Google OAuth Configuration Issues

**Error Messages:**
- `Error: Invalid client credentials`
- `OAuth2Strategy requires a clientID option`

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3003/auth/google/redirect`
6. Update `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

---

#### 8. Permission Errors (Mac)

**Error Messages:**
- `EACCES: permission denied`
- `Permission denied`

**Solution:**
```bash
# Fix npm permissions (if needed)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

---

## Step-by-Step Setup for New Installation

### Prerequisites Check
```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check if MongoDB is installed (if using local)
mongod --version
```

### Installation Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd match4action_api
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

4. **Configure Environment Variables**
   - Open `.env` file
   - Fill in all required values (see `.env.example` for reference)
   - **Critical:** Set `MONGO_LOCAL` or `MONGO_PROD`

5. **Set Up MongoDB**
   - **Local:** Install and start MongoDB
   - **Cloud:** Create MongoDB Atlas account and get connection string

6. **Generate Secure Keys**
   ```bash
   # Cookie key (32+ characters)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Token keys (64+ characters)
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

7. **Test Installation**
   ```bash
   # Run in development mode
   npm run dev
   ```

8. **Verify Server is Running**
   - Open browser: `http://localhost:3003/api-doc`
   - Should see Swagger API documentation

---

## Debugging Tips

### Enable Verbose Logging

Add to `src/app.ts` temporarily:
```typescript
console.log('Environment:', process.env.NODE_ENV);
console.log('Mongo URI:', process.env.MONGO_LOCAL ? 'Set' : 'Missing');
console.log('Port:', PORT);
```

### Check Environment Variables

```bash
# Print all env variables (be careful with secrets!)
node -e "require('dotenv').config(); console.log(process.env)"
```

### Test MongoDB Connection Separately

Create `test-mongo.js`:
```javascript
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_LOCAL)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  });
```

Run:
```bash
node test-mongo.js
```

### Check for TypeScript Errors

```bash
# Compile TypeScript
npm run build

# Check for errors
npx tsc --noEmit
```

---

## Getting Help

### Check Logs
- Look at terminal output for error messages
- Check MongoDB logs if using local instance
- Review browser console for frontend errors

### Common Error Patterns

**"Cannot find module"**
→ Run `npm install`

**"ECONNREFUSED"**
→ Check MongoDB is running and connection string is correct

**"EADDRINUSE"**
→ Port is already in use, change PORT or kill existing process

**"process.exit(1)"**
→ Missing required environment variable

**"TypeError: Cannot read property"**
→ Missing environment variable or undefined value

---

## Still Having Issues?

1. **Verify all steps in "Step-by-Step Setup"**
2. **Check error messages carefully** - they usually indicate the exact issue
3. **Compare your `.env` with `.env.example`**
4. **Ensure MongoDB is accessible** (local or cloud)
5. **Check Node.js version** (should be 18+)
6. **Try clean reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

**Last Updated**: 2025-01-27


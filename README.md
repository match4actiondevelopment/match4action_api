# Match4Action API

## Getting Started

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd match4action_api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   
   ```env
   # Required: Node Environment
   NODE_ENV=development
   
   # Required: Server Port
   PORT=3003
   
   # Required: MongoDB Connection (choose one)
   MONGO_LOCAL=mongodb://localhost:27017/match4action
   # OR for cloud MongoDB Atlas:
   # MONGO_PROD=mongodb+srv://username:password@cluster.mongodb.net/match4action
   
   # Required: Cookie Session Key (generate random 32+ character string)
   COOKIE_KEY=your-random-cookie-key-minimum-32-characters
   
   # Required: JWT Token Keys (generate random strings)
   ACCESS_TOKEN_PRIVATE_KEY=your-access-token-key
   ACCESS_TOKEN_PRIVATE_TIME=10h
   REFRESH_TOKEN_PRIVATE_KEY=your-refresh-token-key
   REFRESH_TOKEN_PRIVATE_TIME=7d
   
   # Optional: Bcrypt Salt (default: 10)
   BCRYPT_SALT=10
   
   # Required for Google OAuth: Get from Google Cloud Console
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_REDIRECT=/auth/google/redirect
   
   # Optional: Client Base URL
   CLIENT_BASE_URL=http://localhost:3000
   ```
   
   **Quick way to generate secure keys:**
   ```bash
   # Generate cookie key
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Generate token keys
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Set up MongoDB**
   
   **Option A: Local MongoDB**
   ```bash
   # Install MongoDB on Mac
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```
   
   **Option B: MongoDB Atlas (Cloud)**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster and database user
   - Get connection string and use it for `MONGO_PROD` in `.env`
   - Set `NODE_ENV=production` to use `MONGO_PROD`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Verify installation**
   - Open http://localhost:3003/api-doc in your browser to see the API documentation
   - You should see the Swagger UI with all available endpoints

### Troubleshooting

If the app crashes on startup, check the following:

1. **Missing `.env` file** - Make sure you created `.env` with all required variables
2. **MongoDB not running** - Ensure MongoDB is installed and running (local) or connection string is correct (Atlas)
3. **Missing environment variables** - Verify all required variables are set in `.env`
4. **Port already in use** - Change `PORT` in `.env` or kill the process using port 3003
5. **Dependencies not installed** - Run `npm install` again

For detailed troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## Technologies
* Node.js
* MongoDB with Mongoose
* TypeScript
* Express.js & Express.js middleware
* Zod validation

## Data flow Architecture
<img src="./diagrams/service-architecture.jpg" width="800" height="350">

## Authentication flow
TODO

## How to run tests
We are using Jest to API contract tests.
1. To run the tests: 
    ```npm run test```

## API Documentation
We are using swagger-jsdoc and swagger-ui-express to document APIs.
Resources that can help to write documentation:
* https://github.com/Surnet/swagger-jsdoc/
* https://www.youtube.com/watch?v=5aryMKiBEKY
* https://github.com/TomDoesTech/REST-API-Tutorial-Updated/blob/main/README.md

To import API docs into Postman, import a new collection using the url http://localhost:3003/api-doc.json

# Deployment
TODO



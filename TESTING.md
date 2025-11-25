# Match4Action API - Testing Documentation

## Table of Contents
1. [Overview](#overview)
2. [Test Setup](#test-setup)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Test Coverage Requirements](#test-coverage-requirements)
6. [API Endpoint Test Cases](#api-endpoint-test-cases)
7. [Integration Testing](#integration-testing)
8. [Test Data Management](#test-data-management)
9. [Best Practices](#best-practices)
10. [CI/CD Integration](#cicd-integration)

---

## Overview

This document outlines the testing strategy, guidelines, and requirements for the Match4Action API. The project uses **Jest** as the testing framework and **Supertest** for HTTP endpoint testing.

### Testing Philosophy
- **API Contract Testing**: Ensure endpoints return correct status codes and response structures
- **Integration Testing**: Verify database interactions and external service integrations
- **Error Handling**: Validate proper error responses for invalid inputs
- **Authentication & Authorization**: Test protected routes and role-based access

### Current Test Status
- ✅ Auth endpoints (partial coverage)
- ✅ Initiatives endpoints (partial coverage)
- ⚠️ Goals endpoints (not tested)
- ⚠️ Users endpoints (not tested)
- ⚠️ Matching endpoints (not tested)
- ⚠️ Upload endpoints (not tested)
- ⚠️ Ikigai endpoints (not tested)

---

## Test Setup

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or test database)
- All dependencies installed (`npm install`)

### Test Environment Configuration

Create a `.env.test` file for test-specific environment variables:

```env
NODE_ENV=test
PORT=3003
MONGO_LOCAL=mongodb://localhost:27017/match4action_test
COOKIE_KEY=test-cookie-key
ACCESS_TOKEN_PRIVATE_KEY=test-access-token-key
REFRESH_TOKEN_PRIVATE_KEY=test-refresh-token-key
CLIENT_BASE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=test-google-client-id
GOOGLE_CLIENT_SECRET=test-google-client-secret
```

### Test Database
- Use a separate test database (e.g., `match4action_test`)
- Tests should clean up data after execution
- Consider using MongoDB Memory Server for isolated testing

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Specific Test File
```bash
npm test -- api.auth.test.js
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Tests Verbosely
```bash
npm test -- --verbose
```

---

## Test Structure

### File Organization
```
src/
├── __tests__/
│   ├── api.auth.test.js          # Authentication endpoint tests
│   ├── api.initiatives.test.js   # Initiatives endpoint tests
│   ├── api.goals.test.js         # Goals endpoint tests (TODO)
│   ├── api.users.test.js         # Users endpoint tests (TODO)
│   ├── api.matching.test.js      # Matching endpoint tests (TODO)
│   ├── api.upload.test.js        # Upload endpoint tests (TODO)
│   ├── api.ikigai.test.js        # Ikigai endpoint tests (TODO)
│   ├── middleware.test.js        # Middleware tests (TODO)
│   └── utils.test.js             # Utility function tests (TODO)
```

### Test File Template
```javascript
const request = require('supertest');
const app = require('../app');

describe('API Endpoint Tests', () => {
  beforeAll(() => {
    // Setup: Connect to test database, seed data
  });

  afterAll((done) => {
    // Cleanup: Close database connection, cleanup data
    done();
  });

  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('GET /endpoint', () => {
    it('should return 200 with valid data', async () => {
      // Test implementation
    });
  });
});
```

---

## Test Coverage Requirements

### Minimum Coverage Targets
- **Overall Coverage**: 80%
- **API Endpoints**: 90%
- **Controllers**: 85%
- **Middleware**: 80%
- **Utils**: 75%

### Critical Paths (100% Coverage Required)
- Authentication flows
- Authorization middleware
- Error handling
- Input validation

---

## API Endpoint Test Cases

### Authentication Endpoints (`/auth`)

#### POST `/auth/login`
- ✅ **Success**: Valid credentials return 200 with token
- ✅ **Failure**: Invalid password returns 404
- ✅ **Validation**: Missing email/password returns 400
- ⚠️ **Edge Cases**:
  - Non-existent user returns 404
  - Empty request body returns 400
  - Invalid email format returns 400

#### POST `/auth/register`
- ⚠️ **Success**: Valid registration returns 201 with user data
- ⚠️ **Failure**: Duplicate email returns 409
- ⚠️ **Validation**: Missing required fields returns 400
- ⚠️ **Edge Cases**:
  - Invalid email format returns 400
  - Weak password returns 400
  - Missing role selection returns 400

#### POST `/auth/logout`
- ⚠️ **Success**: Valid token logout returns 200
- ⚠️ **Failure**: Missing token returns 401
- ⚠️ **Failure**: Invalid token returns 401

#### POST `/auth/refreshToken`
- ⚠️ **Success**: Valid refresh token returns 201 with new tokens
- ⚠️ **Failure**: Invalid refresh token returns 404
- ⚠️ **Failure**: Expired refresh token returns 404

#### GET `/auth/google`
- ⚠️ **Success**: Redirects to Google OAuth
- ⚠️ **Integration**: OAuth flow completes successfully

#### GET `/auth/google/redirect`
- ⚠️ **Success**: Google OAuth callback returns user data
- ⚠️ **Failure**: Invalid OAuth code returns 401

---

### Initiatives Endpoints (`/initiatives`)

#### GET `/initiatives`
- ✅ **Success**: Returns 200 with initiatives array
- ⚠️ **Edge Cases**:
  - Empty database returns 200 with empty array
  - Pagination works correctly
  - Filtering by category works

#### GET `/initiatives/:id`
- ✅ **Success**: Valid ID returns 200 with initiative data
- ⚠️ **Failure**: Invalid ID format returns 400
- ⚠️ **Failure**: Non-existent ID returns 404

#### POST `/initiatives`
- ⚠️ **Success**: Authenticated user creates initiative returns 201
- ⚠️ **Failure**: Unauthenticated request returns 401
- ⚠️ **Validation**: Missing required fields returns 400
- ⚠️ **File Upload**: Image upload works correctly
- ⚠️ **Edge Cases**:
  - Invalid file type returns 400
  - File too large returns 400

#### PUT `/initiatives/:id`
- ⚠️ **Success**: Owner updates initiative returns 200
- ⚠️ **Failure**: Non-owner cannot update returns 403
- ⚠️ **Failure**: Unauthenticated request returns 401
- ⚠️ **Validation**: Invalid data returns 400

#### DELETE `/initiatives/:id`
- ⚠️ **Success**: Owner deletes initiative returns 200
- ⚠️ **Failure**: Non-owner cannot delete returns 403
- ⚠️ **Failure**: Unauthenticated request returns 401

#### PATCH `/initiatives/subscribe/:id`
- ⚠️ **Success**: Authenticated user subscribes returns 200
- ⚠️ **Failure**: Unauthenticated request returns 401
- ⚠️ **Edge Cases**:
  - Already subscribed returns 200 (idempotent)
  - Non-existent initiative returns 404

#### PATCH `/initiatives/unsubscribe/:id`
- ⚠️ **Success**: Authenticated user unsubscribes returns 200
- ⚠️ **Failure**: Unauthenticated request returns 401
- ⚠️ **Edge Cases**:
  - Not subscribed returns 200 (idempotent)

#### GET `/initiatives/user`
- ⚠️ **Success**: Returns user's subscribed initiatives returns 200
- ⚠️ **Failure**: Unauthenticated request returns 401
- ⚠️ **Edge Cases**:
  - User with no subscriptions returns empty array

---

### Goals Endpoints (`/goals`)

#### GET `/goals`
- ⚠️ **Success**: Returns all goals returns 200
- ⚠️ **Edge Cases**: Empty database returns empty array

#### POST `/goals`
- ⚠️ **Success**: Admin creates goal returns 201
- ⚠️ **Failure**: Non-admin cannot create returns 403
- ⚠️ **Failure**: Unauthenticated request returns 401
- ⚠️ **Validation**: Missing required fields returns 400

#### PUT `/goals/:id`
- ⚠️ **Success**: Admin updates goal returns 200
- ⚠️ **Failure**: Non-admin cannot update returns 403
- ⚠️ **Failure**: Non-existent goal returns 404

#### DELETE `/goals/:id`
- ⚠️ **Success**: Admin deletes goal returns 200
- ⚠️ **Failure**: Non-admin cannot delete returns 403
- ⚠️ **Failure**: Non-existent goal returns 404

---

### Users Endpoints (`/users`)

#### GET `/users`
- ⚠️ **Success**: Admin gets all users returns 200
- ⚠️ **Failure**: Non-admin cannot access returns 403
- ⚠️ **Failure**: Unauthenticated request returns 401

#### GET `/users/:id`
- ⚠️ **Success**: Admin gets user by ID returns 200
- ⚠️ **Failure**: Non-admin cannot access returns 403
- ⚠️ **Failure**: Non-existent user returns 404

#### POST `/users/profile`
- ⚠️ **Success**: Authenticated user gets profile returns 200
- ⚠️ **Failure**: Unauthenticated request returns 401

#### PATCH `/users/:id`
- ⚠️ **Success**: User updates own profile returns 200
- ⚠️ **Failure**: User cannot update other's profile returns 403
- ⚠️ **Validation**: Invalid data returns 400

#### DELETE `/users/:id`
- ⚠️ **Success**: User deletes own account returns 200
- ⚠️ **Failure**: User cannot delete other's account returns 403

---

### Matching Endpoints (`/matching`)

#### GET `/matching/recommendations`
- ⚠️ **Success**: Returns recommendations based on Ikigai results returns 200
- ⚠️ **Failure**: Unauthenticated request returns 401
- ⚠️ **Edge Cases**:
  - User without Ikigai results returns appropriate message
  - No matching initiatives returns empty array with message
  - Matching score calculation is correct

---

### Upload Endpoints (`/upload`)

#### POST `/upload`
- ⚠️ **Success**: Valid file upload returns 200 with URL
- ⚠️ **Failure**: Unauthenticated request returns 401
- ⚠️ **Validation**: Invalid file type returns 400
- ⚠️ **Validation**: File too large returns 400
- ⚠️ **Integration**: File successfully uploaded to Firebase Storage

---

### Ikigai Endpoints

#### GET `/ikigai-questions`
- ⚠️ **Success**: Returns all Ikigai questions returns 200
- ⚠️ **Edge Cases**: Empty database returns empty array

#### POST `/ikigai-responses`
- ⚠️ **Success**: Authenticated user submits responses returns 201
- ⚠️ **Failure**: Unauthenticated request returns 401
- ⚠️ **Validation**: Missing required fields returns 400
- ⚠️ **Validation**: Invalid question IDs returns 400

#### GET `/ikigai-responses`
- ⚠️ **Success**: Returns user's Ikigai responses returns 200
- ⚠️ **Failure**: Unauthenticated request returns 401

---

## Integration Testing

### Database Integration
- Test MongoDB connection and queries
- Verify data persistence
- Test transaction handling
- Validate schema constraints

### External Services Integration
- **Firebase Storage**: Test file upload/download
- **Google OAuth**: Test authentication flow (use mocks in unit tests)
- **MongoDB Atlas**: Test production database connection (in staging environment)

### End-to-End Flows
1. **User Registration → Login → Create Initiative**
2. **User Login → Complete Ikigai Test → Get Recommendations**
3. **User Login → Subscribe to Initiative → View Subscriptions**
4. **Admin Login → Create Goal → View Goals**

---

## Test Data Management

### Test Fixtures
Create reusable test data in `src/__tests__/fixtures/`:

```javascript
// fixtures/users.js
module.exports = {
  validUser: {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'volunteer'
  },
  adminUser: {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  }
};
```

### Database Seeding
- Use `populate_database.py` or create a test seed script
- Seed test data before test suites
- Clean up after test execution

### Test Isolation
- Each test should be independent
- Use `beforeEach` and `afterEach` for cleanup
- Avoid shared state between tests

---

## Best Practices

### Writing Tests
1. **Arrange-Act-Assert Pattern**:
   ```javascript
   it('should return 200 on successful login', async () => {
     // Arrange
     const credentials = { email: 'test@example.com', password: 'password123' };
     
     // Act
     const response = await request(app).post('/auth/login').send(credentials);
     
     // Assert
     expect(response.status).toBe(200);
     expect(response.body.success).toBe(true);
   });
   ```

2. **Descriptive Test Names**: Use clear, descriptive test names
3. **One Assertion Per Test**: Focus each test on a single behavior
4. **Test Edge Cases**: Include boundary conditions and error scenarios
5. **Mock External Services**: Use mocks for Firebase, OAuth in unit tests

### Test Organization
- Group related tests using `describe` blocks
- Use nested `describe` blocks for sub-categories
- Keep test files focused on one module/route

### Performance
- Use `beforeAll` for expensive setup operations
- Clean up resources in `afterAll`
- Avoid unnecessary database operations

---

## CI/CD Integration

### GitHub Actions Example
Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main, match4action_api-dev-merge ]
  pull_request:
    branches: [ main, match4action_api-dev-merge ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm test
      - run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Pre-commit Hooks
Consider using Husky to run tests before commits:
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm test"
```

---

## Test Checklist

### Before Deployment
- [ ] All tests pass locally
- [ ] Test coverage meets minimum requirements
- [ ] Integration tests pass with staging database
- [ ] Error handling tests cover all edge cases
- [ ] Authentication/authorization tests pass
- [ ] File upload tests pass
- [ ] CI/CD pipeline tests pass

### Regular Maintenance
- [ ] Update tests when adding new endpoints
- [ ] Review and update test data fixtures
- [ ] Monitor test execution time
- [ ] Update test documentation

---

## Troubleshooting

### Common Issues

**Tests fail with database connection errors**
- Ensure MongoDB is running
- Check `.env.test` configuration
- Verify test database exists

**Tests timeout**
- Check for unclosed database connections
- Verify `afterAll` cleanup is working
- Review async/await usage

**Inconsistent test results**
- Ensure test isolation (no shared state)
- Check for race conditions
- Verify cleanup in `afterEach`

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass
3. Update this documentation
4. Maintain or improve test coverage

---

**Last Updated**: 2025-01-27
**Maintained By**: Match4Action Development Team


# Vercel Deployment Guide

This project consists of two parts:
1.  **match4action_web**: A Next.js frontend.
2.  **match4action_api**: An Express/Node.js backend.

You can deploy both to Vercel. The recommended approach is to deploy them as separate projects or as a monorepo. Since they are in separate folders, we will treat them as two linked projects.

## Prerequisites

1.  **Vercel Account**: [Sign up here](https://vercel.com/signup).
2.  **Vercel CLI**: [Install CLI](https://vercel.com/docs/cli) (optional, but good for local testing): `npm i -g vercel`.
3.  **Git Repository**: Your project must be pushed to a Git repository (GitHub, GitLab, or Bitbucket).

---

## Part 1: Deploying the Backend (`match4action_api`)

The backend is configured to run as a Serverless Function on Vercel using the `api/index.ts` entry point.

1.  **Go to Vercel Dashboard**: Click "Add New..." -> "Project".
2.  **Import Repository**: Select your Git repository.
3.  **Configure Project**:
    *   **Root Directory**: Choose `match4action_api`.
    *   **Framework Preset**: Select "Other" (or Vercel might auto-detect generic Node.js).
    *   **Build Command**: `npm run vercel-build` (which runs `npm run build`).
        *   *Note*: Ensure your `package.json` has `"vercel-build": "npm run build"`.
    *   **Output Directory**: `dist` (or `.` if you are just compiling TS in place).
        *   *Check*: Your `tsconfig.json` usually defines `outDir`. If it's `dist`, set it here.
4.  **Environment Variables**:
    *   Add all variables from your `.env` file (e.g., `MONGO_URI`, `COOKIE_KEY`, `JWT_SECRET`, etc.).
5.  **Deploy**: Click "Deploy".

**Verification**:
Once deployed, visit your Vercel URL (e.g., `https://match4action-api.vercel.app`). You should see your API response (or a 404 for root if no root route is defined). Try `/health` or a known route.

---

## Part 2: Deploying the Frontend (`match4action_web`)

The frontend is a standard Next.js application.

1.  **Go to Vercel Dashboard**: Click "Add New..." -> "Project".
2.  **Import Repository**: Select the *same* Git repository.
3.  **Configure Project**:
    *   **Root Directory**: Choose `match4action_web`.
    *   **Framework Preset**: Vercel should auto-detect "Next.js".
4.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: Set this to the URL of your deployed backend from Part 1 (e.g., `https://match4action-api.vercel.app`).
    *   Add any other required variables (Contentful keys, etc.).
5.  **Deploy**: Click "Deploy".

---

## Troubleshooting

### Backend 404s
If the backend returns 404s:
*   Check `vercel.json` in the root of `match4action_api`. It handles rewriting requests to the `api` folder.
*   Ensure `api/index.ts` correctly exports the Express app.

### CORS Errors
If the frontend cannot talk to the backend:
*   Update the `cors` configuration in `match4action_api/src/app.ts` to include your new Vercel frontend domain (`https://your-frontend.vercel.app`).
*   Redeploy the backend after updating the allowed origins.

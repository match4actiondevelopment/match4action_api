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

**(You have already completed this step!)**

*   **Project Name**: e.g., `match4action-api`
*   **Root Directory**: `match4action_api`
*   **Install Command**: (Leave empty, or `npm install`)
*   **Build Command**: `npm run vercel-build` (We updated this to `npm run build`)
*   **Output Directory**: `dist`
*   **Environment Variables**: `MONGO_LOCAL`, `CLIENT_BASE_URL` (set to your frontend URL), etc.

---

## Part 2: Deploying the Frontend (`match4action_web`)

The frontend is a standard Next.js application.

1.  **Go to Vercel Dashboard**: Click "Add New..." -> "Project".
2.  **Import Repository**: Select the *same* Git repository.
3.  **Configure Project**:
    *   **Project Name**: e.g., `match4action-web`
    *   **Root Directory**: Choose `match4action_web`.
    *   **Framework Preset**: Vercel should auto-detect "Next.js".
    *   **Build Command**: `next build` (Default is fine).
    *   **Output Directory**: `.next` (Default is fine).

4.  **Environment Variables**:
    You **MUST** add these in the Vercel Project Settings:

    | Variable | Value | Description |
    | :--- | :--- | :--- |
    | `NEXT_PUBLIC_API_PATH` | `https://<your-backend>.vercel.app` | **Critical**: URL of your deployed backend. **Do not** add a trailing slash. |
    | `NEXT_PUBLIC_SITE_IDENTIFIER` | *(Copy from local .env)* | Used for site identification. |
    | `CONTENTFUL_SPACE_ID` | *(Copy from local .env)* | Contentful CMS ID. |
    | `CONTENTFUL_PUBLIC_ACCESS_TOKEN`| *(Copy from local .env)* | Contentful API Key. |
    | `CONTENTFUL_HOST` | `cdn.contentful.com` | Usually this, check your local .env. |
    | `CONTENTFUL_ENVIRONMENT` | `master` | Default is usually 'master'. |

5.  **Deploy**: Click "Deploy".

---

## Part 3: Connecting them (CORS)

Once your frontend is deployed, you will get a URL like `https://match4action-web.vercel.app`.

1.  Go back to your **Backend Project** on Vercel.
2.  Update the **Environment Variable** `CLIENT_BASE_URL` to equal `https://match4action-web.vercel.app`.
3.  **Redeploy** the Backend (Settings -> Deployments -> Redeploy) so it picks up the new variable.
    *   *Why?* This ensures your Backend allows requests from your Frontend (CORS).

---

## Troubleshooting

### Frontend: Images/Content not loading
*   Check your `CONTENTFUL_...` keys.
*   Check browser console for 401/403 errors.

### Frontend: API Errors (Network Error / CORS)
*   Check browser console. If you see CORS errors:
    *   Ensure Backend `CLIENT_BASE_URL` matches Frontend URL exactly.
    *   Ensure Frontend `NEXT_PUBLIC_API_PATH` matches Backend URL exactly.

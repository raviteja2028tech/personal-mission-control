# 🚀 Deploying Personal Mission Control to Vercel

This guide covers how to deploy the **Personal Mission Control Backend API** (and optionally the full stack) to Vercel.

---

## 🛠️ Option 1: Deploy Backend via Vercel Dashboard (Recommended)

### Step 1: Import Project into Vercel
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub / Git repository.

### Step 2: Configure Project Settings
- **Root Directory**: Select `server`
- **Framework Preset**: `Other` (Vercel will detect Node.js Serverless Functions via `vercel.json` and `api/index.js`)
- **Build Command**: Leave default or `npm install`
- **Output Directory**: Leave empty

### Step 3: Add Environment Variables
In the **Environment Variables** section, add the following key-value pairs:

| Variable Name | Value | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
| `JWT_SECRET` | `your_32+char_secret` | Secret key for JWT signing |
| `NODE_ENV` | `production` | Production environment flag |
| `CLIENT_URL` | `https://your-frontend-app.vercel.app` | URL of your deployed frontend |

### Step 4: Click Deploy
Vercel will build your serverless API and provide a live URL such as `https://pmc-backend.vercel.app`.

---

## ⚡ Option 2: Deploy Backend via Vercel CLI

1. Install Vercel CLI globally (or run with `npx`):
   ```bash
   npm i -g vercel
   ```

2. Deploy the server directory:
   ```bash
   cd server
   vercel
   ```

3. Follow the CLI prompts to link to your Vercel account and set up the project.

4. Add environment variables to Vercel:
   ```bash
   vercel env add MONGODB_URI production
   vercel env add JWT_SECRET production
   vercel env add NODE_ENV production
   vercel env add CLIENT_URL production
   ```

5. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## 🔗 Connect Frontend to your Vercel Backend

1. Copy your Vercel Backend URL (e.g. `https://pmc-backend.vercel.app`).
2. In your frontend configuration (`client/.env` or Vercel Frontend environment settings):
   ```env
   VITE_API_URL=https://pmc-backend.vercel.app/api/v1
   ```
3. Re-deploy your frontend.

---

## 🔍 Verification & Health Check

After deployment, test your serverless API health check by navigating to:
```
https://<your-backend-app-name>.vercel.app/health
```

Expected Response:
```json
{
  "success": true,
  "status": "UP",
  "message": "Personal Mission Control API Health Check",
  "environment": "production",
  "database": {
    "status": "connected",
    "readyState": 1
  }
}
```

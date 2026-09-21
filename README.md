

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a7b782d9-32e1-4d47-8076-98ad7f3cfba5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) or `.env` to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Deploy to Render (Free Web Service)

This project can be deployed as a single unified full-stack Node.js Web Service on Render's Free Plan.

### Option A: Blueprint Deployment (Recommended)
1. Push your code to your GitHub repository: `https://github.com/ishasaxena2511/llm-cost-autopilot`.
2. Sign in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub repository. Render will automatically detect the root `render.yaml` configuration.
5. In the environment variables prompt, enter your real LLM API keys (e.g. `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY`).
6. Click **Apply** to deploy.

### Option B: Manual Web Service Setup
If creating the service manually via the Render UI:
1. Click **New +** -> **Web Service** and connect your repository.
2. Configure the following settings:
   - **Environment / Runtime:** `Node`
   - **Plan:** `Free`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/v1/health`
3. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `DEMO_MODE`: `false` (or `true` if you want simulation mode without keys)
   - `OPTIMIZATION_STRATEGY`: `balanced`
   - `GEMINI_API_KEY`: *(Your Google Gemini API key)*
   - `OPENAI_API_KEY`: *(Optional)*
   - `ANTHROPIC_API_KEY`: *(Optional)*
   - `GROQ_API_KEY`: *(Optional)*

### Important Notes on Render Free Tier:
- **Spin Down / Inactivity:** Free web services spin down after 15 minutes of inactivity. The first incoming request after idle may experience a ~50-second cold-start delay while the container boots up.
- **Ephemeral Storage:** The local file storage (`data/store.json`) is ephemeral on Render Free. Changes or test logs made during a session will be reset when the service spins down or redeploys.
- **Python Backend Prototype:** The `/backend` directory contains an experimental Python FastAPI prototype. The production application runs on the integrated Node.js/Express server (`server.ts` + Vite frontend) and does not deploy the Python prototype.

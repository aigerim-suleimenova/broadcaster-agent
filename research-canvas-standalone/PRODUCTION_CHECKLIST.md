# Production Deployment Checklist

## Pre-Deployment

- [ ] Code is committed and pushed to GitHub
- [ ] All environment variables are set up locally
- [ ] Agent backend tested locally at `http://localhost:8000`
- [ ] Frontend tested locally at `http://localhost:3000`
- [ ] No console errors or warnings in development
- [ ] Unit tests pass (if any exist)

## Groq API Setup

- [ ] Create free account at https://console.groq.com
- [ ] Generate API key
- [ ] Save key securely (you'll need this for Render)
- [ ] Test API key: `curl https://api.groq.com/health`

## Backend Deployment (Render)

- [ ] Create Render account: https://dashboard.render.com
- [ ] Click "New +"
- [ ] Select "Web Service"
- [ ] Connect GitHub repository
- [ ] Configure:
  - [ ] Name: `broadcaster-agent-backend`
  - [ ] Runtime: Python 3.12
  - [ ] Build Command: `pip install -r agents/python/requirements.txt`
  - [ ] Start Command: `python -m agents.python.inference_server`
  - [ ] Instance Type: **Free**
- [ ] Add Environment Variables:
  - [ ] `GROQ_API_KEY` = your-groq-api-key
  - [ ] `AGENT_HOST` = 0.0.0.0
  - [ ] `AGENT_PORT` = 8000
- [ ] Click Deploy
- [ ] Wait for deployment (5-10 minutes)
- [ ] Test health endpoint: `curl https://broadcaster-agent-backend.onrender.com/health`
- [ ] Note your Render URL

## Frontend Deployment (Vercel)

- [ ] Create Vercel account: https://vercel.com
- [ ] Click "Add New Project"
- [ ] Import GitHub repository
- [ ] Configure:
  - [ ] Framework: Next.js (auto-detected)
  - [ ] Root Directory: `.`
  - [ ] Build Command: `pnpm run build` (auto-detected)
  - [ ] Output Directory: `.next` (auto-detected)
- [ ] Add Environment Variables:
  - [ ] `NEXT_PUBLIC_API_URL` = https://broadcaster-agent-backend.onrender.com
  - [ ] `NEXT_PUBLIC_COPILOTKIT_API_URL` = https://broadcaster-agent-backend.onrender.com/copilotkit
- [ ] Click Deploy
- [ ] Wait for deployment (2-3 minutes)
- [ ] Visit your Vercel URL
- [ ] Test the application

## Post-Deployment Testing

- [ ] Open frontend at Vercel URL
- [ ] Enter a broadcaster name in Research Question
- [ ] Open browser DevTools Console
- [ ] Click suggested action button
- [ ] Check console for logs starting with 📤 or 🔍
- [ ] Verify Research Draft populates with response
- [ ] Test resource extraction
- [ ] Test adding/editing resources

## Monitoring Setup

- [ ] Set up Render email notifications: Dashboard → Settings
- [ ] Set up Vercel email notifications: Dashboard → Notifications
- [ ] Bookmark Render dashboard: https://dashboard.render.com
- [ ] Bookmark Vercel dashboard: https://vercel.com/dashboard

## GitHub Actions Setup (Optional)

- [ ] Generate Vercel token: https://vercel.com/account/tokens
- [ ] Store in repo secrets:
  - [ ] `VERCEL_TOKEN`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_PROJECT_ID`
- [ ] Get Render deploy hook from service settings
- [ ] Store as `RENDER_DEPLOY_HOOK` secret
- [ ] Test: Push to main and confirm auto-deployment

## Troubleshooting Checklist

If deployment fails:

- [ ] Check Render logs: Dashboard → Service Logs
- [ ] Check Vercel logs: Deployments → Build Logs
- [ ] Verify GROQ_API_KEY is correct
- [ ] Verify backend URL in frontend env vars
- [ ] Test backend health: see Render logs
- [ ] Check network request CORS headers
- [ ] Verify Python version (3.12+) on Render
- [ ] Verify Node version on Vercel

## Rollback Plan

If you need to revert:

### Vercel
- Deployments → Select previous version → Click "Rollback"

### Render
- Deploys → Select previous version → Click "Redeploy"

---

## Estimated Total Time
- Groq setup: 5 minutes
- Render deployment: 10 minutes
- Vercel deployment: 5 minutes
- Testing: 10 minutes
- **Total: ~30 minutes**

## Support
- Render help: https://render.com/docs
- Vercel help: https://vercel.com/docs
- Groq docs: https://console.groq.com/docs

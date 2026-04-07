# Production Deployment Guide

## Overview
This project is deployed on **free tiers**:
- **Frontend**: Vercel (Next.js) - [vercel.com](https://vercel.com)
- **Backend**: Render.com (Python LangGraph Agent) - [render.com](https://render.com)
- **LLM API**: Groq (Free tier) - [console.groq.com](https://console.groq.com)

---

## Deployment Steps

### 1. Prepare the Repository
```bash
cd /Users/aigerimsuleimenova/broadcaster-agent/research-canvas-standalone
git add .
git commit -m "Production deployment setup"
git push origin main
```

### 2. Deploy Backend Agent to Render

1. **Create Render Account**: https://dashboard.render.com
2. **New Web Service**:
   - Repository: `https://github.com/your-username/broadcaster-agent`
   - Runtime: `Python 3.12`
   - Build Command: `pip install -r agents/python/requirements.txt`
   - Start Command: `python -m agents.python.inference_server`
   - Instance Type: **Free** (limited but sufficient for testing)
   - Environment Variables:
     ```
     GROQ_API_KEY=your_groq_api_key_here
     AGENT_HOST=0.0.0.0
     AGENT_PORT=8000
     ```

3. **Get Backend URL**: After deployment, Render will provide a URL like:
   - `https://broadcaster-agent-backend.onrender.com` (add this to .env)

4. **Monitor**: Watch logs in Render dashboard

### 3. Deploy Frontend to Vercel

1. **Create Vercel Account**: https://vercel.com
2. **Connect Repository**:
   - Import project
   - Framework: Next.js
   - Root Directory: `.` (root of this repo)

3. **Environment Variables** (add in Vercel dashboard):
   ```
   NEXT_PUBLIC_API_URL=https://broadcaster-agent-backend.onrender.com
   NEXT_PUBLIC_COPILOTKIT_API_URL=https://broadcaster-agent-backend.onrender.com/copilotkit
   ```

4. **Deploy**: Vercel auto-deploys on `git push`

### 4. Get Groq API Key

1. Visit: https://console.groq.com
2. Create free account
3. Generate API key
4. Add to Render environment variables

---

## URLs After Deployment

- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://broadcaster-agent-backend.onrender.com`
- **Health Check**: `https://broadcaster-agent-backend.onrender.com/health`

---

## Monitoring & Logs

### Render Backend Logs
```bash
# View in Render dashboard: https://dashboard.render.com
```

### Vercel Deployment Logs
```bash
# View in Vercel dashboard: https://vercel.com/dashboard
```

---

## Cost

- ✅ **Vercel**: Free (up to 100GB bandwidth/month)
- ✅ **Render**: Free (auto-suspends after 15 min inactivity, cold starts)
- ✅ **Groq API**: Free (generous rate limits)
- **Total**: $0/month

---

## Free Tier Limitations

| Service | Limit | Impact |
|---------|-------|--------|
| Render | Auto-suspends after 15 min inactivity | ~30s cold start time |
| Vercel | 100GB bandwidth | Sufficient for testing |
| Groq | 6,000 requests/day | ~200 per hour - ample |

---

## Upgrade to Paid

When you need better performance:
- **Render**: $7/month for always-on backend
- **Vercel**: $20/month for advanced features
- **Total**: ~$27/month

---

## Troubleshooting

### Agent not responding
```bash
# Check backend health
curl https://broadcaster-agent-backend.onrender.com/health
```

### CORS errors
- Ensure `NEXT_PUBLIC_API_URL` matches backend URL
- Backend should accept requests from Vercel domain

### Cold start delays
- Normal on Render free tier
- First request after 15 min inactivity takes ~30 seconds

---

## Next Steps

1. Get Groq API key
2. Deploy backend to Render
3. Deploy frontend to Vercel
4. Test end-to-end workflow
5. Monitor logs for errors

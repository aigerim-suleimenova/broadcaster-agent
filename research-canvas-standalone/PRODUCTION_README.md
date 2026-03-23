# Broadcasting Research Agent - Production Ready 🚀

**Status**: Ready for Production on Free Tier

## Quick Deploy (30 minutes)

```bash
bash deploy.sh
```

Or follow [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) for step-by-step instructions.

## Stack

| Component | Free Tier | URL |
|-----------|-----------|-----|
| Frontend | Vercel | https://your-app.vercel.app |
| Backend | Render | https://broadcaster-agent-backend.onrender.com |
| LLM API | Groq | https://console.groq.com |

## What's Included

### Frontend (Next.js + React)
- ✅ Research question input
- ✅ Resource management (add/edit/delete)
- ✅ AI-powered research draft generation
- ✅ Real-time state sync with backend agent
- ✅ Production-optimized build

### Backend (Python LangGraph)
- ✅ Groq LLM integration (free tier)
- ✅ State management with CopilotKit
- ✅ Tool calling for WriteReport
- ✅ Search and resource management
- ✅ Health check endpoint

### Production Files
- ✅ `.env.production` - Production environment variables
- ✅ `vercel.json` - Frontend deployment configuration
- ✅ `render.yaml` - Backend deployment configuration
- ✅ `Dockerfile` - Container for backend
- ✅ `.github/workflows/deploy.yml` - Auto-deployment on push

## Getting Started

### Local Development
```bash
# Frontend
pnpm install
pnpm run dev
# Opens http://localhost:3000

# Backend (in separate terminal)
cd agents/python
source .venv/bin/activate
python inference_server.py
# Runs on http://localhost:8000
```

### Production Deployment

1. **Get Groq API Key** (~5 min)
   - https://console.groq.com → Sign up → Create key

2. **Deploy Backend** (~10 min)
   - https://render.com → Connect GitHub → Deploy Python app

3. **Deploy Frontend** (~5 min)
   - https://vercel.com → Import project → Deploy Next.js

4. **Test** (~10 min)
   - Visit your Vercel URL
   - Enter broadcaster name
   - Check Research Draft populates

## Free Tier Details

### Render Backend
- ⏰ Auto-suspends after 15 min inactivity (cold start ~30s on first request)
- 📊 Sufficient capacity for development/testing
- Upgrade to $7/month for always-on

### Vercel Frontend
- 🚀 Lightning fast CDN
- 📦 100GB bandwidth/month
- Upgrade to $20/month for advanced features

### Groq API
- 🤖 1,000s of requests/day on free tier
- 💨 Fast LLM inference
- No credit card required

## Total Cost
- **Frontend**: $0
- **Backend**: $0
- **API**: $0
- **Total**: **$0/month** ♾️

## Monitoring

### Render Dashboard
- Real-time logs
- Deployment history
- Error tracking
- Health checks

### Vercel Dashboard
- Build logs
- Deployment analytics
- Performance metrics
- Function logs

## Features

### Research Question
- Input broadcaster name or company
- Connected to AI agent backend
- Stored in application state

### Resources Management
- ✅ Add resources manually
- ✅ Edit resource details
- ✅ Auto-extracted from AI responses
- ✅ Delete resources with confirmation
- ✅ View in organized list

### Research Draft
- 📝 Auto-populated from AI responses
- ✏️ Manually editable
- 📊 Formatted for export
- 🔗 Citation support

### AI Agent Integration
- 🤖 Groq LLM powering research
- 🔗 CopilotKit state synchronization
- 🛠️ Tool calling for WriteReport
- 📍 Context-aware responses

## API Endpoints

### Frontend (Vercel)
```
GET  /                         # Main app
POST /api/copilotkit           # CopilotKit API
```

### Backend (Render)
```
GET  /health                   # Health check
POST /copilotkit/agents/research_agent  # Agent endpoint
```

## Environment Variables

### Frontend (.env.production)
```
NEXT_PUBLIC_API_URL=https://broadcaster-agent-backend.onrender.com
NEXT_PUBLIC_COPILOTKIT_API_URL=https://broadcaster-agent-backend.onrender.com/copilotkit
```

### Backend (Render secrets)
```
GROQ_API_KEY=your_groq_api_key
AGENT_HOST=0.0.0.0
AGENT_PORT=8000
```

## Troubleshooting

### "Agent not responding"
```bash
# Check backend health
curl https://broadcaster-agent-backend.onrender.com/health
```

### "CORS error"
- Verify `NEXT_PUBLIC_API_URL` matches backend URL
- Check backend logs in Render dashboard

### "Cold start delay"
- Normal on Render free tier
- First request takes ~30 seconds
- Subsequent requests are fast

### "Build failed on Vercel"
- Check build logs in Vercel dashboard
- Ensure `pnpm` is installed
- Verify Node version (18+)

## Deployment Files

| File | Purpose |
|------|---------|
| `vercel.json` | Frontend build config |
| `render.yaml` | Backend deployment config |
| `Dockerfile` | Container image for backend |
| `.env.production` | Production secrets |
| `.github/workflows/deploy.yml` | Auto-deploy on git push |
| `DEPLOYMENT.md` | Detailed deployment guide |
| `PRODUCTION_CHECKLIST.md` | Step-by-step checklist |
| `deploy.sh` | Quick deployment script |

## Next Steps

1. ✅ [Deploy to Production](PRODUCTION_CHECKLIST.md)
2. 📊 [Monitor Performance](https://dashboard.render.com)
3. 🔄 [Enable Auto-Deployment](https://vercel.com/dashboard)
4. 💰 [Upgrade to Paid Tier](DEPLOYMENT.md#upgrade-to-paid) (optional)

## Support

- 📖 [Deployment Guide](DEPLOYMENT.md)
- ✅ [Checklist](PRODUCTION_CHECKLIST.md)
- 🚀 [Deploy Script](deploy.sh)
- 🐛 [Troubleshooting](#troubleshooting)

## License

MIT - Open source

---

**Ready to ship?** 🚀 Run `bash deploy.sh` to get started!

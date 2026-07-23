# 🚀 Personal Mission Control (PMC)

A productivity web app that fights overwhelm by surfacing the right task at the right time — not a generic to-do list.

## Features
- **Today's Top 3 Missions** — Smart Priority algorithm picks your focus tasks
- **Mental Load Meter** — Low/Medium/High cognitive load with suggestions
- **Focus Mode** — Distraction-free project view + Pomodoro timer
- **Brain Dump** — Quick-capture with Ctrl+Space shortcut
- **Streak System** — Daily streaks with 5 achievements
- **Weekly Review** — Sunday reflection prompts
- **Analytics** — Charts, heatmap, project health, deep work tracking
- **WHY Field** — Every task stores your motivation

## Tech Stack
- **Frontend**: React + Vite, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Auth**: JWT + bcrypt

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### Setup

1. **Clone and install:**
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

2. **Configure environment:**
Edit `server/.env`:
```
MONGODB_URI=mongodb://localhost:27017/pmc
JWT_SECRET=your_secret_key_here
```

3. **Run both servers:**
```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

4. **Open** `http://localhost:5173` in your browser

## API Endpoints
See the full API reference in the product specification document.

## License
MIT

# 🗞️ Curio

> A personalized daily news digest platform — curated for you, delivered to your inbox.

![Node.js](https://img.shields.io/badge/Node.js-20-green)
![Express](https://img.shields.io/badge/Express.js-4-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Redis](https://img.shields.io/badge/Redis-Cache-red)
![BullMQ](https://img.shields.io/badge/BullMQ-Queues-orange)
![N8n](https://img.shields.io/badge/N8n-Automation-pink)

---

## What Is Curio?

Curio is a backend-heavy news aggregation and digest delivery system. Users sign up, choose their news categories and how often they want to be notified (1–7 days), and Curio handles the rest — fetching fresh news daily, caching it efficiently, and delivering personalized email digests automatically.

---

## Features

- **Personalized News Feed** — 13 categories, users pick what they care about
- **Email Digest** — automated delivery every 1–7 days based on user preference
- **Smart Caching** — category-level Redis caching shared across all users
- **Email Verification** — secure account verification with expiring UUID tokens
- **Inactivity Detection** — users inactive 30+ days automatically marked inactive
- **Queue Architecture** — all heavy tasks processed via BullMQ workers
- **Rate Limiting** — protection against abuse on all routes
- **Dark/Light Mode** — theme toggle persisted in localStorage

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 (ES Modules) |
| Framework | Express.js |
| Database | MongoDB Atlas + Mongoose |
| Cache | Redis + ioredis |
| Queue | BullMQ |
| Scheduler | node-cron |
| Automation | N8n |
| Email | Nodemailer + Gmail SMTP |
| News Source | NewsData.io API |
| Views | EJS + ejs-mate + Tailwind CSS |
| Deployment | Oracle Cloud ARM VM + PM2 |

---

## Architecture Overview

```
Node-cron (6AM)  → BullMQ → Worker → NewsData.io → MongoDB
Node-cron (8AM)  → BullMQ → Worker → N8n → Gmail → User inbox
Node-cron (12AM) → BullMQ → Worker → MongoDB (mark inactive)

User request → Express → Redis cache → MongoDB → EJS render
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full system diagram.

---

## Project Structure

```
curio/
├── index.js
├── src/
│   ├── config/
│   │   ├── db.js
│   │   ├── redis.js
│   │   └── session.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── news.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   └── middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   └── article.model.js
│   ├── queues/
│   │   └── queue.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── news.routes.js
│   │   ├── user.routes.js
│   │   └── home.routes.js
│   ├── seeds/
│   │   └── users.seed.js
│   ├── services/
│   │   ├── news.service.js
│   │   ├── email.service.js
│   │   └── n8n.service.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── generateToken.js
│   │   ├── recreateToken.js
│   │   └── cron.js
│   ├── views/
│   │   ├── layouts/boilerplate.ejs
│   │   ├── partials/
│   │   ├── auth/form.ejs
│   │   ├── news/
│   │   ├── user/
│   │   └── landing.ejs
│   └── workers/
│       ├── welcomeEmail.worker.js
│       ├── newsFetch.worker.js
│       ├── digest.worker.js
│       └── inactivity.worker.js
├── .env
├── .gitignore
├── ARCHITECTURE.md
├── BUILDPLAN.md
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Redis
- MongoDB Atlas account
- NewsData.io API key (free tier)
- Gmail account + App Password
- N8n (local install or cloud)

### Installation

```bash
git clone https://github.com/yourusername/curio.git
cd curio
npm install
cp .env.example .env
# Fill in your environment variables
```

### Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_SECRET=
SESSION_SECRET=
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=
NEWSDATA_API_KEY=
N8N_WEBHOOK_WELCOME=http://localhost:5678/webhook/welcome
N8N_WEBHOOK_DIGEST=http://localhost:5678/webhook/digest
BASE_URL=http://localhost:5000
CRON_NEWS_FETCH=*/30 * * * *
CRON_DIGEST=*/5 * * * *
CRON_INACTIVITY=*/10 * * * *
```

### Running Locally

```bash
# Start Redis
redis-server

# Start N8n
n8n start

# Seed test users
npm run seed:users

# Start development server
npm run dev
```

### Manually Trigger News Fetch (Dev Only)
```
GET http://localhost:5000/dev/fetch-news
```

---

## API Routes

### Auth
| Method | Route | Auth |
|---|---|---|
| GET | `/auth?type=signup` | Public |
| GET | `/auth?type=login` | Public |
| POST | `/auth/signup` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/logout` | Private |
| GET | `/auth/verify/:token` | Public |
| GET | `/auth/resend-verification` | Private |

### News
| Method | Route | Auth |
|---|---|---|
| GET | `/news` | Private |
| GET | `/news/:category` | Private |
| GET | `/news/read?url=` | Private |

### User
| Method | Route | Auth |
|---|---|---|
| GET | `/user` | Private |
| GET | `/user/profile` | Private |
| POST | `/user/profile` | Private |

---

## Key Design Decisions

**Category-level Redis caching** — Shared across all users. One DB query serves everyone reading the same category.

**BullMQ for all async tasks** — Signup responds instantly while emails send in background with automatic retries.

**MongoDB aggregation for digest** — Articles grouped and sliced at DB level, not in application memory.

**p-limit for concurrent emails** — Max 10 concurrent N8n webhook calls to prevent flooding.

**Bulk DB operations** — `updateMany` for inactivity, Redis pipeline for cache invalidation.

**isAuthenticated as global middleware** — Sets `req.user` from Redis cache (5 min TTL) or DB. Updates `lastActiveAt` only on cache miss — no redundant tracking middleware needed.

---

## Scripts

```bash
npm run dev         # Development server (nodemon)
npm start           # Production server
npm run seed:users  # Seed 10 test users
```

---

## Deployment

All services run on a single **Oracle Cloud ARM VM** (Always Free):

```
Oracle VM (4 OCPUs, 24GB RAM)
  ├── Curio backend → PM2
  ├── N8n           → PM2
  └── Redis         → systemd

MongoDB → Atlas free tier
```

---

## License

MIT

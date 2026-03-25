# 🗓️ Curio — Build Plan & Progress Tracker

## 🧠 Project Context (Paste this to Claude at the start of every session)

> We are building **Curio** — a personalized daily news digest platform.
> Stack: Node.js (ES Modules), Express.js, MongoDB Atlas, Redis, BullMQ,
> node-cron, N8n, Nodemailer, NewsData.io, EJS + ejs-mate, Tailwind CSS.
>
> The app fetches daily news across 13 categories, caches by category in Redis,
> serves personalized feeds based on user preferences, sends digest emails on
> a user-defined frequency (1–7 days), tracks activity via isAuthenticated
> middleware cache miss, and marks users inactive after 30 days of no visits.
>
> See ARCHITECTURE.md for full system design.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 (ES Modules) |
| Framework | Express.js |
| Database | MongoDB Atlas + Mongoose |
| Cache | Redis + ioredis |
| Queue | BullMQ |
| Scheduler | node-cron |
| Automation | N8n (self-hosted) |
| Email | Nodemailer + Gmail SMTP |
| News API | NewsData.io (free tier) |
| Views | EJS + ejs-mate + Tailwind CSS CDN |
| Deployment | Oracle Cloud ARM VM + PM2 |

---

## ✅ Phase 1 — Project Setup (COMPLETE)

- [x] npm init with ES Modules
- [x] Install dependencies
- [x] Folder structure
- [x] .env configured
- [x] MongoDB Atlas connected
- [x] Express server running
- [x] EJS + ejs-mate configured
- [x] Session + flash (connect-mongo)
- [x] Static files

---

## ✅ Phase 2 — Models (COMPLETE)

- [x] User model (status, categories, digestFrequency, tokens, indexes)
- [x] Article model (TTL index, compound index)

---

## ✅ Phase 3 — Auth (COMPLETE)

- [x] Signup (validation, hashing, UUID token, JWT cookie, queue)
- [x] Login (password check, unverified handling, inactive reactivation, returnTo)
- [x] Logout (Redis clear, cookie clear)
- [x] Email verification (token check, auto-login)
- [x] Resend verification (recreateToken utility)
- [x] Auth routes

---

## ✅ Phase 4 — Middleware (COMPLETE)

- [x] isAuthenticated (Redis cache + DB fallback + lastActiveAt)
- [x] isLoggedIn (returnTo session)
- [x] helmet, mongoSanitize, hpp, rateLimit

---

## ✅ Phase 5 — Redis + BullMQ (COMPLETE)

- [x] Redis config + ioredis client
- [x] Shared queue settings
- [x] All 4 queues + add functions

---

## ✅ Phase 6 — Workers (COMPLETE)

- [x] welcomeEmail.worker.js
- [x] newsFetch.worker.js (invalidates Redis after fetch)
- [x] digest.worker.js ($expr query, aggregation, p-limit, bulk update)
- [x] inactivity.worker.js (.lean, updateMany, Redis pipeline)

---

## ✅ Phase 7 — News Service (COMPLETE)

- [x] fetchNewsByCategory()
- [x] saveArticles() (upsert)
- [x] fetchAndSaveNews() (all 13 categories)
- [x] CATEGORIES + DIGEST_FREQUENCY constants

---

## ✅ Phase 8 — Cron Jobs (COMPLETE)

- [x] startCron() — news fetch, digest, inactivity
- [x] All configurable via .env

---

## ✅ Phase 9 — Email Service (COMPLETE)

- [x] Nodemailer Gmail SMTP
- [x] sendVerificationEmail() HTML template
- [x] n8n.service.js (triggerDigestEmail)

---

## ✅ Phase 10 — Controllers (COMPLETE)

- [x] news.controller.js (Redis category cache, pagination)
- [x] user.controller.js (profile, preferences)

---

## ✅ Phase 11 — Routes (COMPLETE)

- [x] auth.routes.js
- [x] news.routes.js
- [x] user.routes.js
- [x] home.routes.js

---

## ✅ Phase 12 — EJS Views (COMPLETE)

- [x] boilerplate layout (dark/light toggle)
- [x] navbar, flash, footer partials
- [x] landing.ejs
- [x] auth/form.ejs (signup + login tabs)
- [x] news/index.ejs
- [x] news/category.ejs (paginated)
- [x] user/profile.ejs (edit modal)

---

## ✅ Phase 13 — Seeds (COMPLETE)

- [x] 10 test users (mixed statuses)
- [x] npm run seed:users

---

## 🔲 Phase 14 — N8n Workflows (IN PROGRESS)

- [x] Welcome email workflow JSON (Nodemailer handles this now)
- [ ] Digest email workflow
  - [ ] Webhook node
  - [ ] Code node (HTML email builder)
  - [ ] IF node (empty articles check)
  - [ ] Send Email node (Gmail SMTP)
  - [ ] HTTP Request node (callback to API)
- [ ] Test both workflows end-to-end
- [ ] Activate workflows
- [ ] Update .env with production webhook URLs

---

## 🔲 Phase 15 — Deployment (PENDING)

- [ ] Create Oracle Cloud account
- [ ] Spin up ARM VM (Ubuntu 22.04)
- [ ] Open ports (22, 80, 443, 5000, 5678)
- [ ] Install Node.js 20
- [ ] Install Redis
- [ ] Install PM2 + N8n globally
- [ ] Clone repo + npm install
- [ ] Create .env on server
- [ ] PM2 start curio + n8n
- [ ] PM2 save + startup
- [ ] Import N8n workflows + activate
- [ ] Test full flow on production
- [ ] deploy.sh script

---

## 🔲 Phase 16 — Polish (PENDING)

- [ ] 404 + 500 error pages
- [ ] .env.example file
- [ ] Clean up console.logs
- [ ] Final README review
- [ ] Push to GitHub

---

## 📝 Session Notes

### Session 1
- Project setup, MongoDB Atlas, Express running
- App name: Curio (was ClientPulse)

### Session 2
- Full auth, models, Redis, BullMQ, workers
- News service, cron jobs

### Session 3
- News controller (Redis category caching)
- User profile controller + modal
- Security middleware, EJS views, seeds

### Session 4
- N8n welcome email workflow JSON
- Digest + inactivity workers optimized
- ARCHITECTURE.md, README.md, BUILDPLAN.md created

---

## 🔗 Links

- GitHub: _add after push_
- Live Demo: _add after deployment_
- NewsData.io: https://newsdata.io/dashboard
- N8n Local: http://localhost:5678

---

## 💡 Future Features

- Re-engagement email (day 20 + 25 before inactive)
- Onboarding email sequence
- Password change with email confirmation
- Article bookmarking
- AI-powered summaries (OpenAI/Ollama)
- Weekly activity report

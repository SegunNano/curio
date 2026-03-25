Curio — Build Plan & Progress Tracker
Project Context (Paste this to Claude at the start of every
session)
We are building Curio — a personalized daily news digest app. Stack: Node.js, Express.js,
MongoDB, BullMQ, Redis, N8n, EJS, NewsData.io API. The app fetches daily news,
personalizes it by user category preferences, sends digest emails on a user-defined
frequency (1–7 days), tracks dashboard activity, and marks users inactive after 30 days
of no dashboard visits. See ARCHITECTURE.md for full system design.
Tech Stack
Runtime: Node.js (ES6 modules)
Framework: Express.js
Database: MongoDB Atlas + Mongoose
Queue: BullMQ + Redis (Upstash)
Automation: N8n
News API: NewsData.io
View Engine: EJS
Deployment: Railway / Render
Build Plan
Day 0 — Project Setup
Initialized project with npm init
Installed dependencies (express, mongoose, dotenv, bullmq, ioredis, nodemon, ejs)
Created folder structure
Set up .env file
Connected MongoDB Atlas
Set up Express server with EJS
ES6 modules configured ( "type": "module" )
Server running successfully
Day 1 — User Model + Signup API + EJS Signup Form
src/models/user.model.js — User schema
src/controllers/auth.controller.js — Signup controller
src/routes/auth.routes.js — Auth routes
src/views/signup.ejs — Signup form UI
src/views/success.ejs — Success page
Test signup end to end
Day 2 — Login + JWT Auth + Middleware
Password hashing with bcrypt
Login controller
JWT token generation
src/middleware/auth.middleware.js — Protect routes
src/views/login.ejs — Login form UI
Test login end to end
Day 3 — Article Model + NewsData.io Service
src/models/article.model.js — Article schema
src/services/news.service.js — NewsData.io API calls
src/controllers/news.controller.js — Save articles endpoint
src/routes/news.routes.js — News routes
Test fetching and saving articles to MongoDB
Day 4 — Dashboard + Activity Tracking
src/views/dashboard.ejs — Personalized news feed UI
Dashboard route — fetch articles by user categories
src/controllers/user.controller.js — Update lastActiveAt on visit
Filter articles by category on dashboard
Test dashboard end to end
Day 5 — Redis + BullMQ Setup + Digest Queue
src/config/redis.js — Redis connection (Upstash)
src/queues/digest.queue.js — Digest notification queue
src/workers/digest.worker.js — Process digest jobs
Query active users whose digest is due today
Build personalized article list per user
Test digest queue
Day 6 — Inactivity Checker Queue
src/queues/inactivity.queue.js — Inactivity checker queue
src/workers/inactivity.worker.js — Mark inactive users
Query users where lastActiveAt > 30 days
Update status to “inactive”
Test inactivity flow
Day 7 — N8n Welcome Email Workflow
Set up N8n webhook trigger
src/services/n8n.service.js — Webhook caller
Build N8n workflow: Webhook → Send welcome email
Trigger welcome email on signup
Test welcome email delivery
Day 8 — N8n Daily Digest Email Workflow
Build N8n workflow: Webhook → Send personalized digest email
Email template with headlines, teasers, CTA link
Trigger digest email from BullMQ worker
Update lastNotifiedAt after email sent
Test full digest flow end to end
Day 9 — Full End-to-End Testing
Signup → welcome email
News fetch → saved to MongoDB
Digest due → email sent → dashboard visited → lastActiveAt updated
30 days inactive → status changed to inactive → emails stopped
Edge cases tested
Day 10 — Deploy + Polish
Deploy to Railway or Render
Set up Upstash Redis (cloud)
Environment variables configured on host
Clean up GitHub repo
Write README.md with:
Project description
Features
Tech stack
Architecture diagram
Setup instructions
Live demo link
Push final code to GitHub
Session Notes
Session 1
Project initialized
MongoDB Atlas connected
Express + EJS set up
ES6 modules configured
User model written
App name decided: Curio (was ClientPulse)
Session 2
Session 3
Important Links
GitHub Repo: add link here
Live Demo: add link after deployment
MongoDB Atlas: add cluster link
NewsData.io Dashboard: add link
N8n Instance: add link
Upstash Redis: add link
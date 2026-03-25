Curio — System Architecture
Product Summary
Curio is a personalized daily news digest app. Users sign up, select their preferred news
categories and digest frequency (1–7 days), and receive email notifications with news
summaries. Clicking the email lands them on their personal dashboard where they read full
articles. Activity is tracked by dashboard visits. Users inactive for 30 days are marked
inactive and stop receiving emails.
Full System Architecture
USER SIGNS UP
↓
Express API
├── Validate input
├── Hash password
├── Save to MongoDB (status: "active")
├── Store preferences (categories + digest frequency)
└── Trigger N8n → Welcome email
↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DAILY NEWS FETCH (N8n Scheduled)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
N8n Cron Job (runs every day at 6AM)
├── Fetch news from NewsData.io (all categories)
└── Hit Express API → Save articles to MongoDB
↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIGEST NOTIFICATION (BullMQ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BullMQ Cron Job (runs every day at 8AM)
├── Query active users whose digest is due today
│ └── based on lastNotifiedAt + digestFrequency
├── For each user:
│ ├── Fetch their category articles from MongoDB
│ ├── Build personalized summary (top 5 articles)
│ └── Push to notification queue
└── Trigger N8n → Send personalized digest email
└── Email contains:
├── Article headlines
├── Short teaser summaries
└── "Read on Dashboard" CTA link
↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User clicks link in email → Lands on dashboard
├── Sees full personalized news feed by category
├── Can filter articles by category
└── Express API updates lastActiveAt → MongoDB
↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INACTIVITY CHECKER (BullMQ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BullMQ Cron Job (runs every day at midnight)
├── Query users where lastActiveAt > 30 days ago
├── Update status → "inactive"
└── Stop digest emails for inactive users
MongoDB Collections
Users Collection
{
_id,
name,
email,
password, // bcrypt hashed
status, // enum: ["active", "inactive"]
categories, // array: ["technology", "sports", ...]
digestFrequency, // Number 1-7, default: 3
lastActiveAt, // Date — updated on every dashboard visit
lastNotifiedAt, // Date — updated on every digest sent
createdAt,
updatedAt
}
Articles Collection
{
_id,
title,
description, // teaser shown in email + dashboard preview
content, // full content shown on dashboard
url, // link to original article
image, // article thumbnail
category, // e.g. "technology"
source, // e.g. "BBC News"
publishedAt, // Date from NewsData.io
fetchedAt, // Date when we saved it
createdAt
}
Responsibility Split
Layer Responsibility
Express API Signup, login, dashboard, preferences, activity tracking, article saving
MongoDB Users, articles, activity data
BullMQ + Redis Digest scheduling, inactivity checking, notification queue
N8n Welcome email, daily digest email delivery
NewsData.io External news source API
EJS Signup form, login page, dashboard UI
Folder Structure
curio/
├── index.js
├── .env
├── ARCHITECTURE.md
├── BUILDPLAN.md
├── package.json
└── src/
├── routes/
│ ├── auth.routes.js → signup, login
│ ├── news.routes.js → fetch articles for dashboard
│ └── user.routes.js → preferences, activity update
├── controllers/
│ ├── auth.controller.js
│ ├── news.controller.js
│ └── user.controller.js
├── models/
│ ├── user.model.js
│ └── article.model.js
├── queues/
│ ├── digest.queue.js → notification queue
│ └── inactivity.queue.js → 30 day checker
├── workers/
│ ├── digest.worker.js → processes digest jobs
│ └── inactivity.worker.js → processes inactivity jobs
├── services/
│ ├── news.service.js → NewsData.io API calls
│ └── n8n.service.js → N8n webhook triggers
├── middleware/
│ ├── auth.middleware.js
│ └── validate.middleware.js
├── config/
│ ├── db.js
│ └── redis.js
├── views/
│ ├── signup.ejs
│ ├── login.ejs
│ ├── dashboard.ejs
│ └── success.ejs
└── public/
└── styles.css
API Endpoints
Auth
Method Endpoint Description
POST /auth/signup Register new user
POST /auth/login Login user
POST /auth/logout Logout user
User
Method Endpoint Description
GET /user/profile Get user profile
PATCH /user/preferences Update categories + frequency
PATCH /user/activity Update lastActiveAt
News
Method Endpoint Description
GET /news Get articles for logged in user
GET /news/:category Get articles by category
POST /news/fetch Internal — save articles from N8n
Environment Variables
PORT=3000
MONGO_URI=mongodb+srv://...
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret
NEWSDATA_API_KEY=your_newsdata_key
N8N_WEBHOOK_WELCOME=your_n8n_webhook_url
N8N_WEBHOOK_DIGEST=your_n8n_webhook_url
Deployment
Backend: Railway or Render (free tier)
Database: MongoDB Atlas (free tier)
Redis: Upstash Redis (free tier — cloud Redis, no local install needed)
N8n: N8n Cloud (free tier) or self-hosted

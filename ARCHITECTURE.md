# 🗞️ Curio — System Architecture

## Product Summary

Curio is a personalized daily news digest platform. Users sign up, select preferred news categories and digest frequency (1–7 days), and receive email notifications with news summaries. Clicking the email opens articles directly from the source. Activity is tracked by dashboard visits. Users inactive for 30 days are marked inactive and stop receiving emails.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                    EJS + Tailwind CSS UI                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP
┌──────────────────────────▼──────────────────────────────────────┐
│                    EXPRESS.JS API SERVER                         │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐    │
│  │ Auth Routes │  │ News Routes │  │    User Routes        │    │
│  │ /auth       │  │ /news       │  │    /user              │    │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬───────────┘    │
│         └────────────────┴─────────────────────┘                │
│                          │                                       │
│              MIDDLEWARE LAYER                                     │
│   isAuthenticated │ isLoggedIn │ helmet │ rateLimit             │
│   mongoSanitize   │ hpp        │ session │ flash                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
┌────────▼───────┐ ┌───────▼───────┐ ┌──────▼──────┐
│  MONGODB ATLAS │ │  REDIS CACHE  │ │   BULLMQ    │
│                │ │               │ │   QUEUES    │
│  • users       │ │ user:{id}     │ │             │
│  • articles    │ │ news:{cat}    │ │ welcomeEmail│
│  • sessions    │ │ news:{cat}    │ │ newsFetch   │
│                │ │   :page:{n}  │ │ digest      │
└────────────────┘ └───────────────┘ │ inactivity  │
                                      └──────┬──────┘
                                             │
                              ┌──────────────┼──────────────┐
                              │              │              │
                    ┌─────────▼──────┐  ┌───▼────────┐     │
                    │    WORKERS     │  │ NODE-CRON  │     │
                    │                │  │            │     │
                    │ welcomeEmail   │  │ 6AM fetch  │     │
                    │ newsFetch      │  │ 8AM digest │     │
                    │ digest         │  │ 12AM inact │     │
                    │ inactivity     │  └────────────┘     │
                    └────────┬───────┘                     │
                             │                             │
                    ┌────────▼───────┐           ┌─────────▼──────┐
                    │     N8N        │           │  NEWSDATA.IO   │
                    │   WORKFLOWS    │           │  API           │
                    │                │           │  130+ articles │
                    │ Welcome email  │           │  13 categories │
                    │ Digest email   │           └────────────────┘
                    └────────┬───────┘
                             │
                    ┌────────▼───────┐
                    │  GMAIL SMTP    │
                    └────────────────┘
```

---

## Request Flows

### User Signup
```
POST /auth/signup
      ↓
Validate email (validator.js)
      ↓
Hash password (bcrypt)
      ↓
Create user in MongoDB (status: unverified)
      ↓
Generate JWT → set httpOnly cookie
      ↓
Push to welcomeEmail BullMQ queue (fire and forget)
      ↓
Redirect to /news
      ↓ (background)
Worker → Nodemailer → Verification email sent
```

### News Feed Request
```
GET /news
      ↓
isAuthenticated → check Redis for user (cache 5 mins)
      ↓
isLoggedIn → verify user exists
      ↓
For each user category:
  Check Redis (news:{category})
    HIT  → serve from cache
    MISS → query MongoDB → cache 30 mins
      ↓
Group articles by category
      ↓
Render news/index.ejs
```

### Daily News Fetch
```
Node-cron (6AM)
      ↓
Add job to newsFetch queue
      ↓
Worker: fetchAndSaveNews()
      ↓
For each of 13 categories:
  GET newsdata.io API
      ↓
  findOneAndUpdate (upsert) → MongoDB
      ↓
Invalidate all news:* Redis keys
```

### Digest Email Flow
```
Node-cron (8AM)
      ↓
Add job to digest queue
      ↓
Worker:
  1. Find due users ($expr MongoDB query)
  2. Get unique categories across all due users
  3. Aggregate articles (MongoDB pipeline)
  4. Map articles by category
  5. Promise.allSettled + p-limit(10)
  6. Trigger N8n webhook per user
  7. updateMany → lastNotifiedAt (bulk)
      ↓
N8n → HTML email → Gmail SMTP → User inbox
```

### Inactivity Check
```
Node-cron (midnight)
      ↓
Add job to inactivity queue
      ↓
Worker:
  1. Find active users, lastActiveAt < 30 days (.lean())
  2. updateMany → status: inactive
  3. Redis pipeline → del user:{id} bulk
```

---

## MongoDB Collections

### Users
```javascript
{
  name: String,
  email: String (unique),
  password: String (select: false),
  status: enum['unverified', 'active', 'inactive'],
  categories: [String],
  digestFrequency: Number (1-7),
  verificationToken: String,
  verificationTokenExpiry: Date,
  lastActiveAt: Date,
  lastNotifiedAt: Date,
  timestamps: true
}
Index: { status: 1, lastNotifiedAt: 1, digestFrequency: 1 }
```

### Articles
```javascript
{
  title: String,
  description: String,
  url: String (unique),
  image: String,
  category: String,
  source: String,
  publishedAt: Date,
  fetchedAt: Date,
  timestamps: true
}
Indexes:
  { category: 1, publishedAt: -1 }
  { fetchedAt: 1 } TTL: 7 days (auto-delete)
```

---

## Redis Caching Strategy

| Key | Data | TTL | Invalidated By |
|---|---|---|---|
| `user:{userId}` | Full user object | 5 mins | Logout, profile update |
| `news:{category}` | All articles for category | 30 mins | News fetch cron |
| `news:{category}:page:{n}` | Paginated slice | 5 mins | News fetch cron |

---

## BullMQ Queues

| Queue | Trigger | Retries |
|---|---|---|
| `welcomeEmail` | Signup / resend verification | 3 (exponential backoff) |
| `newsFetch` | Node-cron 6AM | 3 (exponential backoff) |
| `digest` | Node-cron 8AM | 3 (exponential backoff) |
| `inactivity` | Node-cron midnight | 3 (exponential backoff) |

---

## Security Layers

| Layer | Tool |
|---|---|
| Password hashing | bcrypt (12 rounds) |
| Authentication | JWT + httpOnly cookies |
| Session storage | connect-mongo |
| Security headers | helmet |
| NoSQL injection | express-mongo-sanitize |
| Parameter pollution | hpp |
| Rate limiting | express-rate-limit |
| CSRF | sameSite: strict |

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
| News API | NewsData.io |
| View Engine | EJS + ejs-mate |
| CSS | Tailwind CSS CDN |
| Deployment | Oracle Cloud ARM VM + PM2 |

---

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_SECRET=
SESSION_SECRET=
GMAIL_USER=
GMAIL_APP_PASSWORD=
NEWSDATA_API_KEY=
N8N_WEBHOOK_WELCOME=
N8N_WEBHOOK_DIGEST=
BASE_URL=http://localhost:5000
CRON_NEWS_FETCH=0 6 * * *
CRON_DIGEST=0 8 * * *
CRON_INACTIVITY=0 0 * * *
```

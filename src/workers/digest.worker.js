import { Worker } from 'bullmq'
import pLimit from 'p-limit'
import { redisConnection } from '../config/redis.js'
import User from '../models/user.model.js'
import Article from '../models/article.model.js'
import { triggerDigestEmail } from '../services/n8n.sevice.js'

const digestWorker = new Worker(
  'digest',
  async (job) => {
    console.log('Processing digest job... 📧')

    const today = new Date()

    // 1. Fetch only due users — filtered in DB
    const dueUsers = await User.find({
      status: 'active',
      $or: [
        { lastNotifiedAt: { $exists: false } },
        {
          $expr: {
            $gte: [
              {
                $divide: [
                  { $subtract: [new Date(), '$lastNotifiedAt'] },
                  1000 * 60 * 60 * 24
                ]
              },
              '$digestFrequency'
            ]
          }
        }
      ]
    })

    if (dueUsers.length === 0) {
      console.log('No digests due today ✅')
      return
    }

    // 2. Get all unique categories
    const allCategories = [...new Set(dueUsers.flatMap(u => u.categories))]

    // 3. Fetch and group articles in ONE aggregation
    const articles = await Article.aggregate([
      { $match: { category: { $in: allCategories } } },
      { $sort: { publishedAt: -1 } },
      {
        $group: {
          _id: '$category',
          articles: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          articles: { $slice: ['$articles', 5] }
        }
      }
    ])

    // 4. Map articles by category
    const articlesByCategory = Object.fromEntries(
      articles.map(a => [a._id, a.articles])
    )

    // 5. Rate limit concurrent email sends
    const limit = pLimit(10)

    const results = await Promise.allSettled(
      dueUsers.map(user =>
        limit(() => {
          // Deduplicate articles per user
          const userArticles = [...new Map(
            user.categories
              .flatMap(c => articlesByCategory[c] || [])
              .map(a => [a._id.toString(), a])
          ).values()]

          if (userArticles.length === 0) return Promise.resolve()

          return triggerDigestEmail({
            name: user.name,
            email: user.email,
            articles: userArticles,
          })
        })
      )
    )

    // 6. Only update users whose email sent successfully
    const successfulUserIds = results
      .map((res, i) => res.status === 'fulfilled' ? dueUsers[i]._id : null)
      .filter(Boolean)

    await User.updateMany(
      { _id: { $in: successfulUserIds } },
      { $set: { lastNotifiedAt: today } }
    )

    console.log(`Digest sent to ${successfulUserIds.length}/${dueUsers.length} users ✅`)
  },
  { connection: redisConnection }
)

digestWorker.on('completed', () => console.log('Digest job completed ✅'))
digestWorker.on('failed', (job, err) => console.error('Digest job failed:', err.message))

export default digestWorker
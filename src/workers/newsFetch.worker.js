import { Worker } from 'bullmq'
import redis, { redisConnection } from '../config/redis.js'
import { fetchAndSaveNews } from '../services/news.service.js'

const newsFetchWorker = new Worker(
  'newsFetch',
  async (job) => {
    console.log('Processing news fetch job... 🗞️')
    const keys = await redis.keys('news:*')
if (keys.length > 0) {
  await redis.del(...keys)
  console.log(`Cleared ${keys.length} news caches 🗑️`)
}
    await fetchAndSaveNews()
  },
  { connection: redisConnection }
)

newsFetchWorker.on('completed', () => {
  console.log('News fetch completed ✅')
})

newsFetchWorker.on('failed', (job, err) => {
  console.error(`News fetch failed: ${err.message}`)
})

export default newsFetchWorker